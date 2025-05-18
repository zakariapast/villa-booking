// routes/auth.js (MongoDB version with session-based login)

const express = require('express');
const router = express.Router();
const connectToDB = require('../config/db');

// Hardcoded fallback admin if DB is empty
const defaultAdmin = {
  username: 'admin',
  password: 'admin123' // Ideally hashed and secured
};

// Login route
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const db = await connectToDB();
    const user = await db.collection('admins').findOne({ username });

    // Check DB or fallback to default admin
    if ((user && user.password === password) ||
        (username === defaultAdmin.username && password === defaultAdmin.password)) {
      req.session.user = { username };
      res.redirect('/admin/dashboard');
    } else {
      res.send('Invalid username or password');
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Middleware to protect admin routes
router.use('/admin', (req, res, next) => {
  if (!req.session.user) return res.redirect('/admin/login');
  next();
});

module.exports = router;
