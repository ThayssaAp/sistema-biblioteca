// Rename a genre. Only administrators may manage the controlled list.
query "genres" verb=PATCH {
  api_group = "Catalog"
  auth = "user"

  input {
    int genre_id
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
  
    db.get genre {
      field_name = "id"
      field_value = $input.genre_id
    } as $genre
  
    precondition ($genre != null) {
      error_type = "notfound"
      error = "Gênero não encontrado."
    }
  
    var $normalized_name {
      value = $input.name|to_lower
    }
  
    db.query genre {
      where = $db.genre.normalized_name == $normalized_name && $db.genre.id != $genre.id
      return = {type: "exists"}
    } as $duplicate
  
    precondition (!$duplicate) {
      error_type = "inputerror"
      error = "Já existe um gênero com esse nome."
    }
  
    db.edit genre {
      field_name = "id"
      field_value = $genre.id
      data = {
        name: $input.name
        normalized_name: $normalized_name
      }
    } as $updated_genre
  }

  response = $updated_genre
  tags = ["biblioteca"]
  guid = "KfgqD54HtWO9RzAkbfKCWJF-T0Y"
}
