export interface ValidationErrors {
  name?: string;
  type?: string;
  breed?: string;
  gender?: string;
  size?: string;
  weightKg?: string;
  dob?: string;
}

export function validatePet(pet: {
  name?: string;
  type?: string;
  breed?: string;
  gender?: string;
  size?: string;
  weightKg?: number;
  dob?: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  // Required fields
  if (!pet.name || pet.name.trim() === '') {
    errors.name = 'Name is required';
  }

  if (!pet.type || pet.type.trim() === '') {
    errors.type = 'Type is required';
  }

  if (!pet.breed || pet.breed.trim() === '') {
    errors.breed = 'Breed is required';
  }

  if (!pet.gender || pet.gender.trim() === '') {
    errors.gender = 'Gender is required';
  }

  if (!pet.size || pet.size.trim() === '') {
    errors.size = 'Size is required';
  }

  // Weight validation: 0-200, max 2 decimals
  if (pet.weightKg !== undefined) {
    if (isNaN(pet.weightKg) || pet.weightKg < 0 || pet.weightKg > 200) {
      errors.weightKg = 'Weight must be between 0 and 200 kg';
    } else {
      const decimals = pet.weightKg.toString().split('.')[1];
      if (decimals && decimals.length > 2) {
        errors.weightKg = 'Weight can have at most 2 decimal places';
      }
    }
  }

  // DOB validation: cannot be in the future
  if (pet.dob) {
    const dobDate = new Date(pet.dob);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (dobDate > today) {
      errors.dob = 'Date of birth cannot be in the future';
    }
  }

  return errors;
}

