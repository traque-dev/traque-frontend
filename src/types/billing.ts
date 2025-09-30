import type { Base } from '@/types/base';

export type Plan = 'free' | 'plus';

export type Source = 'STRIPE' | 'POLAR';

export type Subscription = Base & {
  plan: Plan;
  referenceId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  polarCustomerId?: string;
  polarSubscriptionId?: string;
  status: string;
  periodStart?: string;
  periodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  seats?: number;
  trialStart?: string;
  trialEnd?: string;
  source: Source;
};
