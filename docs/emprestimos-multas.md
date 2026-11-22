# Documentação técnica: empréstimos e multas

## Escopo entregue

As operações de empréstimo e multa são parte do Sistema Balcão. Somente Funcionários e Admins autenticados podem criá-las, consultá-las, devolvê-las, renová-las ou registrar pagamentos. O Portal do Leitor pode apenas visualizar seus próprios empréstimos e multas.

Base publicada: `https://x8ki-letl-twmt.n7.xano.io`

Os artefatos locais ficam em `xano/`. Timestamps são armazenados em milissegundos e valores de multa em centavos.

## Regras comuns

- Vencimento: sete dias corridos após retirada ou renovação.
- Renovação: uma única vez, somente no balcão, em empréstimo ativo e não atrasado.
- Elegibilidade: até dois empréstimos ativos, sem atraso ou multa pendente e com faixa etária compatível.
- Devolução: encerra o empréstimo, registra operador e libera o exemplar.
- Multa: R$ 10,00 por dia corrido iniciado após o vencimento.
- Pagamento: somente Funcionário ou Admin pode alterar uma multa `Pendente` para `Paga`.

## Endpoints de empréstimos

### `POST /api:zM8VQEDN/emprestimo`

Cria um empréstimo com o leitor e o exemplar selecionados no balcão.

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
- máximo de dois empréstimos ativos;
- ausência de atraso ou multa pendente;
- faixa etária compatível; e
- operador com perfil `FUNCIONARIO` ou `ADMIN`.

A resposta inclui `code`, `reader_id`, `book_id`, `borrowed_at`, `due_at`, `renewal_count` e `status`.

### `GET /api:zM8VQEDN/emprestimos`

Consulta empréstimos por `loan_code`, `reader_id`, `book_id` e `status` (`Ativo` ou `Devolvido`). A resposta contém leitor, exemplar, datas, renovação, situação de atraso e responsáveis.

### `POST /api:zM8VQEDN/emprestimos/devolucao`

Encerra um empréstimo ativo e libera o exemplar.

Entrada:

```json
{
  "loan_code": "#EMP000008",
  "return_notes": "Devolução no balcão"
}
```

Uma devolução após o vencimento gera multa pendente calculada por dias corridos iniciados.

### `POST /api:zM8VQEDN/emprestimos/renovacao`

Realiza uma renovação no balcão por mais sete dias corridos.

Entrada:

```json
{
  "loan_code": "#EMP000008",
  "renewal_source": "Balcão"
}
```

A renovação é rejeitada quando o empréstimo está atrasado, já foi renovado ou o leitor possui multa pendente em outro empréstimo.

## Endpoints de multas

### `GET /api:05S-AQAd/multas`

Consulta multas por `reader_id`, `loan_id` e `status` (`Pendente`, `Paga`, `Abonada` ou `Zerada`).

A resposta inclui `loan_id`, `reader_id`, `overdue_days`, `amount_cents`, `generated_at`, `status`, `paid_by` e `paid_at`.

### `POST /api:05S-AQAd/multas/pagamento`

Registra no balcão o pagamento de uma multa pendente.

Entrada:

```json
{
  "fine_id": 3
}
```

A operação exige sessão de Funcionário ou Admin, usa o valor persistido e nunca aceita valor enviado pelo cliente. O status passa de `Pendente` para `Paga`, preservando `amount_cents` e registrando `paid_by` e `paid_at`.

## Persistência

### `loan`

Campos principais: `code`, `reader_id`, `book_id`, `operator_id`, `borrowed_at`, `due_at`, `returned_at`, `renewed_at`, `renewal_count`, `renewal_source`, `status`, `returned_by` e `return_notes`.

### `fine`

Campos principais: `loan_id`, `reader_id`, `overdue_days`, `amount_cents`, `generated_at`, `status`, `paid_by` e `paid_at`.

O índice único por `loan_id` evita uma segunda multa para a mesma devolução. O cálculo usa 1000 centavos por dia iniciado e aplica `ceil` à diferença em milissegundos entre devolução e vencimento.

## Validação

Testes locais:

```bash
node --test xano/tests/emprestimos-multas.test.js
```
