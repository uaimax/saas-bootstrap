/** Página do Dashboard. */

import { useEffect, useState } from "react";
import { apiClient } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Lead {
  id: number;
  name: string;
  email: string;
  status: string;
  status_display: string;
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await apiClient.get("/leads/");
        setLeads(response.data.results || response.data);
        setError(null);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError("Não autenticado. Por favor, faça login.");
        } else if (err.response?.status === 403) {
          setError("Acesso negado. Verifique seu tenant ou permissões.");
        } else {
          setError("Erro ao carregar leads.");
        }
        console.error("Erro ao buscar leads:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLeads();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        {user && (
          <p className="text-muted-foreground">
            Bem-vindo, {user.first_name || user.username}!
            {user.tenant && ` (${user.tenant.name})`}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meus Leads</CardTitle>
          <CardDescription>Lista de leads do seu tenant</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Carregando leads...</p>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum lead encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.status_display}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
