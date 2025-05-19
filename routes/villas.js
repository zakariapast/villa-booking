// routes/villas.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const connectToDB = require('../config/db');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage to save into public/uploads
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
const upload = multer({ storage }); // ✅ Only this one is needed

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
    console.error('Fetch villas error:', err);
    res.status(500).send('Failed to fetch villas');
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

// DELETE a villa
router.delete('/villas/:id', async (req, res) => {
  try {
    const db = await connectToDB();
    const result = await db.collection('villas').deleteOne({ _id: new ObjectId(req.params.id) });

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
