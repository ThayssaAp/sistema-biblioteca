# Design

## Context

Consulte [proposal.md](./proposal.md) para a motivação e as specs [cadastro-leitores](./specs/cadastro-leitores/spec.md) e [consulta-leitores](./specs/consulta-leitores/spec.md) para o contrato funcional. Estado atual do repositório:

- A tabela `user` é a tabela de autenticação Xano dos operadores (`role` restrito a `FUNCIONARIO` e `ADMIN`, matrícula única) e não possui leitores.
- A função `Getting Started Template/role-based access control` compara o perfil do operador com um perfil exigido (`ADMIN` = 2, `FUNCIONARIO` = 1); exigir `FUNCIONARIO` libera os dois perfis.
- O grupo de API `Authentication` (`canonical = "36IocL78"`) atende o login. O frontend de login guarda `biblioteca.authToken` e `biblioteca.operator` em `sessionStorage` e lê a URL da API em `frontend/login/config.js`.
- Os arquivos `.xs` em `xano/` são o espelho do workspace Xano e são sincronizados com `xano workspace pull/push`. Não existe tabela, função ou endpoint de leitores.

## Goals / Non-Goals

**Goals:**
- Modelar o Leitor como entidade própria, com CPF como identificador único e regras validadas no backend.
- Reutilizar o controle de acesso e a auditoria já existentes, sem criar um segundo mecanismo.
- Entregar duas telas estáticas e testáveis, que reaproveitam a sessão do operador.

**Non-Goals:**
- Editar ou excluir leitores, e qualquer regra de empréstimo, limite de livros, multa ou bloqueio por faixa etária (a data de nascimento só é validada e armazenada aqui).
- Cadastro ou gerenciamento de operadores, tela principal do balcão e funcionalidades de acervo.
- Validar CPF consultando serviços externos ou pré-preencher dados por API.

## Decisions

### Tabela própria `reader`, separada de `user`

Criar `xano/table/reader.xs` com `id`, `created_at`, `cpf` (texto, 11 dígitos, índice único), `name`, `birth_date` (`date`), `address`, `phone`, `email` (opcional, minúsculas) e `created_by` (referência ao operador em `user`). A tabela não tem `auth = true`.

**Alternativa considerada:** reaproveitar `user` com um perfil `READER`. Foi descartada porque `user` é a tabela de autenticação, a spec de autenticação restringe `role` a `FUNCIONARIO` e `ADMIN`, e o leitor não acessa o sistema; misturar as entidades exigiria matrícula e senha fictícias e abriria risco de um leitor obter credencial.

### CPF normalizado e validado no backend

O backend remove máscara (qualquer caractere não numérico), exige 11 dígitos, rejeita sequências de dígitos iguais e confere os dois dígitos verificadores, em uma função reutilizável (`Leitores/validar_cpf`) que as próximas changes (empréstimo) poderão chamar. O valor persistido tem somente dígitos. A unicidade é garantida pelo índice único do banco e por uma verificação prévia que devolve erro de conflito legível; em caso de corrida, o índice único prevalece.

A validação no frontend é apenas conveniência de usabilidade; o backend é a fonte da regra.

**Alternativa considerada:** validar só o tamanho. Foi descartada porque o CPF é o identificador do leitor e CPFs inválidos inviabilizariam a busca e o vínculo com empréstimos.

### Novo grupo de API `Leitores` com dois endpoints

Criar o grupo `Leitores` (`xano/api/leitores/leitores.xs`) com `POST /leitores` e `GET /leitores`, ambos com `auth = "user"`. Cada endpoint chama a função de controle de acesso com `FUNCIONARIO` no início da pilha, antes de qualquer leitura ou escrita. O `GET` aceita `cpf`, `nome`, `page` (padrão 1) e `per_page` (padrão 20, máximo 50), ordena por nome e retorna `{items, total, page, per_page}`. O nome é filtrado por "contém" sem diferenciar maiúsculas e minúsculas.

**Alternativa considerada:** colocar os endpoints no grupo `Authentication` ou `Members & Accounts`. Foi descartada por misturar domínios; os endpoints do quick-start de contas pertencem a fluxos desativados.

### Auditoria sem dados pessoais

No cadastro, chamar `create_event_log` com `action = "reader_create"` e metadados contendo apenas o identificador do leitor e do operador. CPF não é gravado nos metadados porque o identificador interno basta para rastrear.

### Frontend estático em `frontend/leitores/`

Criar `cadastro.html`, `consulta.html`, `styles.css`, `app.js` e `config.js`, no mesmo padrão de `frontend/login/`: um módulo `app.js` com funções puras exportadas para teste (`node --test`) e a ligação ao DOM executada só no navegador. O módulo lê o token de `sessionStorage` (`biblioteca.authToken`), envia `Authorization: Bearer`, e redireciona para `../login/index.html` quando não há sessão ou a API responde 401. Dados de leitores existem apenas em memória e no DOM, nunca em `localStorage` ou `sessionStorage`. A consulta decide o filtro pelo texto digitado: só dígitos, pontos e hífen viram `cpf`; o restante vira `nome`.

As telas seguem a paleta (`#F6F3EC`, `#1F5C4D`), Inter como fonte, rótulos associados, foco inicial, mensagens textuais e uma tarefa por tela. `config.js` guarda a URL base do grupo `Leitores`, que é diferente da URL do grupo de login.

**Alternativa considerada:** uma única tela com abas de cadastro e consulta. Foi descartada pela diretriz de uma tarefa principal por tela.

### Acesso às telas a partir do login

Como não existe tela principal do balcão, acrescentar, no estado autenticado de `frontend/login/index.html`, dois links para o cadastro e a consulta de leitores. A alteração é mínima e não muda o contrato de autenticação.

## Risks / Trade-offs

- [O XanoScript pode ter erros de sintaxe, como os que o Language Server já apontou em `login_POST.xs` após um `pull`] → Validar cada arquivo `.xs` com o Xano Developer MCP e o Language Server antes de qualquer sincronização; manter a formatação do repositório.
- [Dados pessoais (CPF, endereço, telefone, nascimento) expostos a quem tiver token] → Restringir a operadores no servidor, não registrar dados pessoais em eventos e não persistir no navegador.
- [Duas requisições simultâneas com o mesmo CPF] → Índice único no banco como garantia final e mensagem de conflito tratada na tela.
- [O novo grupo de API tem URL diferente e exige CORS para a origem da interface] → Configurar a URL em `config.js` e liberar a origem no Xano antes da validação integrada.
- [O workspace Xano pode divergir do repositório] → Antes de sincronizar, rodar `xano workspace push --dry-run` e conferir o `git diff`; a sincronização só ocorre após a validação desta change.

## Migration Plan

1. Validar localmente a sintaxe dos novos `.xs` e executar os testes do frontend.
2. Conferir o workspace de destino e rodar `xano workspace push -d ./xano --dry-run`; revisar o resultado com o `git diff`.
3. Sincronizar com o Xano somente após aprovação, anotar a URL base do novo grupo e atualizar `frontend/leitores/config.js`.
4. Liberar CORS para a origem da interface e executar o teste integrado de cadastro e consulta.

Para rollback, restaurar o estado anterior pelo Git (a change vive na branch `feature/03-cadastro-consulta-leitores`) e remover do Xano o grupo `Leitores`, a tabela `reader` e a função de CPF; não há dados de outras funcionalidades dependentes nesta fase.

## Open Questions

- Qual será a URL base (`canonical`) do grupo `Leitores`? O Xano a define na sincronização e ela entra em `config.js`, sem alterar o contrato da API.
