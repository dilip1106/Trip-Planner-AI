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
  generatePlan
} from '../controllers/plan.controller.js';
import { authenticateUser } from '../middleware/verifyAuthUser.js';
import { requireAuth } from '../middleware/auth.js';
// import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all plan routes
// router.use(authenticateUser);

// Plan CRUD operations
router.post('/generate', authenticateUser,generatePlan)
// router.post('/', createPlan);


router.post('/',authenticateUser, getAllPlans);
router.get('/public', getPublicPlans);

router.post('/:id/view', authenticateUser, getPlanById);
router.get('/:id',  getPlanById);


router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);

// Collaboration routes
router.post('/:id/collaborators',authenticateUser, inviteCollaborator);
router.post('/invite/accept/:token',authenticateUser, acceptCollaboratorInvite);


router.delete('/:id/collaborators/:userId', removeCollaborator);

export default router;