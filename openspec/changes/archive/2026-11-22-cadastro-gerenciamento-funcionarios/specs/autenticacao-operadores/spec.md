# Spec Delta

## MODIFIED Requirements

### Requirement: Operadores possuem matrícula única e perfil controlado
O sistema SHALL identificar cada operador por uma matrícula funcional única e SHALL restringir seu perfil a `FUNCIONARIO` ou `ADMIN`. O cadastro inicial de um Admin pode ser provisionado diretamente no Xano, enquanto novos operadores podem ser cadastrados por um Admin autenticado por meio da API administrativa.

#### Scenario: Matrícula duplicada
- **WHEN** um operador é provisionado ou cadastrado com uma matrícula já atribuída a outro operador
- **THEN** o sistema rejeita a criação e mantém a matrícula vinculada a apenas um operador

#### Scenario: Primeiro Admin provisionado
- **WHEN** a equipe configura o primeiro operador Admin diretamente no Xano
- **THEN** esse operador pode autenticar com sua matrícula e o perfil armazenado é `ADMIN`

#### Scenario: Admin cadastra perfil válido
- **WHEN** um Admin cadastra ou altera um operador informando `FUNCIONARIO` ou `ADMIN`
- **THEN** o backend persiste somente o perfil permitido

#### Scenario: Perfil não pode ser escolhido pelo cliente
- **WHEN** um operador `FUNCIONARIO` inclui `ADMIN` como perfil em uma requisição de login
- **THEN** o backend não altera o perfil armazenado e retorna o perfil efetivamente atribuído ao operador

### Requirement: Operadores autenticam com matrícula e senha
O backend SHALL autenticar operadores ativos por matrícula e senha, emitir credencial de acesso somente após validação bem-sucedida e apresentar uma resposta indistinguível para matrícula inexistente, senha incorreta ou operador desativado.

#### Scenario: Credenciais válidas
- **WHEN** um operador ativo envia uma matrícula existente e sua senha correta
- **THEN** o backend retorna uma credencial de acesso e os dados públicos do operador autenticado, incluindo matrícula, nome e perfil

#### Scenario: Matrícula inexistente ou senha incorreta
- **WHEN** um operador envia matrícula inexistente ou senha incorreta
- **THEN** o backend rejeita a autenticação com a mesma mensagem genérica, sem revelar qual dado falhou

#### Scenario: Operador desativado
- **WHEN** um operador desativado envia matrícula e senha
- **THEN** o backend rejeita o login com resposta indistinguível de credenciais inválidas e não emite credencial

#### Scenario: Senha ausente
- **WHEN** a requisição de login não contém matrícula ou senha
- **THEN** o backend rejeita a requisição sem emitir credencial de acesso
