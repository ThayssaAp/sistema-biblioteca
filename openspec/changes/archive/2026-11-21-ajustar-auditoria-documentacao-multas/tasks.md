# Tasks

## 1. Contrato de consulta de multas

- [x] 1.1 Adicionar `paid_by` e `paid_at` à saída de `GET /multas` em `xano/api/multas/multas_GET.xs`, preservando nulos para multas sem pagamento, e verificar a seleção com teste de contrato.
- [x] 1.2 Atualizar `xano/tests/emprestimos-multas.test.js` para cobrir a forma da resposta de consulta com auditoria preenchida e nula, verificando que nenhum valor é recalculado.

## 2. Documentação e validação

- [x] 2.1 Atualizar `docs/project-overview.md` e `docs/emprestimos-multas.md` para refletir que o pagamento de multas está entregue e que a consulta expõe a auditoria, verificando exemplos e roadmap.
- [x] 2.2 Executar `node --test frontend/*.test.js frontend/*/*.test.js xano/tests/*.test.js` e `openspec validate --all --json`, verificando zero falhas sem alterar a change de exclusão administrativa.
- [x] 2.3 Executar `xano workspace push -d ./xano --dry-run`, revisar o preview e confirmar que nenhum push real será feito enquanto o conjunto incluir arquivos da change de exclusão administrativa.

## Workflow follow-up

- Arquivar esta change somente após a validação e a publicação isolada do endpoint de multas.
- Sincronizar o spec consolidado de `multas` ao arquivar, se a validação confirmar a alteração contratual.
