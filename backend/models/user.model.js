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
  credits:{
    type: Number,
    default: 5
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  // Removed preferredCurrency from here
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