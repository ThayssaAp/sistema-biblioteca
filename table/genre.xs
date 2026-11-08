// Stores the controlled list of book genres.
table genre {
  auth = false

  schema {
    int id
    timestamp created_at?=now {
      visibility = "private"
    }
  
    text name filters=trim
    text normalized_name filters=trim|lower {
      visibility = "private"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {
      type : "btree|unique"
      field: [{name: "normalized_name", op: "asc"}]
    }
  ]

  tags = ["biblioteca"]
  guid = "ldO58G3m1mqH0Bh3dJ2pgJ1sbew"
}