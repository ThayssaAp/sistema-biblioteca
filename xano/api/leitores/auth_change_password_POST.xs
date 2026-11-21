// Complete a reader's first access and replace the temporary password.
query "auth/change-password" verb=POST {
  api_group = "Leitores"
  auth = "reader"

  input {
    text new_password
    text password_confirmation
  }

  stack {
    precondition ($input.new_password == $input.password_confirmation) {
      error_type = "inputerror"
      error = "As senhas não conferem."
    }
    precondition (("/^.{8,}$/"|regex_matches:$input.new_password) && ("/[A-Za-z]/"|regex_matches:$input.new_password) && ("/[0-9]/"|regex_matches:$input.new_password)) {
      error_type = "inputerror"
      error = "A senha deve ter ao menos 8 caracteres, uma letra e um dígito."
    }
    db.get reader {
      field_name = "id"
      field_value = $auth.id
      output = ["id", "cpf", "name", "password", "first_access"]
    } as $reader
    precondition ($reader != null && $reader.first_access == true) {
      error_type = "accessdenied"
      error = "A troca de senha não está disponível."
    }
    security.check_password {
      text_password = $input.new_password
      hash_password = $reader.password
    } as $same_password
    precondition (!$same_password) {
      error_type = "inputerror"
      error = "A nova senha deve ser diferente da senha temporária."
    }
    db.edit reader {
      field_name = "id"
      field_value = $reader.id
      data = {
        password: $input.new_password
        first_access: false
      }
    } as $updated
    security.create_auth_token {
      table = "reader"
      extras = {}
      expiration = 86400
      id = $reader.id
    } as $authToken
  }

  response = {
    authToken: $authToken
    requiresPasswordChange: false
    reader: {
      id: $reader.id
      cpf: $reader.cpf
      name: $reader.name
    }
  }
  tags = ["biblioteca"]
  guid = "reader-auth-change-password"
}
