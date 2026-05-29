// Phase 4: Livestock Feed Ecosystem - Livestock Utilities

/**
 * Calculate age in months from birth date
 */
export function calculateAgeInMonths(birthDate: Date): number {
  const now = new Date();
  const years = now.getFullYear() - birthDate.getFullYear();
  const months = now.getMonth() - birthDate.getMonth();
  
  let ageInMonths = years * 12 + months;
  
  // Adjust if day of month hasn't been reached yet
  if (now.getDate() < birthDate.getDate()) {
    ageInMonths--;
  }
  
  return Math.max(0, ageInMonths);
}

/**
 * Calculate age in years and months for display
 */
export function formatAge(birthDate: Date): string {
  const months = calculateAgeInMonths(birthDate);
  
  if (months < 1) {
    const days = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} days`;
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }
  
  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  
  return `${years}y ${remainingMonths}m`;
}

/**
 * Calculate Average Daily Gain (ADG)
 * @param previousWeight - Previous weight in kg
 * @param currentWeight - Current weight in kg
 * @param days - Number of days between weighings
 * @returns ADG in kg/day
 */
export function calculateADG(
  previousWeight: number,
  currentWeight: number,
  days: number
): number | null {
  if (days <= 0) return null;
  
  const gain = currentWeight - previousWeight;
  return Number((gain / days).toFixed(4));
}

/**
 * Calculate Feed Conversion Ratio (FCR)
 * @param feedConsumed - Total feed consumed in kg
 * @param weightGain - Weight gain in kg
 * @returns FCR (lower is better)
 */
export function calculateFCR(
  feedConsumed: number,
  weightGain: number
): number | null {
  if (weightGain <= 0) return null;
  return Number((feedConsumed / weightGain).toFixed(2));
}

/**
 * Calculate Cost per kg of weight gain
 */
export function calculateCostPerKgGain(
  totalFeedCost: number,
  weightGain: number
): number | null {
  if (weightGain <= 0) return null;
  return Number((totalFeedCost / weightGain).toFixed(2));
}

/**
 * Estimate mature weight based on breed and current measurements
 * This is a simplified estimation - real implementation would use breed-specific curves
 */
export function estimateMatureWeight(
  animalType: string,
  breedName: string | null,
  currentWeight: number,
  ageInMonths: number
): number | null {
  // Simplified estimates for common Bangladesh breeds
  const breedMultipliers: Record<string, number> = {
    // Cattle breeds
    'Red Chittagong': 350,
    'Pabna': 400,
    'Sahiwal': 450,
    'Friesian': 550,
    'Jersey': 400,
    'Crossbred': 450,
    // Goat breeds
    'Black Bengal': 25,
    'Jamunapari': 45,
    'Boer': 80,
    // Sheep breeds
    'Garole': 20,
    'Baluchi': 35,
  };
  
  const baseWeight = breedName ? breedMultipliers[breedName] : null;
  
  if (!baseWeight) {
    // Default estimates by animal type
    const typeDefaults: Record<string, number> = {
      COW: 400,
      GOAT: 35,
      SHEEP: 30,
      BUFFALO: 500,
      CHICKEN: 2,
      DUCK: 2.5,
    };
    return typeDefaults[animalType] ?? null;
  }
  
  return baseWeight;
}

/**
 * Calculate Body Condition Score (BCS) from visual indicators
 * Returns a score from 1-5 (1 = emaciated, 5 = obese)
 * This is a placeholder - real implementation would use image analysis or manual input
 */
export function calculateBCS(
  currentWeight: number,
  expectedWeight: number,
  ageInMonths: number
): number {
  const ratio = currentWeight / expectedWeight;
  
  if (ratio < 0.7) return 1;
  if (ratio < 0.8) return 2;
  if (ratio < 0.9) return 3;
  if (ratio < 1.0) return 4;
  return 5;
}

/**
 * Format weight with appropriate units
 */
export function formatWeight(weight: number, unit: string = 'kg'): string {
  if (weight >= 1000 && unit === 'kg') {
    return `${(weight / 1000).toFixed(2)} ton`;
  }
  return `${weight.toFixed(2)} ${unit}`;
}

/**
 * Calculate daily nutritional requirements based on animal characteristics
 * Returns requirements in kg DM (Dry Matter)
 */
export function calculateNutritionalRequirements(
  animalType: string,
  weight: number,
  ageInMonths: number,
  purpose: string,
  isPregnant: boolean,
  lactationNumber: number | null
): {
  dmRequirement: number;
  cpRequirement: number;
  meRequirement: number;
  caRequirement: number;
  pRequirement: number;
} {
  // Simplified calculations based on NRC standards adapted for Bangladesh conditions
  // These are baseline requirements - real implementation would be more sophisticated
  
  let dmRequirement = 0;
  let cpRequirement = 0;
  let meRequirement = 0;
  let caRequirement = 0;
  let pRequirement = 0;
  
  // Base maintenance requirements
  if (animalType === 'COW' || animalType === 'BUFFALO') {
    dmRequirement = weight * 0.025; // 2.5% of body weight
    cpRequirement = weight * 0.008; // 8% of DM
    meRequirement = weight * 0.06; // Mcal/day
    caRequirement = weight * 0.003; // 0.3% of DM
    pRequirement = weight * 0.002; // 0.2% of DM
    
    // Adjust for lactation
    if (lactationNumber && lactationNumber > 0) {
      dmRequirement *= 1.3;
      cpRequirement *= 1.4;
      meRequirement *= 1.4;
      caRequirement *= 1.5;
      pRequirement *= 1.3;
    }
    
    // Adjust for pregnancy
    if (isPregnant) {
      dmRequirement *= 1.15;
      cpRequirement *= 1.2;
      meRequirement *= 1.15;
      caRequirement *= 1.4;
      pRequirement *= 1.3;
    }
    
    // Adjust for growth (young animals)
    if (ageInMonths < 24) {
      dmRequirement *= 1.1;
      cpRequirement *= 1.25;
      meRequirement *= 1.2;
    }
  } else if (animalType === 'GOAT' || animalType === 'SHEEP') {
    dmRequirement = weight * 0.035; // 3.5% of body weight (higher for small ruminants)
    cpRequirement = weight * 0.012; // 12% of DM
    meRequirement = weight * 0.25; // Mcal/day (per kg of metabolic weight)
    caRequirement = weight * 0.004;
    pRequirement = weight * 0.003;
    
    if (isPregnant) {
      dmRequirement *= 1.2;
      cpRequirement *= 1.3;
      meRequirement *= 1.2;
    }
  } else if (animalType === 'CHICKEN' || animalType === 'DUCK') {
    dmRequirement = weight * 0.05; // 5% for poultry
    cpRequirement = weight * 0.18; // 18-20% for poultry
    meRequirement = weight * 0.3;
  }
  
  return {
    dmRequirement: Number(dmRequirement.toFixed(2)),
    cpRequirement: Number(cpRequirement.toFixed(2)),
    meRequirement: Number(meRequirement.toFixed(2)),
    caRequirement: Number(caRequirement.toFixed(3)),
    pRequirement: Number(pRequirement.toFixed(3)),
  };
}

/**
 * Generate a unique ear tag number
 */
export function generateEarTagNumber(
  animalType: string,
  ownerId: string,
  sequence: number
): string {
  const typeCode = animalType.substring(0, 2).toUpperCase();
  const ownerCode = ownerId.substring(0, 4).toUpperCase();
  const dateCode = new Date().getFullYear().toString().substring(2);
  const seqCode = sequence.toString().padStart(4, '0');
  
  return `${typeCode}-${ownerCode}-${dateCode}-${seqCode}`;
}

/**
 * Check if animal is ready for breeding based on age and weight
 */
export function isReadyForBreeding(
  animalType: string,
  gender: string,
  ageInMonths: number,
  weight: number
): { ready: boolean; reason: string | null } {
  if (gender !== 'FEMALE') {
    return { ready: false, reason: 'Only females can be bred' };
  }
  
  const breedingCriteria: Record<string, { minAge: number; minWeight: number }> = {
    COW: { minAge: 15, minWeight: 250 },
    GOAT: { minAge: 8, minWeight: 20 },
    SHEEP: { minAge: 8, minWeight: 25 },
    BUFFALO: { minAge: 18, minWeight: 300 },
  };
  
  const criteria = breedingCriteria[animalType];
  if (!criteria) {
    return { ready: false, reason: 'Unknown animal type' };
  }
  
  if (ageInMonths < criteria.minAge) {
    return { ready: false, reason: `Too young. Minimum age: ${criteria.minAge} months` };
  }
  
  if (weight < criteria.minWeight) {
    return { ready: false, reason: `Underweight. Minimum weight: ${criteria.minWeight} kg` };
  }
  
  return { ready: true, reason: null };
}

/**
 * Calculate expected calving/kidding date from breeding date
 */
export function calculateExpectedBirthDate(
  animalType: string,
  breedingDate: Date
): Date {
  const gestationPeriods: Record<string, number> = {
    COW: 283,
    GOAT: 150,
    SHEEP: 147,
    BUFFALO: 310,
  };
  
  const days = gestationPeriods[animalType] ?? 280;
  const expectedDate = new Date(breedingDate);
  expectedDate.setDate(expectedDate.getDate() + days);
  
  return expectedDate;
}

/**
 * Format currency in Bangladeshi format
 */
export function formatCurrency(amount: number, currency: string = 'BDT'): string {
  const formatter = new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

/**
 * Convert between common Bangladeshi units
 */
export function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string
): number {
  // Conversion factors to kg
  const toKg: Record<string, number> = {
    kg: 1,
    g: 0.001,
    gram: 0.001,
    mon: 40, // 1 mon = 40 kg
    seer: 0.933, // 1 seer ≈ 0.933 kg
    bag: 50, // Standard 50kg bag
  };
  
  const kgValue = value * (toKg[fromUnit.toLowerCase()] ?? 1);
  const result = kgValue / (toKg[toUnit.toLowerCase()] ?? 1);
  
  return Number(result.toFixed(3));
}
