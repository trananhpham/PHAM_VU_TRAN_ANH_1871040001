const express = require('express');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

// Khởi tạo DB ngay khi start
require('./src/database/db').getDb();

const HomeController = require('./src/controllers/homeController');
const adminRoutes = require('./src/routes/adminRoutes');

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

// Method Override (PUT / DELETE qua form HTML)
app.use(methodOverride('_method'));
app.use(methodOverride((req) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// Session
app.use(session({
  secret: 'library-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 4 * 60 * 60 * 1000 }, // 4 giờ
}));

// Locals cho EJS layout (currentPath cho sidebar cũ)
app.use((req, res, next) => {
  res.locals.currentPath = req.path.split('/').filter(Boolean)[0] || '';
  next();
});

// ===== ROUTES =====

// Trang chính (Landing Page)
app.get('/', HomeController.index);

// Admin Panel
app.use('/admin', adminRoutes);

// ===== 404 =====
app.use((req, res) => {
  // Nếu là admin route → render với admin layout không thể, dùng JSON
  if (req.path.startsWith('/admin')) {
    return res.status(404).send('<div style="font-family:monospace;padding:40px;background:#09090b;color:#f87171;min-height:100vh">404 — Trang không tồn tại. <a href="/admin/dashboard" style="color:#818cf8">Về Dashboard</a></div>');
  }
  res.status(404).render('error', { title: 'Không tìm thấy', message: `Trang "${req.path}" không tồn tại.` });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  if (req.path.startsWith('/admin')) {
    return res.status(500).send(`<div style="font-family:monospace;padding:40px;background:#09090b;color:#f87171;min-height:100vh">500 — ${err.message}. <a href="/admin/dashboard" style="color:#818cf8">Về Dashboard</a></div>`);
  }
  res.status(500).render('error', { title: 'Lỗi server', message: err.message || 'Lỗi nội bộ.' });
});

// ===== START =====
app.listen(PORT, () => {
  console.log('');
  console.log('  📚 ========================================');
  console.log('       HỆ THỐNG QUẢN LÝ THƯ VIỆN MINI');
  console.log('  📚 ========================================');
  console.log(`  🌐 Trang chính:  http://localhost:${PORT}`);
  console.log(`  🔑 Admin Panel:  http://localhost:${PORT}/admin`);
  console.log(`  📖 Quản lý sách: http://localhost:${PORT}/admin/books`);
  console.log(`  👥 Độc giả:      http://localhost:${PORT}/admin/readers`);
  console.log(`  📋 Mượn/Trả:     http://localhost:${PORT}/admin/borrows`);
  console.log('  ========================================');
  console.log(`  🔑 Login: admin / admin123`);
  console.log('');
});

module.exports = app;
