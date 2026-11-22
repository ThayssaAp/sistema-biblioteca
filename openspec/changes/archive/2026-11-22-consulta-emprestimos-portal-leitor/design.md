# Design

## Context

O Portal do Leitor já possui autenticação própria, troca obrigatória de senha, sessão em `sessionStorage` e consulta pública autenticada do catálogo. O backend de empréstimos existente é orientado ao balcão e usa sessão de operador, portanto a consulta do leitor precisa de uma entrada separada no grupo `Leitores`.

## Goals / Non-Goals

**Goals:**

- Expor uma consulta somente leitura de empréstimos para a sessão do leitor.
- Garantir no servidor que o leitor só veja seus próprios vínculos.
- Apresentar ativos, atrasados e histórico com as multas relacionadas.
- Reutilizar o tratamento de sessão e estados já adotado pelo Portal.

**Non-Goals:**

- Renovar empréstimos nesta change.
- Criar, devolver ou pagar empréstimos e multas pelo Portal.
- Expor consulta de empréstimos para operadores neste endpoint.
- Implementar dashboard ou funcionalidades administrativas.

## Decisions

- Criar endpoint GET no grupo `Leitores` com `auth = "reader"`, derivando `reader_id` da sessão e ignorando qualquer filtro de leitor enviado pelo cliente. Isso evita que a interface controle o escopo de dados.
- Consultar empréstimos por vínculo do leitor e incluir os dados públicos do livro e da multa, sem retornar credenciais, tokens ou dados de outros leitores.
- Calcular a indicação de atraso a partir do status e do vencimento persistidos, mantendo o valor da multa em centavos e seus status de resolução.
- Criar uma tela dedicada ligada à home, em vez de sobrecarregar o catálogo. A interface usará renderização textual segura e os mesmos redirecionamentos de sessão existentes.
- Deixar renovação para uma change posterior, pois ela adicionará mutação, limite de uso e regras de elegibilidade ao Portal.

## Risks / Trade-offs

- [Risco] A consulta pode expor empréstimos de outro leitor se aceitar `reader_id` do cliente. -> Mitigação: usar exclusivamente o identificador da sessão no backend e testar tokens cruzados.
- [Risco] O histórico pode conter joins opcionais de multa ou livro. -> Mitigação: definir saída estável com campos nulos e testar lista vazia e registros sem multa.
- [Risco] A indicação de atraso pode divergir do balcão por fuso horário. -> Mitigação: reutilizar timestamps em milissegundos e a mesma regra de vencimento documentada para o domínio.

## Migration Plan

1. Publicar o endpoint de consulta no grupo `Leitores`.
2. Validar isolamento com tokens de leitor, operador e sessão ausente.
3. Integrar home, tela e cliente do Portal.
4. Executar testes direcionados e smoke test local contra o endpoint publicado.
5. Em rollback, remover o link e a tela sem alterar empréstimos ou multas persistidos.
