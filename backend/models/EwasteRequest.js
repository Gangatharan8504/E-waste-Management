const mongoose = require('mongoose');

const EwasteRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deviceType: { type: String },
  brand: { type: String },
  model: { type: String },
  condition: { type: String },
  quantity: { type: Number, default: 1 },
  pickupAddress: { type: String },
  pickupLat: { type: Number },
  pickupLng: { type: Number },
  remarks: { type: String },
  imageUrls: [{ type: String }],
  status: { 
    type: String, 
    enum: ['PENDING_OTP', 'PENDING', 'ACCEPTED', 'REJECTED', 'SCHEDULED', 'COLLECTED', 'RECYCLING_IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'BETTER_IMAGES_REQUIRED'], 
    default: 'PENDING' 
  },
  scheduledDate: { type: String },
  scheduledTime: { type: String },
  adminNotes: { type: String },
  
  // AI Image Verification details
  isElectronicDevice: { type: Boolean },
  isSuitableForRecycling: { type: Boolean },
  aiDamageLevel: { type: String },
  aiConfidenceScore: { type: Number },
  aiSafetyRisks: { type: String },
  aiRepairRecommendation: { type: String },
  aiReuseRecommendation: { type: String },
  aiRecyclingRecommendation: { type: String },
  aiSafeHandlingInstructions: { type: String },
  rejectedReason: { type: String },
  aiSummary: { type: String },

  // AI Valuation details
  estimatedValue: { type: Number },
  recoverableMaterials: [{ type: String }],
  recyclablePercentage: { type: Number },
  environmentalImpact: { type: String },
  valuationReason: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

EwasteRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('EwasteRequest', EwasteRequestSchema);
