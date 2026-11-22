# navegacao-perfis Specification

## Purpose
Organizar o acesso autenticado por perfil e garantir que os fluxos entregues do Sistema Balcão, Portal do Leitor e Área Administrativa estejam disponíveis apenas às sessões autorizadas.

## Requirements

### Requirement: Menu principal é exibido para operadores autenticados
A interface SHALL apresentar um menu central após validar a sessão do operador e SHALL usar o perfil retornado pelo backend para determinar as áreas visíveis.

#### Scenario: Funcionário acessa o menu
- **WHEN** um operador `FUNCIONARIO` inicia ou retoma uma sessão válida
- **THEN** a interface apresenta as tarefas de atendimento do Funcionário e não apresenta opções administrativas ou do Portal do Leitor

#### Scenario: Admin acessa o menu
- **WHEN** um operador `ADMIN` inicia ou retoma uma sessão válida
- **THEN** a interface apresenta todas as tarefas do Sistema Balcão e a Área Administrativa

#### Scenario: Sessão ausente ou expirada
- **WHEN** um usuário abre uma área autenticada sem sessão válida
- **THEN** a interface não exibe seu conteúdo e encaminha o usuário para a autenticação correspondente

### Requirement: Menu principal preserva todas as tarefas de atendimento
A interface SHALL agrupar as tarefas disponíveis para Funcionário e Admin: consulta e cadastro de livros, cadastro e consulta de leitores, criação e consulta de empréstimos, devolução e renovação no balcão e consulta ou pagamento de multas.

#### Scenario: Funcionário seleciona uma tarefa de balcão
- **WHEN** o operador seleciona livros, leitores, empréstimos ou multas
- **THEN** a interface abre o fluxo funcional correspondente e mantém a autorização validada pelo backend

### Requirement: Área administrativa é exclusiva de Admin
A interface SHALL exibir a Área Administrativa somente para `ADMIN`, com gestão de gêneros, exclusão lógica de livros, cadastro e manutenção de funcionários e dashboard.

#### Scenario: Admin acessa gêneros
- **WHEN** um Admin seleciona Gêneros
- **THEN** a interface abre a gestão completa de adição, edição e exclusão de gêneros

#### Scenario: Admin acessa funcionários
- **WHEN** um Admin seleciona Funcionários
- **THEN** a interface permite cadastrar, consultar, alterar perfil e desativar operadores

#### Scenario: Admin acessa exclusão de livro
- **WHEN** um Admin seleciona Exclusão de livro
- **THEN** a interface abre o fluxo protegido de exclusão lógica com justificativa

#### Scenario: Admin acessa o dashboard
- **WHEN** um Admin seleciona Dashboard
- **THEN** a interface consulta e apresenta os seis indicadores administrativos agregados

#### Scenario: Funcionário tenta abrir área administrativa
- **WHEN** um Funcionário acessa diretamente uma opção administrativa por navegação ou URL
- **THEN** a interface bloqueia o conteúdo e não executa operações administrativas

### Requirement: Portal do Leitor permanece separado da sessão de operador
A interface SHALL manter os fluxos do Portal do Leitor separados das sessões de Funcionário e Admin.

#### Scenario: Operador abre o menu
- **WHEN** um Funcionário ou Admin abre o menu
- **THEN** a interface não apresenta opções do Portal do Leitor

#### Scenario: Leitor entra no portal
- **WHEN** um leitor seleciona a opção pública do Portal do Leitor
- **THEN** a aplicação abre o login próprio por CPF e senha sem reutilizar credenciais ou tokens de operador

#### Scenario: Leitor autenticado navega pelas telas próprias
- **WHEN** o leitor conclui o login ou a troca de senha
- **THEN** o portal apresenta apenas consulta de livros, próprios empréstimos, vencimentos e multas

### Requirement: Tela inicial oferece seleção explícita de perfil
A aplicação SHALL disponibilizar uma tela pública inicial com os destinos do Leitor e do Funcionário/Admin.

#### Scenario: Usuário abre a entrada da aplicação
- **WHEN** um usuário acessa a tela inicial sem sessão autenticada
- **THEN** a interface apresenta as opções “Sou leitor” e “Sou funcionário”

#### Scenario: Usuário navega por teclado
- **WHEN** o usuário percorre a tela inicial usando teclado ou tecnologia assistiva
- **THEN** cada opção possui nome acessível, foco visível e pode ser acionada sem depender apenas de cor ou ícone

### Requirement: Entrada pública não mistura sessões
A tela inicial SHALL manter sessões de leitor e operador separadas e não SHALL reutilizar ou substituir tokens entre os perfis.

#### Scenario: Usuário retorna à entrada com sessão existente
- **WHEN** um usuário abre a tela inicial enquanto existe uma sessão válida no navegador
- **THEN** a tela preserva a sessão existente e oferece os destinos correspondentes ao seu perfil
