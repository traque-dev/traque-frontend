import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { auth } from '@/lib/auth';
import reportWebVitals from '@/reportWebVitals';
import { routeTree } from './routeTree.gen';
import './styles.css';
import { getActiveOrganizationQueryOptions } from '@/api/organizations/options';

export const queryClient = new QueryClient();

export const router = createRouter({
  routeTree,
  context: {
    session: null,
    user: null,
    getActiveOrganization: async () => {
      return queryClient.ensureQueryData(getActiveOrganizationQueryOptions());
    },
    queryClient,
  },
  defaultPreload: false,
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system">
          <Toaster />
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

function AppRouterProvider() {
  const { data: session, isPending: isSessionPending } = auth.useSession();

  if (isSessionPending) {
    // TODO: add a loading state
    return null;
  }

  return (
    <RouterProvider
      router={router}
      context={{
        session: session?.session ?? null,
        user: session?.user ?? null,
      }}
    />
  );
}

function App() {
  return (
    <Providers>
      <AppRouterProvider />
    </Providers>
  );
}

const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
