# 🎯 Exemples d'utilisation - Résilience APIs

## Comment intégrer les circuit breakers dans vos services

---

## 1️⃣ Exemple : Service Stripe

### Avant (sans résilience)

```typescript
// services/stripeService.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createPaymentIntent(amount: number) {
    // ❌ Pas de timeout
    // ❌ Pas de retry
    // ❌ Pas de circuit breaker
    return await stripe.paymentIntents.create({
        amount,
        currency: 'eur',
    });
}
```

### Après (avec résilience)

```typescript
// services/stripeService.ts
import Stripe from 'stripe';
import { stripeCircuitBreaker, withCircuitBreaker } from '../config/circuitBreaker.js';
import logger from '../config/logger.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    timeout: 15000, // ✅ Timeout 15s
    maxNetworkRetries: 2, // ✅ Retry intégré de Stripe
});

// Wrapper avec circuit breaker
const createPaymentIntentWithBreaker = stripeCircuitBreaker(async (amount: number) => {
    logger.info('Création payment intent Stripe', { amount });
    return await stripe.paymentIntents.create({
        amount,
        currency: 'eur',
    });
});

export async function createPaymentIntent(amount: number) {
    try {
        // ✅ Protected par circuit breaker
        const paymentIntent = await createPaymentIntentWithBreaker(amount);
        logger.info('Payment intent créé avec succès', { id: paymentIntent.id });
        return paymentIntent;
    } catch (error: any) {
        logger.error('Échec création payment intent:', { message: error.message });
        
        // ✅ Fallback gracieux
        if (error.message?.includes('Circuit Breaker is open')) {
            throw new Error('Service de paiement temporairement indisponible. Veuillez réessayer dans quelques minutes.');
        }
        
        throw error;
    }
}

// Avec fallback
export async function createPaymentIntentWithFallback(amount: number) {
    return await withCircuitBreaker(
        createPaymentIntentWithBreaker,
        () => {
            // Fallback : Créer une intention de paiement en attente
            logger.warn('Stripe indisponible, création d\'un paiement en attente');
            return { status: 'pending', amount };
        },
        amount
    );
}
```

---

## 2️⃣ Exemple : Service Firebase Auth

### Avant (sans résilience)

```typescript
// middlewares/firebaseAuth.ts
import { auth } from '../config/firebase.js';

export async function verifyToken(token: string) {
    // ❌ Pas de timeout
    // ❌ Pas de retry
    const decodedToken = await auth.current?.verifyIdToken(token);
    return decodedToken;
}
```

### Après (avec résilience)

```typescript
// middlewares/firebaseAuth.ts
import { auth } from '../config/firebase.js';
import { firebaseCircuitBreaker } from '../config/circuitBreaker.js';
import logger from '../config/logger.js';

// Wrapper avec circuit breaker
const verifyTokenWithBreaker = firebaseCircuitBreaker(async (token: string) => {
    const firebaseAuth = auth.current;
    if (!firebaseAuth) {
        throw new Error('Firebase non configuré');
    }
    
    return await firebaseAuth.verifyIdToken(token);
});

export async function verifyToken(token: string) {
    try {
        // ✅ Protected par circuit breaker (timeout 10s)
        const decodedToken = await verifyTokenWithBreaker(token);
        logger.debug('Token vérifié avec succès', { uid: decodedToken.uid });
        return decodedToken;
    } catch (error: any) {
        logger.error('Échec vérification token:', { message: error.message });
        
        // ✅ Distinguer les erreurs
        if (error.message?.includes('Circuit Breaker is open')) {
            // Firebase down
            throw new Error('Service d\'authentification temporairement indisponible');
        }
        
        if (error.code === 'auth/id-token-expired') {
            throw new Error('Token expiré');
        }
        
        throw new Error('Token invalide');
    }
}
```

---

## 3️⃣ Exemple : Service Google Cloud Storage

### Avant (sans résilience)

```typescript
// services/gcsService.ts
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

export async function uploadFile(file: Express.Multer.File) {
    // ❌ Pas de timeout
    // ❌ Pas de retry
    const blob = bucket.file(`uploads/${Date.now()}-${file.originalname}`);
    await blob.save(file.buffer);
    return blob.publicUrl();
}
```

### Après (avec résilience)

```typescript
// services/gcsService.ts
import { Storage } from '@google-cloud/storage';
import { gcsCircuitBreaker } from '../config/circuitBreaker.js';
import logger from '../config/logger.js';

const storage = new Storage({
    timeout: 30000, // ✅ Timeout 30s
    retryOptions: {
        autoRetry: true,
        maxRetries: 2, // ✅ Retry intégré de GCS
    },
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

// Wrapper avec circuit breaker
const uploadFileWithBreaker = gcsCircuitBreaker(async (file: Express.Multer.File) => {
    const filename = `uploads/${Date.now()}-${file.originalname}`;
    logger.info('Upload vers GCS', { filename, size: file.size });
    
    const blob = bucket.file(filename);
    await blob.save(file.buffer, {
        timeout: 30000, // Timeout spécifique à l'upload
    });
    
    const publicUrl = blob.publicUrl();
    logger.info('Upload GCS réussi', { url: publicUrl });
    
    return publicUrl;
});

export async function uploadFile(file: Express.Multer.File) {
    try {
        // ✅ Protected par circuit breaker (timeout 30s, 2 retries)
        return await uploadFileWithBreaker(file);
    } catch (error: any) {
        logger.error('Échec upload GCS:', { message: error.message, filename: file.originalname });
        
        // ✅ Fallback : Sauvegarder localement en attendant
        if (error.message?.includes('Circuit Breaker is open')) {
            logger.warn('GCS indisponible, sauvegarde locale temporaire');
            // Sauvegarder dans /tmp ou queue pour retry plus tard
            throw new Error('Service de stockage temporairement indisponible');
        }
        
        throw error;
    }
}
```

---

## 4️⃣ Exemple : Appels HTTP externes

### Appel API tierce quelconque

```typescript
import { createAxiosWithRetry } from '../config/axiosRetry.js';
import { createCircuitBreaker } from '../config/circuitBreaker.js';

// Créer instance axios avec retry
const externalApiAxios = createAxiosWithRetry('ExternalAPI', {
    timeout: 5000,
    retries: 3,
    retryDelay: 1000,
});

// Créer circuit breaker
const fetchDataWithBreaker = createCircuitBreaker(
    async (userId: number) => {
        const response = await externalApiAxios.get(`https://api.example.com/users/${userId}`);
        return response.data;
    },
    'ExternalAPI',
    {
        timeout: 5000,
        errorThresholdPercentage: 50,
    }
);

// Utiliser dans un controller
export async function getUserFromExternalAPI(userId: number) {
    try {
        const data = await fetchDataWithBreaker(userId);
        return data;
    } catch (error: any) {
        // Fallback : Retourner des données par défaut
        logger.warn('API externe indisponible, utilisation du fallback');
        return { id: userId, name: 'Unknown', status: 'unavailable' };
    }
}
```

---

## 🔧 Intégration dans vos controllers

### Controller Paiements

```typescript
// controllers/paiementsController.ts
import { createPaymentIntent } from '../services/stripeService.js';
import logger from '../config/logger.js';

export const createPaymentWithStripe = async (req, res, next) => {
    try {
        const { amount } = req.body;
        
        // ✅ Service avec circuit breaker + retry
        const paymentIntent = await createPaymentIntent(amount);
        
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
        logger.error('Erreur création paiement:', {
            user: req.user?.email,
            amount: req.body.amount,
            error: error.message,
        });
        
        // Message utilisateur approprié
        if (error.message.includes('temporairement indisponible')) {
            return res.status(503).json({
                error: 'Service temporairement indisponible',
                message: 'Le service de paiement est actuellement indisponible. Veuillez réessayer dans quelques minutes.',
            });
        }
        
        next(error);
    }
};
```

---

## 📊 Monitoring Dashboard (exemple Grafana)

### Métriques à afficher

```
┌─────────────────────────────────────────┐
│ Circuit Breaker States (Last 1h)       │
├─────────────────────────────────────────┤
│ Stripe     : CLOSED ✅                  │
│ Firebase   : CLOSED ✅                  │
│ GCS        : OPEN   🔴 (since 5 min)   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ API Calls (Last 15 min)                │
├─────────────────────────────────────────┤
│ Total      : 1,234                      │
│ Succès     : 1,180 (95.6%)              │
│ Retries    : 42                         │
│ Échecs     : 12                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Response Times (p95)                    │
├─────────────────────────────────────────┤
│ Stripe     : 245 ms                     │
│ Firebase   : 89 ms                      │
│ GCS        : 1,234 ms                   │
└─────────────────────────────────────────┘
```

---

## 🚨 Alertes recommandées

| Condition | Sévérité | Action |
|-----------|----------|--------|
| Circuit OPEN > 1 min | 🔴 CRITICAL | PagerDuty, investiguer immédiatement |
| Circuit OPEN > 5 min | 🔴 CRITICAL | Contacter le support du service |
| Retries > 100/min | 🟡 WARNING | Vérifier réseau ou service |
| Timeout > 50/min | 🟡 WARNING | Service externe lent |
| Échecs > 10% | 🟡 WARNING | Investiguer cause |

---

## ✅ Résumé

**Configuration créée** :
- ✅ `config/circuitBreaker.ts` : Circuit breakers Stripe, Firebase, GCS
- ✅ `config/axiosRetry.ts` : Axios avec retry automatique
- ✅ Logs structurés pour monitoring
- ✅ Timeouts configurés par service

**Prochaine étape** :
👉 Intégrer dans vos services existants (`stripeService.ts`, `gcsService.ts`)

**Utilisation** :
```typescript
import { stripeCircuitBreaker } from './config/circuitBreaker.js';
import { stripeAxios } from './config/axiosRetry.js';

const maFonction = stripeCircuitBreaker(async () => {
    // Votre code ici
});
```

🎉 **Votre API est maintenant résiliente !**



