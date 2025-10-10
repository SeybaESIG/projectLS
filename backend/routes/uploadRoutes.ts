import express from 'express';
import { getSignedUploadUrl, checkGcsHealth } from '../controllers/uploadController.js';
import { validate } from '../middlewares/validation.js';
import { uploadSchemas } from '../schemas/uploadSchemas.js';

const router = express.Router();

/**
 * Route pour obtenir une Signed URL pour upload direct vers GCS
 * POST /api/upload/signed-url
 * Body: { filename: 'photo.jpg', contentType: 'image/jpeg', category: 'user-photo' }
 * 
 * Retourne une Signed URL valide 15 minutes avec limite de 5 Mo
 */
router.post('/signed-url', validate(uploadSchemas.getSignedUrl, 'body'), getSignedUploadUrl);

/**
 * Route de santé pour vérifier la configuration GCS
 * GET /api/upload/health
 */
router.get('/health', checkGcsHealth);

export default router;


