// backend/models/user.model.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  preferredCurrency: {
    type: String,
    default: 'INR' // Default to INR as mentioned in your component
  },
  // Plans owned by this user
  plans: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  }],
  // Plans shared with this user
  collaboratingPlans: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;