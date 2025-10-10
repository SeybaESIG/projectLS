import { Storage } from '@google-cloud/storage';

// Configuration Google Cloud Storage
const storageOptions: any = {};
if (process.env.GCS_PROJECT_ID) {
  storageOptions.projectId = process.env.GCS_PROJECT_ID;
}
if (process.env.GCS_CREDENTIALS_PATH) {
  storageOptions.keyFilename = process.env.GCS_CREDENTIALS_PATH;
}

const storage = new Storage(storageOptions);

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || '';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo en bytes

/**
 * Générer une Signed URL pour upload direct vers GCS
 * @param filename Nom du fichier
 * @param contentType Type MIME du fichier
 * @returns Signed URL avec conditions de sécurité
 */
export async function generateSignedUploadUrl(
  filename: string,
  contentType: string
): Promise<{ signedUrl: any; publicUrl: string; filename: string }> {
  try {
    if (!BUCKET_NAME) {
      throw new Error('GCS_BUCKET_NAME non configuré');
    }

    const bucket = storage.bucket(BUCKET_NAME);
    const uniqueFilename = `images/${Date.now()}-${Math.random().toString(36).substring(7)}-${filename}`;
    const file = bucket.file(uniqueFilename);

    // Générer Signed URL avec conditions strictes
    const [response] = await file.generateSignedPostPolicyV4({
      expires: Date.now() + 15 * 60 * 1000, // Expire dans 15 minutes
      conditions: [
        ['content-length-range', 0, MAX_FILE_SIZE], // MAX 5 Mo ✅
        ['eq', '$Content-Type', contentType], // Type MIME strict ✅
      ],
      fields: {
        'Content-Type': contentType,
      },
    });

    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${uniqueFilename}`;

    return {
      signedUrl: response,
      publicUrl,
      filename: uniqueFilename
    };
  } catch (error) {
    console.error('Erreur lors de la génération de la Signed URL:', error);
    throw error;
  }
}

/**
 * Supprimer un fichier de GCS
 * @param filename Nom du fichier à supprimer
 */
export async function deleteFile(filename: string): Promise<void> {
  try {
    if (!BUCKET_NAME) {
      throw new Error('GCS_BUCKET_NAME non configuré');
    }

    const bucket = storage.bucket(BUCKET_NAME);
    await bucket.file(filename).delete();
    
    console.log(`Fichier ${filename} supprimé de GCS`);
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
    throw error;
  }
}

/**
 * Vérifier si un fichier existe dans GCS
 * @param filename Nom du fichier
 * @returns true si le fichier existe
 */
export async function fileExists(filename: string): Promise<boolean> {
  try {
    if (!BUCKET_NAME) {
      return false;
    }

    const bucket = storage.bucket(BUCKET_NAME);
    const [exists] = await bucket.file(filename).exists();
    
    return exists;
  } catch (error) {
    console.error('Erreur lors de la vérification du fichier:', error);
    return false;
  }
}

/**
 * Extraire le nom du fichier depuis une URL publique GCS
 * @param url URL publique GCS
 * @returns Nom du fichier ou null
 */
export function extractFilenameFromUrl(url: string): string | null {
  try {
    const regex = new RegExp(`https://storage\\.googleapis\\.com/${BUCKET_NAME || ''}/(.+)`);
    const match = url.match(regex);
    return match ? (match[1] || null) : null;
  } catch (error) {
    return null;
  }
}

export default storage;


