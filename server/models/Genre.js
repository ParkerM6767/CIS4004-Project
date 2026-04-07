const mongoose = require('mongoose');

/*

This code was generated in parts using AI

Model: Claude Sonnet 4.6
Date of Use: 04/05/2026
Prompt Description: Generate a entity via mymongoose schema  for my data model called Genre. 
It should have the following fields: name (string, required, unique), slug (unique), description (string). 
Include timestamps and validation rules for each field.

Results: I was able to use the generated code to meet the requirements for the 5 entitites required for my data model. 
Where I was able to implement new fields in games and reviews collections to establish entity relationships with them.

*/


const genreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Genre name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Genre name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name before saving
genreSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Genre', genreSchema);