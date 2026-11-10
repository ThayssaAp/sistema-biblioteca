# consulta-acervo-leitor Specification

## Purpose

Permitir que leitores autenticados consultem o acervo da biblioteca em modo
somente leitura, encontrando livros por título, gênero, disponibilidade e
classificação etária sem acessar operações administrativas.

## Requirements

### Requirement: Leitor autenticado pode consultar o acervo
O sistema SHALL permitir que um leitor com sessão válida consulte livros e filtre os resultados por título, gênero, disponibilidade e classificação etária.

#### Scenario: Consulta sem filtros
- **WHEN** um leitor autenticado abre a consulta sem filtros
- **THEN** o sistema retorna livros com título, código, gênero, classificação etária e status de disponibilidade

#### Scenario: Consulta com filtros
- **WHEN** um leitor autenticado informa um ou mais filtros suportados
- **THEN** o sistema retorna somente livros que correspondem a todos os filtros informados

#### Scenario: Consulta sem sessão de leitor
- **WHEN** uma requisição de consulta não apresenta uma sessão válida de leitor
- **THEN** o backend rejeita o acesso e não retorna livros

### Requirement: Consulta do leitor não permite operações administrativas
O acesso do leitor ao acervo SHALL ser somente leitura e SHALL impedir cadastro, edição, exclusão, gestão de gêneros, reserva e solicitação de empréstimo.

#### Scenario: Leitor tenta executar operação administrativa
- **WHEN** uma requisição do leitor tenta cadastrar, editar ou excluir um livro ou gênero
- **THEN** o backend rejeita a operação por falta de permissão

#### Scenario: Leitor consulta livro
- **WHEN** um leitor consulta um livro
- **THEN** o sistema retorna somente os dados públicos do catálogo e não altera o acervo

### Requirement: Interface do leitor apresenta resultados acessíveis
A interface SHALL oferecer filtros com rótulos associados, estados textuais de carregamento, vazio e erro, e SHALL apresentar os resultados sem depender somente de cores.

#### Scenario: Tela de consulta aberta
- **WHEN** um leitor autenticado abre a tela de consulta
- **THEN** a interface carrega gêneros, apresenta os filtros e exibe os livros retornados

#### Scenario: Nenhum livro encontrado
- **WHEN** os filtros não correspondem a nenhum livro
- **THEN** a interface exibe uma mensagem textual informando que nenhum livro foi encontrado

#### Scenario: Sessão expirada
- **WHEN** a API rejeita a sessão do leitor durante a consulta
- **THEN** a interface limpa a sessão e encaminha o leitor para o login do portal
