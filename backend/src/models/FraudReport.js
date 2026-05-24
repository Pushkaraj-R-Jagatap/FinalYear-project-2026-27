const mongoose = require('mongoose');

const FraudReportSchema = new mongoose.Schema(
  {
    reportId: { type: String, unique: true, required: true },
    fraudType: {
      type: String,
      enum: ['link', 'message', 'advertisement', 'other'],
      required: true,
    },
    suspiciousLink: { type: String, trim: true },
    scamMessage: { type: String },
    confidenceScore: { type: Number, default: 0 },
    description: { type: String },
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved'],
      default: 'open',
    },
  },
  { timestamps: true }
);

FraudReportSchema.index({ status: 1 });
FraudReportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FraudReport', FraudReportSchema);
