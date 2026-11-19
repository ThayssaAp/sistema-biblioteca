# Tasks

## 1. APIs de consulta para leitores

- [x] 1.1 Criar endpoint Xano de livros para sessão `reader`, com filtros de título, gênero, status e classificação etária, retorno somente de dados públicos e validação dos valores; verificar com o validador Xano.
- [x] 1.2 Criar endpoint Xano de gêneros para sessão `reader`, retornando apenas identificador e nome; verificar autorização e sintaxe Xano.
- [x] 1.3 Criar testes/contratos dos endpoints para sessão ausente, token de operador, filtros combinados, resultado vazio e ausência de operações de escrita.

## 2. Interface de consulta do Portal

- [x] 2.1 Estender o cliente de autenticação do leitor para consultar livros e gêneros com o token próprio e tratar sessão expirada; verificar isolamento em testes JavaScript.
- [x] 2.2 Criar tela de consulta do leitor com filtros de título, gênero, disponibilidade e classificação etária, carregamento, vazio, erro e foco acessível; verificar a estrutura e os estados em testes.
- [x] 2.3 Integrar a home autenticada à consulta e manter logout, redirecionamento e proteção da sessão; verificar o fluxo completo no navegador local.
- [x] 2.4 Atualizar a documentação do frontend com a rota da consulta, configuração da API e limites da funcionalidade; verificar que as instruções permanecem executáveis.

## 3. Validação integrada

- [x] 3.1 Executar os testes de login, leitores, Portal e catálogo e corrigir regressões; verificar execução sem falhas.
- [x] 3.2 Validar todos os scripts Xano novos e alterados e revisar que o endpoint do operador continua usando somente `auth = "user"`; verificar com o validador e inspeção dos contratos.
- [x] 3.3 Validar a change com `openspec validate consulta-livros-portal-leitor --strict` e confirmar que todos os requisitos possuem cenários verificáveis.

## Workflow follow-up

- Arquivar a change somente após implementação, revisão e validação concluídas.
- Atualizar as especificações consolidadas durante o arquivamento.
