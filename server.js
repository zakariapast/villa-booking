// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'villa-secret', resave: false, saveUninitialized: true }));

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'views')));

// Views
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views/public-home.html')));
app.get('/villas/:id', (req, res) => res.sendFile(path.join(__dirname, 'views/public-villa-detail.html')));
app.get('/admin', (req, res) => res.redirect('/admin/login'));
app.get('/admin/login', (req, res) => res.sendFile(path.join(__dirname, 'views/admin/login.html')));
app.get('/admin/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'views/admin/admin-dashboard.html')));
app.get('/admin/bookings', (req, res) => res.sendFile(path.join(__dirname, 'views/admin/list-bookings.html')));
app.get('/admin/villas/list', (req, res) => res.sendFile(path.join(__dirname, 'views/admin/list-villas.html')));
app.get('/admin/villas/add', (req, res) => res.sendFile(path.join(__dirname, 'views/admin/add-villa.html')));
app.get('/admin/villas/edit', (req, res) => res.sendFile(path.join(__dirname, 'views/admin/edit-villa.html')));
app.get('/admin/rooms/list', (req, res) => res.sendFile(path.join(__dirname, 'views/admin/list-rooms.html')));
app.get('/admin/rooms/add', (req, res) => res.sendFile(path.join(__dirname, 'views/admin/add-room.html')));
app.get('/admin/rooms/edit', (req, res) => res.sendFile(path.join(__dirname, 'views/admin/edit-room.html')));
app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// Mount routers
const villasRouter = require('./routes/villas');
const roomsRouter = require('./routes/rooms');
const bookingsRouter = require('./routes/bookings');
const authRouter = require('./routes/auth');
const devRoutes = require('./routes/dev');

app.use('/api/villas', villasRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/dev', devRoutes);
app.use(authRouter); // Already prefixed inside

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
