# Tasks

## 1. Backend Xano: consulta protegida do leitor

- [x] 1.1 Criar o endpoint autenticado de consulta de empréstimos no grupo `Leitores`, derivando o leitor do token e retornando ativos e históricos com livro, datas, status e multa; validar o XanoScript e a saída sem credenciais.
- [x] 1.2 Garantir isolamento da consulta para token de leitor, rejeição de token de operador/sessão ausente e campos nulos para empréstimos sem multa; validar os contratos em `xano/tests/emprestimos-multas.test.js` ou teste dedicado.

## 2. Interface do Portal: meus empréstimos

- [x] 2.1 Adicionar cliente autenticado e tela `meus-emprestimos.html` com carregamento, vazio, erro, sessão expirada e renderização textual de ativos, atrasados, devolvidos e multas; validar com testes do Portal.
- [x] 2.2 Integrar a home do Portal à nova tela sem misturar sessões e garantir que a interface não ofereça renovação, pagamento ou outra escrita; verificar navegação e acessibilidade no HTML.

## 3. Validação e publicação

- [x] 3.1 Executar testes direcionados e a suíte JavaScript completa, além de `openspec validate --all --json`, verificando isolamento e ausência de regressões.
- [x] 3.2 Executar `xano workspace push -d ./xano --dry-run`, revisar o preview e publicar somente os artefatos desta change após confirmar que não há alterações administrativas não autorizadas.
- [x] 3.3 Atualizar `frontend/README.md` e a documentação do Portal com a nova rota e o contrato de somente leitura, verificando que os comandos de teste permanecem executáveis.

## Workflow follow-up

- Arquivar a change somente após smoke test autenticado com um leitor que possua empréstimo e outro sem empréstimos.
- Criar uma change separada para renovação de empréstimos no Portal depois que esta consulta estiver publicada e validada.
