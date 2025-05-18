const express = require('express');
const router = express.Router();

// Simple in-memory admin users
const users = [
  { username: 'admin', password: 'admin123', role: 'owner' },
  { username: 'staff', password: 'staff123', role: 'officer' }
];

// POST login
router.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  req.session.user = { username: user.username, role: user.role };
  res.json({ success: true });
});

// GET logout
router.get('/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// Middleware to protect /admin routes except /login
router.use('/admin', (req, res, next) => {
  if (req.path === '/login') return next();
  if (!req.session.user) return res.redirect('/admin/login');
  next();
});

module.exports = router;
