import { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { makeSelectPetVaccinations } from '../store/selectors';
import { createVaccinationThunk } from '../store/slices/vaccinationsSlice';
import type { Pet, Vaccination } from '../types';
import { TableRowSkeleton } from './LoadingSkeleton';
import Toast from './Toast';
import styles from './Vaccinations.module.css';

interface VaccinationsProps {
  pet: Pet;
}

type SortField = 'date' | 'due' | 'vaccine';
type SortDirection = 'asc' | 'desc';

export default function Vaccinations({ pet }: VaccinationsProps) {
  const dispatch = useAppDispatch();
  const selectPetVaccinations = useMemo(() => makeSelectPetVaccinations(pet.id), [pet.id]);
  const vaccinationsFromStore = useAppSelector(selectPetVaccinations);
  const vaccinationsLoading = useAppSelector(state => state.vaccinations.loading);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>(vaccinationsFromStore);
  const [sortField, setSortField] = useState<SortField>('due');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update local state when Redux state changes
  useEffect(() => {
    setVaccinations(vaccinationsFromStore);
  }, [vaccinationsFromStore]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newVaccination, setNewVaccination] = useState({
    vaccine: '',
    date: '',
    due: '',
  });
  const [errors, setErrors] = useState<{ vaccine?: string; date?: string; due?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { vaccine?: string; date?: string; due?: string } = {};
    
    if (!newVaccination.vaccine.trim()) {
      newErrors.vaccine = 'Vaccine name is required';
    }
    
    if (!newVaccination.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!newVaccination.due) {
      newErrors.due = 'Due date is required';
    } else if (newVaccination.date && new Date(newVaccination.due) < new Date(newVaccination.date)) {
      newErrors.due = 'Due date must be after vaccination date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!validateForm()) {
      setToast({ message: 'Please fix validation errors', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(createVaccinationThunk({
        petId: pet.id,
        vaccine: newVaccination.vaccine.trim(),
        date: newVaccination.date,
        due: newVaccination.due,
      })).unwrap();
      
      setToast({ message: 'Vaccination added successfully', type: 'success' });
      setNewVaccination({ vaccine: '', date: '', due: '' });
      setErrors({});
      setShowAddForm(false);
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Failed to add vaccination',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedVaccinations = useMemo(() => {
    const sorted = [...vaccinations];
    sorted.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortField === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      } else if (sortField === 'due') {
        aValue = new Date(a.due).getTime();
        bValue = new Date(b.due).getTime();
      } else {
        aValue = a.vaccine.toLowerCase();
        bValue = b.vaccine.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [vaccinations, sortField, sortDirection]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const isDueWithin30Days = (dueDate: string): boolean => {
    const due = new Date(dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue >= 0 && daysUntilDue <= 30;
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 13l5 5 5-5M7 6l5-5 5 5"/>
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 13l5 5 5-5"/>
      </svg>
    ) : (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 6l5-5 5 5"/>
      </svg>
    );
  };

  return (
    <div className={styles.container}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className={styles.header}>
        <h3 className={styles.title}>Vaccinations</h3>
        {!showAddForm ? (
          <button 
            className={styles.addButton} 
            onClick={() => setShowAddForm(true)}
            aria-label="Add new vaccination"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Quick Add
          </button>
        ) : (
          <div className={styles.addForm}>
            <div className={styles.formField}>
              <input
                type="text"
                placeholder="Vaccine name"
                className={`${styles.input} ${errors.vaccine ? styles.inputError : ''}`}
                value={newVaccination.vaccine}
                onChange={(e) => {
                  setNewVaccination(prev => ({ ...prev, vaccine: e.target.value }));
                  if (errors.vaccine) {
                    setErrors(prev => ({ ...prev, vaccine: undefined }));
                  }
                }}
                aria-label="Vaccine name"
                aria-invalid={!!errors.vaccine}
                aria-describedby={errors.vaccine ? 'vaccine-error' : undefined}
              />
              {errors.vaccine && <span id="vaccine-error" className={styles.errorText}>{errors.vaccine}</span>}
            </div>
            <div className={styles.formField}>
              <input
                type="date"
                className={`${styles.input} ${errors.date ? styles.inputError : ''}`}
                value={newVaccination.date}
                onChange={(e) => {
                  setNewVaccination(prev => ({ ...prev, date: e.target.value }));
                  if (errors.date) {
                    setErrors(prev => ({ ...prev, date: undefined }));
                  }
                }}
                aria-label="Vaccination date"
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? 'date-error' : undefined}
              />
              {errors.date && <span id="date-error" className={styles.errorText}>{errors.date}</span>}
            </div>
            <div className={styles.formField}>
              <input
                type="date"
                placeholder="Due date"
                className={`${styles.input} ${errors.due ? styles.inputError : ''}`}
                value={newVaccination.due}
                min={newVaccination.date || undefined}
                onChange={(e) => {
                  setNewVaccination(prev => ({ ...prev, due: e.target.value }));
                  if (errors.due) {
                    setErrors(prev => ({ ...prev, due: undefined }));
                  }
                }}
                aria-label="Due date"
                aria-invalid={!!errors.due}
                aria-describedby={errors.due ? 'due-error' : undefined}
              />
              {errors.due && <span id="due-error" className={styles.errorText}>{errors.due}</span>}
            </div>
            <button 
              className={styles.saveButton} 
              onClick={handleAdd}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button 
              className={styles.cancelButton} 
              onClick={() => {
                setShowAddForm(false);
                setNewVaccination({ vaccine: '', date: '', due: '' });
                setErrors({});
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {vaccinationsLoading ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Vaccine</th>
                <th>Date</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      ) : vaccinations.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.emptyIcon}>
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3z"/>
            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3z"/>
            <path d="M12 3c0 1-1 3-3 3S6 4 6 3s1-3 3-3 3 2 3 3z"/>
            <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3z"/>
          </svg>
          <h4>No Vaccinations Recorded</h4>
          <p>This pet doesn't have any vaccination records yet.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <button className={styles.sortButton} onClick={() => handleSort('vaccine')}>
                    Vaccine {getSortIcon('vaccine')}
                  </button>
                </th>
                <th>
                  <button className={styles.sortButton} onClick={() => handleSort('date')}>
                    Date {getSortIcon('date')}
                  </button>
                </th>
                <th>
                  <button className={styles.sortButton} onClick={() => handleSort('due')}>
                    Due {getSortIcon('due')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedVaccinations.map(vaccination => (
                <tr key={vaccination.id}>
                  <td>{vaccination.vaccine}</td>
                  <td>{formatDate(vaccination.date)}</td>
                  <td>
                    <div className={styles.dueCell}>
                      <span>{formatDate(vaccination.due)}</span>
                      {isDueWithin30Days(vaccination.due) && (
                        <span className={styles.dueBadge}>Due within 30 days</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
