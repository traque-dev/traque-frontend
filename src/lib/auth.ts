import { organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { config } from '@/config';

export const auth = createAuthClient({
  baseURL: config.api.url,
  plugins: [organizationClient()],
});

export type Session = typeof auth.$Infer.Session;
export type User = (typeof auth.$Infer.Session)['user'];
