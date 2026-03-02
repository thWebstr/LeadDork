import express from 'express';
import { generateSearchDorks, executeDorkScrape } from '../controllers/searchController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { searchSchemas } from '../validators/schemas.js';

const router = express.Router();

router.post('/generate', validateRequest(searchSchemas.generate), generateSearchDorks);
router.post('/scrape', validateRequest(searchSchemas.scrape), executeDorkScrape);

export default router;
