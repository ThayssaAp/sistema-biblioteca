// Registers the payment of a pending fine at the service desk.
query "multas/pagamento" verb=POST {
  api_group = "Multas"
  auth = "user"

  input {
    int fine_id
  }

  stack {
    function.run "Getting Started Template/role-based access control" {
      input = {user_id: $auth.id, required_role: "FUNCIONARIO"}
    } as $access

    db.transaction {
      stack {
        db.get fine {
          field_name = "id"
          field_value = $input.fine_id
          output = [
            "id"
            "loan_id"
            "reader_id"
            "overdue_days"
            "amount_cents"
            "generated_at"
            "status"
            "paid_by"
            "paid_at"
          ]
        } as $fine

        precondition ($fine != null) {
          error_type = "notfound"
          error = "Multa não encontrada."
        }

        precondition ($fine.status == "Pendente") {
          error_type = "inputerror"
          error = "A multa não está pendente."
        }

        db.edit fine {
          field_name = "id"
          field_value = $fine.id
          data = {
            status: "Paga"
            paid_by: $auth.id
            paid_at: "now"
          }
        } as $paid_fine

        function.run "Getting Started Template/create_event_log" {
          input = {
            user_id: $auth.id
            action: "fine_paid"
            metadata: {
              fine_id: $fine.id
              loan_id: $fine.loan_id
              reader_id: $fine.reader_id
              amount_cents: $fine.amount_cents
            }
          }
        } as $event
      }
    }
  }

  response = $paid_fine
  tags = ["biblioteca"]
  guid = "pay-fine-2026"
}
