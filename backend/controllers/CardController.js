const Card = require('../models/Card');
const List = require('../models/List');
const logActivity = require('../utils/logActivity');

exports.createCard = async (req, res) => {
  try {
    const { title, description, listId, order } = req.body;

    const card = await Card.create({
      title,
      description,
      list: listId,
      order: order || 0
    });

    const list = await List.findById(listId);
    if (list) {
      const io = req.app.get('io');
      logActivity(io, list.board, req.userId, `added card "${title}" to "${list.title}"`);
    }

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
    const oldCard = await Card.findById(id);
    const card = await Card.findByIdAndUpdate(id, req.body, { new: true }).populate('assignedTo', 'name');

    const list = await List.findById(card.list);
    if (list) {
      const io = req.app.get('io');

      // Card doosri list mein move hua
      if (req.body.list && req.body.list !== String(oldCard.list)) {
        const newList = await List.findById(req.body.list);
        logActivity(io, list.board, req.userId, `moved card "${card.title}" to "${newList?.title}"`);
      }
      // Priority badli
      else if (req.body.priority && req.body.priority !== oldCard.priority) {
        logActivity(io, list.board, req.userId, `changed priority of "${card.title}" to ${req.body.priority}`);
      }
      // Assign hua
      else if (req.body.assignedTo && req.body.assignedTo !== String(oldCard.assignedTo)) {
        logActivity(io, list.board, req.userId, `assigned "${card.title}" to a member`);
      }
    }

    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findById(id);
    await Card.findByIdAndDelete(id);

    if (card) {
      const list = await List.findById(card.list);
      if (list) {
        const io = req.app.get('io');
        logActivity(io, list.board, req.userId, `deleted card "${card.title}"`);
      }
    }

    res.json({ message: 'Card deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};