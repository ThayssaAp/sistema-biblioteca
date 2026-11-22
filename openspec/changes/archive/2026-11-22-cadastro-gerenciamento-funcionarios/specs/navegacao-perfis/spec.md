# Spec Delta

## MODIFIED Requirements

### Requirement: Área administrativa é exclusiva de Admin
A interface SHALL exibir a área administrativa somente para `ADMIN`, preservando a gestão funcional de gêneros e fornecendo uma opção funcional de gerenciamento de funcionários, enquanto outros recursos administrativos podem continuar identificados como “Em breve”.

#### Scenario: Admin acessa gêneros
- **WHEN** um Admin seleciona a gestão de gêneros
- **THEN** a interface abre a gestão funcional existente

#### Scenario: Admin acessa funcionários
- **WHEN** um Admin seleciona gerenciamento de funcionários
- **THEN** a interface abre o fluxo funcional de cadastro, consulta, perfil e desativação

#### Scenario: Admin acessa recurso futuro
- **WHEN** um Admin seleciona outro recurso administrativo ainda não implementado
- **THEN** a interface apresenta uma tela identificada como “Em breve” sem simular dados ou operações

#### Scenario: Funcionário tenta abrir área administrativa
- **WHEN** um Funcionário tenta abrir uma opção administrativa por navegação direta ou por URL
- **THEN** a interface bloqueia a opção e não executa operação administrativa
