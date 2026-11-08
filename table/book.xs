// Stores physical book exemplars in the library catalog.
table book {
  auth = false

  schema {
    int id
    timestamp created_at?=now {
      visibility = "private"
    }
  
    text title filters=trim
    text? code
    text isbn? filters=trim
    int? publication_year
    int genre_id {
      table = "genre"
    }
  
    enum age_rating {
      values = ["Livre", "10+", "12+", "14+", "16+", "18+", "Não informada"]
    }
  
    enum status {
      values = ["Disponível", "Emprestado"]
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "code", op: "asc"}]}
    {type: "btree", field: [{name: "title", op: "asc"}]}
    {type: "btree", field: [{name: "genre_id", op: "asc"}]}
    {type: "btree", field: [{name: "status", op: "asc"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]

  tags = ["biblioteca"]
  guid = "0bWs6wX7UFfoy2pW2shlHvF7Flw"
}