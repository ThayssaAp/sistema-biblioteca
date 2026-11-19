// Calculates a reader's completed age in the Brasília calendar.
function "Biblioteca/calculate_reader_age" {
  input {
    date birth_date
  }

  stack {
    var $current_year {
      value = (now|format_timestamp:"Y":"America/Sao_Paulo")|to_int
    }
    var $birth_year {
      value = ($input.birth_date|format_timestamp:"Y":"America/Sao_Paulo")|to_int
    }
    var $age {
      value = $current_year - $birth_year
    }
    var $current_month_day {
      value = now|format_timestamp:"m-d":"America/Sao_Paulo"
    }
    var $birth_month_day {
      value = $input.birth_date|format_timestamp:"m-d":"America/Sao_Paulo"
    }

    conditional {
      if ($current_month_day < $birth_month_day) {
        var.update $age {
          value = $age - 1
        }
      }
    }
  }

  response = $age
  tags = ["biblioteca"]
  guid = "calculate-reader-age-2026"
}
