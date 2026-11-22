# Design

## Context

A consulta de multas do Sistema Balcão já usa o grupo `Multas`, retorna o valor
em centavos e distingue os estados `Pendente`, `Paga`, `Abonada` e `Zerada`.
A tabela `fine` possui campos de resolução que atendem ao abono, mas o pagamento
precisa de rastreabilidade própria. Consulte `proposal.md` para a motivação.

## Goals / Non-Goals

**Goals:**

- Disponibilizar uma transição segura de `Pendente` para `Paga` no backend.
- Preservar o valor original e registrar quem e quando confirmou o pagamento.
- Integrar a ação à tabela de multas existente, sem criar um segundo fluxo de
  consulta.
- Manter o atendimento idempotente em caso de duplo clique ou concorrência.

**Non-Goals:**

- Integração com gateway, caixa, cartão ou comprovante financeiro externo.
- Pagamento pelo Portal do Leitor.
- Abono, exclusão ou alteração retroativa de multas.
- Alteração das regras de cálculo ou dos bloqueios de empréstimo.

## Decisions

1. **Endpoint separado no grupo `Multas`**
   - Criar uma operação `POST` dedicada ao pagamento, recebendo somente o
     identificador da multa. O valor será obtido do registro persistido, não do
     cliente.
   - Isso evita misturar pagamento com consulta e impede que a interface altere
     o valor cobrado.
   - Alternativa descartada: alterar `PATCH /multas`, pois abriria alterações
     genéricas de status e poderia permitir transições indevidas.

2. **Campos próprios de auditoria**
   - Adicionar `paid_by` relacionado a `user` e `paid_at` na tabela `fine`.
     `resolved_by` e `resolved_at` continuam reservados para abono ou resolução
     administrativa.
   - O endpoint definirá `status = "Paga"`, `paid_by = $auth.id` e
     `paid_at = now` dentro de uma transação ou atualização condicional.

3. **Transição condicional no servidor**
   - A autorização de perfil será validada no backend antes da alteração.
     A operação também exigirá `status == "Pendente"` no momento da escrita.
   - O cliente exibirá a ação apenas para pendências, mas essa regra visual não
     substitui a proteção do endpoint.

4. **Atualização da lista após confirmação**
   - A interface solicitará confirmação textual, desabilitará a ação durante o
     envio e recarregará a consulta após sucesso.
   - A lista continuará exibindo multas pagas para preservar a consulta
     histórica; apenas a ação de pagamento será removida.

## Risks / Trade-offs

- **[Risco]** Uma atualização não condicional pode aceitar dois pagamentos.
  **Mitigação:** validar o status pendente no mesmo contexto transacional da
  escrita e testar duas tentativas para a mesma multa.
- **[Risco]** O operador pode interpretar o status como pagamento externo
  confirmado. **Mitigação:** usar texto explícito de pagamento registrado no
  balcão e não apresentar integração financeira inexistente.
- **[Risco]** Campos de auditoria podem ficar inconsistentes em scripts Xano
  publicados parcialmente. **Mitigação:** publicar tabela e endpoint juntos e
  executar validação dos scripts antes do uso da tela.

## Migration Plan

1. Adicionar `paid_by` e `paid_at` como campos opcionais, preservando multas
   existentes.
2. Publicar o endpoint de pagamento no grupo `Multas`.
3. Atualizar cliente, tela e testes do balcão.
4. Confirmar que multas existentes continuam consultáveis e que somente novas
   quitações recebem os campos de pagamento.
5. Em rollback, remover a ação da interface e despublicar o endpoint; os campos
   opcionais podem permanecer sem afetar consulta ou abono.
