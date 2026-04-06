const express = require('express');
const router = express.Router();
const Platform = require('../models/Platform');
const Game = require('../models/Game');
const { protect, requireAdmin } = require('../middleware/auth');

// GET /api/platforms
router.get('/', async (req, res) => {
  try {
    const platforms = await Platform.find().sort({ name: 1 });
    res.json({ platforms });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/platforms/:id
router.get('/:id', async (req, res) => {
  try {
    const platform = await Platform.findById(req.params.id);
    if (!platform) return res.status(404).json({ message: 'Platform not found' });
    res.json({ platform });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/platforms — admin only
router.post('/', protect, requireAdmin, async (req, res) => {
  try {
    const platform = await Platform.create(req.body);
    res.status(201).json({ platform });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Platform already exists' });
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/platforms/:id — admin only
router.put('/:id', protect, requireAdmin, async (req, res) => {
  try {
    const platform = await Platform.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!platform) return res.status(404).json({ message: 'Platform not found' });
    res.json({ platform });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Platform name already taken' });
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/platforms/:id — admin only
router.delete('/:id', protect, requireAdmin, async (req, res) => {
  try {
    const platform = await Platform.findByIdAndDelete(req.params.id);
    if (!platform) return res.status(404).json({ message: 'Platform not found' });
    // Remove platform from all games that referenced it
    await Game.updateMany({ platforms: req.params.id }, { $pull: { platforms: req.params.id } });
    res.json({ message: 'Platform deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
