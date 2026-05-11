import { z } from "zod";

import { AnimalType } from "@/generated/prisma/client";

const optionalTrim = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable();

const nonNegDecimal = z.union([
  z.number().nonnegative(),
  z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "সঠিক দশমিক মূল্য দিন"),
]);

export const createAiTechnicianServiceBodySchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    animalType: z.nativeEnum(AnimalType),
    breedOrSemenType: optionalTrim(200),
    description: optionalTrim(8000),
    basePrice: nonNegDecimal,
    visitFee: nonNegDecimal.optional().nullable(),
    emergencyFee: nonNegDecimal.optional().nullable(),
    repeatServicePolicy: optionalTrim(4000),
    followUpIncluded: z.boolean().optional(),
  })
  .strict();

export type CreateAiTechnicianServiceBody = z.infer<
  typeof createAiTechnicianServiceBodySchema
>;

export const patchAiTechnicianServiceBodySchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    animalType: z.nativeEnum(AnimalType).optional(),
    breedOrSemenType: optionalTrim(200),
    description: optionalTrim(8000),
    basePrice: nonNegDecimal.optional(),
    visitFee: nonNegDecimal.optional().nullable(),
    emergencyFee: nonNegDecimal.optional().nullable(),
    repeatServicePolicy: optionalTrim(4000),
    followUpIncluded: z.boolean().optional(),
  })
  .strict();

export type PatchAiTechnicianServiceBody = z.infer<
  typeof patchAiTechnicianServiceBodySchema
>;

export const patchAiTechnicianSettingsBodySchema = z
  .object({
    acceptsEmergency: z.boolean(),
  })
  .strict();

export type PatchAiTechnicianSettingsBody = z.infer<
  typeof patchAiTechnicianSettingsBodySchema
>;
