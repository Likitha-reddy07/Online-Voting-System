const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all candidates
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT c.*, p.position_name FROM candidates c JOIN positions p ON c.position_id = p.id'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a candidate
router.post('/', async (req, res) => {
  const { name, position_id, party } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO candidates (name, position_id, party) VALUES (?, ?, ?)',
      [name, position_id, party]
    );
    res.json({ id: result.insertId, name, position_id, party });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;