// routes/villas.js (MongoDB version)

const express = require('express');
const router = express.Router();
const connectToDB = require('../config/db');

// GET all villas
router.get('/villas', async (req, res) => {
  try {
    const db = await connectToDB();
    const villas = await db.collection('villas').find().toArray();
    res.json(villas);
  } catch (err) {
    console.error('Failed to fetch villas:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET single villa by ID
router.get('/villas/:id', async (req, res) => {
  try {
    const db = await connectToDB();
    const villa = await db.collection('villas').findOne({ id: req.params.id });
    if (!villa) return res.status(404).json({ error: 'Villa not found' });
    res.json(villa);
  } catch (err) {
    console.error('Error getting villa by ID:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
