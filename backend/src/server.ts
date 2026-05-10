import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from './db';
import { reservationSchema } from './validation';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

function parseSpecialRequirements(value: unknown): string[] {
  if (typeof value !== 'string' || value.trim() === '') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// Get all reservations from the database
app.get('/api/reservations', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, rider_first_name, rider_last_name, pickup_location, dropoff_location, pickup_time, passenger_count, phone_number, special_requirements, created_at
       FROM reservations
       ORDER BY pickup_time ASC`
    );
    // Map the rows to the reservation object and return the reservations
    res.json(
      rows.map((row) => ({
        id: row.id,
        riderFirstName: row.rider_first_name,
        riderLastName: row.rider_last_name,
        pickupLocation: row.pickup_location,
        dropoffLocation: row.dropoff_location,
        pickupTime: new Date(row.pickup_time).toISOString(),
        passengerCount: row.passenger_count,
        phoneNumber: row.phone_number,
        specialRequirements: parseSpecialRequirements(row.special_requirements),
        createdAt: row.created_at
      }))
    );
  } catch (error) {
    console.log('Failed to fetch reservations', error);
    console.error('Failed to fetch reservations', error);
    res.status(500).json({ message: 'Failed to fetch reservations.' });
  }
});

// Create a new reservation
app.post('/api/reservations', async (req: Request, res: Response) => {
  const parsed = reservationSchema.safeParse({
    ...req.body,
    passengerCount: Number(req.body.passengerCount)
  });

  if (!parsed.success) {
    console.log('Validation failed.', parsed.error, req.body, parsed.data);
    const errors = parsed.error.issues.map((issue) => issue.message);
    return res.status(400).json({ message: 'Validation failed.', errors });
  }

  const data = parsed.data;

  // Insert the reservation into the database
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO reservations
      (rider_first_name, rider_last_name, pickup_location, dropoff_location, pickup_time, passenger_count, phone_number, special_requirements)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.riderFirstName,
        data.riderLastName,
        data.pickupLocation,
        data.dropoffLocation,
        new Date(data.pickupTime).toISOString().slice(0, 19).replace('T', ' '),
        data.passengerCount,
        data.phoneNumber,
        JSON.stringify(data.specialRequirements ?? [])
      ]
    );

    return res.status(201).json({
      id: result.insertId,
      ...data
    });
  } catch (error) {
    console.log('Failed to create reservation', error);
    console.error('Failed to create reservation', error);
    return res.status(500).json({ message: 'Failed to create reservation.' });
  }
});

// Delete a reservation
app.delete('/api/reservations/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [result] =await pool.execute('DELETE FROM reservations WHERE id = ?', [id]);
    if ((result as ResultSetHeader).affectedRows === 0) {
      throw new Error('Reservation not found');
    }
    return res.status(200).json({ message: 'Reservation deleted successfully.' });
  } catch (error) {
    console.log('Failed to delete reservation', error);
    console.error('Failed to delete reservation', error);
    return res.status(500).json({ message: 'Failed to delete reservation.' });
  }
});

// Update a reservation
app.put('/api/reservations/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsed = reservationSchema.safeParse({
    ...req.body,
    passengerCount: Number(req.body.passengerCount)
  });

  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => issue.message);
    return res.status(400).json({ message: 'Validation failed.', errors });
  }

  const data = parsed.data;

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE reservations
       SET rider_first_name = ?, rider_last_name = ?, pickup_location = ?, dropoff_location = ?,
           pickup_time = ?, passenger_count = ?, phone_number = ?, special_requirements = ?
       WHERE id = ?`,
      [
        data.riderFirstName,
        data.riderLastName,
        data.pickupLocation,
        data.dropoffLocation,
        new Date(data.pickupTime).toISOString().slice(0, 19).replace('T', ' '),
        data.passengerCount,
        data.phoneNumber,
        JSON.stringify(data.specialRequirements ?? []),
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    return res.status(200).json({ id: Number(id), ...data });
  } catch (error) {
    console.log('Failed to update reservation', error);
    console.error('Failed to update reservation', error);
    return res.status(500).json({ message: 'Failed to update reservation.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});
