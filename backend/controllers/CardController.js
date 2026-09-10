const Card = require('../models/Card');

// Create Card
exports.createCard = async (req, res) => {
  try {
    const { title, description, listId, order } = req.body;

    const card = await Card.create({
      title,
      description,
      list: listId,
      order: order || 0
    });

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all cards for a list
exports.getCards = async (req, res) => {
  try {
    const { listId } = req.params;
    const cards = await Card.find({ list: listId }).sort('order');
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update card (for drag-drop, edit, etc.)
exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findByIdAndUpdate(id, req.body, { new: true });
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete card
exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    await Card.findByIdAndDelete(id);
    res.json({ message: 'Card deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};