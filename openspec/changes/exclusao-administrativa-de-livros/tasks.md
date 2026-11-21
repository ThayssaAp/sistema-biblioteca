# Tasks

## 1. Backend Xano: retirada lógica de exemplares

- [x] 1.1 Adicionar ao exemplar os campos opcionais `deleted_at`, `deleted_by` e `deletion_reason`; validar o XanoScript e confirmar que exemplares existentes permanecem ativos e que o código não é removido.
- [ ] 1.2 Implementar `DELETE /books` com autorização `ADMIN`, justificativa aparada, bloqueio para empréstimo ativo/retirada repetida, tombstone e auditoria transacionais, e zeramento de multas `Pendente`; atualizar a API de empréstimo para rejeitar tombstones. Validar XanoScript e os cenários de autorização, motivo inválido, livro emprestado, multas zeradas e empréstimo de retirado rejeitado.
- [x] 1.3 Atualizar `GET /books` para excluir tombstones de todos os resultados padrão, mantendo filtros atuais; validar XanoScript e consulta combinada com livros ativos e retirados.

## 2. Interface: fluxo administrativo de exclusão

- [x] 2.1 Substituir o placeholder do menu Admin por uma rota identificável para exclusão no catálogo e proteger a view contra Funcionário e sessão inválida; verificar destinos e acesso direto em testes.
- [x] 2.2 Implementar busca, confirmação acessível, justificativa obrigatória e retorno textual para sucesso/erro; testar chamadas autenticadas, bloqueio de envio duplicado, payload sem HTML e atualização da lista após retirada.
- [x] 2.3 Atualizar README e testes do catálogo/menu para refletir o fluxo funcional, preservando Dashboard, empréstimos e multas como recursos futuros; executar a suíte de testes do frontend.

## 3. Verificação integrada

- [x] 3.1 Executar validação XanoScript de todas as fontes alteradas e testes focados do backend/UI; revisar o diff para confirmar retenção de histórico, autorização no servidor e ausência de dados fictícios.

