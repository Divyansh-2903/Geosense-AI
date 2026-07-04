const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/env');

const app = express();
const allowedOrigins = new Set(config.corsOrigins);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (!origin || allowedOrigins.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin || config.corsOrigins[0]);
  }

  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');

  if (req.method === 'OPTIONS') {
    return origin && !allowedOrigins.has(origin)
      ? res.sendStatus(403)
      : res.sendStatus(200);
  }

  if (origin && !allowedOrigins.has(origin)) {
    return res.status(403).json({ error: 'CORS origin not allowed' });
  }

  next();
});

mongoose
  .connect(config.mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(express.static(path.join(__dirname, '../Frontend/dist')));

// Temporary diagnostic route to debug static asset paths on Render
app.get('/api/debug-paths', (req, res) => {
  const distPath = path.join(__dirname, '../Frontend/dist');
  const exists = fs.existsSync(distPath);
  let files = [];
  if (exists) {
    try {
      files = fs.readdirSync(distPath);
    } catch (e) {
      files = [e.message];
    }
  }
  res.json({
    __dirname,
    cwd: process.cwd(),
    distPath,
    exists,
    files
  });
});

const analysisRoutes = require('./routes/analysisRoutes');
const authRoutes = require('./routes/authRoutes');
const farmRoutes = require('./routes/farmRoutes');

app.use('/api', analysisRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);

// Catch-all route to serve Frontend/dist/index.html for any other non-API requests (client-side routing)
app.get('*any', (req, res) => {
  const indexPath = path.join(__dirname, '../Frontend/dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend build not found. Verify build output path.');
  }
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});

