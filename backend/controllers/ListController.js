const List = require('../models/List');
const Card = require('../models/Card');
const logActivity = require('../utils/logActivity');

exports.createList = async (req, res) => {
  try {
    const { title, boardId, order } = req.body;
    const list = await List.create({ title, board: boardId, order: order || 0 });

    const io = req.app.get('io');
    logActivity(io, boardId, req.userId, `created list "${title}"`);

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

exports.updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const oldList = await List.findById(id);
    const list = await List.findByIdAndUpdate(id, req.body, { new: true });

    if (req.body.title && req.body.title !== oldList.title) {
      const io = req.app.get('io');
      logActivity(io, list.board, req.userId, `renamed list "${oldList.title}" to "${req.body.title}"`);
    }

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await List.findById(id);
    await List.findByIdAndDelete(id);
    await Card.deleteMany({ list: id });

    if (list) {
      const io = req.app.get('io');
      logActivity(io, list.board, req.userId, `deleted list "${list.title}"`);
    }

    res.json({ message: 'List deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};