/** Row from `GET /api/admin/ai-technicians` */
export type AdminTechnicianListRow = {
  id: string;
  displayName: string | null;
  certification: string | null;
  providerStatus: string;
  verifiedAt: string | null;
  serviceFeeBdt: string | null;
  acceptsEmergency: boolean;
  verificationSummary: string;
  user: {
    email: string;
    phone: string | null;
    status: string;
  };
  counts: {
    workingAreas: number;
    villageServiceAreas: number;
    serviceCategories: number;
  };
  updatedAt: string;
};

/** Village geography nested shape from technician detail API */
export type AdminTechnicianVillageHierarchy = {
  id: string;
  name: string;
  slug: string;
  union: {
    name: string;
    slug: string;
    upazila: {
      name: string;
      slug: string;
      district: {
        name: string;
        slug: string;
        division: { name: string; slug: string };
      };
    };
  };
};

/** Detail from `GET /api/admin/ai-technicians/[id]` */
export type AdminTechnicianDetail = {
  id: string;
  userId: string;
  displayName: string | null;
  certification: string | null;
  bio: string | null;
  serviceFeeBdt: string | null;
  acceptsEmergency: boolean;
  metadataJson: unknown | null;
  providerStatus: string;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  verificationSummary: string;
  user: {
    id: string;
    email: string;
    phone: string | null;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  workingAreas: {
    id: string;
    priority: number | null;
    area: {
      id: string;
      name: string;
      nameBn: string | null;
      slug: string;
      type: string;
      isActive: boolean;
    };
  }[];
  villageServiceAreas: {
    id: string;
    priority: number | null;
    village: AdminTechnicianVillageHierarchy;
  }[];
  serviceCategories: {
    id: string;
    serviceCategory: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
    };
  }[];
};
