// backend/controllers/plan.controller.js
import Plan from '../models/plans.model.js';
import User from '../models/user.model.js';
import { v4 as uuidv4 } from 'uuid';
import sendMail from '../util/email.js';
import * as GroqService from '../services/groq_service.js'; // Updated import to use Groq service
import { generateDestinationImage } from '../services/image_service.js';

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
    const { clerkId } = req.user;
    
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
    const inviteUrl = `http://localhost:5173/plans/invite/accept/${inviteToken}`;
    
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


export const generatePlan = async (req, res) => {
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
      generateDestinationImage(destination) // Generate image in parallel
    ]);
    
    // Create a new plan in the database
    const newPlan = new Plan({
      user: user._id, // Link to MongoDB user ID
      clerkUserId: clerkId, // Also store Clerk ID directly in plan
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
      destinationImage: destinationImage, // Store the base64 encoded image
      isPublic: false,
      collaborators: [] // Initialize with empty collaborators array
    });
    
    const savedPlan = await newPlan.save();
    
    // Add plan to user's plans array
    await User.findByIdAndUpdate(user._id, {
      $push: { plans: savedPlan._id }
    });
    
    res.status(201).json(savedPlan);
  } catch (error) {
    console.error("Error generating plan:", error);
    res.status(500).json({ error: error.message });
  }
};