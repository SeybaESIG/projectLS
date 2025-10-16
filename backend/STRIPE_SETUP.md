# Configuration Stripe pour les Paiements

Ce document explique comment configurer Stripe pour gérer les paiements dans l'application.

## 📋 Prérequis

1. Un compte Stripe (inscription gratuite sur [stripe.com](https://stripe.com))
2. Les clés API Stripe (disponibles dans le Dashboard Stripe)

## 🔑 Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env` :

```bash
# Clé secrète Stripe (IMPORTANTE : Ne jamais commiter cette clé !)
STRIPE_SECRET_KEY=sk_test_...  # En développement
# STRIPE_SECRET_KEY=sk_live_... # En production

# Secret du webhook Stripe (pour vérifier l'authenticité des événements)
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🚀 Configuration du webhook Stripe

### 1. Créer un endpoint webhook dans Stripe Dashboard

1. Allez sur [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Cliquez sur **"Add endpoint"**
3. URL de l'endpoint : `https://votre-domaine.com/api/paiements/webhook`
4. Sélectionnez les événements à écouter :
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`

5. Copiez le **Signing secret** (`whsec_...`) et ajoutez-le dans `.env`

### 2. Test en local avec Stripe CLI (optionnel)

Pour tester les webhooks en développement local :

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les webhooks
stripe listen --forward-to localhost:3000/api/paiements/webhook

# Le CLI affichera votre webhook secret temporaire
```

## 💳 Flux de paiement

### Côté Frontend

1. **Initier un paiement** :
```javascript
const response = await fetch('/api/paiements/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id_transa: 123,
    montant: 100.50,
    currency: 'eur'
  })
});

const { clientSecret, paymentIntentId } = await response.json();
```

2. **Confirmer le paiement avec Stripe.js** :
```javascript
const stripe = Stripe('pk_test_...'); // Clé publique

const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { name: 'Client Name' }
  }
});

if (error) {
  console.error('Paiement échoué:', error);
} else {
  console.log('Paiement réussi !');
}
```

### Côté Backend

Le backend gère automatiquement :

1. **Création du paiement** :
   - Crée un `PaymentIntent` Stripe
   - Enregistre le paiement en BDD avec statut `'attente'`
   - Retourne le `client_secret` au frontend

2. **Webhooks** :
   - Écoute les événements Stripe
   - Met à jour le statut du paiement automatiquement
   - Appelle `updateTransactionStatus()` pour mettre à jour la transaction globale

## 🔐 Sécurité

- ❌ **NE JAMAIS** exposer `STRIPE_SECRET_KEY` côté client
- ✅ Utiliser uniquement la **clé publique** (`pk_test_...` ou `pk_live_...`) dans le frontend
- ✅ Toujours vérifier la signature des webhooks avec `STRIPE_WEBHOOK_SECRET`
- ✅ Utiliser HTTPS en production

## 🧪 Mode Test

En développement, utilisez les **clés de test** :
- Secret key : `sk_test_...`
- Public key : `pk_test_...`
- Cartes de test : [stripe.com/docs/testing](https://stripe.com/docs/testing)

### Cartes de test communes :

| Numéro | Résultat |
|--------|----------|
| `4242 4242 4242 4242` | Succès |
| `4000 0000 0000 0002` | Échec (carte déclinée) |
| `4000 0000 0000 9995` | Échec (fonds insuffisants) |

Date d'expiration : N'importe quelle date future  
CVC : N'importe quel 3 chiffres

## 💰 Remboursements

Pour rembourser un paiement :

```bash
# Via l'API
PATCH /api/paiements/:id
{
  "statut": "remboursé"
}
```

Le controller appellera automatiquement `stripeService.refundPayment()`.

## 📊 Relation Transactions ↔ Paiements

```
Transaction (montant total: 100€)
  └─> Paiement 1 (50€, carte, validé)
  └─> Paiement 2 (50€, carte, validé)
  → Transaction.statut = 'validée'
```

Le statut de la transaction est automatiquement mis à jour en fonction des paiements :
- **'attente'** : Paiements en cours ou incomplets
- **'validée'** : Tous les paiements validés (total ≥ montant)
- **'remboursée'** : Paiements remboursés

## 📚 Documentation Stripe

- [Documentation API](https://stripe.com/docs/api)
- [PaymentIntents](https://stripe.com/docs/payments/payment-intents)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Testing](https://stripe.com/docs/testing)

## 🆘 Dépannage

### Webhook ne reçoit pas les événements
- Vérifiez que l'URL est accessible depuis Internet (pas localhost en prod)
- Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
- Consultez les logs dans Stripe Dashboard → Webhooks → Logs

### Paiement bloqué en "attente"
- Vérifiez que les webhooks fonctionnent
- Confirmez le paiement manuellement dans Stripe Dashboard
- Le webhook mettra à jour le statut automatiquement

### Erreur "Invalid API Key"
- Vérifiez que `STRIPE_SECRET_KEY` est correct
- Assurez-vous d'utiliser la bonne clé (test vs live)




