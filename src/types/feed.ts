// Phase 4: Livestock Feed Ecosystem - Feed Type Definitions

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const FeedCategoryType = {
  ROUGHAGE: 'ROUGHAGE',
  GREEN_FODDER: 'GREEN_FODDER',
  CONCENTRATE: 'CONCENTRATE',
  SUPPLEMENT: 'SUPPLEMENT',
  MINERAL: 'MINERAL',
  VITAMIN: 'VITAMIN',
  SILAGE: 'SILAGE',
  HAY: 'HAY',
  STRAW: 'STRAW',
  CUSTOM: 'CUSTOM',
} as const;

export const FeedUnitType = {
  KG: 'KG',
  GRAM: 'GRAM',
  MON: 'MON',
  SEER: 'SEER',
  BAG: 'BAG',
  BUNDLE: 'BUNDLE',
  LITER: 'LITER',
  PIECE: 'PIECE',
  OTHER: 'OTHER',
} as const;

export const InventoryTransactionType = {
  PURCHASE: 'PURCHASE',
  CONSUMPTION: 'CONSUMPTION',
  WASTAGE: 'WASTAGE',
  RETURN: 'RETURN',
  ADJUSTMENT: 'ADJUSTMENT',
  TRANSFER: 'TRANSFER',
} as const;

export const ExpenseCategory = {
  FEED: 'FEED',
  MEDICINE: 'MEDICINE',
  VETERINARY: 'VETERINARY',
  EQUIPMENT: 'EQUIPMENT',
  LABOR: 'LABOR',
  TRANSPORT: 'TRANSPORT',
  BREEDING: 'BREEDING',
  INSURANCE: 'INSURANCE',
  TAX: 'TAX',
  OTHER: 'OTHER',
} as const;

export const ProductionType = {
  MILK: 'MILK',
  EGG: 'EGG',
  MEAT: 'MEAT',
  OFFSPRING: 'OFFSPRING',
  WOOL: 'WOOL',
  MANURE: 'MANURE',
  OTHER: 'OTHER',
} as const;

export const RecommendationStatus = {
  ACTIVE: 'ACTIVE',
  APPLIED: 'APPLIED',
  DISMISSED: 'DISMISSED',
  EXPIRED: 'EXPIRED',
} as const;

export const VendorStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  BLACKLISTED: 'BLACKLISTED',
} as const;

export type FeedCategoryType = typeof FeedCategoryType[keyof typeof FeedCategoryType];
export type FeedUnitType = typeof FeedUnitType[keyof typeof FeedUnitType];
export type InventoryTransactionType = typeof InventoryTransactionType[keyof typeof InventoryTransactionType];
export type ExpenseCategory = typeof ExpenseCategory[keyof typeof ExpenseCategory];
export type ProductionType = typeof ProductionType[keyof typeof ProductionType];
export type RecommendationStatus = typeof RecommendationStatus[keyof typeof RecommendationStatus];
export type VendorStatus = typeof VendorStatus[keyof typeof VendorStatus];

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const FeedCategoryTypeSchema = z.enum(['ROUGHAGE', 'GREEN_FODDER', 'CONCENTRATE', 'SUPPLEMENT', 'MINERAL', 'VITAMIN', 'SILAGE', 'HAY', 'STRAW', 'CUSTOM']);
export const FeedUnitTypeSchema = z.enum(['KG', 'GRAM', 'MON', 'SEER', 'BAG', 'BUNDLE', 'LITER', 'PIECE', 'OTHER']);
export const InventoryTransactionTypeSchema = z.enum(['PURCHASE', 'CONSUMPTION', 'WASTAGE', 'RETURN', 'ADJUSTMENT', 'TRANSFER']);
export const ExpenseCategorySchema = z.enum(['FEED', 'MEDICINE', 'VETERINARY', 'EQUIPMENT', 'LABOR', 'TRANSPORT', 'BREEDING', 'INSURANCE', 'TAX', 'OTHER']);
export const ProductionTypeSchema = z.enum(['MILK', 'EGG', 'MEAT', 'OFFSPRING', 'WOOL', 'MANURE', 'OTHER']);
export const RecommendationStatusSchema = z.enum(['ACTIVE', 'APPLIED', 'DISMISSED', 'EXPIRED']);
export const VendorStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'BLACKLISTED']);

// ============================================================================
// FEED CATEGORY SCHEMAS
// ============================================================================

export const CreateFeedCategorySchema = z.object({
  name: z.string().min(1).max(100),
  nameBn: z.string().max(100).optional(),
  categoryType: FeedCategoryTypeSchema,
  description: z.string().max(500).optional(),
  descriptionBn: z.string().max(500).optional(),
  sortOrder: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export const UpdateFeedCategorySchema = CreateFeedCategorySchema.partial();

// ============================================================================
// FEED ITEM SCHEMAS
// ============================================================================

export const CreateFeedItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(100),
  nameBn: z.string().max(100).optional(),
  localName: z.string().max(100).optional(),
  scientificName: z.string().max(100).optional(),
  suitableFor: z.array(z.enum(['COW', 'GOAT', 'SHEEP', 'CHICKEN', 'DUCK', 'PIGEON', 'BUFFALO', 'HORSE', 'CUSTOM'])).default([]),
  notSuitableFor: z.array(z.enum(['COW', 'GOAT', 'SHEEP', 'CHICKEN', 'DUCK', 'PIGEON', 'BUFFALO', 'HORSE', 'CUSTOM'])).default([]),
  defaultUnit: FeedUnitTypeSchema.default('KG'),
  packageSize: z.number().positive().optional(),
  isSeasonal: z.boolean().default(false),
  peakSeasonStart: z.number().int().min(1).max(12).optional(),
  peakSeasonEnd: z.number().int().min(1).max(12).optional(),
  isToxic: z.boolean().default(false),
  toxicityNotes: z.string().max(500).optional(),
  restrictions: z.string().max(500).optional(),
  description: z.string().max(1000).optional(),
  descriptionBn: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export const UpdateFeedItemSchema = CreateFeedItemSchema.partial().omit({ categoryId: true });

export const FeedItemFilterSchema = z.object({
  categoryId: z.string().uuid().optional(),
  categoryType: FeedCategoryTypeSchema.optional(),
  suitableFor: z.enum(['COW', 'GOAT', 'SHEEP', 'CHICKEN', 'DUCK', 'PIGEON', 'BUFFALO', 'HORSE', 'CUSTOM']).optional(),
  isSeasonal: z.boolean().optional(),
  isToxic: z.boolean().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['name', 'sortOrder', 'createdAt']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ============================================================================
// FEED NUTRITION SCHEMAS
// ============================================================================

export const CreateFeedNutritionSchema = z.object({
  feedItemId: z.string().uuid(),
  // Macronutrients (% DM basis)
  dryMatter: z.number().min(0).max(100).optional(),
  crudeProtein: z.number().min(0).max(100).optional(),
  crudeFiber: z.number().min(0).max(100).optional(),
  etherExtract: z.number().min(0).max(100).optional(),
  nitrogenFreeExtract: z.number().min(0).max(100).optional(),
  // Energy values
  tdn: z.number().min(0).max(100).optional(),
  me: z.number().min(0).max(10).optional(),
  de: z.number().min(0).max(10).optional(),
  // Minerals (%)
  calcium: z.number().min(0).max(100).optional(),
  phosphorus: z.number().min(0).max(100).optional(),
  potassium: z.number().min(0).max(100).optional(),
  sodium: z.number().min(0).max(100).optional(),
  magnesium: z.number().min(0).max(100).optional(),
  sulfur: z.number().min(0).max(100).optional(),
  // Trace minerals (ppm)
  iron: z.number().min(0).optional(),
  zinc: z.number().min(0).optional(),
  copper: z.number().min(0).optional(),
  manganese: z.number().min(0).optional(),
  cobalt: z.number().min(0).optional(),
  iodine: z.number().min(0).optional(),
  selenium: z.number().min(0).optional(),
  // Vitamins
  vitaminA: z.number().min(0).optional(),
  vitaminD: z.number().min(0).optional(),
  vitaminE: z.number().min(0).optional(),
  // Other
  ash: z.number().min(0).max(100).optional(),
  source: z.string().max(200).optional(),
  isVerified: z.boolean().default(false),
});

export const UpdateFeedNutritionSchema = CreateFeedNutritionSchema.partial().omit({ feedItemId: true });

// ============================================================================
// FEED INVENTORY SCHEMAS
// ============================================================================

export const CreateFeedInventorySchema = z.object({
  feedItemId: z.string().uuid(),
  currentStock: z.number().nonnegative(),
  unit: FeedUnitTypeSchema,
  minStockLevel: z.number().nonnegative().optional(),
  reorderPoint: z.number().nonnegative().optional(),
  batchNumber: z.string().max(50).optional(),
  expiryDate: z.string().datetime().optional(),
  storageLocation: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

export const UpdateFeedInventorySchema = z.object({
  currentStock: z.number().nonnegative().optional(),
  unit: FeedUnitTypeSchema.optional(),
  minStockLevel: z.number().nonnegative().optional(),
  reorderPoint: z.number().nonnegative().optional(),
  batchNumber: z.string().max(50).optional(),
  expiryDate: z.string().datetime().optional(),
  storageLocation: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

export const FeedInventoryFilterSchema = z.object({
  feedItemId: z.string().uuid().optional(),
  lowStock: z.boolean().optional(),
  expiring: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// ============================================================================
// INVENTORY TRANSACTION SCHEMAS
// ============================================================================

export const CreateInventoryTransactionSchema = z.object({
  inventoryId: z.string().uuid(),
  transactionType: InventoryTransactionTypeSchema,
  quantity: z.number().positive(),
  unit: FeedUnitTypeSchema,
  unitPrice: z.number().nonnegative().optional(),
  totalCost: z.number().nonnegative().optional(),
  livestockId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  transactionDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

export const InventoryTransactionFilterSchema = z.object({
  inventoryId: z.string().uuid().optional(),
  transactionType: InventoryTransactionTypeSchema.optional(),
  feedItemId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// ============================================================================
// VENDOR SCHEMAS
// ============================================================================

export const CreateVendorSchema = z.object({
  name: z.string().min(1).max(100),
  nameBn: z.string().max(100).optional(),
  contactPerson: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(100).optional(),
  address: z.string().max(500).optional(),
  villageId: z.string().uuid().optional(),
  businessType: z.string().max(50).optional(),
  taxId: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
});

export const UpdateVendorSchema = CreateVendorSchema.partial();

export const VendorFilterSchema = z.object({
  status: VendorStatusSchema.optional(),
  businessType: z.string().optional(),
  villageId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// ============================================================================
// FEED CONSUMPTION SCHEMAS
// ============================================================================

export const CreateFeedConsumptionSchema = z.object({
  livestockId: z.string().uuid(),
  feedItemId: z.string().uuid(),
  quantity: z.number().positive(),
  unit: FeedUnitTypeSchema,
  consumedAt: z.string().datetime().optional(),
  consumptionDate: z.string().datetime().optional(),
  feedingTime: z.enum(['MORNING', 'EVENING', 'NIGHT', 'OTHER']).optional(),
  costPerUnit: z.number().nonnegative().optional(),
  totalCost: z.number().nonnegative().optional(),
  notes: z.string().max(500).optional(),
});

export const FeedConsumptionFilterSchema = z.object({
  livestockId: z.string().uuid().optional(),
  feedItemId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// ============================================================================
// PRODUCTION RECORD SCHEMAS
// ============================================================================

export const CreateProductionRecordSchema = z.object({
  livestockId: z.string().uuid(),
  productionType: ProductionTypeSchema,
  quantity: z.number().nonnegative(),
  unit: z.string().max(20),
  fatPercentage: z.number().min(0).max(100).optional(),
  snfPercentage: z.number().min(0).max(100).optional(),
  producedAt: z.string().datetime().optional(),
  productionDate: z.string().datetime().optional(),
  session: z.enum(['MORNING', 'EVENING', 'ALL_DAY', 'OTHER']).optional(),
  marketPrice: z.number().nonnegative().optional(),
  totalValue: z.number().nonnegative().optional(),
  notes: z.string().max(500).optional(),
});

export const ProductionRecordFilterSchema = z.object({
  livestockId: z.string().uuid().optional(),
  productionType: ProductionTypeSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// ============================================================================
// EXPENSE SCHEMAS
// ============================================================================

export const CreateExpenseSchema = z.object({
  livestockId: z.string().uuid().optional(),
  category: ExpenseCategorySchema,
  amount: z.number().positive(),
  currency: z.string().max(3).default('BDT'),
  description: z.string().max(500).optional(),
  vendorId: z.string().uuid().optional(),
  expenseDate: z.string().datetime().optional(),
  receiptUrl: z.string().url().optional(),
  notes: z.string().max(500).optional(),
});

export const ExpenseFilterSchema = z.object({
  livestockId: z.string().uuid().optional(),
  category: ExpenseCategorySchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// ============================================================================
// TYPES
// ============================================================================

export type CreateFeedCategoryInput = z.infer<typeof CreateFeedCategorySchema>;
export type UpdateFeedCategoryInput = z.infer<typeof UpdateFeedCategorySchema>;

export type CreateFeedItemInput = z.infer<typeof CreateFeedItemSchema>;
export type UpdateFeedItemInput = z.infer<typeof UpdateFeedItemSchema>;
export type FeedItemFilterInput = z.infer<typeof FeedItemFilterSchema>;

export type CreateFeedNutritionInput = z.infer<typeof CreateFeedNutritionSchema>;
export type UpdateFeedNutritionInput = z.infer<typeof UpdateFeedNutritionSchema>;

export type CreateFeedInventoryInput = z.infer<typeof CreateFeedInventorySchema>;
export type UpdateFeedInventoryInput = z.infer<typeof UpdateFeedInventorySchema>;
export type FeedInventoryFilterInput = z.infer<typeof FeedInventoryFilterSchema>;

export type CreateInventoryTransactionInput = z.infer<typeof CreateInventoryTransactionSchema>;
export type InventoryTransactionFilterInput = z.infer<typeof InventoryTransactionFilterSchema>;

export type CreateVendorInput = z.infer<typeof CreateVendorSchema>;
export type UpdateVendorInput = z.infer<typeof UpdateVendorSchema>;
export type VendorFilterInput = z.infer<typeof VendorFilterSchema>;

export type CreateFeedConsumptionInput = z.infer<typeof CreateFeedConsumptionSchema>;
export type FeedConsumptionFilterInput = z.infer<typeof FeedConsumptionFilterSchema>;

export type CreateProductionRecordInput = z.infer<typeof CreateProductionRecordSchema>;
export type ProductionRecordFilterInput = z.infer<typeof ProductionRecordFilterSchema>;

export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;
export type ExpenseFilterInput = z.infer<typeof ExpenseFilterSchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface FeedCategoryResponse {
  id: string;
  name: string;
  nameBn: string | null;
  categoryType: FeedCategoryType;
  description: string | null;
  descriptionBn: string | null;
  sortOrder: number;
  isActive: boolean;
  feedItemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeedItemResponse {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  nameBn: string | null;
  localName: string | null;
  scientificName: string | null;
  suitableFor: string[];
  notSuitableFor: string[];
  defaultUnit: FeedUnitType;
  packageSize: number | null;
  isSeasonal: boolean;
  peakSeasonStart: number | null;
  peakSeasonEnd: number | null;
  isToxic: boolean;
  toxicityNotes: string | null;
  restrictions: string | null;
  description: string | null;
  descriptionBn: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  nutrition: FeedNutritionResponse | null;
  currentPrice: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeedNutritionResponse {
  id: string;
  feedItemId: string;
  dryMatter: number | null;
  crudeProtein: number | null;
  crudeFiber: number | null;
  etherExtract: number | null;
  nitrogenFreeExtract: number | null;
  tdn: number | null;
  me: number | null;
  de: number | null;
  calcium: number | null;
  phosphorus: number | null;
  potassium: number | null;
  sodium: number | null;
  magnesium: number | null;
  sulfur: number | null;
  iron: number | null;
  zinc: number | null;
  copper: number | null;
  manganese: number | null;
  cobalt: number | null;
  iodine: number | null;
  selenium: number | null;
  vitaminA: number | null;
  vitaminD: number | null;
  vitaminE: number | null;
  ash: number | null;
  source: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedInventoryResponse {
  id: string;
  ownerId: string;
  feedItemId: string;
  feedItemName: string;
  feedItemNameBn: string | null;
  feedItemImageUrl: string | null;
  currentStock: number;
  unit: FeedUnitType;
  minStockLevel: number | null;
  reorderPoint: number | null;
  batchNumber: string | null;
  expiryDate: string | null;
  storageLocation: string | null;
  notes: string | null;
  isLowStock: boolean;
  isExpiringSoon: boolean;
  daysUntilExpiry: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransactionResponse {
  id: string;
  inventoryId: string;
  feedItemName: string;
  transactionType: InventoryTransactionType;
  quantity: number;
  unit: FeedUnitType;
  unitPrice: number | null;
  totalCost: number | null;
  livestockId: string | null;
  livestockName: string | null;
  vendorId: string | null;
  vendorName: string | null;
  transactionDate: string;
  notes: string | null;
  createdAt: string;
}

export interface VendorResponse {
  id: string;
  name: string;
  nameBn: string | null;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  villageId: string | null;
  villageName: string | null;
  businessType: string | null;
  taxId: string | null;
  status: VendorStatus;
  rating: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeedConsumptionResponse {
  id: string;
  livestockId: string;
  livestockName: string;
  feedItemId: string;
  feedItemName: string;
  quantity: number;
  unit: FeedUnitType;
  consumedAt: string;
  consumptionDate: string;
  feedingTime: string | null;
  costPerUnit: number | null;
  totalCost: number | null;
  notes: string | null;
  createdAt: string;
}

export interface ProductionRecordResponse {
  id: string;
  livestockId: string;
  livestockName: string;
  productionType: ProductionType;
  quantity: number;
  unit: string;
  fatPercentage: number | null;
  snfPercentage: number | null;
  producedAt: string;
  productionDate: string;
  session: string | null;
  marketPrice: number | null;
  totalValue: number | null;
  notes: string | null;
  createdAt: string;
}

export interface ExpenseResponse {
  id: string;
  livestockId: string | null;
  livestockName: string | null;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  description: string | null;
  vendorId: string | null;
  vendorName: string | null;
  expenseDate: string;
  receiptUrl: string | null;
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
