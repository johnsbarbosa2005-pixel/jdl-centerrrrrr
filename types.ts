
// Define the available service types for center resources
export type ServiceType = 'Mentorship' | 'Co-working Space' | '3D Printer' | 'Workshop' | 'Pitch Review';

export interface Appointment {
  id: string;
  name: string;
  email: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  roomMessage: string;
  isStaffBlock?: boolean; // Flag to identify entries forced by staff (Red tiles)
  service?: ServiceType;
  notes?: string;
  status: 'occupied' | 'pending' | 'confirmed' | 'cancelled';
}

export interface StaffUser {
  email: string;
  name: string;
}

export interface CenterStat {
  day: string;
  bookings: number;
}
