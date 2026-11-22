# Spec Delta

## ADDED Requirements

### Requirement: Leitor autenticado consulta somente os próprios empréstimos
O sistema SHALL permitir que uma sessão válida de leitor consulte seus empréstimos ativos e encerrados, sem aceitar identificador de outro leitor como critério de acesso.

#### Scenario: Consulta de empréstimos do leitor
- **WHEN** leitor autenticado abre a consulta de empréstimos
- **THEN** o sistema retorna somente empréstimos vinculados ao leitor da sessão, com código, livro, retirada, vencimento, devolução e status

#### Scenario: Leitor sem empréstimos
- **WHEN** leitor autenticado não possui empréstimos ativos ou encerrados
- **THEN** o sistema retorna uma lista vazia sem erro

#### Scenario: Token de operador ou sessão ausente
- **WHEN** requisição usa token de operador, token inválido ou não apresenta credencial
- **THEN** o sistema rejeita a consulta e não retorna empréstimos

### Requirement: Consulta do leitor informa vencimento, atraso e multas
A consulta SHALL indicar se cada empréstimo está ativo, devolvido ou atrasado e SHALL incluir a multa vinculada quando existir, sem permitir alteração financeira.

#### Scenario: Empréstimo ativo dentro do prazo
- **WHEN** leitor consulta empréstimo ativo cujo vencimento ainda não chegou
- **THEN** a resposta informa o vencimento e indica que não há atraso

#### Scenario: Empréstimo ativo atrasado
- **WHEN** leitor consulta empréstimo ativo após o vencimento
- **THEN** a resposta indica atraso e informa a multa vinculada quando ela existir

#### Scenario: Histórico com multa resolvida
- **WHEN** leitor consulta empréstimo devolvido que possui multa paga, abonada ou zerada
- **THEN** a resposta mantém o histórico do empréstimo e apresenta a situação da multa sem oferecer pagamento ou abono

### Requirement: Portal apresenta meus empréstimos com estados acessíveis
A interface SHALL oferecer uma tela autenticada de meus empréstimos com estados textuais de carregamento, vazio, sucesso, erro e sessão expirada.

#### Scenario: Leitor abre meus empréstimos
- **WHEN** leitor autenticado seleciona a opção de empréstimos na home do Portal
- **THEN** a interface carrega e apresenta os próprios empréstimos com vencimento, status, atraso e multa quando houver

#### Scenario: Consulta falha
- **WHEN** a API de empréstimos retorna erro que não é de sessão
- **THEN** a interface informa o erro por texto e mantém a navegação disponível

#### Scenario: Sessão expirada durante a consulta
- **WHEN** a API rejeita o token do leitor
- **THEN** a interface limpa a sessão do leitor e redireciona para o login do Portal
