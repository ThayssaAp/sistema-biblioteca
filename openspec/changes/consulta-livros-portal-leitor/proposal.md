# Proposal

## Why

Depois de autenticar, o leitor ainda não possui uma forma própria de consultar
o acervo da biblioteca. Esta change entrega uma consulta segura e objetiva para
localizar livros, visualizar sua disponibilidade e filtrar resultados sem
expor as operações administrativas do catálogo.

## What Changes

- Criar uma consulta de livros exclusiva para sessões autenticadas de leitores.
- Permitir filtros por título, gênero, disponibilidade e classificação etária.
- Retornar somente os dados necessários para a leitura do catálogo.
- Criar uma tela do Portal do Leitor com filtros, estados de carregamento, vazio,
  erro e resultados acessíveis.
- Reutilizar os gêneros cadastrados no catálogo para seleção de filtro.
- Manter a consulta somente informativa, sem reserva ou solicitação de
  empréstimo nesta change.

## Capabilities

### New Capabilities

- `consulta-acervo-leitor`: consulta autenticada e somente leitura do acervo
  disponível para leitores.

### Modified Capabilities

- `acervo-livros`: adicionar o contrato de consulta autorizada para leitores,
  sem alterar as operações de cadastro e administração dos operadores.

## Impact

- Backend Xano: novo endpoint de consulta do leitor e leitura de gêneros do
  catálogo, com autorização por sessão de leitor.
- Frontend Vanilla JS: nova tela do Portal do Leitor integrada à sessão já
  criada em `frontend/portal-leitor/`.
- Modelo e contrato existentes do catálogo, preservando autorizações de
  operadores e respostas administrativas.
- Testes de frontend e validação dos scripts Xano.
