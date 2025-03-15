import Plan from "../models/plans.model.js";

export const postPlan = async (req, res) => {
    try {
        const plan = new Plan(req.body);
        await plan.save();
        res.status(201).json({ success: true, data: plan });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
};

export const getCommunityPlan = async (req, res) => {
    try {
        const { planId } = req.params;
        if (!planId) return res.status(400).json({ message: "Plan ID is required" });
    
        const plan = await Plan.findOne({ planID: planId });
        if (!plan) return res.status(404).json({ message: "Plan not found" });
    
        res.status(200).json(plan); // ✅ Send JSON response
      } catch (error) {
        console.error("Error fetching plan:", error);
        res.status(500).json({ message: "Error fetching plan", error: error.message });
      }
}
// backend/controllers/plan.controller.js
// import Plan from '../models/plans.model.js';
import User from '../models/user.model.js';
import * as GroqService from '../services/groq_service.js'; // Updated import to use Groq service

// Generate a new travel plan 
export const generatePlan = async (req, res) => {
  try {
    const { destination, fromDate, toDate, activityPreferences, companion } = req.body;
    // const userId = req.user.id;

    if (!destination) {
      return res.status(400).json({ error: "Destination is required" });
    }

    // Get user from database
    // const user = await User.findById(userId);
    // if (!user) {
    //   return res.status(404).json({ error: "User not found" });
    // }

    // Configure input parameters for Groq
    const inputParams = {
      userPrompt: `Generate a travel plan for ${destination}`,
      fromDate,
      toDate,
      activityPreferences,
      companion
    };

    // Generate the three batches of data in parallel
    const [basicInfo, activities, itineraryData] = await Promise.all([
      GroqService.generateBasicInfo(inputParams.userPrompt),
      GroqService.generateActivities(inputParams),
      GroqService.generateItinerary(inputParams)
    ]);

    // Create a new plan in the database
    const newPlan = new Plan({
      // Remove the user field temporarily
      destination,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      activityPreferences,
      companion,
      aboutThePlace: basicInfo.abouttheplace,
      bestTimeToVisit: basicInfo.besttimetovisit,
      adventureActivities: activities.adventuresactivitiestodo,
      localCuisine: activities.localcuisinerecommendations,
      packingChecklist: activities.packingchecklist,
      itinerary: itineraryData.itinerary,
      topPlacesToVisit: itineraryData.topplacestovisit,
      isPublic: false
    });

    const savedPlan = await newPlan.save();
    
    res.status(201).json(savedPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  
  }
};

// Get all plans for a user
export const getUserPlans = async (req, res) => {
  try {
    const userId = req.user.id;
    const plans = await Plan.find({ user: userId }).sort({ createdAt: -1 });
    
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
 
  }
};

// Get a specific plan by ID
export const getPlanById = async (req, res) => {
  try {
    const planId = req.params.id;
    const plan = await Plan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    
    // Check if the plan is public or belongs to the user
    if (!plan.isPublic && plan.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "You don't have permission to view this plan" });
    }
    
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
 
  }
};

// Update a plan
export const updatePlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const updateData = req.body;
    const userId = req.user.id;
    
    const plan = await Plan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    
    // Check if the plan belongs to the user
    if (plan.user.toString() !== userId) {
      return res.status(403).json({ error: "You don't have permission to update this plan" });
    }
    
    const updatedPlan = await Plan.findByIdAndUpdate(planId, updateData, { new: true });
    
    res.status(200).json(updatedPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
 
  }
};

// Delete a plan
export const deletePlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const userId = req.user.id;
    
    const plan = await Plan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    
    // Check if the plan belongs to the user
    if (plan.user.toString() !== userId) {
      return res.status(403).json({ error: "You don't have permission to delete this plan" });
    }
    
    await Plan.findByIdAndDelete(planId);
    
    res.status(200).json({ message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  
  }
};

// Get public plans
export const getPublicPlans = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const plans = await Plan.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username avatarUrl');
    
    const total = await Plan.countDocuments({ isPublic: true });
    
    res.status(200).json({
      plans,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  
  }
};

// Toggle plan visibility (public/private)
export const togglePlanVisibility = async (req, res) => {
  try {
    const planId = req.params.id;
    const userId = req.user.id;
    
    const plan = await Plan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    
    // Check if the plan belongs to the user
    if (plan.user.toString() !== userId) {
      return res.status(403).json({ error: "You don't have permission to update this plan" });
    }
    
    plan.isPublic = !plan.isPublic;
    await plan.save();
    
    res.status(200).json({
      id: plan._id,
      isPublic: plan.isPublic
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  
  }
};