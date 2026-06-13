const BookModel = require('../models/bookModel');

class BookController {
  // GET /books — Danh sách sách
  static index(req, res) {
    try {
      const { search = '', category = '', page = 1 } = req.query;
      const data = BookModel.getAll({ search, category, page: parseInt(page) });
      const categories = BookModel.getCategories();
      res.render('books/index', {
        ...data,
        search,
        category,
        categories,
        title: 'Quản lý Sách',
        flash: req.session.flash,
      });
      req.session.flash = null;
    } catch (err) {
      res.render('error', { message: err.message, title: 'Lỗi' });
    }
  }

  // GET /books/new — Form thêm sách
  static newForm(req, res) {
    const categories = BookModel.getCategories();
    res.render('books/form', {
      book: {},
      categories,
      isEdit: false,
      title: 'Thêm Sách Mới',
      errors: [],
    });
  }

  // POST /books — Tạo sách mới
  static create(req, res) {
    try {
      const { title, author, category, isbn, quantity, published_year, description } = req.body;
      const errors = [];
      if (!title?.trim()) errors.push('Tên sách không được để trống');
      if (!author?.trim()) errors.push('Tác giả không được để trống');
      if (!category?.trim()) errors.push('Thể loại không được để trống');
      if (!quantity || quantity < 1) errors.push('Số lượng phải lớn hơn 0');

      if (errors.length > 0) {
        const categories = BookModel.getCategories();
        return res.render('books/form', {
          book: req.body, categories, isEdit: false,
          title: 'Thêm Sách Mới', errors
        });
      }

      BookModel.create({ title: title.trim(), author: author.trim(), category: category.trim(), isbn: isbn?.trim(), quantity: parseInt(quantity), published_year: published_year || null, description: description?.trim() });
      req.session.flash = { type: 'success', message: `Đã thêm sách "${title}" thành công!` };
      res.redirect('/books');
    } catch (err) {
      const categories = BookModel.getCategories();
      res.render('books/form', {
        book: req.body, categories, isEdit: false,
        title: 'Thêm Sách Mới', errors: [err.message]
      });
    }
  }

  // GET /books/:id — Chi tiết sách
  static show(req, res) {
    try {
      const book = BookModel.findById(req.params.id);
      if (!book) return res.render('error', { message: 'Không tìm thấy sách!', title: 'Lỗi' });
      res.render('books/show', { book, title: book.title, flash: req.session.flash });
      req.session.flash = null;
    } catch (err) {
      res.render('error', { message: err.message, title: 'Lỗi' });
    }
  }

  // GET /books/:id/edit — Form sửa sách
  static editForm(req, res) {
    try {
      const book = BookModel.findById(req.params.id);
      if (!book) return res.render('error', { message: 'Không tìm thấy sách!', title: 'Lỗi' });
      const categories = BookModel.getCategories();
      res.render('books/form', { book, categories, isEdit: true, title: 'Sửa Sách', errors: [] });
    } catch (err) {
      res.render('error', { message: err.message, title: 'Lỗi' });
    }
  }

  // PUT /books/:id — Cập nhật sách
  static update(req, res) {
    try {
      const { title, author, category, isbn, quantity, published_year, description } = req.body;
      const errors = [];
      if (!title?.trim()) errors.push('Tên sách không được để trống');
      if (!author?.trim()) errors.push('Tác giả không được để trống');
      if (!category?.trim()) errors.push('Thể loại không được để trống');
      if (!quantity || quantity < 1) errors.push('Số lượng phải lớn hơn 0');

      if (errors.length > 0) {
        const categories = BookModel.getCategories();
        return res.render('books/form', {
          book: { ...req.body, id: req.params.id }, categories, isEdit: true,
          title: 'Sửa Sách', errors
        });
      }

      BookModel.update(req.params.id, { title: title.trim(), author: author.trim(), category: category.trim(), isbn: isbn?.trim(), quantity: parseInt(quantity), published_year: published_year || null, description: description?.trim() });
      req.session.flash = { type: 'success', message: `Đã cập nhật sách "${title}" thành công!` };
      res.redirect('/books');
    } catch (err) {
      const categories = BookModel.getCategories();
      res.render('books/form', {
        book: { ...req.body, id: req.params.id }, categories, isEdit: true,
        title: 'Sửa Sách', errors: [err.message]
      });
    }
  }

  // DELETE /books/:id — Xóa sách
  static delete(req, res) {
    try {
      const book = BookModel.findById(req.params.id);
      if (!book) {
        req.session.flash = { type: 'error', message: 'Không tìm thấy sách!' };
        return res.redirect('/books');
      }
      BookModel.delete(req.params.id);
      req.session.flash = { type: 'success', message: `Đã xóa sách "${book.title}"!` };
      res.redirect('/books');
    } catch (err) {
      req.session.flash = { type: 'error', message: err.message };
      res.redirect('/books');
    }
  }
}

module.exports = BookController;
