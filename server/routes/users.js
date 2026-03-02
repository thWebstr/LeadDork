import express from 'express';
import { getUserSettings, updateUserSettings } from '../controllers/usersController.js';

const router = express.Router();

router.get('/', getUserSettings);
router.patch('/', updateUserSettings);

export default router;
