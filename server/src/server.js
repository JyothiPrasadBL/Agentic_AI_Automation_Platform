const app = require('./app');
const { port } = require('./config/env');
const { connectDatabase } = require('./config/db');
const http = require('http');
const { initializeSocket } = require('./config/socket');

connectDatabase().then(() => {
  const server = http.createServer(app);
  initializeSocket(server);
  server.listen(port, () => console.info(`Agentflow API listening on port ${port}`));
});
