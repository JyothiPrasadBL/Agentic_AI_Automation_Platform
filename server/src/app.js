const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const { clientUrl } = require('./config/env');
const { databaseMode } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const executionRoutes = require('./routes/executionRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(helmet());
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime(), database: databaseMode(), queue: require('./queues/executionQueue').mode(), timestamp: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
