const express = require('express');
const {
    getKaryawanDetailsController,
    createMutasiController,
    getMutasiDetailsController,
    approveMutasiController,
    rejectMutasiController,
    getAllMutasiController,
    updateMutasiController,
    deleteMutasiController
} = require('../controller/mutationController'); 
import { authenticate } from '../../middleware/authenticate'; 
import { checkRole } from '../../middleware/checkRole';

const router = express.Router();

router.get('/mutasi', authenticate, checkRole([1, 2, 3, 4]), getAllMutasiController);
router.get('/mutasi/:perner', authenticate, checkRole([1, 2, 3, 4]), getMutasiDetailsController);
router.get('/mutasi/karyawan/:perner', authenticate, checkRole([2]), getKaryawanDetailsController);
router.post('/mutasi', authenticate, checkRole([2]), createMutasiController);
router.post('/mutasi/:perner/persetujuan', authenticate, checkRole([4]), approveMutasiController);
router.post('/mutasi/:perner/penolakan', authenticate, checkRole([4]), rejectMutasiController);
router.put('/mutasi/update/:perner', authenticate, checkRole([2]), updateMutasiController);
router.delete('/mutasi/:perner', authenticate, checkRole([2]), deleteMutasiController);

export default router;
