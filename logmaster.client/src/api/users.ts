import { apiClient } from './client';
import type { AppUser, Role } from '../types';

export async function getUsers(): Promise<AppUser[]> {
  const { data } = await apiClient.get<AppUser[]>('/users');
  return data;
}

export async function updateUserRole(userId: string, role: Role): Promise<void> {
  await apiClient.put(`/users/${userId}/role`, { role });
}