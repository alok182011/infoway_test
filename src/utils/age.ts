export function calculateAge(dob: string): { years: number; months: number } {
  const birthDate = new Date(dob);
  const today = new Date();
  
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // Adjust if the day hasn't occurred yet this month
  if (today.getDate() < birthDate.getDate()) {
    months--;
    if (months < 0) {
      months = 11;
      years--;
    }
  }
  
  return { years, months };
}

export function formatAge(dob: string): string {
  const { years, months } = calculateAge(dob);
  
  if (years === 0 && months === 0) {
    return 'Less than 1 month';
  }
  
  if (years === 0) {
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }
  
  if (months === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  }
  
  return `${years} ${years === 1 ? 'year' : 'years'} ${months} ${months === 1 ? 'month' : 'months'}`;
}

