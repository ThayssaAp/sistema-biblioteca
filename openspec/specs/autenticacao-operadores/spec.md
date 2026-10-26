# Autenticação de Operadores Specification

## Purpose

Permitir que Funcionários e Admins acessem o sistema da biblioteca com credenciais próprias e que o backend identifique e autorize cada operador de acordo com seu perfil.

## Requirements

### Requirement: Operadores possuem matrícula única e perfil controlado
O sistema SHALL identificar cada operador por uma matrícula funcional única e SHALL restringir seu perfil a `FUNCIONARIO` ou `ADMIN`. A criação inicial do Admin será provisionada diretamente no Xano; esta change não disponibiliza cadastro público ou tela/API de cadastro de operadores.

#### Scenario: Matrícula duplicada
- **WHEN** um operador é provisionado com uma matrícula já atribuída a outro operador
- **THEN** o sistema rejeita a criação e mantém a matrícula vinculada a apenas um operador

#### Scenario: Primeiro Admin provisionado
- **WHEN** a equipe configura o primeiro operador Admin diretamente no Xano
- **THEN** esse operador pode autenticar com sua matrícula e o perfil armazenado é `ADMIN`

#### Scenario: Perfil não pode ser escolhido pelo cliente
- **WHEN** um operador `FUNCIONARIO` inclui `ADMIN` como perfil em uma requisição de login
- **THEN** o backend não altera o perfil armazenado e retorna o perfil efetivamente atribuído ao operador

### Requirement: Senhas de operadores são armazenadas com hash
O backend SHALL armazenar senhas de operadores usando mecanismo seguro de hash de senha e SHALL nunca persistir ou retornar a senha em texto puro.

#### Scenario: Senha de operador provisionada
- **WHEN** uma senha é definida para um operador no Xano
- **THEN** o registro persistido contém somente o hash e nenhum endpoint retorna a senha em texto puro

### Requirement: Operadores autenticam com matrícula e senha
O backend SHALL autenticar operadores por matrícula e senha, emitir credencial de acesso somente após validação bem-sucedida e apresentar uma resposta indistinguível para matrícula inexistente e senha incorreta.

#### Scenario: Credenciais válidas
- **WHEN** um operador envia uma matrícula existente e sua senha correta
- **THEN** o backend retorna uma credencial de acesso e os dados públicos do operador autenticado, incluindo matrícula, nome e perfil

#### Scenario: Matrícula inexistente ou senha incorreta
- **WHEN** um operador envia matrícula inexistente ou senha incorreta
- **THEN** o backend rejeita a autenticação com a mesma mensagem genérica, sem revelar qual dado falhou

#### Scenario: Senha ausente
- **WHEN** a requisição de login não contém matrícula ou senha
- **THEN** o backend rejeita a requisição sem emitir credencial de acesso

### Requirement: Eventos de autenticação não expõem credenciais
Eventos de auditoria relacionados à autenticação SHALL omitir senhas, hashes de senha e credenciais de acesso, mesmo quando registram a identidade pública do operador.

#### Scenario: Login bem-sucedido é auditado
- **WHEN** o backend registra um evento de login bem-sucedido
- **THEN** o evento pode identificar o operador, mas não contém senha, hash de senha ou token de acesso

### Requirement: Identidade autenticada é recuperada a partir da credencial
O backend SHALL disponibilizar a identidade e o perfil do operador autenticado a partir de uma credencial válida, sem expor campos internos ou a senha do operador.

#### Scenario: Consulta do operador autenticado
- **WHEN** uma requisição apresenta uma credencial válida
- **THEN** o backend retorna os dados públicos do operador correspondente, incluindo seu perfil atual, sem dados de senha

#### Scenario: Credencial inválida ou ausente
- **WHEN** uma requisição protegida não apresenta credencial válida
- **THEN** o backend rejeita o acesso e não retorna dados de operador

### Requirement: Autorização por perfil é aplicada no backend
O backend SHALL validar a identidade e o perfil do operador em cada operação protegida por perfil; ocultar uma ação na interface não substitui essa validação.

#### Scenario: Funcionário tenta operação exclusiva de Admin
- **WHEN** um operador `FUNCIONARIO` solicita uma operação marcada como exclusiva de `ADMIN`
- **THEN** o backend rejeita a operação e não aplica seus efeitos

#### Scenario: Admin executa operação exclusiva de Admin
- **WHEN** um operador autenticado com perfil `ADMIN` solicita uma operação exclusiva de Admin
- **THEN** o backend permite a operação

### Requirement: Rotas de demonstração não podem conceder ou alterar perfis
O backend SHALL desativar as rotas de demonstração de criação de conta e alteração de perfil que permitam a um usuário autenticado obter ou modificar privilégios fora do provisionamento administrativo de operadores.

#### Scenario: Funcionário tenta criar conta pela rota de demonstração
- **WHEN** um operador autenticado solicita a antiga rota de criação de conta
- **THEN** o backend rejeita a operação sem criar conta ou alterar o perfil do operador

#### Scenario: Operador tenta alterar perfil pela rota de demonstração
- **WHEN** um operador autenticado solicita a antiga rota de alteração de perfil
- **THEN** o backend rejeita a operação sem alterar o perfil de qualquer operador

### Requirement: Tela de login permite entrar no sistema
A interface SHALL fornecer uma tela de login em HTML, CSS e JavaScript puro com campos de matrícula e senha, enviando as credenciais à API de autenticação e mostrando o resultado de forma acessível.

#### Scenario: Login aceito pela API
- **WHEN** o operador preenche matrícula e senha válidas e envia o formulário
- **THEN** a interface apresenta o estado autenticado e disponibiliza a identidade e o perfil retornados pela API para o fluxo da aplicação

#### Scenario: Login rejeitado pela API
- **WHEN** a API rejeita as credenciais
- **THEN** a interface informa que não foi possível entrar sem distinguir matrícula inexistente de senha incorreta e permite nova tentativa

#### Scenario: Requisição em andamento
- **WHEN** o formulário de login está aguardando resposta da API
- **THEN** a interface indica o estado de carregamento e impede envios duplicados até receber a resposta

#### Scenario: Uso por teclado e tecnologia assistiva
- **WHEN** o operador navega ou envia o formulário sem mouse ou usando tecnologia assistiva
- **THEN** os campos, rótulos, mensagens e ação de envio permanecem identificáveis e operáveis
