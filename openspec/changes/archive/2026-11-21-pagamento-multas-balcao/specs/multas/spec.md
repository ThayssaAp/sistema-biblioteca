# Spec Delta

## ADDED Requirements

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
