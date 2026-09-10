const List = require('../models/List');

// Create List
exports.createList = async (req, res) => {
  try {
    const { title, boardId, order } = req.body;

    const list = await List.create({
      title,
      board: boardId,
      order: order || 0
    });

    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all lists for a board
exports.getLists = async (req, res) => {
  try {
    const { boardId } = req.params;
    const lists = await List.find({ board: boardId }).sort('order');
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};