import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { loadClients, loadPets, loadVaccinations, loadGrooming, loadBookings } from './store/slices';
import ClientList from './components/ClientList';
import PetDrawer from './components/PetDrawer';
import type { Pet } from './types';
import styles from './App.module.css';

function App() {
  const dispatch = useAppDispatch();
  const pets = useAppSelector(state => state.pets.pets);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

  useEffect(() => {
    // Load all data on app mount
    dispatch(loadClients());
    dispatch(loadPets());
    dispatch(loadVaccinations());
    dispatch(loadGrooming());
    dispatch(loadBookings());
  }, [dispatch]);

  // Get the selected pet from Redux store to ensure it's always up-to-date
  const selectedPet = selectedPetId ? pets.find(p => p.id === selectedPetId) || null : null;

  const handlePetSelect = (pet: Pet) => {
    setSelectedPetId(pet.id);
  };

  const handleCloseDrawer = () => {
    setSelectedPetId(null);
  };

  return (
    <div className={styles.app}>
      <ClientList selectedPetId={selectedPetId} onPetSelect={handlePetSelect} />
      <PetDrawer pet={selectedPet} onClose={handleCloseDrawer} />
    </div>
  );
}

export default App;
