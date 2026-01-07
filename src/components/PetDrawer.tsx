import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import { formatAge } from '../utils/age';
import type { Pet } from '../types';
import PetDetails from './PetDetails';
import Photos from './Photos';
import Vaccinations from './Vaccinations';
import Grooming from './Grooming';
import Bookings from './Bookings';
import LoadingSkeleton from './LoadingSkeleton';
import styles from './PetDrawer.module.css';

interface PetDrawerProps {
  pet: Pet | null;
  onClose: () => void;
}

type TabType = 'details' | 'photos' | 'vaccinations' | 'grooming' | 'bookings';

export default function PetDrawer({ pet: petProp, onClose }: PetDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isEditingPet, setIsEditingPet] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const tabListRef = useRef<HTMLDivElement>(null);

  // Get the latest pet from Redux store to ensure we have the most up-to-date data
  const pets = useAppSelector(state => state.pets.pets);
  const pet = petProp ? (pets.find(p => p.id === petProp.id) || petProp) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showActionsMenu) {
          setShowActionsMenu(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showActionsMenu, onClose]);

  const handleTabKeyDown = (e: React.KeyboardEvent) => {
    const tabs: TabType[] = ['details', 'photos', 'vaccinations', 'grooming', 'bookings'];
    const currentIndex = tabs.indexOf(activeTab);

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex]);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        setActiveTab(tabs[prevIndex]);
        break;
      case 'Home':
        e.preventDefault();
        setActiveTab('details');
        break;
      case 'End':
        e.preventDefault();
        setActiveTab('bookings');
        break;
    }
  };

  const petsLoading = useAppSelector(state => state.pets.loading);

  if (!pet) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const age = formatAge(pet.dob);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'details', label: 'Pet Details' },
    { id: 'photos', label: 'Photos' },
    { id: 'vaccinations', label: 'Vaccinations' },
    { id: 'grooming', label: 'Grooming' },
    { id: 'bookings', label: 'Bookings' },
  ];

  return (
    <div className={styles.drawer} role="dialog" aria-labelledby="pet-name" aria-modal="true">
      <div className={styles.header}>
        <button 
          className={styles.backButton} 
          onClick={onClose}
          aria-label="Close pet drawer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        
        <div className={styles.petHeader}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatar}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11.25 4.533A9.707 9.707 0 0 1 12 4c3.87 0 7 3.13 7 7 0 5.25-7 13-7 13S5 16.25 5 11c0-3.87 3.13-7 7-7a9.707 9.707 0 0 1 .25.533"/>
                <circle cx="12" cy="9" r="2.5" fill="white"/>
                <path d="M8 12h8M10 15h4" stroke="white" strokeWidth="1.5"/>
              </svg>
            </div>
            <button className={styles.editAvatarButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
          
          <div className={styles.petInfo}>
            <h2 id="pet-name" className={styles.petName}>{pet.name}</h2>
            <span 
              className={`${styles.statusBadge} ${pet.status === 'Active' ? styles.statusActive : styles.statusInactive}`}
              aria-label={`Status: ${pet.status}`}
            >
              {pet.status}
            </span>
          </div>
          
          <div className={styles.headerActions}>
            <div className={styles.actionsMenu} ref={actionsMenuRef}>
              <button 
                className={styles.actionsButton}
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                aria-expanded={showActionsMenu}
                aria-haspopup="true"
                aria-label="Actions menu"
              >
                Actions
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {showActionsMenu && (
                <div 
                  className={styles.actionsDropdown}
                  role="menu"
                  aria-label="Pet actions"
                >
                  <button 
                    role="menuitem"
                    onClick={() => {
                      setIsEditingPet(true);
                      setShowActionsMenu(false);
                      setActiveTab('details');
                    }}
                  >
                    Edit Pet
                  </button>
                  <button role="menuitem">Deactivate</button>
                  <button role="menuitem">Delete</button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.dateOfBirth}>
          <span>Date of Birth: {formatDate(pet.dob)}</span>
          <span className={styles.age}>Age: {age}</span>
        </div>
      </div>

      <div className={styles.content}>
        <div 
          className={styles.tabs}
          role="tablist"
          aria-label="Pet information tabs"
          ref={tabListRef}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={handleTabKeyDown}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {petsLoading ? (
            <LoadingSkeleton variant="rect" width="100%" height="400px" />
          ) : (
            <>
              {activeTab === 'details' && (
                <div
                  role="tabpanel"
                  id="tabpanel-details"
                  aria-labelledby="tab-details"
                  tabIndex={0}
                >
                  <PetDetails 
                    pet={pet} 
                    isEditing={isEditingPet}
                    onEditToggle={(editing) => {
                      setIsEditingPet(editing);
                    }}
                  />
                </div>
              )}
              {activeTab === 'photos' && (
                <div
                  role="tabpanel"
                  id="tabpanel-photos"
                  aria-labelledby="tab-photos"
                  tabIndex={0}
                >
                  <Photos pet={pet} />
                </div>
              )}
              {activeTab === 'vaccinations' && (
                <div
                  role="tabpanel"
                  id="tabpanel-vaccinations"
                  aria-labelledby="tab-vaccinations"
                  tabIndex={0}
                >
                  <Vaccinations pet={pet} />
                </div>
              )}
              {activeTab === 'grooming' && (
                <div
                  role="tabpanel"
                  id="tabpanel-grooming"
                  aria-labelledby="tab-grooming"
                  tabIndex={0}
                >
                  <Grooming pet={pet} />
                </div>
              )}
              {activeTab === 'bookings' && (
                <div
                  role="tabpanel"
                  id="tabpanel-bookings"
                  aria-labelledby="tab-bookings"
                  tabIndex={0}
                >
                  <Bookings pet={pet} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

