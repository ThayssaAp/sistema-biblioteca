// Lists the authenticated reader's loans and related fines.
query "emprestimos" verb=GET {
  api_group = "Leitores"
  auth = "reader"

  input {
  }

  stack {
    db.query loan {
      join = {
        book: {
          table: "book"
          type: "inner"
          where: $db.loan.book_id == $db.book.id
        }
        fine: {
          table: "fine"
          type: "left"
          where: $db.loan.id == $db.fine.loan_id
        }
      }
      eval = {
        book_code: $db.book.code
        book_title: $db.book.title
        book_genre_id: $db.book.genre_id
        fine_id: $db.fine.id
        fine_overdue_days: $db.fine.overdue_days
        fine_amount_cents: $db.fine.amount_cents
        fine_status: $db.fine.status
        fine_paid_by: $db.fine.paid_by
        fine_paid_at: $db.fine.paid_at
        fine_resolved_by: $db.fine.resolved_by
        fine_resolved_at: $db.fine.resolved_at
        fine_resolution_notes: $db.fine.resolution_notes
      }
      where = $db.loan.reader_id == $auth.id
      sort = {borrowed_at: "desc"}
      return = {type: "list"}
      output = [
        "id"
        "code"
        "book_id"
        "book_code"
        "book_title"
        "book_genre_id"
        "borrowed_at"
        "due_at"
        "returned_at"
        "renewed_at"
        "renewal_count"
        "status"
        "fine_id"
        "fine_overdue_days"
        "fine_amount_cents"
        "fine_status"
        "fine_paid_by"
        "fine_paid_at"
        "fine_resolved_by"
        "fine_resolved_at"
        "fine_resolution_notes"
      ]
    } as $loans
  }

  response = $loans
  tags = ["biblioteca"]
  guid = "reader-loans-2026"
}