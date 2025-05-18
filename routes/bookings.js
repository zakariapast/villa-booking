// routes/bookings.js (MongoDB version)

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const connectToDB = require('../config/db');

// GET all bookings
router.get('/bookings', async (req, res) => {
  try {
    const db = await connectToDB();
    const bookings = await db.collection('bookings').find().toArray();
    res.json(bookings);
  } catch (err) {
    console.error('Failed to fetch bookings:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST a new booking
router.post('/bookings', async (req, res) => {
  const newBooking = {
    id: uuidv4(),
    villaId: req.body.villaId,
    checkin: req.body.checkin,
    checkout: req.body.checkout,
    name: req.body.name || '',
    email: req.body.email || '',
    guests: req.body.guests || '',
    requests: req.body.requests || '',
    createdAt: new Date()
  };

  try {
    const db = await connectToDB();
    await db.collection('bookings').insertOne(newBooking);
    res.status(201).json({ message: 'Booking added successfully', booking: newBooking });
  } catch (err) {
    console.error('Failed to add booking:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
