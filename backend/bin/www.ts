#!/usr/bin/env node

import app from '../app.js';
import debugLib from 'debug';
import http from 'http';
import sequelize from '../config/db.js';
import { initAssociations } from '../models/associations.js';

const debug = debugLib('untitled:server');

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const server = http.createServer(app);

(async () => {
    try {
        initAssociations();
        await sequelize.authenticate();
        console.log('Database connection has been established successfully. Listening on port ' + port + '.');
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

