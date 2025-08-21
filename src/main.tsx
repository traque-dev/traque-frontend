import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { routeTree } from './routeTree.gen';

import './styles.css';
import { Toaster } from 'sonner';
import { auth } from './lib/auth.ts';
import reportWebVitals from './reportWebVitals.ts';

export const queryClient = new QueryClient();

export const router = createRouter({
  routeTree,
  context: {
    session: null,
    user: null,
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

function App() {
  const { data: session, isPending } = auth.useSession();

  if (isPending) return null;

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <div>
          <RouterProvider
            router={router}
            context={{
              session: session?.session ?? null,
              user: session?.user ?? null,
            }}
          />
          <Toaster />
        </div>
      </QueryClientProvider>
    </StrictMode>
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
