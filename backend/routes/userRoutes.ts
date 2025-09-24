import { Router } from 'express';
import {
    listUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUsersByRole,
    getUsersByVille
} from '../controllers/usersController.js';

const router = Router();

router.get('/', listUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Additional routes for filtering
router.get('/role/:roleId', getUsersByRole);
router.get('/ville/:villeId', getUsersByVille);

export default router;