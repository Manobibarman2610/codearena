const Submission = require('../models/submission.model');
const Problem = require('../models/problem.model');
const judgeService = require('../services/judge.service');

exports.createSubmission = async (req, res, next) => {
  try {
    const { problem_id, language, code, contest_id } = req.body;
    if (!problem_id || !language || !code) {
      return res.status(400).json({ success: false, message: 'problem_id, language, and code are required' });
    }

    const problem = await Problem.findById(problem_id);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    // 1. Create pending record
    const submissionId = await Submission.create({
      user_id: req.user.id,
      problem_id,
      contest_id,
      language,
      code,
      verdict: 'Pending'
    });

    // 2. Run evaluation
    judgeService.processSubmission(submissionId, {
      userId: req.user.id,
      problem,
      language,
      code,
      contestId: contest_id
    }).catch(err => console.error('[Judge Worker Error]', err));

    res.status(202).json({
      success: true,
      message: 'Submission queued for execution',
      submissionId
    });
  } catch (err) { next(err); }
};

exports.runCode = async (req, res, next) => {
  try {
    const { language, code, stdin = '', expected_output = '' } = req.body;
    if (!language || !code) {
      return res.status(400).json({ success: false, message: 'language and code are required' });
    }

    const result = await judgeService.runCustomInput({ language, code, stdin, expectedOutput: expected_output });
    res.json({ success: true, result });
  } catch (err) { next(err); }
};

exports.getSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
    res.json({ success: true, submission });
  } catch (err) { next(err); }
};

exports.getUserSubmissionsForProblem = async (req, res, next) => {
  try {
    const submissions = await Submission.findByUserAndProblem(req.user.id, req.params.problemId);
    res.json({ success: true, submissions });
  } catch (err) { next(err); }
};
