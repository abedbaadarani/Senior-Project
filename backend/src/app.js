import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

// Global error handler
app.use(errorHandler);

export default app;
