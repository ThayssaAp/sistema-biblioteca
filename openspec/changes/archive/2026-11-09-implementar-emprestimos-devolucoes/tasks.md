# Tasks

## 1. Modelo e regras de domínio no Xano

- [x] 1.1 Criar a tabela de empréstimos com código sequencial, relações com leitor/exemplar/operador, datas, status e renovação; verificar o schema e os índices no arquivo Xano.
- [x] 1.2 Criar a tabela de multas com relação ao empréstimo e leitor, dias de atraso, valor em centavos, data de geração e status; verificar que nenhum campo de credencial é persistido.
- [x] 1.3 Implementar funções reutilizáveis para data em Brasília, vencimento de 7 dias corridos, idade/faixa etária, limite de empréstimos e cálculo de R$ 10,00 por dia corrido iniciado; verificar com casos no prazo, um dia e vários dias de atraso.
- [x] 1.4 Implementar as pré-condições de autorização, disponibilidade, limite de 2 empréstimos, atrasos e multas pendentes; verificar que Funcionário/Admin são aceitos e acessos inválidos são rejeitados no backend.

## 2. APIs de empréstimos e multas

- [x] 2.1 Implementar endpoint autenticado de criação de empréstimo e atualização do exemplar; verificar código `#EMP000000`, vencimento, status `Ativo` e rejeição de exemplar indisponível.
- [x] 2.2 Implementar endpoint autenticado de consulta de empréstimos ativos e histórico com filtros por código, leitor, exemplar e status; verificar resposta sem senhas, tokens ou campos internos.
- [x] 2.3 Implementar endpoint de devolução que encerra o empréstimo, libera o exemplar e gera multa quando aplicável; verificar idempotência contra devolução repetida.
- [x] 2.4 Implementar endpoint de renovação única por mais 7 dias, aceitando origem de balcão e preparando o contrato para origem futura do Portal; verificar bloqueio de atraso, segunda renovação e multa em outro livro.
- [x] 2.5 Implementar endpoint de consulta de multas por leitor, empréstimo e status; verificar valor, dias de atraso, vínculo e lista vazia sem resultados.
- [x] 2.6 Registrar eventos de criação, devolução, renovação e multa sem credenciais ou dados pessoais desnecessários; verificar os payloads de auditoria.

## 3. Testes e documentação do backend

- [x] 3.1 Adicionar testes ou fixtures de API para permissões, concorrência de disponibilidade, códigos sequenciais, limite do leitor, faixa etária e transições de status; verificar todos os cenários das especificações.
- [x] 3.2 Adicionar testes de datas e multas no fuso de Brasília, incluindo vencimento, renovação e dias corridos iniciados; verificar valores esperados em centavos.
- [x] 3.3 Atualizar a documentação técnica dos endpoints e tabelas de empréstimos/multas; verificar que exemplos não contêm credenciais reais e refletem os contratos implementados.

## 4. Interface do balcão

- [x] 4.1 Criar a tela autenticada de empréstimos com busca/seleção de leitor e exemplar, confirmação, carregamento, vazio e erro; verificar acessibilidade por teclado e foco inicial.
- [x] 4.2 Implementar na interface consulta, devolução e renovação, exibindo código, vencimento, status, atraso e mensagens de bloqueio; verificar que erros do backend não são apresentados como sucesso.
- [x] 4.3 Criar a consulta de multas com filtro de leitor/estado e exibição de valor, dias de atraso e status; verificar que dados não são persistidos no storage do navegador.
- [x] 4.4 Integrar as telas ao menu por perfil para Funcionário e Admin, removendo os placeholders de empréstimos e multas sem alterar as opções exclusivas de Admin; verificar acesso direto, logout e sessão expirada.

## 5. Verificação integrada

- [x] 5.1 Executar os testes direcionados de frontend e validação dos arquivos Xano, além de `git diff --check`; verificar ausência de regressões nos fluxos de acervo, leitores e login.
- [x] 5.2 Executar um fluxo manual completo no ambiente de desenvolvimento: criar empréstimo, consultar, renovar, devolver no prazo e devolver atrasado; verificar status do exemplar, histórico e multa gerada.

## Workflow follow-up

- Arquivar a change somente após revisão, validação estrita dos artefatos e sincronização dos specs consolidados.
