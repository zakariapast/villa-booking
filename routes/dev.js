// routes/dev.js

const express = require('express');
const router = express.Router();
const connectToDB = require('../config/db');

router.get('/create-admin', async (req, res) => {
  try {
    const db = await connectToDB();

    const hashedPassword = '$2a$12$HEYKp/tpCC0OkSFxx4qxROkFuqY/DJQj/KRoKfeIEnS/hJW.pYVka'; // hash of admin123

    const result = await db.collection('users').insertOne({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('✅ Admin insert result:', result);
    res.send('✅ Admin created successfully.');
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
