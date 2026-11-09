# Design

## Context

O repositório já tem autenticação de operadores no Xano e uma tela estática de login em `frontend/login/`. O catálogo de gêneros será mantido por uma change separada; o cadastro de exemplares depende da tabela e da API de listagem de gêneros fornecidas por ela.

## Goals / Non-Goals

**Goals:**
- Adicionar armazenamento e APIs para cadastro e consulta de exemplares, usando o catálogo de gêneros existente.
- Integrar a tela de cadastro e consulta de livros à sessão atual, usando a credencial já armazenada em `sessionStorage`.
- Garantir que a geração de códigos e a autorização de acesso sejam controladas no backend.

**Non-Goals:**
- Criar, renomear ou remover gêneros.
- Implementar atualização ou exclusão de exemplares.
- Implementar empréstimos, devoluções, alterações de status por empréstimo ou multas.
- Publicar a interface em hospedagem; ela continua servida localmente.

## Decisions

### Consumir o catálogo de gêneros mantido separadamente

O exemplar referencia um gênero existente no catálogo cuja tabela, listagem e manutenção são escopo de `gerenciamento-generos`. A tela de cadastro carrega a lista por meio da API autenticada desse catálogo; o backend de livros valida que o gênero informado existe. A change de gêneros precisa estar disponível antes da validação integrada do cadastro de livros. Essa separação evita duplicar operações de manutenção em duas entregas.

### Derivar o código público de um identificador sequencial persistente

Usar o identificador sequencial imutável gerado pelo banco para compor o código público `#ADS0000`, sem aceitar código vindo do cliente. O gerador deve ser seguro para cadastros concorrentes, manter códigos já atribuídos sem reutilização e rejeitar novos cadastros quando não houver mais valores representáveis com quatro dígitos. Alternativa considerada: manter um contador separado, que exigiria sincronização transacional adicional e poderia introduzir duplicidade ou reutilização.

### Validar os dados e o status no backend

As APIs autenticadas validam título, ISBN opcional, ano opcional, faixa etária e gênero existente. O status inicial é atribuído como `Disponível`, sem aceitar sua definição pelo cliente. A interface exibe mensagens acessíveis e não é considerada uma barreira de segurança.

### Manter o frontend estático e integrado à sessão existente

Adicionar telas próprias para cadastro e consulta de livros, mantendo a tela de login como ponto de entrada. Após autenticar, a tela de login oferecerá navegação para o acervo; a tela do acervo validará a sessão usando a URL base de autenticação existente e enviará a credencial nas chamadas protegidas às APIs de livros e de listagem de gêneros. A tela limpa a sessão e encaminha para login quando ela for inválida. A interface exibirá dados da API por texto, preservará teclado e mensagens acessíveis e seguirá a paleta e tipografia definidas pelo projeto. Alternativa considerada: colocar o catálogo dentro da tela de login, o que misturaria tarefas distintas e dificultaria a navegação futura.

### Consultar e filtrar no servidor

Usar uma API de listagem com filtros por código, título, gênero e status, retornando somente os campos públicos necessários ao catálogo. Isso mantém o comportamento consistente e evita depender de carregar todo o acervo no navegador.

## Risks / Trade-offs

- [O workspace remoto pode conter tabelas ou dados de catálogo não representados no repositório local] → Antes de publicar alterações, conferir branch/workspace e existência de tabelas/registros no Xano; preservar o backup exportado e não sobrescrever dados sem revisão.
- [A tela de cadastro depende de a change `gerenciamento-generos` disponibilizar uma lista autenticada de gêneros compatível] → Concluir e validar a API de listagem de gêneros antes do smoke test integrado do cadastro de livros.
- [O limite de quatro dígitos restringe a quantidade de códigos a 9.999] → Rejeitar explicitamente novas inclusões ao atingir o limite; não expandir silenciosamente o formato.
- [Requisições simultâneas podem disputar um código] → Usar o identificador sequencial atômico do banco como fonte do código, não uma busca pelo maior código seguida de incremento.

## Migration Plan

1. Confirmar no Xano o workspace e a branch alvo, verificar se já existem tabelas ou dados equivalentes e confirmar que o catálogo de gêneros da change separada está disponível.
2. Aplicar a tabela e as APIs de exemplares na branch acordada, sem importar ou converter automaticamente registros desconhecidos.
3. Validar cadastro e consulta autenticados, incluindo o consumo da listagem de gêneros, antes de liberar a interface integrada.
4. Se a implantação precisar ser revertida, desativar as novas rotas e reverter alterações de schema somente após confirmar que nenhum dado novo do acervo será perdido.

## Open Questions

Nenhuma.
