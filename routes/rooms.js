// routes/rooms.js (MongoDB version)

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const connectToDB = require('../config/db');

// GET all rooms or filter by villaId
router.get('/rooms', async (req, res) => {
  try {
    const db = await connectToDB();
    const query = req.query.villaId ? { villaId: req.query.villaId } : {};
    const rooms = await db.collection('rooms').find(query).toArray();
    res.json(rooms);
  } catch (err) {
    console.error('Failed to fetch rooms:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST a new room
router.post('/rooms', async (req, res) => {
  const newRoom = {
    id: uuidv4(),
    villaId: req.body.villaId,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    image: req.body.image || '',
    amenities: req.body.amenities || [],
    createdAt: new Date()
  };

  try {
    const db = await connectToDB();
    await db.collection('rooms').insertOne(newRoom);
    res.status(201).json({ message: 'Room added successfully', room: newRoom });
  } catch (err) {
    console.error('Failed to add room:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
