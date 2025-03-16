// backend/models/plans.model.js
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
    type: Date,
    required: true
  },
  toDate: {
    type: Date,
    required: true
  },
  activityPreferences: {
    type: [String],
    default: []
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
  itinerary: [
    {
      title: String,
      activities: {
        morning: [
          {
            itineraryItem: String,
            briefDescription: String
          }
        ],
        afternoon: [
          {
            itineraryItem: String,
            briefDescription: String
          }
        ],
        evening: [
          {
            itineraryItem: String,
            briefDescription: String
          }
        ]
      }
    }
  ],
  topPlacesToVisit: [
    {
      name: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  ],
  isPublic: {
    type: Boolean,
    default: false
  },
  // Collaborator information within the plan itself
  collaborators: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    clerkUserId: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    name: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'accepted'],
      default: 'pending'
    },
    inviteToken: {
      type: String
    },
    inviteExpires: {
      type: Date
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

const Plan = mongoose.model('Plan', planSchema);

export default Plan;