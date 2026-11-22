# Spec Delta

## MODIFIED Requirements

### Requirement: Consulta de multas informa a situação do balcão
O sistema SHALL permitir que Funcionário e Admin consultem multas por leitor, empréstimo e status, retornando os dados necessários ao atendimento, incluindo valor, situação e auditoria de pagamento quando disponível, sem expor credenciais.

#### Scenario: Consulta de multas do leitor
- **WHEN** operador consulta multas por CPF de leitor
- **THEN** o sistema retorna multas vinculadas ao leitor com empréstimo, valor, dias de atraso, data, status, operador do pagamento e data/hora do pagamento quando informados

#### Scenario: Consulta sem resultados
- **WHEN** leitor não possui multas correspondentes ao filtro
- **THEN** o sistema retorna lista vazia sem erro

#### Scenario: Consulta sem autenticação
- **WHEN** requisição não apresenta credencial válida de operador
- **THEN** o sistema rejeita o acesso sem retornar multas

#### Scenario: Multa ainda não paga
- **WHEN** operador consulta uma multa com status `Pendente`, `Abonada` ou `Zerada`
- **THEN** o sistema retorna `paid_by` e `paid_at` nulos, sem inventar uma auditoria de pagamento
