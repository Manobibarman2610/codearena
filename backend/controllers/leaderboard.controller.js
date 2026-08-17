const Leaderboard = require('../models/leaderboard.model');

exports.getGlobal = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const leaderboard = await Leaderboard.getGlobal({ limit, offset });
    res.json({ success: true, leaderboard });
  } catch (err) { next(err); }
};

exports.getTop3 = async (req, res, next) => {
  try {
    const top3 = await Leaderboard.getTop3();
    res.json({ success: true, top3 });
  } catch (err) { next(err); }
};

exports.getMyRank = async (req, res, next) => {
  try {
    const rank = await Leaderboard.getUserRank(req.user.id);
    res.json({ success: true, rank });
  } catch (err) { next(err); }
};

exports.getContestLeaderboard = async (req, res, next) => {
  try {
    const Contest = require('../models/contest.model');
    const leaderboard = await Contest.getLeaderboard(req.params.id);
    res.json({ success: true, leaderboard });
  } catch (err) { next(err); }
};
