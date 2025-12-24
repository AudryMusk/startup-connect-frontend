/**
 * Script de test pour vérifier le chiffrement des messages
 *
 * Pour tester, ouvrez la console du navigateur et exécutez:
 * import('@/utils/testEncryption.js').then(m => m.runEncryptionTest())
 *
 * Ou depuis la console Vue DevTools:
 * await import('/src/utils/testEncryption.js').then(m => m.runEncryptionTest())
 */

import { encryptMessage, decryptMessage, isEncrypted, resetEncryptionKey } from './encryption';

/**
 * Teste le chiffrement/déchiffrement
 */
export async function runEncryptionTest() {
  console.log('🔐 === TEST DE CHIFFREMENT ===');

  const testMessages = [
    'Bonjour, ceci est un message de test!',
    'Message avec des émojis 🎉🚀💬',
    'Caractères spéciaux: é à ü ñ 中文 العربية',
    'Message très long: ' + 'A'.repeat(1000),
    '123456789',
    '',
    'Une phrase avec des "guillemets" et des \'apostrophes\'',
  ];

  let passed = 0;
  let failed = 0;

  for (const original of testMessages) {
    try {
      console.log(`\n📝 Test: "${original.substring(0, 50)}${original.length > 50 ? '...' : ''}"`);

      // Chiffrer
      const encrypted = await encryptMessage(original);
      console.log(`   🔒 Chiffré: ${encrypted.substring(0, 50)}...`);

      // Vérifier que c'est bien détecté comme chiffré
      const detected = isEncrypted(encrypted);
      console.log(`   🔍 Détecté comme chiffré: ${detected}`);

      // Déchiffrer
      const decrypted = await decryptMessage(encrypted);
      console.log(`   🔓 Déchiffré: "${decrypted.substring(0, 50)}${decrypted.length > 50 ? '...' : ''}"`);

      // Vérifier
      if (original === decrypted) {
        console.log('   ✅ SUCCÈS');
        passed++;
      } else {
        console.log('   ❌ ÉCHEC - Le message déchiffré ne correspond pas');
        failed++;
      }
    } catch (error) {
      console.error(`   ❌ ERREUR:`, error);
      failed++;
    }
  }

  console.log('\n📊 === RÉSULTATS ===');
  console.log(`   ✅ Réussis: ${passed}`);
  console.log(`   ❌ Échoués: ${failed}`);
  console.log(`   📈 Taux de réussite: ${((passed / testMessages.length) * 100).toFixed(1)}%`);

  return { passed, failed, total: testMessages.length };
}

/**
 * Teste la cohérence entre plusieurs appareils (simulation)
 * Note: Ce test échouera car chaque navigateur génère sa propre clé.
 * Pour un vrai E2E, il faudrait un échange de clés entre utilisateurs.
 */
export async function testCrossDeviceScenario() {
  console.log('🔐 === TEST CROSS-DEVICE (Simulation) ===');
  console.log('⚠️ Ce test simule ce qui se passerait si deux appareils différents');
  console.log('   essayaient de communiquer avec des clés différentes.');

  const message = 'Message secret cross-device';

  // Chiffrer avec la clé actuelle
  const encrypted = await encryptMessage(message);
  console.log(`📤 Message chiffré: ${encrypted.substring(0, 50)}...`);

  // Simuler un autre appareil en réinitialisant la clé
  console.log('🔄 Simulation d\'un autre appareil (reset de la clé)...');
  resetEncryptionKey();

  // Essayer de déchiffrer avec la nouvelle clé
  try {
    const decrypted = await decryptMessage(encrypted);
    if (decrypted === message) {
      console.log('⚠️ Le message a été déchiffré (ne devrait pas arriver avec une vraie clé différente)');
    } else {
      console.log('✅ Le message n\'a pas pu être correctement déchiffré (comportement attendu)');
    }
  } catch (error) {
    console.log('✅ Erreur de déchiffrement (comportement attendu):', error.message);
  }

  // Restaurer en réinitialisant pour créer une nouvelle clé
  console.log('🔧 Note: Pour un vrai chiffrement E2E multi-appareil, il faudrait:');
  console.log('   1. Un échange de clés Diffie-Hellman entre utilisateurs');
  console.log('   2. Ou un stockage sécurisé de la clé côté serveur (moins sécurisé)');
  console.log('   3. Ou un export/import manuel de la clé');
}

/**
 * Affiche les informations de debug du chiffrement
 */
export function debugEncryptionInfo() {
  console.log('🔧 === DEBUG CHIFFREMENT ===');

  const keyData = localStorage.getItem('chat_encryption_key');
  if (keyData) {
    console.log('✅ Clé de chiffrement trouvée dans localStorage');
    try {
      const parsed = JSON.parse(keyData);
      console.log('   Algorithme:', parsed.alg);
      console.log('   Longueur:', parsed.k?.length, 'caractères');
    } catch (e) {
      console.log('⚠️ Impossible de parser la clé');
      console.log('voici l erreur'+e)
    }
  } else {
    console.log('❌ Aucune clé de chiffrement trouvée');
    console.log('   Une clé sera générée au premier chiffrement');
  }

  console.log('\n📌 Pour réinitialiser la clé:');
  console.log("   import('@/utils/encryption.js').then(m => m.resetEncryptionKey())");
}

// Auto-run en mode développement
if (import.meta.env.DEV) {
  console.log('💡 Pour tester le chiffrement, exécutez:');
  console.log("   import('@/utils/testEncryption.js').then(m => m.runEncryptionTest())");
}

export default { runEncryptionTest, testCrossDeviceScenario, debugEncryptionInfo };
