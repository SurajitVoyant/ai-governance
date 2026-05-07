import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "./SessionContext";

export function RequireSession({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const location = useLocation();
  if (!session) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return <>{children}</>;
}
