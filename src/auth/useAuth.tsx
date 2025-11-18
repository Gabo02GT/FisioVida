import { useState, useEffect, useContext, createContext } from "react";
import type { ReactNode } from "react";
import type { User } from "firebase/auth";
import {
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, ADMIN_FISIO_UID } from "./firebaseConfig";

interface AuthContextType {
  user: User | null;
  userRole: "fisio" | "paciente" | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"fisio" | "paciente" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Suscribirse a cambios de autenticación
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Determinar el rol basado en el UID
        // Solo el admin puede ser fisio
        if (currentUser.uid === ADMIN_FISIO_UID) {
          setUserRole("fisio");
        } else {
          setUserRole("paciente");
        }
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error("Error al desloguearse:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
}
