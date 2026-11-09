# Tasks

## 1. Backend Xano: tabela de leitores e validação de CPF

- [x] 1.1 Criar `xano/table/reader.xs` com CPF único (11 dígitos), nome, data de nascimento, endereço, telefone, e-mail opcional e `created_by`; verificar que o arquivo passa na validação do Xano Developer MCP e que o índice único de CPF está declarado.
- [x] 1.2 Criar a função `Leitores/validar_cpf` que remove a máscara, exige 11 dígitos, rejeita sequências repetidas e confere os dígitos verificadores; verificar com `529.982.247-25` (válido), `52998224725` (válido), `111.111.111-11`, `123` e `529.982.247-26` (inválidos).

## 2. Backend Xano: cadastro de leitores

- [x] 2.1 Criar o grupo de API `Leitores` em `xano/api/leitores/leitores.xs`; verificar que o arquivo passa na validação do Xano Developer MCP.
- [x] 2.2 Criar `POST /leitores` com autorização `FUNCIONARIO` no início, campos obrigatórios aparados, e-mail opcional, data de nascimento passada e válida, CPF normalizado e conflito para CPF duplicado; verificar nos testes do Xano os cenários de CPF válido, duplicado, inválido, campo ausente, e-mail inválido, data futura e data inexistente.
- [x] 2.3 Registrar `created_by` e o evento `reader_create` sanitizado (somente identificadores); verificar o registro do operador no leitor e a ausência de endereço, telefone, e-mail e nascimento no evento.
- [x] 2.4 Verificar a autorização do cadastro: requisição sem token é rejeitada sem criar leitor, `FUNCIONARIO` e `ADMIN` cadastram, e o login com o CPF de um leitor falha com a mensagem genérica.

## 3. Backend Xano: consulta de leitores

- [x] 3.1 Criar `GET /leitores` com autorização `FUNCIONARIO` no início, filtros `cpf` (com máscara) e `nome` (contém, sem diferenciar caixa), ordenação por nome e retorno `{items, total, page, per_page}` somente com campos de leitor; verificar busca por CPF, por trecho de nome, por ambos e sem resultado (lista vazia).
- [x] 3.2 Validar a paginação (`page` padrão 1, `per_page` padrão 20 e máximo 50); verificar página além do total (lista vazia) e `per_page=51` rejeitado.
- [x] 3.3 Verificar a autorização da consulta: sem token a requisição é rejeitada sem dados, e `FUNCIONARIO` e `ADMIN` consultam.

## 4. Interface: tela de cadastro de leitores

- [x] 4.1 Criar `frontend/leitores/` com `styles.css`, `config.js` e `app.js` (cliente da API, validação de CPF e de campos, guarda de sessão com redirecionamento ao login), sem framework; verificar com `node --test frontend/leitores/app.test.js` os casos de CPF válido e inválido, campos obrigatórios, envio do token e redirecionamento sem sessão.
- [x] 4.2 Criar `frontend/leitores/cadastro.html` com formulário (CPF, nome, nascimento, endereço, telefone, e-mail opcional), máscaras de CPF, telefone e data no padrão brasileiro, rótulos associados, foco inicial no CPF e mensagens textuais por campo; verificar o preenchimento e o envio somente por teclado e a inspeção visual em desktop e em viewport estreita.
- [x] 4.3 Integrar o formulário à API com estados de carregamento, bloqueio de envio duplicado, confirmação de sucesso (limpa o formulário e devolve o foco ao CPF) e mensagem "CPF já cadastrado"; verificar com testes de unidade as respostas de sucesso, conflito, erro de campo e falha de rede, sem inserir texto da API como HTML.

## 5. Interface: tela de consulta de leitores

- [x] 5.1 Criar `frontend/leitores/consulta.html` com campo de busca em foco inicial, tabela com cabeçalhos, paginação e estados de carregamento, vazio ("Nenhum leitor encontrado.") e erro; verificar o uso somente por teclado e a inspeção visual em desktop e em viewport estreita.
- [x] 5.2 Implementar no `app.js` a escolha do filtro (só dígitos, pontos e hífen viram `cpf`, o resto vira `nome`), a chamada à API, a paginação e o redirecionamento ao login em resposta 401; verificar com testes de unidade que nenhum dado de leitor é gravado em `localStorage` ou `sessionStorage` e que a resposta 401 encerra a sessão local.

## 6. Integração e validação final

- [x] 6.1 Acrescentar no estado autenticado de `frontend/login/index.html` os links para o cadastro e a consulta de leitores; verificar que o login continua passando em `node --test frontend/login/app.test.js` e que os links só aparecem após a autenticação.
- [x] 6.2 Rodar `xano workspace push -d ./xano --dry-run`, conferir o `git diff` e, após aprovação, sincronizar com o Xano, anotar a URL do grupo `Leitores` em `frontend/leitores/config.js` e liberar CORS para a origem da interface; verificar uma chamada real pelo navegador sem erro de origem cruzada.
- [x] 6.3 Executar o teste integrado completo: login, cadastro de um leitor, rejeição de CPF duplicado, consulta por CPF e por nome com `FUNCIONARIO` e com `ADMIN`; verificar que o fluxo funciona sem acesso direto a leitores sem token. A implementação foi integrada à `main` no commit `4241543`, substituindo o critério pré-merge de manter uma branch exclusiva para esta change.

## Workflow follow-up

- Arquivar a change depois que a branch `feature/03-cadastro-consulta-leitores` for validada e antes de subir para a `main`.
- Conferir que `openspec/specs/` recebeu `cadastro-leitores` e `consulta-leitores` após o arquivamento.
