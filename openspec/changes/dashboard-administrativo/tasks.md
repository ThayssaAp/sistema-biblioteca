# Tasks

## 1. Backend Xano do Dashboard

- [x] 1.1 Criar o endpoint autenticado `GET /admin/dashboard`, exigindo perfil `ADMIN` e validar cenários Admin, Funcionário e sessão inválida.
- [x] 1.2 Implementar as contagens agregadas de leitores, leitores com empréstimos ativos, acervo disponível/emprestado, empréstimos em atraso e multas pendentes, e validar os seis resultados.
- [x] 1.3 Garantir que a resposta contenha somente seis valores numéricos, exclua tombstones dos indicadores de livros e não exponha dados pessoais.
- [x] 1.4 Validar o arquivo XanoScript do endpoint e criar ou atualizar testes focados de contrato/backend.

## 2. Interface do Dashboard

- [x] 2.1 Criar a página acessível e responsiva do Dashboard com seis cartões, estado de carregamento, estado de erro e ação de retorno.
- [x] 2.2 Integrar a página à autenticação por bearer token, validar `/auth/me` e bloquear diretamente usuários que não sejam `ADMIN`.
- [x] 2.3 Renderizar toda resposta da API como texto e implementar tentativa novamente sem interpolar dados como HTML.
- [x] 2.4 Substituir o placeholder do menu pelo destino funcional do Dashboard e atualizar os testes de navegação.

## 3. Verificação integrada e documentação

- [x] 3.1 Adicionar testes do cliente, da proteção de rota e dos estados de sucesso, zero, erro e sessão expirada.
- [x] 3.2 Executar a suíte completa de testes do frontend e os testes focados do backend, registrando ausência de regressões.
- [x] 3.3 Atualizar o README e a documentação diretamente relacionada ao Dashboard e validar o diff final.
