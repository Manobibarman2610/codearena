const pool = require('../config/db');

class HintService {
  async getProblemHints(userId, problemId) {
    const [hints] = await pool.query(
      `SELECT h.id, h.hint_number, h.hint_text, h.penalty_points,
              IF(uh.unlocked_at IS NOT NULL, 1, 0) as is_unlocked
       FROM hints h
       LEFT JOIN user_hints uh ON h.problem_id = uh.problem_id 
                               AND h.hint_number = uh.hint_number 
                               AND uh.user_id = ?
       WHERE h.problem_id = ?
       ORDER BY h.hint_number ASC`,
      [userId, problemId]
    );
    return hints;
  }

  async unlockHint(userId, problemId, hintNumber) {
    const [hint] = await pool.query(
      `SELECT * FROM hints WHERE problem_id = ? AND hint_number = ?`,
      [problemId, hintNumber]
    );

    if (!hint.length) {
      throw new Error('Hint not found');
    }

    await pool.query(
      `INSERT IGNORE INTO user_hints (user_id, problem_id, hint_number) VALUES (?, ?, ?)`,
      [userId, problemId, hintNumber]
    );

    return hint[0];
  }
}

module.exports = new HintService();
