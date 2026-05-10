import { z } from 'zod';

const specialRequirementEnum = z.enum([
  'Baby seat',
  'Wheelchair accessible vehicle',
  'Extra luggage',
  'Pet friendly ride'
]);

export const reservationSchema = z
  .object({
    riderFirstName: z.string().trim().min(1, 'Rider\'s first is required.'),
    riderLastName: z.string().trim().min(1, 'Rider\'s last is required.'),
    pickupLocation: z.string().trim().min(1, 'Pickup location is required.'),
    dropoffLocation: z.string().trim().min(1, 'Dropoff location is required.'),
    pickupTime: z
      .string()
      .datetime({ offset: true, message: 'Pickup time must be a valid date-time.' })
      .refine((value) => new Date(value).getTime() > Date.now(), 'Pickup time must be in the future.'),
    passengerCount: z
      .number({ message: 'Passenger count must be a number.' })
      .int('Passenger count must be a whole number.')
      .min(1, 'At least one passenger is required.')
      .max(6, 'Passenger count cannot exceed 6.'),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^\+?[0-9\-()\s]{7,20}$/, 'Please provide a valid phone number.'),
    specialRequirements: z.array(specialRequirementEnum).optional().default([])
  })
  .refine(
    (data) => data.pickupLocation.trim().toLowerCase() !== data.dropoffLocation.trim().toLowerCase(),
    {
      message: 'Origin and destination must be different.',
      path: ['dropoffLocation']
    }
  );
