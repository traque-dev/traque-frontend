import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import type { Organization } from 'better-auth/plugins/organization';
import { ChevronsUpDown, Plus } from 'lucide-react';
import { SubscriptionPlanBadge } from '@/components/billing/subscription-plan-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { auth } from '@/lib/auth';
import { router } from '@/main';

export function OrganizationSwitcher() {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: organizations, isPending: isPendingOrganizations } =
    auth.useListOrganizations();

  const { data: activeOrganization } = auth.useActiveOrganization();

  const onOrganizationSelect = async (organization: Organization) => {
    if (activeOrganization?.id === organization.id) {
      return;
    }

    await auth.organization.setActive({
      organizationId: organization.id,
    });
    queryClient.clear();
    router.clearCache();
    await router.invalidate();
    navigate({
      to: '/dashboard',
    });
  };

  if (!isPendingOrganizations && organizations?.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="group h-auto items-center gap-3 rounded-lg border border-dashed p-3 text-left hover:border-primary"
            tooltip="Create organization"
            aria-label="Create organization"
            onClick={() =>
              navigate({
                to: '/onboarding',
              })
            }
          >
            <div className="bg-sidebar-accent text-sidebar-accent-foreground/80 flex size-8 items-center justify-center rounded-md">
              <Plus className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-medium">Create organization</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar>
                <AvatarImage src={activeOrganization?.logo ?? undefined} />
                <AvatarFallback>
                  {activeOrganization?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {/* <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <img
                  src={activeOrganization?.logo ?? undefined}
                  className="size-4"
                />
              </div> */}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium flex items-center gap-2">
                  {activeOrganization?.name}
                  <SubscriptionPlanBadge />
                </span>
                {/* <span className="truncate text-xs">
                  @{activeOrganization?.slug}
                </span> */}
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Organizations
            </DropdownMenuLabel>
            {organizations?.map((organization) => (
              <DropdownMenuItem
                key={organization.id}
                onClick={async () => {
                  onOrganizationSelect(organization);
                }}
                className="gap-2 p-2"
              >
                <Avatar>
                  <AvatarImage src={organization.logo ?? undefined} />
                  <AvatarFallback>{organization.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {organization.name}
                {/* <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut> */}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() =>
                navigate({
                  to: '/onboarding',
                })
              }
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                New organization
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
