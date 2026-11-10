# Spec Delta

## ADDED Requirements

### Requirement: Tela inicial oferece seleção explícita de perfil
A aplicação SHALL disponibilizar uma tela pública inicial com duas opções textuais e distintas: acesso do Leitor e acesso do Funcionário.

#### Scenario: Usuário abre a entrada da aplicação
- **WHEN** um usuário acessa a tela inicial sem sessão autenticada
- **THEN** a interface apresenta as opções “Sou leitor” e “Sou funcionário” sem exigir credenciais

#### Scenario: Usuário navega por teclado
- **WHEN** o usuário percorre a tela inicial usando teclado ou tecnologia assistiva
- **THEN** cada opção possui nome acessível, foco visível e pode ser acionada sem depender apenas de cor ou ícone

### Requirement: Seleção encaminha ao fluxo de autenticação correto
A tela inicial SHALL encaminhar cada opção para o login correspondente, preservando os fluxos de autenticação existentes.

#### Scenario: Leitor seleciona seu perfil
- **WHEN** o usuário seleciona “Sou leitor”
- **THEN** a aplicação abre o login do Portal do Leitor

#### Scenario: Funcionário seleciona seu perfil
- **WHEN** o usuário seleciona “Sou funcionário”
- **THEN** a aplicação abre o login de Funcionário/Admin

### Requirement: Entrada pública não mistura sessões
A tela inicial SHALL permanecer pública e não SHALL criar, reutilizar ou substituir tokens de leitor ou operador.

#### Scenario: Usuário retorna à entrada com sessão existente
- **WHEN** um usuário abre a tela inicial enquanto existe uma sessão de leitor ou operador no navegador
- **THEN** a tela apenas oferece os dois destinos e preserva as sessões existentes sem trocar seus tokens
