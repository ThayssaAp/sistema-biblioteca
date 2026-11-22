# Design

## Context

O acervo é persistido em `xano/table/book.xs`; `status` distingue `Disponível` de `Emprestado`. A aplicação estática já valida a sessão por `/auth/me`, usa o papel retornado pelo servidor e protege a gestão de gêneros no catálogo. O workspace Xano live contém `loan` e `fine`, embora esses arquivos ainda não estivessem no checkout local; os schemas necessários e a API de criação de empréstimo foram trazidos para o controle de versão. Ver `proposal.md` e os deltas de `acervo-livros` e `navegacao-perfis`.

## Goals / Non-Goals

**Goals:**
- Retirar logicamente exemplares disponíveis sem apagar o registro nem reutilizar seu código.
- Exigir autorização `ADMIN` no endpoint e na navegação da interface.
- Registrar a justificativa e a identidade do operador na mesma operação da retirada.
- Zerar somente multas pendentes ligadas aos empréstimos do exemplar, na mesma transação.
- Impedir que a API de circulação empreste exemplares retirados.

**Non-Goals:**
- Excluir exemplares com empréstimo ativo ou alterar multas pagas/abonadas.
- Implementar o dashboard ou outros fluxos administrativos.

## Decisions

- Usar `deleted_at` como tombstone, com `deleted_by` e `deletion_reason`. Isso preserva chaves e vínculos históricos; exclusão física não é apropriada porque pode apagar referências futuras e comprometer a regra de não reutilizar códigos.
- Criar uma operação `DELETE /books` que receba o identificador do exemplar e justificativa, valide papel Admin, existência, estado não retirado, status `Disponível` e ausência de empréstimo ativo. Na transação, zerar multas pendentes encontradas por empréstimos do exemplar, gravar campos de retirada e registrar auditoria. Não adicionar status `Excluído` ao enum atual, pois a retirada é independente da disponibilidade de empréstimo.
- Filtrar `deleted_at` nulo em `GET /books`; empréstimos futuros também terão de rejeitar tombstones, pois o status preservado pode continuar `Disponível`.
- Validar `deleted_at` na API de criação de empréstimo para evitar que um ID conhecido contorne a filtragem da consulta.
- Incluir o fluxo como uma view dedicada do catálogo, alcançada pelo menu Admin. A view validará `/auth/me`; controles de exclusão não serão renderizados para Funcionário, e o backend continuará sendo a autoridade final.
- Usar confirmação explícita e justificativa em formulário acessível, com resultado textual e conteúdo da API renderizado como texto.

## Risks / Trade-offs

- [A API de empréstimos ainda não existe nesta branch] → A change de circulação deve verificar `deleted_at` antes de abrir empréstimo; não publicar o fluxo de empréstimo sem essa validação.
- [O checkout local estava atrás do workspace live] → Incluir apenas os schemas de circulação e a API de empréstimo necessários; não sincronizar outros arquivos remotos nem registros.
- [Retirada lógica não remove dados do banco] → Consultas comuns filtram tombstones e uma consulta administrativa futura poderá ser necessária para auditoria; o histórico permanece preservado.

## Migration Plan

1. Adicionar os campos opcionais de retirada ao schema do exemplar; registros existentes continuam ativos por terem `deleted_at` nulo.
2. Atualizar a API de empréstimo para rejeitar tombstones e publicar, junto do DELETE, a resolução transacional de multas pendentes.
3. Atualizar `GET /books` e publicar os endpoints antes da interface.
4. Atualizar o catálogo e o menu; verificar Admin, Funcionário, sessão expirada, exemplar disponível, emprestado e já retirado.
5. Reverter removendo a opção de menu e os endpoints alterados; preservar os tombstones, códigos e resoluções de multas já gravados.
