/** Componente genérico para criação/edição de recursos (similar ao Django Admin add_view/change_view). */

import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { LayoutDashboard, ArrowLeft } from "lucide-react";
import { MainLayout } from "@/features/admin/components/layout/MainLayout";
import { FormField } from "@/features/admin/components/forms/FormField";
import { SubmitButton } from "@/features/admin/components/forms/SubmitButton";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useResource } from "@/features/admin/hooks/useResource";
import type { ResourceConfig } from "@/lib/admin/resource-config";

export interface ResourceFormPageProps<T extends Record<string, any>> {
  /** Configuração do recurso */
  config: ResourceConfig<T>;
  /** ID do recurso (se edição) */
  id?: string | number;
  /** Ícone para sidebar */
  sidebarIcon?: React.ReactNode;
  /** Itens adicionais da sidebar */
  additionalSidebarItems?: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
  }>;
}

/**
 * Componente genérico para criação/edição de recursos.
 * Similar ao Django Admin add_view/change_view, mas configurável.
 *
 * @example
 * <ResourceFormPage config={leadResource} />
 */
export function ResourceFormPage<T extends Record<string, any>>({
  config,
  id,
  sidebarIcon,
  additionalSidebarItems = [],
}: ResourceFormPageProps<T>) {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id) || Boolean(params.id) || searchParams.get("edit") === "true";
  const resourceId = id || params.id || searchParams.get("id");

  const {
    form,
    create,
    get,
    update,
    canCreate,
    canUpdate,
    goToList,
  } = useResource<T>(config);

  // Carregar dados se for edição
  useEffect(() => {
    if (isEdit && resourceId) {
      const loadData = async () => {
        try {
          const data = await get(resourceId);
          // Reset form com dados carregados
          const formData: Record<string, any> = {};
          config.fields.forEach((field) => {
            // Mapear valor do backend para o formulário
            // Se o campo existe no data, usar o valor (mesmo que seja falsy como 0, false, "")
            // Se não existe, usar valor padrão baseado no tipo
            if (field.name in data) {
              const value = data[field.name];
              // Para campos opcionais, permitir null/undefined
              if (value === null || value === undefined) {
                formData[field.name] = field.required ? "" : undefined;
              } else {
                formData[field.name] = value;
              }
            } else {
              // Campo não existe no data, usar valor padrão
              formData[field.name] = field.required ? "" : undefined;
            }
          });
          form.reset(formData);
        } catch (error: any) {
          console.error("Erro ao carregar dados:", error);
        }
      };
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, resourceId]);

  const onSubmit = async (values: any) => {
    try {
      if (isEdit && resourceId) {
        await update(resourceId, values);
      } else {
        await create(values);
      }
      goToList();
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      if (error.response?.data) {
        Object.keys(error.response.data).forEach((key) => {
          form.setError(key as any, {
            message: error.response.data[key][0],
          });
        });
      }
    }
  };

  // Sidebar items
  const sidebarItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: config.listTitle || config.namePlural.charAt(0).toUpperCase() + config.namePlural.slice(1),
      href: `/admin/${config.namePlural}`,
      icon: sidebarIcon || <LayoutDashboard className="h-4 w-4" />,
    },
    ...additionalSidebarItems,
  ];

  // Breadcrumbs
  const breadcrumbs = [
    { label: "Dashboard", href: "/admin/dashboard" },
    {
      label: config.listTitle || config.namePlural.charAt(0).toUpperCase() + config.namePlural.slice(1),
      href: `/admin/${config.namePlural}`,
    },
    { label: isEdit ? config.editTitle || `Editar ${config.name}` : config.createTitle || `Novo ${config.name}` },
  ];

  // Verificar permissão
  if (isEdit && !canUpdate) {
    return (
      <MainLayout sidebarItems={sidebarItems} breadcrumbs={breadcrumbs}>
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Você não tem permissão para editar {config.namePlural}.</CardDescription>
          </CardHeader>
        </Card>
      </MainLayout>
    );
  }

  if (!isEdit && !canCreate) {
    return (
      <MainLayout sidebarItems={sidebarItems} breadcrumbs={breadcrumbs}>
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Você não tem permissão para criar {config.namePlural}.</CardDescription>
          </CardHeader>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      sidebarItems={sidebarItems}
      title={isEdit ? config.editTitle || `Editar ${config.name}` : config.createTitle || `Novo ${config.name}`}
      breadcrumbs={breadcrumbs}
    >
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>
            {isEdit ? config.editTitle || `Editar ${config.name}` : config.createTitle || `Criar ${config.name}`}
          </CardTitle>
          <CardDescription>
            {isEdit
              ? `Atualize as informações do ${config.name} abaixo`
              : `Preencha os dados do ${config.name} abaixo`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {config.fields.map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name as any}
                  label={field.label}
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  required={field.required}
                  description={field.description}
                  options={field.options}
                />
              ))}

              <div className="flex gap-2 pt-4">
                <SubmitButton loading={form.formState.isSubmitting}>
                  {isEdit ? "Salvar Alterações" : "Criar"}
                </SubmitButton>
                <Button type="button" variant="outline" onClick={goToList}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

