const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect, requireAdmin } = require('../middleware/auth');

// GET /api/reviews?gameId=xxx
router.get('/', async (req, res) => {
  try {
    const { gameId, page = 1, limit = 20 } = req.query;
    const query = gameId ? { game: gameId } : {};
    const reviews = await Review.find(query)
      .populate('author', 'username role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Review.countDocuments(query);
    res.json({ reviews, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reviews/all — admin only
router.get('/all', protect, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const reviews = await Review.find()
      .populate('author', 'username')
      .populate('game', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Review.countDocuments();
    res.json({ reviews, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { gameId, rating, description } = req.body;
    const review = await Review.create({
      game: gameId,
      author: req.user._id,
      rating,
      description,
    });
    await review.populate('author', 'username role');
    res.status(201).json({ review });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'You already reviewed this game' });
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/reviews/:id — own review or admin
router.put('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const isOwner = review.author.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    review.rating = req.body.rating ?? review.rating;
    review.description = req.body.description ?? review.description;
    await review.save();
    await review.populate('author', 'username role');
    res.json({ review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/reviews/:id — own review or admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const isOwner = review.author.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    await Review.findOneAndDelete({ _id: req.params.id });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
