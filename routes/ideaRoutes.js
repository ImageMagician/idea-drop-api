import express from 'express';
import Idea from '../models/Idea.js';
import mongoose from 'mongoose';
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router();

/**
 * @route       GET /api/ideas
 * @description Get all ideas
 * @access      Public
 * @query       _limit (optional limit for ideas returned)
 */
router.get('/', async (req, res, next) => {
    try {
        const limit = parseInt(req.query._limit);
        const query = Idea.find().sort({ createdAt: -1})

        if (!isNaN(limit)) {
            query.limit(limit)
        }

        const ideas = await query.exec();
        res.json(ideas);
    }
    catch (err) {
        console.log(err);
        next(err);
    }
})

/**
 * @route       GET /api/ideas/:id
 * @description Get single ideas
 * @access      Public
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(404);
            throw new Error('Idea not found');
        }

        const idea = await Idea.findById(id);

        if (!idea) {
            res.status(404);
            throw new Error('Idea not found');
        }
        res.json(idea);
    }
    catch (err) {
        console.log(err);
        next(err);
    }
})

/**
 * @route       POST /api/ideas
 * @description Create new idea
 * @access      Public
 */
router.post('/', protect,async (req, res, next) => {
    try {
        const { title, summary, description, tags } = req.body || {};

        if (!title?.trim() || !summary?.trim() || !description?.trim()) {
            res.status(400);
            throw new Error('Title, summary, and description are required.');
        }

        const newIdea = new Idea({
            title,
            summary,
            description,
            tags: typeof tags === 'string'
                ? tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                : Array.isArray(tags)
                    ? tags
                    : []
        });

        const savedIdea = await newIdea.save();
        res.status(201).json(savedIdea);
    }
    catch (err) {
        console.error(err);
        next(err);
    }
})

/**
 * @route       DELETE /api/ideas/:id
 * @description DELETE idea
 * @access      Public
 */
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(404);
            throw new Error('Idea not found');
        }

        const idea = await Idea.findByIdAndDelete(id);

        if (!idea) {
            res.status(404);
            throw new Error('Idea not found');
        }
        res.json({
            message: "Idea deleted.",
        });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
})

/**
 * @route       PUT /api/ideas/:id
 * @description UPDATE idea
 * @access      public
 */
router.put('/:id', protect, async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(404);
            throw new Error('Idea not found');
        }

        const { title, summary, description, tags } = req.body || {};

        // Check for content on title, summary, description
        if (!title?.trim() || !summary?.trim() || !description?.trim()) {
            res.status(400);
            throw new Error('Title, summary, and description are required.');
        }

        const updatedIdea = await Idea.findByIdAndUpdate(id, {
                title,
                summary,
                description,
                tags: Array.isArray(tags)
                    ? tags
                    : tags.split(',')
                        .map((tag)=> tag.trim())
            },
            {
                new: true,
                runValidators: true
            }
        )

        if (!updatedIdea) {
            res.status(404);
            throw new Error('Idea not found');
        }

        res.json(updatedIdea)

    }
    catch (err) {
        console.error(err);
        next(err);
    }
})

export default router;