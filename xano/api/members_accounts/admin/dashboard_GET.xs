// Admin dashboard with aggregated operational counts.
query "admin/dashboard" verb=GET {
  api_group = "Authentication"
  auth = "user"

  input {
  }

  stack {
    db.get user {
      field_name = "id"
      field_value = $auth.id
      output = ["id", "role", "active"]
    } as $admin_user

    function.run "Getting Started Template/role-based access control" {
      input = {user_id: $admin_user.id, required_role: "ADMIN"}
    } as $role_check

    precondition ($admin_user.active != false) {
      error_type = "accessdenied"
      error = "Sessão inválida."
    }

    db.query reader {
      return = {type: "count"}
    } as $total_readers

    db.query loan {
      where = $db.loan.status == "Ativo"
      return = {type: "list"}
      output = ["reader_id"]
    } as $active_loans

    db.query book {
      where = $db.book.status == "Disponível" && $db.book.deleted_at == null
      return = {type: "count"}
    } as $available_books

    db.query book {
      where = $db.book.status == "Emprestado" && $db.book.deleted_at == null
      return = {type: "count"}
    } as $borrowed_books

    db.query loan {
      where = $db.loan.status == "Ativo" && $db.loan.due_at < now
      return = {type: "count"}
    } as $overdue_loans

    db.query fine {
      where = $db.fine.status == "Pendente"
      return = {type: "count"}
    } as $pending_fines

    var $readers_with_active_loans {
      value = 0
    }

    var $reader_ids {
      value = []
    }

    foreach ($active_loans) {
      each as $loan {
        var.update $reader_ids {
          value = ($reader_ids|push:$loan.reader_id)
        }
      }
    }

    var.update $readers_with_active_loans {
      value = ($reader_ids|unique|count)
    }
  }

  response = {
    total_readers: $total_readers
    readers_with_active_loans: $readers_with_active_loans
    available_books: $available_books
    borrowed_books: $borrowed_books
    overdue_loans: $overdue_loans
    pending_fines: $pending_fines
  }
  tags = ["biblioteca"]
  guid = "dashboard-admin-2026"
}
