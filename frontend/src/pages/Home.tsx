/** Página inicial com Tailwind CSS direto. */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { apiClient } from "@/config/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Server, Shield, Database, Code, Zap } from "lucide-react";

interface HealthCheck {
  status: string;
  version: string;
  api_prefix: string;
}

export default function Home() {
  const { user } = useAuth();
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await apiClient.get("/health/");
        setHealth(response.data);
        setError(null);
      } catch (err) {
        setError("Erro ao conectar com a API");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  const features = [
    { icon: Server, title: "Backend Django 5 + DRF", description: "API REST completa e robusta" },
    { icon: Database, title: "Multi-tenancy", description: "Isolamento de dados por tenant" },
    { icon: Shield, title: "Auditoria LGPD", description: "Conformidade desde o dia zero" },
    { icon: Code, title: "React + TypeScript", description: "Frontend moderno e type-safe" },
    { icon: Zap, title: "Tailwind CSS", description: "Estilização direta e customizável" },
  ];

  return (
    <div className="space-y-12 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Bem-vindo ao SaaS Bootstrap
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Template completo para lançamento rápido de MicroSaaS com multi-tenancy e LGPD
        </p>
        {user && (
          <div className="flex justify-center gap-4 pt-4">
            <Button asChild size="lg">
              <Link to="/dashboard">Ir para Dashboard</Link>
            </Button>
          </div>
        )}
        {!user && (
          <div className="flex justify-center gap-4 pt-4">
            <Button asChild size="lg">
              <Link to="/register">Começar Agora</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Fazer Login</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Status da API
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-muted-foreground">Carregando...</p>}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {health && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={health.status === "ok" ? "default" : "destructive"}>
                    {health.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Versão</span>
                  <span className="text-sm font-medium">{health.version}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">API Prefix</span>
                  <span className="text-sm font-mono">{health.api_prefix}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <feature.icon className="h-5 w-5" />
                {feature.title}
              </CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
