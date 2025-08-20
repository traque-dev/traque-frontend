import { Link, useLocation } from '@tanstack/react-router';
import type { SVGProps } from 'react';

import { NavUser } from '@/components/nav-user';
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
import {
  BoxMinimalisticLinear,
  ChartSquareLinear,
  CodeLinear,
  DangerLinear,
  FlameLinear,
  WidgetAddLinear,
} from './icons';
import { OrganizationSwitcher } from './organization-switcher';

type SidebarItem = {
  title: string;
  url: string;
  icon?: React.JSXElementConstructor<SVGProps<SVGSVGElement>>;
  isActive?: boolean;
};

const data = {
  navMain: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: ChartSquareLinear,
          isActive: true,
        },
        {
          title: 'Projects',
          url: '/dashboard/projects',
          icon: BoxMinimalisticLinear,
        },
        {
          title: 'Issues',
          url: '/dashboard/issues',
          icon: DangerLinear,
        },
        {
          title: 'Exceptions',
          url: '/dashboard/exceptions',
          icon: FlameLinear,
        },
        {
          title: 'Events',
          url: '/dashboard/events',
          icon: CodeLinear,
        },
        {
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
                {item.items.map((item: SidebarItem) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild={true}
                      className="group/menu-button group-data-[collapsible=icon]:px-[7px]! font-medium gap-3 h-9 [&>svg]:size-auto"
                      tooltip={item.title}
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>
                        {item.icon && (
                          <item.icon
                            className="text-muted-foreground/65 group-data-[active=true]/menu-button:text-primary"
                            height={22}
                            width={22}
                            aria-hidden="true"
                          />
                        )}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
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
