// Admin creates an internal operator account.
query "admin/operators" verb=POST {
  api_group = "Authentication"
  auth = "user"

  input {
    text matricula filters=trim
    text name filters=trim
    text cpf filters=trim
    text address filters=trim
    text phone filters=trim
    email? email filters=trim|lower
    text password
    text role
  }

  stack {
    db.get user {
      field_name = "id"
      field_value = $auth.id
      output = ["id", "account_id", "role", "active"]
    } as $admin_user

    function.run "Getting Started Template/role-based access control" {
      input = {user_id: $admin_user.id, required_role: "ADMIN"}
    } as $role_check

    precondition ($admin_user.active != false) {
      error_type = "accessdenied"
      error = "Sessão inválida."
    }

    precondition ($input.matricula != null && $input.matricula != "") {
      error_type = "inputerror"
      error = "A matrícula é obrigatória."
    }
    precondition ($input.name != null && $input.name != "") {
      error_type = "inputerror"
      error = "O nome é obrigatório."
    }
    precondition ($input.address != null && $input.address != "") {
      error_type = "inputerror"
      error = "O endereço é obrigatório."
    }
    precondition ($input.phone != null && $input.phone != "") {
      error_type = "inputerror"
      error = "O telefone é obrigatório."
    }
    precondition ($input.password != null && $input.password != "") {
      error_type = "inputerror"
      error = "A senha é obrigatória."
    }
    precondition (("/^.{8,}$/"|regex_matches:$input.password) && ("/[A-Za-z]/"|regex_matches:$input.password) && ("/[0-9]/"|regex_matches:$input.password)) {
      error_type = "inputerror"
      error = "A senha deve ter ao menos 8 caracteres, uma letra e um dígito."
    }
    precondition ($input.role == "FUNCIONARIO" || $input.role == "ADMIN") {
      error_type = "inputerror"
      error = "Perfil inválido. Use FUNCIONARIO ou ADMIN."
    }

    function.run "Leitores/validar_cpf" {
      input = {cpf: $input.cpf}
    } as $normalized_cpf

    db.get user {
      field_name = "matricula"
      field_value = $input.matricula
    } as $existing_matricula
    precondition ($existing_matricula == null) {
      error_type = "inputerror"
      error = "Matrícula já cadastrada."
    }

    db.get user {
      field_name = "cpf"
      field_value = $normalized_cpf
    } as $existing_cpf
    precondition ($existing_cpf == null) {
      error_type = "inputerror"
      error = "CPF já cadastrado."
    }

    db.add user {
      enforce_hidden_fields = false
      data = {
        matricula: $input.matricula
        name: $input.name
        cpf: $normalized_cpf
        address: $input.address
        phone: $input.phone
        email: $input.email
        password: $input.password
        role: $input.role
        account_id: $admin_user.account_id
        active: true
      }
    } as $operator

    function.run "Getting Started Template/create_event_log" {
      input = {
        user_id: $admin_user.id
        account_id: $admin_user.account_id
        action: "operator_create"
        metadata: {
          operator_id: $operator.id
          matricula: $operator.matricula
          role: $operator.role
        }
      }
    } as $event
  }

  response = {
    id: $operator.id
    matricula: $operator.matricula
    name: $operator.name
    cpf: $operator.cpf
    address: $operator.address
    phone: $operator.phone
    email: $operator.email
    role: $operator.role
    active: true
  }
  tags = ["biblioteca"]
  guid = "operators-create-admin-2026"
}
