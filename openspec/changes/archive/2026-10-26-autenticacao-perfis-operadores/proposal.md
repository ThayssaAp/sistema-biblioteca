# Proposal

## Why

O projeto ainda contém apenas o fluxo de autenticação de demonstração do quick-start do Xano, baseado em e-mail e cadastro público, enquanto os operadores da biblioteca devem entrar com matrícula e senha e possuir perfis Funcionário ou Admin. Esta change estabelece a autenticação real e uma tela de login utilizável no balcão, com autorização de perfil aplicada no backend.

## What Changes

- Substituir ou adaptar o modelo e os endpoints de autenticação de demonstração para operadores identificados por matrícula, com senha armazenada por hash.
- Implementar login e recuperação do perfil autenticado por API Xano, sem cadastro público e sem permitir que o cliente escolha ou altere o próprio perfil.
- Aplicar autorização de perfil no servidor/backend; a interface não será considerada mecanismo de segurança.
- Criar a tela de login em HTML, CSS e JavaScript puro, conectada à API, com estados de carregamento e erro e UX consistente com a biblioteca.
- Desativar os fluxos públicos de cadastro e recuperação por e-mail do quick-start enquanto incompatíveis com a autenticação por matrícula, além das rotas de contas e alteração de perfil que não pertencem ao domínio e podem conceder privilégios; eventos de autenticação não devem registrar senhas, hashes ou tokens.
- Provisionar manualmente o primeiro operador Admin por meio do Xano. Cadastro de operadores por tela/API fica fora desta change e poderá ser tratado em mudança posterior.

## Capabilities

### New Capabilities

- `autenticacao-operadores`: autenticação por matrícula e senha, perfis de operador e entrada na aplicação pela tela de login.

### Modified Capabilities

- Nenhuma.

## Impact

- Backend Xano: tabela de usuários do quick-start, endpoints de login/usuário autenticado, lógica reutilizável de controle de acesso e bloqueio das rotas de demonstração incompatíveis com os perfis de operador.
- Frontend: novos arquivos estáticos HTML/CSS/JS para a tela de login; como ainda não existe uma estrutura frontend no repositório, a organização inicial será definida no design desta change.
- Segurança: remover ou desabilitar o cadastro público de demonstração no fluxo de produção; armazenar senhas com hash e validar permissões no servidor.
- Operação inicial: criar o primeiro Admin diretamente no Xano, sem endpoint público de bootstrap.
