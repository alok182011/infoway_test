import { calculateAge, formatAge } from '../../utils/age';

describe('calculateAge / formatAge', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-03-01T12:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('calculates years and months correctly for a normal date', () => {
    const { years, months } = calculateAge('2020-01-15');
    expect({ years, months }).toEqual({ years: 5, months: 1 });
    expect(formatAge('2020-01-15')).toBe('5 years 1 month');
  });

  it('handles less than one month old', () => {
    const { years, months } = calculateAge('2025-02-20');
    expect({ years, months }).toEqual({ years: 0, months: 0 });
    expect(formatAge('2025-02-20')).toBe('Less than 1 month');
  });

  it('handles leap-year birthday to non-leap current year', () => {
    const { years, months } = calculateAge('2016-02-29');
    expect({ years, months }).toEqual({ years: 9, months: 0 });
  });

  it('handles leap-year birthday exactly on Feb 29 of a leap year', () => {
    jest.setSystemTime(new Date('2024-02-29T12:00:00Z'));
    const { years, months } = calculateAge('2020-02-29');
    expect({ years, months }).toEqual({ years: 4, months: 0 });
  });
});


