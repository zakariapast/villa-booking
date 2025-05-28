// routes/bookings.js
const express = require('express');
const router = express.Router();
const connectToDB = require('../config/db');
const { ObjectId } = require('mongodb');

// Helper: Check date overlap
function isOverlapping(start1, end1, start2, end2) {
  return (new Date(start1) < new Date(end2)) && (new Date(start2) < new Date(end1));
}
// GET /api/bookings
router.get('/', async (req, res) => {
  try {
    const db = await connectToDB();

    const bookings = await db.collection('bookings').find({}).sort({ createdAt: -1 }).toArray();
    const villas = await db.collection('villas').find({}).toArray();
    const rooms = await db.collection('rooms').find({}).toArray();

    const enriched = bookings.map(b => {
      const villa = villas.find(v => v._id.toString() === b.villaId);
      const room = rooms.find(r => (r.id || r._id?.toString()) === b.roomId);
      return {
        ...b,
        id: b._id.toString(),
        villaName: villa?.name || b.villaId,
        roomName: room?.name || b.roomId,
        guestDetail: b.guestDetail || `${b.guests || 1} guest(s)`
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error('Failed to fetch bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});
// PATCH /api/bookings/:id/status
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const db = await connectToDB();
    const result = await db.collection('bookings').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    if (result.modifiedCount === 1) {
      return res.json({ message: 'Status updated' });
    } else {
      return res.status(404).json({ error: 'Booking not found' });
    }
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});


// POST /api/bookings
router.post('/', async (req, res) => {
  const { villaId, roomId, checkin, checkout, name, email, guests, notes } = req.body;

  if (!villaId || !checkin || !checkout || !name || !email) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const db = await connectToDB();

    const existing = await db.collection('bookings').find({
      villaId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { checkin: { $lt: new Date(checkout) }, checkout: { $gt: new Date(checkin) } }
      ]
    }).toArray();

    if (existing.length > 0) {
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
      createdAt: new Date()
    };

    const result = await db.collection('bookings').insertOne(booking);

    const emailHtml = `
      <h2>Villa Booking Confirmation</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>We received your booking request:</p>
      <ul>
        <li>Check-in: <strong>${checkin}</strong></li>
        <li>Check-out: <strong>${checkout}</strong></li>
        <li>Guests: <strong>${guests}</strong></li>
        <li>Email: <strong>${email}</strong></li>
        <li>Special Requests: <strong>${notes || '-'}</strong></li>
      </ul>
      <p><strong>Please complete payment within 1 hour</strong> to confirm your booking.</p>
      <p>We'll send confirmation after payment is completed.</p>
      <hr>
      <p style="font-size: 0.9em; color: gray;">This is a preview only. Email sending is disabled in this environment.</p>
    `;

    console.log('📧 Booking email preview:\n', emailHtml);

    res.status(201).json({
      message: 'Booking created. Email preview shown in console.',
      bookingId: result.insertedId
    });
    return;

  } catch (err) {
    console.error('Booking error:', err);
    if (!res.headersSent) {
      res.status(500).send('Failed to create booking');
    }
  }
});


router.get('/calendar', async (req, res) => {
  const { villaId } = req.query;
  if (!villaId) return res.status(400).json({ error: 'Missing villaId' });

  try {
    const db = await connectToDB();
    const bookings = await db.collection('bookings').find({
      villaId,
      status: { $in: ['pending', 'confirmed'] }
    }).toArray();

const blockedRanges = bookings.map(b => ({
  from: new Date(b.checkin),
  to: new Date(new Date(b.checkout).getTime() - 24 * 60 * 60 * 1000) // 1 day before checkout
}));


    res.json(blockedRanges);
  } catch (err) {
    console.error('Error fetching blocked dates:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/recent', async (req, res) => {
  try {
    const db = await connectToDB();
    const bookings = await db.collection('bookings')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    const rooms = await db.collection('rooms').find({}).toArray();
    const result = bookings.map(b => {
      const room = rooms.find(r => (r.id || r._id?.toString()) === b.roomId);
      return {
        roomName: room?.name || "Room",
        guestName: b.name,
        checkin: b.checkin,
        checkout: b.checkout
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent bookings' });
  }
});
// GET /api/bookings/monthly-stats
router.get('/monthly-stats', async (req, res) => {
  try {
    const db = await connectToDB();

    const bookings = await db.collection('bookings')
      .find({ status: { $in: ['confirmed', 'pending'] } })
      .toArray();

    const weeks = [0, 0, 0, 0]; // Week 1 to 4
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    bookings.forEach(b => {
      const checkin = new Date(b.checkin);
      if (
        checkin >= monthStart &&
        checkin.getMonth() === now.getMonth()
      ) {
        const week = Math.floor((checkin.getDate() - 1) / 7);
        weeks[week] += 1;
      }
    });

    res.json(weeks);
  } catch (err) {
    console.error('Monthly stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
