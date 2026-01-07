export interface Client {
  id: number;
  name: string;
  status: 'Active' | 'Inactive';
}

export interface Pet {
  id: number;
  clientId: number;
  name: string;
  status: 'Active' | 'Inactive';
  type: string;
  breed: string;
  size: string;
  temper: string;
  color: string;
  gender: string;
  weightKg: number;
  dob: string;
  attributes: string[];
  notes: string | null;
  customerNotes: string;
  photos: string[];
}

export interface Vaccination {
  id: number;
  petId: number;
  vaccine: string;
  date: string;
  due: string;
}

export interface Grooming {
  id: number;
  petId: number;
  service: string;
  date: string;
  notes: string;
}

export interface Booking {
  id: number;
  petId: number;
  type: string;
  start: string;
  end: string;
  status: string;
}

export interface ClientWithPets extends Client {
  pets: Pet[];
}

