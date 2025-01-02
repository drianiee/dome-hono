const express = require('express');
const {
    getAllKaryawanWithRatingController,
    getKaryawanWithRatingByBulanTahunController,
    createRatingController
} = require('../controller/ratingController'); 
import { authenticate } from '../../middleware/authenticate';
import { checkRole } from '../../middleware/checkRole';

const router = express.Router();

router.get('/rating', authenticate, checkRole([1, 2, 3, 4]), getAllKaryawanWithRatingController);
router.get('/rating/filter', authenticate, checkRole([1, 2, 3, 4]), getKaryawanWithRatingByBulanTahunController);
router.post('/rating/:perner', authenticate, checkRole([4]), createRatingController);

export default router;
