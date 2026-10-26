// Checks that an authenticated operator has the required library role.
function "Getting Started Template/role-based access control" {
  input {
    // The ID of the user to check the role for.
    int user_id
  
    // The role required to perform the action.
    text required_role
  }

  stack {
    // Defines a hierarchy of roles with numerical levels.
    var $role_hierarchy {
      value = {ADMIN: 2, FUNCIONARIO: 1}
    }
  
    // Retrieve the user's role from the database.
    db.get user {
      field_name = "id"
      field_value = $input.user_id
      output = ["role"]
    } as $user
  
    // Ensure the user exists
    precondition ($user != null) {
      error_type = "inputerror"
      error = "Operador não encontrado."
    }
  
    // Extract the user's role from the retrieved user data.
    var $user_role {
      value = $user.role
    }
  
    // Get the numerical level of the user's role. Defaults to 0 if not defined.
    var $user_role_level {
      value = $role_hierarchy|get:$user_role
    }
  
    // Get the numerical level of the required role. Defaults to 0 if not defined.
    var $required_role_level {
      value = $role_hierarchy|get:$input.required_role
    }

    precondition ($user_role_level != null) {
      error_type = "accessdenied"
      error = "Perfil do operador inválido."
    }
  
    // Ensure the required role is a valid, defined role in the hierarchy.
    precondition ($required_role_level > 0) {
      error_type = "inputerror"
      error = "Perfil de acesso requerido inválido."
    }
  
    // Check if the user's role level is sufficient for the required role.
    conditional {
      if ($user_role_level < $required_role_level) {
        throw {
          name = "accessdenied"
          value = "Operador sem permissão para esta ação."
        }
      }
    }
  }

  response = null
  tags = ["biblioteca"]
  guid = "t2CHloB5o3ZMDG1M_zxfc6mzcYw"
}