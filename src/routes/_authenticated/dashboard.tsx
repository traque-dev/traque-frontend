import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { SettingsLinear } from '@/components/icons';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { Button } from '@/components/ui/button';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAwsWafClient } from '@/hooks/use-aws-waf-client';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
  pendingComponent: () => null,
});

function Dashboard() {
  useAwsWafClient();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="px-4 md:px-6 lg:px-8 @container">
          <div className="w-full max-w-6xl mx-auto">
            {/* border-b min-h-20 */}
            <header className="flex flex-wrap gap-3 py-2 shrink-0 items-center transition-all ease-linear border-b">
              <div className="flex flex-1 items-center gap-2">
                <SidebarTrigger className="-ms-1" />
                <div className="max-lg:hidden flex flex-row flex-1 items-center justify-end">
                  {/* <Separator
                    orientation="vertical"
                    className="me-2 data-[orientation=vertical]:h-4"
                  /> */}
                  {/* <Breadcrumb>
                    <BreadcrumbList>
                      {breadcrumbs.map((breadcrumb, index) => (
                        <Fragment key={breadcrumb.path}>
                          <BreadcrumbItem key={breadcrumb.path}>
                            <BreadcrumbLink href={breadcrumb.path}>
                              {breadcrumb.title}
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                          {index < breadcrumbs.length - 1 && (
                            <BreadcrumbSeparator className="hidden md:block" />
                          )}
                        </Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb> */}

                  <div className="flex items-center gap-1">
                    <a
                      href="https://www.traque.dev/docs/introduction"
                      target="_blank"
                    >
                      <Button variant="ghost">Docs</Button>
                    </a>
                    <Link to="/settings/profile">
                      <Button variant="ghost" size="icon">
                        <SettingsLinear />
                      </Button>
                    </Link>
                  </div>
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
