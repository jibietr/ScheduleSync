import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Templates from "@/pages/templates";
import CreateTemplate from "@/pages/create-template";
import BookingPage from "@/pages/booking-page";
import ConfirmationPage from "@/pages/confirmation-page";
import { Sidebar } from "@/components/common/sidebar";
import { Header } from "@/components/common/header";

function Router() {
  return (
    <Switch>
      {/* Main app routes */}
      <Route path="/" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/templates" component={Templates} />
      <Route path="/create-template" component={CreateTemplate} />

      {/* Public booking routes */}
      <Route path="/:username/:slug" component={BookingPage} />
      <Route path="/confirmation/:bookingId" component={ConfirmationPage} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  // Routes that don't need the app layout (public pages)
  const path = window.location.pathname;
  // Check if path matches /username/slug or /confirmation/id pattern (public pages)
  const isPublicPage = /^\/[^/]+\/[^/]+$/.test(path) || path.startsWith('/confirmation/');

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <Router />
      </AppLayout>
    </QueryClientProvider>
  );
}

export default App;
