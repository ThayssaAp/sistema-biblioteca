// Stores people who borrow books; readers are not system operators.
table reader {
  auth = false

  schema {
    int id
    timestamp created_at?=now {
      visibility = "private"
    }
    text cpf filters=trim
    text name filters=trim
    date birth_date
    text address filters=trim
    text phone filters=trim
    email? email filters=trim|lower
    int created_by {
      table = "user"
      visibility = "private"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "cpf", op: "asc"}]}
    {type: "btree", field: [{name: "name", op: "asc"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]

  tags = ["biblioteca"]
  guid = "reader-cadastro-consulta"
}
