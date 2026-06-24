import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDb } from './config/db.js';
import { applyCorsHeaders, corsOptions } from './config/cors.js';
import { seedDatabase } from './seed.js';

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import filesRoutes from './routes/files.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import examsRoutes from './routes/exams.routes.js';
import feedRoutes from './routes/feed.routes.js';
import coursesRoutes from './routes/courses.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors(corsOptions));
app.use(express.json());

app.use('/uploads', (req, res, next) => {
  applyCorsHeaders(req, res);
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
}, express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'sankalp-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/courses', coursesRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.message?.startsWith('CORS blocked') ? 403 : 500;
  res.status(status).json({ success: false, message: err.message || 'Internal server error' });
});

async function start() {
  await connectDb();
  await seedDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sankalp API running on http://localhost:${PORT}`);
    console.log(`  LAN/mobile: http://<your-pc-ip>:${PORT}`);
    console.log(`  CORS: dev allows localhost, LAN IPs, and Expo (production uses CLIENT_ORIGIN)`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
