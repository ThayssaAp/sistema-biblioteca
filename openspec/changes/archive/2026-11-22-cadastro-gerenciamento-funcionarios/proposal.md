# Proposal

## Why

A área administrativa ainda não permite que um Admin cadastrado provisiona ou mantenha os operadores que utilizam o sistema de balcão. O provisionamento direto no Xano dificulta a operação diária e impede consulta, alteração de perfil e desativação por uma interface administrativa controlada.

## What Changes

- Criar uma área administrativa para cadastrar funcionários e administradores.
- Permitir consulta e filtro dos operadores por matrícula, nome e perfil.
- Permitir alteração segura de perfil entre `FUNCIONARIO` e `ADMIN`.
- Permitir desativação de operadores, impedindo novos logins sem apagar o histórico.
- Exigir matrícula única, dados obrigatórios, CPF válido e senha inicial segura com hash.
- Impedir que funcionário ou sessão inválida realize operações administrativas.
- Impedir que um Admin desative a própria conta por esta interface.
- Substituir o placeholder administrativo atual por uma rota funcional de gerenciamento de funcionários.

## Capabilities

### New Capabilities

- `cadastro-gerenciamento-funcionarios`: cadastro, consulta, alteração de perfil e desativação administrativa de operadores do sistema.

### Modified Capabilities

- `autenticacao-operadores`: o provisionamento passa a ser realizado por uma API administrativa além do acesso direto no Xano, mantendo matrícula, perfil e senha seguros.
- `navegacao-perfis`: a área administrativa passa a incluir uma opção funcional de funcionários em vez de reservar a opção apenas para futura implementação.

## Impact

- Backend Xano: novas APIs administrativas, validações de matrícula/CPF/senha/perfil, desativação lógica de operadores e registro de eventos.
- Banco Xano: possibilidade de adicionar estado de ativação ao registro de operadores sem remover dados históricos.
- Frontend: nova tela administrativa com cadastro, consulta, alteração de perfil e desativação acessível.
- Autenticação: login deve rejeitar operadores desativados.
- Segurança: toda operação administrativa continua sujeita à validação `ADMIN` no backend.
