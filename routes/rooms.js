const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const villasPath = path.join(__dirname, '..', 'data', 'villas.json');

// GET all rooms of a villa
router.get('/api/rooms/list', (req, res) => {
  const villaId = req.query.villa;
  try {
    const villas = JSON.parse(fs.readFileSync(villasPath, 'utf-8'));
    const villa = villas.find(v => v.id === villaId);
    if (!villa) return res.status(404).json({ error: 'Villa not found' });
    res.json(villa.rooms || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load rooms' });
  }
});

// POST add room to a villa
router.post('/api/rooms', (req, res) => {
  const { villaId, room } = req.body;
  try {
    const villas = JSON.parse(fs.readFileSync(villasPath, 'utf-8'));
    const villa = villas.find(v => v.id === villaId);
    if (!villa) return res.status(404).json({ error: 'Villa not found' });
    villa.rooms = villa.rooms || [];
    villa.rooms.push(room);
    fs.writeFileSync(villasPath, JSON.stringify(villas, null, 2));
    res.status(201).json({ message: 'Room added', room });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save room' });
  }
});

// PUT update a room
router.put('/api/rooms/:villaId/:roomIndex', (req, res) => {
  const { villaId, roomIndex } = req.params;
  try {
    const villas = JSON.parse(fs.readFileSync(villasPath, 'utf-8'));
    const villa = villas.find(v => v.id === villaId);
    if (!villa || !villa.rooms[roomIndex]) return res.status(404).json({ error: 'Room not found' });
    villa.rooms[roomIndex] = req.body;
    fs.writeFileSync(villasPath, JSON.stringify(villas, null, 2));
    res.json({ message: 'Room updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update room' });
  }
});

// DELETE a room
router.delete('/api/rooms/:villaId/:roomIndex', (req, res) => {
  const { villaId, roomIndex } = req.params;
  try {
    const villas = JSON.parse(fs.readFileSync(villasPath, 'utf-8'));
    const villa = villas.find(v => v.id === villaId);
    if (!villa || !villa.rooms[roomIndex]) return res.status(404).json({ error: 'Room not found' });
    villa.rooms.splice(roomIndex, 1);
    fs.writeFileSync(villasPath, JSON.stringify(villas, null, 2));
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

module.exports = router;
