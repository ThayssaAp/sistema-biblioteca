# emprestimos Specification

## Purpose

Permitir que o atendimento de balcão registre, acompanhe e encerre empréstimos de exemplares para leitores, mantendo disponibilidade, prazos, renovações e rastreabilidade coerentes com as regras da biblioteca.

## Requirements

### Requirement: Empréstimos são registrados para leitores e exemplares elegíveis
O sistema SHALL permitir que Funcionário ou Admin crie um empréstimo para um leitor e um exemplar disponível, gerando código sequencial `#EMP000000` e registrando operador, retirada, vencimento e status `Ativo`.

#### Scenario: Empréstimo válido
- **WHEN** operador autenticado seleciona leitor elegível e exemplar `Disponível`
- **THEN** o sistema cria o empréstimo, define vencimento para 7 dias corridos depois, marca o exemplar como `Emprestado` e retorna o código do empréstimo

#### Scenario: Exemplar indisponível
- **WHEN** operador tenta emprestar exemplar com status `Emprestado`
- **THEN** o sistema rejeita a operação e mantém o empréstimo e o status do exemplar inalterados

#### Scenario: Leitor inexistente
- **WHEN** operador informa leitor que não existe
- **THEN** o sistema rejeita a operação sem criar empréstimo

### Requirement: Regras de elegibilidade bloqueiam novos empréstimos
O sistema SHALL impedir novos empréstimos quando o leitor já possuir 2 empréstimos ativos, atraso ou multa pendente, ou quando a faixa etária do exemplar não for compatível com a idade do leitor.

#### Scenario: Limite de empréstimos atingido
- **WHEN** leitor já possui 2 empréstimos ativos e solicita outro exemplar
- **THEN** o sistema rejeita o empréstimo informando o limite atingido

#### Scenario: Leitor com pendência
- **WHEN** leitor possui empréstimo atrasado ou multa pendente
- **THEN** o sistema rejeita novo empréstimo até que a pendência seja resolvida

#### Scenario: Faixa etária incompatível
- **WHEN** idade do leitor é inferior à faixa etária do exemplar
- **THEN** o sistema rejeita o empréstimo e não altera o status do exemplar

#### Scenario: Faixa não informada
- **WHEN** exemplar possui faixa etária `Não informada`
- **THEN** o sistema aplica a regra de faixa `18+` para decidir a elegibilidade

### Requirement: Empréstimos possuem código sequencial não reutilizável
O sistema SHALL gerar códigos únicos no formato `#EMP000000`, com seis dígitos sequenciais, e SHALL não reutilizar códigos de empréstimos encerrados.

#### Scenario: Código gerado no cadastro
- **WHEN** empréstimo é criado com sucesso
- **THEN** o código retornado segue o formato `#EMP000000` e é maior que o último código atribuído

#### Scenario: Código informado pelo cliente
- **WHEN** requisição tenta definir ou substituir o código do empréstimo
- **THEN** o backend ignora ou rejeita o valor e mantém a geração controlada

### Requirement: Devolução encerra empréstimo e libera exemplar
O sistema SHALL permitir que Funcionário ou Admin devolva um empréstimo ativo, registrando data e operador da devolução, mudando o status para `Devolvido` e o exemplar para `Disponível`.

#### Scenario: Devolução no prazo
- **WHEN** operador devolve empréstimo ativo até o vencimento
- **THEN** o sistema encerra o empréstimo sem multa e libera o exemplar

#### Scenario: Empréstimo já devolvido
- **WHEN** operador tenta devolver empréstimo com status `Devolvido`
- **THEN** o sistema rejeita a operação sem criar nova devolução ou alterar o exemplar

### Requirement: Renovação é única e ocorre por mais 7 dias
O sistema SHALL permitir uma única renovação de empréstimo ativo e não atrasado, adicionando 7 dias corridos ao vencimento e registrando a origem da solicitação.

#### Scenario: Renovação válida no balcão
- **WHEN** Funcionário ou Admin solicita renovação de empréstimo ativo dentro do prazo e sem multa do leitor em outro livro
- **THEN** o sistema incrementa a quantidade de renovações para 1 e estende o vencimento em 7 dias corridos

#### Scenario: Segunda renovação
- **WHEN** empréstimo já possui uma renovação
- **THEN** o sistema rejeita nova renovação e mantém o vencimento

#### Scenario: Renovação após vencimento
- **WHEN** operador solicita renovação de empréstimo atrasado
- **THEN** o sistema rejeita a renovação e mantém o empréstimo inalterado

#### Scenario: Multa em outro livro
- **WHEN** leitor possui multa pendente em outro empréstimo
- **THEN** o sistema rejeita a renovação solicitada e informa o bloqueio

### Requirement: Consulta de empréstimos retorna situação operacional
O sistema SHALL permitir a Funcionários e Admins consultar empréstimos por código, leitor, exemplar e status, retornando datas, renovação, atraso, multa e responsáveis sem expor credenciais.

#### Scenario: Consulta de ativos
- **WHEN** operador consulta empréstimos ativos
- **THEN** o sistema retorna os empréstimos ativos com código, leitor, exemplar, retirada, vencimento e indicação de atraso

#### Scenario: Consulta por código
- **WHEN** operador consulta código válido de empréstimo
- **THEN** o sistema retorna somente o empréstimo correspondente ou lista vazia quando não existir

#### Scenario: Consulta sem autenticação
- **WHEN** requisição de consulta não apresenta credencial válida de operador
- **THEN** o sistema rejeita o acesso sem retornar dados

### Requirement: Eventos de empréstimo preservam rastreabilidade
O sistema SHALL registrar operador, data e hora e ação para criação, devolução e renovação, sem registrar senha, token ou dados pessoais desnecessários.

#### Scenario: Ação registrada
- **WHEN** empréstimo é criado, devolvido ou renovado
- **THEN** evento de auditoria identifica ação, empréstimo, exemplar e operador responsável

### Requirement: Interface do balcão executa o fluxo de empréstimos
A interface SHALL oferecer telas acessíveis para criar, consultar, renovar e devolver empréstimos, com estados textuais de carregamento, sucesso, vazio e erro, exigindo sessão válida.

#### Scenario: Criação pela interface
- **WHEN** operador preenche leitor e exemplar elegíveis e confirma
- **THEN** a interface exibe confirmação com código e vencimento do empréstimo

#### Scenario: Bloqueio de negócio
- **WHEN** backend rejeita a operação por limite, atraso, multa, faixa etária ou indisponibilidade
- **THEN** a interface apresenta a razão em texto compreensível e não simula sucesso

#### Scenario: Sessão expirada
- **WHEN** API rejeita a sessão durante o fluxo
- **THEN** a interface limpa a sessão local e redireciona para o login
