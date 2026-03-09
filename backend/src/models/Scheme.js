const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shortName: { type: String, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['agriculture', 'health', 'housing', 'education', 'financial', 'women', 'pension', 'entrepreneur'],
    },
    benefits: [{ type: String }],
    eligibility: {
      minAge: { type: Number },
      maxAge: { type: Number },
      maxIncome: { type: Number }, // Annual income in INR
      minIncome: { type: Number },
      occupations: [{ type: String }], // Empty = all occupations
      states: [{ type: String }],      // Empty = all states
      gender: { type: String, enum: ['male', 'female', 'any'], default: 'any' },
      otherCriteria: [{ type: String }],
    },
    applicationProcess: [{ type: String }],
    documentsRequired: [{ type: String }],
    officialLink: { type: String },
    ministry: { type: String },
    launchYear: { type: Number },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

SchemeSchema.index({ category: 1 });
SchemeSchema.index({ 'eligibility.minAge': 1, 'eligibility.maxAge': 1 });
SchemeSchema.index({ tags: 1 });

module.exports = mongoose.model('Scheme', SchemeSchema);
