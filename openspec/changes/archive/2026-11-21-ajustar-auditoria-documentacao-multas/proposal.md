# Proposal

## Why

A consulta de multas já registra pagamentos no balcão, mas sua resposta não expõe `paid_by` e `paid_at`, dificultando a conferência da auditoria sem consultar outra fonte. A documentação de status também ficou desatualizada após a entrega do pagamento de multas.

## What Changes

- Incluir `paid_by` e `paid_at` na resposta autenticada de consulta de multas.
- Preservar os campos nulos para multas que ainda não foram pagas.
- Atualizar a documentação técnica e o roadmap para refletir o pagamento de multas já entregue.
- Validar o contrato do endpoint, a documentação e a suíte existente.
- Não alterar a change de exclusão administrativa, o zeramento de multas ou as regras de cálculo.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `multas`: expor os dados de auditoria do pagamento na consulta autenticada de multas.

## Impact

- Backend Xano: saída de `GET /multas` no grupo `Multas`.
- Documentação: `docs/emprestimos-multas.md`, `docs/project-overview.md` e referências de status relacionadas.
- Testes: contrato local do endpoint e validação OpenSpec.
- Fora desta change: exclusão administrativa de exemplares, Portal do Leitor, dashboard, abono de multas e publicação de alterações pertencentes a outras changes.
