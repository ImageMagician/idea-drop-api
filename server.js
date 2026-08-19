import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ideaRouter from './routes/ideaRoutes.js';

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})