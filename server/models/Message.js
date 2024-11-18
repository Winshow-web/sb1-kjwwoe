import pool from '../db/index.js';

export default {
  async create({ senderId, receiverId, content }) {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [senderId, receiverId, content]
    );
    return result.rows[0];
  },

  async findConversation(userId1, userId2) {
    const result = await pool.query(
      `SELECT m.*, u1.name as sender_name, u2.name as receiver_name
       FROM messages m
       JOIN users u1 ON m.sender_id = u1.id
       JOIN users u2 ON m.receiver_id = u2.id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2)
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.created_at ASC`,
      [userId1, userId2]
    );
    return result.rows;
  },

  async markAsRead(senderId, receiverId) {
    const result = await pool.query(
      `UPDATE messages 
       SET read = true 
       WHERE sender_id = $1 AND receiver_id = $2 AND read = false
       RETURNING *`,
      [senderId, receiverId]
    );
    return result.rows;
  }
};