query leitores verb=POST {
  api_group = "Leitores"
  auth = "user"

  input {
    text cpf filters=trim
    text name filters=trim
    date birth_date
    text address filters=trim
    text phone filters=trim
    email email? filters=trim|lower
  }

  stack {
    function.run "Getting Started Template/role-based access control" {
      input = {user_id: $auth.id, required_role: "FUNCIONARIO"}
    } as $access
    precondition ($input.name != null && $input.name != "") {
      error_type = "inputerror"
      error = "O nome é obrigatório."
    }
    precondition ($input.address != null && $input.address != "") {
      error_type = "inputerror"
      error = "O endereço é obrigatório."
    }
    precondition ($input.phone != null && $input.phone != "") {
      error_type = "inputerror"
      error = "O telefone é obrigatório."
    }
    precondition ($input.birth_date != null && $input.birth_date <= "now") {
      error_type = "inputerror"
      error = "A data de nascimento deve ser válida e passada."
    }
    function.run "Leitores/validar_cpf" {
      input = {cpf: $input.cpf}
    } as $cpf
    db.get reader {
      field_name = "cpf"
      field_value = $cpf
    } as $existing
    precondition ($existing == null) {
      error_type = "standard"
      error = "CPF já cadastrado."
    }
    db.add reader {
      data = {
        cpf: $cpf
        name: $input.name
        birth_date: $input.birth_date
        address: $input.address
        phone: $input.phone
        email: $input.email
        created_by: $auth.id
      }
    } as $reader
    function.run "Getting Started Template/create_event_log" {
      input = {
        user_id: $auth.id
        action: "reader_create"
        metadata: {reader_id: $reader.id, operator_id: $auth.id}
      }
    } as $event
  }

  response = {
    id: $reader.id
    cpf: $reader.cpf
    name: $reader.name
    birth_date: $reader.birth_date
    address: $reader.address
    phone: $reader.phone
    email: $reader.email
  }
  tags = ["biblioteca"]
  guid = "post-leitor"
}
