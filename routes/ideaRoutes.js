import express from 'express';

const router = express.Router();

/**
 * @route       GET /api/ideas
 * @description Get all ideas
 * @access      Public
 */
router.get('/', (req, res) => {
    const ideas = [
        { id: 1, title: 'Idea1', description: 'this is idea 1' },
        { id: 2, title: 'Idea4', description: 'this is idea 2' },
        { id: 3, title: 'Idea4', description: 'this is idea 3' },
    ];

    res.json(ideas);
})

/**
 * @route       POST /api/ideas
 * @description Create new idea
 * @access      Public
 */
router.post('/', (req, res) => {
    const formData = req.body;
    res.send(formData);
})

export default router;