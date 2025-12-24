import supabase from '@/services/supabase';

/**
 * Test de connexion Supabase
 */
export async function testSupabaseConnection() {
  try {
    const client = supabase.getClient();
    console.log('✅ Supabase client initialisé:', client);

    // Test simple de connexion
    const { data, error } = await client
      .from('messages')
      .select('count')
      .limit(1);

    if (error) {
      console.warn('⚠️ Erreur lors du test Supabase:', error.message);
      console.info('💡 Cela peut être normal si la table n\'existe pas encore ou si les permissions ne sont pas configurées');
      return false;
    }

    console.log('✅ Connexion Supabase réussie!');
    return true;
  } catch (err) {
    console.error('❌ Erreur de connexion Supabase:', err);
    return false;
  }
}

/**
 * Test d'une subscription Supabase
 */
export function testSupabaseSubscription() {
  try {
    const client = supabase.getClient();

    const channel = client
      .channel('test-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        console.log('🔔 Message reçu via Supabase:', payload);
      })
      .subscribe((status) => {
        console.log('📡 Statut subscription Supabase:', status);
      });

    console.log('✅ Subscription Supabase créée');

    // Cleanup après 5 secondes
    setTimeout(() => {
      client.removeChannel(channel);
      console.log('🧹 Subscription test nettoyée');
    }, 5000);

    return true;
  } catch (err) {
    console.error('❌ Erreur subscription Supabase:', err);
    return false;
  }
}
