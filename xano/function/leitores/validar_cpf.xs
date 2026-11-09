// Normalizes and validates a Brazilian CPF. Returns only its 11 digits.
function "Leitores/validar_cpf" {
  input {
    text cpf filters=trim
  }

  stack {
    var $normalized {
      value = "/[^0-9]/"|regex_replace:"":$input.cpf
    }
    precondition (($normalized|strlen) == 11) {
      error_type = "inputerror"
      error = "CPF inválido."
    }
    var $n0 { value = (($normalized|substr:0:1)|to_int) }
    var $n1 { value = (($normalized|substr:1:1)|to_int) }
    var $n2 { value = (($normalized|substr:2:1)|to_int) }
    var $n3 { value = (($normalized|substr:3:1)|to_int) }
    var $n4 { value = (($normalized|substr:4:1)|to_int) }
    var $n5 { value = (($normalized|substr:5:1)|to_int) }
    var $n6 { value = (($normalized|substr:6:1)|to_int) }
    var $n7 { value = (($normalized|substr:7:1)|to_int) }
    var $n8 { value = (($normalized|substr:8:1)|to_int) }
    var $n9 { value = (($normalized|substr:9:1)|to_int) }
    var $n10 { value = (($normalized|substr:10:1)|to_int) }
    precondition ($n0 != $n1 || $n0 != $n2 || $n0 != $n3 || $n0 != $n4 || $n0 != $n5 || $n0 != $n6 || $n0 != $n7 || $n0 != $n8 || $n0 != $n9 || $n0 != $n10) {
      error_type = "inputerror"
      error = "CPF inválido."
    }
    var $digit_1 {
      value = (($n0 * 10) + ($n1 * 9) + ($n2 * 8) + ($n3 * 7) + ($n4 * 6) + ($n5 * 5) + ($n6 * 4) + ($n7 * 3) + ($n8 * 2)) % 11
    }
    var $check_1 {
      value = $digit_1 < 2 ? 0 : 11 - $digit_1
    }
    var $digit_2 {
      value = (($n0 * 11) + ($n1 * 10) + ($n2 * 9) + ($n3 * 8) + ($n4 * 7) + ($n5 * 6) + ($n6 * 5) + ($n7 * 4) + ($n8 * 3) + ($check_1 * 2)) % 11
    }
    var $check_2 {
      value = $digit_2 < 2 ? 0 : 11 - $digit_2
    }
    precondition ($check_1 == $n9 && $check_2 == $n10) {
      error_type = "inputerror"
      error = "CPF inválido."
    }
  }

  response = $normalized
  tags = ["biblioteca"]
  guid = "validar-cpf-leitores"
}
