import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarOpen: boolean;
  mobileNavOpen: boolean;
  upgradeModalOpen: boolean;
  activeModal: string | null;
}

const initialState: UIState = {
  sidebarOpen: true,
  mobileNavOpen: false,
  upgradeModalOpen: false,
  activeModal: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleMobileNav(state) {
      state.mobileNavOpen = !state.mobileNavOpen;
    },
    setMobileNavOpen(state, action: PayloadAction<boolean>) {
      state.mobileNavOpen = action.payload;
    },
    openUpgradeModal(state) {
      state.upgradeModalOpen = true;
    },
    closeUpgradeModal(state) {
      state.upgradeModalOpen = false;
    },
    setActiveModal(state, action: PayloadAction<string | null>) {
      state.activeModal = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileNav,
  setMobileNavOpen,
  openUpgradeModal,
  closeUpgradeModal,
  setActiveModal,
} = uiSlice.actions;
export default uiSlice.reducer;
