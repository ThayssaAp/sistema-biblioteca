# Spec Delta

## Purpose

Permitir que um administrador visualize, em uma única tela protegida, os
indicadores agregados necessários para acompanhar leitores, acervo,
empréstimos e multas da biblioteca.

## ADDED Requirements

### Requirement: Dashboard é exclusivo de Admin
O backend SHALL rejeitar consultas ao Dashboard feitas por Funcionários,
Leitores ou requisições sem autenticação válida.

#### Scenario: Admin solicita os indicadores
- **WHEN** um operador autenticado com perfil `ADMIN` solicita o Dashboard
- **THEN** o backend retorna os indicadores agregados sem dados pessoais

#### Scenario: Funcionário solicita os indicadores
- **WHEN** um operador autenticado com perfil `FUNCIONARIO` solicita o Dashboard
- **THEN** o backend rejeita a consulta com acesso negado

#### Scenario: Sessão ausente ou expirada
- **WHEN** uma requisição sem token válido solicita o Dashboard
- **THEN** o backend rejeita a consulta como não autenticada

### Requirement: Dashboard apresenta os indicadores definidos pelo domínio
O Dashboard SHALL apresentar o total de leitores cadastrados, o número de
leitores com empréstimos ativos, a quantidade de livros disponíveis e
emprestados, o número de empréstimos em atraso e o número de multas pendentes.

#### Scenario: Dados disponíveis
- **WHEN** o backend conclui as consultas agregadas
- **THEN** a interface apresenta cada indicador em um cartão com um rótulo
  textual e o respectivo número

#### Scenario: Valor igual a zero
- **WHEN** um indicador agregado não possui registros correspondentes
- **THEN** a interface apresenta o valor zero em vez de ocultar o indicador

#### Scenario: Dados ainda não disponíveis
- **WHEN** o backend ou a rede falha antes de retornar os indicadores
- **THEN** a interface apresenta uma mensagem textual de erro e permite tentar novamente

### Requirement: Indicadores não expõem registros individuais
O Dashboard SHALL devolver apenas contagens agregadas e SHALL não retornar
dados pessoais, nomes, CPF, códigos de empréstimo ou códigos de livros.

#### Scenario: Resposta agregada recebida
- **WHEN** o backend responde à consulta do Dashboard
- **THEN** a resposta contém somente os seis valores numéricos previstos

#### Scenario: Tentativa de adicionar filtros pessoais
- **WHEN** um cliente envia identificadores pessoais ou filtros não previstos
- **THEN** o backend não usa esses dados para retornar registros individuais

### Requirement: Interface do Dashboard é acessível e responsiva
A interface SHALL apresentar os indicadores com layout responsivo, rótulos
textuais, estados de carregamento e erro e SHALL permitir a navegação de
retorno por teclado.

#### Scenario: Admin abre o Dashboard
- **WHEN** um Admin seleciona a opção Dashboard no menu
- **THEN** a interface indica carregamento, consulta os dados e apresenta os indicadores

#### Scenario: Funcionário tenta abrir diretamente o Dashboard
- **WHEN** um Funcionário acessa a rota ou URL do Dashboard
- **THEN** a interface bloqueia o conteúdo administrativo e não solicita os indicadores

#### Scenario: Usuário navega por tecnologia assistiva
- **WHEN** um usuário navega pela tela usando teclado ou tecnologia assistiva
- **THEN** os indicadores possuem nomes identificáveis e a ação de retorno é operável
