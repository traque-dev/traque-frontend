import {
  createFileRoute,
  Outlet,
  redirect,
  useRouterState,
} from '@tanstack/react-router';
import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { auth } from '@/lib/auth';

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
  pendingComponent: () => null,
  beforeLoad: async () => {
    const { data: session } = await auth.getSession();
    if (!session) {
      throw redirect({ to: '/auth/login' });
    }

    const { data: activeOrganization } =
      await auth.organization.getFullOrganization();

    if (!activeOrganization) {
      const { data: organizations } = await auth.organization.list();
      if (organizations && organizations.length > 0) {
        await auth.organization.setActive({
          organizationId: organizations[0].id,
        });
      }
    }
  },
});

function Dashboard() {
  const { matches } = useRouterState();

  const breadcrumbs = matches
    .filter((match) => match.loaderData?.title)
    .map(({ pathname, loaderData }) => {
      return {
        title: loaderData?.title,
        path: pathname,
      };
    });

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
                <div className="max-lg:hidden lg:contents">
                  <Separator
                    orientation="vertical"
                    className="me-2 data-[orientation=vertical]:h-4"
                  />
                  <Breadcrumb>
                    <BreadcrumbList>
                      {breadcrumbs.map((breadcrumb, index) => (
                        <>
                          <BreadcrumbItem key={breadcrumb.path}>
                            <BreadcrumbLink href={breadcrumb.path}>
                              {breadcrumb.title}
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                          {index < breadcrumbs.length - 1 && (
                            <BreadcrumbSeparator className="hidden md:block" />
                          )}
                        </>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
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
