import { Link, useLocation } from '@tanstack/react-router';
import type { SVGProps } from 'react';
import { ChatsSidebarItem } from '@/components/chats-sidebar-item';
import { ChartSquareLinear, UserRoundedLinear } from '@/components/icons';
import { BuildingsLinear } from '@/components/icons/buildings-linear';
import { CardLinear } from '@/components/icons/card-linear';
import { NavUser } from '@/components/nav-user';
import { OrganizationSwitcher } from '@/components/organization/organization-switcher';
import { Button } from '@/components/ui/button';
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
import { config } from '@/config';

type SidebarItem = {
  key?: string;
  title: string;
  url: string;
  icon?: React.JSXElementConstructor<SVGProps<SVGSVGElement>>;
};

const data = {
  navMain: [
    {
      title: 'Account',
      items: [
        {
          key: 'profile',
          title: 'Profile',
          url: '/settings/profile',
          icon: UserRoundedLinear,
        },
      ],
    },
    {
      title: 'Organization',
      items: [
        {
          key: 'organization',
          title: 'Organization',
          url: '/settings/organization',
          icon: BuildingsLinear,
        },
        config.deployment.isTraqueCloud && {
          key: 'billing',
          title: 'Billing',
          url: '/settings/organization/billing',
          icon: CardLinear,
        },
      ].filter(Boolean),
    },
  ],
};

export function SettingsSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
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
        <Link to="/dashboard">
          <Button variant="secondary" size="sm" className="w-full">
            <ChartSquareLinear />
            Back to dashboard
          </Button>
        </Link>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
