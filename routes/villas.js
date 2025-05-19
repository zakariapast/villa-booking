// routes/villas.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const connectToDB = require('../config/db');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// POST /api/villas
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const db = await connectToDB();
    const { name, location, map, description } = req.body;

    const newVilla = {
      name,
      location,
      map,
      description,
      image: req.file ? req.file.filename : null,
      createdAt: new Date()
    };

    await db.collection('villas').insertOne(newVilla);
    res.status(200).send('✅ Villa added successfully');
  } catch (err) {
    console.error('Error saving villa:', err);
    res.status(500).send('❌ Failed to save villa');
  }
});

module.exports = router;
