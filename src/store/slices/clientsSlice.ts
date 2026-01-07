import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchClients } from '../../api/api';
import type { Client } from '../../types';

interface ClientsState {
  clients: Client[];
  loading: boolean;
  error: string | null;
}

const initialState: ClientsState = {
  clients: [],
  loading: false,
  error: null,
};

export const loadClients = createAsyncThunk('clients/load', async () => {
  const data = await fetchClients();
  return data as Client[];
});

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload;
      })
      .addCase(loadClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load clients';
      });
  },
});

export default clientsSlice.reducer;

