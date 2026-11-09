# Spec Delta

## MODIFIED Requirements

### Requirement: Menu principal preserva tarefas de atendimento
A interface SHALL agrupar no menu principal as tarefas disponíveis para Funcionário e Admin, preservando o acesso às telas funcionais existentes de livros, leitores, empréstimos e multas.

#### Scenario: Acesso a livros existentes
- **WHEN** um Funcionário ou Admin seleciona cadastro ou consulta de livros
- **THEN** a interface abre o fluxo atual de acervo com suas operações e integração existentes

#### Scenario: Acesso a leitores existentes
- **WHEN** um Funcionário ou Admin seleciona cadastro ou consulta de leitores
- **THEN** a interface abre o fluxo atual correspondente sem remover suas operações

#### Scenario: Empréstimos e multas ainda indisponíveis
- **WHEN** um operador acessa uma versão do sistema em que os endpoints de empréstimos e multas ainda não foram publicados
- **THEN** a interface apresenta uma tela identificada como “Em breve” e não simula nem envia operações ao backend

#### Scenario: Empréstimos e multas disponíveis
- **WHEN** um operador seleciona empréstimos ou multas após a implementação dessas funcionalidades
- **THEN** a interface abre os fluxos funcionais de balcão para criar, consultar, renovar, devolver empréstimos e visualizar multas
