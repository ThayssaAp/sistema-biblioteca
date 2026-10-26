// Get the operator record belonging to the authentication token
query "auth/me" verb=GET {
  api_group = "Authentication"
  auth = "user"

  input {
  }

  stack {
    db.get user {
      field_name = "id"
      field_value = $auth.id
      output = ["id", "matricula", "name", "cpf", "address", "phone", "role"]
    } as $user
  }

  response = $user
  tags = ["biblioteca"]
  guid = "R_7_R-8SS4-WfM3GS4ieMO0_vls"
}