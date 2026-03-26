const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: [true, 'Game reference is required'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    description: {
      type: String,
      required: [true, 'Review text is required'],
      minlength: [10, 'Review must be at least 10 characters'],
      maxlength: [2000, 'Review cannot exceed 2000 characters'],
    },
  },
  { timestamps: true }
);

// One review per user per game
reviewSchema.index({ game: 1, author: 1 }, { unique: true });

// After save/delete: recalculate game's average rating
async function updateGameRating(gameId) {
  const Review = mongoose.model('Review');
  const Game = mongoose.model('Game');
  const stats = await Review.aggregate([
    { $match: { game: gameId } },
    { $group: { _id: '$game', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Game.findByIdAndUpdate(gameId, {
      currentRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  } else {
    await Game.findByIdAndUpdate(gameId, { currentRating: 0, reviewCount: 0 });
  }
}

reviewSchema.post('save', async function () {
  await updateGameRating(this.game);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) await updateGameRating(doc.game);
});

reviewSchema.post('deleteMany', async function () {});

module.exports = mongoose.model('Review', reviewSchema);
