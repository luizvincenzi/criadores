import { z } from 'zod';

// Schema para validação de login
export const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email muito longo')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha muito longa')
});

// Schema para validação de usuário
export const userSchema = z.object({
  id: z.string().optional(),
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email muito longo')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha muito longa'),
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome muito longo')
    .trim(),
  role: z.enum(['admin', 'user'], {
    errorMap: () => ({ message: 'Role deve ser admin ou user' })
  }),
  status: z.enum(['active', 'inactive'], {
    errorMap: () => ({ message: 'Status deve ser active ou inactive' })
  })
});

// Schema para validação de business
export const businessSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome do negócio é obrigatório')
    .max(255, 'Nome muito longo')
    .trim(),
  categoria: z
    .string()
    .min(1, 'Categoria é obrigatória')
    .max(100, 'Categoria muito longa')
    .trim(),
  planoAtual: z
    .string()
    .max(100, 'Plano muito longo')
    .optional(),
  cidade: z
    .string()
    .min(1, 'Cidade é obrigatória')
    .max(100, 'Cidade muito longa')
    .trim(),
  whatsapp: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'WhatsApp inválido')
    .optional(),
  instagram: z
    .string()
    .max(255, 'Instagram muito longo')
    .optional()
});

// Schema para validação de criador
export const creatorSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome do criador é obrigatório')
    .max(255, 'Nome muito longo')
    .trim(),
  status: z
    .string()
    .max(50, 'Status muito longo')
    .optional(),
  whatsapp: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'WhatsApp inválido')
    .optional(),
  cidade: z
    .string()
    .min(1, 'Cidade é obrigatória')
    .max(100, 'Cidade muito longa')
    .trim(),
  instagram: z
    .string()
    .max(255, 'Instagram muito longo')
    .optional(),
  seguidores: z
    .number()
    .min(0, 'Seguidores não pode ser negativo')
    .optional()
});

// Schema para validação de campanha
export const campaignSchema = z.object({
  campanha: z
    .string()
    .min(1, 'Nome da campanha é obrigatório')
    .max(255, 'Nome muito longo')
    .trim(),
  business: z
    .string()
    .min(1, 'Business é obrigatório')
    .max(255, 'Business muito longo')
    .trim(),
  influenciador: z
    .string()
    .max(255, 'Nome do influenciador muito longo')
    .optional(),
  status: z
    .string()
    .min(1, 'Status é obrigatório')
    .max(50, 'Status muito longo'),
  mes: z
    .string()
    .min(1, 'Mês é obrigatório')
    .max(50, 'Mês muito longo')
});

// Função helper para validar dados
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return {
      success: false,
      errors: ['Erro de validação desconhecido']
    };
  }
}

// Função para sanitizar strings
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove caracteres HTML básicos
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limita tamanho
}

// Função para validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Função para validar WhatsApp
export function isValidWhatsApp(whatsapp: string): boolean {
  const whatsappRegex = /^\+?[1-9]\d{1,14}$/;
  return whatsappRegex.test(whatsapp);
}
