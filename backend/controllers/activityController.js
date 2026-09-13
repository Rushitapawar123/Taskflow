const Activity = require('../models/Activity');

exports.getActivities = async (req, res) => {
  try {
    const { boardId } = req.params;
    const activities = await Activity.find({ board: boardId })
      .populate('user', 'name')
      .sort('-createdAt')
      .limit(50);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};