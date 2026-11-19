// Search public catalog data for an authenticated reader.
query "books" verb=GET {
  api_group = "Leitores"
  auth = "reader"

  input {
    text title? filters=trim
    int genre_id?
    text status? filters=trim
    text age_rating? filters=trim
  }

  stack {
    precondition ($input.status == null || ("/^(Disponível|Emprestado)$/"|regex_matches:$input.status)) {
      error_type = "inputerror"
      error = "Status inválido."
    }
    precondition ($input.age_rating == null || ("/^(Livre|10\+|12\+|14\+|16\+|18\+|Não informada)$/"|regex_matches:$input.age_rating)) {
      error_type = "inputerror"
      error = "Classificação etária inválida."
    }
    db.query book {
      join = {
        genre: {
          table: "genre"
          type: "inner"
          where: $db.book.genre_id == $db.genre.id
        }
      }
      eval = {
        genre_name: $db.genre.name
      }
      where = ($input.title == null || $db.book.title includes $input.title) && $db.book.genre_id ==? $input.genre_id && $db.book.status ==? $input.status && $db.book.age_rating ==? $input.age_rating
      sort = {title: "asc"}
      return = {type: "list"}
      output = ["id", "code", "title", "genre_id", "genre_name", "age_rating", "status"]
    } as $books
  }

  response = $books
  tags = ["biblioteca"]
  guid = "reader-books"
}
