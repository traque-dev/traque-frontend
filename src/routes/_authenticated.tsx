import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    const session = context.session?.session;

    if (!session) {
      throw redirect({ to: '/auth/login' });
    }
  },
});
