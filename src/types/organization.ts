import type { Base } from '@/types/base';

export type Organization = Base & {
  name: string;
  slug: string;
  logo: string;
  metadata: string;
};
