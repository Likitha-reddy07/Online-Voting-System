const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all votes
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT v.*, c.name AS candidate_name, p.position_name FROM votes v JOIN candidates c ON v.candidate_id = c.id JOIN positions p ON v.position_id = p.id'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cast a vote
router.post('/', async (req, res) => {
  const { voter_id, candidate_id, position_id } = req.body;
  try {
    // Check if voter exists
    const [voterRows] = await db.query('SELECT id FROM voters WHERE id = ?', [voter_id]);
    if (voterRows.length === 0) {
      return res.status(400).json({ error: 'Voter does not exist. Please register before voting.' });
    }

    // Insert vote
    await db.query('INSERT INTO votes (voter_id, candidate_id, position_id) VALUES (?, ?, ?)', [voter_id, candidate_id, position_id]);

    // Increment candidate vote count
    await db.query('UPDATE candidates SET votes_count = votes_count + 1 WHERE id = ?', [candidate_id]);

    res.json({ message: 'Vote cast successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;