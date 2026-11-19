// Renews an active loan once for another seven calendar days.
query "emprestimos/renovacao" verb=POST {
  api_group = "Emprestimos"
  auth = "user"

  input {
    text loan_code filters=trim
    enum renewal_source {
      values = ["Balcão", "Portal"]
    }
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
      output = ["id", "code", "reader_id", "status", "due_at", "renewal_count"]
    } as $loan

    precondition ($loan != null) {
      error_type = "notfound"
      error = "Empréstimo não encontrado."
    }
    precondition ($loan.status == "Ativo") {
      error_type = "inputerror"
      error = "Somente empréstimos ativos podem ser renovados."
    }
    precondition ($loan.renewal_count == 0) {
      error_type = "inputerror"
      error = "Este empréstimo já foi renovado."
    }
    precondition ($loan.due_at >= now) {
      error_type = "inputerror"
      error = "Empréstimos atrasados não podem ser renovados."
    }

    db.query fine {
      where = $db.fine.reader_id == $loan.reader_id && $db.fine.status == "Pendente" && $db.fine.loan_id != $loan.id
      return = {type: "exists"}
    } as $fine_in_other_loan
    precondition (!$fine_in_other_loan) {
      error_type = "inputerror"
      error = "O leitor possui multa pendente em outro empréstimo."
    }

    function.run "Biblioteca/calculate_loan_due_date" {
      input = {borrowed_at: $loan.due_at}
    } as $new_due_at

    db.edit loan {
      field_name = "id"
      field_value = $loan.id
      data = {
        due_at: $new_due_at
        renewed_at: now
        renewal_count: 1
        renewal_source: $input.renewal_source
      }
    } as $renewed_loan

    function.run "Getting Started Template/create_event_log" {
      input = {
        user_id: $auth.id
        action: "loan_renew"
        metadata: {loan_id: $loan.id, loan_code: $loan.code, renewal_source: $input.renewal_source}
      }
    } as $event
  }

  response = $renewed_loan
  tags = ["biblioteca"]
  guid = "renew-loan-2026"
}
