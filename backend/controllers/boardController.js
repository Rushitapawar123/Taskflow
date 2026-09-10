const Board = require('../models/Board');

// Create Board
exports.createBoard = async (req, res) => {
  try {
    const { title } = req.body;

    const board = await Board.create({
      title,
      owner: req.userId,
      members: [req.userId]
    });

    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all boards for logged-in user
exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ members: req.userId });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};