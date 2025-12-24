/** Página de Leads usando o sistema genérico de recursos. */

import { ResourceListPage } from "@/features/admin/components/resources/ResourceListPage";
import { leadResource } from "@/features/leads/config/leads";
import { Users } from "lucide-react";

/**
 * Página de Leads usando o sistema genérico de recursos.
 * Similar ao Django Admin - apenas configuração, sem código repetitivo.
 */
export default function LeadsPage() {
  return (
    <ResourceListPage
      config={leadResource}
      sidebarIcon={<Users className="h-4 w-4" />}
    />
  );
}

