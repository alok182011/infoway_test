import { useState, useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { makeSelectPetGrooming } from '../store/selectors';
import type { Pet } from '../types';
import LoadingSkeleton, { TableRowSkeleton } from './LoadingSkeleton';
import styles from './Grooming.module.css';

interface GroomingProps {
  pet: Pet;
}

type SortDirection = 'asc' | 'desc';

export default function Grooming({ pet }: GroomingProps) {
  const selectPetGrooming = useMemo(() => makeSelectPetGrooming(pet.id), [pet.id]);
  const groomingRecords = useAppSelector(selectPetGrooming);
  const groomingLoading = useAppSelector(state => state.grooming.loading);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const sortedRecords = useMemo(() => {
    const sorted = [...groomingRecords];
    sorted.sort((a, b) => {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
    });
    return sorted;
  }, [groomingRecords, sortDirection]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getSortIcon = () => {
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
      <div className={styles.header}>
        <h3 className={styles.title}>Grooming</h3>
      </div>

      {groomingLoading ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Service</th>
                <th>Date</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      ) : groomingRecords.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.emptyIcon}>
            <path d="M12 2v20M2 12h20"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <h4>No Grooming Records</h4>
          <p>This pet doesn't have any grooming history yet.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Service</th>
                <th>
                  <button className={styles.sortButton} onClick={handleSort}>
                    Date {getSortIcon()}
                  </button>
                </th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map(record => (
                <tr key={record.id}>
                  <td>{record.service}</td>
                  <td>{formatDate(record.date)}</td>
                  <td>{record.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
