export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'Internal Server Error';
  res.status(status).json({ error: message });
};
