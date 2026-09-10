const express = require('express');
const router = express.Router();
const { createList, getLists } = require('../controllers/listController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, createList);
router.get('/:boardId', protect, getLists);

module.exports = router;