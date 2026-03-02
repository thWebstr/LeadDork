import express from 'express';
import { getAllLeads, createLead, updateLead, deleteLead } from '../controllers/leadsController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { leadSchemas } from '../validators/schemas.js';

const router = express.Router();

router.get('/', getAllLeads);
router.post('/', validateRequest(leadSchemas.create), createLead);
router.patch('/:id', updateLead);
router.delete('/:id', deleteLead);

export default router;
