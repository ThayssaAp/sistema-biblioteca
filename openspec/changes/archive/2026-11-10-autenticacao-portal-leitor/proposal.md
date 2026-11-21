# Proposal

## Why

Leitores já são cadastrados pela equipe da biblioteca, mas ainda não possuem uma
identidade autenticável para acessar o Portal do Leitor. Esta change cria um
acesso separado do operador, permitindo que o leitor faça o primeiro acesso com
uma senha temporária, defina sua senha própria e mantenha uma sessão segura.

## What Changes

- Criar autenticação própria para leitores, separada da autenticação de
  Funcionários e Admins.
- Permitir primeiro acesso usando CPF e senha temporária definida pelo operador.
- Obrigar a troca da senha temporária antes de liberar o Portal do Leitor.
- Permitir login recorrente usando CPF e senha própria.
- Armazenar senhas de leitores com hash e nunca em texto plano.
- Emitir tokens de sessão identificados como sessões de leitor e validar o papel
  no backend.
- Criar telas de login do leitor e de definição da nova senha.
- Criar testes dos fluxos de primeiro acesso, troca de senha, login recorrente e
  tratamento de erros.

## Capabilities

### New Capabilities

- `autenticacao-leitores`: autenticação, primeiro acesso, troca obrigatória de
  senha e sessão segura para leitores.

### Modified Capabilities

- `cadastro-leitores`: incluir os dados necessários para provisionar a senha
  temporária de um leitor sem expor credenciais em respostas de consulta.

## Impact

- Backend Xano: modelo `reader`, endpoints de autenticação e endpoint de
  cadastro de leitores.
- Frontend Vanilla JS: novas telas do Portal do Leitor e cliente de sessão
  separado do fluxo de operadores.
- Testes JavaScript existentes e novos testes da autenticação de leitores.
- Contratos de API consumidos pelo cadastro e pelo Portal do Leitor.
