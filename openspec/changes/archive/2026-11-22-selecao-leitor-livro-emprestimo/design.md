# Design

## Context

A tela já usa JavaScript puro e um cliente isolado para as operações de empréstimo. A configuração existente separa `apiBaseUrl`, `catalogApiBaseUrl` e `operationsApiBaseUrl`; leitores e livros vêm de grupos distintos, enquanto o `POST /emprestimo` continua recebendo IDs numéricos.

## Goals / Non-Goals

**Goals:** selecionar leitor e exemplar por nomes pesquisáveis, mostrar apenas exemplares disponíveis e atualizar as opções junto às operações de atualização do fluxo.

**Non-Goals:** mudar o contrato de empréstimos, filtros de consulta existentes, endpoints, persistência ou qualquer arquivo do Xano.

## Decisions

- Manter `<select name="reader_id">` e `<select name="book_id">` como controles de valor do formulário e associar a cada um uma busca textual que filtra suas opções. Isso preserva `FormData` e a validação nativa, sem dependências.
- Estender o cliente de empréstimos com consultas autenticadas a `GET ${apiBaseUrl}/reader` e `GET ${catalogApiBaseUrl}/books`. Ler `{ readers }` para leitores; aceitar lista de livros direta ou envelopada e filtrar os exemplares por `status === "Disponivel"` ou `available === true`.
- Usar IDs como valores e rótulos textuais definidos no requisito. Construir opções com APIs DOM para tratar dados como texto.
- Carregar referências na entrada da tela de empréstimos e na atualização/registro do empréstimo. Reutilizar os controles atuais de filtros de consulta sem alterá-los.
- Cobrir rotas, autenticação, payload numérico e presença dos controles por testes Node existentes.

## Risks / Trade-offs

- [Disponibilidade pode mudar entre a consulta e o envio] → O backend permanece responsável por validar o exemplar no registro; uma resposta desatualizada não é tratada como autorização.
- [Uma API de referência pode falhar] → Exibir o erro pela mensagem de status já existente e manter o envio condicionado a uma seleção válida.

## Migration Plan

Sem migração de dados ou publicação de backend. Publicar apenas os arquivos de frontend; rollback consiste em restaurar os três arquivos anteriores.
