import express from 'express';
import { getSearchHistory, deleteHistoryItem } from '../controllers/historyController.js';

const router = express.Router();

router.get('/', getSearchHistory);
router.delete('/:id', deleteHistoryItem);

export default router;
