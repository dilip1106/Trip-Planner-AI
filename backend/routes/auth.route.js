// backend/routes/user.routes.js
import { updateUser } from '../controllers/auth.controller.js';
import { authenticateUser } from '../middleware/verifyAuthUser.js';
import User from '../models/user.model.js';
import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();

// API endpoint to save user data after authentication
router.post('/save-user', async (req, res) => {
  try {
    
    const userData = req.body;
    if (!userData.clerkId) {
      return res.status(401).json({ error: 'Clerk ID is required' });
    }
    
    // Check if user already exists in your database
    const existingUser = await User.findOne({ clerkId: userData.clerkId });
    
    let user;
    if (existingUser) {
      // Update user if already exists
      user = await User.findOneAndUpdate(
        { clerkId: userData.clerkId },
        {
          name: userData.name || existingUser.name,
          email: userData.email || existingUser.email,
          image: userData.image || existingUser.image
        },
        { new: true }
      );
    } else {
      // Create new user
      const newUser = new User({
        clerkId: userData.clerkId,
        name: userData.name || '',
        email: userData.email,
        image: userData.image || '',
        plans: [],
        collaboratingPlans: []
      });
      user = await newUser.save();
    }
    
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get current user information
router.get('/me', async (req, res) => {
  try {
    const { clerkId } = req.body;
    
    if (!clerkId) {
      return res.status(401).json({ error: 'Clerk ID is required' });
    }
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get pending invitations for the current user
router.get('/invitations', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(401).json({ error: 'Email is required' });
    }
    
    // Find plans with pending invitations for this email
    const Plan = mongoose.model('Plan');
    const plansWithInvites = await Plan.find({
      'collaborators.email': email,
      'collaborators.status': 'pending'
    }).populate('user', 'name email');
    
    // Format the response to include only relevant invitation data
    const pendingInvitations = plansWithInvites.map(plan => {
      const invitation = plan.collaborators.find(
        collab => collab.email === email && collab.status === 'pending'
      );
      
      return {
        planId: plan._id,
        planName: plan.destination,
        inviteToken: invitation.inviteToken,
        inviteExpires: invitation.inviteExpires,
        owner: {
          name: plan.user.name,
          email: plan.user.email
        }
      };
    });
    
    res.status(200).json({ success: true, data: pendingInvitations });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get user credits
router.post('/credits', authenticateUser, async (req, res) => {
  try {
    const { clerkId } = req.user;
    
    if (!clerkId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const user = await User.findOne({ clerkId: clerkId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return the credits (default to 3 if not set)
    return res.status(200).json({
      success: true,
      credits: user.credits
    });
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user credits' 
    });
  }
});

router.put('/user/update', authenticateUser, updateUser)

export default router;