const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const bookingsPath = path.join(__dirname, '..', 'data', 'bookings.json');

// Ensure bookings file exists
if (!fs.existsSync(bookingsPath)) fs.writeFileSync(bookingsPath, '[]');

// GET all bookings
router.get('/api/bookings', (req, res) => {
  try {
    const bookings = JSON.parse(fs.readFileSync(bookingsPath, 'utf-8'));
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load bookings' });
  }
});

// POST new booking
router.post('/api/bookings', (req, res) => {
  const newBooking = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };

  try {
    const bookings = JSON.parse(fs.readFileSync(bookingsPath, 'utf-8'));
    bookings.push(newBooking);
    fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2));
    res.status(201).json({ message: 'Booking successful', booking: newBooking });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save booking' });
  }
});

// DELETE booking
router.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  try {
    let bookings = JSON.parse(fs.readFileSync(bookingsPath, 'utf-8'));
    bookings = bookings.filter(b => b.id !== id);
    fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2));
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

module.exports = router;
