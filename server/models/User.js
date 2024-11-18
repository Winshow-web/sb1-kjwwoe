import bcrypt from 'bcryptjs';
import pool from '../db/index.js';

export default {
  async create({ name, email, password, type }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, type) VALUES ($1, $2, $3, $4) RETURNING id, name, email, type',
      [name, email, hashedPassword, type]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query('SELECT id, name, email, type FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
};