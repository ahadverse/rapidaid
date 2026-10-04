import { create } from 'zustand';

type UiState = {
  sidebarOpen: boolean;
  filterDrawerOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setFilterDrawerOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  filterDrawerOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setFilterDrawerOpen: (filterDrawerOpen) => set({ filterDrawerOpen }),
}));
