const { getDb } = require('../database/db');

const FINE_PER_DAY = 2000; // 2,000 VNĐ/ngày/quyển
const DEFAULT_BORROW_DAYS = 14; // 14 ngày mượn mặc định

class BorrowModel {
  // Tính tiền phạt
  static calculateFine(dueDate, returnDate = null) {
    const due = new Date(dueDate);
    const ret = returnDate ? new Date(returnDate) : new Date();
    const today = new Date(ret.toDateString());
    const dueDay = new Date(due.toDateString());

    if (today <= dueDay) return 0;
    const diffMs = today - dueDay;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays * FINE_PER_DAY;
  }

  // Tính ngày đến hạn
  static calcDueDate(borrowDate, days = DEFAULT_BORROW_DAYS) {
    const d = new Date(borrowDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  // Lấy tất cả phiếu mượn
  static getAll({ status = '', search = '', page = 1, limit = 10 } = {}) {
    const db = getDb();
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params = [];

    if (status) {
      where += ' AND br.status = ?';
      params.push(status);
    }
    if (search) {
      where += ' AND (r.name LIKE ? OR r.member_id LIKE ? OR bk.title LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const total = db.prepare(`
      SELECT COUNT(*) as count FROM borrows br
      JOIN readers r ON br.reader_id = r.id
      JOIN books bk ON br.book_id = bk.id
      ${where}
    `).get(...params);

    const borrows = db.prepare(`
      SELECT br.*, r.name as reader_name, r.member_id, r.email as reader_email,
             bk.title as book_title, bk.author as book_author, bk.isbn
      FROM borrows br
      JOIN readers r ON br.reader_id = r.id
      JOIN books bk ON br.book_id = bk.id
      ${where}
      ORDER BY br.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    // Tính phạt realtime cho mỗi phiếu
    borrows.forEach(b => {
      if (b.status === 'borrowing') {
        b.current_fine = this.calculateFine(b.due_date);
        b.is_overdue = b.current_fine > 0;
      }
    });

    return {
      borrows,
      total: total.count,
      page,
      limit,
      totalPages: Math.ceil(total.count / limit),
    };
  }

  // Tìm phiếu mượn theo ID
  static findById(id) {
    const db = getDb();
    const borrow = db.prepare(`
      SELECT br.*, r.name as reader_name, r.member_id, r.phone as reader_phone,
             r.email as reader_email, bk.title as book_title, bk.author as book_author,
             bk.isbn, bk.category
      FROM borrows br
      JOIN readers r ON br.reader_id = r.id
      JOIN books bk ON br.book_id = bk.id
      WHERE br.id = ?
    `).get(id);

    if (borrow && borrow.status === 'borrowing') {
      borrow.current_fine = this.calculateFine(borrow.due_date);
      borrow.is_overdue = borrow.current_fine > 0;
    }
    return borrow;
  }

  // Tạo phiếu mượn mới
  static create({ reader_id, book_id, borrow_date, due_date, note }) {
    const db = getDb();
    const actualBorrowDate = borrow_date || new Date().toISOString().split('T')[0];
    const actualDueDate = due_date || this.calcDueDate(actualBorrowDate);

    const stmt = db.prepare(`
      INSERT INTO borrows (reader_id, book_id, borrow_date, due_date, status, note)
      VALUES (?, ?, ?, ?, 'borrowing', ?)
    `);
    const result = stmt.run(reader_id, book_id, actualBorrowDate, actualDueDate, note || null);
    return this.findById(result.lastInsertRowid);
  }

  // Trả sách
  static returnBook(id) {
    const db = getDb();
    const borrow = this.findById(id);
    if (!borrow) throw new Error('Không tìm thấy phiếu mượn!');
    if (borrow.status === 'returned') throw new Error('Sách này đã được trả rồi!');

    const returnDate = new Date().toISOString().split('T')[0];
    const fine = this.calculateFine(borrow.due_date, returnDate);

    db.prepare(`
      UPDATE borrows SET status='returned', return_date=?, fine_amount=? WHERE id=?
    `).run(returnDate, fine, id);

    return { ...this.findById(id), fine };
  }

  // Thống kê tổng quan dashboard
  static getDashboardStats() {
    const db = getDb();
    const totalBooks = db.prepare('SELECT COUNT(*) as c FROM books').get().c;
    const totalReaders = db.prepare('SELECT COUNT(*) as c FROM readers').get().c;
    const activeBorrows = db.prepare("SELECT COUNT(*) as c FROM borrows WHERE status='borrowing'").get().c;
    const overdue = db.prepare(`
      SELECT COUNT(*) as c FROM borrows WHERE status='borrowing' AND date(due_date) < date('now')
    `).get().c;
    const totalFine = db.prepare("SELECT COALESCE(SUM(fine_amount),0) as s FROM borrows").get().s;
    const returnedToday = db.prepare(`
      SELECT COUNT(*) as c FROM borrows WHERE status='returned' AND date(return_date) = date('now')
    `).get().c;

    return { totalBooks, totalReaders, activeBorrows, overdue, totalFine, returnedToday };
  }

  // Sách mượn nhiều nhất
  static getTopBorrowedBooks(limit = 5) {
    const db = getDb();
    return db.prepare(`
      SELECT bk.title, bk.author, COUNT(br.id) as borrow_count
      FROM borrows br JOIN books bk ON br.book_id = bk.id
      GROUP BY br.book_id ORDER BY borrow_count DESC LIMIT ?
    `).all(limit);
  }
}

module.exports = BorrowModel;
module.exports.FINE_PER_DAY = FINE_PER_DAY;
module.exports.DEFAULT_BORROW_DAYS = DEFAULT_BORROW_DAYS;
