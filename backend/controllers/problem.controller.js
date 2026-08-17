const Problem = require('../models/problem.model');

exports.listProblems = async (req, res, next) => {
  try {
    const { difficulty, topic, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const problems = await Problem.findAll({ difficulty, topic, search, limit, offset });
    res.json({ success: true, count: problems.length, problems });
  } catch (err) { next(err); }
};

exports.getProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    const sampleCases = (await Problem.getTestCases(req.params.id)).filter(tc => tc.is_sample);
    res.json({ success: true, problem, sampleCases });
  } catch (err) { next(err); }
};

exports.getProblemBySlug = async (req, res, next) => {
  try {
    const problem = await Problem.findBySlug(req.params.slug);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    const sampleCases = (await Problem.getTestCases(problem.id)).filter(tc => tc.is_sample);
    res.json({ success: true, problem, sampleCases });
  } catch (err) { next(err); }
};

exports.getHints = async (req, res, next) => {
  try {
    const hints = await Problem.getHints(req.params.id);
    res.json({ success: true, hints });
  } catch (err) { next(err); }
};

exports.unlockHint = async (req, res, next) => {
  try {
    const { id, hintNum } = req.params;
    const pool = require('../config/db');
    await pool.query(
      `INSERT IGNORE INTO user_hints (user_id, problem_id, hint_number) VALUES (?, ?, ?)`,
      [req.user.id, id, hintNum]
    );
    res.json({ success: true, message: `Hint ${hintNum} unlocked` });
  } catch (err) { next(err); }
};

exports.createProblem = async (req, res, next) => {
  try {
    const data = { ...req.body, created_by: req.user.id };
    const id = await Problem.create(data);
    const problem = await Problem.findById(id);
    res.status(201).json({ success: true, message: 'Problem created successfully', problem });
  } catch (err) { next(err); }
};

exports.updateProblem = async (req, res, next) => {
  try {
    await Problem.update(req.params.id, req.body);
    const problem = await Problem.findById(req.params.id);
    res.json({ success: true, message: 'Problem updated successfully', problem });
  } catch (err) { next(err); }
};

exports.deleteProblem = async (req, res, next) => {
  try {
    await Problem.delete(req.params.id);
    res.json({ success: true, message: 'Problem deleted successfully' });
  } catch (err) { next(err); }
};

exports.addTestCase = async (req, res, next) => {
  try {
    const id = await Problem.addTestCase(req.params.id, req.body);
    res.status(201).json({ success: true, message: 'Test case added successfully', id });
  } catch (err) { next(err); }
};
