# Proposal

## Why

A biblioteca precisa manter uma lista consistente de gêneros para classificar os exemplares e apoiar o cadastro e a pesquisa do acervo. A manutenção dessa lista deve ser controlada por Admin, enquanto Funcionários e Admins autenticados precisam consultá-la nas tarefas de balcão.

## What Changes

- Disponibilizar no backend Xano a listagem autenticada dos gêneros disponíveis.
- Permitir que somente Admins autenticados criem, renomeiem e removam gêneros, com autorização verificada no servidor.
- Validar nome obrigatório, espaços nas extremidades e unicidade sem diferenciar maiúsculas de minúsculas.
- Impedir a remoção de gêneros associados a exemplares.
- Disponibilizar na interface do acervo controles acessíveis para criação, renomeação e remoção, visíveis apenas para Admins.
- Manter Funcionários e Admins autenticados aptos a carregar a lista de gêneros para os fluxos de cadastro e consulta de exemplares.

## Capabilities

### New Capabilities
- `generos`: manutenção administrativa da lista controlada de gêneros e consulta autenticada para uso no acervo.

### Modified Capabilities
- Nenhuma.

## Impact

- **Backend Xano:** tabela e endpoints autenticados de listagem e manutenção de gêneros; verificações de perfil e de associação com exemplares.
- **Frontend:** tela de gêneros no acervo com operações administrativas, mensagens acessíveis e integração à sessão existente; a lista continua disponível para seleção nos fluxos de livros.
- **Dependências:** a change `gerenciamento-acervo-livros` consumirá a listagem de gêneros e deverá ser retomada após esta change ser implementada e arquivada.
