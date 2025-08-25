import { useMutation } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';
import { useTheme } from '@/components/theme-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { auth } from '@/lib/auth';
import { HamburgerMenuLinear } from './icons/hamburger-menu-linear';
import { Logout3Linear } from './icons/logout-3-linear';
import { MoonLinear } from './icons/moon-linear';
import { Sun2Linear } from './icons/sun-2-linear';
import { UserRoundedLinear } from './icons/user-rounded-linear';

export function NavUser() {
  const router = useRouter();
  const { isMobile } = useSidebar();

  const { data: session } = auth.useSession();

  const { setTheme, theme } = useTheme();

  const user = session?.user;

  useEffect(() => {
    if (session?.session) return;

    router.invalidate();
  }, [session]);

  const { mutate: signOut } = useMutation({
    mutationFn: async () => {
      const { data, error } = await auth.signOut();

      if (error) {
        throw new Error(error.message ?? 'Something went wrong');
      }

      return data;
    },
  });

  const avatarFallback = useMemo(() => {
    return user?.name?.split(' ')[0]?.[0] ?? '';
  }, [user]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="in-data-[state=expanded]:size-6 transition-[width,height] duration-200 ease-in-out">
                <AvatarImage src={user?.image ?? undefined} alt={user?.name} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight ms-1">
                <span className="truncate font-medium">{user?.name}</span>
              </div>
              <div className="size-8 rounded-lg flex items-center justify-center bg-sidebar-accent/50 in-[[data-slot=dropdown-menu-trigger]:hover]:bg-transparent">
                <HamburgerMenuLinear className="text-muted-foreground/70 size-4 opacity-60" />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <Link to="/settings/account">
              <DropdownMenuItem className="gap-3 px-1">
                <UserRoundedLinear className="text-muted-foreground/70" />
                <span>Account</span>
              </DropdownMenuItem>
            </Link>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-3 px-1">
                {theme === 'light' ? (
                  <Sun2Linear className="text-muted-foreground/70 size-[17px]" />
                ) : (
                  <MoonLinear className="text-muted-foreground/70 size-[17px]" />
                )}
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={(value) =>
                    setTheme(value as 'light' | 'dark' | 'system')
                  }
                >
                  <DropdownMenuRadioItem value="light">
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem
              variant="destructive"
              className="gap-3 px-1"
              onClick={() => signOut()}
            >
              <Logout3Linear className="text-muted-foreground/70" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
