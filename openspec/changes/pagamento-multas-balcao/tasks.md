# Tasks

## 1. Backend: pagamento e auditoria

- [ ] 1.1 Adicionar `paid_by` e `paid_at` opcionais à tabela `fine`, preservando registros existentes, e validar o XanoScript da tabela.
- [ ] 1.2 Implementar o endpoint `POST /multas/pagamento` no grupo `Multas`, exigindo perfil `FUNCIONARIO` ou `ADMIN`, aceitando somente multas `Pendente`, preservando `amount_cents` e registrando operador/data; validar autorização, estados inválidos e resposta de sucesso.
- [ ] 1.3 Garantir transição condicional de `Pendente` para `Paga` contra pagamento duplicado ou concorrente; adicionar testes de contrato para multa inexistente, pagamento repetido, auditoria e preservação do valor.

## 2. Interface: pagamento no Sistema Balcão

- [ ] 2.1 Adicionar ao cliente de empréstimos/multas a chamada autenticada do endpoint de pagamento, propagando mensagens de erro e tratando sessão expirada; validar o contrato no teste da interface.
- [ ] 2.2 Exibir ação de pagamento somente para multas `Pendente`, com confirmação acessível, bloqueio durante envio e mensagem textual de sucesso/erro; validar os estados com testes de frontend.
- [ ] 2.3 Atualizar a lista de multas após pagamento confirmado e manter histórico das multas `Paga`, sem exibir ação de pagamento para status resolvidos; validar o comportamento na tela do balcão.

## 3. Documentação e verificação integrada

- [ ] 3.1 Atualizar `docs/emprestimos-multas.md` e `docs/domain-model.md` com o endpoint, os campos de auditoria e a transição para `Paga`; verificar que os exemplos permanecem coerentes com o contrato.
- [ ] 3.2 Executar validação dos XanoScripts alterados, `node --test frontend/*.test.js frontend/*/*.test.js xano/tests/*.test.js` e `openspec validate --all --json`; revisar o diff para confirmar que a change não inclui Portal do Leitor nem funcionalidades administrativas fora do balcão.

## Workflow follow-up

- Arquivar a change somente após todas as tarefas concluídas e os testes revisados.
- Sincronizar a especificação consolidada de `multas` ao arquivar a change.
