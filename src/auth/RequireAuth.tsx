import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import Loading from "../components/Loading";

interface RequireAuthProps {
  children: ReactNode;
  requiredRole?: "fisio" | "paciente";
}

export default function RequireAuth({ children, requiredRole }: RequireAuthProps) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    // Redirige al login apropiado basado en la ruta
    return <Navigate to="/" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Si el rol no coincide, redirige al inicio
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
