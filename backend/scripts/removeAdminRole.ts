#!/usr/bin/env node

/**
 * Script pour retirer le rôle admin d'un utilisateur Firebase
 * 
 * Usage:
 *   npm run remove-admin <firebase_uid>
 * 
 * Exemple:
 *   npm run remove-admin abc123xyz456
 */

import '../init.js'; // Charger .env
import { getAuth } from '../config/firebase.js';

const args = process.argv.slice(2);

if (args.length === 0) {
    console.error('❌ Erreur: UID utilisateur manquant');
    console.log('');
    console.log('Usage: npm run remove-admin <firebase_uid>');
    console.log('');
    console.log('Exemple:');
    console.log('  npm run remove-admin abc123xyz456');
    console.log('');
    process.exit(1);
}

const uid = args[0] as string;

async function removeAdminRole(userId: string) {
    const auth = getAuth();

    if (!auth) {
        console.error('❌ Firebase non configuré');
        console.log('Vérifiez que FIREBASE_SERVICE_ACCOUNT_PATH est défini dans .env');
        process.exit(1);
    }

    try {
        console.log(`🔄 Retrait du rôle admin pour l'utilisateur ${userId}...`);

        // Définir le custom claim avec rôle 'user' (par défaut)
        await auth.setCustomUserClaims(userId, { role: 'user' });

        // Vérifier
        const user = await auth.getUser(userId);
        const customClaims = user.customClaims || {};

        console.log('');
        console.log('✅ Rôle admin retiré avec succès !');
        console.log('');
        console.log('Informations utilisateur :');
        console.log(`  - UID: ${user.uid}`);
        console.log(`  - Email: ${user.email || 'N/A'}`);
        console.log(`  - Rôle: ${customClaims.role || 'user'}`);
        console.log('');
        console.log('⚠️  Note: L\'utilisateur doit se reconnecter pour que le changement soit actif.');

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Erreur:', error.message);

        if (error.code === 'auth/user-not-found') {
            console.log('');
            console.log('Cet utilisateur n\'existe pas dans Firebase.');
        }

        process.exit(1);
    }
}

removeAdminRole(uid);

