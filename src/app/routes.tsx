import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "./AppShell";
import { RequireSession } from "./RequireSession";
import { SessionProvider } from "./SessionContext";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const UseCasesPage = lazy(() => import("@/pages/UseCasesPage"));
const WorkflowsPage = lazy(() => import("@/pages/WorkflowsPage"));
const MappingsPage = lazy(() => import("@/pages/MappingsPage"));
const SimulatorPage = lazy(() => import("@/pages/SimulatorPage"));
const DecisionEventsPage = lazy(() => import("@/pages/DecisionEventsPage"));
const ReviewQueuePage = lazy(() => import("@/pages/ReviewQueuePage"));
const NoticesPage = lazy(() => import("@/pages/NoticesPage"));
const AuditReportPage = lazy(() => import("@/pages/AuditReportPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="w-6 h-6 border-2 border-[var(--line)] border-t-[var(--accent)] rounded-full animate-spin" />
    </div>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <SessionProvider>
        <Wrap><LoginPage /></Wrap>
      </SessionProvider>
    ),
  },
  {
    element: (
      <SessionProvider>
        <RequireSession>
          <AppShell />
        </RequireSession>
      </SessionProvider>
    ),
    children: [
      { path: "/", element: <Wrap><DashboardPage /></Wrap> },
      { path: "/use-cases", element: <Wrap><UseCasesPage /></Wrap> },
      { path: "/workflows", element: <Wrap><WorkflowsPage /></Wrap> },
      { path: "/mappings", element: <Wrap><MappingsPage /></Wrap> },
      { path: "/simulator", element: <Wrap><SimulatorPage /></Wrap> },
      { path: "/events", element: <Wrap><DecisionEventsPage /></Wrap> },
      { path: "/reviews", element: <Wrap><ReviewQueuePage /></Wrap> },
      { path: "/notices", element: <Wrap><NoticesPage /></Wrap> },
      { path: "/audit", element: <Wrap><AuditReportPage /></Wrap> },
      { path: "/settings", element: <Wrap><SettingsPage /></Wrap> },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
