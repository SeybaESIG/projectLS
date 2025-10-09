import express from 'express';
import {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
} from '../controllers/rolesController.js';

const router = express.Router();

router.get('/', getAllRoles);
router.get('/:id', getRoleById);
router.post('/', createRole);
router.patch('/:id', updateRole);
router.delete('/:id', deleteRole);

export default router;
