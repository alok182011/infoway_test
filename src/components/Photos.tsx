import { useState, useRef, useCallback } from 'react';
import type { Pet } from '../types';
import Toast from './Toast';
import styles from './Photos.module.css';

interface PhotosProps {
  pet: Pet;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

interface PhotoFile {
  id: string;
  url: string;
  file?: File;
  isNew?: boolean;
}

export default function Photos({ pet }: PhotosProps) {
  const [photos, setPhotos] = useState<PhotoFile[]>(
    (pet.photos || []).map(url => ({ id: url, url }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type not allowed. Please upload PNG, JPG, or WEBP images.`;
    }

    // Check file extension (additional check)
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return `File extension not allowed. Please upload PNG, JPG, or WEBP images.`;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 5MB limit. Please choose a smaller file.`;
    }

    return null;
  };

  const processFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newPhotos: PhotoFile[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        const url = URL.createObjectURL(file);
        newPhotos.push({
          id: `new-${Date.now()}-${Math.random()}`,
          url,
          file,
          isNew: true,
        });
      }
    });

    if (errors.length > 0) {
      setToast({
        message: errors.join('\n'),
        type: 'error',
      });
    }

    if (newPhotos.length > 0) {
      setPhotos(prev => [...prev, ...newPhotos]);
      if (newPhotos.length === 1) {
        setToast({ message: 'Photo added successfully', type: 'success' });
      } else {
        setToast({ message: `${newPhotos.length} photos added successfully`, type: 'success' });
      }
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    processFiles(files);
  };

  const handleRemove = (photoId: string) => {
    setDeleteConfirm(photoId);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;

    setPhotos(prev => {
      const photoToRemove = prev.find(p => p.id === deleteConfirm);
      if (photoToRemove) {
        // Clean up object URL if it's a blob URL
        if (photoToRemove.url.startsWith('blob:')) {
          URL.revokeObjectURL(photoToRemove.url);
        }
      }
      return prev.filter(p => p.id !== deleteConfirm);
    });

    setToast({ message: 'Photo deleted successfully', type: 'success' });
    setDeleteConfirm(null);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
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

      {deleteConfirm && (
        <div 
          className={styles.modalOverlay} 
          onClick={cancelDelete}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-photo-title"
          aria-describedby="delete-photo-description"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 id="delete-photo-title">Delete Photo</h3>
            <p id="delete-photo-description">Are you sure you want to delete this photo? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button 
                className={styles.confirmButton} 
                onClick={confirmDelete}
                autoFocus
              >
                Delete
              </button>
              <button 
                className={styles.cancelButton} 
                onClick={cancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <h3 className={styles.title}>Photos</h3>
        <label className={styles.uploadButton}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload Photos
        </label>
      </div>

      <div
        className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={styles.dropZoneContent}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p className={styles.dropZoneText}>
            {isDragging ? 'Drop photos here' : 'Drag and drop photos here, or click to browse'}
          </p>
          <p className={styles.dropZoneHint}>
            PNG, JPG, or WEBP (max 5MB each)
          </p>
        </div>
      </div>

      {photos.length > 0 && (
        <div className={styles.photosGrid}>
          {photos.map((photo) => (
            <div key={photo.id} className={styles.photoItem}>
              <img src={photo.url} alt={`${pet.name} photo`} className={styles.photo} />
              {photo.isNew && (
                <div className={styles.newBadge}>New</div>
              )}
              <button
                className={styles.removeButton}
                onClick={() => handleRemove(photo.id)}
                title="Delete photo"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
