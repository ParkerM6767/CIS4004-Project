const express = require('express');
const router = express.Router();
const Genre = require('../models/Genre');
const Game = require('../models/Game');
const { protect, requireAdmin } = require('../middleware/auth');

// GET /api/genres
router.get('/', async (req, res) => {
  try {
    const genres = await Genre.find().sort({ name: 1 });
    res.json({ genres });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/genres/:id
router.get('/:id', async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).json({ message: 'Genre not found' });
    res.json({ genre });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/genres — admin only
router.post('/', protect, requireAdmin, async (req, res) => {
  try {
    const genre = await Genre.create(req.body);
    res.status(201).json({ genre });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Genre already exists' });
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/genres/:id — admin only
router.put('/:id', protect, requireAdmin, async (req, res) => {
  try {
    const genre = await Genre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!genre) return res.status(404).json({ message: 'Genre not found' });
    res.json({ genre });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Genre name already taken' });
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/genres/:id — admin only
router.delete('/:id', protect, requireAdmin, async (req, res) => {
  try {
    const genre = await Genre.findByIdAndDelete(req.params.id);
    if (!genre) return res.status(404).json({ message: 'Genre not found' });
    // Null out genre on any games that referenced it
    await Game.updateMany({ genre: req.params.id }, { genre: null });
    res.json({ message: 'Genre deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
