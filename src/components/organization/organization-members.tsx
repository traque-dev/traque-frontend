'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import type { Invitation } from 'better-auth/plugins/organization';
import { Loader2, Trash2, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { match, P } from 'ts-pattern';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/auth';
import { dayjs } from '@/lib/dayjs';
import type { MemberWithUser } from '@/types/auth';

export function OrganizationMembers() {
  const { data: activeOrganization } = auth.useActiveOrganization();
  const { data: session } = auth.useSession();

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  const {
    data: members,
    isPending: isMembersLoading,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: ['organization-members', activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization?.id) return [];
      const { data } = await auth.organization.getFullOrganization();
      return (data?.members as MemberWithUser[]) ?? [];
    },
    enabled: !!activeOrganization?.id,
  });

  const {
    data: invitations,
    isPending: isInvitationsLoading,
    refetch: refetchInvitations,
  } = useQuery({
    queryKey: ['organization-invitations', activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization?.id) return [];
      const { data } = await auth.organization.listInvitations();
      return (data ?? []).filter((inv) => inv.status === 'pending');
    },
    enabled: !!activeOrganization?.id,
  });

  const { mutate: inviteMember, isPending: isInviting } = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      if (!activeOrganization?.id) throw new Error('No organization selected');

      return auth.organization.inviteMember({
        email: data.email,
        role: data.role as 'member' | 'admin' | 'owner',
      });
    },
    onSuccess: async () => {
      toast.success('Invitation sent');
      setInviteEmail('');
      setInviteRole('member');
      setIsInviteDialogOpen(false);
      await refetchInvitations();
    },
    onError: () => {
      toast.error('Failed to send invitation');
    },
  });

  const { mutate: removeMember, isPending: isRemoving } = useMutation({
    mutationFn: async (memberIdOrEmail: string) => {
      if (!activeOrganization?.id) {
        throw new Error('No organization selected');
      }

      return auth.organization.removeMember({
        memberIdOrEmail,
      });
    },
    onSuccess: async () => {
      toast.success('Member removed');
      await refetchMembers();
    },
    onError: () => {
      toast.error('Failed to remove member');
    },
  });

  const { mutate: revokeInvitation, isPending: isRevoking } = useMutation({
    mutationFn: async (invitationId: string) => {
      if (!activeOrganization?.id) {
        throw new Error('No organization selected');
      }

      return auth.organization.cancelInvitation({
        invitationId,
      });
    },
    onSuccess: async () => {
      toast.success('Invitation revoked');
      await refetchInvitations();
    },
    onError: () => {
      toast.error('Failed to revoke invitation');
    },
  });

  const memberColumns: ColumnDef<MemberWithUser>[] = useMemo(() => {
    return [
      {
        header: 'Name',
        accessorKey: 'user.name',
        cell: ({ row }) => row.original.user?.name || '—',
      },
      {
        header: 'Email',
        accessorKey: 'user.email',
        cell: ({ row }) => row.original.user?.email || '—',
      },
      {
        header: 'Role',
        accessorKey: 'role',
        cell: ({ row }) => <Badge variant="outline">{row.original.role}</Badge>,
      },
      {
        header: 'Joined',
        accessorKey: 'createdAt',
        cell: ({ row }) =>
          row.original.createdAt
            ? dayjs(row.original.createdAt).format('LL')
            : '—',
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => {
          const isCurrentUser = row.original.userId === session?.user?.id;
          return (
            <div className="flex items-center justify-end gap-2">
              {!isCurrentUser && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeMember(row.original.id)}
                  disabled={isRemoving}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      },
    ];
  }, [session?.user?.id, isRemoving]);

  const invitationColumns: ColumnDef<Invitation>[] = useMemo(() => {
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
        header: 'Sent',
        accessorKey: 'expiresAt',
        cell: ({ row }) =>
          row.original.expiresAt
            ? dayjs(row.original.expiresAt).subtract(30, 'days').format('LL LT')
            : '—',
      },
      {
        header: 'Expires',
        accessorKey: 'expiresAt',
        cell: ({ row }) =>
          row.original.expiresAt
            ? dayjs(row.original.expiresAt).format('LL')
            : '—',
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => revokeInvitation(row.original.id)}
              disabled={isRevoking}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ];
  }, [isRevoking]);

  const handleInviteSubmit = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email');
      return;
    }

    inviteMember({ email: inviteEmail, role: inviteRole });
  };

  return (
    <div className="space-y-6 mb-6">
      <Card className="w-full shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Members</CardTitle>
          <Button
            size="sm"
            onClick={() => setIsInviteDialogOpen(true)}
            disabled={!activeOrganization}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite member
          </Button>
        </CardHeader>

        <CardContent>
          {match({ isMembersLoading, members })
            .with({ isMembersLoading: true }, () => (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ))
            .with({ members: [] }, () => (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">No members yet.</p>
              </div>
            ))
            .with({ members: P.array() }, () => (
              <DataTable
                className="border-none [&_div]:border-none"
                columns={memberColumns}
                data={members ?? []}
              />
            ))
            .otherwise(() => null)}
        </CardContent>
      </Card>

      <Card className="w-full shadow-none">
        <CardHeader>
          <CardTitle>Pending invitations</CardTitle>
        </CardHeader>

        <CardContent>
          {match({ isInvitationsLoading, invitations })
            .with({ isInvitationsLoading: true }, () => (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ))
            .with({ invitations: [] }, () => (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">
                  No pending invitations.
                </p>
              </div>
            ))
            .with({ invitations: P.array() }, () => (
              <DataTable
                className="border-none [&_div]:border-none"
                columns={invitationColumns}
                data={invitations ?? []}
              />
            ))
            .otherwise(() => null)}
        </CardContent>
      </Card>

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your organization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="member@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={isInviting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
              disabled={isInviting}
            >
              Cancel
            </Button>
            <Button onClick={handleInviteSubmit} disabled={isInviting}>
              {isInviting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
