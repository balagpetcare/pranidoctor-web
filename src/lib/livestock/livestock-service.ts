// Phase 4: Livestock Feed Ecosystem - Livestock Service
// Business logic for livestock management

import { prisma } from '@/lib/prisma';
import type {
  CreateLivestockInput,
  UpdateLivestockInput,
  LivestockFilterInput,
  CreateWeightRecordInput,
  WeightRecordFilterInput,
  CreateLivestockGroupInput,
  UpdateLivestockGroupInput,
  CreateHealthRecordInput,
  CreateVaccinationInput,
  LivestockResponse,
  WeightRecordResponse,
  LivestockGroupResponse,
  HealthRecordResponse,
  VaccinationResponse,
  PaginatedResponse,
} from '@/types/livestock';
import { calculateAgeInMonths, calculateADG } from './livestock-utils';
import { AppError, NotFoundError, ValidationError } from '@/lib/errors';

// ============================================================================
// LIVESTOCK CRUD OPERATIONS
// ============================================================================

export async function createLivestock(
  ownerId: string,
  input: CreateLivestockInput
): Promise<LivestockResponse> {
  // Validate breed if provided
  if (input.breedId) {
    const breed = await prisma.livestockBreed.findUnique({
      where: { id: input.breedId },
    });
    if (!breed) {
      throw new NotFoundError('Breed not found');
    }
  }

  // Validate group if provided
  if (input.groupId) {
    const group = await prisma.livestockGroup.findUnique({
      where: { id: input.groupId, ownerId },
    });
    if (!group) {
      throw new NotFoundError('Group not found');
    }
  }

  const livestock = await prisma.livestock.create({
    data: {
      ownerId,
      name: input.name,
      animalType: input.animalType,
      breedId: input.breedId,
      gender: input.gender,
      status: input.status ?? 'ACTIVE',
      purpose: input.purpose ?? 'MIXED',
      earTagNumber: input.earTagNumber,
      birthDate: input.birthDate ? new Date(input.birthDate) : null,
      purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : null,
      purchasePrice: input.purchasePrice ? input.purchasePrice : null,
      currentWeight: input.currentWeight ? input.currentWeight : null,
      groupId: input.groupId,
      pregnancyStatus: input.pregnancyStatus ?? 'NOT_APPLICABLE',
      lastCalvingDate: input.lastCalvingDate ? new Date(input.lastCalvingDate) : null,
      lactationNumber: input.lactationNumber,
      color: input.color,
      markings: input.markings,
      notes: input.notes,
    },
    include: {
      breed: true,
      group: true,
      images: { take: 1, orderBy: { createdAt: 'desc' } },
    },
  });

  return mapLivestockToResponse(livestock);
}

export async function updateLivestock(
  ownerId: string,
  livestockId: string,
  input: UpdateLivestockInput
): Promise<LivestockResponse> {
  // Verify ownership
  const existing = await prisma.livestock.findFirst({
    where: { id: livestockId, ownerId },
  });
  if (!existing) {
    throw new NotFoundError('Livestock not found');
  }

  // Validate breed if provided
  if (input.breedId) {
    const breed = await prisma.livestockBreed.findUnique({
      where: { id: input.breedId },
    });
    if (!breed) {
      throw new NotFoundError('Breed not found');
    }
  }

  // Validate group if provided
  if (input.groupId) {
    const group = await prisma.livestockGroup.findUnique({
      where: { id: input.groupId, ownerId },
    });
    if (!group) {
      throw new NotFoundError('Group not found');
    }
  }

  const livestock = await prisma.livestock.update({
    where: { id: livestockId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.breedId !== undefined && { breedId: input.breedId }),
      ...(input.gender !== undefined && { gender: input.gender }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.purpose !== undefined && { purpose: input.purpose }),
      ...(input.earTagNumber !== undefined && { earTagNumber: input.earTagNumber }),
      ...(input.birthDate !== undefined && { birthDate: input.birthDate ? new Date(input.birthDate) : null }),
      ...(input.purchaseDate !== undefined && { purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : null }),
      ...(input.purchasePrice !== undefined && { purchasePrice: input.purchasePrice ? input.purchasePrice : null }),
      ...(input.currentWeight !== undefined && { currentWeight: input.currentWeight ? input.currentWeight : null }),
      ...(input.groupId !== undefined && { groupId: input.groupId }),
      ...(input.pregnancyStatus !== undefined && { pregnancyStatus: input.pregnancyStatus }),
      ...(input.lastCalvingDate !== undefined && { lastCalvingDate: input.lastCalvingDate ? new Date(input.lastCalvingDate) : null }),
      ...(input.lactationNumber !== undefined && { lactationNumber: input.lactationNumber }),
      ...(input.color !== undefined && { color: input.color }),
      ...(input.markings !== undefined && { markings: input.markings }),
      ...(input.notes !== undefined && { notes: input.notes }),
    },
    include: {
      breed: true,
      group: true,
      images: { take: 1, orderBy: { createdAt: 'desc' } },
    },
  });

  return mapLivestockToResponse(livestock);
}

export async function deleteLivestock(
  ownerId: string,
  livestockId: string
): Promise<void> {
  // Verify ownership
  const existing = await prisma.livestock.findFirst({
    where: { id: livestockId, ownerId },
  });
  if (!existing) {
    throw new NotFoundError('Livestock not found');
  }

  // Soft delete
  await prisma.livestock.update({
    where: { id: livestockId },
    data: { deletedAt: new Date() },
  });
}

export async function getLivestockById(
  ownerId: string,
  livestockId: string
): Promise<LivestockResponse> {
  const livestock = await prisma.livestock.findFirst({
    where: { id: livestockId, ownerId, deletedAt: null },
    include: {
      breed: true,
      group: true,
      images: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!livestock) {
    throw new NotFoundError('Livestock not found');
  }

  return mapLivestockToResponse(livestock);
}

export async function listLivestock(
  ownerId: string,
  filters: LivestockFilterInput
): Promise<PaginatedResponse<LivestockResponse>> {
  const where: any = {
    ownerId,
    deletedAt: null,
  };

  if (filters.animalType) {
    where.animalType = filters.animalType;
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.purpose) {
    where.purpose = filters.purpose;
  }
  if (filters.gender) {
    where.gender = filters.gender;
  }
  if (filters.groupId) {
    where.groupId = filters.groupId;
  }
  if (filters.breedId) {
    where.breedId = filters.breedId;
  }
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { earTagNumber: { contains: filters.search, mode: 'insensitive' } },
      { color: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.livestock.findMany({
      where,
      include: {
        breed: true,
        group: true,
        images: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { [filters.sortBy ?? 'createdAt']: filters.sortOrder ?? 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.livestock.count({ where }),
  ]);

  return {
    data: items.map(mapLivestockToResponse),
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
// WEIGHT RECORD OPERATIONS
// ============================================================================

export async function createWeightRecord(
  ownerId: string,
  input: CreateWeightRecordInput
): Promise<WeightRecordResponse> {
  // Verify livestock ownership
  const livestock = await prisma.livestock.findFirst({
    where: { id: input.livestockId, ownerId, deletedAt: null },
  });
  if (!livestock) {
    throw new NotFoundError('Livestock not found');
  }

  // Get previous weight record for calculations
  const previousRecord = await prisma.weightRecord.findFirst({
    where: { livestockId: input.livestockId },
    orderBy: { recordedAt: 'desc' },
  });

  const recordedAt = input.recordedAt ? new Date(input.recordedAt) : new Date();

  // Calculate days since last and weight gain
  let daysSinceLast: number | null = null;
  let weightGain: number | null = null;
  let adg: number | null = null;

  if (previousRecord) {
    daysSinceLast = Math.floor((recordedAt.getTime() - previousRecord.recordedAt.getTime()) / (1000 * 60 * 60 * 24));
    weightGain = input.weight - Number(previousRecord.weight);
    adg = calculateADG(Number(previousRecord.weight), input.weight, daysSinceLast);
  }

  const record = await prisma.weightRecord.create({
    data: {
      livestockId: input.livestockId,
      weight: input.weight,
      recordedAt,
      notes: input.notes,
      isMorning: input.isMorning ?? true,
      daysSinceLast,
      weightGain,
      adg,
    },
  });

  // Update current weight on livestock
  await prisma.livestock.update({
    where: { id: input.livestockId },
    data: { currentWeight: input.weight },
  });

  return mapWeightRecordToResponse(record);
}

export async function listWeightRecords(
  ownerId: string,
  filters: WeightRecordFilterInput
): Promise<PaginatedResponse<WeightRecordResponse>> {
  // Verify livestock ownership
  const livestock = await prisma.livestock.findFirst({
    where: { id: filters.livestockId, ownerId, deletedAt: null },
  });
  if (!livestock) {
    throw new NotFoundError('Livestock not found');
  }

  const where: any = { livestockId: filters.livestockId };

  if (filters.startDate) {
    where.recordedAt = { gte: new Date(filters.startDate) };
  }
  if (filters.endDate) {
    where.recordedAt = { ...where.recordedAt, lte: new Date(filters.endDate) };
  }

  const [items, total] = await Promise.all([
    prisma.weightRecord.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.weightRecord.count({ where }),
  ]);

  return {
    data: items.map(mapWeightRecordToResponse),
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
// LIVESTOCK GROUP OPERATIONS
// ============================================================================

export async function createLivestockGroup(
  ownerId: string,
  input: CreateLivestockGroupInput
): Promise<LivestockGroupResponse> {
  const group = await prisma.livestockGroup.create({
    data: {
      ownerId,
      name: input.name,
      description: input.description,
      location: input.location,
      villageId: input.villageId,
    },
    include: {
      village: true,
      _count: { select: { livestock: true } },
    },
  });

  return mapLivestockGroupToResponse(group);
}

export async function updateLivestockGroup(
  ownerId: string,
  groupId: string,
  input: UpdateLivestockGroupInput
): Promise<LivestockGroupResponse> {
  // Verify ownership
  const existing = await prisma.livestockGroup.findFirst({
    where: { id: groupId, ownerId },
  });
  if (!existing) {
    throw new NotFoundError('Group not found');
  }

  const group = await prisma.livestockGroup.update({
    where: { id: groupId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.location !== undefined && { location: input.location }),
      ...(input.villageId !== undefined && { villageId: input.villageId }),
    },
    include: {
      village: true,
      _count: { select: { livestock: true } },
    },
  });

  return mapLivestockGroupToResponse(group);
}

export async function deleteLivestockGroup(
  ownerId: string,
  groupId: string
): Promise<void> {
  // Verify ownership
  const existing = await prisma.livestockGroup.findFirst({
    where: { id: groupId, ownerId },
    include: { _count: { select: { livestock: true } } },
  });
  if (!existing) {
    throw new NotFoundError('Group not found');
  }

  if (existing._count.livestock > 0) {
    throw new ValidationError('Cannot delete group with livestock. Move animals first.');
  }

  await prisma.livestockGroup.delete({
    where: { id: groupId },
  });
}

export async function listLivestockGroups(
  ownerId: string
): Promise<LivestockGroupResponse[]> {
  const groups = await prisma.livestockGroup.findMany({
    where: { ownerId },
    include: {
      village: true,
      _count: { select: { livestock: true } },
    },
    orderBy: { name: 'asc' },
  });

  return groups.map(mapLivestockGroupToResponse);
}

// ============================================================================
// HEALTH RECORD OPERATIONS
// ============================================================================

export async function createHealthRecord(
  ownerId: string,
  input: CreateHealthRecordInput
): Promise<HealthRecordResponse> {
  // Verify livestock ownership
  const livestock = await prisma.livestock.findFirst({
    where: { id: input.livestockId, ownerId, deletedAt: null },
  });
  if (!livestock) {
    throw new NotFoundError('Livestock not found');
  }

  const record = await prisma.livestockHealthRecord.create({
    data: {
      livestockId: input.livestockId,
      condition: input.condition,
      temperature: input.temperature,
      symptoms: input.symptoms,
      diagnosis: input.diagnosis,
      treatment: input.treatment,
      recordedAt: input.recordedAt ? new Date(input.recordedAt) : new Date(),
    },
  });

  return mapHealthRecordToResponse(record);
}

export async function listHealthRecords(
  ownerId: string,
  livestockId: string
): Promise<HealthRecordResponse[]> {
  // Verify livestock ownership
  const livestock = await prisma.livestock.findFirst({
    where: { id: livestockId, ownerId, deletedAt: null },
  });
  if (!livestock) {
    throw new NotFoundError('Livestock not found');
  }

  const records = await prisma.livestockHealthRecord.findMany({
    where: { livestockId },
    orderBy: { recordedAt: 'desc' },
  });

  return records.map(mapHealthRecordToResponse);
}

// ============================================================================
// VACCINATION OPERATIONS
// ============================================================================

export async function createVaccination(
  ownerId: string,
  input: CreateVaccinationInput
): Promise<VaccinationResponse> {
  // Verify livestock ownership
  const livestock = await prisma.livestock.findFirst({
    where: { id: input.livestockId, ownerId, deletedAt: null },
  });
  if (!livestock) {
    throw new NotFoundError('Livestock not found');
  }

  const record = await prisma.livestockVaccination.create({
    data: {
      livestockId: input.livestockId,
      vaccineName: input.vaccineName,
      vaccineType: input.vaccineType,
      batchNumber: input.batchNumber,
      administeredAt: input.administeredAt ? new Date(input.administeredAt) : new Date(),
      nextDoseAt: input.nextDoseAt ? new Date(input.nextDoseAt) : null,
      notes: input.notes,
    },
  });

  return mapVaccinationToResponse(record);
}

export async function listVaccinations(
  ownerId: string,
  livestockId: string
): Promise<VaccinationResponse[]> {
  // Verify livestock ownership
  const livestock = await prisma.livestock.findFirst({
    where: { id: livestockId, ownerId, deletedAt: null },
  });
  if (!livestock) {
    throw new NotFoundError('Livestock not found');
  }

  const records = await prisma.livestockVaccination.findMany({
    where: { livestockId },
    orderBy: { administeredAt: 'desc' },
  });

  return records.map(mapVaccinationToResponse);
}

export async function getUpcomingVaccinations(
  ownerId: string,
  daysAhead: number = 30
): Promise<VaccinationResponse[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

  const records = await prisma.livestockVaccination.findMany({
    where: {
      livestock: { ownerId, deletedAt: null },
      nextDoseAt: { lte: cutoffDate },
    },
    orderBy: { nextDoseAt: 'asc' },
    include: { livestock: true },
  });

  return records.map(mapVaccinationToResponse);
}

// ============================================================================
// MAPPER FUNCTIONS
// ============================================================================

function mapLivestockToResponse(livestock: any): LivestockResponse {
  return {
    id: livestock.id,
    ownerId: livestock.ownerId,
    name: livestock.name,
    animalType: livestock.animalType,
    breedId: livestock.breedId,
    breedName: livestock.breed?.nameEn ?? livestock.breed?.nameBn ?? null,
    gender: livestock.gender,
    status: livestock.status,
    purpose: livestock.purpose,
    earTagNumber: livestock.earTagNumber,
    qrCodeUrl: livestock.qrCodeUrl,
    birthDate: livestock.birthDate?.toISOString() ?? null,
    purchaseDate: livestock.purchaseDate?.toISOString() ?? null,
    purchasePrice: livestock.purchasePrice ? Number(livestock.purchasePrice) : null,
    currentWeight: livestock.currentWeight ? Number(livestock.currentWeight) : null,
    groupId: livestock.groupId,
    groupName: livestock.group?.name ?? null,
    pregnancyStatus: livestock.pregnancyStatus,
    lastCalvingDate: livestock.lastCalvingDate?.toISOString() ?? null,
    lactationNumber: livestock.lactationNumber,
    color: livestock.color,
    markings: livestock.markings,
    notes: livestock.notes,
    imageUrl: livestock.images?.[0]?.imageUrl ?? null,
    ageInMonths: livestock.birthDate ? calculateAgeInMonths(livestock.birthDate) : null,
    createdAt: livestock.createdAt.toISOString(),
    updatedAt: livestock.updatedAt.toISOString(),
  };
}

function mapWeightRecordToResponse(record: any): WeightRecordResponse {
  return {
    id: record.id,
    livestockId: record.livestockId,
    weight: Number(record.weight),
    recordedAt: record.recordedAt.toISOString(),
    recordedBy: record.recordedBy,
    notes: record.notes,
    isMorning: record.isMorning,
    daysSinceLast: record.daysSinceLast,
    weightGain: record.weightGain ? Number(record.weightGain) : null,
    adg: record.adg ? Number(record.adg) : null,
    createdAt: record.createdAt.toISOString(),
  };
}

function mapLivestockGroupToResponse(group: any): LivestockGroupResponse {
  return {
    id: group.id,
    ownerId: group.ownerId,
    name: group.name,
    description: group.description,
    location: group.location,
    villageId: group.villageId,
    villageName: group.village?.nameBn ?? group.village?.name ?? null,
    livestockCount: group._count?.livestock ?? 0,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
  };
}

function mapHealthRecordToResponse(record: any): HealthRecordResponse {
  return {
    id: record.id,
    livestockId: record.livestockId,
    treatmentCaseId: record.treatmentCaseId,
    condition: record.condition,
    temperature: record.temperature ? Number(record.temperature) : null,
    symptoms: record.symptoms,
    diagnosis: record.diagnosis,
    treatment: record.treatment,
    recordedAt: record.recordedAt.toISOString(),
    recordedBy: record.recordedBy,
    createdAt: record.createdAt.toISOString(),
  };
}

function mapVaccinationToResponse(record: any): VaccinationResponse {
  return {
    id: record.id,
    livestockId: record.livestockId,
    vaccineName: record.vaccineName,
    vaccineType: record.vaccineType,
    batchNumber: record.batchNumber,
    administeredAt: record.administeredAt.toISOString(),
    administeredBy: record.administeredBy,
    nextDoseAt: record.nextDoseAt?.toISOString() ?? null,
    notes: record.notes,
    createdAt: record.createdAt.toISOString(),
  };
}
