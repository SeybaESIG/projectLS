import { Router } from 'express';
import {
    listUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUsersByRole,
    getUsersByVille
} from '../controllers/usersControllers.js';

const router = Router();

router.get('/', listUsers);
// Specific routes must come before generic ":id" to avoid shadowing
router.get('/role/:roleId', getUsersByRole);
router.get('/ville/:villeId', getUsersByVille);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;