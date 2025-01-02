const express = require('express');
import { authenticate } from '../../middleware/authenticate';
import { checkRole } from '../../middleware/checkRole';
const { getAllUsersController, getUserByIdController } = require('../controller/userController');

const router = express.Router();

router.get('/users', getAllUsersController);
router.get('/users/:id', authenticate, checkRole([1, 2, 3, 4]), getUserByIdController);

export default router;
