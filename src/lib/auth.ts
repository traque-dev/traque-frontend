import { polarClient } from '@polar-sh/better-auth';
import { organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { config } from '@/config';

export const auth = createAuthClient({
  baseURL: config.api.url,
  plugins: [organizationClient(), polarClient()],
});

export type Session = typeof auth.$Infer.Session;
export type User = Session['user'];
