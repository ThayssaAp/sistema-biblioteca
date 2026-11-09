// Return the authenticated reader without exposing credentials.
query "auth/me" verb=GET {
  api_group = "Leitores"
  auth = "reader"

  input {
  }

  stack {
    db.get reader {
      field_name = "id"
      field_value = $auth.id
      output = ["id", "cpf", "name", "first_access"]
    } as $reader
    precondition ($reader != null && $reader.first_access == false) {
      error_type = "accessdenied"
      error = "Sessão de leitor inválida."
    }
  }

  response = {
    id: $reader.id
    cpf: $reader.cpf
    name: $reader.name
  }
  tags = ["biblioteca"]
  guid = "reader-auth-me"
}
