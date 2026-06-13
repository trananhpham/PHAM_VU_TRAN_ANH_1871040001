/**
 * Middleware xác thực Admin
 * Kiểm tra session, nếu chưa đăng nhập → redirect về /admin/login
 */
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  req.session.flash = { type: 'error', message: 'Vui lòng đăng nhập để tiếp tục!' };
  res.redirect('/admin/login');
}

module.exports = { requireAdmin };
