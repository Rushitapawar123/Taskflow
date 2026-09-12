const Card = require('../models/Card');

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

exports.getCards = async (req, res) => {
  try {
    const { listId } = req.params;
    const cards = await Card.find({ list: listId })
      .populate('assignedTo', 'name')
      .sort('order');
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findByIdAndUpdate(id, req.body, { new: true }).populate('assignedTo', 'name');
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    await Card.findByIdAndDelete(id);
    res.json({ message: 'Card deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};