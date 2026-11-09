# Documentação técnica: empréstimos e multas

## Visão geral

As operações de empréstimo são destinadas ao atendimento de balcão. Os endpoints
exigem autenticação e validam no backend o perfil `FUNCIONARIO` ou `ADMIN`.
Valores de multa são armazenados em centavos e nenhum endpoint deste fluxo
recebe ou retorna senhas, tokens ou credenciais.

Base publicada:

`https://x8ki-letl-twmt.n7.xano.io`

Os grupos abaixo são identificados pelos caminhos canônicos atuais do Xano:

- Empréstimos: `api:zM8VQEDN`
- Multas: `api:05S-AQAd`

## Endpoints de empréstimos

### `POST /api:zM8VQEDN/emprestimo`

Cria um empréstimo para um leitor e um exemplar disponível.

Entrada:

```json
{
  "reader_id": 1,
  "book_id": 2
}
```

Regras aplicadas:

- leitor existente;
- exemplar com status `Disponível`;
- máximo de 2 empréstimos ativos;
- ausência de atraso ou multa pendente;
- faixa etária compatível;
- operador com perfil `FUNCIONARIO` ou `ADMIN`.

O endpoint gera o código sequencial `#EMP000000`, calcula o vencimento para
7 dias corridos depois, marca o empréstimo como `Ativo` e o exemplar como
`Emprestado`.

Resposta resumida:

```json
{
  "id": 8,
  "code": "#EMP000008",
  "reader_id": 1,
  "book_id": 2,
  "borrowed_at": 1794260000000,
  "due_at": 1794864800000,
  "renewal_count": 0,
  "status": "Ativo"
}
```

### `GET /api:zM8VQEDN/emprestimos`

Consulta empréstimos com filtros opcionais:

- `loan_code`
- `reader_id`
- `book_id`
- `status` (`Ativo` ou `Devolvido`)

A resposta contém código, leitor, exemplar, datas, renovação e status. O atraso
é interpretado pela interface para empréstimos ativos cujo `due_at` já passou.

### `POST /api:zM8VQEDN/emprestimos/devolucao`

Encerra um empréstimo ativo e libera o exemplar.

Entrada:

```json
{
  "loan_code": "#EMP000008",
  "return_notes": "Devolução no balcão"
}
```

Uma devolução após o vencimento cria uma multa pendente. A operação é rejeitada
se o empréstimo já estiver `Devolvido`.

### `POST /api:zM8VQEDN/emprestimos/renovacao`

Permite uma renovação por mais 7 dias corridos.

Entrada:

```json
{
  "loan_code": "#EMP000008",
  "renewal_source": "Balcão"
}
```

A renovação é rejeitada quando o empréstimo está atrasado, já foi renovado ou
o leitor possui multa pendente em outro empréstimo.

## Endpoints de multas

### `GET /api:05S-AQAd/multas`

Consulta multas com filtros opcionais:

- `reader_id`
- `loan_id`
- `status` (`Pendente`, `Paga`, `Abonada` ou `Zerada`)

Resposta resumida:

```json
[
  {
    "id": 3,
    "loan_id": 8,
    "reader_id": 1,
    "overdue_days": 2,
    "amount_cents": 2000,
    "generated_at": 1794260000000,
    "status": "Pendente",
    "loan_code": "#EMP000008"
  }
]
```

## Tabelas

### `loan`

Campos operacionais principais:

- `code`: identificador único `#EMP000000`;
- `reader_id`, `book_id`, `operator_id`: relações do empréstimo;
- `borrowed_at`, `due_at`, `returned_at`, `renewed_at`: datas;
- `renewal_count` e `renewal_source`: controle da renovação única;
- `status`: `Ativo` ou `Devolvido`;
- `returned_by` e `return_notes`: rastreabilidade da devolução.

Índices únicos e de consulta existem para código, leitor, exemplar, operador,
status e vencimento.

### `fine`

Campos operacionais principais:

- `loan_id` e `reader_id`: vínculos obrigatórios;
- `overdue_days`: dias corridos iniciados de atraso;
- `amount_cents`: R$ 10,00 por dia, ou `1000` centavos;
- `generated_at`: data de geração;
- `status`: `Pendente`, `Paga`, `Abonada` ou `Zerada`.

O índice único por `loan_id` impede a criação de uma segunda multa para a mesma
devolução.

## Validação

Os testes de contrato e fixtures estão em
`xano/tests/emprestimos-multas.test.js` e podem ser executados com:

```bash
node --test xano/tests/emprestimos-multas.test.js
```

O fluxo manual validado no ambiente publicado cobriu criação, consulta,
renovação única, devolução, liberação do exemplar e geração de multa pendente.
