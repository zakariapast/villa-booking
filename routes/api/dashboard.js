const express = require('express');
const router = express.Router();

const Villa = require('../../models/Villa');
const Room = require('../../models/Room');
const Booking = require('../../models/Booking');

router.get('/summary', async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const totalVillas = await Villa.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });

    res.json({ totalRooms, totalVillas, totalBookings, confirmedBookings });
  } catch (error) {
    console.error('Dashboard Summary Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
