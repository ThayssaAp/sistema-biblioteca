# Acervo de Livros Specification

## Purpose

Permitir que operadores registrem exemplares físicos da biblioteca e localizem itens do acervo com rapidez, usando gêneros mantidos pelo catálogo administrativo.

## Requirements

### Requirement: Operadores autenticados podem cadastrar exemplares
O sistema SHALL permitir que operadores autenticados cadastrem exemplares com os dados obrigatórios e opcionais definidos para o acervo, validando-os no backend.

#### Scenario: Cadastro de exemplar válido
- **WHEN** um operador autenticado informa título, gênero existente e faixa etária válidos, com ISBN e ano opcionais válidos
- **THEN** o sistema cria o exemplar com os dados informados e status `Disponível`

#### Scenario: Dados obrigatórios ausentes
- **WHEN** a requisição não informa título, gênero ou faixa etária
- **THEN** o sistema rejeita o cadastro e não cria exemplar

#### Scenario: ISBN informado em formato inválido
- **WHEN** o operador informa ISBN com hífens ou com menos de 10 ou mais de 13 caracteres
- **THEN** o sistema rejeita o cadastro e não cria exemplar

#### Scenario: ISBN com letras e tamanho permitido
- **WHEN** o operador informa ISBN de 10 a 13 caracteres sem hífens, incluindo letras
- **THEN** o sistema aceita o ISBN se os demais dados forem válidos

#### Scenario: Ano inválido
- **WHEN** o operador informa ano que não tenha quatro dígitos ou seja posterior ao ano atual
- **THEN** o sistema rejeita o cadastro e não cria exemplar

#### Scenario: Faixa etária fora das opções permitidas
- **WHEN** o operador informa valor de faixa etária diferente de `Livre`, `10+`, `12+`, `14+`, `16+`, `18+` ou `Não informada`
- **THEN** o sistema rejeita o cadastro e não cria exemplar

#### Scenario: Faixa etária não informada
- **WHEN** o exemplar recebe a faixa etária `Não informada`
- **THEN** o sistema trata o exemplar como restrito a leitores com 18 anos ou mais

#### Scenario: Operador não autenticado
- **WHEN** uma requisição de cadastro não apresenta credencial válida
- **THEN** o sistema rejeita a requisição e não cria exemplar

### Requirement: Código de exemplar é sequencial e não reutilizável
O sistema SHALL atribuir a cada exemplar um código único no formato `#ADS0000`, com quatro dígitos sequenciais, e SHALL nunca reutilizar um código já atribuído.

#### Scenario: Código gerado no cadastro
- **WHEN** um exemplar é cadastrado com sucesso
- **THEN** o sistema atribui automaticamente o próximo código sequencial no formato `#ADS0000`

#### Scenario: Código não pode ser definido pelo cliente
- **WHEN** uma requisição de cadastro tenta informar ou substituir o código do exemplar
- **THEN** o sistema ignora ou rejeita esse valor e preserva a geração controlada pelo backend

#### Scenario: Código não é reutilizado
- **WHEN** um código já atribuído deixa de estar associado a um exemplar
- **THEN** o sistema não atribui esse código a outro exemplar

### Requirement: Operadores autenticados podem consultar e pesquisar o acervo
O sistema SHALL permitir que operadores autenticados consultem exemplares e filtrem os resultados por código, título, gênero e status, e SHALL permitir que leitores autenticados consultem os dados públicos dos exemplares por título, gênero, status e faixa etária.

#### Scenario: Consulta do acervo
- **WHEN** um operador autenticado consulta o acervo sem filtros
- **THEN** o sistema retorna os exemplares com código, título, ISBN quando informado, ano quando informado, gênero, faixa etária e status

#### Scenario: Pesquisa com filtros
- **WHEN** o operador pesquisa o acervo usando um ou mais filtros suportados
- **THEN** o sistema retorna somente exemplares que correspondem aos filtros informados

#### Scenario: Consulta do leitor com filtros públicos
- **WHEN** um leitor autenticado pesquisa por título, gênero, status ou faixa etária
- **THEN** o sistema retorna somente exemplares correspondentes, sem exigir sessão de operador

#### Scenario: Consulta sem autenticação
- **WHEN** uma requisição de consulta não apresenta credencial válida de operador ou sessão válida de leitor
- **THEN** o sistema rejeita o acesso e não retorna exemplares

### Requirement: Interface do acervo permite cadastrar e consultar exemplares
A interface SHALL permitir que operadores autenticados cadastrem, consultem e pesquisem exemplares por meio de fluxos acessíveis e SHALL apresentar os dados retornados pela API sem substituir a autorização do backend.

#### Scenario: Cadastro pela interface
- **WHEN** um operador preenche os dados válidos de um exemplar e confirma o cadastro
- **THEN** a interface envia a solicitação ao backend, informa o resultado com texto acessível e exibe o código atribuído quando houver sucesso

#### Scenario: Gêneros disponíveis no formulário
- **WHEN** um operador autenticado abre o formulário de cadastro de exemplar
- **THEN** a interface carrega e apresenta os gêneros disponíveis no catálogo para seleção

#### Scenario: Consulta e pesquisa pela interface
- **WHEN** o operador abre o acervo ou aplica filtros
- **THEN** a interface apresenta os resultados retornados pelo backend, incluindo status e código em tipografia legível

#### Scenario: Navegação para o acervo após login
- **WHEN** um operador conclui o login com sucesso
- **THEN** a interface apresenta um caminho identificável para abrir o acervo sem solicitar novamente as credenciais enquanto a sessão for válida
