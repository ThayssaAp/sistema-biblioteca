# Design

## Context

Consulte [proposal.md](./proposal.md) para a motivação e [specs/autenticacao-operadores/spec.md](./specs/autenticacao-operadores/spec.md) para o contrato funcional. O repositório contém endpoints e tabelas de autenticação do quick-start Xano: a tabela `user` usa e-mail e os perfis `admin`/`member`, o login consulta e-mail, há cadastro público, e os exemplos de senha esquecida usam e-mail. O login de demonstração também encaminha o objeto completo do usuário ao log de eventos. Não existe frontend da biblioteca no repositório.

## Goals / Non-Goals

**Goals:**
- Reutilizar o mecanismo de autenticação do Xano, adaptando-o ao domínio de operadores da biblioteca.
- Garantir que as credenciais e os perfis sejam validados no backend e que logs não armazenem segredos.
- Entregar uma tela de login estática, integrada à API e acessível por teclado e tecnologia assistiva.

**Non-Goals:**
- Criar tela/API de cadastro ou gerenciamento de operadores.
- Implementar recuperação de senha, alteração de senha pelo operador ou fluxo de pagamento.
- Criar a tela principal do balcão ou qualquer funcionalidade de acervo.
- Migrar contas de demonstração para operadores reais sem uma conferência dos dados existentes no workspace Xano.

## Decisions

### Adaptar a tabela de autenticação `user`

Manter `user` como tabela de autenticação Xano, preservando o identificador interno e o mecanismo de tokens existente. Adicionar a matrícula funcional como campo obrigatório e único; adequar os dados de operador previstos no domínio e restringir `role` aos valores `FUNCIONARIO` e `ADMIN`. A senha permanece como campo interno de autenticação gerenciado pelo Xano. Respostas e consultas da aplicação selecionam somente campos públicos, nunca senha, hash ou token dentro do perfil.

**Alternativa considerada:** criar uma tabela de operadores separada. Foi descartada porque exigiria integrar uma identidade customizada ao mecanismo de tokens Xano e duplicaria a identidade que o quick-start já autentica.

Não presumir que e-mails ou perfis `admin`/`member` de demonstração correspondem a operadores reais. Antes de sincronizar a alteração em um workspace com dados, conferir e preservar ou remover esses registros explicitamente; não converter e-mail em matrícula automaticamente.

### Manter os contratos de autenticação e remover fluxos públicos incompatíveis

Adaptar `POST /auth/login` para receber matrícula e senha e `GET /auth/me` para consultar a identidade e o perfil a partir do token atual. O backend valida a senha com as funções de segurança Xano, emite token somente após sucesso e usa uma resposta genérica para matrícula inexistente e senha incorreta. Preservar a expiração de token de 24 horas usada pelo quick-start nesta entrega.

Desativar o cadastro público (`auth/signup`) e os fluxos de recuperação/login por e-mail do quick-start no grupo publicado para a aplicação. Também desativar as rotas de quick-start de criação de conta e alteração de perfil: a primeira atribui `admin` ao próprio chamador e a segunda permite alterar perfis. Essas funções de conta não fazem parte do domínio da biblioteca. Recuperação de senha não é substituída nesta change; credenciais iniciais são provisionadas por processo administrativo no Xano, sem rota pública de bootstrap.

**Alternativa considerada:** manter o cadastro, recuperação por e-mail e gerenciamento de contas/perfis disponíveis ao lado do login por matrícula. Foi descartada porque permitiria criar usuários sem provisionamento autorizado, elevar privilégios e deixar fluxos que não correspondem à identidade ou às informações de contato definidas para operadores.

### Validar perfil usando o registro do operador no backend

Adaptar a função reutilizável de controle de acesso para reconhecer somente `FUNCIONARIO` e `ADMIN`. Endpoints protegidos consultam o operador autenticado e verificam seu perfil no servidor antes de executar a operação; não confiam em perfil informado pelo navegador ou em estado visual da interface. O perfil não é alterável pelo login.

**Alternativa considerada:** controlar permissões apenas escondendo opções da interface. Foi descartada por não proteger chamadas diretas à API.

Os endpoints que ainda consultam o papel administrativo devem comparar com `ADMIN`; atualizar apenas os valores da tabela deixaria essas verificações incompatíveis. A criação de contas e a alteração de perfis do quick-start ficam bloqueadas em vez de reaproveitadas, pois não há necessidade de contas multi-tenant ou gerenciamento de operadores nesta change.

### Fazer auditoria sem guardar credenciais

Manter o registro de login somente com identificador e campos públicos mínimos do operador. Substituir o envio do objeto completo do quick-start ao logger por metadados sanitizados; excluir senha, hash, token e outros campos internos.

### Criar frontend estático e manter token por sessão do navegador

Criar `frontend/login/index.html`, `frontend/login/styles.css`, `frontend/login/app.js` e uma configuração simples da URL base da API em `frontend/login/config.js`. O JavaScript envia JSON à API Xano e encaminha a credencial no cabeçalho de autorização nas consultas protegidas. A URL base é configuração pública da aplicação, nunca um local para segredos.

Guardar o token e o perfil público em `sessionStorage`, removendo-os quando a sessão explícita for encerrada. Essa escolha limita a persistência ao contexto da aba, ao contrário de `localStorage`; não elimina o risco de XSS. A interface usa DOM seguro, não injeta mensagens da API como HTML e mostra um estado autenticado de confirmação, sem inventar uma página de balcão que ainda não existe.

A tela usa a paleta da biblioteca, tipografia Inter com fallback, rótulos associados aos campos, foco inicial na matrícula, mensagens com indicação textual e estados de carregamento/erro. A chamada cross-origin deve ser permitida por configuração CORS do Xano para a origem efetiva da interface.

**Alternativa considerada:** introduzir framework, bundler ou dependência de autenticação no navegador. Foi descartada para manter a stack HTML/CSS/JavaScript puro definida pelo projeto e evitar infraestrutura que a tela única não necessita.

## Risks / Trade-offs

- [Dados de demonstração podem existir no workspace Xano e não ter matrícula] → Conferir os dados antes da sincronização; não fazer conversão automática nem descartar registros sem decisão explícita. O snapshot de scripts não contém registros de tabela; se a inspeção de registros não estiver disponível, bloquear a sincronização até uma revisão no Xano.
- [Rotas de signup e recuperação por e-mail podem continuar publicadas fora do repositório] → Verificar a configuração do workspace Xano e desativá-las no ambiente da aplicação junto com a sincronização dos scripts.
- [Token em armazenamento do navegador é acessível a JavaScript da mesma origem] → Usar `sessionStorage`, evitar HTML dinâmico não confiável e não armazenar senhas; uma política de cookies HttpOnly exigiria arquitetura de sessão diferente.
- [A origem final da interface ainda não está definida e CORS pode bloquear chamadas] → Manter a URL da API configurável e autorizar explicitamente a origem de implantação no Xano antes da validação integrada.
- [Os dados de conta do quick-start podem ser usados por endpoints de demonstração fora do escopo] → Não remover tabelas ou campos compartilhados nesta change sem verificar dependências e dados do workspace.

## Migration Plan

1. Conferir a branch/workspace Xano de destino, os registros existentes em `user` e as rotas de demonstração publicadas; preservar um ponto de retorno antes de sincronizar.
2. Atualizar o modelo de operador e os endpoints Xano, incluindo matrícula única, perfis, senha hash, consulta da identidade, autorização e log sanitizado.
3. Desativar as rotas públicas de cadastro e os fluxos por e-mail incompatíveis; provisionar manualmente o primeiro Admin pelo mecanismo administrativo do Xano.
4. Publicar os arquivos estáticos e configurar a URL base da API e a origem CORS do ambiente.
5. Validar login válido/inválido, perfil retornado, acesso autorizado/negado, ausência de segredos em respostas/logs e interação da tela.

Para rollback, restaurar a versão anterior dos endpoints e do schema Xano pela branch/versão previamente preservada e retirar a tela nova da implantação. Não reabilitar cadastro público ou redefinição por e-mail no ambiente da aplicação como fallback.

## Open Questions

- Qual será a origem/host de implantação da interface? A URL exata poderá ser preenchida na configuração estática e na lista CORS durante a implementação, sem alterar o contrato da API.
