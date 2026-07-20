import express from 'express';
import { generateStudyPlan } from '../controllers/plannerController.js';

const router = express.Router();

router.post('/generate', generateStudyPlan);

export default router;
