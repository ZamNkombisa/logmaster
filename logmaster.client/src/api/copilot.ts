import { apiClient } from './client';

export async function askCopilot(tripId: number, question: string): Promise<string> {
  const { data } = await apiClient.post<{ answer: string }>(`/trips/${tripId}/copilot/ask`, { question });
  return data.answer;
}