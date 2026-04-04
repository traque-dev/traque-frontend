import { Link, useLocation } from '@tanstack/react-router';
import { Activity, Home } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { SVGProps } from 'react';
import { useState } from 'react';
import { ChatsSidebarItem } from '@/components/chats-sidebar-item';
import {
  BoxMinimalisticLinear,
  ChartSquareLinear,
  CodeLinear,
  DangerLinear,
  WidgetAddLinear,
} from '@/components/icons';
import { ChatRoundLineLinear } from '@/components/icons/chat-round-line-linear';
import { GlobalLinearIcon } from '@/components/icons/global-linear';
import { ShieldWarningLinearIcon } from '@/components/icons/shield-warning-linear';
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

type Tab = 'general' | 'uptime';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', icon: Home },
  { id: 'uptime', label: 'Uptime', icon: Activity },
];

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
  navUptime: [
    {
      title: 'Uptime',
      items: [
        {
          key: 'incidents',
          title: 'Incidents',
          url: '/dashboard/uptime/incidents',
          icon: ShieldWarningLinearIcon,
        },
        {
          key: 'uptime',
          title: 'Monitors',
          url: '/dashboard/uptime/monitors',
          icon: GlobalLinearIcon,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const navSections = activeTab === 'general' ? data.navMain : data.navUptime;

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="h-16 max-md:mt-2 mb-2 justify-center">
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent className="-mt-2">
        <div className="px-3 mb-1 group-data-[collapsible=icon]:hidden">
          <div className="relative flex items-center bg-muted/60 rounded-lg p-0.5 gap-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md z-10 transition-colors cursor-pointer"
                  style={{
                    color: isActive
                      ? 'hsl(var(--foreground))'
                      : 'hsl(var(--muted-foreground))',
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="tab-pill"
                      className="absolute inset-0 bg-background rounded-md shadow-sm"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 35,
                      }}
                    />
                  )}
                  <Icon size={13} className="relative z-10 shrink-0" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {navSections.map((item) => (
              <SidebarGroup key={item.title}>
                <SidebarGroupLabel className="uppercase text-muted-foreground/65">
                  {item.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((navItem: SidebarItem) => {
                      const isChat = navItem.key === 'chat';

                      const isActive =
                        navItem.url !== undefined &&
                        (location.pathname === navItem.url ||
                          (isChat &&
                            location.pathname.startsWith('/dashboard/chat')));

                      if (isChat) {
                        return (
                          <ChatsSidebarItem
                            key={navItem.key}
                            isActive={isActive}
                          />
                        );
                      }

                      if (!navItem.url) {
                        return (
                          <SidebarMenuItem key={navItem.title}>
                            <SidebarMenuButton
                              className="group/menu-button group-data-[collapsible=icon]:px-[7px]! font-medium gap-3 h-9 [&>svg]:size-auto text-muted-foreground/65 cursor-not-allowed opacity-50"
                              tooltip={navItem.title}
                              disabled
                            >
                              {navItem.icon && (
                                <navItem.icon
                                  height={22}
                                  width={22}
                                  aria-hidden="true"
                                />
                              )}
                              <span>{navItem.title}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
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
          </motion.div>
        </AnimatePresence>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
