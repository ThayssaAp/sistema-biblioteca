# Proposal

## Why

A biblioteca precisa registrar exemplares físicos e localizar rapidamente os itens do acervo durante o atendimento de balcão. Esta entrega concentra-se no cadastro e na consulta de livros, usando o catálogo de gêneros fornecido por uma change separada.

## What Changes

- Criar no Xano o armazenamento de exemplares, incluindo código sequencial no formato `#ADS0000`, único e nunca reutilizado.
- Disponibilizar APIs autenticadas para cadastrar e consultar exemplares, com pesquisa por código, título, gênero e status e validação dos dados definidos no domínio.
- Criar em `frontend/` os fluxos acessíveis de cadastro e consulta do acervo, integrados à sessão existente e à API de livros.
- Carregar os gêneros disponíveis por meio da API de catálogo de gêneros, mantida pela change separada `gerenciamento-generos`.
- Definir o status inicial do exemplar como `Disponível`.
- Não implementar atualização ou exclusão de exemplares, gestão de gêneros, empréstimos ou devoluções nesta entrega.

## Capabilities

### New Capabilities
- `acervo-livros`: cadastro e consulta de exemplares físicos, incluindo geração de código e pesquisa no acervo.

### Modified Capabilities
- Nenhuma.

## Impact

- **Backend Xano:** tabela de exemplares e endpoints autenticados de cadastro e consulta; o vínculo e a seleção de gênero dependem do catálogo disponibilizado por `gerenciamento-generos`.
- **Frontend:** telas estáticas de cadastro e consulta em `frontend/`, integradas ao login existente e à listagem de gêneros da change separada.
- **Regras de dados:** códigos `#ADS0000` sequenciais, únicos e nunca reutilizados; validações de título, ISBN, ano e faixa etária conforme o modelo de domínio; status inicial `Disponível`.
- **Dependência:** a lista de gêneros precisa estar disponível para o cadastro de exemplares; esta change não cria, renomeia nem remove gêneros.
