import { validatePet } from '../../utils/validation';

describe('validatePet', () => {
  const base = {
    name: 'Dog 1',
    type: 'Dog',
    breed: 'Breed',
    gender: 'Neutered - Male',
    size: 'Medium',
    weightKg: 10,
    dob: '2020-01-01',
  };

  it('rejects future DOB', () => {
    const future = { ...base, dob: '2999-01-01' };
    const errors = validatePet(future);
    expect(errors.dob).toBe('Date of birth cannot be in the future');
  });

  it('rejects weight < 0', () => {
    const errors = validatePet({ ...base, weightKg: -1 });
    expect(errors.weightKg).toBe('Weight must be between 0 and 200 kg');
  });

  it('rejects weight > 200', () => {
    const errors = validatePet({ ...base, weightKg: 201 });
    expect(errors.weightKg).toBe('Weight must be between 0 and 200 kg');
  });

  it('rejects weight with more than 2 decimal places', () => {
    const errors = validatePet({ ...base, weightKg: 10.123 });
    expect(errors.weightKg).toBe('Weight can have at most 2 decimal places');
  });

  it('accepts valid weight and dob', () => {
    const errors = validatePet(base);
    expect(errors.weightKg).toBeUndefined();
    expect(errors.dob).toBeUndefined();
  });
});


