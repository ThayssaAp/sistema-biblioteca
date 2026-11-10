# autenticacao-leitores Specification

## Purpose

Permitir que leitores cadastrados acessem o Portal do Leitor com credenciais
próprias, troquem a senha temporária no primeiro acesso e mantenham uma sessão
separada e segura da sessão dos operadores.

## Requirements

### Requirement: Primeiro acesso usa CPF e senha temporária
O sistema SHALL permitir que um leitor cadastrado inicie o acesso informando seu CPF e a senha temporária definida pela biblioteca.

#### Scenario: Primeiro acesso válido
- **WHEN** o leitor informa CPF cadastrado e senha temporária correta
- **THEN** o backend autentica a identidade, identifica que a troca de senha é obrigatória e não libera o conteúdo do portal antes da troca

#### Scenario: Credencial de primeiro acesso inválida
- **WHEN** o leitor informa CPF inexistente ou senha temporária incorreta
- **THEN** o backend rejeita o acesso com mensagem genérica e não revela qual dado está incorreto

### Requirement: Leitor deve trocar a senha no primeiro acesso
O sistema SHALL exigir uma nova senha própria antes de concluir o primeiro acesso e SHALL validar os requisitos mínimos de segurança da senha.

#### Scenario: Troca de senha válida
- **WHEN** o leitor autenticado no fluxo de primeiro acesso informa uma nova senha válida e sua confirmação correspondente
- **THEN** o backend substitui a senha temporária por um hash da nova senha, marca o primeiro acesso como concluído e libera a sessão do portal

#### Scenario: Nova senha inválida ou não confirmada
- **WHEN** a nova senha não atende aos requisitos ou a confirmação é diferente
- **THEN** o sistema rejeita a troca, mantém o primeiro acesso pendente e não altera a senha temporária

#### Scenario: Nova senha igual à temporária
- **WHEN** o leitor informa como nova senha a mesma senha temporária recebida no cadastro
- **THEN** o sistema rejeita a troca, informa que a nova senha deve ser diferente e mantém o primeiro acesso pendente

### Requirement: Login recorrente usa CPF e senha própria
O sistema SHALL permitir que leitores com primeiro acesso concluído entrem usando CPF e senha própria.

#### Scenario: Login recorrente válido
- **WHEN** o leitor informa CPF cadastrado e senha própria correta
- **THEN** o backend emite uma sessão de leitor válida e o portal fica acessível

#### Scenario: Leitor ainda pendente de troca
- **WHEN** o leitor tenta login recorrente enquanto a troca obrigatória não foi concluída
- **THEN** o backend encaminha o fluxo para a troca de senha e não libera as funcionalidades do portal

### Requirement: Sessão de leitor é separada e protegida
O backend SHALL emitir e validar tokens de leitor sem aceitar token de operador como credencial de leitor, e SHALL impedir acesso às APIs do portal sem uma sessão de leitor válida.

#### Scenario: Token de operador usado no portal
- **WHEN** uma requisição do portal apresenta somente um token válido de operador
- **THEN** o backend rejeita a requisição por falta de sessão de leitor

#### Scenario: Sessão de leitor expirada ou ausente
- **WHEN** uma API protegida do portal recebe token ausente, inválido ou expirado
- **THEN** o backend rejeita o acesso e a interface encaminha o leitor para o login

### Requirement: Credenciais do leitor são armazenadas com segurança
O sistema SHALL armazenar a senha temporária e a senha própria somente como hash, SHALL evitar retornar qualquer senha em respostas e SHALL usar mensagens genéricas para falhas de autenticação.

#### Scenario: Resposta de autenticação
- **WHEN** um login ou troca de senha é concluído
- **THEN** a resposta contém somente os dados necessários da sessão e do leitor, sem senha ou hash

#### Scenario: Falha de autenticação
- **WHEN** CPF inexistente, senha incorreta ou leitor não habilitado é informado
- **THEN** o sistema retorna a mesma mensagem genérica de autenticação inválida

### Requirement: Portal oferece telas acessíveis de autenticação
A interface SHALL oferecer telas separadas para login do leitor e troca da senha inicial, com rótulos associados, mensagens textuais, estados de carregamento e foco adequado, sem reutilizar a sessão de operador.

#### Scenario: Leitor abre o login
- **WHEN** o leitor acessa a entrada do Portal do Leitor
- **THEN** a tela exibe campos de CPF e senha, orientações de primeiro acesso e foco inicial no CPF

#### Scenario: Troca obrigatória indicada pela API
- **WHEN** a API informa que a senha temporária deve ser trocada
- **THEN** a interface exibe somente o formulário de nova senha e confirmação até a operação ser concluída

#### Scenario: Erro ou envio duplicado
- **WHEN** a API rejeita a autenticação ou o formulário está aguardando resposta
- **THEN** a interface exibe erro textual e impede novo envio enquanto a requisição estiver em andamento
