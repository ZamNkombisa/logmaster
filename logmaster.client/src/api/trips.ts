import { apiClient } from './client';
import type { Trip, LogEntry, DashboardSummary, CreateTripPayload } from '../types';

export async function getTrips(): Promise<Trip[]> {
  const { data } = await apiClient.get<Trip[]>('/trips');
  return data;
}

export async function createTrip(payload: CreateTripPayload): Promise<Trip> {
  const { data } = await apiClient.post<Trip>('/trips', payload);
  return data;
}

export async function getTrip(id: number): Promise<Trip> {
  const { data } = await apiClient.get<Trip>(`/trips/${id}`);
  return data;
}

export async function getLogEntries(tripId: number): Promise<LogEntry[]> {
  const { data } = await apiClient.get<LogEntry[]>(`/trips/${tripId}/log-entries`);
  return data;
}

export async function createLogEntry(
  tripId: number,
  entry: Pick<LogEntry, 'status' | 'startTime' | 'endTime'>
): Promise<LogEntry> {
  const { data } = await apiClient.post<LogEntry>(`/trips/${tripId}/log-entries`, entry);
  return data;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummary>('/dashboard/summary');
  return data;
}

export async function completeTrip(id: number): Promise<void> {
  await apiClient.put(`/trips/${id}/complete`);
}