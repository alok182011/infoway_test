import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type { ClientWithPets, Vaccination, Grooming, Booking } from '../types';

export const selectClients = (state: RootState) => state.clients.clients;
export const selectPets = (state: RootState) => state.pets.pets;
export const selectVaccinations = (state: RootState) => state.vaccinations.vaccinations;
export const selectGrooming = (state: RootState) => state.grooming.grooming;
export const selectBookings = (state: RootState) => state.bookings.bookings;

export const selectClientsWithPets = createSelector(
  [selectClients, selectPets],
  (clients, pets): ClientWithPets[] => {
    return clients.map(client => ({
      ...client,
      pets: pets.filter(pet => pet.clientId === client.id)
    }));
  }
);

export const makeSelectPetVaccinations = (petId: number) =>
  createSelector(
    [selectVaccinations],
    (vaccinations): Vaccination[] => {
      return vaccinations.filter(v => v.petId === petId);
    }
  );

export const makeSelectPetGrooming = (petId: number) =>
  createSelector(
    [selectGrooming],
    (grooming): Grooming[] => {
      return grooming.filter(g => g.petId === petId);
    }
  );

export const makeSelectPetBookings = (petId: number) =>
  createSelector(
    [selectBookings],
    (bookings): Booking[] => {
      return bookings.filter(b => b.petId === petId);
    }
  );

