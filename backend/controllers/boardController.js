const Board = require('../models/Board');

exports.createBoard = async (req, res) => {
  try {
    const { title } = req.body;
    const board = await Board.create({
      title,
      owner: req.userId,
      members: [req.userId]
    });

    const io = req.app.get('io');
    io.to(`user-${req.userId}`).emit('boardsUpdated');

    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ members: req.userId });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Naya: Board delete karta hai
exports.deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    await Board.findByIdAndDelete(id);

    const io = req.app.get('io');
    io.to(`user-${req.userId}`).emit('boardsUpdated');

    res.json({ message: 'Board deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Naya: Board se member hataata hai
exports.removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const board = await Board.findById(id);

    if (board.owner.toString() === memberId) {
      return res.status(400).json({ message: "Cannot remove the board owner" });
    }

    board.members = board.members.filter((m) => m.toString() !== memberId);
    await board.save();

    const io = req.app.get('io');
    io.to(`user-${memberId}`).emit('boardsUpdated');
    io.to(id).emit('refreshBoard');

    const updatedBoard = await Board.findById(id).populate('members', 'name email');
    res.json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};