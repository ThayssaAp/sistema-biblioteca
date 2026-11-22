# Proposal

## Why

A criação de empréstimos depende hoje de IDs numéricos digitados manualmente, o que torna o atendimento sujeito a erros e exige que a equipe conheça os identificadores internos. Seleções pesquisáveis com nomes dos leitores e exemplares disponíveis tornam o fluxo mais claro sem alterar o contrato da API.

## What Changes

- Substituir os campos numéricos de leitor e exemplar por seletores pesquisáveis no formulário de novo empréstimo.
- Carregar leitores e exemplares disponíveis pelas APIs já existentes ao abrir e atualizar o fluxo, e após registrar o empréstimo.
- Preservar os campos `reader_id` e `book_id` e seus valores numéricos no payload enviado a `POST /emprestimo`.
- Limitar esta change ao frontend; não alterar endpoints, banco de dados ou arquivos do Xano.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `emprestimos`: a interface do balcão passa a selecionar leitores e exemplares disponíveis por rótulos legíveis, preservando o registro do empréstimo existente.

## Impact

- Frontend: `frontend/emprestimos/index.html`, `frontend/emprestimos/app.js` e `frontend/emprestimos/app.test.js`.
- APIs existentes: `GET ${apiBaseUrl}/reader`, `GET ${catalogApiBaseUrl}/books` e `POST /emprestimo`; sem mudança de backend ou dependências.
