import { configureStore } from '@reduxjs/toolkit';
import clientsReducer from './slices/clientsSlice';
import petsReducer from './slices/petsSlice';
import vaccinationsReducer from './slices/vaccinationsSlice';
import groomingReducer from './slices/groomingSlice';
import bookingsReducer from './slices/bookingsSlice';

export const store = configureStore({
  reducer: {
    clients: clientsReducer,
    pets: petsReducer,
    vaccinations: vaccinationsReducer,
    grooming: groomingReducer,
    bookings: bookingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

