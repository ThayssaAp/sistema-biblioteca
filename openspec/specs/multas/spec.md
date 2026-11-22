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

### Requirement: Interface apresenta multas e bloqueios com clareza
A interface SHALL apresentar o valor e o motivo da multa no fluxo de devolução e na consulta de multas, usando mensagens textuais e estados acessíveis.

#### Scenario: Devolução atrasada na interface
- **WHEN** devolução gera multa
- **THEN** a interface informa dias de atraso, valor e status `Pendente`

#### Scenario: Operação bloqueada por multa
- **WHEN** backend rejeita empréstimo ou renovação por multa pendente
- **THEN** a interface informa o bloqueio e oferece acesso à consulta de multas sem indicar sucesso

### Requirement: Pagamento de multa é restrito ao atendimento autorizado
O sistema SHALL permitir que somente Funcionário ou Admin autenticado registre o pagamento de uma multa.

#### Scenario: Funcionário paga multa pendente
- **WHEN** Funcionário autenticado envia uma multa `Pendente` para pagamento
- **THEN** o sistema autoriza a operação e altera o status para `Paga`

#### Scenario: Leitor tenta pagar multa pelo endpoint do balcão
- **WHEN** uma sessão de Leitor ou uma sessão inválida envia uma solicitação de pagamento
- **THEN** o sistema rejeita a operação sem alterar a multa

### Requirement: Pagamento altera somente multas pendentes
O sistema SHALL aceitar o pagamento apenas quando a multa existir e estiver com status `Pendente`.

#### Scenario: Multa inexistente
- **WHEN** o operador informa um identificador que não corresponde a uma multa
- **THEN** o sistema rejeita a operação e mantém os dados existentes

#### Scenario: Multa já resolvida
- **WHEN** o operador tenta pagar uma multa `Paga`, `Abonada` ou `Zerada`
- **THEN** o sistema rejeita a operação informando que a multa não está pendente

### Requirement: Pagamento preserva o valor e registra auditoria
O sistema SHALL manter o valor original da multa e registrar o operador e a data/hora do pagamento.

#### Scenario: Pagamento confirmado
- **WHEN** o pagamento de uma multa pendente é concluído
- **THEN** a multa permanece com o mesmo `amount_cents`, recebe status `Paga` e registra operador e data/hora da quitação

#### Scenario: Pagamento concorrente
- **WHEN** duas solicitações tentam pagar a mesma multa pendente simultaneamente
- **THEN** somente uma transição é concluída e a outra é rejeitada sem criar novo registro de pagamento

### Requirement: A consulta de multas oferece pagamento no balcão
A interface SHALL apresentar a ação de pagamento somente para multas pendentes e comunicar o resultado da operação em texto acessível.

#### Scenario: Ação para multa pendente
- **WHEN** operador consulta uma multa com status `Pendente`
- **THEN** a interface exibe uma ação de pagamento com confirmação antes do envio

#### Scenario: Pagamento concluído na interface
- **WHEN** o backend confirma o pagamento
- **THEN** a interface informa sucesso, atualiza o status para `Paga` e remove a ação de pagamento daquela multa

#### Scenario: Pagamento rejeitado na interface
- **WHEN** o backend rejeita o pagamento
- **THEN** a interface exibe a mensagem de erro, mantém a multa visível e não simula quitação
