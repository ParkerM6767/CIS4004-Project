const mongoose = require('mongoose');

/*

This code was generated in parts using AI

Model: Claude Sonnet 4.6
Date of Use: 04/05/2026
Prompt Description: Generate a entity via mymongoose schema  for my data model called Platform. 
Include timestamps and validation rules for each field.

Results: I was able to use the generated code to meet the requirements for the 5 entitites required for my data model. 
Where I was able to implement new fields in games and reviews collections to establish entity relationships with them.

*/

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
