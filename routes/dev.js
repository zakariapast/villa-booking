// routes/dev.js (temporary route)
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.post('/create-admin', async (req, res) => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    username: 'admin',
    password: hashedPassword,
    role: 'admin'
  });
  res.send('Admin created');
});

module.exports = router;
