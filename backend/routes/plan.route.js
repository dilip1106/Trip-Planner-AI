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
  getAcceptedInvites
} from '../controllers/plan.controller.js';
import { authenticateUser } from '../middleware/verifyAuthUser.js';
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

export default router;