import express from 'express';
import { askAcademicDoubt } from '../controllers/chatController.js';

const router = express.Router();

router.post('/ask', askAcademicDoubt);

export default router;
