/** Layout principal da aplicação. */

import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link to="/" className="text-xl font-bold hover:opacity-80">
            SaaS Bootstrap
          </Link>
          <nav>
            <ul className="flex space-x-4 items-center">
              {user ? (
                <>
                  <li>
                    <Link to="/dashboard" className="hover:underline text-sm font-medium">
                      Dashboard
                    </Link>
                  </li>
                  <li className="text-sm">
                    <span className="text-muted-foreground">
                      {user.first_name || user.username}
                      {user.tenant && ` (${user.tenant.name})`}
                    </span>
                  </li>
                  <li>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                    >
                      Sair
                    </Button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="hover:underline text-sm font-medium">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/register">Registrar</Link>
                    </Button>
                  </li>
                </>
              )}
              <li>
                <ThemeToggle />
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4">{children}</main>
      <footer className="border-t bg-background p-4 text-center text-sm text-muted-foreground">
        <p>&copy; 2025 SaaS Bootstrap. All rights reserved.</p>
      </footer>
    </div>
  );
}
