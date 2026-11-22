# Spec Delta

## MODIFIED Requirements

### Requirement: Interface do balcão executa o fluxo de empréstimos
A interface SHALL oferecer telas acessíveis para criar, consultar, renovar e devolver empréstimos, com estados textuais de carregamento, sucesso, vazio e erro, exigindo sessão válida. No formulário de criação, SHALL permitir selecionar leitores e exemplares disponíveis por rótulos legíveis e enviar seus identificadores numéricos nos campos `reader_id` e `book_id`.

#### Scenario: Criação pela interface
- **WHEN** operador preenche leitor e exemplar elegíveis e confirma
- **THEN** a interface exibe confirmação com código e vencimento do empréstimo

#### Scenario: Bloqueio de negócio
- **WHEN** backend rejeita a operação por limite, atraso, multa, faixa etária ou indisponibilidade
- **THEN** a interface apresenta a razão em texto compreensível e não simula sucesso

#### Scenario: Sessão expirada
- **WHEN** API rejeita a sessão durante o fluxo
- **THEN** a interface limpa a sessão local e redireciona para o login

#### Scenario: Opções de leitores e exemplares
- **WHEN** operador abre ou atualiza a tela de empréstimos
- **THEN** a interface carrega leitores e exemplares disponíveis e apresenta cada leitor como `<Nome> — CPF <cpf>` e cada exemplar como `<code || #id> — <title>`

#### Scenario: Pesquisa de opções
- **WHEN** operador pesquisa leitores ou exemplares no formulário
- **THEN** a interface restringe as opções correspondentes sem alterar os filtros de consulta de empréstimos

#### Scenario: Registro preserva o contrato do empréstimo
- **WHEN** operador seleciona leitor e exemplar e registra o empréstimo
- **THEN** a requisição `POST /emprestimo` mantém `reader_id` e `book_id` com os identificadores numéricos selecionados e as opções são atualizadas após o registro
