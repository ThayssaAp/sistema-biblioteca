# navegacao-perfis Specification

## Purpose

Organiza a entrada autenticada da biblioteca por perfil, mantendo os fluxos existentes acessíveis e apresentando com clareza os recursos ainda não disponíveis.

## Requirements

### Requirement: Menu principal é exibido para operadores autenticados
A interface SHALL apresentar um menu central após validar a sessão do operador e SHALL usar o perfil retornado pelo backend para determinar as áreas e opções visíveis.

#### Scenario: Funcionário acessa o menu
- **WHEN** um operador `FUNCIONARIO` inicia ou retoma uma sessão válida
- **THEN** a interface apresenta o menu principal de Funcionário e não apresenta opções exclusivas do Admin ou do Leitor

#### Scenario: Admin acessa o menu
- **WHEN** um operador `ADMIN` inicia ou retoma uma sessão válida
- **THEN** a interface apresenta o menu principal de operador e a área administrativa

#### Scenario: Sessão ausente ou expirada
- **WHEN** um usuário abre uma área autenticada sem sessão válida
- **THEN** a interface não exibe seu conteúdo e o encaminha para autenticação

### Requirement: Menu principal preserva tarefas de atendimento
A interface SHALL agrupar no menu principal as tarefas disponíveis para Funcionário e Admin, preservando o acesso às telas funcionais existentes de livros, leitores, empréstimos e multas.

#### Scenario: Acesso a livros existentes
- **WHEN** um Funcionário ou Admin seleciona cadastro ou consulta de livros
- **THEN** a interface abre o fluxo atual de acervo com suas operações e integração existentes

#### Scenario: Acesso a leitores existentes
- **WHEN** um Funcionário ou Admin seleciona cadastro ou consulta de leitores
- **THEN** a interface abre o fluxo atual correspondente sem remover suas operações

#### Scenario: Empréstimos e multas ainda indisponíveis
- **WHEN** um operador seleciona empréstimos ou multas antes da implementação dessas funcionalidades
- **THEN** a interface apresenta uma tela identificada como “Em breve” e não simula nem envia operações ao backend

#### Scenario: Empréstimos e multas disponíveis
- **WHEN** um operador seleciona empréstimos ou multas após a implementação dessas funcionalidades
- **THEN** a interface abre os fluxos funcionais de balcão para criar, consultar, renovar, devolver empréstimos e visualizar multas

### Requirement: Área administrativa é exclusiva de Admin
A interface SHALL exibir a área administrativa somente para `ADMIN`, preservando a gestão funcional de gêneros e identificando como “Em breve” as operações administrativas ainda não implementadas.

#### Scenario: Admin acessa gêneros
- **WHEN** um Admin seleciona a gestão de gêneros
- **THEN** a interface abre a gestão funcional existente

#### Scenario: Admin acessa recurso futuro
- **WHEN** um Admin seleciona exclusão de livros ou dashboard antes da implementação
- **THEN** a interface apresenta uma tela identificada como “Em breve” sem simular exclusão nem apresentar indicadores fictícios

#### Scenario: Funcionário tenta abrir área administrativa
- **WHEN** um Funcionário tenta abrir uma opção administrativa por navegação direta ou por URL
- **THEN** a interface bloqueia a opção e não executa operação administrativa

### Requirement: Portal do Leitor permanece separado da sessão de operador
A interface SHALL manter as opções do Portal do Leitor indisponíveis para sessões de Funcionário/Admin e SHALL deixar sua navegação para uma change futura que implemente autenticação própria para leitores.

#### Scenario: Operador abre o menu
- **WHEN** um Funcionário ou Admin abre o menu
- **THEN** a interface não apresenta nem concede acesso às opções do Portal do Leitor

#### Scenario: Menu de leitores ainda não implementado
- **WHEN** a autenticação própria de leitores ainda não está disponível
- **THEN** a navegação de operador não oferece acesso ao Portal do Leitor nem reutiliza credenciais ou sessão de Funcionário/Admin

### Requirement: Telas futuras informam sua indisponibilidade
A interface SHALL identificar recursos ainda não implementados com uma mensagem textual de construção ou disponibilidade futura e SHALL oferecer um caminho claro para retornar à navegação.

#### Scenario: Usuário abre uma opção futura
- **WHEN** um usuário autorizado abre um recurso marcado como futuro
- **THEN** a tela informa que a funcionalidade está em construção e disponibiliza uma ação de retorno, sem executar chamadas de negócio

#### Scenario: Acesso por teclado e tecnologia assistiva
- **WHEN** um usuário navega pelo menu ou por uma tela futura usando teclado ou tecnologia assistiva
- **THEN** os nomes das áreas, o estado “Em breve” e as ações de navegação permanecem identificáveis e operáveis sem depender apenas de cor

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
