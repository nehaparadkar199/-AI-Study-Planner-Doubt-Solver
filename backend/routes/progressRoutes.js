import express from 'express';
import { getProgress, saveProgress } from '../controllers/progressController.js';

const router = express.Router();

router.get('/:userId', getProgress);
router.post('/:userId/update', saveProgress);

export default router;
