const express = require('express');
const router = express.Router();
const BookController = require('../controllers/bookController');

router.get('/', BookController.index);
router.get('/new', BookController.newForm);
router.post('/', BookController.create);
router.get('/:id', BookController.show);
router.get('/:id/edit', BookController.editForm);
router.put('/:id', BookController.update);
router.delete('/:id', BookController.delete);

module.exports = router;
