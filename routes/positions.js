const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all positions
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM positions');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a position
router.post('/', async (req, res) => {
  const { position_name, description } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO positions (position_name, description) VALUES (?, ?)',
      [position_name, description]
    );
    res.json({ id: result.insertId, position_name, description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;