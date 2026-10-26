// Stores operator information and allows operators to authenticate against
table user {
  auth = true

  schema {
    int id
    timestamp created_at?=now {
      visibility = "private"
    }
  
    text name filters=trim
    text matricula filters=trim
    text cpf filters=trim
    text address filters=trim
    text phone filters=trim
    email? email filters=trim|lower
    password? password filters=min:8|minAlpha:1|minDigit:1 {
      visibility = "internal"
    }
  
    // Retained for existing quick-start references; not used for operator authorization.
    int account_id? {
      table = "account"
    }
  
    enum role {
      values = ["FUNCIONARIO", "ADMIN"]
      visibility = "private"
    }
  
    object password_reset? {
      schema {
        password token? {
          visibility = "internal"
        }
      
        timestamp? expiration? {
          visibility = "internal"
        }
      
        bool used? {
          visibility = "internal"
        }
      }
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
    {type: "btree|unique", field: [{name: "matricula", op: "asc"}]}
    {type: "btree|unique", field: [{name: "email", op: "asc"}]}
  ]

  tags = ["biblioteca"]
  guid = "g8tpjso2orFaPgdxKGzuuR66M1k"
}