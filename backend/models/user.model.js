const pool = require('../config/db');

const User = {
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, institution, rating, solved_count, created_at FROM users WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
    return rows[0] || null;
  },

  async create({ name, email, password_hash, role = 'student', institution }) {
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, institution) VALUES (?, ?, ?, ?, ?)`,
      [name, email, password_hash, role, institution || '']
    );
    return result.insertId;
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) {
        fields.push(`${k} = ?`);
        values.push(v);
      }
    }
    if (!fields.length) return;
    values.push(id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async incrementSolved(id) {
    await pool.query(`UPDATE users SET solved_count = solved_count + 1 WHERE id = ?`, [id]);
  }
};

module.exports = User;
