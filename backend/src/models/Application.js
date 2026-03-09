const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
  {
    applicationId: { type: String, unique: true, required: true },
    schemeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme' },
    schemeName: { type: String },

    applicant: {
      name: { type: String, required: true },
      age: { type: Number, required: true },
      gender: { type: String, enum: ['male', 'female', 'other'] },
      occupation: { type: String },
      income: { type: Number }, // Annual income in INR
      state: { type: String },
      district: { type: String },
      aadhaarHash: { type: String }, // SHA-256 of Aadhaar (never store raw)
      bankAccountHash: { type: String }, // SHA-256 of account number
      phone: { type: String },
    },

    metadata: {
      ipAddress: { type: String },
      userAgent: { type: String },
      submittedAt: { type: Date, default: Date.now },
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'under_review'],
      default: 'pending',
    },

    fraudFlags: [
      {
        rule: { type: String },
        score: { type: Number },
        description: { type: String },
      },
    ],

    fraudScore: { type: Number, default: 0 },
    fraudLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    isFlagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ApplicationSchema.index({ 'applicant.aadhaarHash': 1 });
ApplicationSchema.index({ 'applicant.bankAccountHash': 1 });
ApplicationSchema.index({ 'metadata.ipAddress': 1 });
ApplicationSchema.index({ 'applicant.district': 1 });
ApplicationSchema.index({ fraudScore: -1 });
ApplicationSchema.index({ isFlagged: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
