import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchBookings } from '../../api/api';
import type { Booking } from '../../types';

interface BookingsState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  bookings: [],
  loading: false,
  error: null,
};

export const loadBookings = createAsyncThunk('bookings/load', async () => {
  const data = await fetchBookings();
  return data as Booking[];
});

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(loadBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load bookings';
      });
  },
});

export default bookingsSlice.reducer;

