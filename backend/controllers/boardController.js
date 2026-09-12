const Board = require('../models/Board');
const User = require('../models/User');

exports.createBoard = async (req, res) => {
  try {
    const { title, color } = req.body;
    const board = await Board.create({
      title,
      color: color || '#3b82f6',
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

exports.getBoardById = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await Board.findById(id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await Board.findByIdAndUpdate(id, req.body, { new: true });

    const io = req.app.get('io');
    io.to(`user-${req.userId}`).emit('boardsUpdated');
    io.to(id).emit('refreshBoard');

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

exports.inviteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.members.includes(userToInvite._id)) {
      return res.status(400).json({ message: 'User is already a member of this board' });
    }

    board.members.push(userToInvite._id);
    await board.save();

    const io = req.app.get('io');
    io.to(`user-${userToInvite._id}`).emit('boardsUpdated');
    io.to(id).emit('refreshBoard');

    const updatedBoard = await Board.findById(id).populate('members', 'name email');
    res.json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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