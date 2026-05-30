import { z } from 'zod';

/** Client-side validation mirrors backend ai-admin.schemas (subset for forms). */

export const aiProviderFormSchema = z.object({
  providerKey: z
    .string()
    .min(1)
    .max(32)
    .regex(/^[a-z0-9_-]+$/),
  displayName: z.string().min(1).max(128),
  enabled: z.boolean().optional(),
  priority: z.number().int().min(0).max(10_000).optional(),
});

export const aiModelFormSchema = z.object({
  providerId: z.string().min(1),
  modelKey: z.string().min(1).max(128),
  displayName: z.string().min(1).max(128),
  enabled: z.boolean().optional(),
});

export const aiRouteFormSchema = z.object({
  routeKey: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9_-]+$/),
  name: z.string().min(1).max(128),
  taskType: z.string().min(1).max(64),
  enabled: z.boolean().optional(),
  priority: z.number().int().min(0).max(10_000).optional(),
});

export const aiApiKeyFormSchema = z.object({
  providerKey: z.string().min(1).max(32),
  name: z.string().min(1).max(128),
  secret: z.string().min(20),
});

export type AiProviderForm = z.infer<typeof aiProviderFormSchema>;
export type AiModelForm = z.infer<typeof aiModelFormSchema>;
export type AiRouteForm = z.infer<typeof aiRouteFormSchema>;
export type AiApiKeyForm = z.infer<typeof aiApiKeyFormSchema>;
