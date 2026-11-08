# Proposal

## Why

O sistema já autentica operadores (Funcionário e Admin), mas ainda não conhece os leitores, que são as pessoas atendidas no balcão e tomam livros emprestados. O fluxo de empréstimo previsto no escopo v1 depende de um leitor cadastrado com CPF único e data de nascimento (usada na validação de faixa etária). Esta change entrega o cadastro e a consulta de leitores como uma fatia vertical completa: API e banco no Xano e telas em HTML, CSS e JavaScript puro.

## What Changes

- **Backend (Xano):**
  - Criar a tabela própria de leitores (`reader`), separada da tabela `user` dos operadores, com CPF único, nome, data de nascimento, endereço, telefone, e-mail opcional e operador responsável pelo cadastro.
  - Criar a validação de CPF (11 dígitos e dígitos verificadores) como função reutilizável.
  - Criar o endpoint de cadastro de leitores e o endpoint de consulta com filtros por CPF e nome, ordenação por nome e paginação.
  - Validar no servidor que somente operadores autenticados (`FUNCIONARIO` ou `ADMIN`) cadastram e consultam leitores, reutilizando a função de controle de acesso existente.
  - Registrar o operador responsável e um evento de auditoria sem dados pessoais além dos identificadores.
- **Frontend (HTML/CSS/JS puro):**
  - Criar a tela de cadastro de leitores e a tela de consulta de leitores, uma tarefa por tela, com a paleta, a tipografia e as regras de acessibilidade do projeto.
  - Reutilizar a sessão do operador criada pela tela de login (`sessionStorage`); sem sessão, as telas redirecionam para o login.
  - Acrescentar na tela de login autenticada um acesso às telas de leitores, já que ainda não existe a tela principal do balcão.
- **Fora desta change:** edição e exclusão de leitores, cadastro ou gerenciamento de operadores, livros, gêneros, empréstimos, devoluções e multas.

## Capabilities

### New Capabilities

- `cadastro-leitores`: cadastro de leitores identificados unicamente pelo CPF, com validação de dados, controle de acesso por operador autenticado, rastreabilidade e tela de cadastro.
- `consulta-leitores`: busca e listagem paginada de leitores por CPF ou nome, restrita a operadores autenticados, com tela de consulta.

### Modified Capabilities

- Nenhuma. A capacidade `autenticacao-operadores` não muda; esta change apenas consome a identidade e o perfil já definidos nela.

## Impact

- Backend Xano: nova tabela `reader`, nova função de validação de CPF, novo grupo de API para leitores e dois endpoints; reutiliza `Getting Started Template/role-based access control` e `create_event_log`.
- Frontend: nova pasta `frontend/leitores/` com as duas telas e uma pequena alteração no estado autenticado de `frontend/login/`.
- Segurança e privacidade: CPF, endereço, telefone e data de nascimento são dados pessoais; o acesso é restrito a operadores, os logs não os registram e o navegador não os persiste.
- Operação: a sincronização com o workspace Xano e a configuração de CORS para o novo grupo de API acontecem somente após a validação desta change.
