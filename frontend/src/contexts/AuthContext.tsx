/** Context de autenticação para gerenciar estado do usuário. */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiClient } from "@/config/api";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  company: {
    id: number;
    name: string;
    slug: string;
  } | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  accepted_terms?: boolean;
  accepted_privacy?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /** Carrega o perfil do usuário atual. */
  const refreshProfile = async () => {
    try {
      const response = await apiClient.get("/auth/profile/");
      setUser(response.data);
      // Salvar company_id no localStorage para o interceptor (mantém tenant_id para compatibilidade)
      if (response.data.company) {
        localStorage.setItem("company_id", response.data.company.slug);
        localStorage.setItem("tenant_id", response.data.company.slug); // Compatibilidade
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem("company_id");
      localStorage.removeItem("tenant_id"); // Compatibilidade
    }
  };

  /** Verifica se há usuário autenticado ao carregar. */
  useEffect(() => {
    refreshProfile().finally(() => setLoading(false));
  }, []);

  /** Login do usuário usando email. */
  const login = async (email: string, password: string) => {
    const response = await apiClient.post("/auth/login/", { email, password });
    setUser(response.data.user);
    // Armazenar JWT se fornecido
    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
    }
      // Salvar company_id no localStorage (mantém tenant_id para compatibilidade)
      if (response.data.user.company) {
        localStorage.setItem("company_id", response.data.user.company.slug);
        localStorage.setItem("tenant_id", response.data.user.company.slug); // Compatibilidade
      }
  };

  /** Registro de novo usuário. */
  const register = async (data: RegisterData) => {
    const response = await apiClient.post("/auth/register/", data);
    setUser(response.data.user);
    // Armazenar JWT se fornecido
    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
    }
      // Salvar company_id no localStorage (mantém tenant_id para compatibilidade)
      if (response.data.user.company) {
        localStorage.setItem("company_id", response.data.user.company.slug);
        localStorage.setItem("tenant_id", response.data.user.company.slug); // Compatibilidade
      }
  };

  /** Logout do usuário. */
  const logout = async () => {
    try {
      await apiClient.post("/auth/logout/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("company_id");
      localStorage.removeItem("tenant_id"); // Compatibilidade
      localStorage.removeItem("access_token");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

