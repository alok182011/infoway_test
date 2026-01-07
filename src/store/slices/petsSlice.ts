import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPets, updatePet } from '../../api/api';
import type { Pet } from '../../types';

interface PetsState {
  pets: Pet[];
  loading: boolean;
  error: string | null;
}

const initialState: PetsState = {
  pets: [],
  loading: false,
  error: null,
};

export const loadPets = createAsyncThunk('pets/load', async () => {
  const data = await fetchPets();
  return data as Pet[];
});

export const updatePetThunk = createAsyncThunk(
  'pets/update',
  async ({ petId, petData }: { petId: number; petData: Partial<Pet> }, { getState, dispatch }) => {
    const state = getState() as { pets: PetsState };
    const originalPet = state.pets.pets.find(p => p.id === petId);
    
    if (!originalPet) {
      throw new Error('Pet not found');
    }

    try {
      const updated = await updatePet(petId, petData);
      return { petId, pet: updated as Pet };
    } catch (error) {
      // Rollback on error
      dispatch(rollbackPetUpdate({ petId, originalPet }));
      throw error;
    }
  }
);

const petsSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {
    rollbackPetUpdate: (state, action) => {
      const { petId, originalPet } = action.payload;
      const index = state.pets.findIndex(p => p.id === petId);
      if (index !== -1) {
        state.pets[index] = originalPet;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPets.fulfilled, (state, action) => {
        state.loading = false;
        state.pets = action.payload;
      })
      .addCase(loadPets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load pets';
      })
      .addCase(updatePetThunk.pending, (state, action) => {
        // Optimistic update
        const { petId, petData } = action.meta.arg;
        const index = state.pets.findIndex(p => p.id === petId);
        if (index !== -1) {
          state.pets[index] = { ...state.pets[index], ...petData };
        }
      })
      .addCase(updatePetThunk.fulfilled, (state, action) => {
        // Confirm update with server response
        const { petId, pet } = action.payload;
        const index = state.pets.findIndex(p => p.id === petId);
        if (index !== -1) {
          state.pets[index] = pet;
        }
        state.error = null;
      })
      .addCase(updatePetThunk.rejected, (state, action) => {
        // Rollback already handled in thunk
        state.error = action.error.message || 'Failed to update pet';
      });
  },
});

export const { rollbackPetUpdate } = petsSlice.actions;
export default petsSlice.reducer;

