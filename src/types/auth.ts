import type { Member } from 'better-auth/plugins/organization';

export type MemberWithUser = Member & {
  user: {
    email: string;
    name: string;
    image?: string;
  };
};
