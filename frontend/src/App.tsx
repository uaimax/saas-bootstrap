import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./features/auth/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import Layout from "./components/Layout";
import Home from "./pages/Home";
// Auth pages
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import OAuthCallback from "./features/auth/pages/OAuthCallback";
// Admin pages (exemplo de uso do Admin UI Kit)
import DashboardPage from "./features/admin/pages/DashboardPage";
import LeadsPage from "./features/leads/pages/LeadsPage";
import SettingsPage from "./features/admin/pages/SettingsPage";
// Componentes genéricos de recursos
import { ResourceFormPage } from "./features/admin/components/resources/ResourceFormPage";
import { leadResource } from "./features/leads/config/leads";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route
              path="/"
              element={
                <Layout>
                  <Home />
                </Layout>
              }
            />
            {/* Redirecionar /dashboard para /admin/dashboard (consolidar rotas) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Navigate to="/admin/dashboard" replace />
                </ProtectedRoute>
              }
            />
            {/* Rotas Admin (exemplo de uso do Admin UI Kit) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Navigate to="/admin/dashboard" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/leads"
              element={
                <ProtectedRoute>
                  <LeadsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/leads/new"
              element={
                <ProtectedRoute>
                  <ResourceFormPage config={leadResource} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/leads/:id"
              element={
                <ProtectedRoute>
                  <ResourceFormPage config={leadResource} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
