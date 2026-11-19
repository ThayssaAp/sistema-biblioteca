# Design

## Context

O projeto possui uma tabela `reader` sem autenticação e uma tabela `user` usada
exclusivamente por operadores. O frontend mantém a sessão do operador em
`sessionStorage` e usa páginas estáticas que consomem APIs Xano. O novo portal
precisa preservar essa separação, reaproveitar os padrões de validação e
mensagens existentes e não expor credenciais nas respostas de cadastro ou
consulta.

## Goals / Non-Goals

**Goals:**

- Adicionar ao leitor o estado de primeiro acesso e os dados internos
  necessários para autenticação segura.
- Criar um fluxo de primeiro acesso, troca obrigatória e login recorrente com
  sessão própria.
- Integrar telas estáticas de autenticação com APIs Xano.
- Manter o fluxo de autenticação e navegação dos operadores inalterado.
- Cobrir contratos de API e comportamentos da interface com testes.

**Non-Goals:**

- Criar reserva, empréstimo, devolução ou consulta de livros.
- Permitir que leitores alterem dados cadastrais nesta change.
- Compartilhar tokens entre sessões de leitores e operadores.
- Criar recuperação de senha por e-mail; esse fluxo será decidido em uma change
  posterior.

## Decisions

### Identidade e modelo de autenticação

O leitor será identificado pelo CPF normalizado. O modelo `reader` receberá
campos internos para hash da senha e indicação de troca pendente. A senha
temporária será fornecida pelo operador no cadastro, mas nunca será incluída em
respostas, logs ou dados de auditoria.

Alternativas consideradas:

- Reutilizar `user`: rejeitado porque mistura papéis e amplia o risco de um
  token de operador ser aceito no portal.
- Usar e-mail como identificador: rejeitado porque o e-mail do leitor é
  opcional no cadastro.

### Tokens e autorização

As APIs do portal usarão autenticação própria vinculada à tabela `reader`. Cada
endpoint protegido validará a identidade do leitor no servidor e não confiará
em um papel enviado pelo navegador. A interface armazenará o token de leitor
separadamente do token de operador em `sessionStorage`.

Alternativas consideradas:

- Autorizar o portal com o token de operador: rejeitado por violar a separação
  de perfis.
- Usar apenas estado local no navegador: rejeitado porque não fornece
  autenticação verificável no backend.

### Fluxo de primeiro acesso

O login com senha temporária produzirá uma resposta intermediária que permite
somente a operação de troca de senha. Após a troca bem-sucedida, o backend
marcará o leitor como habilitado e emitirá a sessão completa do portal. A nova
senha deverá atender aos requisitos mínimos já adotados para credenciais
seguras, incluindo comprimento mínimo, letra e dígito, e será comparada no
backend com o hash atual para impedir que a senha temporária seja reutilizada.

### Compatibilidade do cadastro

O endpoint de cadastro continuará restrito a operadores e passará a receber a
senha temporária. Respostas, consultas administrativas e eventos de auditoria
continuarão omitindo hash e senha. A tela de cadastro exibirá confirmação
textual sem reexibir a credencial.

### Interface

Serão criadas páginas próprias para entrada do leitor e troca de senha,
reutilizando as cores `#F6F3EC` e `#1F5C4D`, tipografia definida pelo projeto,
rótulos associados e mensagens textuais. O redirecionamento para o portal
ocorrerá somente após uma sessão de leitor completa.

## Risks / Trade-offs

- **[Senha temporária pode ser compartilhada de forma insegura]** → A API
  aceitará a senha somente por transporte seguro configurado no Xano, nunca a
  retornará e o operador será responsável pela entrega ao leitor.
- **[Leitores existentes não possuem senha]** → A migração marcará esses
  registros como pendentes e o cadastro/rotina administrativa deverá provisionar
  a senha antes do primeiro acesso.
- **[Sessões armazenadas no navegador podem ser apagadas]** → O portal tratará
  token ausente ou expirado como sessão encerrada e encaminhará para o login,
  sem fallback para sessão de operador.
- **[Mudanças no contrato de cadastro podem afetar clientes existentes]** →
  Os testes do cadastro serão atualizados junto com a API e a alteração será
  validada antes da publicação.

## Migration Plan

1. Atualizar o modelo `reader` com os campos internos de autenticação,
   preservando os registros existentes como primeiro acesso pendente.
2. Publicar os endpoints de login, troca de senha e validação de sessão de
   leitor.
3. Atualizar o cadastro de leitores para provisionar a senha temporária sem
   expô-la.
4. Publicar as páginas do Portal do Leitor e seus testes.
5. Validar primeiro acesso, troca obrigatória, login recorrente, isolamento de
   tokens e regressão do login de operadores.

Em caso de falha, os novos endpoints e páginas podem ser retirados sem remover
registros de leitores. Registros migrados devem permanecer sem acesso até que
uma senha temporária seja provisionada.
