# Proposal

## Why

O sistema já permite cadastrar e consultar livros e leitores, mas ainda não registra a circulação do acervo no atendimento de balcão. Esta change conecta essas entidades em um fluxo rastreável de empréstimo, devolução e renovação, calculando multas de atraso conforme as regras do domínio.

## What Changes

- Criar a entidade e os endpoints de empréstimo, com código sequencial `#EMP000000`, leitor, exemplar, operador responsável, datas, status e quantidade de renovações.
- Permitir que Funcionário e Admin realizem empréstimos e devoluções pelo sistema do balcão.
- Validar disponibilidade do exemplar, limite de dois empréstimos ativos, faixa etária do leitor e bloqueios por atraso ou multa pendente.
- Definir vencimento para 7 dias corridos após o empréstimo e permitir uma renovação por mais 7 dias corridos.
- Permitir solicitação de renovação pelo sistema do Funcionário, mantendo o contrato preparado para o Portal do Leitor futuro.
- Calcular multa de R$ 10,00 por dia corrido iniciado de atraso, a partir do dia seguinte ao vencimento, no fluxo de devolução.
- Disponibilizar consulta de empréstimos ativos e histórico necessário ao atendimento do balcão, incluindo atrasos e multas.
- Substituir os placeholders de empréstimos e multas no menu por telas funcionais, sem implementar ainda o Portal do Leitor ou o dashboard.
- Registrar eventos de empréstimo, devolução, renovação e multa sem expor senhas ou dados desnecessários.

## Capabilities

### New Capabilities

- `emprestimos`: ciclo de vida de empréstimos no balcão, incluindo criação, consulta, devolução, renovação, validações e atualização do status do exemplar.
- `multas`: cálculo e registro de multas geradas por devoluções atrasadas e aplicação dos bloqueios de renovação e novos empréstimos previstos no domínio.

### Modified Capabilities

- `navegacao-perfis`: substituir os acessos de “Empréstimos” e “Multas” que hoje exibem telas “Em breve” pelos fluxos funcionais desta change.

## Impact

- Backend Xano: novas tabelas, endpoints, funções de validação de regras e eventos de auditoria para empréstimos e multas.
- Frontend Vanilla JS: novas telas de balcão para criar, consultar, renovar e devolver empréstimos, além de exibir multas e mensagens de bloqueio.
- Acervo e leitores: consultas passam a considerar disponibilidade, empréstimos ativos, faixa etária e pendências financeiras sem remover os fluxos existentes.
- Menu autenticado: links de Funcionário e Admin deixam de apontar para placeholders quando os fluxos forem implementados.
- Testes: cobertura de regras de datas no fuso de Brasília, códigos sequenciais, concorrência de disponibilidade, permissões, renovação única e cálculo de multas.
