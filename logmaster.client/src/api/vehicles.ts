import { apiClient } from './client';
import type { Vehicle } from '../types';

export interface CreateVehiclePayload {
  vehicleNumber: string;
  licensePlate?: string;
}

export async function getVehicles(): Promise<Vehicle[]> {
  const { data } = await apiClient.get<Vehicle[]>('/vehicles');
  return data;
}

export async function createVehicle(payload: CreateVehiclePayload): Promise<Vehicle> {
  const { data } = await apiClient.post<Vehicle>('/vehicles', payload);
  return data;
}

export async function deleteVehicle(id: number): Promise<void> {
  await apiClient.delete(`/vehicles/${id}`);
}