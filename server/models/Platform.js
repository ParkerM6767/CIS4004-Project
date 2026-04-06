const mongoose = require('mongoose');

const platformSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Platform name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Platform name cannot exceed 50 characters'],
    },
    manufacturer: {
      type: String,
      trim: true,
      default: '',
    },
    releaseYear: {
      type: Number,
      min: 1970,
      max: 2100,
    },
    abbreviation: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [10, 'Abbreviation cannot exceed 10 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Platform', platformSchema);
