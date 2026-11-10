# Tasks

## 1. Entrada pública e navegação

- [x] 1.1 Criar `frontend/index.html` com as opções acessíveis “Sou leitor” e “Sou funcionário”, verificando os links para `./portal-leitor/` e `./login/`.
- [x] 1.2 Criar o estilo visual da entrada usando a paleta e tipografia do projeto, verificando responsividade, foco visível e leitura sem depender de cor.
- [x] 1.3 Atualizar os links de retorno de `frontend/login/` e `frontend/portal-leitor/` para a tela inicial, verificando que nenhum login ou token é executado pela página pública.

## 2. Testes e integração

- [x] 2.1 Adicionar teste automatizado da tela inicial cobrindo textos, destinos e atributos de acessibilidade, verificando sua aprovação com a suíte Node do frontend.
- [x] 2.2 Executar os testes existentes de login de operador e Portal do Leitor, verificando que os fluxos de autenticação e suas sessões permanecem independentes.
- [x] 2.3 Validar a mudança OpenSpec e a navegação em servidor HTTP local, verificando que os dois destinos são resolvidos sem erro.
