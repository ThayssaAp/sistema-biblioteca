# Spec Delta

## MODIFIED Requirements

### Requirement: Área administrativa é exclusiva de Admin
A interface SHALL exibir a área administrativa somente para `ADMIN`, preservando a gestão funcional de gêneros e funcionários e substituindo placeholders pelas operações já implementadas.

#### Scenario: Admin acessa gêneros
- **WHEN** um Admin seleciona a gestão de gêneros
- **THEN** a interface abre a gestão funcional existente

#### Scenario: Admin acessa recurso futuro
- **WHEN** um Admin seleciona o Dashboard ou outro recurso administrativo já implementado
- **THEN** a interface abre a view funcional e não apresenta um indicador falso ou a informação "Em breve"

#### Scenario: Funcionário tenta abrir área administrativa
- **WHEN** um Funcionário tenta abrir uma opção administrativa por navegação direta ou por URL
- **THEN** a interface bloqueia a opção e não executa operação administrativa
