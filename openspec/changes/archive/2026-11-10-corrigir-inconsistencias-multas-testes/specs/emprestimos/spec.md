# Spec Delta

## MODIFIED Requirements

### Requirement: Devolução encerra empréstimo e libera exemplar
O sistema SHALL permitir que Funcionário ou Admin devolva um empréstimo ativo, registrando data e operador da devolução, mudando o status para `Devolvido`, liberando o exemplar e calculando eventual atraso com a mesma unidade temporal usada pelos timestamps do empréstimo.

#### Scenario: Devolução no prazo
- **WHEN** operador devolve empréstimo ativo até o vencimento
- **THEN** o sistema encerra o empréstimo sem multa e libera o exemplar

#### Scenario: Empréstimo já devolvido
- **WHEN** operador tenta devolver empréstimo com status `Devolvido`
- **THEN** o sistema rejeita a operação sem criar nova devolução ou alterar o exemplar

#### Scenario: Cópias do endpoint alinhadas
- **WHEN** o fluxo de devolução é executado por qualquer cópia versionada do endpoint
- **THEN** o status, a liberação do exemplar e os dias de atraso seguem o mesmo contrato observável
