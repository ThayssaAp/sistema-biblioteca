# Spec Delta

## Purpose

Permitir que um operador administrativo cadastra, consulta e mantém os funcionários e administradores do sistema com validação, segurança e auditoria no backend.

## ADDED Requirements

### Requirement: Cadastro de operadores é exclusivo de Admin
O backend SHALL permitir o cadastro de operadores somente para sessão autenticada com perfil `ADMIN` e SHALL validar matrícula única, nome, CPF, endereço, telefone, perfil e senha antes de criar o registro.

#### Scenario: Admin cadastra operador válido
- **WHEN** um Admin envia dados válidos para cadastrar `FUNCIONARIO` ou `ADMIN`
- **THEN** o backend cria o operador com senha armazenada como hash e registra a operação sem retornar dados secretos

#### Scenario: Funcionário ou sessão inválida tenta cadastrar
- **WHEN** um Funcionário ou uma requisição sem credencial válida tenta cadastrar operador
- **THEN** o backend rejeita a operação e não cria registro

#### Scenario: Matrícula ou CPF duplicado
- **WHEN** o cadastro reutiliza uma matrícula ou CPF já associado a outro operador
- **THEN** o backend rejeita o cadastro e mantém os registros existentes

### Requirement: Dados e senha inicial de operador são validados
O sistema SHALL exigir campos obrigatórios aparados, CPF válido, matrícula única e senha inicial com pelo menos 8 caracteres, uma letra e um dígito.

#### Scenario: Campo obrigatório ausente
- **WHEN** o cadastro não contém nome, matrícula, CPF, endereço, telefone, perfil ou senha
- **THEN** o backend rejeita o cadastro com indicação textual do campo inválido

#### Scenario: CPF inválido
- **WHEN** o cadastro contém CPF com formato ou dígitos verificadores inválidos
- **THEN** o backend rejeita o cadastro sem criar operador

#### Scenario: Senha inicial fraca
- **WHEN** a senha não atende aos requisitos mínimos
- **THEN** o backend rejeita o cadastro sem persistir o valor em texto puro

### Requirement: Operadores podem ser consultados por Admin
O backend SHALL disponibilizar uma consulta administrativa paginada com filtros por matrícula, nome e perfil e SHALL retornar somente dados públicos dos operadores.

#### Scenario: Admin consulta operadores
- **WHEN** um Admin solicita a lista com filtros válidos
- **THEN** o backend retorna operadores ativos e desativados conforme o filtro sem senha, hash ou token

#### Scenario: Funcionário consulta operadores
- **WHEN** um Funcionário solicita a consulta administrativa
- **THEN** o backend rejeita a operação e não retorna dados

### Requirement: Perfil de operador pode ser alterado por Admin
O backend SHALL permitir que um Admin altere o perfil de outro operador somente para `FUNCIONARIO` ou `ADMIN` e SHALL registrar a mudança.

#### Scenario: Alteração válida
- **WHEN** um Admin altera o perfil de um operador existente para um perfil permitido
- **THEN** o backend atualiza o perfil e registra o operador responsável pela alteração

#### Scenario: Perfil inválido
- **WHEN** a requisição informa perfil diferente de `FUNCIONARIO` ou `ADMIN`
- **THEN** o backend rejeita a alteração e preserva o perfil atual

### Requirement: Operador pode ser desativado sem excluir seu histórico
O backend SHALL permitir desativação lógica por Admin, SHALL impedir que o operador desativado autentique e SHALL preservar seus registros históricos.

#### Scenario: Admin desativa outro operador
- **WHEN** um Admin solicita desativar um operador ativo diferente de si próprio
- **THEN** o backend registra a desativação e impede logins futuros desse operador

#### Scenario: Operador desativado tenta autenticar
- **WHEN** um operador desativado envia credenciais válidas
- **THEN** o backend rejeita o login como qualquer credencial inválida

#### Scenario: Admin tenta desativar a própria conta
- **WHEN** o Admin solicita desativar o próprio registro
- **THEN** o backend rejeita a operação para evitar perda involuntária da sessão administrativa

### Requirement: Interface de gerenciamento é exclusiva de Admin
A interface SHALL oferecer ao Admin uma tela acessível para cadastrar, pesquisar, alterar perfil e desativar operadores, com confirmação textual e proteção contra envio duplicado.

#### Scenario: Admin utiliza o fluxo
- **WHEN** um Admin abre a área de funcionários e envia uma operação válida
- **THEN** a interface indica carregamento, envia os dados ao backend e apresenta o resultado em texto

#### Scenario: Funcionário tenta acessar diretamente
- **WHEN** um Funcionário abre a rota ou URL administrativa de funcionários
- **THEN** a interface bloqueia o fluxo e não envia chamadas de gerenciamento

#### Scenario: Resultado da API é apresentado
- **WHEN** o backend aceita ou rejeita uma operação
- **THEN** a interface apresenta o resultado sem interpretar conteúdo da API como HTML e permite nova tentativa
