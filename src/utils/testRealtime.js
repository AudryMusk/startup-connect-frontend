/**
 * Script de test Realtime Supabase
 * À exécuter dans la console du navigateur (F12)
 */

// Test 1: Vérifier la connexion Supabase
console.log('=== TEST REALTIME SUPABASE ===');
console.log('1. Vérification configuration...');

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'Présente' : 'Manquante');

const supabase = createClient(supabaseUrl, supabaseKey);

// Test 2: S'abonner aux changements sur la table messages
console.log('\n2. Création d\'une souscription test...');

const channel = supabase
  .channel('test-messages')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'messages',
  }, (payload) => {
    console.log('ÉVÉNEMENT REÇU:', payload);
    console.log('Type:', payload.eventType);
    console.log('Nouveau:', payload.new);
    console.log('Ancien:', payload.old);
  })
  .subscribe((status) => {
    console.log('Statut souscription:', status);
    if (status === 'SUBSCRIBED') {
      console.log('SOUSCRIPTION ACTIVE - Envoyez un message pour tester');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('ERREUR DE SOUSCRIPTION');
    } else if (status === 'TIMED_OUT') {
      console.error('TIMEOUT DE SOUSCRIPTION');
    }
  });

console.log('\n3. Canal créé:', channel);
console.log('\nMAINTENANT:');
console.log('- Envoyez un message depuis l\'interface');
console.log('- Vérifiez si un événement apparaît ci-dessus');
console.log('- Pour arrêter: supabase.removeChannel(channel)');

// Exposer pour debug
window.testChannel = channel;
window.testSupabase = supabase;

export { channel, supabase };
