const express = require('express');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

// Khởi tạo DB ngay khi start
require('./src/database/db').getDb();

const bookRoutes = require('./src/routes/bookRoutes');
const readerRoutes = require('./src/routes/readerRoutes');
const borrowRoutes = require('./src/routes/borrowRoutes');
const BorrowController = require('./src/controllers/borrowController');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== TEMPLATE ENGINE =====
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// ===== MIDDLEWARE =====
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Method Override (cho PUT và DELETE qua form HTML)
app.use(methodOverride('_method'));
app.use(methodOverride((req) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// Session (cho flash messages)
app.use(session({
  secret: 'library-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 }, // 1 giờ
}));

// Local vars cho tất cả views
app.use((req, res, next) => {
  // Lấy phần đầu của path để highlight active nav
  res.locals.currentPath = req.path.split('/').filter(Boolean)[0] || '';
  next();
});

// ===== ROUTES =====
app.get('/', BorrowController.dashboard);
app.use('/books', bookRoutes);
app.use('/readers', readerRoutes);
app.use('/borrows', borrowRoutes);

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Không tìm thấy trang',
    message: `Trang "${req.path}" không tồn tại.`,
  });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).render('error', {
    title: 'Lỗi server',
    message: err.message || 'Lỗi nội bộ máy chủ.',
  });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log('');
  console.log('  📚 ====================================');
  console.log('     HỆ THỐNG QUẢN LÝ THƯ VIỆN MINI');
  console.log('  📚 ====================================');
  console.log(`  🚀 Server chạy tại: http://localhost:${PORT}`);
  console.log(`  📖 Quản lý sách:    http://localhost:${PORT}/books`);
  console.log(`  👥 Độc giả:         http://localhost:${PORT}/readers`);
  console.log(`  📋 Mượn/Trả:        http://localhost:${PORT}/borrows`);
  console.log('  ======================================');
  console.log('');
});

module.exports = app;
