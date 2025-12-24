/**
 * Service d'encryption/decryption des messages
 * Utilise l'API Web Crypto native du navigateur pour AES-GCM
 */

const ENCRYPTION_KEY_NAME = 'chat_encryption_key';

/**
 * Génère ou récupère la clé d'encryption depuis le localStorage
 * @returns {Promise<CryptoKey>}
 */
async function getEncryptionKey() {
  // Vérifier si une clé existe déjà
  const storedKey = localStorage.getItem(ENCRYPTION_KEY_NAME);

  if (storedKey) {
    try {
      const keyData = JSON.parse(storedKey);
      return await crypto.subtle.importKey(
        'jwk',
        keyData,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.warn('[Encryption] Clé corrompue, génération d\'une nouvelle clé');
    }
  }

  // Générer une nouvelle clé
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // Sauvegarder la clé
  const exportedKey = await crypto.subtle.exportKey('jwk', key);
  localStorage.setItem(ENCRYPTION_KEY_NAME, JSON.stringify(exportedKey));

  return key;
}

/**
 * Encrypte un message
 * @param {string} plaintext - Le message en clair
 * @returns {Promise<string>} Le message encrypté en base64
 */
export async function encryptMessage(plaintext) {
  if (!plaintext) return plaintext;

  try {
    const key = await getEncryptionKey();

    // Générer un IV aléatoire (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encoder le texte
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Encrypter
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );

    // Combiner IV + données encryptées
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convertir en base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('[Encryption] Erreur d\'encryption:', error);
    return plaintext; // Fallback : retourner le texte en clair
  }
}

/**
 * Décrypte un message
 * @param {string} encryptedBase64 - Le message encrypté en base64
 * @returns {Promise<string>} Le message en clair
 */
export async function decryptMessage(encryptedBase64) {
  if (!encryptedBase64) return encryptedBase64;

  try {
    const key = await getEncryptionKey();

    // Décoder le base64
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

    // Extraire IV et données
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    // Décrypter
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );

    // Décoder le texte
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('[Encryption] Erreur de décryption:', error);
    return encryptedBase64; // Fallback : retourner le texte tel quel
  }
}

/**
 * Vérifie si un message semble être encrypté
 * @param {string} message
 * @returns {boolean}
 */
export function isEncrypted(message) {
  if (!message || typeof message !== 'string') return false;

  // Un message encrypté en base64 a une longueur minimale et contient uniquement des caractères base64
  return message.length > 20 && /^[A-Za-z0-9+/]+=*$/.test(message);
}

/**
 * Réinitialise la clé d'encryption (pour debug ou changement de compte)
 */
export function resetEncryptionKey() {
  localStorage.removeItem(ENCRYPTION_KEY_NAME);
  console.log('[Encryption] ✅ Clé d\'encryption réinitialisée');
}
