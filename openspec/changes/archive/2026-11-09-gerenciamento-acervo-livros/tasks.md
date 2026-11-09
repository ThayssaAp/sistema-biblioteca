# Tasks

## 1. Modelo e APIs de livros no Xano

- [x] 1.1 Criar o schema de exemplar com referência ao catálogo de gêneros e índice único para o código; validar XanoScript, conferir no backend a geração automática pelo ID sequencial e a guarda de quatro dígitos, e confirmar a sequência em quatro cadastros observados. Testes concorrentes e do limite máximo não foram executados no workspace live.
- [x] 1.2 Implementar APIs autenticadas para criar e consultar exemplares, validando ISBN opcional, ano, gênero e faixa etária e definindo o status inicial no servidor; validar sintaxe XanoScript e testar cadastro válido e rejeição de dados inválidos sem gravação.
- [x] 1.3 Implementar pesquisa autenticada de exemplares por código, título, gênero e status; validar sintaxe XanoScript e testar filtros combinados, resultado vazio e negação sem credencial.

## 2. Interface estática para livros

- [x] 2.1 Integrar a navegação pós-login com uma tela de acervo que valide a sessão existente e apresente erro/retorno ao login para sessão inválida; testar sessão válida, inválida e ausência de credencial sem persistir token em `localStorage`.
- [x] 2.2 Implementar formulário acessível de cadastro de exemplar com gêneros carregados do catálogo autenticado da change `gerenciamento-generos` e validações de ISBN, ano e faixa etária; testar teclado, carregamento, sucesso com código gerado e erros da API.
- [x] 2.3 Implementar consulta e pesquisa do acervo com filtros, status e código em fonte apropriada; testar combinações de filtros, lista vazia, layout estreito e apresentação segura de texto retornado pela API.

## 3. Integração e publicação controlada

- [x] 3.1 Conferir workspace e branch Xano de destino, verificar tabelas/dados existentes e preservar o ponto de retorno antes de publicar; comparar estado remoto com os schemas locais e pedir confirmação antes de qualquer ação que possa sobrescrever dados.
- [x] 3.2 Publicar os schemas e endpoints Xano de livros na branch confirmada e validar chamadas reais de cadastro e consulta; se a publicação exigir ação manual ou autorização indisponível, orientar a pessoa usuária antes de prosseguir e retomar a verificação após sua confirmação.
- [x] 3.3 Executar smoke test integrado da navegação de login ao acervo, cobrindo Admin e Funcionário, criação e consulta de exemplares e filtros; confirmar que a lista de gêneros consumida pela tela está disponível e registrar os resultados sem expor credenciais ou dados pessoais.

## Workflow follow-up

- Concluir a change `gerenciamento-generos` e validar sua API de listagem antes do smoke test integrado do cadastro de livros.
- Arquivar esta change após concluir as tarefas e validar a implementação.
