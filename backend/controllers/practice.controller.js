const Practice = require('../models/practice.model');
const judgeService = require('../services/judge.service');
const learningPathService = require('../services/learningPath.service');

exports.getLanguages = async (req, res, next) => {
  try {
    const languages = await Practice.getLanguages();
    res.json({ success: true, languages });
  } catch (err) { next(err); }
};

exports.getProgramsByLanguage = async (req, res, next) => {
  try {
    const { language } = req.params;
    const { category, difficulty, search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const programs = await Practice.findByLanguage(language, {
      category,
      difficulty,
      search,
      limit,
      offset
    });

    res.json({ success: true, count: programs.length, programs });
  } catch (err) { next(err); }
};

exports.getProgramById = async (req, res, next) => {
  try {
    const program = await Practice.findById(req.params.id);
    if (!program) return res.status(404).json({ success: false, message: 'Practice program not found' });
    const testCases = await Practice.getTestCases(req.params.id);
    res.json({ success: true, program, testCases });
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

exports.submitCode = async (req, res, next) => {
  try {
    const { program_id, language, code } = req.body;
    if (!program_id || !language || !code) {
      return res.status(400).json({ success: false, message: 'program_id, language, and code are required' });
    }

    const program = await Practice.findById(program_id);
    if (!program) return res.status(404).json({ success: false, message: 'Program not found' });

    const testCases = await Practice.getTestCases(program_id);
    const evalResult = await judgeService.evaluatePractice({
      language,
      code,
      testCases,
      timeLimit: program.time_limit,
      memoryLimit: program.memory_limit
    });

    // Record submission
    await Practice.recordAttempt(
      req.user.id,
      program_id,
      language,
      code,
      evalResult.verdict,
      evalResult.runtime_ms,
      evalResult.memory_kb
    );

    res.json({
      success: true,
      verdict: evalResult.verdict,
      runtime_ms: evalResult.runtime_ms,
      memory_kb: evalResult.memory_kb,
      passed_cases: evalResult.passed_cases,
      total_cases: evalResult.total_cases,
      test_results: evalResult.test_results,
      error_message: evalResult.error_message
    });
  } catch (err) { next(err); }
};

exports.getRecommendations = async (req, res, next) => {
  try {
    const recs = await learningPathService.getRecommendedProblems(req.user.id);
    res.json({ success: true, recommendations: recs });
  } catch (err) { next(err); }
};

exports.getLearningPath = async (req, res, next) => {
  try {
    const pathData = await learningPathService.generateStudentDossier(req.user.id);
    res.json({ success: true, dossier: pathData });
  } catch (err) { next(err); }
};

exports.createProgram = async (req, res, next) => {
  try {
    const id = await Practice.create(req.body);
    res.status(201).json({ success: true, message: 'Practice program created', id });
  } catch (err) { next(err); }
};
