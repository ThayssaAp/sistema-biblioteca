query leitores verb=GET {
  api_group = "Leitores"
  auth = "user"

  input {
    text cpf?
    text nome?
    int page?=1
    int per_page?=20
  }

  stack {
    function.run "Getting Started Template/role-based access control" {
      input = {user_id: $auth.id, required_role: "FUNCIONARIO"}
    } as $access
    precondition ($input.page >= 1) {
      error_type = "inputerror"
      error = "O parâmetro page deve ser maior que zero."
    }
    precondition ($input.per_page >= 1 && $input.per_page <= 50) {
      error_type = "inputerror"
      error = "O parâmetro per_page deve estar entre 1 e 50."
    }
    var $cpf_filter {
      value = $input.cpf|regex_replace:"[^0-9]":""
    }
    db.query reader {
      where = (($cpf_filter == null || $cpf_filter == "") || $db.reader.cpf == $cpf_filter) && (($input.nome == null || $input.nome == "") || $db.reader.name contains $input.nome)
      sort = {reader.name: "asc"}
      output = ["id", "cpf", "name", "birth_date", "address", "phone", "email"]
      return = {type: "list", paging: {page: $input.page, per_page: $input.per_page, totals: true}}
    } as $paged
  }

  response = {
    items: $paged.items
    total: $paged.itemsTotal
    page: $input.page
    per_page: $input.per_page
  }
  tags = ["biblioteca"]
  guid = "get-leitores"
}
