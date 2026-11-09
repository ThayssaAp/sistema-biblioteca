// Delete an unused genre. Only administrators may manage the controlled list.
query "genres" verb=DELETE {
  api_group = "Catalog"
  auth = "user"

  input {
    int genre_id
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
  
    db.get genre {
      field_name = "id"
      field_value = $input.genre_id
    } as $genre
  
    precondition ($genre != null) {
      error_type = "notfound"
      error = "Gênero não encontrado."
    }
  
    db.query book {
      where = $db.book.genre_id == $genre.id
      return = {type: "count"}
    } as $book_count
  
    precondition ($book_count == 0) {
      error_type = "accessdenied"
      error = "Não é possível remover um gênero associado a exemplares."
    }
  
    db.del genre {
      field_name = "id"
      field_value = $genre.id
    }
  }

  response = {deleted: true}
  tags = ["biblioteca"]
  guid = "HI_SDsa5m2sZ1DRBmoT7GZSEZ0M"
}
