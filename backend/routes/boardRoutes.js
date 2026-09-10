const express = require('express');
const router = express.Router();
const { createBoard, getBoards } = require('../controllers/boardController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, createBoard);
router.get('/', protect, getBoards);

module.exports = router;