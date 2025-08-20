import type { Base } from '@/types/base';

export type Event = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  properties: Record<string, string>;
};

export type EventNotificationTrigger = Base & {
  onEvent: string;
  mobilePush?: boolean;
  discord?: boolean;
  email?: boolean;
};
