import { useState, useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { makeSelectPetBookings } from '../store/selectors';
import type { Pet } from '../types';
import { TableRowSkeleton } from './LoadingSkeleton';
import styles from './Bookings.module.css';

interface BookingsProps {
  pet: Pet;
}

type SortField = 'type' | 'start' | 'end' | 'status';
type SortDirection = 'asc' | 'desc';

export default function Bookings({ pet }: BookingsProps) {
  const selectPetBookings = useMemo(() => makeSelectPetBookings(pet.id), [pet.id]);
  const bookings = useAppSelector(selectPetBookings);
  const bookingsLoading = useAppSelector(state => state.bookings.loading);
  const [sortField, setSortField] = useState<SortField>('start');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedBookings = useMemo(() => {
    const sorted = [...bookings];
    sorted.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortField === 'start' || sortField === 'end') {
        aValue = new Date(a[sortField]).getTime();
        bValue = new Date(b[sortField]).getTime();
      } else if (sortField === 'type') {
        aValue = a.type.toLowerCase();
        bValue = b.type.toLowerCase();
      } else {
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [bookings, sortField, sortDirection]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getDateRange = (start: string, end: string) => {
    const startDate = formatDate(start);
    const endDate = formatDate(end);
    return `${startDate} - ${endDate}`;
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
      <div className={styles.header}>
        <h3 className={styles.title}>Bookings</h3>
      </div>

      {bookingsLoading ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Date Range</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      ) : bookings.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.emptyIcon}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <h4>No Bookings Found</h4>
          <p>This pet doesn't have any bookings scheduled.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <button className={styles.sortButton} onClick={() => handleSort('type')}>
                    Type {getSortIcon('type')}
                  </button>
                </th>
                <th>
                  <button className={styles.sortButton} onClick={() => handleSort('start')}>
                    Date Range {getSortIcon('start')}
                  </button>
                </th>
                <th>
                  <button className={styles.sortButton} onClick={() => handleSort('status')}>
                    Status {getSortIcon('status')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedBookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.type}</td>
                  <td>
                    <span className={styles.dateRangeChip}>
                      {getDateRange(booking.start, booking.end)}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[booking.status.toLowerCase()] || ''}`}>
                      {booking.status}
                    </span>
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
