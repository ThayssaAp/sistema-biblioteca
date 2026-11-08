# Spec Delta

## Purpose

Permitir que operadores do balcão localizem leitores cadastrados por CPF ou nome, de forma rápida e restrita a operadores autenticados.

## ADDED Requirements

### Requirement: Consulta de leitores por CPF ou nome
O backend SHALL permitir filtrar leitores por CPF (igualdade, aceitando máscara) e por nome (contém, sem diferenciar maiúsculas e minúsculas) e SHALL aplicar os dois filtros quando ambos forem informados.

#### Scenario: Busca por CPF com máscara
- **WHEN** um operador consulta pelo CPF `529.982.247-25` e esse leitor existe
- **THEN** o backend retorna somente o leitor com o CPF `52998224725`

#### Scenario: Busca por trecho do nome
- **WHEN** um operador consulta por `silva` e existem leitores cujo nome contém "Silva" ou "silva"
- **THEN** o backend retorna todos esses leitores, sem diferenciar maiúsculas e minúsculas

#### Scenario: Busca sem correspondência
- **WHEN** nenhum leitor corresponde aos filtros informados
- **THEN** o backend retorna uma lista vazia com total zero, sem erro

### Requirement: Listagem paginada e ordenada por nome
O backend SHALL retornar os leitores ordenados por nome, paginados (20 por página por padrão, máximo de 50) e com o total de resultados, e SHALL rejeitar parâmetros de paginação inválidos.

#### Scenario: Consulta sem filtros
- **WHEN** um operador consulta sem informar filtros
- **THEN** o backend retorna a primeira página de leitores ordenada por nome, com o total de leitores cadastrados

#### Scenario: Página além do total
- **WHEN** um operador solicita uma página posterior à última
- **THEN** o backend retorna uma lista vazia e mantém o total de resultados

#### Scenario: Tamanho de página acima do máximo
- **WHEN** um operador solicita mais de 50 itens por página
- **THEN** o backend rejeita a requisição indicando o parâmetro inválido

### Requirement: Dados retornados na consulta
A consulta SHALL retornar identificador, CPF, nome, data de nascimento, endereço, telefone e e-mail de cada leitor e SHALL NOT retornar dados de operadores nem campos internos.

#### Scenario: Resposta contém apenas dados do leitor
- **WHEN** o backend retorna um leitor na consulta
- **THEN** o item contém somente os campos de leitor listados e nenhum dado de operador

### Requirement: Consulta restrita a operadores autenticados
O backend SHALL permitir a consulta de leitores somente a operadores autenticados com perfil `FUNCIONARIO` ou `ADMIN`, validando a credencial e o perfil no servidor.

#### Scenario: Requisição sem credencial válida
- **WHEN** uma requisição de consulta não apresenta credencial válida
- **THEN** o backend rejeita o acesso e não retorna dados de leitores

#### Scenario: Funcionário e Admin consultam
- **WHEN** um operador autenticado com perfil `FUNCIONARIO` ou `ADMIN` consulta leitores
- **THEN** o backend retorna o resultado da consulta

### Requirement: Tela de consulta de leitores
A interface SHALL oferecer uma tela dedicada à consulta, utilizável por teclado, com um campo de busca por CPF ou nome, foco inicial nesse campo, resultados em tabela com cabeçalhos, paginação e estados textuais de carregamento, vazio e erro, exigindo sessão de operador ativa.

#### Scenario: Busca por nome
- **WHEN** o operador digita um nome e envia a busca
- **THEN** a tela exibe os leitores encontrados em uma tabela com CPF, nome, data de nascimento, endereço, telefone e e-mail

#### Scenario: Texto de busca interpretado como CPF
- **WHEN** o texto digitado contém apenas dígitos, pontos e hífen
- **THEN** a tela consulta pelo CPF; caso contrário, consulta pelo nome

#### Scenario: Nenhum leitor encontrado
- **WHEN** a consulta retorna uma lista vazia
- **THEN** a tela exibe a mensagem "Nenhum leitor encontrado."

#### Scenario: Credencial expirada
- **WHEN** a API rejeita a credencial durante a consulta
- **THEN** a tela encerra a sessão local e redireciona para a tela de login

#### Scenario: Dados pessoais não persistidos no navegador
- **WHEN** a tela exibe leitores encontrados
- **THEN** nenhum dado de leitor é gravado em `localStorage` ou `sessionStorage`
