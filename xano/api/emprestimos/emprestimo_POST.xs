// Creates a loan and marks the selected book as borrowed.
query emprestimo verb=POST {
  api_group = "Emprestimos"
  auth = "user"

  input {
    int reader_id
    int book_id
  }

  stack {
    function.run "Getting Started Template/role-based access control" {
      input = {user_id: $auth.id, required_role: "FUNCIONARIO"}
    } as $access

    db.get reader {
      field_name = "id"
      field_value = $input.reader_id
      output = ["id", "cpf", "name", "birth_date"]
    } as $reader

    precondition ($reader != null) {
      error_type = "inputerror"
      error = "Leitor não encontrado."
    }

    db.get book {
      field_name = "id"
      field_value = $input.book_id
      output = ["id", "code", "title", "age_rating", "status", "deleted_at"]
    } as $book

    precondition ($book != null) {
      error_type = "inputerror"
      error = "Exemplar não encontrado."
    }

    precondition ($book.deleted_at == null) {
      error_type = "inputerror"
      error = "Este exemplar foi retirado do acervo."
    }

    precondition ($book.status == "Disponível") {
      error_type = "inputerror"
      error = "Este exemplar não está disponível."
    }

    function.run "Biblioteca/calculate_reader_age" {
      input = {birth_date: $reader.birth_date}
    } as $reader_age

    var $required_age {
      value = 0
    }

    conditional {
      if ($book.age_rating == "Não informada" || $book.age_rating == "18+") {
        var.update $required_age {
          value = 18
        }
      }
    }

    conditional {
      if ($book.age_rating == "10+") {
        var.update $required_age {
          value = 10
        }
      }
    }

    conditional {
      if ($book.age_rating == "12+") {
        var.update $required_age {
          value = 12
        }
      }
    }

    conditional {
      if ($book.age_rating == "14+") {
        var.update $required_age {
          value = 14
        }
      }
    }

    conditional {
      if ($book.age_rating == "16+") {
        var.update $required_age {
          value = 16
        }
      }
    }

    precondition ($reader_age >= $required_age) {
      error_type = "inputerror"
      error = "A faixa etária do exemplar não é compatível com a idade do leitor."
    }

    db.query loan {
      where = $db.loan.reader_id == $reader.id && $db.loan.status == "Ativo"
      return = {type: "list"}
      output = ["id", "due_at"]
    } as $active_loans

    precondition (($active_loans|count) < 2) {
      error_type = "inputerror"
      error = "O leitor já possui o limite de 2 empréstimos ativos."
    }

    db.query fine {
      where = $db.fine.reader_id == $reader.id && $db.fine.status == "Pendente"
      return = {type: "list"}
      output = ["id"]
    } as $pending_fines

    precondition (($pending_fines|count) == 0) {
      error_type = "inputerror"
      error = "O leitor possui multa pendente."
    }

    db.query loan {
      where = $db.loan.reader_id == $reader.id && $db.loan.status == "Ativo" && $db.loan.due_at < now
      return = {type: "list"}
      output = ["id"]
    } as $overdue_loans

    precondition (($overdue_loans|count) == 0) {
      error_type = "inputerror"
      error = "O leitor possui empréstimo em atraso."
    }

    function.run "Biblioteca/calculate_loan_due_date" {
      input = {borrowed_at: now}
    } as $due_at

    db.transaction {
      stack {
        db.add loan {
          data = {
            reader_id: $reader.id
            book_id: $book.id
            operator_id: $auth.id
            borrowed_at: "now"
            due_at: $due_at
            renewal_count: 0
            status: "Ativo"
          }
        } as $new_loan

        precondition ($new_loan.id <= 999999) {
          error_type = "inputerror"
          error = "O limite de códigos de empréstimos foi atingido."
        }

        var $loan_code {
          value = "#EMP%06d"|sprintf:$new_loan.id
        }

        db.edit loan {
          field_name = "id"
          field_value = $new_loan.id
          data = {code: $loan_code}
        } as $loan_with_code

        db.edit book {
          field_name = "id"
          field_value = $book.id
          data = {status: "Emprestado"}
        } as $updated_book
      }
    }

    function.run "Getting Started Template/create_event_log" {
      input = {
        user_id: $auth.id
        action: "loan_create"
        metadata: {
          loan_id: $loan_with_code.id
          book_id: $book.id
          reader_id: $reader.id
        }
      }
    } as $event
  }

  response = {
    id: $loan_with_code.id
    code: $loan_with_code.code
    reader_id: $loan_with_code.reader_id
    book_id: $loan_with_code.book_id
    borrowed_at: $loan_with_code.borrowed_at
    due_at: $loan_with_code.due_at
    renewal_count: $loan_with_code.renewal_count
    status: $loan_with_code.status
  }

  tags = ["biblioteca"]
  guid = "create-loan-2026"
}
