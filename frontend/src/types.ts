export interface Reservation {
  id: number;
  riderFirstName: string;
  riderLastName: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  passengerCount: number;
  phoneNumber: string;
  specialRequirements: string[];
  createdAt: string;
}

export interface CreateReservationPayload {
  riderFirstName: string;
  riderLastName: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  passengerCount: number;
  phoneNumber: string;
  specialRequirements?: string[];
}
