import express from 'express';
import { getHistory, deleteHistory } from '../controllers/historyController.js';

const router = express.Router();

router.get('/', getHistory);
router.delete('/:id', deleteHistory);

export default router;
