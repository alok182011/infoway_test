import { useState, useMemo, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectClientsWithPets } from '../store/selectors';
import type { Pet } from '../types';
import styles from './ClientList.module.css';

interface ClientListProps {
  selectedPetId: number | null;
  onPetSelect: (pet: Pet) => void;
}

export default function ClientList({ selectedPetId, onPetSelect }: ClientListProps) {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);

  // Debounce search input (400ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const allClientsWithPets = useAppSelector(selectClientsWithPets);

  const clientsWithPets = useMemo(() => {
    let filtered = allClientsWithPets;

    // Filter by inactive status
    if (!includeInactive) {
      filtered = filtered.filter(client => client.status === 'Active');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered
        .map(client => ({
          ...client,
          pets: client.pets.filter(pet => {
            const matchesClient = client.name.toLowerCase().includes(query);
            const matchesPet = pet.name.toLowerCase().includes(query);
            return matchesClient || matchesPet;
          })
        }))
        .filter(client => client.pets.length > 0 || client.name.toLowerCase().includes(query));
    }

    return filtered;
  }, [allClientsWithPets, searchQuery, includeInactive]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (clientId: number) => {
    const colors = [
      'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)', // Brownish for Customer 1
      'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', // Green for Customer 2
    ];
    return colors[(clientId - 1) % colors.length];
  };

  const getStatusClass = (status: string) => {
    return status === 'Active' ? styles.statusActive : styles.statusInactive;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Pets</h2>
        <button className={styles.petsButton}>Pets</button>
      </div>
      
      <div className={styles.searchSection}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="by name, email, or pets"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
          />
          <span>Include Inactive</span>
        </label>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Status</th>
              <th>Pets</th>
            </tr>
          </thead>
          <tbody>
            {clientsWithPets.map(client => (
              <tr 
                key={client.id}
                className={styles.tableRow}
                onClick={() => {
                  // Open drawer for the first pet if available
                  if (client.pets.length > 0) {
                    onPetSelect(client.pets[0]);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (client.pets.length > 0) {
                      onPetSelect(client.pets[0]);
                    }
                  }
                }}
                tabIndex={0}
                aria-label={`${client.name}, ${client.status}, ${client.pets.length} pet${client.pets.length !== 1 ? 's' : ''}`}
              >
                <td>
                  <div className={styles.clientCell}>
                    <div className={styles.avatar} style={{ background: getAvatarColor(client.id) }}>{getInitials(client.name)}</div>
                    <span>{client.name}</span>
                  </div>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(client.status)}`}>
                    {client.status}
                  </span>
                </td>
                <td>
                  <div className={styles.petsCell}>
                    {client.pets.map(pet => (
                      <button
                        key={pet.id}
                        className={`${styles.petButton} ${selectedPetId === pet.id ? styles.petButtonSelected : ''}`}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click from firing
                          onPetSelect(pet);
                        }}
                        title={pet.name}
                      >
                        🐕
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

