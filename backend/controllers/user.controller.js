const User = require('../models/user.model');
const Submission = require('../models/submission.model');
const pool = require('../config/db');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const [subStats] = await pool.query(
      `SELECT verdict, COUNT(*) as count FROM submissions WHERE user_id = ? GROUP BY verdict`,
      [userId]
    );
    const [topicStats] = await pool.query(
      `SELECT p.topic, COUNT(DISTINCT p.id) as solved
       FROM submissions s
       JOIN problems p ON s.problem_id = p.id
       WHERE s.user_id = ? AND s.verdict = 'Accepted'
       GROUP BY p.topic`,
      [userId]
    );

    res.json({ success: true, submissionStats: subStats, topicStats });
  } catch (err) { next(err); }
};

exports.getActivity = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE(submitted_at) as date, COUNT(*) as count
       FROM submissions
       WHERE user_id = ? AND submitted_at >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
       GROUP BY DATE(submitted_at)
       ORDER BY date ASC`,
      [req.params.id]
    );
    res.json({ success: true, activity: rows });
  } catch (err) { next(err); }
};

exports.getSubmissions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const submissions = await Submission.findByUser(req.params.id, { limit, offset });
    res.json({ success: true, submissions });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, institution } = req.body;
    await User.update(req.user.id, { name, institution });
    const user = await User.findById(req.user.id);
    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (err) { next(err); }
};
