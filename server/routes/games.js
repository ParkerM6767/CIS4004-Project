const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const Review = require('../models/Review');
const { protect, requireAdmin } = require('../middleware/auth');

// GET /api/games
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20, genre, platform } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (genre) query.genre = genre;
    if (platform) query.platforms = platform;

    const games = await Game.find(query)
      .populate('genre', 'name slug')
      .populate('platforms', 'name abbreviation')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Game.countDocuments(query);
    res.json({ games, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/games/:id
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate('genre', 'name slug description')
      .populate('platforms', 'name abbreviation manufacturer releaseYear');
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json({ game });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/games — admin only
router.post('/', protect, requireAdmin, async (req, res) => {
  try {
    const game = await Game.create(req.body);
    await game.populate('genre', 'name slug');
    await game.populate('platforms', 'name abbreviation');
    res.status(201).json({ game });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/games/:id — admin only
router.put('/:id', protect, requireAdmin, async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('genre', 'name slug')
      .populate('platforms', 'name abbreviation');
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json({ game });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/games/:id — admin only
router.delete('/:id', protect, requireAdmin, async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });
    await Review.deleteMany({ game: req.params.id });
    res.json({ message: 'Game deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
