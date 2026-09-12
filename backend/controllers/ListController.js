const List = require('../models/List');
const Card = require('../models/Card');

exports.createList = async (req, res) => {
  try {
    const { title, boardId, order } = req.body;
    const list = await List.create({ title, board: boardId, order: order || 0 });
    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLists = async (req, res) => {
  try {
    const { boardId } = req.params;
    const lists = await List.find({ board: boardId }).sort('order');
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Naya: List ka title update karta hai (rename)
exports.updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await List.findByIdAndUpdate(id, req.body, { new: true });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Naya: List delete karta hai, aur uske andar ke saare cards bhi delete karta hai
exports.deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    await List.findByIdAndDelete(id);
    await Card.deleteMany({ list: id });
    res.json({ message: 'List deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};