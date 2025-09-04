import type { Conversation } from '@/types/ai';
import { axios } from '../axios';

export async function getConversations() {
  const url = '/api/v1/ai/agents/conversations';

  const { data } = await axios.get<Conversation[]>(url);

  return data;
}

export async function getConversation(id: string) {
  const url = `/api/v1/ai/agents/conversations/${id}`;

  const { data } = await axios.get<Conversation>(url);

  return data;
}

export async function deleteConversation(id: string) {
  const url = `/api/v1/ai/agents/conversations/${id}`;

  await axios.delete(url);
}
