// Admin updates another operator's role.
query "admin/user_role" verb=POST {
  api_group = "Authentication"
  auth = "user"

  input {
    int user_id
    text new_role
  }

  stack {
    db.get user {
      field_name = "id"
      field_value = $auth.id
      output = ["id", "account_id", "role"]
    } as $admin_user

    function.run "Getting Started Template/role-based access control" {
      input = {user_id: $admin_user.id, required_role: "ADMIN"}
    } as $role_check

    precondition ($input.new_role == "FUNCIONARIO" || $input.new_role == "ADMIN") {
      error_type = "inputerror"
      error = "Perfil inválido. Use FUNCIONARIO ou ADMIN."
    }

    db.get user {
      field_name = "id"
      field_value = $input.user_id
      output = ["id", "name", "account_id", "role", "active"]
    } as $target_user

    precondition ($target_user != null) {
      error_type = "notfound"
      error = "Operador não encontrado."
    }

    precondition ($target_user.id != $admin_user.id) {
      error_type = "accessdenied"
      error = "Não é possível alterar o perfil da própria conta."
    }

    precondition ($target_user.active != false) {
      error_type = "accessdenied"
      error = "Não é possível alterar o perfil de um operador desativado."
    }

    precondition ($admin_user.account_id == $target_user.account_id) {
      error_type = "accessdenied"
      error = "O administrador só pode alterar operadores da própria conta."
    }

    db.edit user {
      field_name = "id"
      field_value = $input.user_id
      enforce_hidden_fields = false
      data = {role: $input.new_role}
    } as $updated_user

    function.run "Getting Started Template/create_event_log" {
      input = {
        user_id: $admin_user.id
        account_id: $admin_user.account_id
        action: "operator_role_update"
        metadata: {
          operator_id: $target_user.id
          previous_role: $target_user.role
          new_role: $input.new_role
        }
      }
    } as $event_log
  }

  response = {
    id: $updated_user.id
    matricula: $updated_user.matricula
    name: $updated_user.name
    role: $updated_user.role
  }
  tags = ["biblioteca"]
  guid = "operator-role-admin-2026"
}
