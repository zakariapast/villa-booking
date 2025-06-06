// routes/auth.js (updated with bcrypt password checking)

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const connectToDB = require('../config/db');

// Login route
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const db = await connectToDB();
    const user = await db.collection('users').findOne({ username });

    if (!user) {
      return res.status(401).send('Invalid username or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Invalid username or password');
    }

    // Set session
    req.session.user = { username: user.username, role: user.role };
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Protect all /admin routes except /login
router.use('/admin', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/admin/login');
  }
  if (req.path.startsWith('/users') && req.session.user.role !== 'admin') {
    return res.status(403).send('Forbidden');
  }
  next();
});

module.exports = router;
