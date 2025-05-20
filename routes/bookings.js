// routes/bookings.js
const express = require('express');
const router = express.Router();
const connectToDB = require('../config/db');
const nodemailer = require('nodemailer');
const { ObjectId } = require('mongodb');

// Helper: Check overlap
function isOverlapping(start1, end1, start2, end2) {
  return (new Date(start1) < new Date(end2)) && (new Date(start2) < new Date(end1));
}

// POST /api/bookings
router.post('/', async (req, res) => {
  const { villaId, roomId, checkin, checkout, name, email, guests, notes } = req.body;

  if (!villaId || !checkin || !checkout || !name || !email) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const db = await connectToDB();

    // Check overlapping bookings
    const overlapping = await db.collection('bookings').find({
      roomId: roomId || null,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          checkin: { $lt: new Date(checkout) },
          checkout: { $gt: new Date(checkin) }
        }
      ]
    }).toArray();

    if (overlapping.length > 0) {
      return res.status(409).send('Selected dates are already booked');
    }

    const booking = {
      villaId,
      roomId: roomId || null,
      checkin: new Date(checkin),
      checkout: new Date(checkout),
      name,
      email,
      guests: parseInt(guests) || 1,
      notes: notes || '',
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    };

    const result = await db.collection('bookings').insertOne(booking);

    // Email notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: 'Villa Booking <no-reply@villa.com>',
      to: email,
      subject: 'Your Booking - Payment Instructions',
      text: `
Hello ${name},

We received your booking from ${checkin} to ${checkout} for ${guests} guest(s).

Please complete your payment within 1 hour to confirm the booking. 
(We'll provide a secure payment link here soon.)

If no payment is received, your booking will expire automatically.

Best regards,
Villa Booking Team
      `
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) console.error('Email failed:', err);
    });

    res.status(201).json({ message: 'Booking received. Please check your email.', bookingId: result.insertedId });

  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).send('Failed to create booking');
  }
});

module.exports = router;
