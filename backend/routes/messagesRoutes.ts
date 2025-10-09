import express from 'express';
import {
  getAllMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
  searchMessages,
} from '../controllers/messagesController.js';

const router = express.Router();

router.get('/', getAllMessages);
router.get('/search', searchMessages);
router.get('/:id', getMessageById);
router.post('/', createMessage);
router.put('/:id', updateMessage);
router.delete('/:id', deleteMessage);

export default router;