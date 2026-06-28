import { Router } from 'express';
import { handleAIChat } from '../controllers/grievanceController';

const router = Router();

// Notice: No authenticate middleware here because this is accessed from the public widget!
router.post('/chat', handleAIChat);

export default router;
