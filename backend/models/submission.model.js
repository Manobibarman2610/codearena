const pool = require('../config/db');

const Submission = {
  async create({ user_id, problem_id, contest_id, language, code, verdict = 'Pending' }) {
    const [result] = await pool.query(
      `INSERT INTO submissions (user_id, problem_id, contest_id, language, code, verdict)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, problem_id, contest_id || null, language, code, verdict]
    );
    return result.insertId;
  },

  async updateVerdict(id, { verdict, runtime_ms, memory_kb, error_message, passed_cases, total_cases }) {
    await pool.query(
      `UPDATE submissions
       SET verdict = ?, runtime_ms = ?, memory_kb = ?, error_message = ?,
           passed_cases = ?, total_cases = ?
       WHERE id = ?`,
      [verdict, runtime_ms || 0, memory_kb || 0, error_message || null, passed_cases || 0, total_cases || 0, id]
    );
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT s.*, p.title as problem_title, u.name as user_name
       FROM submissions s
       JOIN problems p ON s.problem_id = p.id
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByUser(userId, { limit = 20, offset = 0 } = {}) {
    const [rows] = await pool.query(
      `SELECT s.*, p.title as problem_title, p.difficulty
       FROM submissions s
       JOIN problems p ON s.problem_id = p.id
       WHERE s.user_id = ?
       ORDER BY s.submitted_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );
    return rows;
  },

  async findByUserAndProblem(userId, problemId) {
    const [rows] = await pool.query(
      `SELECT * FROM submissions
       WHERE user_id = ? AND problem_id = ?
       ORDER BY submitted_at DESC`,
      [userId, problemId]
    );
    return rows;
  }
};

module.exports = Submission;
