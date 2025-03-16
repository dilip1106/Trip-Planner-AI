// backend/models/plan.model.js
import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clerkUserId: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  fromDate: {
    type: Date
  },
  toDate: {
    type: Date
  },
  activityPreferences: {
    type: [String]
  },
  companion: {
    type: String
  },
  aboutThePlace: {
    type: String
  },
  bestTimeToVisit: {
    type: String
  },
  adventureActivities: {
    type: [String]
  },
  localCuisine: {
    type: [String]
  },
  packingChecklist: {
    type: [String]
  },
  itinerary: {
    type: Array
  },
  topPlacesToVisit: {
    type: Array
  },
  // Add image field
  destinationImage: {
    type: String, // Store base64 encoded image
    default: ""
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  collaborators: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    clerkUserId: String,
    email: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    inviteToken: String,
    inviteExpires: Date
  }],
  // Add timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-update the updatedAt field
planSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Plan = mongoose.model('Plan', planSchema);

export default Plan;