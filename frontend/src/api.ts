import type { CreateReservationPayload, Reservation } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Request failed.' }));
    const extra =
      Array.isArray(body.errors) && body.errors.length > 0
        ? `: ${body.errors.join(' ')}`
        : '';
    throw new Error((body.message ?? 'Request failed.') + extra);
  }

  return response.json() as Promise<T>;
}

export async function getReservations(): Promise<Reservation[]> {
  const response = await fetch(`${API_BASE_URL}/reservations`);
  return parseJson<Reservation[]>(response);
}

export async function createReservation(payload: CreateReservationPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  await parseJson(response);
}

export async function updateReservation(id: number, payload: CreateReservationPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  await parseJson(response);
}

export async function deleteReservation(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
    method: 'DELETE'
  });

  await parseJson(response);
}
