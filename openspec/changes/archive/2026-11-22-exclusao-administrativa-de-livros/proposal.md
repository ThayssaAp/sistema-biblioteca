# Proposal

## Why

Administradores precisam retirar exemplares do catálogo sem apagar o histórico nem permitir que funcionários executem a operação. O fluxo atual não oferece exclusão administrativa e mostra essa opção como indisponível.

## What Changes

- Adicionar exclusão lógica de exemplares com justificativa obrigatória, mantendo o código e o registro para histórico.
- Autorizar a operação exclusivamente para `ADMIN` no backend e ocultar/proteger o fluxo na interface.
- Impedir exclusão de exemplar com status `Emprestado`.
- Registrar operador, exemplar, justificativa e data/hora em evento de auditoria.
- Ocultar exemplares excluídos das consultas padrão do acervo.
- Substituir o placeholder de exclusão no menu por uma tela funcional.
- Zerar, com trilha de resolução, multas pendentes associadas ao exemplar; preservar multas pagas e abonadas.
- Impedir novos empréstimos de exemplares retirados do acervo.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `acervo-livros`: definir exclusão lógica administrativa e regras de consulta e retenção do exemplar.
- `navegacao-perfis`: substituir o placeholder de exclusão por fluxo funcional exclusivo de Admin.

## Impact

- Backend Xano: schema de exemplares, consulta e nova operação autenticada de exclusão; evento de auditoria.
- Frontend Vanilla JS: fluxo de busca, confirmação e justificativa para Admin, com proteção de sessão e perfil.
- Circulação: o workspace Xano já contém os schemas `loan`/`fine` e a API de criação de empréstimo; a alteração será limitada à proteção contra tombstones e à resolução de multas pendentes vinculadas ao exemplar.
