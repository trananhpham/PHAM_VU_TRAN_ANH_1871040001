const express = require('express');
const router = express.Router();
const BorrowController = require('../controllers/borrowController');

router.get('/', BorrowController.index);
router.get('/new', BorrowController.newForm);
router.post('/', BorrowController.create);
router.get('/:id', BorrowController.show);
router.post('/:id/return', BorrowController.returnBook);

module.exports = router;
