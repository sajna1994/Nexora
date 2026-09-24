import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = {
  roles?: ("customer" | "admin")[];
};

export default function ProtectedRoute({ roles }: Props) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    // Wrong role → redirect home (or show 403 page)
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}