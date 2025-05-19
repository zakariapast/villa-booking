const express = require('express');
const router = express.Router();
const connectToDB = require('../config/db');
const bcrypt = require('bcrypt');

router.get('/create-admin', async (req, res) => {
  const db = await connectToDB();
  const hashedPassword = '$2b$12$D5twS7aX1oCDPN5AXjAKXOxt2YtzHhYgOEceBZ4xKh1TxvmwlGON6'; // bcrypt hash of admin123
  await db.collection('users').insertOne({
    username: 'admin',
    password: hashedPassword,
    role: 'admin'
  });
  res.send('✅ Admin created with hashed password');
});

module.exports = router;
