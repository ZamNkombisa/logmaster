import { apiClient } from './client';
import type { ComplianceFlag } from '../types';

export async function getComplianceFlags(tripId: number): Promise<ComplianceFlag[]> {
  const { data } = await apiClient.get<ComplianceFlag[]>(`/trips/${tripId}/compliance-flags`);
  return data;
}

export async function evaluateCompliance(tripId: number): Promise<ComplianceFlag[]> {
  const { data } = await apiClient.post<ComplianceFlag[]>(`/trips/${tripId}/evaluate-compliance`);
  return data;
}