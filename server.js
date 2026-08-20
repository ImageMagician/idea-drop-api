import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ideaRouter from './routes/ideaRoutes.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());

// accept raw json
app.use(express.json());

// accept form data
app.use(express.urlencoded({ extended: true }));

// Map /api/ideas to ideaRoutes file
app.use('/api/ideas', ideaRouter);

// 404 Fallback
app.use((req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
})

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})