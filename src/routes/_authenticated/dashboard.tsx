import {
  createFileRoute,
  Outlet,
  // useRouterState,
} from '@tanstack/react-router';
// import { Fragment } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbSeparator,
// } from '@/components/ui/breadcrumb';
// import { Separator } from '@/components/ui/separator';
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
  // const { matches } = useRouterState();

  // const breadcrumbs = matches
  //   .filter((match) => match.loaderData?.title)
  //   .map(({ pathname, loaderData }) => {
  //     return {
  //       title: loaderData?.title,
  //       path: pathname,
  //     };
  //   });

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
