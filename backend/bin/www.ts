#!/usr/bin/env node

/**
 * Charger les variables d'environnement en PREMIER
 */
import '../init.js';

import app from '../app.js';
import debugLib from 'debug';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/db.js';
import { initAssociations } from '../models/associations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const debug = debugLib('untitled:server');

const port = normalizePort(process.env.HTTPS_PORT || '3443');
app.set('port', port);

// Configuration des certificats SSL
const certsDir = path.join(__dirname, '..', 'certs');
const keyPath = process.env.SSL_KEY_PATH || path.join(certsDir, 'server.key');
const certPath = process.env.SSL_CERT_PATH || path.join(certsDir, 'server.cert');

// Vérifier que les certificats existent
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.error('❌ Certificats SSL non trouvés!');
    console.error(`   Clé attendue: ${keyPath}`);
    console.error(`   Certificat attendu: ${certPath}`);
    console.error('\n💡 Générez les certificats avec: npm run generate-certs');
    process.exit(1);
}

const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
};

const server = https.createServer(httpsOptions, app);

(async () => {
    try {
        initAssociations();
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        console.log(`🔒 HTTPS Server listening on https://localhost:${port}`);
        if (process.env['DB_SYNC'] === 'true') {
            const alter = process.env['DB_SYNC_ALTER'] === 'true';
            await sequelize.sync({ alter });
            console.log(`Sequelize sync completed (alter=${alter}).`);
        }
        server.listen(port);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
})();

server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val: string | number): number | string | false {
    const portNum = typeof val === 'string' ? parseInt(val, 10) : val;

    if (isNaN(portNum)) {
        // named pipe
        return val;
    }

    if (portNum >= 0) {
        // port number
        return portNum;
    }

    return false;
}

function onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening(): void {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + (addr && addr.port);
    debug('Listening on ' + bind);
}

