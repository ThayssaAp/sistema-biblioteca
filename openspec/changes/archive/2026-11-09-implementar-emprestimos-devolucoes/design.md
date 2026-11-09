# Design

## Context

O acervo e os leitores já possuem tabelas e endpoints autenticados, mas não existe ainda uma entidade para representar circulação. O frontend usa HTML, CSS e JavaScript puro, mantém o token de operador em `sessionStorage` e organiza as entradas pelo menu central. As regras vigentes do domínio determinam prazo de 7 dias corridos, multa de R$ 10,00 por dia corrido iniciado e limite de 2 empréstimos ativos.

## Goals / Non-Goals

**Goals:**

- Modelar empréstimo e multa com relações explícitas para leitor, exemplar e operador.
- Centralizar no backend as validações de disponibilidade, elegibilidade, renovação única, datas e cálculo financeiro.
- Evitar estados parciais entre empréstimo e status do exemplar nas operações de retirada e devolução.
- Disponibilizar fluxos de balcão acessíveis e reutilizáveis por Funcionário e Admin.
- Manter os contratos preparados para uma futura solicitação de renovação pelo Portal do Leitor.

**Non-Goals:**

- Implementar autenticação ou telas do Portal do Leitor.
- Implementar pagamento, quitação ou abono administrativo de multas.
- Implementar dashboard, fila de reservas ou notificações externas.
- Fazer cálculo automático de feriados ou dias úteis; a multa desta change usa dias corridos.

## Decisions

### Entidades separadas para empréstimos e multas

Será criada uma tabela de empréstimos com código sequencial, IDs de leitor, exemplar e operador, timestamps de retirada, vencimento e devolução, status e quantidade de renovações. A multa será uma tabela relacionada ao empréstimo e ao leitor, com dias de atraso, valor em centavos, data de geração e status.

**Alternativas consideradas:** armazenar empréstimo e multa diretamente no exemplar ou leitor simplificaria consultas isoladas, mas perderia histórico e permitiria múltiplos estados implícitos. Tabelas próprias preservam rastreabilidade e permitem a futura gestão de pagamento/abono sem remodelar o empréstimo.

### Regras críticas no backend

Os endpoints de criação, devolução e renovação validarão novamente identidade e perfil do operador, existência e status das relações, limite do leitor, faixa etária, atrasos e multas. A interface apenas orienta o fluxo e não será considerada controle de autorização.

As operações atualizarão o empréstimo, o exemplar e a multa no mesmo fluxo de API, com pré-condições antes das mutações e resposta de erro explícita quando uma condição não puder ser satisfeita. A consulta de disponibilidade será repetida no momento da criação para reduzir duplicidade de empréstimos.

**Alternativas consideradas:** deixar regras no frontend reduziria chamadas, mas permitiria bypass por chamadas diretas e criaria divergências entre balcão e futuro Portal do Leitor.

### Datas e valores normalizados

Datas de retirada, vencimento, renovação, devolução e geração da multa serão calculadas no backend no fuso fixo de Brasília. O vencimento inicial e o novo vencimento serão somados em 7 dias corridos. O cálculo da multa será `dias_corridos_iniciados_após_vencimento * 100`, armazenando o valor em centavos para evitar imprecisão de ponto flutuante e expondo o valor formatado em reais na interface.

**Alternativas consideradas:** calcular datas no navegador ou armazenar valor decimal poderia produzir divergência por fuso e arredondamento.

### Consultas e telas de balcão

O frontend terá uma área de empréstimos com abas ou modos para novo empréstimo, empréstimos ativos/histórico e devolução/renovação, além de uma consulta de multas vinculada ao leitor. Os formulários reutilizarão a sessão do menu e mostrarão estados textuais de carregamento, vazio, sucesso e erro. Seletores ou buscas de leitor e exemplar usarão dados do backend, sem persistir dados pessoais em armazenamento do navegador.

### Auditoria mínima

Cada criação, renovação, devolução e geração de multa produzirá evento com operador, ação e identificadores do empréstimo/exemplar. Senhas, tokens e dados pessoais não serão copiados para eventos.

## Risks / Trade-offs

- **[Concorrência na retirada]** duas requisições podem selecionar o mesmo exemplar → validar status imediatamente antes da atualização e tratar conflito como erro de operação, com teste de chamadas repetidas.
- **[Inconsistência entre tabelas]** uma mutação pode falhar depois de outra → manter a sequência de pré-condições e mutações no mesmo endpoint Xano e criar testes de falha; se o workspace oferecer transação, usá-la para o bloco de atualização.
- **[Fuso horário]** horário local do navegador pode divergir de Brasília → toda data de negócio será derivada no backend; o frontend apenas exibe o resultado recebido.
- **[Regras conflitantes em documentação legada]** o contexto OpenSpec contém uma versão antiga de 5 dias úteis → usar os documentos atuais do domínio e do overview, que definem 7 dias corridos, e validar os cenários dessa change contra essa regra.
- **[Multas sem pagamento nesta entrega]** multas permanecerão pendentes até uma change futura → exibir claramente o status e não apresentar ação fictícia de pagamento ou abono.

## Migration Plan

1. Criar e validar tabelas e endpoints no ambiente Xano sem alterar os fluxos existentes de acervo e leitores.
2. Adicionar testes de backend e frontend para regras de datas, permissões, vínculos e transições de status.
3. Publicar as telas e conectar os links do menu após os endpoints estarem disponíveis.
4. Em caso de rollback, remover os links funcionais do menu e reverter apenas os novos endpoints/tabelas, preservando livros, leitores e sessões existentes.
