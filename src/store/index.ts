import type { StoreApi } from 'zustand';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface AppState {
  theme: Theme;
  soundEnabled: boolean;
  setTheme: (theme: Theme) => void;
  toggleSound: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      soundEnabled: true,
      setTheme: (theme) => set({ theme }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    }),
    {
      name: 'galaxy-class-storage',
    }
  )
);
