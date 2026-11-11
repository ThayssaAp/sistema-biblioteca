// Stores the lifecycle of a book loan at the service desk.
table loan {
  auth = false

  schema {
    int id
    timestamp created_at?=now {
      visibility = "private"
    }

    text code?
    int reader_id {
      table = "reader"
    }

    int book_id {
      table = "book"
    }

    int operator_id {
      table = "user"
    }

    timestamp borrowed_at?=now
    timestamp due_at
    timestamp returned_at?
    timestamp renewed_at?
    int renewal_count?
    text renewal_source?
    enum status {
      values = ["Ativo", "Devolvido"]
    }

    int returned_by?
    text return_notes?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "code", op: "asc"}]}
    {type: "btree", field: [{name: "reader_id", op: "asc"}]}
    {type: "btree", field: [{name: "book_id", op: "asc"}]}
    {type: "btree", field: [{name: "operator_id", op: "asc"}]}
    {type: "btree", field: [{name: "status", op: "asc"}]}
    {type: "btree", field: [{name: "due_at", op: "asc"}]}
  ]

  tags = ["biblioteca"]
  guid = "loan-balcao-2026"
}
