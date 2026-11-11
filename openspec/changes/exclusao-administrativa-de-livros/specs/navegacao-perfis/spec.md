# Spec Delta

## MODIFIED Requirements

### Requirement: Área administrativa é exclusiva de Admin
A interface SHALL exibir a área administrativa somente para `ADMIN`, preservando a gestão funcional de gêneros e oferecendo a exclusão de livros por um fluxo funcional e protegido. Recursos administrativos ainda não implementados, como o dashboard, SHALL continuar identificados como “Em breve”.

#### Scenario: Admin acessa gêneros
- **WHEN** um Admin seleciona a gestão de gêneros
- **THEN** a interface abre a gestão funcional existente

#### Scenario: Admin acessa exclusão de livro
- **WHEN** um Admin seleciona exclusão de livro
- **THEN** a interface abre o fluxo de retirada lógica de exemplares

#### Scenario: Admin acessa recurso futuro
- **WHEN** um Admin seleciona o dashboard antes de sua implementação
- **THEN** a interface apresenta uma tela identificada como “Em breve” sem apresentar indicadores fictícios

#### Scenario: Funcionário tenta abrir área administrativa
- **WHEN** um Funcionário tenta abrir uma opção administrativa por navegação direta ou por URL
- **THEN** a interface bloqueia a opção e não executa operação administrativa
