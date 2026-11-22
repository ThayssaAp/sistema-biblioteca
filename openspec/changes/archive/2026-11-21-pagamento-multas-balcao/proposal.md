# Proposal

## Why

O Sistema Balcão já registra e consulta multas pendentes, mas o atendimento
ainda não consegue registrar a quitação de uma multa. Isso impede a atualização
da situação financeira do leitor e mantém bloqueios mesmo depois do pagamento.

## What Changes

- Criar uma operação autenticada para registrar o pagamento de uma multa
  `Pendente` e alterar seu status para `Paga`.
- Registrar operador, data/hora e valor da quitação para auditoria, sem apagar
  o histórico da multa.
- Rejeitar multas inexistentes, já pagas, abonadas ou zeradas, além de impedir
  pagamentos duplicados em concorrência.
- Adicionar a ação de pagamento na consulta de multas do Sistema Balcão, com
  confirmação acessível, estados de carregamento, sucesso e erro.
- Atualizar testes de contrato, interface e documentação técnica de multas.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `multas`: permitir pagamento manual de multas pendentes por Funcionário ou
  Admin, com transição controlada para `Paga` e rastreabilidade.

## Impact

- Backend Xano: endpoint de pagamento no grupo `Multas` e campos de auditoria
  de pagamento na tabela `fine`.
- Frontend: cliente e tela de consulta de multas em
  `frontend/emprestimos/`.
- Testes: contratos Xano e testes da interface do balcão.
- Documentação: `docs/emprestimos-multas.md`, `docs/domain-model.md` e a
  especificação consolidada de `multas`.
- Fora desta change: Portal do Leitor, cadastro de funcionários, dashboard,
  gêneros e exclusão administrativa de livros.
