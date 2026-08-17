const pool = require('../config/db');

const Problem = {
  async findAll({ difficulty, topic, search, limit = 20, offset = 0 } = {}) {
    let sql = `SELECT id, title, slug, difficulty, topic, time_limit, memory_limit, total_submissions, accepted_submissions, created_at FROM problems WHERE 1=1`;
    const params = [];
    if (difficulty) { sql += ` AND difficulty = ?`; params.push(difficulty); }
    if (topic)      { sql += ` AND topic = ?`;      params.push(topic); }
    if (search)     { sql += ` AND (title LIKE ? OR description LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
    sql += ` ORDER BY id ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT * FROM problems WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  async findBySlug(slug) {
    const [rows] = await pool.query(`SELECT * FROM problems WHERE slug = ?`, [slug]);
    return rows[0] || null;
  },

  async create(data) {
    const { title, slug, difficulty, topic, description, input_format, output_format, constraints, sample_input, sample_output, starter_code, solution_code, time_limit = 2000, memory_limit = 256, created_by } = data;
    const [result] = await pool.query(
      `INSERT INTO problems (title, slug, difficulty, topic, description, input_format, output_format, constraints, sample_input, sample_output, starter_code, solution_code, time_limit, memory_limit, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, difficulty, topic, description, input_format, output_format, constraints, sample_input, sample_output, JSON.stringify(starter_code || {}), solution_code, time_limit, memory_limit, created_by]
    );
    return result.insertId;
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) {
        fields.push(`${k} = ?`);
        values.push(k === 'starter_code' ? JSON.stringify(v) : v);
      }
    }
    if (!fields.length) return;
    values.push(id);
    await pool.query(`UPDATE problems SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async delete(id) {
    await pool.query(`DELETE FROM problems WHERE id = ?`, [id]);
  },

  async getTestCases(problemId) {
    const [rows] = await pool.query(
      `SELECT * FROM test_cases WHERE problem_id = ? ORDER BY is_sample DESC, id ASC`,
      [problemId]
    );
    return rows;
  },

  async addTestCase(problemId, { input_data, expected_output, is_sample = 0, explanation = null }) {
    const [result] = await pool.query(
      `INSERT INTO test_cases (problem_id, input_data, expected_output, is_sample, explanation)
       VALUES (?, ?, ?, ?, ?)`,
      [problemId, input_data, expected_output, is_sample ? 1 : 0, explanation]
    );
    return result.insertId;
  },

  async getHints(problemId) {
    const [rows] = await pool.query(
      `SELECT * FROM hints WHERE problem_id = ? ORDER BY hint_number ASC`,
      [problemId]
    );
    return rows;
  },

  async incrementSubmission(id, isAccepted) {
    await pool.query(
      `UPDATE problems SET total_submissions = total_submissions + 1,
       accepted_submissions = accepted_submissions + ? WHERE id = ?`,
      [isAccepted ? 1 : 0, id]
    );
  }
};

module.exports = Problem;
