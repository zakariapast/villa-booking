const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const villasPath = path.join(__dirname, '..', 'data', 'villas.json');
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});
const upload = multer({ storage });

// Load villas
function loadVillas() {
  if (!fs.existsSync(villasPath)) return [];
  const data = fs.readFileSync(villasPath);
  return JSON.parse(data);
}

// Save villas
function saveVillas(villas) {
  fs.writeFileSync(villasPath, JSON.stringify(villas, null, 2));
}

// GET /api/villas
router.get('/villas', (req, res) => {
  try {
    const villas = loadVillas();
    res.json(villas);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load villas.' });
  }
});

// POST /api/villas
router.post('/villas', upload.single('image'), (req, res) => {
  try {
    const villas = loadVillas();
    const { name, location, map, description } = req.body;
    const newVilla = {
      id: uuidv4(),
      name,
      location,
      map,
      description,
      image: req.file ? '/uploads/' + req.file.filename : '',
      visible: true
    };
    villas.push(newVilla);
    saveVillas(villas);
    res.status(201).json(newVilla);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save villa.' });
  }
});

// PUT /api/villas/:id
router.put('/villas/:id', upload.single('image'), (req, res) => {
  try {
    let villas = loadVillas();
    const villa = villas.find(v => v.id === req.params.id);
    if (!villa) return res.status(404).json({ error: 'Villa not found.' });

    const { name, location, map, description, visible } = req.body;
    villa.name = name;
    villa.location = location;
    villa.map = map;
    villa.description = description;
    villa.visible = visible === 'true' || visible === true;
    if (req.file) villa.image = '/uploads/' + req.file.filename;

    saveVillas(villas);
    res.json(villa);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update villa.' });
  }
});

// DELETE /api/villas/:id
router.delete('/villas/:id', (req, res) => {
  try {
    let villas = loadVillas();
    villas = villas.filter(v => v.id !== req.params.id);
    saveVillas(villas);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete villa.' });
  }
});

module.exports = router;
