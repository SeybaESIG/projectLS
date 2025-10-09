import express from 'express';
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  searchTransactions,
} from '../controllers/transactionsController.js';

const router = express.Router();

router.get('/', getAllTransactions);
router.get('/search', searchTransactions);
router.get('/:id', getTransactionById);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;