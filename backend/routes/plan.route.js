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
  getPlanByIdForPlan
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
export default router;