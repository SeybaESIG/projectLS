import type { Request, Response, NextFunction } from 'express';
import { generateSignedUploadUrl } from '../services/gcsService.js';

/**
 * Générer une Signed URL pour permettre l'upload direct vers GCS
 * Cette route est appelée par le frontend AVANT l'upload
 */
export const getSignedUploadUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename, contentType, category = 'message-image' } = req.body;
    
    // Vérifier que GCS est configuré
    if (!process.env.GCS_BUCKET_NAME || !process.env.GCS_PROJECT_ID) {
      return res.status(503).json({ 
        message: 'Service de stockage non configuré. Veuillez configurer Google Cloud Storage.' 
      });
    }

    // Générer la Signed URL avec limite de 5 Mo
    const result = await generateSignedUploadUrl(filename, contentType);
    
    res.status(200).json({
      message: 'Signed URL générée avec succès',
      signedUrl: result.signedUrl,
      publicUrl: result.publicUrl,
      filename: result.filename,
      maxSize: 5 * 1024 * 1024, // 5 Mo
      expiresIn: '15 minutes'
    });
  } catch (error) {
    console.error('Erreur lors de la génération de la Signed URL:', error);
    next(error);
  }
};

/**
 * Endpoint de santé pour vérifier la configuration GCS
 */
export const checkGcsHealth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isConfigured = !!(
      process.env.GCS_BUCKET_NAME && 
      process.env.GCS_PROJECT_ID && 
      process.env.GCS_CREDENTIALS_PATH
    );
    
    res.status(200).json({
      configured: isConfigured,
      bucketName: process.env.GCS_BUCKET_NAME || 'Not configured',
      maxFileSize: '5 MB',
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });
  } catch (error) {
    next(error);
  }
};




