const BookModel = require('../models/bookModel');
const ReaderModel = require('../models/readerModel');
const BorrowModel = require('../models/borrowModel');

// ─────────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────────
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

class AdminController {
  // GET /admin → redirect
  static redirectToDashboard(req, res) {
    if (req.session && req.session.isAdmin) return res.redirect('/admin/dashboard');
    res.redirect('/admin/login');
  }

  // GET /admin/login
  static loginForm(req, res) {
    res.render('admin/login', {
      title: 'Đăng nhập Admin',
      error: req.session.loginError || null,
      username: req.session.loginUsername || '',
    });
    req.session.loginError = null;
    req.session.loginUsername = null;
  }

  // POST /admin/login
  static login(req, res) {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      req.session.isAdmin = true;
      res.redirect('/admin/dashboard');
    } else {
      req.session.loginError = 'Tên đăng nhập hoặc mật khẩu không đúng!';
      req.session.loginUsername = username;
      res.redirect('/admin/login');
    }
  }

  // GET /admin/logout
  static logout(req, res) {
    req.session.destroy(() => res.redirect('/admin/login'));
  }

  // ─────────────────────────────────────────────────
  //  DASHBOARD
  // ─────────────────────────────────────────────────
  static dashboard(req, res) {
    try {
      const stats = BorrowModel.getDashboardStats();
      const topBooks = BorrowModel.getTopBorrowedBooks(5);
      const recentBorrows = BorrowModel.getAll({ page: 1, limit: 6 });
      res.render('admin/dashboard', {
        title: 'Bảng điều khiển',
        adminPath: 'dashboard',
        stats, topBooks,
        recentBorrows: recentBorrows.borrows,
        flash: req.session.flash,
      });
      req.session.flash = null;
    } catch (err) {
      res.render('admin/dashboard', { title: 'Dashboard', adminPath: 'dashboard', stats: {}, topBooks: [], recentBorrows: [], flash: { type: 'error', message: err.message } });
    }
  }

  // ─────────────────────────────────────────────────
  //  BOOKS
  // ─────────────────────────────────────────────────
  static booksIndex(req, res) {
    try {
      const { search = '', category = '', page = 1 } = req.query;
      const data = BookModel.getAll({ search, category, page: parseInt(page) });
      const categories = BookModel.getCategories();
      res.render('admin/books/index', { ...data, search, category, categories, title: 'Quản lý Sách', adminPath: 'books', flash: req.session.flash });
      req.session.flash = null;
    } catch (err) { res.render('admin/books/index', { books: [], total: 0, page: 1, totalPages: 1, search: '', category: '', categories: [], title: 'Sách', adminPath: 'books', flash: { type: 'error', message: err.message } }); }
  }

  static booksNew(req, res) {
    res.render('admin/books/form', { book: {}, categories: BookModel.getCategories(), isEdit: false, title: 'Thêm Sách', adminPath: 'books', errors: [] });
  }

  static booksCreate(req, res) {
    try {
      const { title, author, category, isbn, quantity, published_year, description } = req.body;
      const errors = [];
      if (!title?.trim()) errors.push('Tên sách không được để trống');
      if (!author?.trim()) errors.push('Tác giả không được để trống');
      if (!category?.trim()) errors.push('Thể loại không được để trống');
      if (!quantity || quantity < 1) errors.push('Số lượng phải lớn hơn 0');
      if (errors.length > 0) return res.render('admin/books/form', { book: req.body, categories: BookModel.getCategories(), isEdit: false, title: 'Thêm Sách', adminPath: 'books', errors });

      BookModel.create({ title: title.trim(), author: author.trim(), category: category.trim(), isbn: isbn?.trim(), quantity: parseInt(quantity), published_year: published_year || null, description: description?.trim() });
      req.session.flash = { type: 'success', message: `Đã thêm sách "${title}" thành công!` };
      res.redirect('/admin/books');
    } catch (err) {
      res.render('admin/books/form', { book: req.body, categories: BookModel.getCategories(), isEdit: false, title: 'Thêm Sách', adminPath: 'books', errors: [err.message] });
    }
  }

  static booksShow(req, res) {
    try {
      const book = BookModel.findById(req.params.id);
      if (!book) { req.session.flash = { type: 'error', message: 'Không tìm thấy sách!' }; return res.redirect('/admin/books'); }
      res.render('admin/books/show', { book, title: book.title, adminPath: 'books', flash: req.session.flash });
      req.session.flash = null;
    } catch (err) { req.session.flash = { type: 'error', message: err.message }; res.redirect('/admin/books'); }
  }

  static booksEdit(req, res) {
    try {
      const book = BookModel.findById(req.params.id);
      if (!book) { req.session.flash = { type: 'error', message: 'Không tìm thấy sách!' }; return res.redirect('/admin/books'); }
      res.render('admin/books/form', { book, categories: BookModel.getCategories(), isEdit: true, title: 'Sửa Sách', adminPath: 'books', errors: [] });
    } catch (err) { req.session.flash = { type: 'error', message: err.message }; res.redirect('/admin/books'); }
  }

  static booksUpdate(req, res) {
    try {
      const { title, author, category, isbn, quantity, published_year, description } = req.body;
      const errors = [];
      if (!title?.trim()) errors.push('Tên sách không được để trống');
      if (!author?.trim()) errors.push('Tác giả không được để trống');
      if (!category?.trim()) errors.push('Thể loại không được để trống');
      if (!quantity || quantity < 1) errors.push('Số lượng phải lớn hơn 0');
      if (errors.length > 0) return res.render('admin/books/form', { book: { ...req.body, id: req.params.id }, categories: BookModel.getCategories(), isEdit: true, title: 'Sửa Sách', adminPath: 'books', errors });

      BookModel.update(req.params.id, { title: title.trim(), author: author.trim(), category: category.trim(), isbn: isbn?.trim(), quantity: parseInt(quantity), published_year: published_year || null, description: description?.trim() });
      req.session.flash = { type: 'success', message: `Đã cập nhật sách "${title}"!` };
      res.redirect('/admin/books');
    } catch (err) {
      res.render('admin/books/form', { book: { ...req.body, id: req.params.id }, categories: BookModel.getCategories(), isEdit: true, title: 'Sửa Sách', adminPath: 'books', errors: [err.message] });
    }
  }

  static booksDelete(req, res) {
    try {
      const book = BookModel.findById(req.params.id);
      if (!book) { req.session.flash = { type: 'error', message: 'Không tìm thấy sách!' }; return res.redirect('/admin/books'); }
      BookModel.delete(req.params.id);
      req.session.flash = { type: 'success', message: `Đã xóa sách "${book.title}"!` };
    } catch (err) {
      req.session.flash = { type: 'error', message: err.message };
    }
    res.redirect('/admin/books');
  }

  // ─────────────────────────────────────────────────
  //  READERS
  // ─────────────────────────────────────────────────
  static readersIndex(req, res) {
    try {
      const { search = '', page = 1 } = req.query;
      const data = ReaderModel.getAll({ search, page: parseInt(page) });
      res.render('admin/readers/index', { ...data, search, title: 'Quản lý Độc giả', adminPath: 'readers', flash: req.session.flash });
      req.session.flash = null;
    } catch (err) { res.render('admin/readers/index', { readers: [], total: 0, page: 1, totalPages: 1, search: '', title: 'Độc giả', adminPath: 'readers', flash: { type: 'error', message: err.message } }); }
  }

  static readersNew(req, res) {
    res.render('admin/readers/form', { reader: {}, isEdit: false, title: 'Đăng ký Độc giả', adminPath: 'readers', errors: [] });
  }

  static readersCreate(req, res) {
    try {
      const { name, email, phone, address } = req.body;
      const errors = [];
      if (!name?.trim()) errors.push('Họ tên không được để trống');
      if (!email?.trim()) errors.push('Email không được để trống');
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email không hợp lệ');
      if (errors.length > 0) return res.render('admin/readers/form', { reader: req.body, isEdit: false, title: 'Đăng ký Độc giả', adminPath: 'readers', errors });

      const reader = ReaderModel.create({ name: name.trim(), email: email.trim(), phone: phone?.trim(), address: address?.trim() });
      req.session.flash = { type: 'success', message: `Đã đăng ký "${reader.name}" với mã ${reader.member_id}!` };
      res.redirect('/admin/readers');
    } catch (err) {
      res.render('admin/readers/form', { reader: req.body, isEdit: false, title: 'Đăng ký Độc giả', adminPath: 'readers', errors: [err.message] });
    }
  }

  static readersShow(req, res) {
    try {
      const reader = ReaderModel.findById(req.params.id);
      if (!reader) { req.session.flash = { type: 'error', message: 'Không tìm thấy độc giả!' }; return res.redirect('/admin/readers'); }
      const history = ReaderModel.getBorrowHistory(req.params.id);
      const stats = ReaderModel.getStats(req.params.id);
      res.render('admin/readers/show', { reader, history, stats, title: reader.name, adminPath: 'readers', flash: req.session.flash });
      req.session.flash = null;
    } catch (err) { req.session.flash = { type: 'error', message: err.message }; res.redirect('/admin/readers'); }
  }

  static readersEdit(req, res) {
    try {
      const reader = ReaderModel.findById(req.params.id);
      if (!reader) { req.session.flash = { type: 'error', message: 'Không tìm thấy độc giả!' }; return res.redirect('/admin/readers'); }
      res.render('admin/readers/form', { reader, isEdit: true, title: 'Sửa Độc giả', adminPath: 'readers', errors: [] });
    } catch (err) { req.session.flash = { type: 'error', message: err.message }; res.redirect('/admin/readers'); }
  }

  static readersUpdate(req, res) {
    try {
      const { name, email, phone, address } = req.body;
      const errors = [];
      if (!name?.trim()) errors.push('Họ tên không được để trống');
      if (!email?.trim()) errors.push('Email không được để trống');
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email không hợp lệ');
      if (errors.length > 0) return res.render('admin/readers/form', { reader: { ...req.body, id: req.params.id }, isEdit: true, title: 'Sửa Độc giả', adminPath: 'readers', errors });

      ReaderModel.update(req.params.id, { name: name.trim(), email: email.trim(), phone: phone?.trim(), address: address?.trim() });
      req.session.flash = { type: 'success', message: 'Cập nhật thông tin độc giả thành công!' };
      res.redirect('/admin/readers/' + req.params.id);
    } catch (err) {
      res.render('admin/readers/form', { reader: { ...req.body, id: req.params.id }, isEdit: true, title: 'Sửa Độc giả', adminPath: 'readers', errors: [err.message] });
    }
  }

  static readersDelete(req, res) {
    try {
      const reader = ReaderModel.findById(req.params.id);
      if (!reader) { req.session.flash = { type: 'error', message: 'Không tìm thấy độc giả!' }; return res.redirect('/admin/readers'); }
      ReaderModel.delete(req.params.id);
      req.session.flash = { type: 'success', message: `Đã xóa độc giả "${reader.name}"!` };
    } catch (err) {
      req.session.flash = { type: 'error', message: err.message };
    }
    res.redirect('/admin/readers');
  }

  // ─────────────────────────────────────────────────
  //  BORROWS
  // ─────────────────────────────────────────────────
  static borrowsIndex(req, res) {
    try {
      const { status = '', search = '', page = 1 } = req.query;
      const data = BorrowModel.getAll({ status, search, page: parseInt(page) });
      res.render('admin/borrows/index', { ...data, status, search, title: 'Quản lý Mượn/Trả', adminPath: 'borrows', flash: req.session.flash });
      req.session.flash = null;
    } catch (err) { res.render('admin/borrows/index', { borrows: [], total: 0, page: 1, totalPages: 1, status: '', search: '', title: 'Mượn/Trả', adminPath: 'borrows', flash: { type: 'error', message: err.message } }); }
  }

  static borrowsNew(req, res) {
    try {
      const readers = ReaderModel.getAll({ limit: 1000 }).readers;
      const books = BookModel.getAll({ limit: 1000 }).books;
      const today = new Date().toISOString().split('T')[0];
      const defaultDue = BorrowModel.calcDueDate(today);
      res.render('admin/borrows/form', { readers, books, today, defaultDue, borrow: req.query, title: 'Tạo Phiếu Mượn', adminPath: 'borrows', errors: [] });
    } catch (err) { req.session.flash = { type: 'error', message: err.message }; res.redirect('/admin/borrows'); }
  }

  static borrowsCreate(req, res) {
    try {
      const { reader_id, book_id, borrow_date, due_date, note } = req.body;
      const errors = [];
      if (!reader_id) errors.push('Vui lòng chọn độc giả');
      if (!book_id) errors.push('Vui lòng chọn sách');

      const book = BookModel.findById(book_id);
      if (!book) errors.push('Không tìm thấy sách!');
      else if (book.available <= 0) errors.push(`Sách "${book.title}" đã hết! Hiện không có sách để mượn.`);

      if (errors.length > 0) {
        const readers = ReaderModel.getAll({ limit: 1000 }).readers;
        const books = BookModel.getAll({ limit: 1000 }).books;
        const today = new Date().toISOString().split('T')[0];
        return res.render('admin/borrows/form', { readers, books, today, defaultDue: BorrowModel.calcDueDate(today), borrow: req.body, title: 'Tạo Phiếu Mượn', adminPath: 'borrows', errors });
      }

      const borrow = BorrowModel.create({ reader_id, book_id, borrow_date, due_date, note });
      BookModel.decreaseAvailable(book_id);
      req.session.flash = { type: 'success', message: `Đã tạo phiếu mượn #${borrow.id} thành công!` };
      res.redirect('/admin/borrows');
    } catch (err) {
      const readers = ReaderModel.getAll({ limit: 1000 }).readers;
      const books = BookModel.getAll({ limit: 1000 }).books;
      const today = new Date().toISOString().split('T')[0];
      res.render('admin/borrows/form', { readers, books, today, defaultDue: BorrowModel.calcDueDate(today), borrow: req.body, title: 'Tạo Phiếu Mượn', adminPath: 'borrows', errors: [err.message] });
    }
  }

  static borrowsShow(req, res) {
    try {
      const borrow = BorrowModel.findById(req.params.id);
      if (!borrow) { req.session.flash = { type: 'error', message: 'Không tìm thấy phiếu mượn!' }; return res.redirect('/admin/borrows'); }
      res.render('admin/borrows/show', { borrow, title: `Phiếu mượn #${borrow.id}`, adminPath: 'borrows', flash: req.session.flash });
      req.session.flash = null;
    } catch (err) { req.session.flash = { type: 'error', message: err.message }; res.redirect('/admin/borrows'); }
  }

  static borrowsReturn(req, res) {
    try {
      const result = BorrowModel.returnBook(req.params.id);
      BookModel.increaseAvailable(result.book_id);
      const fineMsg = result.fine > 0 ? ` Tiền phạt: ${result.fine.toLocaleString('vi-VN')} VNĐ.` : ' Không có tiền phạt.';
      req.session.flash = { type: 'success', message: `Đã trả sách thành công!${fineMsg}` };
      res.redirect('/admin/borrows/' + req.params.id);
    } catch (err) {
      req.session.flash = { type: 'error', message: err.message };
      res.redirect('/admin/borrows');
    }
  }
}

module.exports = AdminController;
