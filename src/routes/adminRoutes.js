const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/adminAuth');

// ── Auth (không cần login) ──────────────────────────
router.get('/', AdminController.redirectToDashboard);
router.get('/login', AdminController.loginForm);
router.post('/login', AdminController.login);
router.get('/logout', AdminController.logout);

// ── Dashboard (cần login) ───────────────────────────
router.get('/dashboard', requireAdmin, AdminController.dashboard);

// ── Books ───────────────────────────────────────────
router.get('/books', requireAdmin, AdminController.booksIndex);
router.get('/books/new', requireAdmin, AdminController.booksNew);
router.post('/books', requireAdmin, AdminController.booksCreate);
router.get('/books/:id', requireAdmin, AdminController.booksShow);
router.get('/books/:id/edit', requireAdmin, AdminController.booksEdit);
router.put('/books/:id', requireAdmin, AdminController.booksUpdate);
router.delete('/books/:id', requireAdmin, AdminController.booksDelete);

// ── Readers ─────────────────────────────────────────
router.get('/readers', requireAdmin, AdminController.readersIndex);
router.get('/readers/new', requireAdmin, AdminController.readersNew);
router.post('/readers', requireAdmin, AdminController.readersCreate);
router.get('/readers/:id', requireAdmin, AdminController.readersShow);
router.get('/readers/:id/edit', requireAdmin, AdminController.readersEdit);
router.put('/readers/:id', requireAdmin, AdminController.readersUpdate);
router.delete('/readers/:id', requireAdmin, AdminController.readersDelete);

// ── Borrows ─────────────────────────────────────────
router.get('/borrows', requireAdmin, AdminController.borrowsIndex);
router.get('/borrows/new', requireAdmin, AdminController.borrowsNew);
router.post('/borrows', requireAdmin, AdminController.borrowsCreate);
router.get('/borrows/:id', requireAdmin, AdminController.borrowsShow);
router.post('/borrows/:id/return', requireAdmin, AdminController.borrowsReturn);

module.exports = router;
