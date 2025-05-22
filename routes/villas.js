// routes/villas.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const connectToDB = require('../config/db');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now().toString(16) + ext;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// GET all villas
router.get('/', async (req, res) => {
  try {
    const db = await connectToDB();
    const villas = await db.collection('villas').find().toArray();
    res.json(villas.map(v => ({
      ...v,
      id: v._id.toString(),
      image: v.image || '',
    })));
  } catch (err) {
    console.error('Error fetching villas:', err);
    res.status(500).send('Failed to fetch villas');
  }
});
// GET single villa by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await connectToDB();
    const id = req.params.id;

    const villa = await db.collection('villas').findOne({ _id: new ObjectId(id) });

    if (!villa) {
      return res.status(404).send('Villa not found');
    }

    res.json({
      ...villa,
      id: villa._id.toString(),
      image: villa.image || '',
    });
  } catch (err) {
    console.error('Error fetching villa by ID:', err);
    res.status(500).send('Failed to fetch villa');
  }
});

// POST new villa
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const filename = req.file ? req.file.filename : null;
    const imagePath = filename ? `/uploads/${filename}` : null;

    const villa = {
      name: req.body.name,
      location: req.body.location,
      map: req.body.map,
      description: req.body.description,
      image: imagePath,
      visible: req.body.visible === 'true',
    };

    const db = await connectToDB();
    await db.collection('villas').insertOne(villa);
    res.status(201).send('Villa created');
  } catch (err) {
    console.error('Error saving villa:', err);
    res.status(500).send('Failed to create villa');
  }
});

// DELETE villa
router.delete('/villas/:id', async (req, res) => {
  try {
    const db = await connectToDB();
    const id = req.params.id;
    const result = await db.collection('villas').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send('Villa not found');
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
