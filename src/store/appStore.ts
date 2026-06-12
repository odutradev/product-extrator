import { persist, createJSONStorage } from 'zustand/middleware'
import { create } from 'zustand'
import type { AppState } from './types'

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      parsedNumbers: [],
      parsedProducts: [],
      isImportOpen: false,
      isConsoleOpen: false,
      logs: [],
      toggleImport: () => set((state) => ({ isImportOpen: !state.isImportOpen })),
      toggleConsole: () => set((state) => ({ isConsoleOpen: !state.isConsoleOpen })),
      addLog: (message) => set((state) => ({ logs: [...state.logs, message] })),
      clearLogs: () => set({ logs: [] }),
      setParsedData: (parsedNumbers, parsedProducts) => set({ parsedNumbers, parsedProducts })
    }),
    {
      name: 'wp-parser-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)