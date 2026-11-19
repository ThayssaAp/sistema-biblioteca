// Retire a book exemplar without deleting its history. Admin only.
query "books" verb=DELETE {
  api_group = "Catalog"
  auth = "user"

  input {
    int book_id
    text reason filters=trim|max:500
  }

  stack {
    db.get user {
      field_name = "id"
      field_value = $auth.id
      output = ["id", "role", "account_id"]
    } as $operator

    function.run "Getting Started Template/role-based access control" {
      input = {user_id: $operator.id, required_role: "ADMIN"}
    } as $role_check

    precondition ($input.reason != "") {
      error_type = "inputerror"
      error = "A justificativa é obrigatória."
    }

    db.get book {
      field_name = "id"
      field_value = $input.book_id
    } as $book

    precondition ($book != null) {
      error_type = "notfound"
      error = "Exemplar não encontrado."
    }

    precondition ($book.deleted_at == null) {
      error_type = "accessdenied"
      error = "O exemplar já foi retirado do acervo."
    }

    db.query loan {
      where = $db.loan.book_id == $book.id && $db.loan.status == "Ativo"
      return = {type: "count"}
    } as $active_loan_count

    precondition ($book.status == "Disponível" && $active_loan_count == 0) {
      error_type = "accessdenied"
      error = "Não é possível retirar um exemplar emprestado."
    }

    db.query fine {
      join = {
        loan: {
          table: "loan"
          type: "inner"
          where: $db.fine.loan_id == $db.loan.id
        }
      }
      where = $db.loan.book_id == $book.id && $db.fine.status == "Pendente"
      return = {type: "list"}
      output = ["id"]
    } as $pending_fines

    db.transaction {
      stack {
        foreach ($pending_fines) {
          each as $fine {
            db.edit fine {
              field_name = "id"
              field_value = $fine.id
              data = {
                status: "Zerada"
                resolved_by: $operator.id
                resolved_at: "now"
                resolution_notes: $input.reason
              }
            } as $resolved_fine
          }
        }

        db.edit book {
          field_name = "id"
          field_value = $book.id
          data = {
            deleted_at: "now"
            deleted_by: $operator.id
            deletion_reason: $input.reason
          }
        } as $retired_book

        function.run "Getting Started Template/create_event_log" {
          input = {
            user_id: $operator.id
            account_id: $operator.account_id
            action: "book_delete"
            metadata: {
              book_id: $retired_book.id
              code: $retired_book.code
              reason: $input.reason
              fines_zeroed: ($pending_fines|count)
            }
          }
        } as $event
      }
    }
  }

  response = {
    deleted: true
    book_id: $retired_book.id
    code: $retired_book.code
    deleted_at: $retired_book.deleted_at
    fines_zeroed: ($pending_fines|count)
  }
  tags = ["biblioteca"]
  guid = "book-delete-admin-2026"
}
