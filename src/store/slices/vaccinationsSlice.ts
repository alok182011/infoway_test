import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchVaccinations, createVaccination } from '../../api/api';
import type { Vaccination } from '../../types';

interface VaccinationsState {
  vaccinations: Vaccination[];
  loading: boolean;
  error: string | null;
}

const initialState: VaccinationsState = {
  vaccinations: [],
  loading: false,
  error: null,
};

export const loadVaccinations = createAsyncThunk('vaccinations/load', async () => {
  const data = await fetchVaccinations();
  return data as Vaccination[];
});

export const createVaccinationThunk = createAsyncThunk(
  'vaccinations/create',
  async (vaccinationData: { petId: number; vaccine: string; date: string; due: string }, { dispatch }) => {
    const created = await createVaccination(vaccinationData);
    // Refetch vaccinations to ensure UI is in sync
    await dispatch(loadVaccinations());
    return created as Vaccination;
  }
);

const vaccinationsSlice = createSlice({
  name: 'vaccinations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadVaccinations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadVaccinations.fulfilled, (state, action) => {
        state.loading = false;
        state.vaccinations = action.payload;
      })
      .addCase(loadVaccinations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load vaccinations';
      })
      .addCase(createVaccinationThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVaccinationThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createVaccinationThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create vaccination';
      });
  },
});

export default vaccinationsSlice.reducer;

