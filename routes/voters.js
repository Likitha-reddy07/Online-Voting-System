const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all voters
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM voters');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a voter

router.post('/', async (req, res) => {
  const { name, age, voter_id, email, password } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO voters (name, age, voter_id, email, password) VALUES (?, ?, ?, ?, ?)',
      [name, age, voter_id, email, password]
    );
    res.json({ id: result.insertId, name, age, voter_id, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Voter login
router.post('/login', async (req, res) => {
  const { idOrEmail, password } = req.body;
  if (!idOrEmail || !password) {
    return res.status(400).json({ error: 'Email/Voter ID and password required' });
  }
  try {
    const [rows] = await db.query(
      'SELECT * FROM voters WHERE (email = ? OR voter_id = ?) AND password = ?',
      [idOrEmail, idOrEmail, password]
    );
    if (rows.length > 0) {
      const { password, ...voter } = rows[0];
      res.json({ success: true, voter });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;