import express from "express";
import { getCommunityPlan, postPlan } from "../controllers/plan.controller.js";

const router = express.Router();

router.get("/:planId",getCommunityPlan);
router.put("/addPlan",postPlan);

export default router;