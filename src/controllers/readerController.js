const ReaderModel = require('../models/readerModel');

class ReaderController {
  // GET /readers — Danh sách độc giả
  static index(req, res) {
    try {
      const { search = '', page = 1 } = req.query;
      const data = ReaderModel.getAll({ search, page: parseInt(page) });
      res.render('readers/index', {
        ...data, search,
        title: 'Quản lý Độc giả',
        flash: req.session.flash,
      });
      req.session.flash = null;
    } catch (err) {
      res.render('error', { message: err.message, title: 'Lỗi' });
    }
  }

  // GET /readers/new — Form đăng ký
  static newForm(req, res) {
    res.render('readers/form', {
      reader: {},
      isEdit: false,
      title: 'Đăng ký Độc giả',
      errors: [],
    });
  }

  // POST /readers — Đăng ký độc giả
  static create(req, res) {
    try {
      const { name, email, phone, address } = req.body;
      const errors = [];
      if (!name?.trim()) errors.push('Họ tên không được để trống');
      if (!email?.trim()) errors.push('Email không được để trống');
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email không hợp lệ');

      if (errors.length > 0) {
        return res.render('readers/form', {
          reader: req.body, isEdit: false,
          title: 'Đăng ký Độc giả', errors
        });
      }

      const reader = ReaderModel.create({ name: name.trim(), email: email.trim(), phone: phone?.trim(), address: address?.trim() });
      req.session.flash = { type: 'success', message: `Đã đăng ký độc giả "${reader.name}" với mã ${reader.member_id}!` };
      res.redirect('/readers');
    } catch (err) {
      res.render('readers/form', {
        reader: req.body, isEdit: false,
        title: 'Đăng ký Độc giả', errors: [err.message]
      });
    }
  }

  // GET /readers/:id — Chi tiết + lịch sử mượn
  static show(req, res) {
    try {
      const reader = ReaderModel.findById(req.params.id);
      if (!reader) return res.render('error', { message: 'Không tìm thấy độc giả!', title: 'Lỗi' });
      const history = ReaderModel.getBorrowHistory(req.params.id);
      const stats = ReaderModel.getStats(req.params.id);
      res.render('readers/show', {
        reader, history, stats,
        title: reader.name,
        flash: req.session.flash,
      });
      req.session.flash = null;
    } catch (err) {
      res.render('error', { message: err.message, title: 'Lỗi' });
    }
  }

  // GET /readers/:id/edit — Form sửa
  static editForm(req, res) {
    try {
      const reader = ReaderModel.findById(req.params.id);
      if (!reader) return res.render('error', { message: 'Không tìm thấy độc giả!', title: 'Lỗi' });
      res.render('readers/form', { reader, isEdit: true, title: 'Sửa thông tin Độc giả', errors: [] });
    } catch (err) {
      res.render('error', { message: err.message, title: 'Lỗi' });
    }
  }

  // PUT /readers/:id — Cập nhật
  static update(req, res) {
    try {
      const { name, email, phone, address } = req.body;
      const errors = [];
      if (!name?.trim()) errors.push('Họ tên không được để trống');
      if (!email?.trim()) errors.push('Email không được để trống');
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email không hợp lệ');

      if (errors.length > 0) {
        return res.render('readers/form', {
          reader: { ...req.body, id: req.params.id }, isEdit: true,
          title: 'Sửa thông tin Độc giả', errors
        });
      }

      ReaderModel.update(req.params.id, { name: name.trim(), email: email.trim(), phone: phone?.trim(), address: address?.trim() });
      req.session.flash = { type: 'success', message: 'Đã cập nhật thông tin độc giả thành công!' };
      res.redirect('/readers/' + req.params.id);
    } catch (err) {
      res.render('readers/form', {
        reader: { ...req.body, id: req.params.id }, isEdit: true,
        title: 'Sửa thông tin Độc giả', errors: [err.message]
      });
    }
  }

  // DELETE /readers/:id — Xóa
  static delete(req, res) {
    try {
      const reader = ReaderModel.findById(req.params.id);
      if (!reader) {
        req.session.flash = { type: 'error', message: 'Không tìm thấy độc giả!' };
        return res.redirect('/readers');
      }
      ReaderModel.delete(req.params.id);
      req.session.flash = { type: 'success', message: `Đã xóa độc giả "${reader.name}"!` };
      res.redirect('/readers');
    } catch (err) {
      req.session.flash = { type: 'error', message: err.message };
      res.redirect('/readers');
    }
  }
}

module.exports = ReaderController;
