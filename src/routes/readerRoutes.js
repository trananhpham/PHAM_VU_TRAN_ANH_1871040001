const express = require('express');
const router = express.Router();
const ReaderController = require('../controllers/readerController');

router.get('/', ReaderController.index);
router.get('/new', ReaderController.newForm);
router.post('/', ReaderController.create);
router.get('/:id', ReaderController.show);
router.get('/:id/edit', ReaderController.editForm);
router.put('/:id', ReaderController.update);
router.delete('/:id', ReaderController.delete);

module.exports = router;
