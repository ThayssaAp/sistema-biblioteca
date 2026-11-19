# Spec Delta

## MODIFIED Requirements

### Requirement: Multa é calculada por dias corridos iniciados
O sistema SHALL calcular R$ 10,00 por cada dia corrido iniciado após o vencimento do empréstimo, considerando o fuso de Brasília e sem contar o próprio dia do vencimento. O valor persistido SHALL ser equivalente a `1000` centavos por dia.

#### Scenario: Devolução no vencimento
- **WHEN** empréstimo é devolvido até o fim do dia do vencimento
- **THEN** o sistema registra multa de R$ 0,00

#### Scenario: Um dia de atraso
- **WHEN** empréstimo vencido é devolvido no dia seguinte ao vencimento
- **THEN** o sistema registra multa de R$ 10,00, equivalente a `1000` centavos

#### Scenario: Vários dias de atraso
- **WHEN** empréstimo é devolvido três dias corridos após o vencimento
- **THEN** o sistema registra multa de R$ 30,00, equivalente a `3000` centavos

#### Scenario: Timestamp em milissegundos
- **WHEN** a diferença entre devolução e vencimento é calculada
- **THEN** o sistema interpreta os timestamps na mesma unidade e não transforma frações de dia em centenas de dias de atraso
