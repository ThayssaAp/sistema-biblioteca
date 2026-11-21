# multas Specification

## Purpose

Calcular e registrar multas de atraso de forma previsível no atendimento de balcão, vinculando cada valor ao empréstimo que o originou e aplicando os bloqueios previstos para leitores com pendências.

## Requirements

### Requirement: Multa é calculada por dias corridos iniciados
O sistema SHALL calcular R$ 10,00 por cada dia corrido iniciado após o vencimento do empréstimo, considerando o fuso de Brasília e sem contar o próprio dia do vencimento. O valor persistido SHALL ser equivalente a `1000` centavos por dia.

#### Scenario: Devolução no vencimento
- **WHEN** empréstimo é devolvido até o fim do dia do vencimento
- **THEN** o sistema registra multa de R$ 0,00

#### Scenario: Um dia de atraso
- **WHEN** empréstimo vencido é devolvido no dia seguinte ao vencimento
- **THEN** o sistema registra multa de R$ 10,00

#### Scenario: Vários dias de atraso
- **WHEN** empréstimo é devolvido três dias corridos após o vencimento
- **THEN** o sistema registra multa de R$ 30,00

#### Scenario: Timestamp em milissegundos
- **WHEN** a diferença entre devolução e vencimento é calculada
- **THEN** o sistema interpreta os timestamps na mesma unidade e não transforma frações de dia em centenas de dias de atraso

### Requirement: Multa é vinculada ao empréstimo e ao leitor
O sistema SHALL registrar uma multa por devolução atrasada, vinculada ao leitor e ao empréstimo, com valor, dias de atraso, data de geração e status `Pendente`.

#### Scenario: Devolução atrasada gera multa
- **WHEN** operador conclui devolução após o vencimento
- **THEN** o sistema cria ou atualiza a multa correspondente como `Pendente` e retorna seu valor

#### Scenario: Devolução sem atraso
- **WHEN** operador conclui devolução dentro do prazo
- **THEN** o sistema não cria multa pendente para o empréstimo

#### Scenario: Devolução repetida
- **WHEN** operador tenta devolver novamente um empréstimo já encerrado
- **THEN** o sistema não cria uma segunda multa

### Requirement: Pendências de multa bloqueiam operações do leitor
O sistema SHALL impedir novo empréstimo e renovação quando o leitor possuir multa `Pendente`, inclusive quando a multa estiver vinculada a outro empréstimo.

#### Scenario: Novo empréstimo com multa pendente
- **WHEN** leitor com multa pendente solicita novo empréstimo
- **THEN** o sistema rejeita a operação e informa que há pendência financeira

#### Scenario: Renovação com multa em outro livro
- **WHEN** leitor solicita renovação e possui multa pendente em outro empréstimo
- **THEN** o sistema rejeita a renovação

#### Scenario: Pendência resolvida
- **WHEN** não existem multas pendentes para o leitor
- **THEN** o sistema não bloqueia a operação por motivo financeiro

### Requirement: Consulta de multas informa a situação do balcão
O sistema SHALL permitir que Funcionário e Admin consultem multas por leitor, empréstimo e status, retornando somente dados necessários ao atendimento e sem expor credenciais.

#### Scenario: Consulta de multas do leitor
- **WHEN** operador consulta multas por CPF de leitor
- **THEN** o sistema retorna multas vinculadas ao leitor com empréstimo, valor, dias de atraso, data e status

#### Scenario: Consulta sem resultados
- **WHEN** leitor não possui multas correspondentes ao filtro
- **THEN** o sistema retorna lista vazia sem erro

#### Scenario: Consulta sem autenticação
- **WHEN** requisição não apresenta credencial válida de operador
- **THEN** o sistema rejeita o acesso sem retornar multas

### Requirement: Interface apresenta multas e bloqueios com clareza
A interface SHALL apresentar o valor e o motivo da multa no fluxo de devolução e na consulta de multas, usando mensagens textuais e estados acessíveis.

#### Scenario: Devolução atrasada na interface
- **WHEN** devolução gera multa
- **THEN** a interface informa dias de atraso, valor e status `Pendente`

#### Scenario: Operação bloqueada por multa
- **WHEN** backend rejeita empréstimo ou renovação por multa pendente
- **THEN** a interface informa o bloqueio e oferece acesso à consulta de multas sem indicar sucesso
