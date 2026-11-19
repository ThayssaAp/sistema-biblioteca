// Novo endpoint para cadastro de leitores
query reader verb=POST {
  api_group = "Members & Accounts"
  auth = "user"

  input {
    // Nome do leitor
    text name
  
    // Email do leitor
    text email
  
    // Telefone do leitor (opcional)
    text phone?
  }

  stack {
    // Verifica se o email já está cadastrado
    precondition (`db.count user {where: {email: $input.email}} > 0`) {
      error_type = "standard"
      error = "O email já está cadastrado no sistema."
    }
  
    // Adiciona o leitor ao banco de dados
    db.add user {
      enforce_hidden_fields = false
      data = {
        name      : $input.name
        email     : $input.email
        phone     : $input.phone
        role      : "READER"
        created_at: "now"
      }
    } as $new_reader
  }

  response = {reader: $new_reader}
  tags = ["leitores"]
  guid = "cadastro-leitores"
}