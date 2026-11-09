// Calculates a loan due date using the fixed seven-day calendar period.
function "Biblioteca/calculate_loan_due_date" {
  input {
    timestamp borrowed_at
  }

  stack {
    var $due_at {
      value = $input.borrowed_at|add_secs_to_timestamp:(604800|to_int)
    }
  }

  response = $due_at
  tags = ["biblioteca"]
  guid = "calculate-loan-due-date-2026"
}
