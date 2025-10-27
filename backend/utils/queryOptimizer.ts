import logger from '../config/logger.js';

/**
 * Utilitaires pour optimiser les requêtes SQL et détecter les problèmes
 */

/**
 * Détecteur de N+1 queries en développement
 * 
 * Surveille le nombre de queries par requête HTTP et alerte si trop élevé
 */
class N1Detector {
    private queryCount: Map<string, number> = new Map();
    private queryTiming: Map<string, number[]> = new Map();
    
    startRequest(requestId: string) {
        this.queryCount.set(requestId, 0);
        this.queryTiming.set(requestId, []);
    }
    
    recordQuery(requestId: string, duration: number) {
        const count = this.queryCount.get(requestId) || 0;
        this.queryCount.set(requestId, count + 1);
        
        const timings = this.queryTiming.get(requestId) || [];
        timings.push(duration);
        this.queryTiming.set(requestId, timings);
    }
    
    endRequest(requestId: string, path: string) {
        const count = this.queryCount.get(requestId) || 0;
        const timings = this.queryTiming.get(requestId) || [];
        const totalTime = timings.reduce((sum, t) => sum + t, 0);
        
        // Alerter si trop de queries
        if (count > 10) {
            logger.warn(`⚠️  Possible N+1 query détecté`, {
                path,
                queryCount: count,
                totalTime: `${totalTime}ms`,
                avgTime: timings.length > 0 ? `${(totalTime / timings.length).toFixed(2)}ms` : '0ms'
            });
        } else if (count > 5) {
            logger.debug(`Requête avec ${count} queries SQL`, {
                path,
                totalTime: `${totalTime}ms`
            });
        }
        
        // Nettoyer
        this.queryCount.delete(requestId);
        this.queryTiming.delete(requestId);
    }
}

export const n1Detector = new N1Detector();

/**
 * Helper pour analyser les queries d'un résultat Sequelize
 */
export function analyzeQueryPerformance(
    path: string,
    queryCount: number,
    totalDuration: number
) {
    const avgDuration = queryCount > 0 ? totalDuration / queryCount : 0;
    
    if (queryCount > 10) {
        logger.warn(`🐌 Trop de queries SQL pour ${path}`, {
            count: queryCount,
            total: `${totalDuration}ms`,
            avg: `${avgDuration.toFixed(2)}ms`,
            recommendation: 'Utilisez include pour eager loading'
        });
    }
    
    if (totalDuration > 1000) {
        logger.warn(`🐌 Requête SQL lente pour ${path}`, {
            duration: `${totalDuration}ms`,
            count: queryCount,
            recommendation: 'Vérifiez les indexes et utilisez select/attributes'
        });
    }
}

/**
 * Recommendations pour optimiser une requête
 */
export const optimizationTips = {
    n1Query: `
    ❌ Problème N+1 Query détecté
    
    Avant :
    const users = await User.findAll();
    for (const user of users) {
        const posts = await user.getPosts(); // ❌ 1 query par user (N+1)
    }
    
    Après :
    const users = await User.findAll({
        include: [{ model: Post }] // ✅ 1 seule query
    });
    `,
    
    missingIndex: `
    ❌ Query lente détectée (probablement index manquant)
    
    Solution :
    1. Identifier la colonne filtrée (WHERE, JOIN)
    2. Créer un index :
       CREATE INDEX idx_table_column ON table(column);
    3. Vérifier avec EXPLAIN ANALYZE
    `,
    
    selectAll: `
    ⚠️  SELECT * détecté (toutes les colonnes)
    
    Optimisation :
    await User.findAll({
        attributes: ['id', 'email', 'nom'], // ✅ Seulement les colonnes nécessaires
    });
    `,
    
    pagination: `
    ⚠️  findAll sans limite détecté
    
    Risque : Charger des milliers de lignes en mémoire
    
    Solution :
    await User.findAndCountAll({
        limit: 50,
        offset: (page - 1) * 50
    });
    `
};

/**
 * Helper pour benchmarker une fonction
 */
export async function benchmarkQuery<T>(
    name: string,
    fn: () => Promise<T>
): Promise<T> {
    const start = Date.now();
    
    try {
        const result = await fn();
        const duration = Date.now() - start;
        
        if (duration > 1000) {
            logger.warn(`🐌 Requête lente: ${name}`, { duration: `${duration}ms` });
        } else {
            logger.debug(`⚡ Requête: ${name}`, { duration: `${duration}ms` });
        }
        
        return result;
    } catch (error) {
        const duration = Date.now() - start;
        logger.error(`❌ Erreur requête: ${name}`, { duration: `${duration}ms`, error });
        throw error;
    }
}

/**
 * Helper pour vérifier si une requête utilise eager loading
 */
export function hasEagerLoading(options: any): boolean {
    return options && options.include && Array.isArray(options.include) && options.include.length > 0;
}

/**
 * Helper pour suggérer des optimisations
 */
export function suggestOptimizations(
    modelName: string,
    queryType: 'findAll' | 'findOne' | 'findByPk',
    options: any
) {
    const suggestions: string[] = [];
    
    // Vérifier si attributes est défini
    if (!options?.attributes || options.attributes === '*') {
        suggestions.push(`Spécifier attributes pour ${modelName}.${queryType} (éviter SELECT *)`);
    }
    
    // Vérifier si limit/offset pour findAll
    if (queryType === 'findAll' && !options?.limit) {
        suggestions.push(`Ajouter pagination (limit/offset) pour ${modelName}.${queryType}`);
    }
    
    // Vérifier eager loading
    if (!hasEagerLoading(options)) {
        suggestions.push(`Considérer eager loading (include) pour ${modelName}.${queryType} si associations nécessaires`);
    }
    
    if (suggestions.length > 0) {
        logger.debug(`💡 Suggestions d'optimisation pour ${modelName}.${queryType}:`, {
            suggestions
        });
    }
    
    return suggestions;
}

export default {
    n1Detector,
    analyzeQueryPerformance,
    optimizationTips,
    benchmarkQuery,
    hasEagerLoading,
    suggestOptimizations,
};







