const Comment = require('../models/Comment');

exports.addComment = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { text } = req.body;

    const comment = await Comment.create({
      text,
      card: cardId,
      author: req.userId
    });

    const populatedComment = await comment.populate('author', 'name');

    const io = req.app.get('io');
    io.to(`card-${cardId}`).emit('newComment', populatedComment);

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { cardId } = req.params;
    const comments = await Comment.find({ card: cardId })
      .populate('author', 'name')
      .sort('createdAt');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};