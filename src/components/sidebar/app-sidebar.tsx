import { Link, useLocation } from '@tanstack/react-router';
import type { SVGProps } from 'react';
import { ChatsSidebarItem } from '@/components/chats-sidebar-item';
import {
  BoxMinimalisticLinear,
  ChartSquareLinear,
  CodeLinear,
  DangerLinear,
  WidgetAddLinear,
} from '@/components/icons';
import { ChatRoundLineLinear } from '@/components/icons/chat-round-line-linear';
import { NavUser } from '@/components/nav-user';
import { OrganizationSwitcher } from '@/components/organization/organization-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

type SidebarItem = {
  key?: string;
  title: string;
  url: string;
  icon?: React.JSXElementConstructor<SVGProps<SVGSVGElement>>;
};

const data = {
  navMain: [
    {
      title: 'General',
      items: [
        {
          key: 'dashboard',
          title: 'Dashboard',
          url: '/dashboard',
          icon: ChartSquareLinear,
        },
        {
          key: 'projects',
          title: 'Projects',
          url: '/dashboard/projects',
          icon: BoxMinimalisticLinear,
        },
        {
          key: 'issues',
          title: 'Issues',
          url: '/dashboard/issues',
          icon: DangerLinear,
        },
        {
          key: 'events',
          title: 'Events',
          url: '/dashboard/events',
          icon: CodeLinear,
        },
        {
          key: 'chat',
          title: 'Chat',
          url: '/dashboard/chat',
          icon: ChatRoundLineLinear,
        },
        {
          key: 'integrations',
          title: 'Integrations',
          url: '/dashboard/integrations',
          icon: WidgetAddLinear,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="h-16 max-md:mt-2 mb-2 justify-center">
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent className="-mt-2">
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel className="uppercase text-muted-foreground/65">
              {item.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((navItem: SidebarItem) => {
                  const isChat = navItem.key === 'chat';

                  const isActive =
                    location.pathname === navItem.url ||
                    (isChat && location.pathname.startsWith('/dashboard/chat'));

                  if (isChat) {
                    return (
                      <ChatsSidebarItem key={navItem.key} isActive={isActive} />
                    );
                  }

                  return (
                    <SidebarMenuItem key={navItem.title}>
                      <SidebarMenuButton
                        asChild={true}
                        className="group/menu-button group-data-[collapsible=icon]:px-[7px]! font-medium gap-3 h-9 [&>svg]:size-auto"
                        tooltip={navItem.title}
                        isActive={isActive}
                      >
                        <Link to={navItem.url}>
                          {navItem.icon && (
                            <navItem.icon
                              className="text-muted-foreground/65 group-data-[active=true]/menu-button:text-primary"
                              height={22}
                              width={22}
                              aria-hidden="true"
                            />
                          )}
                          <span>{navItem.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
