# Design

## Context

O XanoScript local já contém a tabela `genre`, endpoints autenticados para listar, criar, renomear e remover gêneros, e uma tela do acervo com controles para Admin. A tabela mantém um nome normalizado com índice único; as rotas de mutação chamam a verificação de perfil Admin no servidor. A remoção consulta os exemplares vinculados antes de excluir. O estado local ainda precisa ser comparado ao workspace e à branch reais do Xano antes da publicação.

## Goals / Non-Goals

**Goals:**
- Consolidar a lista de gêneros como fonte única consumida pelos fluxos do acervo.
- Garantir que autenticação e autorização de todas as mutações sejam verificadas no backend.
- Preservar a integridade entre gêneros e exemplares, inclusive sob requisições concorrentes.
- Exibir o CRUD de gêneros de forma acessível e somente para Admin na interface.

**Non-Goals:**
- Alterar dados bibliográficos ou status dos exemplares.
- Implementar empréstimos, devoluções ou regras de multa.
- Importar, renomear em lote ou excluir automaticamente dados já existentes no Xano.

## Decisions

### Manter nome apresentado e chave normalizada

Guardar o nome aparado para exibição e uma forma normalizada para comparação sem distinção entre maiúsculas e minúsculas. Um índice único na chave normalizada é a garantia final contra duplicidade; a validação da API deve fornecer uma mensagem compreensível. Validar também o limite de 80 caracteres no servidor, alinhado ao formulário. Alternativa considerada: validar duplicidade somente na interface ou por consulta prévia, o que permitiria duplicatas em chamadas simultâneas ou diretas à API.

### Aplicar autorização em cada endpoint de mutação

Todas as rotas de criar, renomear e remover devem validar a credencial e o perfil `ADMIN` no backend antes de alterar dados. Ocultar a tela e os controles de gestão para Funcionários melhora a experiência, mas não substitui a autorização. A listagem permanece acessível aos dois perfis autenticados para uso no cadastro e na consulta do acervo.

### Proteger relações antes da remoção

Rejeitar a remoção quando houver exemplares associados, sem apagar ou reatribuir esses exemplares. A verificação de referências e a exclusão devem preservar integridade mesmo quando a criação de um exemplar ocorre simultaneamente; usar a restrição relacional ou o mecanismo transacional disponível no Xano, em vez de depender somente de uma verificação não atômica seguida da exclusão.

### Manter a interface junto ao fluxo do acervo

Usar a área de gêneros existente na tela do catálogo, com campos rotulados, ações por teclado, mensagens textuais, indicação de carregamento/erro e confirmação antes da remoção. Atualizar a lista após cada operação confirmada para que formulários de livros e filtros reflitam os nomes atuais. A interface consome a API autenticada e trata falhas sem apresentar uma operação como concluída.

## Risks / Trade-offs

- [O workspace ou a branch remota do Xano podem divergir dos arquivos locais ou já conter gêneros e exemplares] → Comparar schemas, APIs e dados existentes antes de publicar; preservar backup e pedir confirmação antes de qualquer ação que possa sobrescrever dados.
- [A operação de exclusão pode competir com o cadastro de um exemplar] → Aplicar proteção referencial atômica e validar a concorrência no Xano.
- [A normalização de nomes pode variar entre a validação da API e o índice] → Usar a mesma regra de aparar e converter caixa na criação, renomeação e índice de unicidade.

## Migration Plan

1. Confirmar workspace e branch de destino no Xano e comparar a tabela, endpoints e dados de gêneros existentes com o estado local.
2. Preservar backup do estado remoto e revisar diferenças antes de qualquer sincronização.
3. Publicar ou ajustar a tabela e as rotas somente após confirmação do alvo e da estratégia para dados existentes.
4. Testar listagem com ambos os perfis, CRUD positivo com Admin, negação de Funcionário, duplicidade e bloqueio de remoção com exemplares vinculados.
5. Se necessário reverter, desativar rotas novas e preservar gêneros/exemplares existentes; não remover tabelas ou dados sem confirmar que não haverá perda.
