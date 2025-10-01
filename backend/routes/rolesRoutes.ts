import express from 'express';
import {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
} from '../controllers/rolesController.js';

const router = express.Router();

router.get('/roles', getAllRoles);
router.get('/roles/:id', getRoleById);
router.post('/roles', createRole);
router.patch('/roles/:id', updateRole);
router.delete('/roles/:id', deleteRole);

export default router;
