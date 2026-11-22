# Design

## Context

O schema `user.xs` já representa operadores por matrícula, CPF, dados pessoais, senha e perfil `FUNCIONARIO`/`ADMIN`. A autenticação usa `/auth/login` e `/auth/me`, e o menu já valida perfil no frontend e no backend.

A rota administrativa de alteração de perfil existente está desativada por uma precondição fixa. Esta change substitui esse bloqueio por operações administrativas completas sem criar sessão pública ou alterar o provisionamento inicial do primeiro Admin.

## Goals / Non-Goals

**Goals:**
- Entregar cadastro, consulta, alteração de perfil e desativação de operadores.
- Manter autorização `ADMIN` no backend como autoridade final.
- Preservar histórico e impedir login de operadores desativados.
- Reutilizar validações, componentes visuais e padrões já existentes no frontend.

**Non-Goals:**
- Recuperação de senha por e-mail.
- Reativação de operador nesta change.
- Alteração da senha atual de outro operador.
- Criação pública de operadores ou promoção por rota de demonstração.
- Dashboard administrativo.

## Decisions

- Adicionar ao schema `user` os campos opcionais `active` com valor padrão `true` e `deactivated_at`, `deactivated_by` e `deactivation_reason`. A desativação será lógica, preservando registros históricos e permitindo consultas administrativas. Alternativa rejeitada: exclusão física, porque apagaria vínculo histórico e exigiria remoção de event logs.
- Criar APIs administrativas separadas no grupo `Authentication` ou `Members & Accounts`: cadastro, consulta, alteração de perfil e desativação. Todas começarão pela obtenção do operador autenticado e pela validação `required_role: "ADMIN"`; o frontend não será tratado como autorização.
- Reutilizar a validação de CPF já usada por leitores, mas adaptada ao domínio de operadores. Matrícula e CPF serão normalizados e terão conflito explícito; perfil será validado contra os dois valores previstos.
- Gerar senha inicial no backend com `password` seguro. Alternativa rejeitada: aceitar senha já hashada ou gerar uma senha fixa sem troca, porque isso impediria rastreabilidade e criaria credenciais previsíveis.
- Atualizar `/auth/login` para rejeitar operadores com `active=false`. A resposta seguirá a mensagem genérica já usada para credenciais inválidas.
- Registrar eventos `operator_create`, `operator_role_update` e `operator_deactivate` com identificadores e metadados sanitizados; nunca registrar senha ou hash.
- Remover a precondição fixa da API antiga de alteração de perfil e substituir seu fluxo por validação administrativa completa. Também validar que o alvo existe e que o Admin não desative a própria conta.
- Integrar uma nova opção “Funcionários” ao menu Admin e criar uma view dedicada com cadastro, filtros, tabela e confirmação acessível. Consultas e mutations usarão bearer token e renderizarão respostas apenas como texto.

## Risks / Trade-offs

- [A inatividade exige atualização de dados existentes] → Definir `active=true` no default e tratar registros antigos sem valor como ativos durante a migração.
- [O Admin pode perder acesso por alterar a própria conta] → Impedir alteração de perfil ou desativação do próprio registro pela interface, mantendo pelo menos um Admin ativo.
- [A matrícula pode ser criada fora do padrão esperado] → Definir formato e validação no backend e documentar o retorno de conflito.
- [Dados pessoais podem vazar na interface] → Retornar somente campos públicos necessários à operação e omitir senha, hash e tokens.
- [Operadores desativados podem manter uma sessão já emitida] → Rejeitar novas operações sensíveis pela consulta da identidade atual e considerar revogação de token como regra de segurança futura, caso o Xano permita invalidar credenciais emitidas.

## Migration Plan

1. Adicionar os campos de ativação ao schema `user` com valor padrão para novos registros.
2. Atualizar `/auth/login` para rejeitar operadores desativados.
3. Publicar e validar as APIs administrativas de cadastro, consulta, alteração de perfil e desativação.
4. Substituir a rota demonstrativa de perfil por este fluxo protegido.
5. Adicionar a opção e a tela de funcionários ao frontend.
6. Executar testes de Admin, Funcionário, sessão inválida, duplicidade, perfil inválido e desativação própria.
7. Rollback remove a opção de menu e desativa temporariamente os novos endpoints, preservando os registros e campos já gravados.
