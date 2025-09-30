import { createFileRoute } from '@tanstack/react-router';
import { UpdateProfileNameCard } from '@/components/update-profile-name-card';
import { UserInvitesCard } from '@/components/user-invites-card';

export const Route = createFileRoute('/_authenticated/settings/profile')({
  component: ProfileSettings,
});

function ProfileSettings() {
  return (
    <div className="pt-6 space-y-6">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
          <p className="text-muted-foreground text-sm">
            Manage your profile and preferences
          </p>
        </div>
      </div>

      <UpdateProfileNameCard />

      <UserInvitesCard />
    </div>
  );
}
