// List public genre options for the reader catalog filter.
query "genres" verb=GET {
  api_group = "Leitores"
  auth = "reader"

  input {
  }

  stack {
    db.query genre {
      sort = {name: "asc"}
      return = {type: "list"}
      output = ["id", "name"]
    } as $genres
  }

  response = $genres
  tags = ["biblioteca"]
  guid = "reader-genres"
}
