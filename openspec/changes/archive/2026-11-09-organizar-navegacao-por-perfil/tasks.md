# Tarefas

## 1. Entrada autenticada e menu principal

- [x] 1.1 Direcionar a sessão de operador autenticada para a nova página central e validar token e perfil por `/auth/me`; verificar login, retomada de sessão, sessão expirada e logout nos testes de autenticação.
- [x] 1.2 Implementar o menu de Funcionário/Admin com cadastro e consulta de livros e leitores, além da gestão existente de gêneros somente para Admin; verificar visibilidade por perfil e destinos dos links com testes de frontend.

## 2. Recursos futuros e proteção de perfil

- [x] 2.1 Implementar telas informativas “Em breve” para empréstimos, multas, exclusão de livros e dashboard, com retorno ao menu e sem chamadas de negócio nem dados fictícios; verificar conteúdo, retorno e ausência de requisições com testes.
- [x] 2.2 Garantir que o menu de operador não exiba nem permita acesso às opções do Portal do Leitor, mantendo a autenticação de leitores fora desta change; verificar os menus de Funcionário/Admin por testes.

## 3. Integração e documentação

- [x] 3.1 Adicionar navegação de retorno ao menu nas telas existentes de acervo e leitores sem alterar seus fluxos; verificar abertura, retorno e comportamento com sessão ausente ou expirada em testes de integração do frontend.
- [x] 3.2 Atualizar `frontend/README.md` com o caminho de navegação pós-login e as funcionalidades ainda indisponíveis; verificar se as instruções correspondem às telas entregues.
- [x] 3.3 Executar a suíte de testes do frontend e validar os cenários de perfil, acessibilidade e preservação dos fluxos existentes; registrar e corrigir falhas relacionadas à change.
