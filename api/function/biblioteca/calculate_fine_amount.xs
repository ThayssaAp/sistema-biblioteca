// Calculates a fine in cents from completed overdue calendar days.
function "Biblioteca/calculate_fine_amount" {
  input {
    int overdue_days
  }

  stack {
    precondition ($input.overdue_days >= 0) {
      error_type = "inputerror"
      error = "A quantidade de dias de atraso não pode ser negativa."
    }

    var $amount_cents {
      value = $input.overdue_days * 100
    }
  }

  response = {
    overdue_days: $input.overdue_days
    amount_cents: $amount_cents
  }
  tags = ["biblioteca"]
  guid = "calculate-fine-amount-2026"
}
