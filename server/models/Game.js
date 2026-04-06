const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    author: {
      type: String,
      required: [true, 'Developer/Publisher is required'],
      trim: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    genre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Genre',
      default: null,
    },
    platforms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Platform',
      },
    ],
    releaseYear: {
      type: Number,
    },
    currentRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Text index for search
gameSchema.index({ title: 'text', description: 'text', author: 'text' });

module.exports = mongoose.model('Game', gameSchema);
