const express = require('express');
const router = express.Router();
const { createList, getLists, updateList, deleteList } = require('../controllers/ListController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, createList);
router.get('/:boardId', protect, getLists);
router.put('/:id', protect, updateList);
router.delete('/:id', protect, deleteList);

module.exports = router;