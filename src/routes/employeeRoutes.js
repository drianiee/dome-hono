const express = require('express');
import { authenticate } from '../../middleware/authenticate';
import { checkRole } from '../../middleware/checkRole';
const {
    getAllKaryawanController,
    getKaryawanByPernerController,
    filterKaryawanByUnitController,
    updateKaryawanController,
} = require('../controller/employeeController');

const router = express.Router();

router.get('/karyawan', authenticate, checkRole([1, 2, 3, 4]), getAllKaryawanController);
router.get('/karyawan/:perner', authenticate, checkRole([1, 2, 3, 4]), getKaryawanByPernerController);
router.get('/karyawan/filter/unit', authenticate, checkRole([1, 2]), filterKaryawanByUnitController);
router.put('/karyawan/update/:perner', authenticate, checkRole([1, 2]), updateKaryawanController);

export default router;
