import { useNavigate } from '@tanstack/react-router';
import type { Organization } from 'better-auth/plugins/organization';
import { ChevronsUpDown, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
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

  const { data: organizations } = auth.useListOrganizations();

  const { data: activeOrganization } = auth.useActiveOrganization();

  const onOrganizationSelect = async (organization: Organization) => {
    if (activeOrganization?.id === organization.id) {
      return;
    }

    await auth.organization.setActive({
      organizationId: organization.id,
    });
    router.invalidate();
    navigate({
      to: '/dashboard',
    });
  };

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
                <span className="truncate font-medium">
                  {activeOrganization?.name}
                </span>
                <span className="truncate text-xs">
                  @{activeOrganization?.slug}
                </span>
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
            {organizations?.map((organization, index) => (
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
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
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
