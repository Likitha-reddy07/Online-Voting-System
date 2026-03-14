const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all elections
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM elections');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add an election
router.post('/', async (req, res) => {
  const { title, description, start_date, end_date } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO elections (title, description, start_date, end_date) VALUES (?, ?, ?, ?)',
      [title, description, start_date, end_date]
    );
    res.json({ id: result.insertId, title, description, start_date, end_date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;