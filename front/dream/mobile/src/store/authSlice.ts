import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, ParentProfile, NannyProfile } from '../types';

interface AuthState {
  user: User | null;
  profile: ParentProfile | NannyProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  darkMode: boolean;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  darkMode: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{ user: User; profile: ParentProfile | NannyProfile }>
    ) => {
      state.user = action.payload.user;
      state.profile = action.payload.profile;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    clearAuth: (state) => {
      state.user = null;
      state.profile = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<ParentProfile | NannyProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
  },
});

export const { setAuth, clearAuth, setLoading, updateProfile, toggleDarkMode } =
  authSlice.actions;
export default authSlice.reducer;
