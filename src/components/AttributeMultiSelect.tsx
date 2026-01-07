import { useState, useRef, useEffect } from 'react';
import styles from './AttributeMultiSelect.module.css';

interface AttributeMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  availableAttributes?: string[];
}

const DEFAULT_ATTRIBUTES = [
  'Barks',
  'Blind',
  'Escaper',
  'Good with kids',
  'Loves water',
  'Apartment friendly',
  'Low energy',
  'High energy',
  'Friendly',
  'Shy',
  'Aggressive',
  'Playful',
  'Calm',
  'Anxious',
];

export default function AttributeMultiSelect({ 
  value, 
  onChange, 
  availableAttributes = DEFAULT_ATTRIBUTES 
}: AttributeMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredAttributes = availableAttributes.filter(attr =>
    attr.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !value.includes(attr)
  );

  const toggleAttribute = (attr: string) => {
    if (value.includes(attr)) {
      onChange(value.filter(v => v !== attr));
    } else {
      onChange([...value, attr]);
    }
  };

  const removeAttribute = (attr: string) => {
    onChange(value.filter(v => v !== attr));
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <div className={styles.selectedContainer}>
        {value.length > 0 ? (
          value.map(attr => (
            <span key={attr} className={styles.selectedChip}>
              {attr}
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removeAttribute(attr)}
              >
                ×
              </button>
            </span>
          ))
        ) : (
          <span className={styles.placeholder}>Select attributes...</span>
        )}
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setIsOpen(!isOpen)}
        >
          ▼
        </button>
      </div>
      {isOpen && (
        <div className={styles.dropdown}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search attributes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className={styles.optionsList}>
            {filteredAttributes.length > 0 ? (
              filteredAttributes.map(attr => (
                <label key={attr} className={styles.option}>
                  <input
                    type="checkbox"
                    checked={value.includes(attr)}
                    onChange={() => toggleAttribute(attr)}
                  />
                  <span>{attr}</span>
                </label>
              ))
            ) : (
              <div className={styles.noOptions}>No attributes found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

