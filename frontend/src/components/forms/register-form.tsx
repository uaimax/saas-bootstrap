/** Componente de formulário de registro seguindo padrão shadcn/ui. */

import { GalleryVerticalEnd } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useSocialProviders } from "@/hooks/useSocialProviders"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SocialButton } from "@/components/ui/social-button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { LegalDocumentDialog } from "@/components/legal-document-dialog"

const registerSchema = z
  .object({
    email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    password_confirm: z.string().min(8, "Confirmação de senha é obrigatória"),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    company_name: z.string().optional(),
    accepted_terms: z.boolean().refine((val) => val === true, {
      message: "Você deve aceitar os Termos e Condições",
    }),
    accepted_privacy: z.boolean().refine((val) => val === true, {
      message: "Você deve aceitar a Política de Privacidade",
    }),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "As senhas não coincidem",
    path: ["password_confirm"],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [termsDialogOpen, setTermsDialogOpen] = useState(false)
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false)
  const { register } = useAuth()
  const { providers, loading: providersLoading } = useSocialProviders()
  const navigate = useNavigate()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      password_confirm: "",
      first_name: "",
      last_name: "",
      company_name: "",
      accepted_terms: false,
      accepted_privacy: false,
    },
  })

  async function onSubmit(values: RegisterFormValues) {
    setError(null)
    setLoading(true)

    try {
      await register({
        email: values.email,
        password: values.password,
        password_confirm: values.password_confirm,
        first_name: values.first_name || undefined,
        last_name: values.last_name || undefined,
        company_name: values.company_name || undefined,
        accepted_terms: values.accepted_terms,
        accepted_privacy: values.accepted_privacy,
      })
      navigate("/dashboard")
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data
      setError(
        typeof errorMessage === "string"
          ? errorMessage
          : "Erro ao criar conta. Tente novamente."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <Link
                to="/"
                className="flex flex-col items-center gap-2 font-medium"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md">
                  <GalleryVerticalEnd className="size-6" />
                </div>
                <span className="sr-only">SaaS Bootstrap</span>
              </Link>
              <h1 className="text-xl font-bold">Criar uma conta</h1>
              <div className="text-center text-sm">
                Já tem uma conta?{" "}
                <Link to="/login" className="underline underline-offset-4">
                  Fazer login
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="John"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobrenome</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Doe"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Ex: Minha Empresa"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password_confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="accepted_terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={loading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          Li e aceito os{" "}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              setTermsDialogOpen(true)
                            }}
                            className="underline underline-offset-4 hover:text-primary font-medium"
                          >
                            Termos e Condições de Uso
                          </button>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accepted_privacy"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={loading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          Li e aceito a{" "}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              setPrivacyDialogOpen(true)
                            }}
                            className="underline underline-offset-4 hover:text-primary font-medium"
                          >
                            Política de Privacidade
                          </button>
                          {" "}e autorizo o tratamento dos meus dados pessoais conforme a{" "}
                          <span className="font-semibold text-primary">Lei Geral de Proteção de Dados (LGPD)</span>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Criando conta..." : "Criar conta"}
              </Button>
            </div>
            {!providersLoading && providers.length > 0 && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Ou
                    </span>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {providers.map((provider) => (
                    <SocialButton
                      key={provider.provider}
                      provider={provider.provider}
                      name={provider.name}
                      disabled={loading}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </form>
      </Form>
      <LegalDocumentDialog
        open={termsDialogOpen}
        onOpenChange={setTermsDialogOpen}
        documentType="terms"
      />
      <LegalDocumentDialog
        open={privacyDialogOpen}
        onOpenChange={setPrivacyDialogOpen}
        documentType="privacy"
      />
    </div>
  )
}

