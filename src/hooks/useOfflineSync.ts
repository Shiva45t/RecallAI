import { useEffect, useState } from 'react';
import { db } from '../lib/dexie';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth.store';
import { useUIStore } from '../stores/ui.store';

export function useOfflineSync() {
  const { isOnline } = useAuthStore();
  const { addToast } = useUIStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const syncQueue = async () => {
    try {
      const queue = await db.sync_queue.orderBy('created_at').toArray();
      if (queue.length === 0) return;

      setIsSyncing(true);
      addToast(`Syncing ${queue.length} offline changes to cloud...`, 'info');

      let successCount = 0;
      let failCount = 0;

      for (const item of queue) {
        try {
          let error = null;

          if (item.table_name === 'profiles') {
            if (item.action === 'UPDATE') {
              const { error: err } = await supabase
                .from('profiles')
                .update(item.payload)
                .eq('id', item.record_id);
              error = err;
            }
          } else if (item.table_name === 'decks') {
            if (item.action === 'CREATE') {
              const { error: err } = await supabase.from('decks').upsert(item.payload);
              error = err;
            } else if (item.action === 'UPDATE') {
              const { error: err } = await supabase
                .from('decks')
                .update(item.payload)
                .eq('id', item.record_id);
              error = err;
            } else if (item.action === 'DELETE') {
              const { error: err } = await supabase
                .from('decks')
                .delete()
                .eq('id', item.record_id);
              error = err;
            }
          } else if (item.table_name === 'cards') {
            if (item.action === 'CREATE') {
              const { error: err } = await supabase.from('cards').upsert(item.payload);
              error = err;
            } else if (item.action === 'UPDATE') {
              const { error: err } = await supabase
                .from('cards')
                .update(item.payload)
                .eq('id', item.record_id);
              error = err;
            } else if (item.action === 'DELETE') {
              const { error: err } = await supabase
                .from('cards')
                .delete()
                .eq('id', item.record_id);
              error = err;
            }
          } else if (item.table_name === 'study_sessions') {
            if (item.action === 'CREATE') {
              const { error: err } = await supabase.from('study_sessions').upsert(item.payload);
              error = err;
            }
          } else if (item.table_name === 'card_reviews') {
            if (item.action === 'CREATE') {
              const { error: err } = await supabase.from('card_reviews').upsert(item.payload);
              error = err;
            }
          }

          if (error) {
            console.error(`Sync error on ${item.table_name} table:`, error);
            failCount++;
          } else {
            if (item.id !== undefined) {
              await db.sync_queue.delete(item.id);
              successCount++;
            }
          }
        } catch (e) {
          console.error('Failed to sync queue item:', e);
          failCount++;
        }
      }

      setIsSyncing(false);
      if (successCount > 0) {
        addToast(`Successfully synced ${successCount} offline items.`, 'success');
      }
      if (failCount > 0) {
        addToast(`Failed to sync ${failCount} items. Retrying later.`, 'warning');
      }
    } catch (e) {
      console.error('Offline queue runner failed:', e);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isOnline) {
      syncQueue();
    }
  }, [isOnline]);

  return { isSyncing, syncQueue };
}
