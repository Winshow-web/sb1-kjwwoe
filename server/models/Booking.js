import pool from '../db/index.js';

export default {
  async create({ driverId, clientId, startDate, endDate, route, requirements }) {
    const result = await pool.query(
      `INSERT INTO bookings (driver_id, client_id, start_date, end_date, route, requirements)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [driverId, clientId, startDate, endDate, route, requirements]
    );
    return result.rows[0];
  },

  async findByUserId(userId, userType) {
    const field = userType === 'driver' ? 'driver_id' : 'client_id';
    const result = await pool.query(
      `SELECT b.*, d.photo, u.name as driver_name, c.name as client_name
       FROM bookings b
       JOIN drivers d ON b.driver_id = d.id
       JOIN users u ON d.user_id = u.id
       JOIN users c ON b.client_id = c.id
       WHERE b.${field} = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }
};