# Spec Delta

## MODIFIED Requirements

### Requirement: Dados obrigatórios e opcionais do leitor
O sistema SHALL exigir nome, CPF, data de nascimento, endereço e telefone, SHALL aceitar o e-mail como dado opcional, SHALL exigir uma senha temporária definida pelo operador para habilitar o primeiro acesso e SHALL remover espaços nas extremidades dos textos informados.

#### Scenario: Cadastro completo com acesso inicial
- **WHEN** um operador envia nome, CPF, data de nascimento, endereço, telefone e senha temporária válidos
- **THEN** o leitor é cadastrado com o primeiro acesso pendente e sem que a senha seja retornada na resposta

#### Scenario: Cadastro completo sem e-mail
- **WHEN** um operador envia os dados obrigatórios e a senha temporária válidos, sem e-mail
- **THEN** o leitor é cadastrado sem e-mail e com o primeiro acesso pendente

#### Scenario: Campo obrigatório ausente ou vazio
- **WHEN** um operador envia o cadastro sem um campo obrigatório, com ele preenchido apenas com espaços ou sem senha temporária
- **THEN** o sistema rejeita o cadastro indicando o campo e não cria o leitor

#### Scenario: E-mail informado com formato inválido
- **WHEN** um operador envia um e-mail com formato inválido
- **THEN** o sistema rejeita o cadastro indicando o campo e-mail

### Requirement: Leitor não é operador
O cadastro de leitor SHALL NOT criar credencial de operador, matrícula ou perfil de operador, mas SHALL criar somente os dados de autenticação próprios do Portal do Leitor, sem alterar registros de operadores.

#### Scenario: Leitor cadastrado tenta autenticar
- **WHEN** um leitor recém-cadastrado tenta autenticar usando seu CPF na tela de operadores
- **THEN** o login de operador é rejeitado com a mesma mensagem genérica de falha de autenticação

#### Scenario: Leitor cadastrado inicia o primeiro acesso
- **WHEN** um leitor recém-cadastrado usa seu CPF e senha temporária no Portal do Leitor
- **THEN** o primeiro acesso é aceito e a troca obrigatória de senha é indicada

#### Scenario: Operadores permanecem inalterados
- **WHEN** um leitor é cadastrado
- **THEN** nenhum registro de operador é criado ou alterado
