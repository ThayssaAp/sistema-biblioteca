# Proposta

## Por quê

As telas existentes atendem tarefas isoladas, mas ainda não formam uma entrada organizada por perfil. Uma navegação central após a autenticação facilita o uso diário, preserva os fluxos já entregues e cria uma estrutura clara para adicionar empréstimos, multas e recursos administrativos em changes futuras.

## O que muda

- Criar uma navegação autenticada e organizada por áreas, exibindo as opções compatíveis com o perfil retornado pelo backend.
- Manter acessíveis no sistema principal o cadastro e a consulta de livros e leitores.
- Preservar a gestão funcional de gêneros para Admin e disponibilizar telas “Em breve” para empréstimos, multas, exclusão de livros e dashboard enquanto esses recursos não existirem.
- Prever uma área do Portal do Leitor para uso futuro, sem implementar nesta change autenticação de leitores nem expor essa área a sessões de Funcionário/Admin.
- Preservar os fluxos existentes, as APIs e as regras de autorização no backend; a visibilidade do menu não substitui controles de acesso no servidor.

## Capacidades

### Novas capacidades

- `navegacao-perfis`: menu autenticado por perfil, agrupamento das funcionalidades existentes e futuras, e apresentação de placeholders para recursos ainda não implementados.

### Capacidades modificadas

- `autenticacao-operadores`: atualizar a experiência após autenticação para apresentar a navegação correspondente ao perfil, mantendo o login, a sessão e a validação atuais.

## Impacto

- Frontend estático em HTML, CSS e JavaScript: tela de entrada autenticada, rotas ou páginas do menu e integração visual com as páginas existentes de acervo e leitores.
- Testes de frontend para visibilidade por perfil, acesso aos fluxos preservados, placeholders e sessão expirada/encerrada.
- Nenhuma API, tabela ou regra de negócio do backend será alterada nesta change. A autenticação de leitores, o empréstimo, as multas, a exclusão de livros e o dashboard permanecem para changes futuras.
