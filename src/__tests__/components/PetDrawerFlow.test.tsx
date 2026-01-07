import { useState } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import clientsReducer from '../../store/slices/clientsSlice';
import petsReducer from '../../store/slices/petsSlice';
import vaccinationsReducer from '../../store/slices/vaccinationsSlice';
import groomingReducer from '../../store/slices/groomingSlice';
import bookingsReducer from '../../store/slices/bookingsSlice';

import ClientList from '../../components/ClientList';
import PetDrawer from '../../components/PetDrawer';
import * as api from '../../api/api';
import type { Pet } from '../../types';

jest.mock('../../api/api');

const mockedUpdatePet = api.updatePet as jest.MockedFunction<typeof api.updatePet>;

function TestShell() {
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const pets: Pet[] = [
    {
      id: 101,
      clientId: 1,
      name: 'Dog 1',
      status: 'Active',
      type: 'Dog',
      breed: 'Breed',
      size: 'Medium',
      temper: 'Calm',
      color: 'Black',
      gender: 'Neutered - Male',
      weightKg: 4,
      dob: '2020-01-01',
      attributes: ['Barks'],
      notes: null,
      customerNotes: '',
      photos: [],
    },
  ];
  const selectedPet: Pet | null =
    selectedPetId != null ? pets.find(p => p.id === selectedPetId) || null : null;

  return (
    <>
      <ClientList
        selectedPetId={selectedPetId}
        // In this test shell, we bypass Redux for ClientList -> PetDrawer handoff
        onPetSelect={(pet) => setSelectedPetId(pet.id)}
      />
      <PetDrawer pet={selectedPet} onClose={() => setSelectedPetId(null)} />
    </>
  );
}

function renderWithStore() {
  const preloadedState = {
    clients: { clients: [{ id: 1, name: 'Customer 1', status: 'Active' }] },
    pets: {
      pets: [
        {
          id: 101,
          clientId: 1,
          name: 'Dog 1',
          status: 'Active',
          type: 'Dog',
          breed: 'Breed',
          size: 'Medium',
          temper: 'Calm',
          color: 'Black',
          gender: 'Neutered - Male',
          weightKg: 4,
          dob: '2020-01-01',
          attributes: ['Barks'],
          notes: null,
          customerNotes: '',
          photos: [],
        },
      ],
      loading: false,
      error: null,
    },
    vaccinations: { vaccinations: [], loading: false, error: null },
    grooming: { grooming: [], loading: false, error: null },
    bookings: { bookings: [], loading: false, error: null },
  };

  const store = configureStore({
    reducer: {
      clients: clientsReducer,
      pets: petsReducer,
      vaccinations: vaccinationsReducer,
      grooming: groomingReducer,
      bookings: bookingsReducer,
    } as any,
    preloadedState: preloadedState as any,
  });

  return render(
    <Provider store={store}>
      <TestShell />
    </Provider>
  );
}

describe('ClientList + PetDrawer flow', () => {
  it('opens drawer on row click and edit → save performs updatePet', async () => {
    const user = userEvent.setup();
    mockedUpdatePet.mockResolvedValue({
      id: 101,
      weightKg: 5,
    } as any);

    renderWithStore();

    // Click the client row
    const row = screen.getByLabelText(/Customer 1/i);
    await user.click(row);

    // Drawer should show pet name (heading)
    expect(await screen.findByRole('heading', { name: 'Dog 1' })).toBeInTheDocument();

    // Enter edit mode
    await user.click(screen.getByRole('button', { name: /edit/i }));

    // Change weight (find the input in the "Weight (kg)" row)
    const weightLabel = screen.getByText(/Weight \(kg\):/i);
    const weightInput = weightLabel.parentElement!.querySelector('input') as HTMLInputElement;
    await user.clear(weightInput);
    await user.type(weightInput, '5');

    // Save
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mockedUpdatePet).toHaveBeenCalledTimes(1);
    expect(mockedUpdatePet).toHaveBeenCalledWith(
      101,
      expect.objectContaining({ weightKg: 5 })
    );
  });
});


