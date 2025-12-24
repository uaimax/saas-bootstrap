/** Wrapper para campos de formulário que reduz boilerplate. */

import {
  FormControl,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldProps<T extends FieldValues> {
  /** Control do React Hook Form */
  control: Control<T>;
  /** Nome do campo (path) */
  name: FieldPath<T>;
  /** Label do campo */
  label: string;
  /** Placeholder do campo */
  placeholder?: string;
  /** Tipo do campo */
  type?: "text" | "email" | "password" | "number" | "select" | "textarea";
  /** Opções para select */
  options?: FormFieldOption[];
  /** Campo obrigatório */
  required?: boolean;
  /** Descrição/help text */
  description?: string;
  /** Desabilitado */
  disabled?: boolean;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Wrapper para campos de formulário que reduz boilerplate.
 * Integra automaticamente com React Hook Form e shadcn/ui Form components.
 *
 * @example
 * <FormField
 *   control={form.control}
 *   name="email"
 *   label="Email"
 *   type="email"
 *   placeholder="seu@email.com"
 *   required
 * />
 *
 * @example
 * <FormField
 *   control={form.control}
 *   name="status"
 *   label="Status"
 *   type="select"
 *   options={[
 *     { value: "active", label: "Ativo" },
 *     { value: "inactive", label: "Inativo" },
 *   ]}
 * />
 */
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  options,
  required = false,
  description,
  disabled = false,
  className,
}: FormFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            {type === "select" ? (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder={placeholder || `Selecione ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === "textarea" ? (
              <Textarea
                {...field}
                placeholder={placeholder}
                disabled={disabled}
                rows={4}
              />
            ) : (
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                value={field.value ?? ""}
              />
            )}
          </FormControl>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

