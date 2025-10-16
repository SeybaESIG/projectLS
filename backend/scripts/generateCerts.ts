#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const certsDir = path.join(__dirname, '..', 'certs');
const keyPath = path.join(certsDir, 'server.key');
const certPath = path.join(certsDir, 'server.cert');

async function generateCertificates() {
    console.log('🔐 Génération des certificats SSL auto-signés...\n');

    try {
        // Créer le répertoire certs s'il n'existe pas
        if (!fs.existsSync(certsDir)) {
            fs.mkdirSync(certsDir, { recursive: true });
            console.log('✅ Répertoire certs/ créé');
        }

        // Vérifier si les certificats existent déjà
        if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
            console.log('⚠️  Les certificats existent déjà!');
            console.log(`   - ${keyPath}`);
            console.log(`   - ${certPath}`);
            
            const readline = await import('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const answer = await new Promise<string>((resolve) => {
                rl.question('\nVoulez-vous les régénérer? (o/N): ', resolve);
            });
            rl.close();

            if (answer.toLowerCase() !== 'o' && answer.toLowerCase() !== 'oui') {
                console.log('\n❌ Opération annulée.');
                process.exit(0);
            }

            console.log('\n🔄 Régénération des certificats...');
        }

        // Générer les certificats avec OpenSSL
        console.log('\n📝 Génération en cours...');
        
        const opensslCmd = `openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=FR/ST=State/L=City/O=Development/CN=localhost"`;
        
        try {
            execSync(opensslCmd, { stdio: 'inherit' });
        } catch (error) {
            console.error('\n❌ Erreur: OpenSSL n\'est pas installé ou n\'est pas dans le PATH.');
            console.error('\nPour installer OpenSSL:');
            console.error('  - macOS: brew install openssl');
            console.error('  - Linux: sudo apt-get install openssl');
            console.error('  - Windows: télécharger depuis https://slproweb.com/products/Win32OpenSSL.html');
            process.exit(1);
        }

        console.log('\n✅ Certificats générés avec succès!');
        console.log(`   - Clé privée: ${keyPath}`);
        console.log(`   - Certificat: ${certPath}`);
        console.log('\n⚠️  Note: Ces certificats sont auto-signés et destinés au développement uniquement.');
        console.log('   Votre navigateur affichera un avertissement de sécurité - vous pouvez l\'ignorer en local.');
        console.log('\n🚀 Vous pouvez maintenant démarrer le serveur HTTPS!');

    } catch (error) {
        console.error('❌ Erreur lors de la génération des certificats:', error);
        process.exit(1);
    }
}

generateCertificates();






