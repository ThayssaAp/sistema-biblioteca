// Create a physical book exemplar.
query books verb=POST {
  api_group = "Catalog"
  auth = "user"

  input {
    text title filters=trim
    text isbn? filters=trim
    int publication_year?
    int genre_id
    text age_rating
  }

  stack {
    precondition ($input.title != "") {
      error_type = "inputerror"
      error = "O título é obrigatório."
    }
  
    precondition ($input.isbn == null || ("/^[A-Za-z0-9]{10,13}$/"|regex_matches:$input.isbn)) {
      error_type = "inputerror"
      error = "O ISBN deve conter de 10 a 13 letras ou números, sem hífens."
    }
  
    precondition ($input.publication_year == null || ($input.publication_year >= 1000 && $input.publication_year <= (now|format_timestamp:"Y":"America/Sao_Paulo"|to_int))) {
      error_type = "inputerror"
      error = "O ano da obra deve ter quatro dígitos e não pode ser futuro."
    }
  
    precondition ("/^(Livre|10[+]|12[+]|14[+]|16[+]|18[+]|Não informada)$/"|regex_matches:$input.age_rating) {
      error_type = "inputerror"
      error = "Faixa etária inválida."
    }
  
    db.get genre {
      field_name = "id"
      field_value = $input.genre_id
      output = ["id", "name"]
    } as $genre
  
    precondition ($genre != null) {
      error_type = "inputerror"
      error = "Gênero não encontrado."
    }
  
    db.transaction {
      stack {
        db.add book {
          data = {
            title           : $input.title
            isbn            : $input.isbn
            publication_year: $input.publication_year
            genre_id        : $genre.id
            age_rating      : $input.age_rating
            status          : "Disponível"
          }
        } as $book
      
        precondition ($book.id <= 9999) {
          error_type = "inputerror"
          error = "O limite de códigos de exemplares de quatro dígitos foi atingido."
        }
      
        var $code {
          value = "#ADS%04d"|sprintf:$book.id
        }
      
        db.edit book {
          field_name = "id"
          field_value = $book.id
          data = {code: $code}
        } as $book_with_code
      }
    }
  }

  response = $book_with_code|set:"genre_name":$genre.name
  tags = ["biblioteca"]
  guid = "iifRhChNJ6GA4O7keEN1DOWxLX4"
}