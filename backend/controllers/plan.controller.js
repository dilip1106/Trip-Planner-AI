import { Plan } from "../models/plans.model.js";

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
