const express = require('express');
const {
    getDashboardSummaryController
} = require('../controller/dashboardController'); 
import { authenticate } from '../../middleware/authenticate';
import { checkRole } from '../../middleware/checkRole';

const router = express.Router();

router.get('/dashboard', authenticate, checkRole([1, 2, 3, 4]), getDashboardSummaryController);

export default router;
