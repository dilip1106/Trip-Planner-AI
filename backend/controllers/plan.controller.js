// backend/controllers/plan.controller.js
import Plan from '../models/plans.model.js';
import User from '../models/user.model.js';
import { v4 as uuidv4 } from 'uuid';
import sendMail from '../util/email.js';
import * as GroqService from '../services/groq_service.js'; // Updated import to use Groq service
import { generateDestinationImage } from '../services/image_service.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
// Create a new plan
export const createPlan = async (req, res) => {
  try {
    const { clerkId, email, name } = req.user;
    
    // Find or create user in our database
    let user = await User.findOne({ clerkId });
    if (!user) {
      user = await User.create({
        clerkId,
        email,
        name,
        image: req.user.image || ''
      });
    }
    
    const planData = {
      ...req.body,
      user: user._id,
      clerkUserId: clerkId
    };
    
    const plan = await Plan.create(planData);
    
    // Add plan to user's plans array
    await User.findByIdAndUpdate(user._id, {
      $push: { plans: plan._id }
    });
    
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all plans for current user (owned + collaborated)
export const getAllPlans = async (req, res) => {
  try {
    const { clerkId } = req.user;
    
    // Find user in our database
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Get plans owned by the user
    const ownedPlans = await Plan.find({ user: user._id });
    
    // Get plans shared with the user
    const collaboratedPlans = await Plan.find({
      'collaborators.clerkUserId': clerkId,
      'collaborators.status': 'accepted'
    });
    
    res.status(200).json({ 
      success: true, 
      data: {
        owned: ownedPlans,
        collaborated: collaboratedPlans
      } 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
export const getMinimalPlans = async (req, res) => {
  try {
    const { clerkId } = req.user;
    
    // Find user in our database
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Get minimal plan data for owned plans
    const ownedPlans = await Plan.find(
      { user: user._id },
      { _id: 1, destination: 1 } // Only select _id and destination fields
    );
    
    // Get minimal plan data for collaborated plans
    const collaboratedPlans = await Plan.find(
      {
        'collaborators.clerkUserId': clerkId,
        'collaborators.status': 'accepted'
      },
      { _id: 1, destination: 1 } // Only select _id and destination fields
    );
    
    res.status(200).json({ 
      success: true, 
      data: {
        owned: ownedPlans.map(plan => ({
          _id: plan._id,
          destination: plan.destination
        })),
        collaborated: collaboratedPlans.map(plan => ({
          _id: plan._id,
          destination: plan.destination
        }))
      } 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const clerkId = req.user?.clerkId; // Will be undefined if not authenticated
    
    const plan = await Plan.findById(id).populate('user', 'name email');
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }
    
    // Check if plan is public or if user is owner or collaborator
    const isOwner = clerkId && plan.clerkUserId === clerkId;
    const isCollaborator = clerkId && plan.collaborators.some(
      collab => collab.clerkUserId === clerkId && collab.status === 'accepted'
    );
    
    if (!plan.isPublic && !isOwner && !isCollaborator) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
export const getPlanByIdForPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const clerkId = req.user?.clerkId; // Will be undefined if not authenticated
    
    const plan = await Plan.findById(id).populate('user', 'name email');
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }
    
    // Check if plan is public or if user is owner or collaborator
    const isOwner = clerkId && plan.clerkUserId === clerkId;
    const isCollaborator = clerkId && plan.collaborators.some(
      collab => collab.clerkUserId === clerkId && collab.status === 'accepted'
    );
    
    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update a plan
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { clerkId } = req.user; // Now coming from middleware
    
    // Find the plan
    const plan = await Plan.findById(id);
    
    if (!plan) {
      return res.status(404).json({ 
        success: false, 
        error: 'Plan not found' 
      });
    }
    
    // Check if user is the owner
    if (plan.clerkUserId !== clerkId) {
      // Check if user is a collaborator with edit permissions
      const isCollaborator = plan.collaborators?.some(
        collab => collab.clerkUserId === clerkId && collab.status === 'accepted'
      );
      
      if (!isCollaborator) {
        return res.status(403).json({ 
          success: false, 
          error: 'You do not have permission to update this plan' 
        });
      }
    }
    
    // Update the plan with request body (userData already removed by middleware)
    const updatedPlan = await Plan.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({ 
      success: true, 
      data: updatedPlan 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Delete a plan
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const {clerkId} = req.user;
    // Find the plan
    const plan = await Plan.findById(id);
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }
    
    // Check if user is the owner
    if (plan.clerkUserId !== clerkId) {
      return res.status(403).json({ success: false, error: 'Only the owner can delete this plan' });
    }
    
    // Remove plan from owner's plans array
    await User.findOneAndUpdate(
      { clerkId },
      { $pull: { plans: plan._id } }
    );
    
    // Remove plan from collaborators' collaboratingPlans arrays
    for (const collaborator of plan.collaborators) {
      if (collaborator.status === 'accepted') {
        await User.findOneAndUpdate(
          { clerkId: collaborator.clerkUserId },
          { $pull: { collaboratingPlans: plan._id } }
        );
      }
    }
    
    // Delete the plan
    await Plan.findByIdAndDelete(id);
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get public plans for discovery
export const getPublicPlans = async (req, res) => {
  try {
    const publicPlans = await Plan.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user', 'name');
    
    res.status(200).json({ success: true, data: publicPlans });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Invite a collaborator to a plan
export const inviteCollaborator = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const { clerkId, email: inviterEmail, name: inviterName } = req.user;
    
    // Find the plan
    const plan = await Plan.findById(id);
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }
    
    // Check if user is the owner
    if (plan.clerkUserId !== clerkId) {
      return res.status(403).json({ success: false, error: 'Only the owner can invite collaborators' });
    }
    
    // Check if the email is already a collaborator
    const existingCollaborator = plan.collaborators.find(
      collab => collab.email === email
    );
    if (existingCollaborator) {
      return res.status(400).json({
        success: false,
        error: 'This email is already a collaborator or has a pending invitation'
      });
    }
    
    // Generate a unique token for the invitation
    const inviteToken = uuidv4();
    const inviteExpires = new Date();
    inviteExpires.setDate(inviteExpires.getDate() + 7); // Expires in 7 days
    
    // Find if the invited user already exists in our database
    let invitedUser = await User.findOne({ email });
    let invitedUserId = null;
    let invitedUserClerkId = null;
    
    if (invitedUser) {
      invitedUserId = invitedUser._id;
      invitedUserClerkId = invitedUser.clerkId;
    }
    
    // Add the collaborator to the plan
    plan.collaborators.push({
      userId: invitedUserId,
      clerkUserId: invitedUserClerkId,
      email,
      status: 'pending',
      inviteToken,
      inviteExpires
    });
    
    await plan.save();
    
    // Send invitation email with correct parameters
    const inviteUrl = `http://localhost:5173/dashboard/${inviteToken}`;
    
    const emailResult = await sendMail({
      to: email,
      subject: `Invitation to collaborate on ${plan.destination}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've been invited to collaborate!</h2>
          <p>Hello,</p>
          <p><strong>${inviterName}</strong> (${inviterEmail}) has invited you to collaborate on the plan: <strong>${plan.destination}</strong>.</p>
          <p>Click the button below to accept this invitation:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Accept Invitation</a>
          </div>
          <p>This invitation will expire in 7 days.</p>
          <p>If you have any questions, please contact the plan owner directly.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">If you're having trouble with the button above, copy and paste this URL into your web browser: ${inviteUrl}</p>
        </div>
      `
    });
    
    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
      return res.status(500).json({ 
        success: false, 
        message: "Collaborator was added but email could not be sent",
        error: emailResult.error
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Invitation sent to ${email}`
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Accept a collaborator invitation
export const acceptCollaboratorInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const { clerkId, email, name } = req.user;
    
    // Find the plan with this invite token
    const plan = await Plan.findOne({
      'collaborators.inviteToken': token,
      'collaborators.status': 'pending'
    });
    
    if (!plan) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invalid or expired invitation' 
      });
    }
    
    // Find the specific collaborator in the plan
    const collaborator = plan.collaborators.find(
      collab => collab.inviteToken === token
    );
    
    // Check if the invitation is expired
    if (new Date() > new Date(collaborator.inviteExpires)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invitation has expired' 
      });
    }
    
    // Check if the email matches
    if (collaborator.email !== email) {
      return res.status(403).json({ 
        success: false, 
        error: 'This invitation was sent to a different email address' 
      });
    }
    
    // Find or create the user in our database
    let user = await User.findOne({ clerkId });
    if (!user) {
      user = await User.create({
        clerkId,
        email,
        name,
        image: req.user.image || ''
      });
    }
    
    // Update the collaborator information
    collaborator.status = 'accepted';
    collaborator.userId = user._id;
    collaborator.clerkUserId = clerkId;
    collaborator.name = name;
    
    await plan.save();
    
    // Add the plan to the user's collaboratingPlans array
    await User.findByIdAndUpdate(user._id, {
      $addToSet: { collaboratingPlans: plan._id }
    });
    
    res.status(200).json({ 
      success: true, 
      message: 'You are now a collaborator on this plan',
      planId: plan._id
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Remove a collaborator from a plan
export const removeCollaborator = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { clerkId } = req.user;
    
    // Find the plan
    const plan = await Plan.findById(id);
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }
    
    // Check if user is the owner
    if (plan.clerkUserId !== clerkId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only the owner can remove collaborators' 
      });
    }
    
    // Find the collaborator in the plan
    const collaboratorIndex = plan.collaborators.findIndex(
      collab => collab.clerkUserId === userId
    );
    
    if (collaboratorIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Collaborator not found' 
      });
    }
    
    // Remove the collaborator
    plan.collaborators.splice(collaboratorIndex, 1);
    await plan.save();
    
    // Remove the plan from the collaborator's collaboratingPlans array
    await User.findOneAndUpdate(
      { clerkId: userId },
      { $pull: { collaboratingPlans: plan._id } }
    );
    
    res.status(200).json({ 
      success: true, 
      message: 'Collaborator removed successfully' 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
export const revokeInvite = async (req, res) => {
  try {
    const { planId, id } = req.params;
    const { clerkId } = req.user;
    
    // Find the plan
    const plan = await Plan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }
    
    // Check if user is the owner
    if (plan.clerkUserId !== clerkId) {
      return res.status(403).json({
        success: false,
        error: 'Only the owner can revoke invitations'
      });
    }
    
    // Find the collaborator in the plan by MongoDB _id
    const collaboratorIndex = plan.collaborators.findIndex(
      collab => collab._id.toString() === id
    );
    
    if (collaboratorIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found'
      });
    }
    
    // Check if the collaborator status is 'pending'
    if (plan.collaborators[collaboratorIndex].status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Can only revoke pending invitations'
      });
    }
    
    // Get the collaborator email for the response
    const collaboratorEmail = plan.collaborators[collaboratorIndex].email;
    
    // Remove the collaborator
    plan.collaborators.splice(collaboratorIndex, 1);
    await plan.save();
    
    res.status(200).json({
      success: true,
      message: `Invitation to ${collaboratorEmail} revoked successfully`
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
// Get all pending invitations for a plan
export const getPlanInvites = async (req, res) => {
  try {
    const { id } = req.params;
    const { clerkId } = req.user;
    
    // Find the plan
    const plan = await Plan.findById(id);
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }
    
    // Check if user is the owner
    if (plan.clerkUserId !== clerkId) {
      return res.status(403).json({ success: false, error: 'Only the owner can view invitations' });
    }
    
    // Filter only pending invitations
    const pendingInvites = plan.collaborators.filter(
      collab => collab.status === 'pending'
    ).map(invite => ({
      id: invite._id,
      email: invite.email,
      inviteSent: invite.createdAt || new Date(), // Use createdAt if available, or current date
      inviteExpires: invite.inviteExpires
    }));
    
    res.status(200).json({
      success: true,
      invites: pendingInvites
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
export const getAcceptedInvites = async (req, res) => {
  try {
    const { id } = req.params;
    const { clerkId } = req.user;
    
    // Find the plan
    const plan = await Plan.findById(id);
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }
    
    // Check if user is the owner
    if (plan.clerkUserId !== clerkId) {
      return res.status(403).json({ success: false, error: 'Only the owner can view collaborators' });
    }
    
    // Filter only accepted invitations
    const acceptedInvites = plan.collaborators.filter(
      collab => collab.status === 'accepted'
    ).map(invite => ({
      id: invite._id,
      email: invite.email,
      userId: invite.userId,
      clerkUserId: invite.clerkUserId,
      acceptedAt: invite.updatedAt || invite.createdAt // Use updatedAt if available, or fallback to createdAt
    }));
    
    res.status(200).json({
      success: true,
      acceptedInvites: acceptedInvites
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
export const generatePlan = async (req, res) => {
  try {
    const { destination, fromDate, toDate, activityPreferences, companion } = req.body;
    const { clerkId, email, name } = req.user;
    
    if (!destination) {
      return res.status(400).json({ error: "Destination is required" });
    }
    
    // Find or create user and check credits
    let user = await User.findOne({ clerkId });
    if (!user) {
      user = await User.create({
        clerkId,
        email,
        name,
        image: req.user.image || '',
        credits: 3 // Default credits for new user
      });
    }

    // Check if user has available credits
    if (user.credits <= 0) {
      return res.status(403).json({ 
        error: "You don't have enough credits to generate a plan" 
      });
    }

    // Configure input parameters for Groq
    const inputParams = {
      userPrompt: `Generate a travel plan for ${destination}`,
      fromDate,
      toDate,
      activityPreferences,
      companion
    };
    
    // Generate data in parallel
    const [basicInfo, activities, itineraryData, destinationImage] = await Promise.all([
      GroqService.generateBasicInfo(inputParams.userPrompt),
      GroqService.generateActivities(inputParams),
      GroqService.generateItinerary(inputParams),
      generateDestinationImage(destination)
    ]);
    
    // Create a new plan
    const newPlan = new Plan({
      user: user._id,
      clerkUserId: clerkId,
      destination,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
      activityPreferences,
      companion,
      aboutThePlace: basicInfo.abouttheplace,
      bestTimeToVisit: basicInfo.besttimetovisit,
      adventureActivities: activities.adventuresactivitiestodo,
      localCuisine: activities.localcuisinerecommendations,
      packingChecklist: activities.packingchecklist,
      itinerary: itineraryData.itinerary,
      topPlacesToVisit: itineraryData.topplacestovisit,
      destinationImage: destinationImage,
      isPublic: false,
      collaborators: []
    });
    
    const savedPlan = await newPlan.save();
    
    // Update user: decrement credits and add plan to their plans array
    await User.findByIdAndUpdate(user._id, {
      $inc: { credits: -1 }, // Decrement credits by 1
      $push: { plans: savedPlan._id }
    });
    
    res.status(201).json({
      success: true,
      data: savedPlan,
      remainingCredits: user.credits - 1
    });
  } catch (error) {
    console.error("Error generating plan:", error);
    res.status(500).json({ error: error.message });
  }
};

export const generateEmptyPlan = async (req, res) => {
  try {
    const { destination, fromDate, toDate, activityPreferences, companion } = req.body;
    const { clerkId, email, name } = req.user; // Assuming middleware adds user info to req
    
    if (!destination) {
      return res.status(400).json({ error: "Destination is required" });
    }
    
    // Find or create user in our database
    let user = await User.findOne({ clerkId });
    if (!user) {
      user = await User.create({
        clerkId,
        email,
        name,
        image: req.user.image || ''
      });
    }
    
    // Generate only the destination image
    const destinationImage = await generateDestinationImage(destination);
    
    // Create a new empty plan in the database but with the generated image
    const newPlan = new Plan({
      user: user._id, // Link to MongoDB user ID
      clerkUserId: clerkId, // Also store Clerk ID directly in plan
      destination,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
      activityPreferences: activityPreferences || [],
      companion: companion || "",
      aboutThePlace: "",
      bestTimeToVisit: "",
      adventureActivities: [],
      localCuisine: [],
      packingChecklist: [],
      itinerary: [],
      topPlacesToVisit: [],
      destinationImage: destinationImage, // Store the generated image
      isPublic: false,
      collaborators: [], // Initialize with empty collaborators array
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "draft" // Adding a status field to indicate this is a draft plan
    });
    
    const savedPlan = await newPlan.save();
    
    // Add plan to user's plans array
    await User.findByIdAndUpdate(user._id, {
      $push: { plans: savedPlan._id }
    });
    
    res.status(201).json(savedPlan);
  } catch (error) {
    console.error("Error generating empty plan with image:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getPlanUsers = async (req, res) => {
  try {
    const { planId } = req.params;
    
    const plan = await Plan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    // Get the owner information
    const owner = await User.findOne({ clerkId: plan.clerkUserId });
    
    if (!owner) {
      return res.status(404).json({ message: 'Plan owner not found' });
    }
    
    // Format owner information with name
    const ownerInfo = {
      _id: owner._id,
      userId: owner.clerkUserId,
      firstName: owner.firstName || '',
      lastName: owner.lastName || '',
      name: owner.name || `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'Unknown User'
    };
    
    // Get collaborator information
    const collaboratorInfoPromises = plan.collaborators
      .filter(collab => collab.status === 'accepted')
      .map(async (collab) => {
        const user = await User.findOne({ clerkId: collab.clerkUserId });
        
        if (!user) {
          return {
            _id: collab.userId,
            userId: collab.clerkUserId,
            name: collab.name || 'Unknown User'
          };
        }
        
        return {
          _id: user._id,
          userId: user.clerkUserId,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User'
        };
      });
    
    const collaboratorInfo = await Promise.all(collaboratorInfoPromises);
    
    // Combine owner and collaborators
    const users = [ownerInfo, ...collaboratorInfo];
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plan users', error: error.message });
  }
};



export const getWeather = async (req, res) => {
  try {
    const { placeName } = req.query;

    if (!placeName) {
      return res.status(400).json({ error: 'Place name is required' });
    }

    const API_KEY = process.env.OPENWEATHER_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Get only the part before the first comma and trim whitespace
    const searchQuery = placeName.split(',')[0].trim();

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(searchQuery)}&appid=${API_KEY}`
    );

    return res.json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: error.response.data.message || 'Failed to fetch weather data' 
      });
    }
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(502).json({ error: 'Weather API service is unavailable' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};