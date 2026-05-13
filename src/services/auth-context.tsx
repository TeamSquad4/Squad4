import { createContext, useContext, useState, type ReactNode } from "react";
import { getToken, getRole, getUserId, setAuth, clearAuth } from "@/lib/auth-state";

type Role = "patient" | "doctor" | "admin";

interface AuthContextValue {
  token: string | null;
  role: Role | null;
  userId: number | null;
  login: (token: string, role: Role, userId: number) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // useState with a lazy initialiser: the function only runs on the client
  // because the component only mounts in the browser. On the server React
  // calls the initialiser too, but getToken/getRole/getUserId now return null
  // safely when window is undefined, so there's no crash.
  const [token, setToken]   = useState<string | null>(() => getToken());
  const [role, setRole]     = useState<Role | null>(() => getRole() as Role | null);
  const [userId, setUserId] = useState<number | null>(() => getUserId());

  const login = (newToken: string, newRole: Role, newUserId: number) => {
    setAuth(newToken, newRole, newUserId);
    setToken(newToken);
    setRole(newRole);
    setUserId(newUserId);
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    setRole(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}