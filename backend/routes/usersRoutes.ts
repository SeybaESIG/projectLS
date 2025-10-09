import { Router } from 'express';
import {
    listUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUsersByRole,
    getUsersByVille,
    searchUsers
} from '../controllers/usersControllers.js';

const router = Router();

router.get('/', listUsers);
router.get('/search', searchUsers);
router.get('/role/:roleId', getUsersByRole);
router.get('/ville/:villeId', getUsersByVille);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;