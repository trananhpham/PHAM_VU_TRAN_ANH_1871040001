const BorrowModel = require('../models/borrowModel');
const BookModel = require('../models/bookModel');
const ReaderModel = require('../models/readerModel');

class BorrowController {
  // GET / — Dashboard
  static dashboard(req, res) {
    try {
      const stats = BorrowModel.getDashboardStats();
      const topBooks = BorrowModel.getTopBorrowedBooks(5);
      const recentBorrows = BorrowModel.getAll({ page: 1, limit: 5 });
      res.render('dashboard', {
        stats, topBooks,
        recentBorrows: recentBorrows.borrows,
        title: 'Bảng điều khiển',
        flash: req.session.flash,
      });
      req.session.flash = null;
    } catch (err) {
      res.render('error', { message: err.message, title: 'Lỗi' });
    }
  }

  // GET /borrows — Danh sách phiếu mượn
  static index(req, res) {
    try {
      const { status = '', search = '', page = 1 } = req.query;
      const data = BorrowModel.getAll({ status, search, page: parseInt(page) });
      res.render('borrows/index', {
        ...data, status, search,
        title: 'Quản lý Mượn/Trả',
        flash: req.session.flash,
      });
      req.session.flash = null;
    } catch (err) {
      res.render('error', { message: err.message, title: 'Lỗi' });
    }
  }

  // GET /borrows/new — Form tạo phiếu mượn
  static newForm(req, res) {
    try {
      const readers = ReaderModel.getAll({ limit: 1000 }).readers;
      const books = BookModel.getAll({ limit: 1000 }).books;
      const today = new Date().toISOString().split('T')[0];
      const defaultDue = BorrowModel.calcDueDate(today);

      res.render('borrows/form', {
        readers, books, today, defaultDue,
        borrow: req.query, // pre-fill nếu có reader_id từ query
        title: 'Tạo Phiếu Mượn',
        errors: [],
      });
    } catch (err) {
      res.render('error', { message: err.message, title: 'Lỗi' });
    }
  }

  // POST /borrows — Tạo phiếu mượn
  static create(req, res) {
    try {
      const { reader_id, book_id, borrow_date, due_date, note } = req.body;
      const errors = [];

      if (!reader_id) errors.push('Vui lòng chọn độc giả');
      if (!book_id) errors.push('Vui lòng chọn sách');

      // Kiểm tra sách còn không
      const book = BookModel.findById(book_id);
      if (!book) {
        errors.push('Không tìm thấy sách!');
      } else if (book.available <= 0) {
        errors.push(`Sách "${book.title}" đã hết! Hiện không có sách để mượn.`);
      }

      if (errors.length > 0) {
        const readers = ReaderModel.getAll({ limit: 1000 }).readers;
        const books = BookModel.getAll({ limit: 1000 }).books;
        const today = new Date().toISOString().split('T')[0];
        const defaultDue = BorrowModel.calcDueDate(today);
        return res.render('borrows/form', {
          readers, books, today, defaultDue,
          borrow: req.body,
          title: 'Tạo Phiếu Mượn', errors
        });
      }

      // Tạo phiếu và giảm số lượng available
      const borrow = BorrowModel.create({ reader_id, book_id, borrow_date, due_date, note });
      BookModel.decreaseAvailable(book_id);

      req.session.flash = { type: 'success', message: `Đã tạo phiếu mượn #${borrow.id} thành công!` };
      res.redirect('/borrows');
    } catch (err) {
      const readers = ReaderModel.getAll({ limit: 1000 }).readers;
      const books = BookModel.getAll({ limit: 1000 }).books;
      const today = new Date().toISOString().split('T')[0];
      const defaultDue = BorrowModel.calcDueDate(today);
      res.render('borrows/form', {
        readers, books, today, defaultDue,
        borrow: req.body,
        title: 'Tạo Phiếu Mượn', errors: [err.message]
      });
    }
  }

  // GET /borrows/:id — Chi tiết phiếu mượn
  static show(req, res) {
    try {
      const borrow = BorrowModel.findById(req.params.id);
      if (!borrow) return res.render('error', { message: 'Không tìm thấy phiếu mượn!', title: 'Lỗi' });
      res.render('borrows/show', {
        borrow,
        title: `Phiếu mượn #${borrow.id}`,
        flash: req.session.flash,
      });
      req.session.flash = null;
    } catch (err) {
      res.render('error', { message: err.message, title: 'Lỗi' });
    }
  }

  // POST /borrows/:id/return — Trả sách
  static returnBook(req, res) {
    try {
      const result = BorrowModel.returnBook(req.params.id);
      BookModel.increaseAvailable(result.book_id);

      const fineMsg = result.fine > 0
        ? ` Tiền phạt: ${result.fine.toLocaleString('vi-VN')} VNĐ.`
        : ' Không có tiền phạt.';

      req.session.flash = { type: 'success', message: `Đã trả sách thành công!${fineMsg}` };
      res.redirect('/borrows/' + req.params.id);
    } catch (err) {
      req.session.flash = { type: 'error', message: err.message };
      res.redirect('/borrows');
    }
  }
}

module.exports = BorrowController;
