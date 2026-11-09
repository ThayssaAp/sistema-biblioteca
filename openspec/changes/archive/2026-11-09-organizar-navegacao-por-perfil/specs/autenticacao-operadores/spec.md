# Spec Delta

## MODIFIED Requirements

### Requirement: Tela de login permite entrar no sistema
A interface SHALL fornecer uma tela de login em HTML, CSS e JavaScript puro com campos de matrícula e senha, enviando as credenciais à API de autenticação e mostrando o resultado de forma acessível. Após autenticação válida, SHALL apresentar o menu correspondente ao perfil retornado pelo backend sem exigir nova autenticação.

#### Scenario: Login aceito pela API
- **WHEN** o operador preenche matrícula e senha válidas e envia o formulário
- **THEN** a interface apresenta o menu adequado ao perfil e disponibiliza a identidade e o perfil retornados pela API para o fluxo da aplicação

#### Scenario: Login rejeitado pela API
- **WHEN** a API rejeita as credenciais
- **THEN** a interface informa que não foi possível entrar sem distinguir matrícula inexistente de senha incorreta e permite nova tentativa

#### Scenario: Requisição em andamento
- **WHEN** o formulário de login está aguardando resposta da API
- **THEN** a interface indica o estado de carregamento e impede envios duplicados até receber a resposta

#### Scenario: Uso por teclado e tecnologia assistiva
- **WHEN** o operador navega ou envia o formulário sem mouse ou usando tecnologia assistiva
- **THEN** os campos, rótulos, mensagens e ação de envio permanecem identificáveis e operáveis
