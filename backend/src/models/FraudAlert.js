const mongoose = require('mongoose');

const FraudAlertSchema = new mongoose.Schema(
  {
    alertId: { type: String, unique: true, required: true },
    applicationId: { type: String, required: true },
    applicantName: { type: String },
    schemeName: { type: String },
    state: { type: String },
    district: { type: String },

    fraudScore: { type: Number, required: true, min: 0, max: 100 },
    fraudLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    reasons: [{ type: String }],
    rulesTriggered: [{ type: String }],
    affectedScheme: { type: String },

    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'dismissed'],
      default: 'open',
    },
    resolvedBy: { type: String },
    resolvedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

FraudAlertSchema.index({ fraudLevel: 1, status: 1 });
FraudAlertSchema.index({ createdAt: -1 });
FraudAlertSchema.index({ fraudScore: -1 });

module.exports = mongoose.model('FraudAlert', FraudAlertSchema);
