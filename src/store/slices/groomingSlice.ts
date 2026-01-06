import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchGrooming } from '../../api/api';
import type { Grooming } from '../../types';

interface GroomingState {
  grooming: Grooming[];
  loading: boolean;
  error: string | null;
}

const initialState: GroomingState = {
  grooming: [],
  loading: false,
  error: null,
};

export const loadGrooming = createAsyncThunk('grooming/load', async () => {
  const data = await fetchGrooming();
  return data as Grooming[];
});

const groomingSlice = createSlice({
  name: 'grooming',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadGrooming.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadGrooming.fulfilled, (state, action) => {
        state.loading = false;
        state.grooming = action.payload;
      })
      .addCase(loadGrooming.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load grooming';
      });
  },
});

export default groomingSlice.reducer;

