// Stores people who borrow books; readers are not system operators.
table reader {
  auth = true

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
    password? password filters=min:8|minAlpha:1|minDigit:1 {
      visibility = "internal"
    }
    bool first_access?=true
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
    {type: "btree", field: [{name: "first_access", op: "asc"}]}
  ]

  tags = ["biblioteca"]
  guid = "reader-cadastro-consulta"
}
