// Lists loans for authenticated service-desk operators.
query emprestimos verb=GET {
  api_group = "Emprestimos"
  auth = "user"

  input {
    text code? filters=trim
    int reader_id?
    int book_id?
    text status? filters=trim
  }

  stack {
    function.run "Getting Started Template/role-based access control" {
      input = {user_id: $auth.id, required_role: "FUNCIONARIO"}
    } as $access

    precondition ($input.code == null || ("/^#EMP[0-9]{6}$/"|regex_matches:$input.code)) {
      error_type = "inputerror"
      error = "Informe o código no formato #EMP000000."
    }
    precondition ($input.status == null || ("/^(Ativo|Devolvido)$/"|regex_matches:$input.status)) {
      error_type = "inputerror"
      error = "Status de empréstimo inválido."
    }

    db.query loan {
      join = {
        reader: {
          table: "reader"
          type: "inner"
          where: $db.loan.reader_id == $db.reader.id
        }
        book: {
          table: "book"
          type: "inner"
          where: $db.loan.book_id == $db.book.id
        }
      }
      eval = {
        reader_cpf: $db.reader.cpf
        reader_name: $db.reader.name
        book_code: $db.book.code
        book_title: $db.book.title
      }
      where = $db.loan.code ==? $input.code && $db.loan.reader_id ==? $input.reader_id && $db.loan.book_id ==? $input.book_id && $db.loan.status ==? $input.status
      sort = {id: "desc"}
      return = {type: "list"}
      output = [
        "id"
        "code"
        "reader_id"
        "reader_cpf"
        "reader_name"
        "book_id"
        "book_code"
        "book_title"
        "operator_id"
        "borrowed_at"
        "due_at"
        "returned_at"
        "renewed_at"
        "renewal_count"
        "renewal_source"
        "status"
      ]
    } as $loans
  }

  response = $loans
  tags = ["biblioteca"]
  guid = "list-loans-2026"
}
