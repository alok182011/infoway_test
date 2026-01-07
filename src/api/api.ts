const API_BASE_URL = 'http://localhost:4000';

export async function fetchClients(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/clients`);
  if (!response.ok) throw new Error('Failed to fetch clients');
  return response.json();
}

export async function fetchPets(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/pets`);
  if (!response.ok) throw new Error('Failed to fetch pets');
  return response.json();
}

export async function fetchVaccinations(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/vaccinations`);
  if (!response.ok) throw new Error('Failed to fetch vaccinations');
  return response.json();
}

export async function fetchGrooming(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/grooming`);
  if (!response.ok) throw new Error('Failed to fetch grooming');
  return response.json();
}

export async function fetchBookings(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/bookings`);
  if (!response.ok) throw new Error('Failed to fetch bookings');
  return response.json();
}

export async function updatePet(petId: number, petData: Partial<any>): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/pets/${petId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(petData),
  });
  if (!response.ok) throw new Error('Failed to update pet');
  return response.json();
}

export async function createVaccination(vaccinationData: {
  petId: number;
  vaccine: string;
  date: string;
  due: string;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/vaccinations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(vaccinationData),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create vaccination' }));
    throw new Error(error.message || 'Failed to create vaccination');
  }
  return response.json();
}

