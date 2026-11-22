// Admin deactivates another operator without deleting history.
query "admin/operator_deactivate" verb=POST {
  api_group = "Authentication"
  auth = "user"

  input {
    int user_id
    text reason filters=trim
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
    precondition ($input.reason != "") {
      error_type = "inputerror"
      error = "A justificativa é obrigatória."
    }
    precondition (($input.reason|strlen) <= 500) {
      error_type = "inputerror"
      error = "A justificativa deve ter no máximo 500 caracteres."
    }

    db.get user {
      field_name = "id"
      field_value = $input.user_id
      output = ["id", "account_id", "matricula", "name", "role", "active"]
    } as $target_user

    precondition ($target_user != null) {
      error_type = "notfound"
      error = "Operador não encontrado."
    }
    precondition ($target_user.id != $admin_user.id) {
      error_type = "accessdenied"
      error = "Não é possível desativar a própria conta."
    }
    precondition ($target_user.active != false) {
      error_type = "accessdenied"
      error = "O operador já está desativado."
    }
    precondition ($admin_user.account_id == $target_user.account_id) {
      error_type = "accessdenied"
      error = "O administrador só pode desativar operadores da própria conta."
    }

    db.transaction {
      stack {
        db.edit user {
          field_name = "id"
          field_value = $target_user.id
          enforce_hidden_fields = false
          data = {
            active: false
            deactivated_at: "now"
            deactivated_by: $admin_user.id
            deactivation_reason: $input.reason
          }
        } as $deactivated_user

        function.run "Getting Started Template/create_event_log" {
          input = {
            user_id: $admin_user.id
            account_id: $admin_user.account_id
            action: "operator_deactivate"
            metadata: {
              operator_id: $target_user.id
              matricula: $target_user.matricula
              reason: $input.reason
            }
          }
        } as $event
      }
    }
  }

  response = {
    deactivated: true
    user_id: $target_user.id
    matricula: $target_user.matricula
    deactivated_at: $deactivated_user.deactivated_at
  }
  tags = ["biblioteca"]
  guid = "operator-deactivate-admin-2026"
}
