const Contest = require('../models/contest.model');

exports.listContests = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const contests = await Contest.findAll({ status, type, limit, offset });
    res.json({ success: true, contests });
  } catch (err) { next(err); }
};

exports.getContest = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    const problems = await Contest.getProblems(req.params.id);
    res.json({ success: true, contest, problems });
  } catch (err) { next(err); }
};

exports.createContest = async (req, res, next) => {
  try {
    const { title, description, start_time, end_time, type, problem_ids } = req.body;
    if (!title || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'title, start_time, and end_time are required' });
    }

    const contestId = await Contest.create({
      title,
      description,
      start_time,
      end_time,
      type,
      faculty_id: req.user.id
    });

    if (Array.isArray(problem_ids)) {
      for (let i = 0; i < problem_ids.length; i++) {
        await Contest.addProblem(contestId, problem_ids[i], 100, i + 1);
      }
    }

    const contest = await Contest.findById(contestId);
    res.status(201).json({ success: true, message: 'Contest created successfully', contest });
  } catch (err) { next(err); }
};

exports.joinContest = async (req, res, next) => {
  try {
    await Contest.addParticipant(req.params.id, req.user.id);
    res.json({ success: true, message: 'Registered for contest successfully' });
  } catch (err) { next(err); }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await Contest.getLeaderboard(req.params.id);
    res.json({ success: true, leaderboard });
  } catch (err) { next(err); }
};

exports.getSubmissions = async (req, res, next) => {
  try {
    const pool = require('../config/db');
    const [submissions] = await pool.query(
      `SELECT s.*, p.title as problem_title, u.name as user_name
       FROM submissions s
       JOIN problems p ON s.problem_id = p.id
       JOIN users u ON s.user_id = u.id
       WHERE s.contest_id = ?
       ORDER BY s.submitted_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, submissions });
  } catch (err) { next(err); }
};
