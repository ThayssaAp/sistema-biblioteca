# Design

## Context

O catálogo existente possui livros com título, gênero, classificação etária e
status, além de uma API autenticada para operadores em
`xano/api/catalog/books_GET.xs`. O Portal do Leitor já possui sessão própria,
armazenada separadamente da sessão de operador, e a tela inicial ainda informa
que a consulta será adicionada nesta etapa.

## Goals / Non-Goals

**Goals:**

- Expor consulta de livros autorizada por token de leitor.
- Reutilizar os mesmos dados públicos do catálogo sem conceder acesso de
  operador.
- Permitir filtros por título, gênero, status e classificação etária.
- Entregar a tela de consulta integrada ao Portal do Leitor com estados
  acessíveis.
- Preservar integralmente o fluxo e o contrato da consulta de operadores.

**Non-Goals:**

- Autor, reserva, solicitação de empréstimo, empréstimo ou devolução.
- Alteração, exclusão ou cadastro de livros pelo leitor.
- Alteração do modelo de livros existente, já que todos os filtros escolhidos
  possuem campos no acervo.
- Paginação ou recomendação personalizada, além do necessário para a primeira
  consulta.

## Decisions

### Endpoint separado para leitores

Será criado um endpoint no grupo `Leitores` para consulta do catálogo com
`auth = "reader"`. O endpoint fará a junção com gêneros e retornará apenas
campos públicos: código, título, gênero, classificação etária e status. A API
de operadores continuará com `auth = "user"` e seu contrato atual.

Alternativas consideradas:

- Alterar `books_GET.xs` para aceitar dois tipos de token: rejeitado porque
  mistura políticas de autorização e aumenta o risco de regressão.
- Fazer a consulta no navegador: rejeitado porque removeria a proteção do
  backend e exigiria expor o catálogo sem autenticação.

### Filtros e valores

O endpoint aceitará `title`, `genre_id`, `status` e `age_rating`. Status e
classificação serão validados contra os valores do enum do modelo. Gêneros
serão carregados por um endpoint próprio para leitores com sessão válida,
retornando somente `id` e `name`.

### Interface do Portal

A tela `catalog.html` ficará dentro de `frontend/portal-leitor/` e reutilizará
o cliente de sessão já existente. O cliente enviará o token de leitor, tratará
`401` como sessão expirada e redirecionará para o login. A tela terá filtros
simples, botão de consulta, cards ou tabela responsiva e mensagem textual para
carregamento, vazio e erro.

### Compatibilidade

O catálogo administrativo não será movido nem alterado visualmente. A página
inicial do leitor passará a encaminhar para a consulta após validar a sessão,
mantendo o logout e o isolamento de tokens.

## Risks / Trade-offs

- **[O catálogo pode conter muitos exemplares]** → Limitar a consulta inicial
  ao contrato de leitura e ordenar por título/código; paginação poderá ser
  adicionada quando o volume exigir.
- **[Status e rótulos dependem dos enums existentes]** → Validar entradas no
  backend e usar os mesmos valores na interface.
- **[Sessão expirada durante a consulta]** → Reutilizar o tratamento de `401`
  do cliente do Portal e encaminhar ao login sem fallback de operador.
- **[Gênero removido durante uma consulta]** → A API retornará somente
  associações válidas e a interface limpará o filtro se a opção não estiver
  mais disponível.

## Migration Plan

1. Publicar endpoints de livros e gêneros para leitores.
2. Criar testes dos contratos de filtro, autorização e isolamento.
3. Criar a tela de consulta e integrá-la à home do Portal.
4. Atualizar a documentação de execução e validação.
5. Validar regressão das APIs e telas administrativas.

Em caso de rollback, remover os endpoints e a rota de consulta do portal. A
API administrativa e os registros do acervo permanecem inalterados.
