import express from 'express';
import {
    getAllMessages,
    getMessageById,
    createMessage,
    deleteMessage,
    getConversation,
    getUnreadMessages,
    searchMessages,
} from '../controllers/messagesController.js';
import { validate } from '../middlewares/validation.js';
import { messageSchemas } from '../schemas/messageSchemas.js';

const router = express.Router();

router.get('/', validate(messageSchemas.query, 'query'), getAllMessages);
router.get('/search', validate(messageSchemas.query, 'query'), searchMessages);
router.get('/conversation', validate(messageSchemas.conversationQuery, 'query'), getConversation);
router.get('/unread/:id_util', validate(messageSchemas.userParams, 'params'), getUnreadMessages);
router.get('/:id', validate(messageSchemas.params, 'params'), getMessageById);
router.post('/', validate(messageSchemas.create, 'body'), createMessage);
router.delete('/:id', validate(messageSchemas.params, 'params'), deleteMessage);

export default router;
