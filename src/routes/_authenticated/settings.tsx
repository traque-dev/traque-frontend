import { createFileRoute, Outlet } from '@tanstack/react-router';
import { SettingsSidebar } from '@/components/sidebar/settings-sidebar';
import { Button } from '@/components/ui/button';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsLayout,
});

function SettingsLayout() {
  return (
    <SidebarProvider>
      <SettingsSidebar />
      <SidebarInset>
        <div className="px-4 md:px-6 lg:px-8 @container">
          <div className="w-full max-w-6xl mx-auto">
            <header className="flex flex-wrap gap-3 py-2 shrink-0 items-center transition-all ease-linear border-b">
              <div className="flex flex-1 items-center gap-2">
                <SidebarTrigger className="-ms-1" />
                <div className="max-lg:hidden flex flex-row flex-1 items-center justify-end">
                  <a
                    href="https://www.traque.dev/docs/introduction"
                    target="_blank"
                  >
                    <Button variant="ghost">Docs</Button>
                  </a>
                </div>
              </div>
            </header>
            <div className="overflow-hidden">
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
