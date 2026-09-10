const express = require('express');
const router = express.Router();
const { createCard, getCards, updateCard, deleteCard } = require('../controllers/CardController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, createCard);
router.get('/:listId', protect, getCards);
router.put('/:id', protect, updateCard);
router.delete('/:id', protect, deleteCard);

module.exports = router;