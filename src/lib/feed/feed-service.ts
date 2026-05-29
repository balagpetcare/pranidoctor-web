// Phase 4: Livestock Feed Ecosystem - Feed Service
// Business logic for feed management

import { prisma } from '@/lib/prisma';
import type {
  CreateFeedCategoryInput,
  UpdateFeedCategoryInput,
  CreateFeedItemInput,
  UpdateFeedItemInput,
  FeedItemFilterInput,
  CreateFeedNutritionInput,
  UpdateFeedNutritionInput,
  CreateFeedInventoryInput,
  UpdateFeedInventoryInput,
  FeedInventoryFilterInput,
  CreateInventoryTransactionInput,
  InventoryTransactionFilterInput,
  CreateVendorInput,
  UpdateVendorInput,
  VendorFilterInput,
  CreateFeedConsumptionInput,
  FeedConsumptionFilterInput,
  CreateProductionRecordInput,
  ProductionRecordFilterInput,
  CreateExpenseInput,
  ExpenseFilterInput,
  FeedCategoryResponse,
  FeedItemResponse,
  FeedNutritionResponse,
  FeedInventoryResponse,
  InventoryTransactionResponse,
  VendorResponse,
  FeedConsumptionResponse,
  ProductionRecordResponse,
  ExpenseResponse,
  PaginatedResponse,
} from '@/types/feed';
import { NotFoundError, ValidationError } from '@/lib/errors';

// ============================================================================
// FEED CATEGORY OPERATIONS
// ============================================================================

export async function createFeedCategory(
  input: CreateFeedCategoryInput
): Promise<FeedCategoryResponse> {
  const category = await prisma.feedCategory.create({
    data: {
      name: input.name,
      nameBn: input.nameBn,
      categoryType: input.categoryType,
      description: input.description,
      descriptionBn: input.descriptionBn,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    },
    include: {
      _count: { select: { feedItems: true } },
    },
  });

  return mapFeedCategoryToResponse(category);
}

export async function updateFeedCategory(
  categoryId: string,
  input: UpdateFeedCategoryInput
): Promise<FeedCategoryResponse> {
  const existing = await prisma.feedCategory.findUnique({
    where: { id: categoryId },
  });
  if (!existing) {
    throw new NotFoundError('Feed category not found');
  }

  const category = await prisma.feedCategory.update({
    where: { id: categoryId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.nameBn !== undefined && { nameBn: input.nameBn }),
      ...(input.categoryType !== undefined && { categoryType: input.categoryType }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.descriptionBn !== undefined && { descriptionBn: input.descriptionBn }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
    include: {
      _count: { select: { feedItems: true } },
    },
  });

  return mapFeedCategoryToResponse(category);
}

export async function deleteFeedCategory(categoryId: string): Promise<void> {
  const existing = await prisma.feedCategory.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { feedItems: true } } },
  });
  if (!existing) {
    throw new NotFoundError('Feed category not found');
  }

  if (existing._count.feedItems > 0) {
    throw new ValidationError('Cannot delete category with feed items');
  }

  await prisma.feedCategory.delete({
    where: { id: categoryId },
  });
}

export async function listFeedCategories(
  includeInactive: boolean = false
): Promise<FeedCategoryResponse[]> {
  const categories = await prisma.feedCategory.findMany({
    where: includeInactive ? {} : { isActive: true },
    include: {
      _count: { select: { feedItems: true } },
    },
    orderBy: { sortOrder: 'asc' },
  });

  return categories.map(mapFeedCategoryToResponse);
}

// ============================================================================
// FEED ITEM OPERATIONS
// ============================================================================

export async function createFeedItem(
  input: CreateFeedItemInput
): Promise<FeedItemResponse> {
  // Validate category
  const category = await prisma.feedCategory.findUnique({
    where: { id: input.categoryId },
  });
  if (!category) {
    throw new NotFoundError('Feed category not found');
  }

  const feedItem = await prisma.feedItem.create({
    data: {
      categoryId: input.categoryId,
      name: input.name,
      nameBn: input.nameBn,
      localName: input.localName,
      scientificName: input.scientificName,
      suitableFor: input.suitableFor,
      notSuitableFor: input.notSuitableFor,
      defaultUnit: input.defaultUnit,
      packageSize: input.packageSize,
      isSeasonal: input.isSeasonal ?? false,
      peakSeasonStart: input.peakSeasonStart,
      peakSeasonEnd: input.peakSeasonEnd,
      isToxic: input.isToxic ?? false,
      toxicityNotes: input.toxicityNotes,
      restrictions: input.restrictions,
      description: input.description,
      descriptionBn: input.descriptionBn,
      imageUrl: input.imageUrl,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    },
    include: {
      category: true,
      nutrition: true,
      prices: { orderBy: { effectiveFrom: 'desc' }, take: 1 },
    },
  });

  return mapFeedItemToResponse(feedItem);
}

export async function updateFeedItem(
  feedItemId: string,
  input: UpdateFeedItemInput
): Promise<FeedItemResponse> {
  const existing = await prisma.feedItem.findUnique({
    where: { id: feedItemId },
  });
  if (!existing) {
    throw new NotFoundError('Feed item not found');
  }

  const feedItem = await prisma.feedItem.update({
    where: { id: feedItemId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.nameBn !== undefined && { nameBn: input.nameBn }),
      ...(input.localName !== undefined && { localName: input.localName }),
      ...(input.scientificName !== undefined && { scientificName: input.scientificName }),
      ...(input.suitableFor !== undefined && { suitableFor: input.suitableFor }),
      ...(input.notSuitableFor !== undefined && { notSuitableFor: input.notSuitableFor }),
      ...(input.defaultUnit !== undefined && { defaultUnit: input.defaultUnit }),
      ...(input.packageSize !== undefined && { packageSize: input.packageSize }),
      ...(input.isSeasonal !== undefined && { isSeasonal: input.isSeasonal }),
      ...(input.peakSeasonStart !== undefined && { peakSeasonStart: input.peakSeasonStart }),
      ...(input.peakSeasonEnd !== undefined && { peakSeasonEnd: input.peakSeasonEnd }),
      ...(input.isToxic !== undefined && { isToxic: input.isToxic }),
      ...(input.toxicityNotes !== undefined && { toxicityNotes: input.toxicityNotes }),
      ...(input.restrictions !== undefined && { restrictions: input.restrictions }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.descriptionBn !== undefined && { descriptionBn: input.descriptionBn }),
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
    include: {
      category: true,
      nutrition: true,
      prices: { orderBy: { effectiveFrom: 'desc' }, take: 1 },
    },
  });

  return mapFeedItemToResponse(feedItem);
}

export async function deleteFeedItem(feedItemId: string): Promise<void> {
  const existing = await prisma.feedItem.findUnique({
    where: { id: feedItemId },
    include: {
      _count: {
        select: {
          inventory: true,
          consumptions: true,
        },
      },
    },
  });
  if (!existing) {
    throw new NotFoundError('Feed item not found');
  }

  if (existing._count.inventory > 0 || existing._count.consumptions > 0) {
    // Soft delete by marking inactive
    await prisma.feedItem.update({
      where: { id: feedItemId },
      data: { isActive: false },
    });
    return;
  }

  await prisma.feedItem.delete({
    where: { id: feedItemId },
  });
}

export async function getFeedItemById(
  feedItemId: string
): Promise<FeedItemResponse> {
  const feedItem = await prisma.feedItem.findUnique({
    where: { id: feedItemId },
    include: {
      category: true,
      nutrition: true,
      prices: { orderBy: { effectiveFrom: 'desc' }, take: 1 },
    },
  });

  if (!feedItem) {
    throw new NotFoundError('Feed item not found');
  }

  return mapFeedItemToResponse(feedItem);
}

export async function listFeedItems(
  filters: FeedItemFilterInput
): Promise<PaginatedResponse<FeedItemResponse>> {
  const where: any = {};

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters.categoryType) {
    where.category = { categoryType: filters.categoryType };
  }
  if (filters.suitableFor) {
    where.suitableFor = { has: filters.suitableFor };
  }
  if (filters.isSeasonal !== undefined) {
    where.isSeasonal = filters.isSeasonal;
  }
  if (filters.isToxic !== undefined) {
    where.isToxic = filters.isToxic;
  }
  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { nameBn: { contains: filters.search, mode: 'insensitive' } },
      { localName: { contains: filters.search, mode: 'insensitive' } },
      { scientificName: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.feedItem.findMany({
      where,
      include: {
        category: true,
        nutrition: true,
        prices: { orderBy: { effectiveFrom: 'desc' }, take: 1 },
      },
      orderBy: { [filters.sortBy ?? 'sortOrder']: filters.sortOrder ?? 'asc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.feedItem.count({ where }),
  ]);

  return {
    data: items.map(mapFeedItemToResponse),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
      hasMore: filters.page * filters.limit < total,
    },
  };
}

// ============================================================================
// FEED NUTRITION OPERATIONS
// ============================================================================

export async function createOrUpdateFeedNutrition(
  input: CreateFeedNutritionInput
): Promise<FeedNutritionResponse> {
  // Validate feed item
  const feedItem = await prisma.feedItem.findUnique({
    where: { id: input.feedItemId },
  });
  if (!feedItem) {
    throw new NotFoundError('Feed item not found');
  }

  const nutrition = await prisma.feedNutrition.upsert({
    where: { feedItemId: input.feedItemId },
    create: {
      feedItemId: input.feedItemId,
      dryMatter: input.dryMatter,
      crudeProtein: input.crudeProtein,
      crudeFiber: input.crudeFiber,
      etherExtract: input.etherExtract,
      nitrogenFreeExtract: input.nitrogenFreeExtract,
      tdn: input.tdn,
      me: input.me,
      de: input.de,
      calcium: input.calcium,
      phosphorus: input.phosphorus,
      potassium: input.potassium,
      sodium: input.sodium,
      magnesium: input.magnesium,
      sulfur: input.sulfur,
      iron: input.iron,
      zinc: input.zinc,
      copper: input.copper,
      manganese: input.manganese,
      cobalt: input.cobalt,
      iodine: input.iodine,
      selenium: input.selenium,
      vitaminA: input.vitaminA,
      vitaminD: input.vitaminD,
      vitaminE: input.vitaminE,
      ash: input.ash,
      source: input.source,
      isVerified: input.isVerified ?? false,
    },
    update: {
      ...(input.dryMatter !== undefined && { dryMatter: input.dryMatter }),
      ...(input.crudeProtein !== undefined && { crudeProtein: input.crudeProtein }),
      ...(input.crudeFiber !== undefined && { crudeFiber: input.crudeFiber }),
      ...(input.etherExtract !== undefined && { etherExtract: input.etherExtract }),
      ...(input.nitrogenFreeExtract !== undefined && { nitrogenFreeExtract: input.nitrogenFreeExtract }),
      ...(input.tdn !== undefined && { tdn: input.tdn }),
      ...(input.me !== undefined && { me: input.me }),
      ...(input.de !== undefined && { de: input.de }),
      ...(input.calcium !== undefined && { calcium: input.calcium }),
      ...(input.phosphorus !== undefined && { phosphorus: input.phosphorus }),
      ...(input.potassium !== undefined && { potassium: input.potassium }),
      ...(input.sodium !== undefined && { sodium: input.sodium }),
      ...(input.magnesium !== undefined && { magnesium: input.magnesium }),
      ...(input.sulfur !== undefined && { sulfur: input.sulfur }),
      ...(input.iron !== undefined && { iron: input.iron }),
      ...(input.zinc !== undefined && { zinc: input.zinc }),
      ...(input.copper !== undefined && { copper: input.copper }),
      ...(input.manganese !== undefined && { manganese: input.manganese }),
      ...(input.cobalt !== undefined && { cobalt: input.cobalt }),
      ...(input.iodine !== undefined && { iodine: input.iodine }),
      ...(input.selenium !== undefined && { selenium: input.selenium }),
      ...(input.vitaminA !== undefined && { vitaminA: input.vitaminA }),
      ...(input.vitaminD !== undefined && { vitaminD: input.vitaminD }),
      ...(input.vitaminE !== undefined && { vitaminE: input.vitaminE }),
      ...(input.ash !== undefined && { ash: input.ash }),
      ...(input.source !== undefined && { source: input.source }),
      ...(input.isVerified !== undefined && { isVerified: input.isVerified }),
    },
  });

  return mapFeedNutritionToResponse(nutrition);
}

// ============================================================================
// FEED INVENTORY OPERATIONS
// ============================================================================

export async function createFeedInventory(
  ownerId: string,
  input: CreateFeedInventoryInput
): Promise<FeedInventoryResponse> {
  // Validate feed item
  const feedItem = await prisma.feedItem.findUnique({
    where: { id: input.feedItemId },
  });
  if (!feedItem) {
    throw new NotFoundError('Feed item not found');
  }

  const inventory = await prisma.feedInventory.create({
    data: {
      ownerId,
      feedItemId: input.feedItemId,
      currentStock: input.currentStock,
      unit: input.unit,
      minStockLevel: input.minStockLevel,
      reorderPoint: input.reorderPoint,
      batchNumber: input.batchNumber,
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
      storageLocation: input.storageLocation,
      notes: input.notes,
    },
    include: {
      feedItem: true,
    },
  });

  return mapFeedInventoryToResponse(inventory);
}

export async function updateFeedInventory(
  ownerId: string,
  inventoryId: string,
  input: UpdateFeedInventoryInput
): Promise<FeedInventoryResponse> {
  // Verify ownership
  const existing = await prisma.feedInventory.findFirst({
    where: { id: inventoryId, ownerId },
  });
  if (!existing) {
    throw new NotFoundError('Inventory not found');
  }

  const inventory = await prisma.feedInventory.update({
    where: { id: inventoryId },
    data: {
      ...(input.currentStock !== undefined && { currentStock: input.currentStock }),
      ...(input.unit !== undefined && { unit: input.unit }),
      ...(input.minStockLevel !== undefined && { minStockLevel: input.minStockLevel }),
      ...(input.reorderPoint !== undefined && { reorderPoint: input.reorderPoint }),
      ...(input.batchNumber !== undefined && { batchNumber: input.batchNumber }),
      ...(input.expiryDate !== undefined && { expiryDate: input.expiryDate ? new Date(input.expiryDate) : null }),
      ...(input.storageLocation !== undefined && { storageLocation: input.storageLocation }),
      ...(input.notes !== undefined && { notes: input.notes }),
    },
    include: {
      feedItem: true,
    },
  });

  return mapFeedInventoryToResponse(inventory);
}

export async function deleteFeedInventory(
  ownerId: string,
  inventoryId: string
): Promise<void> {
  // Verify ownership
  const existing = await prisma.feedInventory.findFirst({
    where: { id: inventoryId, ownerId },
    include: { _count: { select: { transactions: true } } },
  });
  if (!existing) {
    throw new NotFoundError('Inventory not found');
  }

  if (existing._count.transactions > 0) {
    throw new ValidationError('Cannot delete inventory with transaction history');
  }

  await prisma.feedInventory.delete({
    where: { id: inventoryId },
  });
}

export async function listFeedInventory(
  ownerId: string,
  filters: FeedInventoryFilterInput
): Promise<PaginatedResponse<FeedInventoryResponse>> {
  const where: any = { ownerId };

  if (filters.feedItemId) {
    where.feedItemId = filters.feedItemId;
  }
  if (filters.lowStock) {
    where.OR = [
      { minStockLevel: null },
      { currentStock: { lte: { minStockLevel: true } } },
    ];
  }
  if (filters.expiring) {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    where.expiryDate = { lte: thirtyDaysFromNow };
  }

  const [items, total] = await Promise.all([
    prisma.feedInventory.findMany({
      where,
      include: {
        feedItem: true,
      },
      orderBy: { updatedAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.feedInventory.count({ where }),
  ]);

  return {
    data: items.map(mapFeedInventoryToResponse),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
      hasMore: filters.page * filters.limit < total,
    },
  };
}

// ============================================================================
// INVENTORY TRANSACTION OPERATIONS
// ============================================================================

export async function createInventoryTransaction(
  ownerId: string,
  input: CreateInventoryTransactionInput
): Promise<InventoryTransactionResponse> {
  // Verify inventory ownership
  const inventory = await prisma.feedInventory.findFirst({
    where: { id: input.inventoryId, ownerId },
    include: { feedItem: true },
  });
  if (!inventory) {
    throw new NotFoundError('Inventory not found');
  }

  // Calculate new stock level
  let newStock = Number(inventory.currentStock);
  if (input.transactionType === 'PURCHASE' || input.transactionType === 'RETURN') {
    newStock += input.quantity;
  } else if (input.transactionType === 'CONSUMPTION' || input.transactionType === 'WASTAGE') {
    newStock -= input.quantity;
    if (newStock < 0) {
      throw new ValidationError('Insufficient stock for this transaction');
    }
  } else if (input.transactionType === 'ADJUSTMENT') {
    newStock = input.quantity; // Adjustment sets absolute value
  }

  // Execute transaction
  const [transaction] = await prisma.$transaction([
    prisma.inventoryTransaction.create({
      data: {
        inventoryId: input.inventoryId,
        transactionType: input.transactionType,
        quantity: input.quantity,
        unit: input.unit,
        unitPrice: input.unitPrice,
        totalCost: input.totalCost,
        livestockId: input.livestockId,
        vendorId: input.vendorId,
        transactionDate: input.transactionDate ? new Date(input.transactionDate) : new Date(),
        notes: input.notes,
      },
      include: {
        vendor: true,
      },
    }),
    prisma.feedInventory.update({
      where: { id: input.inventoryId },
      data: { currentStock: newStock },
    }),
  ]);

  return mapInventoryTransactionToResponse(transaction, inventory.feedItem.name);
}

export async function listInventoryTransactions(
  ownerId: string,
  filters: InventoryTransactionFilterInput
): Promise<PaginatedResponse<InventoryTransactionResponse>> {
  const where: any = {
    inventory: { ownerId },
  };

  if (filters.inventoryId) {
    where.inventoryId = filters.inventoryId;
  }
  if (filters.transactionType) {
    where.transactionType = filters.transactionType;
  }
  if (filters.feedItemId) {
    where.inventory = { ...where.inventory, feedItemId: filters.feedItemId };
  }
  if (filters.startDate) {
    where.transactionDate = { gte: new Date(filters.startDate) };
  }
  if (filters.endDate) {
    where.transactionDate = { ...where.transactionDate, lte: new Date(filters.endDate) };
  }

  const [items, total] = await Promise.all([
    prisma.inventoryTransaction.findMany({
      where,
      include: {
        inventory: { include: { feedItem: true } },
        vendor: true,
        livestock: true,
      },
      orderBy: { transactionDate: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.inventoryTransaction.count({ where }),
  ]);

  return {
    data: items.map(item => mapInventoryTransactionToResponse(
      item,
      item.inventory.feedItem.name,
      item.livestock?.name ?? null
    )),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
      hasMore: filters.page * filters.limit < total,
    },
  };
}

// ============================================================================
// VENDOR OPERATIONS
// ============================================================================

export async function createVendor(
  input: CreateVendorInput
): Promise<VendorResponse> {
  const vendor = await prisma.vendor.create({
    data: {
      name: input.name,
      nameBn: input.nameBn,
      contactPerson: input.contactPerson,
      phone: input.phone,
      email: input.email,
      address: input.address,
      villageId: input.villageId,
      businessType: input.businessType,
      taxId: input.taxId,
      notes: input.notes,
    },
    include: {
      village: true,
    },
  });

  return mapVendorToResponse(vendor);
}

export async function updateVendor(
  vendorId: string,
  input: UpdateVendorInput
): Promise<VendorResponse> {
  const existing = await prisma.vendor.findUnique({
    where: { id: vendorId },
  });
  if (!existing) {
    throw new NotFoundError('Vendor not found');
  }

  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.nameBn !== undefined && { nameBn: input.nameBn }),
      ...(input.contactPerson !== undefined && { contactPerson: input.contactPerson }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.address !== undefined && { address: input.address }),
      ...(input.villageId !== undefined && { villageId: input.villageId }),
      ...(input.businessType !== undefined && { businessType: input.businessType }),
      ...(input.taxId !== undefined && { taxId: input.taxId }),
      ...(input.notes !== undefined && { notes: input.notes }),
    },
    include: {
      village: true,
    },
  });

  return mapVendorToResponse(vendor);
}

export async function listVendors(
  filters: VendorFilterInput
): Promise<PaginatedResponse<VendorResponse>> {
  const where: any = {};

  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.businessType) {
    where.businessType = filters.businessType;
  }
  if (filters.villageId) {
    where.villageId = filters.villageId;
  }
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { nameBn: { contains: filters.search, mode: 'insensitive' } },
      { phone: { contains: filters.search } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      include: {
        village: true,
      },
      orderBy: { name: 'asc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.vendor.count({ where }),
  ]);

  return {
    data: items.map(mapVendorToResponse),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
      hasMore: filters.page * filters.limit < total,
    },
  };
}

// ============================================================================
// MAPPER FUNCTIONS
// ============================================================================

function mapFeedCategoryToResponse(category: any): FeedCategoryResponse {
  return {
    id: category.id,
    name: category.name,
    nameBn: category.nameBn,
    categoryType: category.categoryType,
    description: category.description,
    descriptionBn: category.descriptionBn,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    feedItemCount: category._count?.feedItems ?? 0,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

function mapFeedItemToResponse(item: any): FeedItemResponse {
  return {
    id: item.id,
    categoryId: item.categoryId,
    categoryName: item.category?.name ?? '',
    name: item.name,
    nameBn: item.nameBn,
    localName: item.localName,
    scientificName: item.scientificName,
    suitableFor: item.suitableFor,
    notSuitableFor: item.notSuitableFor,
    defaultUnit: item.defaultUnit,
    packageSize: item.packageSize ? Number(item.packageSize) : null,
    isSeasonal: item.isSeasonal,
    peakSeasonStart: item.peakSeasonStart,
    peakSeasonEnd: item.peakSeasonEnd,
    isToxic: item.isToxic,
    toxicityNotes: item.toxicityNotes,
    restrictions: item.restrictions,
    description: item.description,
    descriptionBn: item.descriptionBn,
    imageUrl: item.imageUrl,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
    nutrition: item.nutrition ? mapFeedNutritionToResponse(item.nutrition) : null,
    currentPrice: item.prices?.[0]?.pricePerUnit ? Number(item.prices[0].pricePerUnit) : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function mapFeedNutritionToResponse(nutrition: any): FeedNutritionResponse {
  return {
    id: nutrition.id,
    feedItemId: nutrition.feedItemId,
    dryMatter: nutrition.dryMatter ? Number(nutrition.dryMatter) : null,
    crudeProtein: nutrition.crudeProtein ? Number(nutrition.crudeProtein) : null,
    crudeFiber: nutrition.crudeFiber ? Number(nutrition.crudeFiber) : null,
    etherExtract: nutrition.etherExtract ? Number(nutrition.etherExtract) : null,
    nitrogenFreeExtract: nutrition.nitrogenFreeExtract ? Number(nutrition.nitrogenFreeExtract) : null,
    tdn: nutrition.tdn ? Number(nutrition.tdn) : null,
    me: nutrition.me ? Number(nutrition.me) : null,
    de: nutrition.de ? Number(nutrition.de) : null,
    calcium: nutrition.calcium ? Number(nutrition.calcium) : null,
    phosphorus: nutrition.phosphorus ? Number(nutrition.phosphorus) : null,
    potassium: nutrition.potassium ? Number(nutrition.potassium) : null,
    sodium: nutrition.sodium ? Number(nutrition.sodium) : null,
    magnesium: nutrition.magnesium ? Number(nutrition.magnesium) : null,
    sulfur: nutrition.sulfur ? Number(nutrition.sulfur) : null,
    iron: nutrition.iron ? Number(nutrition.iron) : null,
    zinc: nutrition.zinc ? Number(nutrition.zinc) : null,
    copper: nutrition.copper ? Number(nutrition.copper) : null,
    manganese: nutrition.manganese ? Number(nutrition.manganese) : null,
    cobalt: nutrition.cobalt ? Number(nutrition.cobalt) : null,
    iodine: nutrition.iodine ? Number(nutrition.iodine) : null,
    selenium: nutrition.selenium ? Number(nutrition.selenium) : null,
    vitaminA: nutrition.vitaminA ? Number(nutrition.vitaminA) : null,
    vitaminD: nutrition.vitaminD ? Number(nutrition.vitaminD) : null,
    vitaminE: nutrition.vitaminE ? Number(nutrition.vitaminE) : null,
    ash: nutrition.ash ? Number(nutrition.ash) : null,
    source: nutrition.source,
    isVerified: nutrition.isVerified,
    createdAt: nutrition.createdAt.toISOString(),
    updatedAt: nutrition.updatedAt.toISOString(),
  };
}

function mapFeedInventoryToResponse(inventory: any): FeedInventoryResponse {
  const now = new Date();
  const expiryDate = inventory.expiryDate ? new Date(inventory.expiryDate) : null;
  const daysUntilExpiry = expiryDate
    ? Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    id: inventory.id,
    ownerId: inventory.ownerId,
    feedItemId: inventory.feedItemId,
    feedItemName: inventory.feedItem?.name ?? '',
    feedItemNameBn: inventory.feedItem?.nameBn ?? null,
    feedItemImageUrl: inventory.feedItem?.imageUrl ?? null,
    currentStock: Number(inventory.currentStock),
    unit: inventory.unit,
    minStockLevel: inventory.minStockLevel ? Number(inventory.minStockLevel) : null,
    reorderPoint: inventory.reorderPoint ? Number(inventory.reorderPoint) : null,
    batchNumber: inventory.batchNumber,
    expiryDate: inventory.expiryDate?.toISOString() ?? null,
    storageLocation: inventory.storageLocation,
    notes: inventory.notes,
    isLowStock: inventory.minStockLevel
      ? Number(inventory.currentStock) <= Number(inventory.minStockLevel)
      : false,
    isExpiringSoon: daysUntilExpiry !== null && daysUntilExpiry <= 30,
    daysUntilExpiry,
    createdAt: inventory.createdAt.toISOString(),
    updatedAt: inventory.updatedAt.toISOString(),
  };
}

function mapInventoryTransactionToResponse(
  transaction: any,
  feedItemName: string,
  livestockName: string | null = null
): InventoryTransactionResponse {
  return {
    id: transaction.id,
    inventoryId: transaction.inventoryId,
    feedItemName,
    transactionType: transaction.transactionType,
    quantity: Number(transaction.quantity),
    unit: transaction.unit,
    unitPrice: transaction.unitPrice ? Number(transaction.unitPrice) : null,
    totalCost: transaction.totalCost ? Number(transaction.totalCost) : null,
    livestockId: transaction.livestockId,
    livestockName,
    vendorId: transaction.vendorId,
    vendorName: transaction.vendor?.name ?? null,
    transactionDate: transaction.transactionDate.toISOString(),
    notes: transaction.notes,
    createdAt: transaction.createdAt.toISOString(),
  };
}

function mapVendorToResponse(vendor: any): VendorResponse {
  return {
    id: vendor.id,
    name: vendor.name,
    nameBn: vendor.nameBn,
    contactPerson: vendor.contactPerson,
    phone: vendor.phone,
    email: vendor.email,
    address: vendor.address,
    villageId: vendor.villageId,
    villageName: vendor.village?.nameBn ?? vendor.village?.name ?? null,
    businessType: vendor.businessType,
    taxId: vendor.taxId,
    status: vendor.status,
    rating: vendor.rating ? Number(vendor.rating) : null,
    notes: vendor.notes,
    createdAt: vendor.createdAt.toISOString(),
    updatedAt: vendor.updatedAt.toISOString(),
  };
}
