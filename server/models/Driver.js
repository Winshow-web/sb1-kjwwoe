import pool from '../db/index.js';

export default {
  async create({ userId, experience, licenseType, photo, specializations, phone, serviceArea }) {
    const result = await pool.query(
      `INSERT INTO drivers (user_id, experience, license_type, photo, specializations, phone, service_area)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, experience, licenseType, photo, specializations, phone, serviceArea]
    );
    return result.rows[0];
  },

  async findByUserId(userId) {
    const result = await pool.query(
      `SELECT d.*, u.name, u.email 
       FROM drivers d 
       JOIN users u ON d.user_id = u.id 
       WHERE u.id = $1`,
      [userId]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query(
      `SELECT d.*, u.name, u.email 
       FROM drivers d 
       JOIN users u ON d.user_id = u.id`
    );
    return result.rows;
  },

  async updateAvailability(userId, availability) {
    const result = await pool.query(
      'UPDATE drivers SET availability = $1 WHERE user_id = $2 RETURNING *',
      [availability, userId]
    );
    return result.rows[0];
  },

  async update(userId, updates) {
    const fields = Object.keys(updates)
      .map((key, i) => `${key} = $${i + 2}`)
      .join(', ');
    const values = Object.values(updates);
    
    const result = await pool.query(
      `UPDATE drivers SET ${fields} WHERE user_id = $1 RETURNING *`,
      [userId, ...values]
    );
    return result.rows[0];
  }
};