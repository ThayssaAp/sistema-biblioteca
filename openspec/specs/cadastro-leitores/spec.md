# Cadastro de Leitores Specification

## Purpose

Permitir que operadores do balcão cadastrem leitores identificados unicamente pelo CPF, com os dados necessários para validar empréstimos futuros, mantendo leitores separados dos operadores do sistema.

## Requirements

### Requirement: Leitor é identificado unicamente pelo CPF
O sistema SHALL identificar cada leitor por um CPF único, armazenado somente com os 11 dígitos, e SHALL rejeitar CPF com tamanho ou dígitos verificadores inválidos.

#### Scenario: CPF válido informado com máscara
- **WHEN** um operador envia o CPF `529.982.247-25` com os demais dados válidos
- **THEN** o leitor é cadastrado e o CPF é armazenado e retornado como `52998224725`

#### Scenario: CPF já cadastrado
- **WHEN** um operador envia um CPF já cadastrado, com ou sem máscara
- **THEN** o sistema rejeita o cadastro com erro de conflito e mantém um único leitor para esse CPF

#### Scenario: CPF inválido
- **WHEN** um operador envia um CPF com menos ou mais de 11 dígitos, ou com dígitos verificadores incorretos, como `111.111.111-11`
- **THEN** o sistema rejeita o cadastro e não cria o leitor

### Requirement: Dados obrigatórios e opcionais do leitor
O sistema SHALL exigir nome, CPF, data de nascimento, endereço e telefone, SHALL aceitar o e-mail como dado opcional e SHALL remover espaços nas extremidades dos textos informados.

#### Scenario: Cadastro completo sem e-mail
- **WHEN** um operador envia nome, CPF, data de nascimento, endereço e telefone válidos, sem e-mail
- **THEN** o leitor é cadastrado sem e-mail

#### Scenario: Campo obrigatório ausente ou vazio
- **WHEN** um operador envia o cadastro sem um dos campos obrigatórios ou com ele preenchido apenas com espaços
- **THEN** o sistema rejeita o cadastro indicando o campo e não cria o leitor

#### Scenario: E-mail informado com formato inválido
- **WHEN** um operador envia um e-mail com formato inválido
- **THEN** o sistema rejeita o cadastro indicando o campo e-mail

### Requirement: Data de nascimento deve ser uma data passada válida
O sistema SHALL aceitar somente data de nascimento existente e não posterior à data atual no fuso de Brasília, pois ela sustenta a validação de faixa etária dos empréstimos.

#### Scenario: Data de nascimento futura
- **WHEN** um operador envia uma data de nascimento posterior à data atual
- **THEN** o sistema rejeita o cadastro e não cria o leitor

#### Scenario: Data inexistente
- **WHEN** um operador envia uma data inexistente, como `2000-02-30`
- **THEN** o sistema rejeita o cadastro e não cria o leitor

### Requirement: Cadastro restrito a operadores autenticados
O backend SHALL permitir o cadastro de leitores somente a operadores autenticados com perfil `FUNCIONARIO` ou `ADMIN`, validando a credencial e o perfil no servidor.

#### Scenario: Requisição sem credencial válida
- **WHEN** uma requisição de cadastro não apresenta credencial válida
- **THEN** o backend rejeita o acesso e não cria o leitor

#### Scenario: Funcionário cadastra leitor
- **WHEN** um operador autenticado com perfil `FUNCIONARIO` envia um cadastro válido
- **THEN** o backend cadastra o leitor

#### Scenario: Admin cadastra leitor
- **WHEN** um operador autenticado com perfil `ADMIN` envia um cadastro válido
- **THEN** o backend cadastra o leitor

### Requirement: Leitor não é operador
O cadastro de leitor SHALL NOT criar credenciais, matrícula, perfil ou qualquer acesso ao sistema e SHALL NOT alterar registros de operadores.

#### Scenario: Leitor cadastrado tenta autenticar
- **WHEN** um leitor recém-cadastrado tenta autenticar usando seu CPF
- **THEN** o login é rejeitado com a mesma mensagem genérica de falha de autenticação

#### Scenario: Operadores permanecem inalterados
- **WHEN** um leitor é cadastrado
- **THEN** nenhum registro de operador é criado ou alterado

### Requirement: Rastreabilidade do cadastro
O sistema SHALL registrar o operador responsável e a data e hora de cada cadastro de leitor e SHALL gerar um evento de auditoria que não contenha endereço, telefone, e-mail nem data de nascimento.

#### Scenario: Cadastro registra o operador responsável
- **WHEN** um operador cadastra um leitor com sucesso
- **THEN** o registro do leitor guarda o identificador desse operador e a data e hora do cadastro

#### Scenario: Evento de auditoria sem dados pessoais
- **WHEN** o backend registra o evento de cadastro de leitor
- **THEN** o evento identifica o operador e o leitor, mas não contém endereço, telefone, e-mail nem data de nascimento

### Requirement: Tela de cadastro de leitores
A interface SHALL oferecer uma tela dedicada ao cadastro de leitores, utilizável por teclado, com rótulos associados aos campos, foco inicial no CPF, mensagens textuais por campo e estados de carregamento e erro, exigindo sessão de operador ativa. A interface SHALL aplicar as máscaras `XXX.XXX.XXX-XX` para CPF e `(XX)XXXXX-XXXX` para telefone, e SHALL exibir a data de nascimento no formato brasileiro `dd/mm/aaaa`, convertendo os valores para os formatos normalizados da API ao enviar.

#### Scenario: Cadastro realizado com sucesso
- **WHEN** o operador envia o formulário válido e a API confirma o cadastro
- **THEN** a tela exibe uma confirmação textual com nome e CPF do leitor, limpa o formulário e devolve o foco ao campo CPF

#### Scenario: Erros de validação por campo
- **WHEN** o operador envia dados inválidos ou a API rejeita um campo
- **THEN** a tela exibe uma mensagem textual associada ao campo, sem depender apenas de cor

#### Scenario: CPF já cadastrado
- **WHEN** a API responde que o CPF já está cadastrado
- **THEN** a tela exibe a mensagem "CPF já cadastrado" junto ao campo CPF

#### Scenario: Envio duplicado durante o carregamento
- **WHEN** o formulário já foi enviado e a resposta ainda não chegou
- **THEN** a tela bloqueia novo envio e indica o estado de carregamento

#### Scenario: Sessão ausente
- **WHEN** a tela é aberta sem sessão de operador no navegador
- **THEN** a tela redireciona para a tela de login sem exibir o formulário
