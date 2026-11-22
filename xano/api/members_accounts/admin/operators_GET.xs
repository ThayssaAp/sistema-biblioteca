// Admin lists internal operators with public fields and pagination.
query "admin/operators" verb=GET {
  api_group = "Authentication"
  auth = "user"

  input {
    text matricula?
    text name?
    text role?
    int page?=1
    int per_page?=20
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
    precondition ($input.page >= 1) {
      error_type = "inputerror"
      error = "O parâmetro page deve ser maior que zero."
    }
    precondition ($input.per_page >= 1 && $input.per_page <= 50) {
      error_type = "inputerror"
      error = "O parâmetro per_page deve estar entre 1 e 50."
    }
    precondition ($input.role == null || $input.role == "" || $input.role == "FUNCIONARIO" || $input.role == "ADMIN") {
      error_type = "inputerror"
      error = "Perfil inválido."
    }

    db.query user {
      where = $db.user.account_id == $admin_user.account_id && (($input.matricula == null || $input.matricula == "") || $db.user.matricula includes $input.matricula) && (($input.name == null || $input.name == "") || $db.user.name includes $input.name) && (($input.role == null || $input.role == "") || $db.user.role == $input.role)
      sort = {name: "asc"}
      output = ["curPage", "nextPage", "itemsTotal", "perPage", "items.id", "items.matricula", "items.name", "items.cpf", "items.address", "items.phone", "items.email", "items.role", "items.active", "items.deactivated_at"]
      return = {type: "list", paging: {page: $input.page, per_page: $input.per_page, totals: true, metadata: true}}
    } as $paged
  }

  response = {
    items: $paged.items
    total: $paged.itemsTotal
    page: $input.page
    per_page: $input.per_page
  }
  tags = ["biblioteca"]
  guid = "operators-list-admin-2026"
}
