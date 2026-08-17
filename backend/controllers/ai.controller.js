const aiService = require('../services/ai.service');

exports.analyzeCode = async (req, res, next) => {
  try {
    const { problem_id, code, language, verdict, error_message, custom_query } = req.body;
    if (!code || !language) {
      return res.status(400).json({ success: false, message: 'code and language are required' });
    }

    const analysis = await aiService.generateFeedback({
      userId: req.user.id,
      problemId: problem_id,
      code,
      language,
      verdict,
      errorMessage: error_message,
      customQuery: custom_query
    });

    res.json({ success: true, analysis });
  } catch (err) { next(err); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const { problemId } = req.params;
    const history = await aiService.getHistory(req.user.id, problemId);
    res.json({ success: true, history });
  } catch (err) { next(err); }
};
