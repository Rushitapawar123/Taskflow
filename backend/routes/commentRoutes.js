const express = require('express');
const router = express.Router();
const { addComment, getComments } = require('../controllers/commentController');
const protect = require('../middleware/authMiddleware');

router.post('/:cardId', protect, addComment);
router.get('/:cardId', protect, getComments);

module.exports = router;