import express from 'express';
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  searchTransactions,
} from '../controllers/transactionsController.js';
import { validate } from '../middlewares/validation.js';
import { transactionSchemas } from '../schemas/transactionSchemas.js';

const router = express.Router();

router.get('/', validate(transactionSchemas.query, 'query'), getAllTransactions);
router.get('/search', validate(transactionSchemas.query, 'query'), searchTransactions);
router.get('/:id', validate(transactionSchemas.params, 'params'), getTransactionById);
router.post('/', validate(transactionSchemas.create, 'body'), createTransaction);
router.patch('/:id', validate(transactionSchemas.params, 'params'), validate(transactionSchemas.update, 'body'), updateTransaction);
router.delete('/:id', validate(transactionSchemas.params, 'params'), deleteTransaction);

export default router;
