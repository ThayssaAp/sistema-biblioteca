# Tasks

## 1. Modelo e APIs de gêneros

- [x] 1.1 Validar e ajustar o schema de gêneros com nome aparado, limite de 80 caracteres e unicidade sem distinção de caixa; validar XanoScript e confirmar que duplicidades concorrentes não são persistidas.
- [x] 1.2 Implementar e testar a listagem autenticada e ordenada para `FUNCIONARIO` e `ADMIN`, rejeitando chamadas sem credencial válida e retornando somente os campos públicos do gênero.
- [x] 1.3 Implementar e testar criação, renomeação e remoção exclusivas de `ADMIN`, cobrindo nome inválido, duplicidade, gênero inexistente, negação de `FUNCIONARIO` e bloqueio de remoção com exemplares associados.

## 2. Interface de gestão de gêneros

- [x] 2.1 Implementar e testar controles acessíveis para criar, renomear e solicitar remoção com confirmação; exibir carregamento, sucesso e erros da API por mensagens textuais, sem apresentar falhas como sucesso.
- [x] 2.2 Garantir e testar que a área de gestão só aparece para `ADMIN` e que gêneros atualizados são refletidos na lista consumida pelos formulários e filtros de livros para ambos os perfis autenticados.

## 3. Publicação e validação integrada

- [x] 3.1 Conferir workspace e branch Xano de destino, comparar tabela, endpoints e dados remotos com os arquivos locais, preservar backup e obter confirmação antes de publicar mudanças que possam afetar dados existentes.
- [x] 3.2 Publicar a tabela e as APIs na branch confirmada e validar chamadas reais de listagem e CRUD, incluindo negação de `FUNCIONARIO` e remoção bloqueada quando há exemplar associado; orientar a pessoa usuária se alguma etapa exigir ação manual.
- [x] 3.3 Executar smoke test integrado da sessão de login à gestão de gêneros com Admin e à consulta da lista com Funcionário; validar criação, renomeação, remoção permitida, rejeição de duplicidade e bloqueio de remoção em uso.

## Workflow follow-up

- Arquivar esta change após todas as tarefas e validações serem concluídas.
- Retomar `gerenciamento-acervo-livros` após o archive para finalizar cadastro e consulta de exemplares usando a lista de gêneros.
