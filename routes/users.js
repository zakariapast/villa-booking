const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const connectToDB = require('../config/db');

function requireAdmin(req, res, next) {
  if (!req.session?.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Forbidden');
  }
  next();
}

router.get('/', requireAdmin, async (req, res) => {
  try {
    const db = await connectToDB();
    const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
    res.json(users.map(u => ({ id: u._id.toString(), username: u.username, role: u.role })));
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).send('Server error');
  }
});

router.post('/', requireAdmin, async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).send('Missing fields');
  try {
    const hash = await bcrypt.hash(password, 12);
    const db = await connectToDB();
    await db.collection('users').insertOne({ username, password: hash, role });
    res.status(201).send('User created');
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
