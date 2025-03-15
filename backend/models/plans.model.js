// backend/models/plans.model.js
import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  }
}, { timestamps: true });

const Plan = mongoose.model('Plan', planSchema);

export default Plan;