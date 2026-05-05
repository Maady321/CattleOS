import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Cattle {
  id: string | number;
  name: string;
  tag: string;
  breed: string;
  status: string;
  production: string;
  gender: string;
  dob: string;
}

interface ProductionLog {
  id: string | number;
  cow: string;
  yield: string;
  session: string;
  fat: string;
  snf: string;
  timestamp: string;
  date: string;
}

interface BreedingLog {
  id: string | number;
  cow: string;
  type: 'Heat' | 'Insemination' | 'Pregnancy Check' | 'Calving';
  status: string;
  technician?: string;
  date: string;
  notes?: string;
  timestamp: string;
}

export type AlertType = 'health' | 'breeding' | 'system' | 'reminder' | 'warning';

export interface Alert {
  id: string | number;
  type: AlertType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  date: string;
}

interface CattleStore {
  cattle: Cattle[];
  productionLogs: ProductionLog[];
  breedingLogs: BreedingLog[];
  alerts: Alert[];
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  addCattle: (cow: Cattle) => void;
  removeCattle: (id: string | number) => void;
  setCattle: (cattle: Cattle[]) => void;
  addProductionLog: (log: ProductionLog) => void;
  addBreedingLog: (log: BreedingLog) => void;
  addAlert: (alert: Alert) => void;
  removeAlert: (id: string | number) => void;
  markAlertRead: (id: string | number) => void;
  markAllAlertsRead: () => void;
  isAiMonitorEnabled: boolean;
  toggleAiMonitor: () => void;
}


export const useCattleStore = create<CattleStore>()(
  persist(
    (set) => ({
      cattle: [],
      productionLogs: [],
      breedingLogs: [],
      alerts: [],
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
      addCattle: (cow) => set((state) => ({ cattle: [cow, ...state.cattle] })),
      removeCattle: (id) => set((state) => ({ cattle: state.cattle.filter((c) => c.id !== id) })),
      setCattle: (cattle) => set({ cattle }),
      addProductionLog: (log) => set((state) => ({ productionLogs: [log, ...state.productionLogs] })),
      addBreedingLog: (log) => set((state) => ({ breedingLogs: [log, ...state.breedingLogs] })),
      addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
      removeAlert: (id) => set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
      markAlertRead: (id) => set((state) => ({ alerts: state.alerts.map((a) => a.id === id ? { ...a, isRead: true } : a) })),
      markAllAlertsRead: () => set((state) => ({ alerts: state.alerts.map((a) => ({ ...a, isRead: true })) })),
      isAiMonitorEnabled: false,
      toggleAiMonitor: () => set((state) => ({ isAiMonitorEnabled: !state.isAiMonitorEnabled })),
    }),
    {
      name: 'cattle-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state && state.alerts.length === 0) {
          state.addAlert({
            id: 'welcome',
            type: 'system',
            title: 'Welcome to CattleOS!',
            message: 'Your cattle management platform is ready. Start by adding your first animal in the Cattle section.',
            time: 'Just now',
            isRead: false,
            date: new Date().toLocaleDateString()
          });
        }
      },
    }
  )
);
