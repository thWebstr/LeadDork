import express from 'express';
import { generateSearchDorks, executeDorkScrape } from '../controllers/searchController.js';

const router = express.Router();

router.post('/generate', generateSearchDorks);
router.post('/scrape', executeDorkScrape);

export default router;
