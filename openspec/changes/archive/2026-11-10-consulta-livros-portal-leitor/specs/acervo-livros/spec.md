# Spec Delta

## MODIFIED Requirements

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
