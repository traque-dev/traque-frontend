import type { Base } from '@/types/base';
import type { Platform } from '@/types/platform';

export type Project = Base & {
  name: string;
  description?: string;
  platform?: Platform;
  apiKey?: string;
};
