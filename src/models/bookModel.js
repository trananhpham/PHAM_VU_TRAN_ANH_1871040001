const { getDb } = require('../database/db');

class BookModel {
  // Lấy tất cả sách với phân trang và tìm kiếm
  static getAll({ search = '', category = '', page = 1, limit = 10 } = {}) {
    const db = getDb();
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category) {
      where += ' AND category = ?';
      params.push(category);
    }

    const total = db.prepare(`SELECT COUNT(*) as count FROM books ${where}`).get(...params);
    const books = db.prepare(`SELECT * FROM books ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);

    return {
      books,
      total: total.count,
      page,
      limit,
      totalPages: Math.ceil(total.count / limit),
    };
  }

  // Lấy tất cả danh mục
  static getCategories() {
    const db = getDb();
    return db.prepare('SELECT DISTINCT category FROM books ORDER BY category').all().map(r => r.category);
  }

  // Tìm sách theo ID
  static findById(id) {
    const db = getDb();
    return db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  }

  // Tạo sách mới
  static create({ title, author, category, isbn, quantity, published_year, description }) {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO books (title, author, category, isbn, quantity, available, published_year, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(title, author, category, isbn || null, quantity, quantity, published_year || null, description || null);
    return this.findById(result.lastInsertRowid);
  }

  // Cập nhật sách
  static update(id, { title, author, category, isbn, quantity, published_year, description }) {
    const db = getDb();
    const book = this.findById(id);
    if (!book) return null;

    // Điều chỉnh available theo sự thay đổi quantity
    const diff = quantity - book.quantity;
    const newAvailable = Math.max(0, book.available + diff);

    db.prepare(`
      UPDATE books SET title=?, author=?, category=?, isbn=?, quantity=?, available=?,
      published_year=?, description=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
    `).run(title, author, category, isbn || null, quantity, newAvailable, published_year || null, description || null, id);

    return this.findById(id);
  }

  // Xóa sách
  static delete(id) {
    const db = getDb();
    // Kiểm tra xem sách có đang được mượn không
    const activeBorrow = db.prepare(
      "SELECT COUNT(*) as count FROM borrows WHERE book_id = ? AND status = 'borrowing'"
    ).get(id);
    if (activeBorrow.count > 0) {
      throw new Error('Không thể xóa sách đang được mượn!');
    }
    return db.prepare('DELETE FROM books WHERE id = ?').run(id);
  }

  // Giảm số lượng available khi mượn
  static decreaseAvailable(id) {
    const db = getDb();
    const book = this.findById(id);
    if (!book || book.available <= 0) return false;
    db.prepare('UPDATE books SET available = available - 1 WHERE id = ?').run(id);
    return true;
  }

  // Tăng số lượng available khi trả
  static increaseAvailable(id) {
    const db = getDb();
    db.prepare('UPDATE books SET available = MIN(quantity, available + 1) WHERE id = ?').run(id);
    return true;
  }
}

module.exports = BookModel;
