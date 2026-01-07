import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updatePetThunk, rollbackPetUpdate } from '../store/slices/petsSlice';
import { validatePet, type ValidationErrors } from '../utils/validation';
import type { Pet } from '../types';
import AttributeMultiSelect from './AttributeMultiSelect';
import Toast from './Toast';
import styles from './PetDetails.module.css';

interface PetDetailsProps {
  pet: Pet;
  isEditing?: boolean;
  onEditToggle?: (editing: boolean) => void;
}

export default function PetDetails({ pet: petProp, isEditing: externalIsEditing, onEditToggle }: PetDetailsProps) {
  const dispatch = useAppDispatch();
  // Get the latest pet from Redux store to ensure we have the most up-to-date data
  const pets = useAppSelector(state => state.pets.pets);
  const pet = pets.find(p => p.id === petProp.id) || petProp;
  
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const [editedPet, setEditedPet] = useState<Pet>(pet);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;

  useEffect(() => {
    setEditedPet(pet);
    setErrors({});
  }, [pet, isEditing]);

  const handleEditToggle = (editing: boolean) => {
    if (onEditToggle) {
      onEditToggle(editing);
    } else {
      setInternalIsEditing(editing);
    }
    if (!editing) {
      setEditedPet(pet);
      setErrors({});
    }
  };

  const handleChange = (field: keyof Pet, value: string | number | string[] | null) => {
    setEditedPet(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev: ValidationErrors) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = async () => {
    const validationErrors = validatePet(editedPet);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setToast({ message: 'Please fix validation errors', type: 'error' });
      return;
    }

    setIsSaving(true);
    const originalPet = { ...pet };

    try {
      await dispatch(updatePetThunk({
        petId: pet.id,
        petData: editedPet
      })).unwrap();
      
      setToast({ message: 'Pet updated successfully', type: 'success' });
      handleEditToggle(false);
    } catch (error) {
      // Rollback optimistic update
      dispatch(rollbackPetUpdate({ petId: pet.id, originalPet }));
      setEditedPet(originalPet);
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to update pet', 
        type: 'error' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedPet(pet);
    setErrors({});
    handleEditToggle(false);
  };

  const genderOptions = [
    'Male',
    'Female',
    'Neutered - Male',
    'Spayed - Female',
  ];

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
        <h3 className={styles.title}>Pet Details</h3>
        {!isEditing ? (
          <button className={styles.editButton} onClick={() => handleEditToggle(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
        ) : (
          <div className={styles.editActions}>
            <button 
              className={styles.saveButton} 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button 
              className={styles.cancelButton} 
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.detailItem}>
          <span className={styles.label}>
            Name: <span className={styles.required}>*</span>
          </span>
          {isEditing ? (
            <div>
              <input
                type="text"
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                value={editedPet.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
              {errors.name && <span className={styles.errorText}>{errors.name}</span>}
            </div>
          ) : (
            <span className={styles.value}>{pet.name}</span>
          )}
        </div>

        <div className={styles.detailItem}>
          <span className={styles.label}>
            Type: <span className={styles.required}>*</span>
          </span>
          {isEditing ? (
            <div>
              <input
                type="text"
                className={`${styles.input} ${errors.type ? styles.inputError : ''}`}
                value={editedPet.type}
                onChange={(e) => handleChange('type', e.target.value)}
              />
              {errors.type && <span className={styles.errorText}>{errors.type}</span>}
            </div>
          ) : (
            <span className={styles.value}>{pet.type}</span>
          )}
        </div>

        <div className={styles.detailItem}>
          <span className={styles.label}>
            Pet Breed: <span className={styles.required}>*</span>
          </span>
          {isEditing ? (
            <div>
              <input
                type="text"
                className={`${styles.input} ${errors.breed ? styles.inputError : ''}`}
                value={editedPet.breed}
                onChange={(e) => handleChange('breed', e.target.value)}
              />
              {errors.breed && <span className={styles.errorText}>{errors.breed}</span>}
            </div>
          ) : (
            <span className={styles.value}>{pet.breed}</span>
          )}
        </div>

        <div className={styles.detailItem}>
          <span className={styles.label}>
            Size: <span className={styles.required}>*</span>
          </span>
          {isEditing ? (
            <div>
              <select
                className={`${styles.input} ${errors.size ? styles.inputError : ''}`}
                value={editedPet.size}
                onChange={(e) => handleChange('size', e.target.value)}
              >
                <option value="">Select size</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
              {errors.size && <span className={styles.errorText}>{errors.size}</span>}
            </div>
          ) : (
            <span className={styles.value}>{pet.size}</span>
          )}
        </div>

        <div className={styles.detailItem}>
          <span className={styles.label}>Attributes:</span>
          {isEditing ? (
            <AttributeMultiSelect
              value={editedPet.attributes || []}
              onChange={(value) => handleChange('attributes', value)}
            />
          ) : (
            <div className={styles.attributesContainer}>
              {pet.attributes && pet.attributes.length > 0 ? (
                pet.attributes.map((attr, index) => (
                  <span key={index} className={styles.attributeChip}>
                    {attr}
                  </span>
                ))
              ) : (
                <span className={styles.value}>None</span>
              )}
            </div>
          )}
        </div>

        <div className={styles.detailItem}>
          <span className={styles.label}>Temper:</span>
          {isEditing ? (
            <input
              type="text"
              className={styles.input}
              value={editedPet.temper}
              onChange={(e) => handleChange('temper', e.target.value)}
            />
          ) : (
            <span className={styles.value}>{pet.temper}</span>
          )}
        </div>

        <div className={styles.detailItem}>
          <span className={styles.label}>Color:</span>
          {isEditing ? (
            <input
              type="text"
              className={styles.input}
              value={editedPet.color}
              onChange={(e) => handleChange('color', e.target.value)}
            />
          ) : (
            <span className={styles.value}>{pet.color}</span>
          )}
        </div>

        <div className={styles.detailItem}>
          <span className={styles.label}>
            Gender: <span className={styles.required}>*</span>
          </span>
          {isEditing ? (
            <div>
              <select
                className={`${styles.input} ${errors.gender ? styles.inputError : ''}`}
                value={editedPet.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
              >
                <option value="">Select gender</option>
                {genderOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.gender && <span className={styles.errorText}>{errors.gender}</span>}
            </div>
          ) : (
            <span className={styles.value}>{pet.gender}</span>
          )}
        </div>

        <div className={styles.detailItem}>
          <span className={styles.label}>Weight (kg):</span>
          {isEditing ? (
            <div>
              <input
                type="number"
                step="0.01"
                min="0"
                max="200"
                className={`${styles.input} ${errors.weightKg ? styles.inputError : ''}`}
                value={editedPet.weightKg}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  handleChange('weightKg', isNaN(value) ? 0 : value);
                }}
              />
              {errors.weightKg && <span className={styles.errorText}>{errors.weightKg}</span>}
            </div>
          ) : (
            <span className={styles.value}>{pet.weightKg.toFixed(2)}</span>
          )}
        </div>

        <div className={styles.detailItem}>
          <span className={styles.label}>Date of Birth:</span>
          {isEditing ? (
            <div>
              <input
                type="date"
                className={`${styles.input} ${errors.dob ? styles.inputError : ''}`}
                value={editedPet.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.dob && <span className={styles.errorText}>{errors.dob}</span>}
            </div>
          ) : (
            <span className={styles.value}>
              {new Date(pet.dob).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Notes</h4>
        {isEditing ? (
          <textarea
            className={styles.textarea}
            value={editedPet.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value || null)}
            rows={4}
          />
        ) : (
          <div className={styles.notesContent}>{pet.notes || 'N/A'}</div>
        )}
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Customer's Notes</h4>
        <div className={styles.notesContent}>{pet.customerNotes}</div>
      </div>
    </div>
  );
}
