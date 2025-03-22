// backend/routes/plan.routes.js
import express from 'express';
import { 
  createPlan, 
  getAllPlans, 
  getPlanById, 
  updatePlan, 
  deletePlan, 
  getPublicPlans,
  inviteCollaborator,
  acceptCollaboratorInvite,
  removeCollaborator,
  generatePlan,
  generateEmptyPlan,
  getWeather,
  getPlanInvites,
  revokeInvite,
  getAcceptedInvites,
  getPlanByIdForPlan,
  getPlanUsers
} from '../controllers/plan.controller.js';
import { authenticateUser } from '../middleware/verifyAuthUser.js';
import Plan from '../models/plans.model.js';
// import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all plan routes
// router.use(authenticateUser);

// Plan CRUD operations
router.post('/empty', authenticateUser, generateEmptyPlan);
router.post('/generate', authenticateUser,generatePlan);
router.get('/weather', getWeather);
// router.post('/', createPlan);


router.post('/',authenticateUser, getAllPlans);
router.get('/public', getPublicPlans);

router.post('/:id/view', authenticateUser, getPlanById);
router.get('/:id',  getPlanById);
router.post('/:id/view/plan', authenticateUser, getPlanByIdForPlan);


router.put('/:id',authenticateUser, updatePlan);
router.delete('/:id/delete',authenticateUser, deletePlan);

// Collaboration routes
router.post('/:id/collaborators',authenticateUser, inviteCollaborator);
router.post('/invite/accept/:token',authenticateUser, acceptCollaboratorInvite);

router.post('/:id/collaborators/:userId/revoke',authenticateUser, removeCollaborator );
router.post('/:planId/invite/:id/revoke',authenticateUser, revokeInvite);

router.post('/:id/invites',authenticateUser, getPlanInvites );
router.post('/:id/getCollaborator',authenticateUser, getAcceptedInvites );

router.post('/:planId/users',authenticateUser, getPlanUsers);
// router.delete('/:id/collaborators/:userId', removeCollaborator);
// On your backend server
router.post('/:planId/check-access', async (req, res) => {
  try {
    const { planId } = req.params;
    const { userData } = req.body;

    if (!userData || !userData.clerkId) {
      return res.status(401).json({ 
        success: false, 
        hasAccess: false, 
        error: 'Authentication required' 
      });
    }

    // Check if user has access to the plan
    const plan = await Plan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({ 
        success: false, 
        hasAccess: false, 
        error: 'Plan not found' 
      });
    }
    const isCollaborator = userData.clerkId && plan.collaborators.some(
      collab => collab.clerkUserId === userData.clerkId && collab.status === 'accepted'
    );
    const hasAccess = plan.clerkUserId === userData.clerkId || isCollaborator;

    return res.json({ 
      success: true, 
      hasAccess 
    });

  } catch (error) {
    console.error('Access check error:', error);
    return res.status(500).json({ 
      success: false, 
      hasAccess: false, 
      error: 'Failed to check access' 
    });
  }
});

// Get user's default currency
router.post('/:id/currency', authenticateUser, async (req, res) => {
  try {
    const planId = req.params.id;
    
    // Find the specific plan by its ID
    const plan = await Plan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    // Return the currency from this specific plan
    return res.status(200).json({
      preferredCurrency: plan.currency || 'INR'
    });
    
  } catch (error) {
    console.error('Error fetching plan currency:', error);
    return res.status(500).json({ error: 'Failed to fetch plan currency' });
  }
});

// Update currency for a specific plan
router.post('/:id/currency/update', authenticateUser, async (req, res) => {
  try {
    const planId = req.params.id;
    const { currencyCode } = req.body;
    const { clerkId } = req.user; // Assuming authenticateUser adds user info
    
    if (!currencyCode) {
      return res.status(400).json({ error: 'Currency code is required' });
    }
    
    // Find plan by ID first
    const plan = await Plan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    // Check permissions
    if (plan.clerkUserId !== clerkId) {
      const isCollaborator = plan.collaborators?.some(
        collab => collab.clerkUserId === clerkId && collab.status === 'accepted'
      );
      
      if (!isCollaborator) {
        return res.status(403).json({ error: 'You do not have permission to update this plan' });
      }
    }
    
    plan.currency = currencyCode;
    await plan.save();
    
    return res.status(200).json({
      success: true,
      message: 'Currency updated successfully for this plan',
      currency: plan.currency
    });
  } catch (error) {
    console.error('Error updating plan currency:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to update plan currency' 
    });
  }
});
export default router;