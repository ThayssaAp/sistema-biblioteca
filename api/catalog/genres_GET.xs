// List genres available to authenticated catalog operators.
query genres verb=GET {
  api_group = "Catalog"
  auth = "user"

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
  guid = "GWksAaRNaNQmayQN3kRXvOxr5sg"
}