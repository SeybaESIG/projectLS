import express from 'express';
import {
    markConversationAsRead,
    getUnreadCount,
    getAllUnreadConversations,
    getAllMsgLectures,
} from '../controllers/msgLecturesController.js';
import { validate } from '../middlewares/validation.js';
import { msgLectureSchemas } from '../schemas/msgLectureSchemas.js';

const router = express.Router();

router.post('/mark-read', validate(msgLectureSchemas.markAsRead, 'body'), markConversationAsRead);
router.get('/unread-count/:id_util', validate(msgLectureSchemas.userParams, 'params'), getUnreadCount);
router.get('/unread-conversations/:id_util', validate(msgLectureSchemas.userParams, 'params'), getAllUnreadConversations);
router.get('/', getAllMsgLectures);

export default router;




