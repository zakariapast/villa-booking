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

  if (!villaId || !roomId || !checkin || !checkout || !name || !email) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const db = await connectToDB();
    const existing = await db.collection('bookings').find({
      roomId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { checkin: { $lt: new Date(checkout) }, checkout: { $gt: new Date(checkin) } }
      ]
    }).toArray();

    if (existing.length > 0) {
      return res.status(409).send('Selected dates are already booked');
    }

    const newBooking = {
      villaId,
      roomId,
      checkin: new Date(checkin),
      checkout: new Date(checkout),
      name,
      email,
      guests: parseInt(guests) || 1,
      notes: notes || '',
      status: 'pending',
      createdAt: new Date()
    };

    const result = await db.collection('bookings').insertOne(newBooking);

    // Send email (placeholder setup)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // change to actual mail service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: 'Villa Booking <no-reply@villa.com>',
      to: email,
      subject: 'Villa Booking - Payment Instructions',
      text: `Thank you, ${name},

We received your booking request from ${checkin} to ${checkout}. Please complete payment within 1 hour to confirm your booking.

Your booking will expire automatically if no payment is received.

Best regards,
Villa Booking`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error('Email send failed:', err);
    });

    res.status(201).send({ message: 'Booking received. Please check your email.', bookingId: result.insertedId });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).send('Failed to create booking');
  }
});

module.exports = router;
