const { getDb } = require('../database/db');

class ReaderModel {
  // Tạo mã thành viên tự động
  static generateMemberId() {
    const db = getDb();
    const last = db.prepare("SELECT member_id FROM readers ORDER BY id DESC LIMIT 1").get();
    if (!last) return 'MEM001';
    const num = parseInt(last.member_id.replace('MEM', '')) + 1;
    return 'MEM' + String(num).padStart(3, '0');
  }

  // Lấy tất cả độc giả
  static getAll({ search = '', page = 1, limit = 10 } = {}) {
    const db = getDb();
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (name LIKE ? OR email LIKE ? OR member_id LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const total = db.prepare(`SELECT COUNT(*) as count FROM readers ${where}`).get(...params);
    const readers = db.prepare(`SELECT * FROM readers ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);

    return {
      readers,
      total: total.count,
      page,
      limit,
      totalPages: Math.ceil(total.count / limit),
    };
  }

  // Tìm theo ID
  static findById(id) {
    const db = getDb();
    return db.prepare('SELECT * FROM readers WHERE id = ?').get(id);
  }

  // Tìm theo email
  static findByEmail(email) {
    const db = getDb();
    return db.prepare('SELECT * FROM readers WHERE email = ?').get(email);
  }

  // Tạo độc giả mới (đăng ký)
  static create({ name, email, phone, address }) {
    const db = getDb();
    // Kiểm tra email tồn tại
    if (this.findByEmail(email)) {
      throw new Error('Email này đã được đăng ký!');
    }
    const member_id = this.generateMemberId();
    const stmt = db.prepare(`
      INSERT INTO readers (name, email, phone, address, member_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, email, phone || null, address || null, member_id);
    return this.findById(result.lastInsertRowid);
  }

  // Cập nhật thông tin độc giả
  static update(id, { name, email, phone, address }) {
    const db = getDb();
    const existing = this.findByEmail(email);
    if (existing && existing.id !== parseInt(id)) {
      throw new Error('Email này đã được dùng bởi người đọc khác!');
    }
    db.prepare(`
      UPDATE readers SET name=?, email=?, phone=?, address=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
    `).run(name, email, phone || null, address || null, id);
    return this.findById(id);
  }

  // Xóa độc giả
  static delete(id) {
    const db = getDb();
    const activeBorrow = db.prepare(
      "SELECT COUNT(*) as count FROM borrows WHERE reader_id = ? AND status = 'borrowing'"
    ).get(id);
    if (activeBorrow.count > 0) {
      throw new Error('Không thể xóa độc giả đang có sách mượn chưa trả!');
    }
    return db.prepare('DELETE FROM readers WHERE id = ?').run(id);
  }

  // Lấy lịch sử mượn của độc giả
  static getBorrowHistory(readerId) {
    const db = getDb();
    return db.prepare(`
      SELECT b.*, bk.title as book_title, bk.author as book_author, bk.isbn
      FROM borrows b
      JOIN books bk ON b.book_id = bk.id
      WHERE b.reader_id = ?
      ORDER BY b.created_at DESC
    `).all(readerId);
  }

  // Thống kê nhanh
  static getStats(readerId) {
    const db = getDb();
    const total = db.prepare("SELECT COUNT(*) as c FROM borrows WHERE reader_id = ?").get(readerId);
    const active = db.prepare("SELECT COUNT(*) as c FROM borrows WHERE reader_id = ? AND status = 'borrowing'").get(readerId);
    const fine = db.prepare("SELECT COALESCE(SUM(fine_amount),0) as total FROM borrows WHERE reader_id = ?").get(readerId);
    return { total: total.c, active: active.c, totalFine: fine.total };
  }
}

module.exports = ReaderModel;
