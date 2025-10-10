import sodium from 'libsodium-wrappers';

/**
 * Service d'encryptage/décryptage des messages avec libsodium
 * Utilise la clé stockée dans MESSAGE_ENCRYPTION_KEY (env)
 */

let isReady = false;

async function ensureSodiumReady() {
    if (!isReady) {
        await sodium.ready;
        isReady = true;
    }
}

/**
 * Encrypte un message en clair
 * @param plaintext - Texte en clair
 * @returns Texte chiffré (nonce + ciphertext en base64)
 */
export async function encryptMessage(plaintext: string): Promise<string> {
    await ensureSodiumReady();

    const keyBase64 = process.env.MESSAGE_ENCRYPTION_KEY;
    if (!keyBase64) {
        throw new Error('MESSAGE_ENCRYPTION_KEY n\'est pas définie dans les variables d\'environnement');
    }

    // Décoder la clé depuis base64
    const key = sodium.from_base64(keyBase64, sodium.base64_variants.ORIGINAL);
    
    if (key.length !== sodium.crypto_secretbox_KEYBYTES) {
        throw new Error(`La clé d'encryptage doit faire ${sodium.crypto_secretbox_KEYBYTES} bytes`);
    }

    // Générer un nonce aléatoire
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

    // Encoder le texte en Uint8Array
    const messageBytes = sodium.from_string(plaintext);

    // Chiffrer
    const ciphertext = sodium.crypto_secretbox_easy(messageBytes, nonce, key);

    // Concaténer nonce + ciphertext et encoder en base64
    const combined = new Uint8Array(nonce.length + ciphertext.length);
    combined.set(nonce);
    combined.set(ciphertext, nonce.length);

    return sodium.to_base64(combined, sodium.base64_variants.ORIGINAL);
}

/**
 * Décrypte un message chiffré
 * @param ciphertext - Texte chiffré (nonce + ciphertext en base64)
 * @returns Texte en clair
 */
export async function decryptMessage(ciphertext: string): Promise<string> {
    await ensureSodiumReady();

    const keyBase64 = process.env.MESSAGE_ENCRYPTION_KEY;
    if (!keyBase64) {
        throw new Error('MESSAGE_ENCRYPTION_KEY n\'est pas définie dans les variables d\'environnement');
    }

    // Décoder la clé depuis base64
    const key = sodium.from_base64(keyBase64, sodium.base64_variants.ORIGINAL);

    // Décoder le message (nonce + ciphertext)
    const combined = sodium.from_base64(ciphertext, sodium.base64_variants.ORIGINAL);

    // Extraire nonce et ciphertext
    const nonce = combined.slice(0, sodium.crypto_secretbox_NONCEBYTES);
    const encrypted = combined.slice(sodium.crypto_secretbox_NONCEBYTES);

    // Déchiffrer
    const decrypted = sodium.crypto_secretbox_open_easy(encrypted, nonce, key);

    if (!decrypted) {
        throw new Error('Échec du déchiffrement du message');
    }

    // Convertir en string
    return sodium.to_string(decrypted);
}

/**
 * Génère une nouvelle clé d'encryptage (32 bytes en base64)
 * Utiliser uniquement pour initialiser une nouvelle clé
 */
export async function generateEncryptionKey(): Promise<string> {
    await ensureSodiumReady();
    const key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
    return sodium.to_base64(key, sodium.base64_variants.ORIGINAL);
}


