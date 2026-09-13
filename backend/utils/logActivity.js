const Activity = require('../models/Activity');

// Har jagah se ek hi line mein activity log karne ke liye helper
async function logActivity(io, boardId, userId, message) {
  try {
    const activity = await Activity.create({ board: boardId, user: userId, message });
    const populated = await activity.populate('user', 'name');
    io.to(boardId).emit('newActivity', populated);
  } catch (error) {
    console.log('Error logging activity:', error.message);
  }
}

module.exports = logActivity;