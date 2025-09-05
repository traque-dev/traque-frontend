import type { UIMessage } from 'ai';

export type Conversation = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  projectId: string;
  messages: UIMessage[];
};
