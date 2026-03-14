const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// DB connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',      // <-- Put your MySQL username here
  password: '23091a05a4',  // <-- Put your MySQL password here
  database: 'voting_system'         // <-- Ensure this database exists and user has access
});

// -------- Positions APIs --------

// Get all positions
app.get('/api/positions', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM positions ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add position
app.post('/api/positions', async (req, res) => {
  const { position_name, description } = req.body;
  if (!position_name) return res.status(400).json({ error: 'Position name required' });

  try {
    const [result] = await db.query(
      'INSERT INTO positions (position_name, description, created_at) VALUES (?, ?, NOW())',
      [position_name, description || null]
    );
    res.json({ id: result.insertId, position_name, description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------- Candidates APIs --------

// Get all candidates with position
app.get('/api/candidates', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.name, c.party, c.position_id, p.position_name, c.votes_count, c.created_at
       FROM candidates c 
       LEFT JOIN positions p ON c.position_id = p.id 
       ORDER BY c.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add candidate
app.post('/api/candidates', async (req, res) => {
  const { name, position_id, party } = req.body;
  if (!name || !position_id || !party) return res.status(400).json({ error: 'Missing fields' });

  try {
    const [result] = await db.query(
      'INSERT INTO candidates (name, position_id, party, votes_count, created_at) VALUES (?, ?, ?, 0, NOW())',
      [name, position_id, party]
    );
    res.json({ id: result.insertId, name, position_id, party });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------- Voters APIs --------


// Use voters router for all voter endpoints
const votersRouter = require('./routes/voters');
app.use('/api/voters', votersRouter);
// -------- Votes API --------

// Cast a vote
app.post('/api/votes', async (req, res) => {
  const { voter_id, candidate_id, position_id } = req.body;

  if (!voter_id || !candidate_id || !position_id) {
    return res.status(400).json({ error: 'Voter, Candidate, and Position are required' });
  }

  try {
    // Optional: Check if voter already voted for this position
    const [existing] = await db.query(
      'SELECT * FROM votes WHERE voter_id = ? AND position_id = ?',
      [voter_id, position_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'You have already voted for this position' });
    }

    // Insert the vote
    await db.query(
      'INSERT INTO votes (voter_id, candidate_id, position_id) VALUES (?, ?, ?)',
      [voter_id, candidate_id, position_id]
    );

    // Optional: Increment votes_count in candidates table
    await db.query(
      'UPDATE candidates SET votes_count = votes_count + 1 WHERE id = ?',
      [candidate_id]
    );

    res.json({ message: 'Vote cast successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// -------- Elections APIs --------
// Remove direct elections API routes from here
// const electionsRouter = require('./routes/elections');
// app.use('/api/elections', electionsRouter);

const electionsRouter = require('./routes/elections');
app.use('/api/elections', electionsRouter);

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});