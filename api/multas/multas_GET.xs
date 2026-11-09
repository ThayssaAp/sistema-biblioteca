// Lists fines for authenticated service-desk operators.
query multas verb=GET {
  api_group = "Multas"
  auth = "user"

  input {
    int reader_id?
    int loan_id?
    text status? filters=trim
  }

  stack {
    function.run "Getting Started Template/role-based access control" {
      input = {user_id: $auth.id, required_role: "FUNCIONARIO"}
    } as $access

    precondition ($input.status == null || ("/^(Pendente|Paga|Abonada|Zerada)$/"|regex_matches:$input.status)) {
      error_type = "inputerror"
      error = "Status de multa inválido."
    }

    db.query fine {
      join = {
        reader: {
          table: "reader"
          type: "inner"
          where: $db.fine.reader_id == $db.reader.id
        }
        loan: {
          table: "loan"
          type: "inner"
          where: $db.fine.loan_id == $db.loan.id
        }
      }
      eval = {
        reader_cpf: $db.reader.cpf
        reader_name: $db.reader.name
        loan_code: $db.loan.code
        loan_book_id: $db.loan.book_id
      }
      where = $db.fine.reader_id ==? $input.reader_id && $db.fine.loan_id ==? $input.loan_id && $db.fine.status ==? $input.status
      sort = {generated_at: "desc"}
      return = {type: "list"}
      output = ["id" "loan_id" "loan_code" "loan_book_id" "reader_id" "reader_cpf" "reader_name" "overdue_days" "amount_cents" "generated_at" "status" "resolved_by" "resolved_at" "resolution_notes"]
    } as $fines
  }

  response = $fines
  tags = ["biblioteca"]
  guid = "list-fines-2026"
}
