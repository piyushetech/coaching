const authRoutes = require('./authRoutes');
const parentRoutes = require('./parentRoutes');
const nannyRoutes = require('./nannyRoutes');
const searchRoutes = require('./searchRoutes');
const hiringRoutes = require('./hiringRoutes');
const chatRoutes = require('./chatRoutes');
const reviewRoutes = require('./reviewRoutes');
const notificationRoutes = require('./notificationRoutes');
const adminRoutes = require('./adminRoutes');

module.exports = (app) => {
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      app: 'NannyConnect API',
      version: '1.0.0',
      message: 'API is running. Use /api/health or /api/* endpoints.',
      docs: {
        health: '/api/health',
        auth: '/api/auth',
        search: '/api/search',
        hiring: '/api/hiring',
      },
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/parents', parentRoutes);
  app.use('/api/nannies', nannyRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/hiring', hiringRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'NannyConnect API', version: '1.0.0' });
  });
};
