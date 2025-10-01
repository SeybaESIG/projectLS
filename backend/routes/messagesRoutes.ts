import express from 'express';
import {
  getAllMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
} from '../controllers/messagesController';

const router = express.Router();

router.get('/messages', getAllMessages);
router.get('/messages/:id', getMessageById);
router.post('/messages', createMessage);
router.put('/messages/:id', updateMessage);
router.delete('/messages/:id', deleteMessage);

export default router;