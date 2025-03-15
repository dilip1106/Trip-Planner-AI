// import express from "express";
// import { getCommunityPlan, postPlan } from "../controllers/plan.controller.js";

// const router = express.Router();

// router.get("/:planId",getCommunityPlan);
// router.put("/addPlan",postPlan);
// router
// export default router;

// backend/routes/plan.route.js
import express from 'express';
// import { verifyToken } from '../middleware/verifyToken.js';
import { 
  generatePlan,
  getUserPlans, 
  getPlanById, 
  updatePlan, 
  deletePlan, 
  getPublicPlans,
  togglePlanVisibility
} from '../controllers/plan.controller.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/generate', generatePlan);
router.get('/user', getUserPlans);
router.get('/:id', getPlanById);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);
router.patch('/:id/toggle-visibility', togglePlanVisibility);

// Public routes
router.get('/public/all', getPublicPlans);

export default router;