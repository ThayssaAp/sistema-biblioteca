// Create a genre. Only administrators may manage the controlled list.
query "genres" verb=POST {
  api_group = "Catalog"
  auth = "user"

  input {
    text name filters=trim
  }

  stack {
    db.get user {
      field_name = "id"
      field_value = $auth.id
      output = ["id", "role"]
    } as $operator
  
    function.run "Getting Started Template/role-based access control" {
      input = {user_id: $operator.id, required_role: "ADMIN"}
    } as $role_check
  
    precondition ($input.name != "") {
      error_type = "inputerror"
      error = "O nome do gênero é obrigatório."
    }

    precondition (($input.name|strlen) <= 80) {
      error_type = "inputerror"
      error = "O nome do gênero deve ter no máximo 80 caracteres."
    }
  
    var $normalized_name {
      value = $input.name|to_lower
    }
  
    db.has genre {
      field_name = "normalized_name"
      field_value = $normalized_name
    } as $genre_exists
  
    precondition (!$genre_exists) {
      error_type = "inputerror"
      error = "Já existe um gênero com esse nome."
    }
  
    db.add genre {
      data = {
        name: $input.name
        normalized_name: $normalized_name
      }
    } as $genre
  }

  response = $genre
  tags = ["biblioteca"]
  guid = "tC1kuC77Vud_0t7iU5eGAG7-szE"
}
