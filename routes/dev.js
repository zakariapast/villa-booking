const express = require('express');
const router = express.Router();
const connectToDB = require('../config/db');
const bcrypt = require('bcrypt');

router.get('/create-admin', async (req, res) => {
  const db = await connectToDB();
  const hashedPassword = await bcrypt.hash('admin123', 12); // plain password
  await db.collection('users').insertOne({
    username: 'admin',
    password: hashedPassword,
    role: 'admin'
  });
  res.send('✅ Admin created with hashed password');
});

module.exports = router;
