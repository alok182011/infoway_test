import clientsData from '../data/clients.json';
import petsData from '../data/pets.json';
import vaccinationsData from '../data/vaccinations.json';
import groomingData from '../data/grooming.json';
import bookingsData from '../data/bookings.json';
import type { Client, Pet, Vaccination, Grooming, Booking, ClientWithPets } from './types';

export const clients: Client[] = clientsData as Client[];
export const pets: Pet[] = petsData as Pet[];
export const vaccinations: Vaccination[] = vaccinationsData as Vaccination[];
export const grooming: Grooming[] = groomingData as Grooming[];
export const bookings: Booking[] = bookingsData as Booking[];

export function getClientsWithPets(): ClientWithPets[] {
  return clients.map(client => ({
    ...client,
    pets: pets.filter(pet => pet.clientId === client.id)
  }));
}

export function getPetVaccinations(petId: number): Vaccination[] {
  return vaccinations.filter(v => v.petId === petId);
}

export function getPetGrooming(petId: number): Grooming[] {
  return grooming.filter(g => g.petId === petId);
}

export function getPetBookings(petId: number): Booking[] {
  return bookings.filter(b => b.petId === petId);
}

