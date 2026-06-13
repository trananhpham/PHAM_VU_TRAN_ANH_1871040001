const BookModel = require('../models/bookModel');
const BorrowModel = require('../models/borrowModel');

class HomeController {
  static index(req, res) {
    try {
      const stats = BorrowModel.getDashboardStats();
      // Lấy 8 sách để hiển thị trên trang chính
      const featuredBooks = BookModel.getAll({ page: 1, limit: 8 }).books;
      res.render('home', { title: 'Trang chủ', stats, featuredBooks });
    } catch (err) {
      res.render('home', { title: 'Trang chủ', stats: { totalBooks: 0, totalReaders: 0, activeBorrows: 0 }, featuredBooks: [] });
    }
  }
}

module.exports = HomeController;
