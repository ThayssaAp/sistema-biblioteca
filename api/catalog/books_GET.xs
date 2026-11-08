// Search physical book exemplars in the authenticated catalog.
query books verb=GET {
  api_group = "Catalog"
  auth = "user"

  input {
    text code? filters=trim
    text title? filters=trim
    int genre_id?
    text status? filters=trim
  }

  stack {
    precondition ($input.code == null || ("/^#ADS[0-9]{4}$/"|regex_matches:$input.code)) {
      error_type = "inputerror"
      error = "Informe o código no formato #ADS0000."
    }
  
    precondition ($input.status == null || ("/^(Disponível|Emprestado)$/"|regex_matches:$input.status)) {
      error_type = "inputerror"
      error = "Status inválido."
    }
  
    db.query book {
      join = {
        genre: {table: "genre", where: $db.book.genre_id == $db.genre.id}
      }
    
      where = $db.book.code ==? $input.code && ($input.title == null || $db.book.title includes $input.title) && $db.book.genre_id ==? $input.genre_id && $db.book.status ==? $input.status
      sort = {id: "desc"}
      eval = {genre_name: $db.genre.name}
      return = {type: "list"}
      output = [
        "id"
        "code"
        "title"
        "isbn"
        "publication_year"
        "genre_id"
        "genre_name"
        "age_rating"
        "status"
      ]
    } as $books
  }

  response = $books
  tags = ["biblioteca"]
  guid = "FdxE4V2EJv_Dst16UTq21F1e8_Q"
}