/** Row from `GET /api/admin/doctors` */
export type AdminDoctorListRow = {
  id: string;
  displayName: string | null;
  degree: string | null;
  licenseNumber: string;
  specialization: string | null;
  providerStatus: string;
  verifiedAt: string | null;
  visitFeeBdt: string | null;
  acceptsEmergency: boolean;
  acceptsOnlineConsultation: boolean;
  verificationSummary: string;
  user: {
    email: string;
    phone: string | null;
    status: string;
  };
  counts: {
    workingAreas: number;
    serviceCategories: number;
  };
  updatedAt: string;
};

/** Detail from `GET /api/admin/doctors/[id]` — serialized doctor object */
export type AdminDoctorDetail = {
  id: string;
  userId: string;
  displayName: string | null;
  licenseNumber: string;
  degree: string | null;
  specialization: string | null;
  experienceYears: number | null;
  bio: string | null;
  profilePhotoUrl: string | null;
  visitFeeBdt: string | null;
  acceptsEmergency: boolean;
  acceptsOnlineConsultation: boolean;
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

export type AdminServiceCategoryOption = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};
