import { create } from 'zustand';
import axios from 'axios';
import { useCattleStore } from './cattleStore';

interface SyncState {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
  sync: (farmId: string) => Promise<void>;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isSyncing: false,
  lastSyncTime: null,
  error: null,
  sync: async (farmId: string) => {
    if (get().isSyncing) return;

    set({ isSyncing: true, error: null });

    try {
      const cattleStore = useCattleStore.getState();
      
      // 1. Pull changes from server
      // In a real app, we'd track the last version we received
      const lastVersion = 0; 
      const response = await axios.get(`/api/v1/sync/pull?farm_id=${farmId}&last_version=${lastVersion}`);
      
      const { changes, new_version } = response.data;

      // 2. Apply changes to local store
      // This is a simplified version. A real engine would handle conflicts.
      if (changes.length > 0) {
        console.log(`Received ${changes.length} changes from server`);
        // Update local state based on changes...
      }

      set({ 
        isSyncing: false, 
        lastSyncTime: new Date(),
        error: null 
      });
    } catch (err: any) {
      set({ 
        isSyncing: false, 
        error: err.message || 'Sync failed' 
      });
    }
  },
}));
