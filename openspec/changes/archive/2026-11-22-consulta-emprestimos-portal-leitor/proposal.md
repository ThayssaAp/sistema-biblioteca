# Proposal

## Why

O Portal do Leitor já autentica usuários e permite consultar o catálogo, mas ainda não mostra os empréstimos associados à própria conta. Sem essa visão, o leitor não consegue acompanhar vencimentos, atrasos, multas ou o histórico de devoluções sem recorrer ao balcão.

## What Changes

- Criar uma consulta autenticada de empréstimos para o Portal do Leitor, filtrada pelo leitor da sessão.
- Exibir empréstimos ativos e histórico de devoluções com código, livro, datas, status e indicação de atraso.
- Exibir multas vinculadas aos empréstimos quando disponíveis, sem permitir pagamento ou alteração pelo leitor.
- Adicionar a navegação da home do Portal para a tela de meus empréstimos.
- Tratar carregamento, lista vazia, erro e sessão expirada com mensagens acessíveis.
- Cobrir isolamento de dados, contrato da API e estados da interface com testes.
- Manter renovação de empréstimos para uma change posterior.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `emprestimos`: permitir consulta somente leitura dos próprios empréstimos por uma sessão autenticada de leitor, incluindo situação de vencimento e multas vinculadas.

## Impact

- Backend Xano: novo endpoint de consulta no grupo `Leitores`, com autenticação `reader` e filtro obrigatório pelo leitor da sessão.
- Frontend: `frontend/portal-leitor/home.html`, `app.js`, nova tela de empréstimos, estilos e configuração do Portal.
- Testes: contratos Xano e testes do Portal do Leitor.
- Fora desta change: renovação, criação/devolução de empréstimo pelo leitor, pagamento ou abono de multas, dashboard e funcionalidades administrativas.
