function notFound(req, res) {
  res.status(404).json({ error: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} was not found.` });
}

function errorHandler(error, req, res, next) {
  console.error(error);
  res.status(error.statusCode || 500).json({ error: error.code || 'INTERNAL_ERROR', message: error.message || 'An unexpected error occurred.' });
}

module.exports = { notFound, errorHandler };
