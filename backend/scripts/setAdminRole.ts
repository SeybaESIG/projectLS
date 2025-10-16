#!/usr/bin/env node

/**
 * Script pour définir un utilisateur comme administrateur dans Firebase
 * 
 * Usage:
 *   npm run set-admin <firebase_uid>
 * 
 * Exemple:
 *   npm run set-admin abc123xyz456
 */

import '../init.js'; // Charger .env
import { getAuth } from '../config/firebase.js';

const args = process.argv.slice(2);

if (args.length === 0) {
    console.error('❌ Erreur: UID utilisateur manquant');
    console.log('');
    console.log('Usage: npm run set-admin <firebase_uid>');
    console.log('');
    console.log('Exemple:');
    console.log('  npm run set-admin abc123xyz456');
    console.log('');
    process.exit(1);
}

const uid = args[0] as string;

async function setAdminRole(userId: string) {
    const auth = getAuth();

    if (!auth) {
        console.error('❌ Firebase non configuré');
        console.log('Vérifiez que FIREBASE_SERVICE_ACCOUNT_PATH est défini dans .env');
        process.exit(1);
    }

    try {
        console.log(`🔄 Définition du rôle admin pour l'utilisateur ${userId}...`);

        // Définir le custom claim 'role: admin'
        await auth.setCustomUserClaims(userId, { role: 'admin' });

        // Vérifier que le claim a été ajouté
        const user = await auth.getUser(userId);
        const customClaims = user.customClaims || {};

        console.log('');
        console.log('✅ Rôle admin défini avec succès !');
        console.log('');
        console.log('Informations utilisateur :');
        console.log(`  - UID: ${user.uid}`);
        console.log(`  - Email: ${user.email || 'N/A'}`);
        console.log(`  - Rôle: ${customClaims.role || 'user'}`);
        console.log('');
        console.log('⚠️  Note: L\'utilisateur doit se reconnecter pour que le nouveau rôle soit actif.');

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Erreur:', error.message);

        if (error.code === 'auth/user-not-found') {
            console.log('');
            console.log('Cet utilisateur n\'existe pas dans Firebase.');
            console.log('Créez d\'abord un utilisateur sur https://console.firebase.google.com');
        }

        process.exit(1);
    }
}

setAdminRole(uid);

