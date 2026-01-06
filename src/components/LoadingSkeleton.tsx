import styles from './LoadingSkeleton.module.css';

interface LoadingSkeletonProps {
  variant?: 'text' | 'circle' | 'rect';
  width?: string;
  height?: string;
  className?: string;
}

export default function LoadingSkeleton({ 
  variant = 'rect', 
  width, 
  height,
  className = '' 
}: LoadingSkeletonProps) {
  return (
    <div 
      className={`${styles.skeleton} ${styles[variant]} ${className}`}
      style={{ width, height }}
    />
  );
}

export function TableRowSkeleton() {
  return (
    <tr>
      <td><LoadingSkeleton variant="text" width="120px" height="16px" /></td>
      <td><LoadingSkeleton variant="text" width="80px" height="16px" /></td>
      <td><LoadingSkeleton variant="text" width="100px" height="16px" /></td>
    </tr>
  );
}

export function PetDetailsSkeleton() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div style={{ marginBottom: '8px' }}>
              <LoadingSkeleton variant="text" width="80px" height="12px" />
            </div>
            <LoadingSkeleton variant="text" width="100%" height="16px" />
          </div>
        ))}
      </div>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ marginBottom: '12px' }}>
          <LoadingSkeleton variant="text" width="100px" height="16px" />
        </div>
        <LoadingSkeleton variant="rect" width="100%" height="60px" />
      </div>
    </div>
  );
}

