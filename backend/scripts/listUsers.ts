#!/usr/bin/env node

/**
 * Script pour lister tous les utilisateurs Firebase avec leurs rôles
 * 
 * Usage:
 *   npm run list-users
 */

import '../init.js'; // Charger .env
import { getAuth } from '../config/firebase.js';

async function listUsers() {
    const auth = getAuth();

    if (!auth) {
        console.error('❌ Firebase non configuré');
        console.log('Vérifiez que FIREBASE_SERVICE_ACCOUNT_PATH est défini dans .env');
        process.exit(1);
    }

    try {
        console.log('📋 Liste des utilisateurs Firebase\n');
        console.log('─'.repeat(80));

        let nextPageToken: string | undefined = undefined;
        let totalUsers = 0;
        let adminCount = 0;

        do {
            // Lister les utilisateurs (par batch de 1000)
            const listUsersResult = await auth.listUsers(1000, nextPageToken);

            listUsersResult.users.forEach((userRecord) => {
                totalUsers++;
                const customClaims = userRecord.customClaims || {};
                const role = customClaims.role || 'user';

                if (role === 'admin') {
                    adminCount++;
                }

                const emailVerified = userRecord.emailVerified ? '✅' : '❌';
                const disabled = userRecord.disabled ? '🔒' : '  ';

                console.log(`${disabled} ${role === 'admin' ? '👑' : '👤'} ${role.toUpperCase().padEnd(10)}`);
                console.log(`   UID:      ${userRecord.uid}`);
                console.log(`   Email:    ${userRecord.email || 'N/A'} ${emailVerified}`);
                console.log(`   Créé:     ${new Date(userRecord.metadata.creationTime).toLocaleDateString()}`);
                const lastSignIn = userRecord.metadata.lastSignInTime || userRecord.metadata.creationTime;
                console.log(`   Dernière: ${new Date(lastSignIn).toLocaleDateString()}`);
                console.log('─'.repeat(80));
            });

            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);

        console.log('');
        console.log(`📊 Statistiques:`);
        console.log(`   Total utilisateurs: ${totalUsers}`);
        console.log(`   Admins: ${adminCount}`);
        console.log(`   Users: ${totalUsers - adminCount}`);
        console.log('');

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

listUsers();

