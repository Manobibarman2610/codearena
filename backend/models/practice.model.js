const pool = require('../config/db');

const Practice = {
  async getLanguages() {
    const [rows] = await pool.query(`
      SELECT language, COUNT(*) as count 
      FROM practice_programs 
      GROUP BY language 
      ORDER BY FIELD(language, 'c', 'cpp', 'java', 'python', 'javascript')
    `);
    return rows;
  },

  async findByLanguage(language, { category, difficulty, search, limit = 50, offset = 0 } = {}) {
    let sql = `SELECT id, title, slug, language, category, difficulty, description, time_limit, memory_limit, created_at FROM practice_programs WHERE language = ?`;
    const params = [language];
    if (category)   { sql += ` AND category = ?`;   params.push(category); }
    if (difficulty) { sql += ` AND difficulty = ?`; params.push(difficulty); }
    if (search)     { sql += ` AND (title LIKE ? OR description LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
    sql += ` ORDER BY id ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT * FROM practice_programs WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  async getTestCases(programId) {
    const [rows] = await pool.query(`SELECT * FROM practice_testcases WHERE program_id = ? ORDER BY is_sample DESC, id ASC`, [programId]);
    return rows;
  },

  async create(data) {
    const { title, slug, language, category, difficulty, description, starter_code, solution_code, time_limit = 2000, memory_limit = 256 } = data;
    const [res] = await pool.query(
      `INSERT INTO practice_programs (title, slug, language, category, difficulty, description, starter_code, solution_code, time_limit, memory_limit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, language, category, difficulty, description, starter_code, solution_code, time_limit, memory_limit]
    );
    return res.insertId;
  },

  async recordAttempt(userId, programId, language, code, verdict, runtimeMs, memoryKb) {
    await pool.query(
      `INSERT INTO practice_submissions (user_id, program_id, language, code, verdict, runtime_ms, memory_kb)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, programId, language, code, verdict, runtimeMs, memoryKb]
    );
  },

  async getUserPracticeStats(userId) {
    const [stats] = await pool.query(`
      SELECT 
        language,
        COUNT(DISTINCT program_id) as attempted,
        COUNT(DISTINCT CASE WHEN verdict = 'Accepted' THEN program_id END) as solved,
        COUNT(*) as total_submissions
      FROM practice_submissions
      WHERE user_id = ?
      GROUP BY language
    `, [userId]);
    return stats;
  }
};

module.exports = Practice;
