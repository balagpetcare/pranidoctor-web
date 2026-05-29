export type FeedNutritionDto = {
  id: string;
  feedItemId: string;
  cpPercent: number | null;
  tdnPercent: number | null;
  cfPercent: number | null;
  eePercent: number | null;
  caPercent: number | null;
  pPercent: number | null;
  dmPercent: number | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FeedItemDto = {
  id: string;
  code: string;
  category: string;
  nameBn: string;
  nameEn: string;
  defaultUnit: string;
  approxPriceBdt: number | null;
  moistureType: string;
  isSeasonal: boolean;
  seasonNotesBn: string | null;
  seasonNotesEn: string | null;
  restrictionJson: unknown;
  suitabilityJson: unknown;
  isSeeded: boolean;
  isActive: boolean;
  sortOrder: number;
  nutrition: FeedNutritionDto | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type FeedCategoryMetaRow = {
  value: string;
  labelBn: string;
  labelEn: string;
  descriptionBn: string;
};

export type AdminNutritionRow = {
  id: string;
  code: string;
  nameBn: string;
  nameEn: string;
  category: string;
  hasNutrition: boolean;
  cpPercent: number | null;
  tdnPercent: number | null;
  dmPercent: number | null;
  source: string | null;
};

export type VendorDto = {
  id: string;
  name: string;
  nameBn: string | null;
  phone: string | null;
  districtId: string | null;
  address: string | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VendorProductDto = {
  id: string;
  vendorId: string;
  feedItemId: string | null;
  displayName: string;
  unit: string;
  unitWeightKg: number | null;
  priceBdt: number | null;
  isActive: boolean;
};

export type VendorWithProductsDto = VendorDto & {
  products: VendorProductDto[];
};

export type AdminInventoryRow = {
  id: string;
  customerId: string;
  farmRef: string;
  displayName: string;
  unit: string;
  quantityOnHand: number;
  lowStockThreshold: number | null;
  isLowStock: boolean;
  feedItemCode: string | null;
  feedItemNameBn: string | null;
  updatedAt: string;
};

export type PlatformFeedAnalytics = {
  periodDays: number;
  feedItems: {
    total: number;
    active: number;
    withNutrition: number;
    byCategory: Array<{ category: string; count: number }>;
  };
  inventory: {
    totalRows: number;
    lowStockCount: number;
    totalQuantityKg: number;
  };
  consumption: {
    totalRecords: number;
    totalCostBdt: number;
    byDay: Array<{ date: string; count: number; costBdt: number }>;
  };
  purchases: {
    totalRecords: number;
    totalCostBdt: number;
  };
  recommendations: {
    totalLogs: number;
    lastSevenDays: number;
  };
};

export type PlatformLivestockStats = {
  totals: { all: number; active: number; archived: number };
  bySpecies: Array<{ species: string; count: number }>;
  byPurpose: Array<{ purpose: string; count: number }>;
  byHealthStatus: Array<{ healthStatus: string; count: number }>;
  healthRecordsLast30Days: number;
  vaccinationsPending: number;
  recentRegistrations: Array<{ date: string; count: number }>;
};

export type ModerationQueueItem =
  | {
      type: 'vendor';
      id: string;
      title: string;
      titleBn: string | null;
      status: string;
      createdAt: string;
    }
  | {
      type: 'feed_item';
      id: string;
      title: string;
      titleBn: string;
      status: string;
      createdAt: string;
    };

export type SeedPreview = {
  feedItems: { dbCount: number; seededCount: number; seedFileCount: number };
  vendors: { dbCount: number; seededCount: number; seedFileCount: number };
  feedCatalog: { dbCount: number; seededCount: number };
};

export type SeedRunReport = {
  ranAt: string;
  actorUserId: string;
  feedItems?: { created: number; updated: number };
  vendors?: { created: number; updated: number };
  errors: string[];
};
