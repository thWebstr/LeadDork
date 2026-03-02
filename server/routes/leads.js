import express from 'express';
import { getAllLeads, createLead, updateLead, deleteLead } from '../controllers/leadsController.js';

const router = express.Router();

router.get('/', getAllLeads);
router.post('/', createLead);
router.patch('/:id', updateLead);
router.delete('/:id', deleteLead);

export default router;
