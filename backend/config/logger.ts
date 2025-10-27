import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuration du logger Winston avec rotation automatique
 * 
 * Niveaux de log : error > warn > info > http > debug
 * 
 * Transports :
 * - Console : Tous les logs (colorés en développement)
 * - File (error) : Seulement les erreurs (rotation daily)
 * - File (combined) : Tous les logs (rotation daily)
 */

// Format personnalisé pour les logs
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Format console avec couleurs pour le développement
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let metaStr = '';
        if (Object.keys(meta).length > 0) {
            // Enlever les champs internes winston
            const cleanMeta = { ...meta };
            delete cleanMeta.timestamp;
            delete cleanMeta.level;
            delete cleanMeta.message;
            
            if (Object.keys(cleanMeta).length > 0) {
                metaStr = ` ${JSON.stringify(cleanMeta)}`;
            }
        }
        return `${timestamp} [${level}]: ${message}${metaStr}`;
    })
);

// Configuration des transports
const transports: winston.transport[] = [];

// Transport Console (toujours actif)
transports.push(
    new winston.transports.Console({
        format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
        level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
    })
);

// Transports Fichiers (sauf en test)
if (process.env.NODE_ENV !== 'test') {
    const logsDir = path.join(__dirname, '..', 'logs');

    // Fichier des erreurs avec rotation
    transports.push(
        new DailyRotateFile({
            filename: path.join(logsDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            format: logFormat,
            maxFiles: '30d', // Garde 30 jours
            maxSize: '20m', // Max 20MB par fichier
            zippedArchive: true // Compresse les anciens logs
        })
    );

    // Fichier combiné (tous les logs) avec rotation
    transports.push(
        new DailyRotateFile({
            filename: path.join(logsDir, 'app-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            format: logFormat,
            maxFiles: '30d',
            maxSize: '20m',
            zippedArchive: true
        })
    );
}

// Création du logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports,
    // Ne pas sortir en cas d'erreur de log
    exitOnError: false,
    // Rejeter les promesses en cas d'erreur
    handleExceptions: true,
    handleRejections: true
});

// Helpers pour ajouter du contexte aux logs
export const logWithContext = (level: string, message: string, context?: any) => {
    logger.log(level, message, context);
};

export const logRequest = (req: any, message: string) => {
    logger.info(message, {
        method: req.method,
        path: req.path,
        ip: req.ip,
        user: req.user?.email || 'anonymous'
    });
};

export const logError = (error: Error, context?: any) => {
    logger.error(error.message, {
        stack: error.stack,
        ...context
    });
};

// Export du logger
export default logger;

// Message de démarrage
if (process.env.NODE_ENV !== 'test') {
    logger.info('📝 Logger Winston initialisé', {
        level: logger.level,
        env: process.env.NODE_ENV || 'development',
        transports: transports.length
    });
}







