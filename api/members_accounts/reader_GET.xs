// Endpoint para consulta de leitores
query reader verb=GET {
  api_group = "Members & Accounts"
  auth = "user"

  input {
    // Filtros opcionais
    text name? filters=trim
  
    text email? filters=trim
  }

  stack {
    // Consulta leitores com base nos filtros fornecidos
    db.query user {
      where = {} == true
      return = {type: "list"}
      output = ["id", "name", "email", "phone", "created_at"]
    } as $readers
  }

  response = {readers: $readers}
  tags = ["leitores"]
  guid = "consulta-leitores"
}