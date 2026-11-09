// Returns an active loan and generates its fine when the return is late.
query "emprestimos/devolucao" verb=POST {
  api_group = "Emprestimos"
  auth = "user"

  input {
    text loan_code filters=trim
    text return_notes? filters=trim
  }

  stack {
    function.run "Getting Started Template/role-based access control" {
      input = {user_id: $auth.id, required_role: "FUNCIONARIO"}
    } as $access

    precondition ("/^#EMP[0-9]{6}$/"|regex_matches:$input.loan_code) {
      error_type = "inputerror"
      error = "Informe o código no formato #EMP000000."
    }

    db.get loan {
      field_name = "code"
      field_value = $input.loan_code
      output = ["id", "code", "reader_id", "book_id", "status", "due_at"]
    } as $loan

    precondition ($loan != null) {
      error_type = "notfound"
      error = "Empréstimo não encontrado."
    }
    precondition ($loan.status == "Ativo") {
      error_type = "inputerror"
      error = "Esse empréstimo já foi devolvido."
    }

    var $returned_at {
      value = now
    }
    var $overdue_days {
      value = 0
    }

    conditional {
      if ($returned_at > $loan.due_at) {
        var.update $overdue_days {
          value = ((($returned_at - $loan.due_at)|to_int) / 86400000)|ceil
        }
      }
    }

    db.edit loan {
      field_name = "id"
      field_value = $loan.id
      data = {
        returned_at: $returned_at
        returned_by: $auth.id
        return_notes: $input.return_notes
        status: "Devolvido"
      }
    } as $returned_loan

    db.edit book {
      field_name = "id"
      field_value = $loan.book_id
      data = {status: "Disponível"}
    } as $book

    conditional {
      if ($overdue_days > 0) {
        function.run "Biblioteca/calculate_fine_amount" {
          input = {overdue_days: $overdue_days}
        } as $fine_amount

        db.add fine {
          data = {
            loan_id: $loan.id
            reader_id: $loan.reader_id
            overdue_days: $overdue_days
            amount_cents: $fine_amount.amount_cents
            generated_at: $returned_at
            status: "Pendente"
          }
        } as $fine
      }
    }

    function.run "Getting Started Template/create_event_log" {
      input = {
        user_id: $auth.id
        action: "loan_returned"
        metadata: {loan_code: $loan.code, overdue_days: $overdue_days}
      }
    } as $event
  }

  response = $returned_loan
  tags = ["biblioteca"]
  guid = "return-loan-2026"
}
