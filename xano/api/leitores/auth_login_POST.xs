// Authenticate a reader with CPF and return a restricted first-access session when needed.
query "auth/login" verb=POST {
  api_group = "Leitores"

  input {
    text cpf filters=trim
    text password?
  }

  stack {
    function.run "Leitores/validar_cpf" {
      input = {cpf: $input.cpf}
    } as $cpf
    db.get reader {
      field_name = "cpf"
      field_value = $cpf
      output = ["id", "cpf", "name", "password", "first_access"]
    } as $reader
    precondition ($reader != null) {
      error_type = "accessdenied"
      error = "CPF ou senha inválida."
    }
    precondition ($reader.password != null) {
      error_type = "accessdenied"
      error = "CPF ou senha inválida."
    }
    security.check_password {
      text_password = $input.password
      hash_password = $reader.password
    } as $pass_result
    precondition ($pass_result) {
      error_type = "accessdenied"
      error = "CPF ou senha inválida."
    }
    security.create_auth_token {
      table = "reader"
      extras = {}
      expiration = 86400
      id = $reader.id
    } as $authToken
  }

  response = {
    authToken: $authToken
    requiresPasswordChange: $reader.first_access == true
    reader: {
      id: $reader.id
      cpf: $reader.cpf
      name: $reader.name
    }
  }
  tags = ["biblioteca"]
  guid = "reader-auth-login"
}
