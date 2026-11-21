# Tasks

## 1. Modelo e APIs de autenticação

- [x] 1.1 Atualizar o modelo `reader` com hash de senha e indicador de primeiro acesso, preservar leitores existentes como pendentes e validar o arquivo Xano com a ferramenta de validação disponível.
- [x] 1.2 Atualizar o endpoint de cadastro de leitores para receber senha temporária, armazená-la somente como hash e omiti-la de respostas, consultas e eventos; verificar com os testes/regressão do cadastro.
- [x] 1.3 Criar endpoint de login do leitor com CPF e senha, resposta intermediária para troca obrigatória e mensagens genéricas; verificar cenários de credencial válida, inválida e leitor pendente.
- [x] 1.4 Criar endpoint de troca obrigatória de senha com confirmação, requisitos mínimos, atualização atômica do estado e emissão de sessão completa; verificar que falhas não alteram a senha.
- [x] 1.5 Criar proteção de sessão para APIs do leitor e validar que tokens de operador, tokens inválidos e tokens expirados são rejeitados.
- [x] 1.6 Rejeitar no backend e na demonstração a reutilização da senha temporária como nova senha; verificar com teste de validação e sintaxe Xano.

## 2. Interface do Portal do Leitor

- [x] 2.1 Criar configuração e cliente de autenticação do leitor com chaves de `sessionStorage` independentes das chaves do operador; verificar isolamento de sessões com testes JavaScript.
- [x] 2.2 Criar tela de login do leitor com CPF, senha, foco inicial, mensagens por campo, carregamento, erro genérico e redirecionamento para o primeiro acesso; verificar comportamento com testes de DOM/cliente.
- [x] 2.3 Criar tela de troca obrigatória de senha com confirmação, validação local, acessibilidade e bloqueio de envio duplicado; verificar sucesso e falhas da API.
- [x] 2.4 Atualizar documentação do frontend para explicar a entrada do Portal do Leitor, as URLs das APIs e a separação das sessões; verificar que as instruções permanecem executáveis.

## 3. Validação integrada

- [x] 3.1 Executar todos os testes JavaScript relacionados a login, cadastro de leitores e Portal do Leitor e corrigir regressões; verificar execução sem falhas.
- [x] 3.2 Revisar respostas e logs dos endpoints para confirmar que nenhuma senha, hash ou dado pessoal indevido é exposto; verificar os contratos de API e os cenários da especificação.
- [x] 3.3 Validar a change com `openspec validate --change autenticacao-portal-leitor --strict` e confirmar que todos os requisitos possuem cenários verificáveis.

## Workflow follow-up

- Arquivar a change somente após a implementação, revisão e validação concluídas.
- Atualizar as especificações consolidadas durante o arquivamento.
