import { apiClient } from './client';
import type { Driver } from '../types';

export interface CreateDriverPayload {
  fullName: string;
  licenseNumber: string;
}

export async function getDrivers(): Promise<Driver[]> {
  const { data } = await apiClient.get<Driver[]>('/drivers');
  return data;
}

export async function createDriver(payload: CreateDriverPayload): Promise<Driver> {
  const { data } = await apiClient.post<Driver>('/drivers', payload);
  return data;
}

export async function deleteDriver(id: number): Promise<void> {
  await apiClient.delete(`/drivers/${id}`);
}