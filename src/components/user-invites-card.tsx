import { useMutation, useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import type { Invitation } from 'better-auth/plugins/organization';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { match, P } from 'ts-pattern';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { dayjs } from '@/lib/dayjs';

export function UserInvitesCard() {
  const { data: session } = auth.useSession();

  const {
    data: invites,
    isPending,
    refetch: refetchInvites,
  } = useQuery({
    queryKey: ['user-invites', session?.user.id],
    queryFn: async () => {
      const { data } = await auth.organization.listUserInvitations();
      return data?.filter((invite) => invite.status === 'pending');
    },
  });

  const { mutate: acceptInvitation, isPending: isAcceptingInvitation } =
    useMutation({
      mutationFn: async (invitationId: string) => {
        return auth.organization.acceptInvitation({ invitationId });
      },
      onSuccess: async () => {
        toast.success('Invitation accepted');
        await refetchInvites();
      },
      onError: () => {
        toast.error('Failed to accept invitation');
      },
    });

  const { mutate: rejectInvitation, isPending: isRejectingInvitation } =
    useMutation({
      mutationFn: async (invitationId: string) => {
        return auth.organization.rejectInvitation({ invitationId });
      },
      onSuccess: async () => {
        toast.success('Invitation rejected');
        await refetchInvites();
      },
      onError: () => {
        toast.error('Failed to reject invitation');
      },
    });

  const columns: ColumnDef<Invitation>[] = useMemo(() => {
    return [
      {
        header: 'Email',
        accessorKey: 'email',
        cell: ({ row }) => row.original.email,
      },
      {
        header: 'Role',
        accessorKey: 'role',
        cell: ({ row }) => <Badge variant="outline">{row.original.role}</Badge>,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === 'pending'
                ? 'secondary'
                : row.original.status === 'accepted'
                  ? 'default'
                  : row.original.status === 'rejected'
                    ? 'destructive'
                    : 'outline'
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        header: 'Expires',
        accessorKey: 'expiresAt',
        cell: ({ row }) =>
          row.original.expiresAt
            ? dayjs(row.original.expiresAt).format('LL LT')
            : '—',
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              onClick={() => acceptInvitation(row.original.id)}
              disabled={
                isAcceptingInvitation ||
                isRejectingInvitation ||
                row.original.status !== 'pending'
              }
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => rejectInvitation(row.original.id)}
              disabled={
                isAcceptingInvitation ||
                isRejectingInvitation ||
                row.original.status !== 'pending'
              }
            >
              Reject
            </Button>
          </div>
        ),
      },
    ];
  }, [isAcceptingInvitation, isRejectingInvitation]);

  return (
    <Card className="w-full shadow-none">
      <CardHeader>
        <CardTitle>Invites</CardTitle>
      </CardHeader>

      <CardContent>
        {match({
          isPending,
          invites,
        })
          .with({ isPending: true }, () => (
            <div className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ))
          .with({ invites: [] }, () => (
            <div className="flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                There are no pending invites.
              </p>
            </div>
          ))
          .with({ invites: P.array() }, () => (
            <DataTable
              className="border-none [&_div]:border-none"
              columns={columns}
              data={invites ?? []}
            />
          ))
          .otherwise(() => null)}
      </CardContent>
    </Card>
  );
}
