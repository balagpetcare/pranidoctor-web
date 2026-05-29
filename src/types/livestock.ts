// Phase 4: Livestock Feed Ecosystem - Type Definitions

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const LivestockAnimalType = {
  COW: 'COW',
  GOAT: 'GOAT',
  SHEEP: 'SHEEP',
  CHICKEN: 'CHICKEN',
  DUCK: 'DUCK',
  PIGEON: 'PIGEON',
  BUFFALO: 'BUFFALO',
  HORSE: 'HORSE',
  CUSTOM: 'CUSTOM',
} as const;

export const LivestockGender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  UNKNOWN: 'UNKNOWN',
} as const;

export const LivestockStatus = {
  ACTIVE: 'ACTIVE',
  SOLD: 'SOLD',
  DECEASED: 'DECEASED',
  MISSING: 'MISSING',
  TRANSFERRED: 'TRANSFERRED',
} as const;

export const LivestockPurpose = {
  DAIRY: 'DAIRY',
  MEAT: 'MEAT',
  BREEDING: 'BREEDING',
  DRAFT: 'DRAFT',
  PET: 'PET',
  MIXED: 'MIXED',
  OTHER: 'OTHER',
} as const;

export const LivestockPregnancyStatus = {
  NOT_APPLICABLE: 'NOT_APPLICABLE',
  NOT_PREGNANT: 'NOT_PREGNANT',
  PREGNANT: 'PREGNANT',
  UNKNOWN: 'UNKNOWN',
} as const;

export type LivestockAnimalType = typeof LivestockAnimalType[keyof typeof LivestockAnimalType];
export type LivestockGender = typeof LivestockGender[keyof typeof LivestockGender];
export type LivestockStatus = typeof LivestockStatus[keyof typeof LivestockStatus];
export type LivestockPurpose = typeof LivestockPurpose[keyof typeof LivestockPurpose];
export type LivestockPregnancyStatus = typeof LivestockPregnancyStatus[keyof typeof LivestockPregnancyStatus];

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const LivestockAnimalTypeSchema = z.enum(['COW', 'GOAT', 'SHEEP', 'CHICKEN', 'DUCK', 'PIGEON', 'BUFFALO', 'HORSE', 'CUSTOM']);
export const LivestockGenderSchema = z.enum(['MALE', 'FEMALE', 'UNKNOWN']);
export const LivestockStatusSchema = z.enum(['ACTIVE', 'SOLD', 'DECEASED', 'MISSING', 'TRANSFERRED']);
export const LivestockPurposeSchema = z.enum(['DAIRY', 'MEAT', 'BREEDING', 'DRAFT', 'PET', 'MIXED', 'OTHER']);
export const LivestockPregnancyStatusSchema = z.enum(['NOT_APPLICABLE', 'NOT_PREGNANT', 'PREGNANT', 'UNKNOWN']);

// ============================================================================
// LIVESTOCK SCHEMAS
// ============================================================================

export const CreateLivestockSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  animalType: LivestockAnimalTypeSchema,
  breedId: z.string().uuid().optional(),
  gender: LivestockGenderSchema,
  status: LivestockStatusSchema.default('ACTIVE'),
  purpose: LivestockPurposeSchema.default('MIXED'),
  earTagNumber: z.string().max(50).optional(),
  birthDate: z.string().datetime().optional(),
  purchaseDate: z.string().datetime().optional(),
  purchasePrice: z.number().nonnegative().optional(),
  currentWeight: z.number().positive().optional(),
  groupId: z.string().uuid().optional(),
  pregnancyStatus: LivestockPregnancyStatusSchema.default('NOT_APPLICABLE'),
  lastCalvingDate: z.string().datetime().optional(),
  lactationNumber: z.number().int().nonnegative().optional(),
  color: z.string().max(50).optional(),
  markings: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

export const UpdateLivestockSchema = CreateLivestockSchema.partial().omit({ animalType: true });

export const LivestockFilterSchema = z.object({
  animalType: LivestockAnimalTypeSchema.optional(),
  status: LivestockStatusSchema.optional(),
  purpose: LivestockPurposeSchema.optional(),
  gender: LivestockGenderSchema.optional(),
  groupId: z.string().uuid().optional(),
  breedId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'birthDate', 'currentWeight']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================================
// WEIGHT RECORD SCHEMAS
// ============================================================================

export const CreateWeightRecordSchema = z.object({
  livestockId: z.string().uuid(),
  weight: z.number().positive(),
  recordedAt: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  isMorning: z.boolean().default(true),
});

export const WeightRecordFilterSchema = z.object({
  livestockId: z.string().uuid(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// ============================================================================
// LIVESTOCK GROUP SCHEMAS
// ============================================================================

export const CreateLivestockGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  villageId: z.string().uuid().optional(),
});

export const UpdateLivestockGroupSchema = CreateLivestockGroupSchema.partial();

// ============================================================================
// HEALTH RECORD SCHEMAS
// ============================================================================

export const CreateHealthRecordSchema = z.object({
  livestockId: z.string().uuid(),
  condition: z.string().max(200).optional(),
  temperature: z.number().min(30).max(45).optional(),
  symptoms: z.string().max(1000).optional(),
  diagnosis: z.string().max(1000).optional(),
  treatment: z.string().max(1000).optional(),
  recordedAt: z.string().datetime().optional(),
});

// ============================================================================
// VACCINATION SCHEMAS
// ============================================================================

export const CreateVaccinationSchema = z.object({
  livestockId: z.string().uuid(),
  vaccineName: z.string().min(1).max(100),
  vaccineType: z.string().max(50).optional(),
  batchNumber: z.string().max(50).optional(),
  administeredAt: z.string().datetime().optional(),
  nextDoseAt: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

// ============================================================================
// TYPES
// ============================================================================

export type CreateLivestockInput = z.infer<typeof CreateLivestockSchema>;
export type UpdateLivestockInput = z.infer<typeof UpdateLivestockSchema>;
export type LivestockFilterInput = z.infer<typeof LivestockFilterSchema>;

export type CreateWeightRecordInput = z.infer<typeof CreateWeightRecordSchema>;
export type WeightRecordFilterInput = z.infer<typeof WeightRecordFilterSchema>;

export type CreateLivestockGroupInput = z.infer<typeof CreateLivestockGroupSchema>;
export type UpdateLivestockGroupInput = z.infer<typeof UpdateLivestockGroupSchema>;

export type CreateHealthRecordInput = z.infer<typeof CreateHealthRecordSchema>;
export type CreateVaccinationInput = z.infer<typeof CreateVaccinationSchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface LivestockResponse {
  id: string;
  ownerId: string;
  name: string | null;
  animalType: LivestockAnimalType;
  breedId: string | null;
  breedName: string | null;
  gender: LivestockGender;
  status: LivestockStatus;
  purpose: LivestockPurpose;
  earTagNumber: string | null;
  qrCodeUrl: string | null;
  birthDate: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  currentWeight: number | null;
  groupId: string | null;
  groupName: string | null;
  pregnancyStatus: LivestockPregnancyStatus;
  lastCalvingDate: string | null;
  lactationNumber: number | null;
  color: string | null;
  markings: string | null;
  notes: string | null;
  imageUrl: string | null;
  ageInMonths: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeightRecordResponse {
  id: string;
  livestockId: string;
  weight: number;
  recordedAt: string;
  recordedBy: string | null;
  notes: string | null;
  isMorning: boolean;
  daysSinceLast: number | null;
  weightGain: number | null;
  adg: number | null;
  createdAt: string;
}

export interface LivestockGroupResponse {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  location: string | null;
  villageId: string | null;
  villageName: string | null;
  livestockCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface HealthRecordResponse {
  id: string;
  livestockId: string;
  treatmentCaseId: string | null;
  condition: string | null;
  temperature: number | null;
  symptoms: string | null;
  diagnosis: string | null;
  treatment: string | null;
  recordedAt: string;
  recordedBy: string | null;
  createdAt: string;
}

export interface VaccinationResponse {
  id: string;
  livestockId: string;
  vaccineName: string;
  vaccineType: string | null;
  batchNumber: string | null;
  administeredAt: string;
  administeredBy: string | null;
  nextDoseAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
