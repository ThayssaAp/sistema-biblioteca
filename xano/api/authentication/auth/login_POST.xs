// Authenticate an operator by employee registration number and password
query "auth/login" verb=POST {
  api_group = "Authentication"

  input {
    text matricula? filters=trim
    text password?
  }

  stack {
    precondition ($input.matricula != null && $input.matricula != "" && $input.password != null && $input.password != "") {
      error_type = "accessdenied"
      error = "Matrícula ou senha inválida."
    }

    // Look up only the fields needed to authenticate and identify the operator.
    db.get user {
      field_name = "matricula"
      field_value = $input.matricula
      output = [
        "id"
        "name"
        "matricula"
        "password"
        "role"
        "account_id"
      ]
    } as $user
  
    // Keep failures indistinguishable to avoid disclosing registered matriculas.
    precondition ($user != null) {
      error_type = "accessdenied"
      error = "Matrícula ou senha inválida."
    }
  
    security.check_password {
      text_password = $input.password
      hash_password = $user.password
    } as $pass_result
  
    precondition ($pass_result) {
      error_type = "accessdenied"
      error = "Matrícula ou senha inválida."
    }

    precondition ($user.role == "FUNCIONARIO" || $user.role == "ADMIN") {
      error_type = "accessdenied"
      error = "Matrícula ou senha inválida."
    }
  
    security.create_auth_token {
      table = "user"
      extras = {}
      expiration = 86400
      id = $user.id
    } as $authToken
  
    function.run "Getting Started Template/create_event_log" {
      input = {
        user_id   : $user.id
        account_id: $user.account_id
        action    : "login"
        metadata  : {
          matricula: $user.matricula
          role     : $user.role
        }
      }
    } as $event_log
  }

  response = {
    authToken: $authToken
    operator : {
      id       : $user.id
      matricula: $user.matricula
      name     : $user.name
      role     : $user.role
    }
  }
  tags = ["biblioteca"]
  guid = "g6E8E2wr8FPWccUg-4Qqxu2csFg"
}