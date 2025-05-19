// routes/dev.js (temporary route)
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.post('/create-admin', async (req, res) => {
  const hashedPassword = await bcrypt.hash('$2a$12$X6ErxpyNQCDKR.5onLWdx.b6PU600NaQmw7XP9dnaBdBtn4ZhQNNG', 10);
  await User.create({
    username: 'admin',
    password: hashedPassword,
    role: 'admin'
  });
  res.send('Admin created');
});

module.exports = router;
