# Design

## Context

O endpoint `GET /multas` já consulta multas autenticadas no grupo `Multas` e o pagamento registra `paid_by` e `paid_at` na tabela `fine`. A resposta atual seleciona os dados operacionais, mas deixa os campos de auditoria fora da saída, enquanto a documentação já os apresenta como parte do contrato.

## Goals / Non-Goals

**Goals:**

- Alinhar a saída do endpoint com os campos persistidos de auditoria.
- Manter respostas históricas coerentes, usando nulos quando não houver pagamento.
- Corrigir o roadmap e os exemplos documentais sem alterar regras de negócio.

**Non-Goals:**

- Alterar pagamento, abono, zeramento ou cálculo de multas.
- Implementar exclusão administrativa, Portal do Leitor ou dashboard.
- Publicar alterações de outras changes no workspace Xano.

## Decisions

- Adicionar os dois campos à seleção explícita de saída de `multas_GET.xs`; isso mantém o endpoint sem exposição de credenciais e evita retornar a linha inteira da tabela.
- Usar os valores persistidos pelo pagamento, sem recalcular auditoria na consulta.
- Atualizar somente os trechos documentais que afirmam que o pagamento é futuro ou omitem seu estado atual.
- Validar primeiro o diff do Xano em modo dry-run; qualquer publicação deve excluir arquivos da change administrativa pendente.

## Risks / Trade-offs

- [Risco] O workspace Xano pode conter alterações de outras changes no mesmo push. -> Mitigação: revisar o preview e não executar push global enquanto ele incluir a exclusão administrativa.
- [Risco] Documentação pode divergir novamente após novas entregas. -> Mitigação: manter o roadmap associado ao estado das changes arquivadas e validar exemplos junto do endpoint.

## Migration Plan

1. Atualizar a saída local do endpoint e a documentação.
2. Executar testes, validação OpenSpec e dry-run do workspace.
3. Publicar apenas quando o conjunto de arquivos estiver isolado das changes excluídas do escopo.
4. Em rollback, remover os dois campos apenas da saída; os dados persistidos permanecem compatíveis.
