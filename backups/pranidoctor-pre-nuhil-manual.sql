--
-- PostgreSQL database dump
--

\restrict ZwLk74JSJykHovdBAiRIcOGkaOyHVyHTfrixLsrkz6sTkTEtpp5tctJ6ZTVSo3R

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AiPaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AiPaymentStatus" AS ENUM (
    'UNPAID',
    'CASH_PAID',
    'MANUAL_PAID',
    'DUE',
    'REFUNDED'
);


--
-- Name: AiServiceRequestStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AiServiceRequestStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'DECLINED',
    'ON_THE_WAY',
    'ARRIVED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: AiTechnicianComplaintStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AiTechnicianComplaintStatus" AS ENUM (
    'OPEN',
    'UNDER_REVIEW',
    'RESOLVED',
    'REJECTED'
);


--
-- Name: AiTechnicianDocumentReviewStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AiTechnicianDocumentReviewStatus" AS ENUM (
    'PENDING_REVIEW',
    'APPROVED',
    'REJECTED'
);


--
-- Name: AiTechnicianDocumentType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AiTechnicianDocumentType" AS ENUM (
    'NID_FRONT',
    'NID_BACK',
    'PROFILE_PHOTO',
    'TRAINING_CERTIFICATE',
    'AI_CERTIFICATE',
    'COMPANY_ID',
    'EXPERIENCE_PROOF',
    'OTHER'
);


--
-- Name: AiTechnicianReviewVisibility; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AiTechnicianReviewVisibility" AS ENUM (
    'VISIBLE',
    'HIDDEN'
);


--
-- Name: AiTechnicianServiceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AiTechnicianServiceStatus" AS ENUM (
    'DRAFT',
    'PENDING_REVIEW',
    'ACTIVE',
    'INACTIVE',
    'REJECTED'
);


--
-- Name: AiTechnicianStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AiTechnicianStatus" AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'NEEDS_CORRECTION',
    'APPROVED',
    'PUBLISHED',
    'REJECTED',
    'SUSPENDED'
);


--
-- Name: AnimalCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AnimalCategory" AS ENUM (
    'PET',
    'LIVESTOCK',
    'OTHER'
);


--
-- Name: AnimalType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AnimalType" AS ENUM (
    'CATTLE',
    'GOAT',
    'POULTRY',
    'DOG',
    'CAT',
    'OTHER'
);


--
-- Name: AreaType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AreaType" AS ENUM (
    'DIVISION',
    'DISTRICT',
    'UPAZILA',
    'UNION',
    'VILLAGE',
    'SERVICE_AREA'
);


--
-- Name: BillingStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BillingStatus" AS ENUM (
    'DRAFT',
    'ISSUED',
    'PARTIALLY_PAID',
    'PAID',
    'VOIDED',
    'REFUNDED'
);


--
-- Name: ComplaintStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ComplaintStatus" AS ENUM (
    'OPEN',
    'IN_REVIEW',
    'RESOLVED',
    'REJECTED',
    'CLOSED'
);


--
-- Name: ContentApprovalStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ContentApprovalStatus" AS ENUM (
    'DRAFT',
    'PENDING_REVIEW',
    'APPROVED',
    'REJECTED'
);


--
-- Name: Gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'UNKNOWN',
    'OTHER'
);


--
-- Name: MobileUploadPurpose; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MobileUploadPurpose" AS ENUM (
    'AI_TECHNICIAN_NID_FRONT',
    'AI_TECHNICIAN_NID_BACK',
    'AI_TECHNICIAN_PROFILE_PHOTO',
    'AI_TECHNICIAN_TRAINING_CERTIFICATE',
    'AI_TECHNICIAN_AI_CERTIFICATE',
    'AI_TECHNICIAN_OTHER'
);


--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationType" AS ENUM (
    'REQUEST_UPDATE',
    'PAYMENT',
    'CHAT',
    'SYSTEM',
    'MARKETING',
    'COMPLAINT',
    'REVIEW'
);


--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'BKASH',
    'NAGAD',
    'CARD',
    'BANK_TRANSFER',
    'OTHER',
    'ROCKET',
    'BANK'
);


--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'AUTHORIZED',
    'CAPTURED',
    'FAILED',
    'REFUNDED',
    'CANCELLED',
    'UNPAID',
    'PARTIAL',
    'PAID'
);


--
-- Name: PregnancyStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PregnancyStatus" AS ENUM (
    'UNKNOWN',
    'NOT_APPLICABLE',
    'NOT_PREGNANT',
    'PREGNANT'
);


--
-- Name: PrescriptionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PrescriptionStatus" AS ENUM (
    'ACTIVE',
    'VOIDED'
);


--
-- Name: ProviderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProviderStatus" AS ENUM (
    'PENDING_VERIFICATION',
    'ACTIVE',
    'SUSPENDED',
    'REJECTED'
);


--
-- Name: ReviewStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReviewStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'HIDDEN'
);


--
-- Name: ServiceRequestStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ServiceRequestStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'ASSIGNED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'REJECTED'
);


--
-- Name: ServiceRequestType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ServiceRequestType" AS ENUM (
    'DOCTOR_HOME_VISIT',
    'EMERGENCY_DOCTOR',
    'AI_SERVICE',
    'ONLINE_CONSULTATION_LATER'
);


--
-- Name: TreatmentCaseStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TreatmentCaseStatus" AS ENUM (
    'DRAFT',
    'FINALIZED',
    'CANCELLED'
);


--
-- Name: UploadedFileStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UploadedFileStatus" AS ENUM (
    'ACTIVE',
    'DELETED'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'CUSTOMER',
    'DOCTOR',
    'AI_TECHNICIAN',
    'SUPPORT',
    'SUPER_ADMIN'
);


--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'PENDING_VERIFICATION',
    'INVITED',
    'DELETED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AdminProfile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AdminProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "displayName" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: AiServiceRecord; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AiServiceRecord" (
    id text NOT NULL,
    "aiServiceRequestId" text NOT NULL,
    "technicianProfileId" text NOT NULL,
    "customerUserId" text NOT NULL,
    "serviceDate" timestamp(3) without time zone NOT NULL,
    "animalType" public."AnimalType" NOT NULL,
    "breedOrSemenType" text,
    "semenBatch" text,
    "heatObservation" text,
    "inseminationTime" timestamp(3) without time zone,
    "serviceNote" text,
    "nextFollowUpDate" timestamp(3) without time zone,
    "pregnancyCheckDate" timestamp(3) without time zone,
    "totalFee" numeric(12,2),
    "paymentStatus" public."AiPaymentStatus" DEFAULT 'UNPAID'::public."AiPaymentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: AiServiceRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AiServiceRequest" (
    id text NOT NULL,
    "customerUserId" text NOT NULL,
    "technicianProfileId" text,
    "serviceId" text,
    "animalType" public."AnimalType" NOT NULL,
    breed text,
    "animalAge" text,
    "lastHeatDate" timestamp(3) without time zone,
    "heatSymptoms" text,
    "previousAiHistory" text,
    "healthIssueNote" text,
    district text NOT NULL,
    upazila text NOT NULL,
    "unionOrArea" text,
    "addressDetail" text,
    "preferredTime" text,
    "isEmergency" boolean DEFAULT false NOT NULL,
    status public."AiServiceRequestStatus" DEFAULT 'PENDING'::public."AiServiceRequestStatus" NOT NULL,
    "estimatedFee" numeric(12,2),
    "finalFee" numeric(12,2),
    "paymentStatus" public."AiPaymentStatus" DEFAULT 'UNPAID'::public."AiPaymentStatus" NOT NULL,
    "linkedServiceRequestId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "declineReason" text
);


--
-- Name: AiTechnicianComplaint; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AiTechnicianComplaint" (
    id text NOT NULL,
    "aiServiceRequestId" text,
    "technicianProfileId" text NOT NULL,
    "customerUserId" text NOT NULL,
    category text NOT NULL,
    message text NOT NULL,
    status public."AiTechnicianComplaintStatus" DEFAULT 'OPEN'::public."AiTechnicianComplaintStatus" NOT NULL,
    "adminNote" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: AiTechnicianDivisionServiceArea; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AiTechnicianDivisionServiceArea" (
    id text NOT NULL,
    "aiTechnicianId" text NOT NULL,
    district text NOT NULL,
    upazila text NOT NULL,
    "unionOrArea" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "districtId" text,
    "unionId" text,
    "upazilaId" text
);


--
-- Name: AiTechnicianDocument; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AiTechnicianDocument" (
    id text NOT NULL,
    "aiTechnicianId" text NOT NULL,
    type public."AiTechnicianDocumentType" NOT NULL,
    title text NOT NULL,
    "fileUrl" text,
    "storageKey" text,
    "mimeType" text,
    "reviewStatus" public."AiTechnicianDocumentReviewStatus" DEFAULT 'PENDING_REVIEW'::public."AiTechnicianDocumentReviewStatus" NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "uploadedFileId" text
);


--
-- Name: AiTechnicianProfile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AiTechnicianProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    certification text,
    bio text,
    "providerStatus" public."ProviderStatus" DEFAULT 'PENDING_VERIFICATION'::public."ProviderStatus" NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "acceptsEmergency" boolean DEFAULT false NOT NULL,
    "displayName" text,
    "metadataJson" jsonb,
    "serviceFeeBdt" numeric(12,2),
    "adminNote" text,
    "certificateNumber" text,
    "correctionNote" text,
    "dateOfBirth" timestamp(3) without time zone,
    district text,
    email text,
    "experienceYears" integer,
    gender public."Gender",
    "nidNumber" text,
    phone text,
    "presentAddress" text,
    "publishedAt" timestamp(3) without time zone,
    "reviewedAt" timestamp(3) without time zone,
    "reviewedById" text,
    status public."AiTechnicianStatus" DEFAULT 'UNDER_REVIEW'::public."AiTechnicianStatus" NOT NULL,
    "trainingProvider" text,
    "unionOrArea" text,
    upazila text,
    "districtId" text,
    "unionId" text,
    "upazilaId" text
);


--
-- Name: AiTechnicianProfileArea; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AiTechnicianProfileArea" (
    id text NOT NULL,
    "aiTechnicianId" text NOT NULL,
    "areaId" text NOT NULL,
    priority integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AiTechnicianProfileServiceCategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AiTechnicianProfileServiceCategory" (
    id text NOT NULL,
    "aiTechnicianId" text NOT NULL,
    "serviceCategoryId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AiTechnicianReview; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AiTechnicianReview" (
    id text NOT NULL,
    "aiServiceRequestId" text NOT NULL,
    "technicianProfileId" text NOT NULL,
    "customerUserId" text NOT NULL,
    rating integer NOT NULL,
    comment text,
    visibility public."AiTechnicianReviewVisibility" DEFAULT 'VISIBLE'::public."AiTechnicianReviewVisibility" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: AiTechnicianService; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AiTechnicianService" (
    id text NOT NULL,
    "aiTechnicianId" text NOT NULL,
    title text NOT NULL,
    "animalType" public."AnimalType" NOT NULL,
    "breedOrSemenType" text,
    description text,
    "basePrice" numeric(12,2) NOT NULL,
    "visitFee" numeric(12,2),
    "emergencyFee" numeric(12,2),
    "repeatServicePolicy" text,
    "followUpIncluded" boolean DEFAULT false NOT NULL,
    status public."AiTechnicianServiceStatus" DEFAULT 'DRAFT'::public."AiTechnicianServiceStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: AiTechnicianServiceArea; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AiTechnicianServiceArea" (
    id text NOT NULL,
    "aiTechnicianId" text NOT NULL,
    "villageId" text NOT NULL,
    priority integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AnimalProfile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AnimalProfile" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    name text NOT NULL,
    species text NOT NULL,
    breed text,
    category public."AnimalCategory" DEFAULT 'OTHER'::public."AnimalCategory" NOT NULL,
    "dateOfBirth" timestamp(3) without time zone,
    sex text,
    "microchipOrTag" text,
    notes text,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "animalType" public."AnimalType",
    gender public."Gender",
    "weightKg" numeric(10,3),
    "photoUrl" text,
    "pregnancyStatus" public."PregnancyStatus"
);


--
-- Name: Area; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Area" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "parentId" text,
    "metadataJson" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    code text,
    "isActive" boolean DEFAULT true NOT NULL,
    "nameBn" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    type public."AreaType" DEFAULT 'DIVISION'::public."AreaType" NOT NULL
);


--
-- Name: BillingRecord; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BillingRecord" (
    id text NOT NULL,
    "serviceRequestId" text NOT NULL,
    "doctorId" text,
    "customerId" text NOT NULL,
    currency text DEFAULT 'BDT'::text NOT NULL,
    subtotal numeric(14,2),
    tax numeric(14,2),
    total numeric(14,2),
    "issuedAt" timestamp(3) without time zone,
    "paidAt" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "aiTechnicianId" text,
    "discountAmount" numeric(14,2),
    "medicineCost" numeric(14,2),
    "platformCommission" numeric(14,2),
    "providerPayout" numeric(14,2),
    "serviceFee" numeric(14,2),
    "totalCollected" numeric(14,2),
    "travelCost" numeric(14,2),
    "treatmentCaseId" text,
    status public."BillingStatus" DEFAULT 'DRAFT'::public."BillingStatus" NOT NULL,
    "paymentMethod" public."PaymentMethod",
    "paymentStatus" public."PaymentStatus" DEFAULT 'UNPAID'::public."PaymentStatus" NOT NULL
);


--
-- Name: Complaint; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Complaint" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "doctorId" text,
    "aiTechnicianId" text,
    "adminAssigneeId" text,
    "serviceRequestId" text,
    "billingRecordId" text,
    status public."ComplaintStatus" DEFAULT 'OPEN'::public."ComplaintStatus" NOT NULL,
    "resolutionNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ContentCategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContentCategory" (
    id text NOT NULL,
    "nameBn" text NOT NULL,
    "nameEn" text,
    slug text NOT NULL,
    description text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ContentPost; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContentPost" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    body text NOT NULL,
    "authorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    summary text,
    "coverImageUrl" text,
    "categoryId" text NOT NULL,
    "approvalStatus" public."ContentApprovalStatus" DEFAULT 'DRAFT'::public."ContentApprovalStatus" NOT NULL,
    "rejectionReason" text,
    "publishedAt" timestamp(3) without time zone,
    "isPublished" boolean DEFAULT false NOT NULL
);


--
-- Name: CustomerProfile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CustomerProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "displayName" text NOT NULL,
    locale text DEFAULT 'bn-BD'::text,
    "addressJson" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: District; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."District" (
    id text NOT NULL,
    "divisionId" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    code text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "nameBn" text,
    "nameEn" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7),
    source text
);


--
-- Name: Division; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Division" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    code text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "nameBn" text,
    "nameEn" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7),
    source text
);


--
-- Name: DoctorProfile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DoctorProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "licenseNumber" text NOT NULL,
    specialization text,
    bio text,
    "verifiedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "providerStatus" public."ProviderStatus" DEFAULT 'PENDING_VERIFICATION'::public."ProviderStatus" NOT NULL,
    "acceptsEmergency" boolean DEFAULT false NOT NULL,
    "acceptsOnlineConsultation" boolean DEFAULT false NOT NULL,
    degree text,
    "displayName" text,
    "experienceYears" integer,
    "profilePhotoUrl" text,
    "visitFeeBdt" numeric(12,2)
);


--
-- Name: DoctorProfileArea; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DoctorProfileArea" (
    id text NOT NULL,
    "doctorId" text NOT NULL,
    "areaId" text NOT NULL,
    priority integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: DoctorProfileServiceCategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DoctorProfileServiceCategory" (
    id text NOT NULL,
    "doctorId" text NOT NULL,
    "serviceCategoryId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: DoctorServiceArea; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DoctorServiceArea" (
    id text NOT NULL,
    "doctorId" text NOT NULL,
    "villageId" text NOT NULL,
    priority integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: MobileOtpChallenge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MobileOtpChallenge" (
    id text NOT NULL,
    "normalizedPhone" text NOT NULL,
    "codeHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "verifyAttempts" integer DEFAULT 0 NOT NULL,
    "sendWindowStartedAt" timestamp(3) without time zone,
    "sendsInWindow" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "lastOtpSentAt" timestamp(3) without time zone
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    "readAt" timestamp(3) without time zone,
    "metadataJson" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type public."NotificationType" DEFAULT 'SYSTEM'::public."NotificationType" NOT NULL
);


--
-- Name: PaymentRecord; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PaymentRecord" (
    id text NOT NULL,
    "billingRecordId" text,
    "serviceRequestId" text,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    method public."PaymentMethod" NOT NULL,
    amount numeric(14,2) NOT NULL,
    currency text DEFAULT 'BDT'::text NOT NULL,
    "externalId" text,
    "paidAt" timestamp(3) without time zone,
    "metadataJson" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Prescription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Prescription" (
    id text NOT NULL,
    "serviceRequestId" text NOT NULL,
    "doctorId" text,
    "animalId" text NOT NULL,
    status public."PrescriptionStatus" DEFAULT 'ACTIVE'::public."PrescriptionStatus" NOT NULL,
    instructions text,
    "validUntil" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "aiTechnicianId" text
);


--
-- Name: PrescriptionItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PrescriptionItem" (
    id text NOT NULL,
    "prescriptionId" text NOT NULL,
    "medicineName" text NOT NULL,
    dosage text,
    duration text,
    instruction text,
    quantity numeric(12,3),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Review; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "doctorId" text,
    "aiTechnicianId" text,
    "serviceRequestId" text,
    rating integer NOT NULL,
    comment text,
    status public."ReviewStatus" DEFAULT 'PENDING'::public."ReviewStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ServiceCategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ServiceCategory" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ServiceRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ServiceRequest" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "animalId" text NOT NULL,
    "areaId" text,
    "serviceCategoryId" text NOT NULL,
    "assignedDoctorId" text,
    status public."ServiceRequestStatus" DEFAULT 'PENDING'::public."ServiceRequestStatus" NOT NULL,
    urgency text,
    symptoms text,
    "preferredWindow" text,
    "locationNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "assignedAiTechnicianId" text,
    "assignedAt" timestamp(3) without time zone,
    "cancelledAt" timestamp(3) without time zone,
    "emergencyNotes" text,
    "isEmergency" boolean DEFAULT false NOT NULL,
    "requestType" public."ServiceRequestType" DEFAULT 'DOCTOR_HOME_VISIT'::public."ServiceRequestType" NOT NULL,
    "scheduledEnd" timestamp(3) without time zone,
    "scheduledStart" timestamp(3) without time zone,
    "startedAt" timestamp(3) without time zone,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "villageId" text,
    description text,
    "cancelReason" text
);


--
-- Name: Setting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Setting" (
    id text NOT NULL,
    key text NOT NULL,
    "valueJson" jsonb NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: TreatmentRecord; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TreatmentRecord" (
    id text NOT NULL,
    "serviceRequestId" text NOT NULL,
    "doctorId" text,
    "animalId" text NOT NULL,
    "chiefComplaint" text,
    diagnosis text,
    procedures text,
    "followUpNotes" text,
    "recordedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "aiTechnicianId" text,
    "followUpDate" timestamp(3) without time zone,
    symptoms text,
    "treatmentNotes" text,
    status public."TreatmentCaseStatus" DEFAULT 'DRAFT'::public."TreatmentCaseStatus" NOT NULL
);


--
-- Name: Union; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Union" (
    id text NOT NULL,
    "upazilaId" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    code text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "nameBn" text,
    "nameEn" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7),
    source text
);


--
-- Name: Upazila; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Upazila" (
    id text NOT NULL,
    "districtId" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    code text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "nameBn" text,
    "nameEn" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7),
    source text
);


--
-- Name: UploadedFile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UploadedFile" (
    id text NOT NULL,
    "ownerUserId" text NOT NULL,
    bucket text NOT NULL,
    "storageKey" text NOT NULL,
    "originalName" text NOT NULL,
    "mimeType" text NOT NULL,
    "sizeBytes" integer NOT NULL,
    "fileCategory" public."MobileUploadPurpose" NOT NULL,
    "publicUrl" text,
    checksum text,
    width integer,
    height integer,
    status public."UploadedFileStatus" DEFAULT 'ACTIVE'::public."UploadedFileStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    phone text,
    "passwordHash" text NOT NULL,
    role public."UserRole" NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Village; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Village" (
    id text NOT NULL,
    "unionId" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    code text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7),
    "nameBn" text,
    "nameEn" text,
    source text
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: AdminProfile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AdminProfile" (id, "userId", "displayName", "createdAt", "updatedAt") FROM stdin;
cmox9kcnr0001nk8o0nil7zne	cmox9kcky0000nk8oz9yu2h9w	Prani Doctor Admin	2026-05-08 18:43:56.055	2026-05-08 20:14:56.322
cmoy32w9l0001508odfzr6azi	cmoy32w8y0000508o4ngdc3pv	Prani Doctor Admin	2026-05-09 08:30:10.137	2026-05-10 12:25:35.026
\.


--
-- Data for Name: AiServiceRecord; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AiServiceRecord" (id, "aiServiceRequestId", "technicianProfileId", "customerUserId", "serviceDate", "animalType", "breedOrSemenType", "semenBatch", "heatObservation", "inseminationTime", "serviceNote", "nextFollowUpDate", "pregnancyCheckDate", "totalFee", "paymentStatus", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AiServiceRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AiServiceRequest" (id, "customerUserId", "technicianProfileId", "serviceId", "animalType", breed, "animalAge", "lastHeatDate", "heatSymptoms", "previousAiHistory", "healthIssueNote", district, upazila, "unionOrArea", "addressDetail", "preferredTime", "isEmergency", status, "estimatedFee", "finalFee", "paymentStatus", "linkedServiceRequestId", "createdAt", "updatedAt", "declineReason") FROM stdin;
\.


--
-- Data for Name: AiTechnicianComplaint; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AiTechnicianComplaint" (id, "aiServiceRequestId", "technicianProfileId", "customerUserId", category, message, status, "adminNote", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AiTechnicianDivisionServiceArea; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AiTechnicianDivisionServiceArea" (id, "aiTechnicianId", district, upazila, "unionOrArea", "isActive", "createdAt", "updatedAt", "districtId", "unionId", "upazilaId") FROM stdin;
cmozqabf700035c8oejusgo7d	cmozq6t8g00025c8ozshnjxav	Gopalgonj	Gopalgonj Sadar	Kazulia	t	2026-05-10 12:07:33.715	2026-05-10 12:07:33.715	\N	\N	\N
cmozskd3q0000yo8opg2kamjo	cmozq6t8g00025c8ozshnjxav	গোপালগঞ্জ	গোপালগঞ্জ সদর	কাজুলিয়া	t	2026-05-10 13:11:21.687	2026-05-10 13:11:21.687	cmozqxhy2000yzo8oqgylx1er	cmozqxhza0014zo8o3cn91dsg	cmozqxhyn0011zo8oeum3cm8h
\.


--
-- Data for Name: AiTechnicianDocument; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AiTechnicianDocument" (id, "aiTechnicianId", type, title, "fileUrl", "storageKey", "mimeType", "reviewStatus", "uploadedAt", "createdAt", "updatedAt", "uploadedFileId") FROM stdin;
cmozsm4dl0002yo8ouj0rfcel	cmozq6t8g00025c8ozshnjxav	NID_FRONT	জাতীয় পরিচয়পত্র (সামনে)	\N	uploads/v1/demo-seed-user-customer/AI_TECHNICIAN_NID_FRONT/844ee83e-0d0b-4cb6-8d85-c28553780cbe-Screenshot_2026-05-09-16-31-58-018_com.facebook.katana.jpg.webp	image/webp	PENDING_REVIEW	2026-05-10 13:12:43.689	2026-05-10 13:12:43.689	2026-05-10 13:12:43.689	cmozsm4120001yo8o3ek9j1zc
cmozsmtrd0004yo8o72i1jn3x	cmozq6t8g00025c8ozshnjxav	NID_BACK	জাতীয় পরিচয়পত্র (পিছনে)	\N	uploads/v1/demo-seed-user-customer/AI_TECHNICIAN_NID_BACK/bca0a7e5-44bf-4657-8898-b11e982ddca7-Screenshot_2026-05-10-18-09-42-386_com.example.pranidoctor_mobile.jpg.webp	image/webp	PENDING_REVIEW	2026-05-10 13:13:16.585	2026-05-10 13:13:16.585	2026-05-10 13:13:16.585	cmozsmtpx0003yo8oazrb3zw8
cmozswj2u0006yo8op8xwor2w	cmozq6t8g00025c8ozshnjxav	TRAINING_CERTIFICATE	প্রশিক্ষণ সার্টিফিকেট	\N	uploads/v1/demo-seed-user-customer/AI_TECHNICIAN_TRAINING_CERTIFICATE/b7a63a0e-456f-43c7-932a-edb166f6a179-IMG_20251202_004233.jpg.webp	image/webp	PENDING_REVIEW	2026-05-10 13:20:49.302	2026-05-10 13:20:49.302	2026-05-10 13:20:49.302	cmozswj130005yo8oyxu2ge82
\.


--
-- Data for Name: AiTechnicianProfile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AiTechnicianProfile" (id, "userId", certification, bio, "providerStatus", "verifiedAt", "createdAt", "updatedAt", "acceptsEmergency", "displayName", "metadataJson", "serviceFeeBdt", "adminNote", "certificateNumber", "correctionNote", "dateOfBirth", district, email, "experienceYears", gender, "nidNumber", phone, "presentAddress", "publishedAt", "reviewedAt", "reviewedById", status, "trainingProvider", "unionOrArea", upazila, "districtId", "unionId", "upazilaId") FROM stdin;
cmozq6t8g00025c8ozshnjxav	demo-seed-user-customer	2018	Ai technician	ACTIVE	2026-05-10 13:27:02.064	2026-05-10 12:04:50.176	2026-05-10 13:27:02.072	t	Bala G	\N	600.00	Good	63738	\N	\N	গোপালগঞ্জ	balag.bd@gmail.com	6	MALE	73784827367384	01701022274	Gopalgonj sadar upozila	2026-05-10 13:21:47.192	2026-05-10 13:21:47.192	cmoy32w8y0000508o4ngdc3pv	PUBLISHED	ADL	কাজুলিয়া	গোপালগঞ্জ সদর	cmozqxhy2000yzo8oqgylx1er	cmozqxhza0014zo8o3cn91dsg	cmozqxhyn0011zo8oeum3cm8h
cmoyugh57001nz88o72gcbp7f	cmoyugh54001mz88od13nhoyd	PD-DEMO-AI-CERT-3	ডেমো এআই টেকনিশিয়ান — ডেভেলপমেন্ট ওনলি	ACTIVE	2026-05-10 05:59:50.689	2026-05-09 21:16:33.355	2026-05-10 13:27:32.394	t	ডেমো এআই টেক — চট্টগ্রাম	{"demoSeed": true, "livestockFocus": ["cattle", "goat"], "experienceYears": 6}	1300.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PUBLISHED	\N	\N	\N	\N	\N	\N
cmoyugh35001dz88oypjycacv	cmoyugh2z001cz88o0ciz9ort	PD-DEMO-AI-CERT-1	ডেমো এআই টেকনিশিয়ান — ডেভেলপমেন্ট ওনলি	ACTIVE	2026-05-10 05:59:50.636	2026-05-09 21:16:33.281	2026-05-10 05:59:50.638	t	ডেমো এআই টেক — আশুলিয়া	{"demoSeed": true, "livestockFocus": ["cattle", "goat"], "experienceYears": 4}	1100.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PUBLISHED	\N	\N	\N	\N	\N	\N
cmoyugh45001iz88o0uzaxs4r	cmoyugh40001hz88ojc4pa6x3	PD-DEMO-AI-CERT-2	ডেমো এআই টেকনিশিয়ান — ডেভেলপমেন্ট ওনলি	ACTIVE	2026-05-10 05:59:50.669	2026-05-09 21:16:33.317	2026-05-10 05:59:50.67	f	ডেমো এআই টেক — গাজীপুর	{"demoSeed": true, "livestockFocus": ["cattle", "goat"], "experienceYears": 5}	1200.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PUBLISHED	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: AiTechnicianProfileArea; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AiTechnicianProfileArea" (id, "aiTechnicianId", "areaId", priority, "createdAt") FROM stdin;
cmoyugh3c001ez88oeisvbk74	cmoyugh35001dz88oypjycacv	cmoxcg56t000gmg8ofe2hikzd	1	2026-05-09 21:16:33.288
cmoyugh4b001jz88oygxqbowl	cmoyugh45001iz88o0uzaxs4r	cmoyu3tqb00088g8o47if7wcd	1	2026-05-09 21:16:33.323
cmoyugh5c001oz88ov3la3xnf	cmoyugh57001nz88o72gcbp7f	cmoyu3tqs00098g8o5d8orcoc	1	2026-05-09 21:16:33.36
\.


--
-- Data for Name: AiTechnicianProfileServiceCategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AiTechnicianProfileServiceCategory" (id, "aiTechnicianId", "serviceCategoryId", "createdAt") FROM stdin;
cmoyugh3u001gz88omw42fgge	cmoyugh35001dz88oypjycacv	cmoxc48ht0004ac8od32irc7f	2026-05-09 21:16:33.306
cmoyugh4y001lz88oc49va2dh	cmoyugh45001iz88o0uzaxs4r	cmoxc48ht0004ac8od32irc7f	2026-05-09 21:16:33.346
cmoyugh5m001qz88oz1vf0cu5	cmoyugh57001nz88o72gcbp7f	cmoxc48ht0004ac8od32irc7f	2026-05-09 21:16:33.37
\.


--
-- Data for Name: AiTechnicianReview; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AiTechnicianReview" (id, "aiServiceRequestId", "technicianProfileId", "customerUserId", rating, comment, visibility, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AiTechnicianService; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AiTechnicianService" (id, "aiTechnicianId", title, "animalType", "breedOrSemenType", description, "basePrice", "visitFee", "emergencyFee", "repeatServicePolicy", "followUpIncluded", status, "createdAt", "updatedAt") FROM stdin;
cmozt27ce0007yo8ojmd5otok	cmozq6t8g00025c8ozshnjxav	গরুর বীজ	CATTLE	হলেস্টিয়ান ফ্রিজিয়ান	১০০% সিমেন ভাল জাতের	450.00	150.00	200.00	যোগাযোগ করুন	f	DRAFT	2026-05-10 13:25:14.03	2026-05-10 13:25:14.03
\.


--
-- Data for Name: AiTechnicianServiceArea; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AiTechnicianServiceArea" (id, "aiTechnicianId", "villageId", priority, "createdAt") FROM stdin;
cmoyugh3j001fz88oux20vrpj	cmoyugh35001dz88oypjycacv	cmoxc48jj000gac8ojoogi46b	1	2026-05-09 21:16:33.295
cmoyugh4p001kz88o9htd2ia4	cmoyugh45001iz88o0uzaxs4r	cmoxc48jj000gac8ojoogi46b	1	2026-05-09 21:16:33.337
cmoyugh5f001pz88oz9tgbwur	cmoyugh57001nz88o72gcbp7f	cmoxc48jj000gac8ojoogi46b	1	2026-05-09 21:16:33.363
\.


--
-- Data for Name: AnimalProfile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AnimalProfile" (id, "customerId", name, species, breed, category, "dateOfBirth", sex, "microchipOrTag", notes, active, "createdAt", "updatedAt", "animalType", gender, "weightKg", "photoUrl", "pregnancyStatus") FROM stdin;
demo-seed-animal-1	demo-seed-cprofile-customer	লালী	গরু	সাহিওয়াল	LIVESTOCK	\N	\N	\N	ডেমো প্রাণী — উন্নত স্বাস্থ্য	t	2026-05-09 21:16:32.979	2026-05-10 05:59:50.446	CATTLE	UNKNOWN	220.000	\N	NOT_APPLICABLE
demo-seed-animal-2	demo-seed-cprofile-customer	ছোটন	ছাগল	ব্ল্যাক বেঙ্গল	LIVESTOCK	\N	\N	\N	ডেমো প্রাণী — উন্নত স্বাস্থ্য	t	2026-05-09 21:16:32.997	2026-05-10 05:59:50.458	GOAT	UNKNOWN	28.000	\N	NOT_APPLICABLE
demo-seed-animal-3	demo-seed-cprofile-customer	মোহনা	ভেড়া	ক্রসব্রিড	LIVESTOCK	\N	\N	\N	ডেমো প্রাণী — উন্নত স্বাস্থ্য	t	2026-05-09 21:16:33.003	2026-05-10 05:59:50.463	GOAT	UNKNOWN	28.000	\N	NOT_APPLICABLE
demo-seed-animal-4	demo-seed-cprofile-customer	পোল্ট্রি ব্যাচ ১	মুরগি	ব্রয়লার	LIVESTOCK	\N	\N	\N	ডেমো প্রাণী — উন্নত স্বাস্থ্য	t	2026-05-09 21:16:33.011	2026-05-10 05:59:50.468	POULTRY	UNKNOWN	2.500	\N	NOT_APPLICABLE
demo-seed-animal-5	demo-seed-cprofile-customer	হাঁসের দল	হাঁস	পেকিন	LIVESTOCK	\N	\N	\N	ডেমো প্রাণী — উন্নত স্বাস্থ্য	t	2026-05-09 21:16:33.018	2026-05-10 05:59:50.474	POULTRY	UNKNOWN	2.500	\N	NOT_APPLICABLE
demo-seed-animal-6	demo-seed-cprofile-customer	মায়া	মহিষ	মুরাহা	LIVESTOCK	\N	\N	\N	ডেমো প্রাণী — উন্নত স্বাস্থ্য	t	2026-05-09 21:16:33.023	2026-05-10 05:59:50.478	CATTLE	UNKNOWN	220.000	\N	NOT_APPLICABLE
\.


--
-- Data for Name: Area; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Area" (id, name, slug, "parentId", "metadataJson", "createdAt", "updatedAt", code, "isActive", "nameBn", "sortOrder", type) FROM stdin;
cmoxcg563000cmg8ofvvkr6i9	Dhaka District	dhaka-district-area	cmox9kcpa0007nk8ob037u195	\N	2026-05-08 20:04:38.571	2026-05-10 12:25:35.117	3026	t	ঢাকা জেলা	1	DISTRICT
cmoxcg56a000dmg8ow56x8zu0	Gazipur District	gazipur-district-area	cmox9kcpa0007nk8ob037u195	\N	2026-05-08 20:04:38.578	2026-05-10 12:25:35.121	3033	t	গাজীপুর জেলা	2	DISTRICT
cmoxcg56h000emg8o3zbxe92g	Savar Upazila	savar-upazila-area	cmoxcg563000cmg8ofvvkr6i9	\N	2026-05-08 20:04:38.585	2026-05-10 12:25:35.131	302633	t	সাভার উপজেলা	1	UPAZILA
cmoxcg56l000fmg8o6z8idnv1	Gazipur Sadar Upazila	gazipur-sadar-upazila-area	cmoxcg56a000dmg8ow56x8zu0	\N	2026-05-08 20:04:38.589	2026-05-10 12:25:35.138	303318	t	গাজীপুর সদর উপজেলা	1	UPAZILA
cmoxcg56t000gmg8ofe2hikzd	Ashulia Union	ashulia-union-area	cmoxcg56h000emg8o3zbxe92g	\N	2026-05-08 20:04:38.597	2026-05-10 12:25:35.149	\N	t	আশুলিয়া ইউনিয়ন	1	UNION
cmoxcg56x000hmg8ollqih639	Konabari Union	konabari-union-area	cmoxcg56l000fmg8o6z8idnv1	\N	2026-05-08 20:04:38.601	2026-05-10 12:25:35.154	\N	t	কোনাবাড়ী ইউনিয়ন	1	UNION
cmoyu3tqb00088g8o47if7wcd	Narayanganj District	demo-narayanganj-district	cmox9kcpa0007nk8ob037u195	{"region": "BD", "demoSeed": true}	2026-05-09 21:06:43.139	2026-05-10 05:59:50.34	3067	t	নারায়ণগঞ্জ জেলা	40	DISTRICT
cmoyu3tqs00098g8o5d8orcoc	Chattogram District	demo-chattogram-district	\N	{"region": "BD", "demoSeed": true}	2026-05-09 21:06:43.156	2026-05-10 05:59:50.355	2015	t	চট্টগ্রাম জেলা	10	DISTRICT
cmoyu3tqw000a8g8o19so7ci5	Cumilla District	demo-cumilla-district	\N	{"region": "BD", "demoSeed": true}	2026-05-09 21:06:43.16	2026-05-10 05:59:50.359	3109	t	কুমিল্লা জেলা	20	DISTRICT
cmoyu3tr0000b8g8olgyg2uqc	Rajshahi District	demo-rajshahi-district	\N	{"region": "BD", "demoSeed": true}	2026-05-09 21:06:43.165	2026-05-10 05:59:50.363	5081	t	রাজশাহী জেলা	30	DISTRICT
cmoyu3tr5000c8g8ovpjfw794	Bogura District	demo-bogura-district	\N	{"region": "BD", "demoSeed": true}	2026-05-09 21:06:43.169	2026-05-10 05:59:50.367	5010	t	বগুড়া জেলা	35	DISTRICT
cmoyu3trb000d8g8ojz3pcdts	Rangpur District	demo-rangpur-district	\N	{"region": "BD", "demoSeed": true}	2026-05-09 21:06:43.175	2026-05-10 05:59:50.372	5585	t	রংপুর জেলা	36	DISTRICT
cmoyu3tre000e8g8oiwmd3jcp	Sylhet District	demo-sylhet-district	\N	{"region": "BD", "demoSeed": true}	2026-05-09 21:06:43.178	2026-05-10 05:59:50.376	6091	t	সিলেট জেলা	37	DISTRICT
cmoyu3trj000f8g8o6o7m1zey	Khulna District	demo-khulna-district	\N	{"region": "BD", "demoSeed": true}	2026-05-09 21:06:43.183	2026-05-10 05:59:50.38	4047	t	খুলনা জেলা	38	DISTRICT
cmoyu3tro000g8g8otm6fy09y	Barishal District	demo-barishal-district	\N	{"region": "BD", "demoSeed": true}	2026-05-09 21:06:43.188	2026-05-10 05:59:50.384	4010	t	বরিশাল জেলা	39	DISTRICT
cmox9kcov0006nk8ox5o99o79	Bangladesh (legacy root)	bangladesh	\N	{"note": "Root coverage placeholder for MVP seed"}	2026-05-08 18:43:56.095	2026-05-10 12:25:35.102	\N	f	\N	-100	DIVISION
cmox9kcpa0007nk8ob037u195	Dhaka Division	dhaka-division	\N	{"division": "Dhaka"}	2026-05-08 18:43:56.11	2026-05-10 12:25:35.111	30	t	ঢাকা বিভাগ	0	DIVISION
\.


--
-- Data for Name: BillingRecord; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BillingRecord" (id, "serviceRequestId", "doctorId", "customerId", currency, subtotal, tax, total, "issuedAt", "paidAt", notes, "createdAt", "updatedAt", "aiTechnicianId", "discountAmount", "medicineCost", "platformCommission", "providerPayout", "serviceFee", "totalCollected", "travelCost", "treatmentCaseId", status, "paymentMethod", "paymentStatus") FROM stdin;
demo-seed-bill-paid	demo-seed-sr-05-completed	cmoyuggwd000iz88oqqtns4i5	demo-seed-cprofile-customer	BDT	2500.00	0.00	2500.00	2026-05-09 21:16:33.454	2026-05-10 05:59:50.766	ডেমো বিল — পরিশোধিত	2026-05-09 21:16:33.455	2026-05-10 05:59:50.768	\N	\N	\N	\N	\N	2000.00	\N	500.00	\N	PAID	BKASH	PAID
demo-seed-bill-unpaid	demo-seed-sr-01-pending	\N	demo-seed-cprofile-customer	BDT	1500.00	\N	1500.00	\N	\N	ডেমো বিল — অপরিশোধিত	2026-05-09 21:16:33.469	2026-05-10 05:59:50.782	\N	\N	\N	\N	\N	1500.00	\N	\N	\N	DRAFT	\N	UNPAID
\.


--
-- Data for Name: Complaint; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Complaint" (id, "customerId", "doctorId", "aiTechnicianId", "adminAssigneeId", "serviceRequestId", "billingRecordId", status, "resolutionNotes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ContentCategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContentCategory" (id, "nameBn", "nameEn", slug, description, "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
cmigrationhub00000001	অশ্রেণীকৃত	Uncategorized	uncategorized	Backfill for existing ContentPost rows	0	t	2026-05-09 06:34:47.25	2026-05-09 06:34:47.25
cmoy32w9v0002508ooa9z3870	গরুর রোগ	Cattle diseases	gorur-rog	\N	10	t	2026-05-09 08:30:10.147	2026-05-10 12:25:35.035
cmoy32wa10003508o2q0y05dp	ছাগলের রোগ	Goat diseases	chagoler-rog	\N	20	t	2026-05-09 08:30:10.153	2026-05-10 12:25:35.043
cmoy32wa50004508o6u6akhn5	AI / প্রজনন	AI / reproduction	ai-prajonan	\N	30	t	2026-05-09 08:30:10.157	2026-05-10 12:25:35.047
cmoy32wa80005508o3yng5wpu	টিকা	Vaccination	tika	\N	40	t	2026-05-09 08:30:10.16	2026-05-10 12:25:35.051
cmoy32wab0006508obrkyzirh	কৃমিনাশক	Deworming	kriminashok	\N	50	t	2026-05-09 08:30:10.163	2026-05-10 12:25:35.054
cmoy32waf0007508olj5m6xfa	খাদ্য ব্যবস্থাপনা	Feed management	khadyo-byabosthapona	\N	60	t	2026-05-09 08:30:10.167	2026-05-10 12:25:35.061
cmoy32waj0008508otm5cz8yc	জরুরি চিকিৎসা	Emergency care	joruri-chikitsha	\N	70	t	2026-05-09 08:30:10.171	2026-05-10 12:25:35.066
\.


--
-- Data for Name: ContentPost; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContentPost" (id, title, slug, body, "authorId", "createdAt", "updatedAt", summary, "coverImageUrl", "categoryId", "approvalStatus", "rejectionReason", "publishedAt", "isPublished") FROM stdin;
\.


--
-- Data for Name: CustomerProfile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CustomerProfile" (id, "userId", "displayName", locale, "addressJson", "createdAt", "updatedAt") FROM stdin;
demo-seed-cprofile-customer	demo-seed-user-customer	Demo Customer	bn-BD	{"demoSeed": true, "areaLabel": "ঢাকা, আশুলিয়া (ডেমো)"}	2026-05-09 21:16:32.967	2026-05-10 05:59:50.434
\.


--
-- Data for Name: District; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."District" (id, "divisionId", name, slug, code, "createdAt", "updatedAt", "isActive", "nameBn", "nameEn", "sortOrder", "isVerified", latitude, longitude, source) FROM stdin;
cmozwcvjk000e408o5c0ntuyt	cmozwcvez0001408on4he7rb5	Brahmanbaria	brahmanbaria-district	2012	2026-05-10 14:57:30.8	2026-05-10 16:52:37.025	t	\N	Brahmanbaria	0	t	23.9533427	91.0831715	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvju000f408oucpwdysr	cmozwcvez0001408on4he7rb5	Chandpur	chandpur-district	2013	2026-05-10 14:57:30.81	2026-05-10 16:52:37.032	t	\N	Chandpur	0	t	23.2611099	90.7488891	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvk3000g408ocignwjl4	cmozwcvez0001408on4he7rb5	Chattogram	chattogram-district	2015	2026-05-10 14:57:30.819	2026-05-10 16:52:37.038	t	\N	Chattogram	0	t	22.4467326	91.8192279	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvkb000h408opkb53bfd	cmozwcvez0001408on4he7rb5	Cumilla	cumilla-district	2019	2026-05-10 14:57:30.827	2026-05-10 16:52:37.044	t	\N	Cumilla	0	t	23.4370482	91.0329786	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvkj000i408os1f32ab8	cmozwcvez0001408on4he7rb5	Cox's Bazar	cox-s-bazar-district	2022	2026-05-10 14:57:30.835	2026-05-10 16:52:37.05	t	\N	Cox's Bazar	0	t	21.4760113	92.0625169	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvkr000j408o0ep4ncfj	cmozwcvez0001408on4he7rb5	Feni	feni-district	2030	2026-05-10 14:57:30.843	2026-05-10 16:52:37.064	t	\N	Feni	0	t	22.9949546	91.4119980	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvkz000k408ogx482m5w	cmozwcvez0001408on4he7rb5	Khagrachhari	khagrachhari-district	2046	2026-05-10 14:57:30.851	2026-05-10 16:52:37.07	t	\N	Khagrachhari	0	t	23.1719414	91.9564565	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvl7000l408o3cevck6l	cmozwcvez0001408on4he7rb5	Lakshmipur	lakshmipur-district	2051	2026-05-10 14:57:30.859	2026-05-10 16:52:37.078	t	\N	Lakshmipur	0	t	22.8509342	90.8536888	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvlf000m408odvf1wds4	cmozwcvez0001408on4he7rb5	Noakhali	noakhali-district	2075	2026-05-10 14:57:30.867	2026-05-10 16:52:37.084	t	\N	Noakhali	0	t	22.6580624	91.1294986	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvlm000n408o7mwgw1ga	cmozwcvez0001408on4he7rb5	Rangamati	rangamati-district	2084	2026-05-10 14:57:30.875	2026-05-10 16:52:37.091	t	\N	Rangamati	0	t	22.8250705	92.2810905	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmoxc1cd90009ig8ona9jnhsx	cmoxc1cd10008ig8o7buvk5hz	Dhaka	dhaka-district	3026	2026-05-08 19:53:08.061	2026-05-10 16:52:37.097	t	\N	Dhaka	0	t	23.7884509	90.2505853	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozqxhyg0010zo8oxnb8hecl	cmoxc1cd10008ig8o7buvk5hz	Faridpur	faridpur-district	3029	2026-05-10 12:25:35.272	2026-05-10 16:52:37.103	t	\N	Faridpur	29	t	23.4776007	89.8359007	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmoxcg57g000kmg8oujmjoxaq	cmoxc1cd10008ig8o7buvk5hz	Gazipur	gazipur-district	3033	2026-05-08 20:04:38.62	2026-05-10 16:52:37.109	t	\N	Gazipur	0	t	24.0986556	90.4461840	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozqxhy2000yzo8oqgylx1er	cmoxc1cd10008ig8o7buvk5hz	Gopalganj	gopalganj-district	3035	2026-05-10 12:25:35.258	2026-05-10 16:52:37.114	t	\N	Gopalganj	35	t	23.1048026	89.8992409	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvmi000o408o1nqt69m0	cmoxc1cd10008ig8o7buvk5hz	Kishoreganj	kishoreganj-district	3048	2026-05-10 14:57:30.906	2026-05-10 16:52:37.119	t	\N	Kishoreganj	0	t	24.3780153	90.9433061	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvmq000p408o7vpvisde	cmoxc1cd10008ig8o7buvk5hz	Madaripur	madaripur-district	3054	2026-05-10 14:57:30.914	2026-05-10 16:52:37.124	t	\N	Madaripur	0	t	23.2220734	90.1662339	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvmy000q408ouxd62bmm	cmoxc1cd10008ig8o7buvk5hz	Manikganj	manikganj-district	3056	2026-05-10 14:57:30.922	2026-05-10 16:52:37.129	t	\N	Manikganj	0	t	23.8408040	89.9511920	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvng000s408o1xij4fx0	cmoxc1cd10008ig8o7buvk5hz	Narayanganj	narayanganj-district	3067	2026-05-10 14:57:30.94	2026-05-10 16:52:37.139	t	\N	Narayanganj	0	t	23.7238106	90.5781458	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvno000t408o3nbdl5xg	cmoxc1cd10008ig8o7buvk5hz	Narsingdi	narsingdi-district	3068	2026-05-10 14:57:30.948	2026-05-10 16:52:37.145	t	\N	Narsingdi	0	t	24.0032131	90.7740537	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvnw000u408o2fe6jdy2	cmoxc1cd10008ig8o7buvk5hz	Rajbari	rajbari-district	3082	2026-05-10 14:57:30.956	2026-05-10 16:52:37.149	t	\N	Rajbari	0	t	23.7285414	89.5605171	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvo4000v408owlccy5yf	cmoxc1cd10008ig8o7buvk5hz	Shariatpur	shariatpur-district	3086	2026-05-10 14:57:30.964	2026-05-10 16:52:37.154	t	\N	Shariatpur	0	t	23.2445849	90.4146413	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozqxhya000zzo8o6lsl370o	cmoxc1cd10008ig8o7buvk5hz	Tangail	tangail-district	3093	2026-05-10 12:25:35.266	2026-05-10 16:52:37.16	t	\N	Tangail	33	t	24.3584494	90.0004054	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvoh000w408ovws6f26b	cmozwcvfq0002408oa9pd5d48	Bagerhat	bagerhat-district	4001	2026-05-10 14:57:30.977	2026-05-10 16:52:37.165	t	\N	Bagerhat	0	t	22.3288462	89.7439750	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvoo000x408o44db4aa5	cmozwcvfq0002408oa9pd5d48	Chuadanga	chuadanga-district	4018	2026-05-10 14:57:30.984	2026-05-10 16:52:37.17	t	\N	Chuadanga	0	t	23.6090691	88.8486198	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvhw0008408oy62xrhuk	cmozwcvek0000408ox0ahtcai	Barishal	barishal-district	1006	2026-05-10 14:57:30.74	2026-05-10 16:52:36.987	t	\N	Barishal	0	t	22.8193871	90.3687870	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvi40009408ojea9pyf8	cmozwcvek0000408ox0ahtcai	Bhola	bhola-district	1009	2026-05-10 14:57:30.748	2026-05-10 16:52:36.995	t	\N	Bhola	0	t	22.3103208	90.7639825	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvie000a408ooobbc0j0	cmozwcvek0000408ox0ahtcai	Jhalokati	jhalokati-district	1042	2026-05-10 14:57:30.758	2026-05-10 16:52:37.002	t	\N	Jhalokati	0	t	22.5723415	90.1818978	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvin000b408o1y285fhq	cmozwcvek0000408ox0ahtcai	Patuakhali	patuakhali-district	1078	2026-05-10 14:57:30.767	2026-05-10 16:52:37.008	t	\N	Patuakhali	0	t	22.1651872	90.4072572	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcviw000c408o8g1nlapz	cmozwcvek0000408ox0ahtcai	Pirojpur	pirojpur-district	1079	2026-05-10 14:57:30.776	2026-05-10 16:52:37.014	t	\N	Pirojpur	0	t	22.5320366	89.9920902	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvj4000d408or3dz7jdo	cmozwcvez0001408on4he7rb5	Bandarban	bandarban-district	2003	2026-05-10 14:57:30.784	2026-05-10 16:52:37.019	t	\N	Bandarban	0	t	21.8045062	92.3651358	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvq80015408o1vyf5cze	cmozwcvfq0002408oa9pd5d48	Satkhira	satkhira-district	4087	2026-05-10 14:57:31.04	2026-05-10 16:52:37.215	t	\N	Satkhira	0	t	22.3078967	89.1433496	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvqf0016408odosit018	cmozwcvfy0003408ob9g1ga62	Jamalpur	jamalpur-district	4539	2026-05-10 14:57:31.047	2026-05-10 16:52:37.219	t	\N	Jamalpur	0	t	24.9772424	89.8472144	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvqm0017408oqj9w95zy	cmozwcvfy0003408ob9g1ga62	Mymensingh	mymensingh-district	4561	2026-05-10 14:57:31.054	2026-05-10 16:52:37.224	t	\N	Mymensingh	0	t	24.6992901	90.4296179	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvqu0018408obh4jtvly	cmozwcvfy0003408ob9g1ga62	Netrakona	netrakona-district	4572	2026-05-10 14:57:31.062	2026-05-10 16:52:37.229	t	\N	Netrakona	0	t	24.8707640	90.8452994	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvr10019408o7g8ca1xa	cmozwcvfy0003408ob9g1ga62	Sherpur	sherpur-district	4589	2026-05-10 14:57:31.069	2026-05-10 16:52:37.233	t	\N	Sherpur	0	t	25.0829404	90.0754569	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvr8001a408oisf7cqkc	cmozwcvg70004408ovsnt5ke2	Bogura	bogura-district	5010	2026-05-10 14:57:31.076	2026-05-10 16:52:37.238	t	\N	Bogura	0	t	24.8243310	89.3804012	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvrf001b408o2uhqama5	cmozwcvg70004408ovsnt5ke2	Joypurhat	joypurhat-district	5038	2026-05-10 14:57:31.083	2026-05-10 16:52:37.243	t	\N	Joypurhat	0	t	25.0929838	89.0838166	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvro001c408otpcx72zj	cmozwcvg70004408ovsnt5ke2	Naogaon	naogaon-district	5064	2026-05-10 14:57:31.092	2026-05-10 16:52:37.247	t	\N	Naogaon	0	t	24.9002107	88.7516789	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvrv001d408og278t396	cmozwcvg70004408ovsnt5ke2	Natore	natore-district	5069	2026-05-10 14:57:31.099	2026-05-10 16:52:37.252	t	\N	Natore	0	t	24.3805617	89.0874149	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvs2001e408omulxtkun	cmozwcvg70004408ovsnt5ke2	Chapainababganj	chapainababganj-district	5070	2026-05-10 14:57:31.106	2026-05-10 16:52:37.257	t	\N	Chapainababganj	0	t	24.7155962	88.2639922	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvs9001f408o1dqychow	cmozwcvg70004408ovsnt5ke2	Pabna	pabna-district	5076	2026-05-10 14:57:31.113	2026-05-10 16:52:37.262	t	\N	Pabna	0	t	24.0530474	89.3861813	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvsg001g408o89fvkvu3	cmozwcvg70004408ovsnt5ke2	Rajshahi	rajshahi-district	5081	2026-05-10 14:57:31.12	2026-05-10 16:52:37.267	t	\N	Rajshahi	0	t	24.4683774	88.6506542	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvsm001h408o1eieu8ec	cmozwcvg70004408ovsnt5ke2	Sirajganj	sirajganj-district	5088	2026-05-10 14:57:31.126	2026-05-10 16:52:37.272	t	\N	Sirajganj	0	t	24.3915237	89.6014646	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvsu001i408orduboc2n	cmozwcvge0005408ogmfp3f2a	Dinajpur	dinajpur-district	5527	2026-05-10 14:57:31.134	2026-05-10 16:52:37.276	t	\N	Dinajpur	0	t	25.6304274	88.7862824	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvt1001j408ox7x3lmrd	cmozwcvge0005408ogmfp3f2a	Gaibandha	gaibandha-district	5532	2026-05-10 14:57:31.141	2026-05-10 16:52:37.281	t	\N	Gaibandha	0	t	25.2982845	89.5054352	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvt8001k408od0vs3d2n	cmozwcvge0005408ogmfp3f2a	Kurigram	kurigram-district	5549	2026-05-10 14:57:31.148	2026-05-10 16:52:37.285	t	\N	Kurigram	0	t	25.7904768	89.6950901	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvtf001l408ot6ncop8s	cmozwcvge0005408ogmfp3f2a	Lalmonirhat	lalmonirhat-district	5552	2026-05-10 14:57:31.155	2026-05-10 16:52:37.29	t	\N	Lalmonirhat	0	t	26.0628985	89.2365127	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvtn001m408ohn0zaih9	cmozwcvge0005408ogmfp3f2a	Nilphamari	nilphamari-district	5573	2026-05-10 14:57:31.163	2026-05-10 16:52:37.294	t	\N	Nilphamari	0	t	26.0255572	88.9300604	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvtv001n408ou4h7txxq	cmozwcvge0005408ogmfp3f2a	Panchagarh	panchagarh-district	5577	2026-05-10 14:57:31.171	2026-05-10 16:52:37.299	t	\N	Panchagarh	0	t	26.2853104	88.5785418	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvu3001o408of3yn25mo	cmozwcvge0005408ogmfp3f2a	Rangpur	rangpur-district	5585	2026-05-10 14:57:31.179	2026-05-10 16:52:37.303	t	\N	Rangpur	0	t	25.6513480	89.2368322	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvua001p408od3c9lkhx	cmozwcvge0005408ogmfp3f2a	Thakurgaon	thakurgaon-district	5594	2026-05-10 14:57:31.186	2026-05-10 16:52:37.308	t	\N	Thakurgaon	0	t	25.9900961	88.3445448	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvui001q408o8jp1kzcf	cmozwcvgn0006408o4lf4h7eg	Habiganj	habiganj-district	6036	2026-05-10 14:57:31.194	2026-05-10 16:52:37.313	t	\N	Habiganj	0	t	24.3694319	91.4317069	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvuq001r408o9ft0opwd	cmozwcvgn0006408o4lf4h7eg	Moulvibazar	moulvibazar-district	6058	2026-05-10 14:57:31.202	2026-05-10 16:52:37.317	t	\N	Moulvibazar	0	t	24.4810768	91.9164675	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvuy001s408oljusb73n	cmozwcvgn0006408o4lf4h7eg	Sunamganj	sunamganj-district	6090	2026-05-10 14:57:31.21	2026-05-10 16:52:37.321	t	\N	Sunamganj	0	t	24.9398487	91.3455961	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvv5001t408ohgnteynx	cmozwcvgn0006408o4lf4h7eg	Sylhet	sylhet-district	6091	2026-05-10 14:57:31.217	2026-05-10 16:52:37.326	t	\N	Sylhet	0	t	24.9196862	91.9876834	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvp2000z408oce8lth12	cmozwcvfq0002408oa9pd5d48	Jhenaidah	jhenaidah-district	4044	2026-05-10 14:57:30.998	2026-05-10 16:52:37.181	t	\N	Jhenaidah	0	t	23.4884757	89.0870471	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvp90010408oakyw8ixx	cmozwcvfq0002408oa9pd5d48	Khulna	khulna-district	4047	2026-05-10 14:57:31.005	2026-05-10 16:52:37.19	t	\N	Khulna	0	t	22.3657394	89.4528158	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvpf0011408oz8xl4vhp	cmozwcvfq0002408oa9pd5d48	Kushtia	kushtia-district	4050	2026-05-10 14:57:31.012	2026-05-10 16:52:37.195	t	\N	Kushtia	0	t	23.9261950	89.0184503	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvpn0012408oq7xmqarc	cmozwcvfq0002408oa9pd5d48	Magura	magura-district	4055	2026-05-10 14:57:31.019	2026-05-10 16:52:37.2	t	\N	Magura	0	t	23.4436587	89.4328489	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvpu0013408oow75njez	cmozwcvfq0002408oa9pd5d48	Meherpur	meherpur-district	4057	2026-05-10 14:57:31.026	2026-05-10 16:52:37.205	t	\N	Meherpur	0	t	23.7935507	88.7067574	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvq10014408onbsxonxb	cmozwcvfq0002408oa9pd5d48	Narail	narail-district	4065	2026-05-10 14:57:31.033	2026-05-10 16:52:37.21	t	\N	Narail	0	t	23.1312011	89.5782126	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvhk0007408onlqca354	cmozwcvek0000408ox0ahtcai	Barguna	barguna-district	1004	2026-05-10 14:57:30.728	2026-05-10 16:52:36.98	t	\N	Barguna	0	t	22.1282618	90.1101330	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvn9000r408od9gt62pq	cmoxc1cd10008ig8o7buvk5hz	Munshiganj	munshiganj-district	3059	2026-05-10 14:57:30.933	2026-05-10 16:52:37.134	t	\N	Munshiganj	0	t	23.5258422	90.4161101	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvov000y408owxzvitzg	cmozwcvfq0002408oa9pd5d48	Jashore	jashore-district	4041	2026-05-10 14:57:30.991	2026-05-10 16:52:37.176	t	\N	Jashore	0	t	23.0894749	89.1748123	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
\.


--
-- Data for Name: Division; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Division" (id, name, slug, code, "createdAt", "updatedAt", "isActive", "nameBn", "nameEn", "sortOrder", "isVerified", latitude, longitude, source) FROM stdin;
cmozwcvek0000408ox0ahtcai	Barishal	barishal-division	10	2026-05-10 14:57:30.62	2026-05-10 16:52:36.917	t	বরিশাল বিভাগ	Barishal	0	t	22.3928427	90.4063949	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvez0001408on4he7rb5	Chattogram	chattogram-division	20	2026-05-10 14:57:30.635	2026-05-10 16:52:36.931	t	চট্টগ্রাম বিভাগ	Chattogram	0	t	22.7013079	91.7058612	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmoxc1cd10008ig8o7buvk5hz	Dhaka	dhaka-division-geo	30	2026-05-08 19:53:08.053	2026-05-10 16:52:36.937	t	ঢাকা বিভাগ	Dhaka	10	t	23.8390213	90.2421589	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvfq0002408oa9pd5d48	Khulna	khulna-division	40	2026-05-10 14:57:30.662	2026-05-10 16:52:36.945	t	খুলনা বিভাগ	Khulna	0	t	22.8377176	89.3047787	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvfy0003408ob9g1ga62	Mymensingh	mymensingh-division	45	2026-05-10 14:57:30.67	2026-05-10 16:52:36.951	t	ময়মনসিংহ বিভাগ	Mymensingh	0	t	24.8478304	90.3817454	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvg70004408ovsnt5ke2	Rajshahi	rajshahi-division	50	2026-05-10 14:57:30.679	2026-05-10 16:52:36.956	t	রাজশাহী বিভাগ	Rajshahi	0	t	24.5893384	89.0463629	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvge0005408ogmfp3f2a	Rangpur	rangpur-division	55	2026-05-10 14:57:30.686	2026-05-10 16:52:36.962	t	রংপুর বিভাগ	Rangpur	0	t	25.7804210	89.0540954	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvgn0006408o4lf4h7eg	Sylhet	sylhet-division	60	2026-05-10 14:57:30.695	2026-05-10 16:52:36.968	t	সিলেট বিভাগ	Sylhet	0	t	24.7152885	91.6647132	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
\.


--
-- Data for Name: DoctorProfile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DoctorProfile" (id, "userId", "licenseNumber", specialization, bio, "verifiedAt", "createdAt", "updatedAt", "providerStatus", "acceptsEmergency", "acceptsOnlineConsultation", degree, "displayName", "experienceYears", "profilePhotoUrl", "visitFeeBdt") FROM stdin;
cmoyuggzx000vz88ox1o7wpg1	cmoyuggzp000uz88o9nb1b7g1	PD-DEMO-LIC-0003	জেনারেল	ডেমো প্রোফাইল (ডেমো ডাক্তার — চট্টগ্রাম) — শুধু ডেভেলপমেন্ট	2026-05-10 05:59:50.566	2026-05-09 21:16:33.165	2026-05-10 05:59:50.566	ACTIVE	t	f	ডিভিএম	ডেমো ডাক্তার — চট্টগ্রাম	12	\N	2200.00
cmoyugh0x0011z88o0mtxibto	cmoyugh0t0010z88oac7dw94o	PD-DEMO-LIC-0004	খামার ও হোম ভিজিট	ডেমো প্রোফাইল (ডেমো ডাক্তার — কুমিল্লা) — শুধু ডেভেলপমেন্ট	2026-05-10 05:59:50.589	2026-05-09 21:16:33.201	2026-05-10 05:59:50.589	ACTIVE	f	f	বিভিএস	ডেমো ডাক্তার — কুমিল্লা	6	\N	1500.00
cmoyuggwd000iz88oqqtns4i5	cmoyuggw5000hz88o8vdjwemj	PD-DEMO-LIC-0001	খামার ও হোম ভিজিট	ডেমো প্রোফাইল (ডেমো ডাক্তার — আশুলিয়া) — শুধু ডেভেলপমেন্ট	2026-05-10 05:59:50.487	2026-05-09 21:16:33.037	2026-05-10 05:59:50.491	ACTIVE	t	t	ডিভিএম	ডেমো ডাক্তার — আশুলিয়া	8	\N	2200.00
cmoyuggyi000pz88otlr6c12p	cmoyuggy9000oz88oi0msc5um	PD-DEMO-LIC-0002	খামার ও হোম ভিজিট	ডেমো প্রোফাইল (ডেমো ডাক্তার — নারায়ণগঞ্জ) — শুধু ডেভেলপমেন্ট	2026-05-10 05:59:50.542	2026-05-09 21:16:33.114	2026-05-10 05:59:50.544	ACTIVE	f	t	এম ভেট সাইন্স	ডেমো ডাক্তার — নারায়ণগঞ্জ	5	\N	1500.00
cmoyugh1m0016z88ocup2s9io	cmoyugh1j0015z88otmgjn54s	PD-DEMO-LIC-0005	খামার ও হোম ভিজিট	ডেমো প্রোফাইল (ডেমো ডাক্তার — রাজশাহী) — শুধু ডেভেলপমেন্ট	2026-05-10 05:59:50.605	2026-05-09 21:16:33.226	2026-05-10 05:59:50.606	ACTIVE	t	t	ডিভিএম, এমএস	ডেমো ডাক্তার — রাজশাহী	15	\N	2200.00
\.


--
-- Data for Name: DoctorProfileArea; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DoctorProfileArea" (id, "doctorId", "areaId", priority, "createdAt") FROM stdin;
cmoyuggwn000jz88okvsu7can	cmoyuggwd000iz88oqqtns4i5	cmoxcg56t000gmg8ofe2hikzd	1	2026-05-09 21:16:33.047
cmoyuggyo000qz88ovo6bnfxo	cmoyuggyi000pz88otlr6c12p	cmoyu3tqb00088g8o47if7wcd	1	2026-05-09 21:16:33.12
cmoyugh02000wz88ofimjrzdr	cmoyuggzx000vz88ox1o7wpg1	cmoyu3tqs00098g8o5d8orcoc	1	2026-05-09 21:16:33.17
cmoyugh110012z88oxjeudhht	cmoyugh0x0011z88o0mtxibto	cmoyu3tqw000a8g8o19so7ci5	1	2026-05-09 21:16:33.205
cmoyugh1r0017z88oqkreisj4	cmoyugh1m0016z88ocup2s9io	cmoyu3tr0000b8g8olgyg2uqc	1	2026-05-09 21:16:33.231
\.


--
-- Data for Name: DoctorProfileServiceCategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DoctorProfileServiceCategory" (id, "doctorId", "serviceCategoryId", "createdAt") FROM stdin;
cmoyuggxa000kz88onn9xwrh2	cmoyuggwd000iz88oqqtns4i5	cmoxc48hk0002ac8ob9ra4n4y	2026-05-09 21:16:33.07
cmoyuggxn000lz88o82twvhmu	cmoyuggwd000iz88oqqtns4i5	cmoxc48hp0003ac8otr9at95a	2026-05-09 21:16:33.083
cmoyuggxv000mz88oy04vt1q3	cmoyuggwd000iz88oqqtns4i5	cmoxc48hx0005ac8ou8nyjoa0	2026-05-09 21:16:33.091
cmoyuggyy000rz88oep8xelj7	cmoyuggyi000pz88otlr6c12p	cmoxc48hk0002ac8ob9ra4n4y	2026-05-09 21:16:33.13
cmoyuggz9000sz88om3kin3ba	cmoyuggyi000pz88otlr6c12p	cmoxc48hx0005ac8ou8nyjoa0	2026-05-09 21:16:33.142
cmoyugh09000xz88oayqsj5vl	cmoyuggzx000vz88ox1o7wpg1	cmoxc48hk0002ac8ob9ra4n4y	2026-05-09 21:16:33.177
cmoyugh0i000yz88o6s04u2i4	cmoyuggzx000vz88ox1o7wpg1	cmoxc48hp0003ac8otr9at95a	2026-05-09 21:16:33.186
cmoyugh180013z88o457pe3en	cmoyugh0x0011z88o0mtxibto	cmoxc48hk0002ac8ob9ra4n4y	2026-05-09 21:16:33.212
cmoyugh210018z88on8his61u	cmoyugh1m0016z88ocup2s9io	cmoxc48hk0002ac8ob9ra4n4y	2026-05-09 21:16:33.241
cmoyugh2f0019z88otgzthwok	cmoyugh1m0016z88ocup2s9io	cmoxc48hp0003ac8otr9at95a	2026-05-09 21:16:33.255
cmoyugh2o001az88o5c3e0ybc	cmoyugh1m0016z88ocup2s9io	cmoxc48hx0005ac8ou8nyjoa0	2026-05-09 21:16:33.264
\.


--
-- Data for Name: DoctorServiceArea; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DoctorServiceArea" (id, "doctorId", "villageId", priority, "createdAt") FROM stdin;
cmoyuggy3000nz88okf12s3d6	cmoyuggwd000iz88oqqtns4i5	cmoxc48jj000gac8ojoogi46b	1	2026-05-09 21:16:33.099
cmoyuggzj000tz88o29i4pi9h	cmoyuggyi000pz88otlr6c12p	cmoxc48jj000gac8ojoogi46b	2	2026-05-09 21:16:33.151
cmoyugh0p000zz88om6x2jbda	cmoyuggzx000vz88ox1o7wpg1	cmoxc48jj000gac8ojoogi46b	3	2026-05-09 21:16:33.193
cmoyugh1e0014z88olxqbo7pr	cmoyugh0x0011z88o0mtxibto	cmoxc48jj000gac8ojoogi46b	4	2026-05-09 21:16:33.218
cmoyugh2u001bz88omi6dxpdy	cmoyugh1m0016z88ocup2s9io	cmoxc48jj000gac8ojoogi46b	5	2026-05-09 21:16:33.27
\.


--
-- Data for Name: MobileOtpChallenge; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MobileOtpChallenge" (id, "normalizedPhone", "codeHash", "expiresAt", "verifyAttempts", "sendWindowStartedAt", "sendsInWindow", "createdAt", "updatedAt", "lastOtpSentAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, "userId", title, body, "readAt", "metadataJson", "createdAt", type) FROM stdin;
demo-seed-notif-1	demo-seed-user-customer	লগইন নোটিশ	ডেমো: আপনার অ্যাকাউন্টে প্রবেশ ট্র্যাক করা হয়েছে (প্লেসহোল্ডার)।	\N	{"demoSeed": true}	2026-05-09 21:16:33.474	SYSTEM
demo-seed-notif-2	demo-seed-user-customer	অনুরোধ জমা হয়েছে	ডেমো: সেবার অনুরোধ গ্রহণ করা হয়েছে।	\N	{"demoSeed": true}	2026-05-09 21:16:33.48	REQUEST_UPDATE
demo-seed-notif-3	demo-seed-user-customer	ডাক্তার নিয়োগ	ডেমো: একজন ডাক্তার আপনার অনুরোধে যুক্ত হয়েছে।	\N	{"demoSeed": true}	2026-05-09 21:16:33.483	REQUEST_UPDATE
demo-seed-notif-4	demo-seed-user-customer	টেকনিশিয়ান গ্রহণ	ডেমো: এআই টেকনিশিয়ান সেবা শুরু হয়েছে।	\N	{"demoSeed": true}	2026-05-09 21:16:33.487	REQUEST_UPDATE
demo-seed-notif-5	demo-seed-user-customer	সেবা সম্পন্ন	ডেমো: ভিজিট সম্পূর্ণ হয়েছে।	\N	{"demoSeed": true}	2026-05-09 21:16:33.49	REQUEST_UPDATE
demo-seed-notif-6	demo-seed-user-customer	পেমেন্ট আপডেট	ডেমো: বিল পরিশোধিত (প্লেসহোল্ডার)।	\N	{"demoSeed": true}	2026-05-09 21:16:33.493	PAYMENT
demo-seed-notif-7	demo-seed-user-customer	সিস্টেম নোটিশ	ডেমো: পরীক্ষামূলক বিজ্ঞপ্তি।	\N	{"demoSeed": true}	2026-05-09 21:16:33.497	SYSTEM
\.


--
-- Data for Name: PaymentRecord; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PaymentRecord" (id, "billingRecordId", "serviceRequestId", status, method, amount, currency, "externalId", "paidAt", "metadataJson", "createdAt", "updatedAt") FROM stdin;
demo-seed-payment-paid	demo-seed-bill-paid	demo-seed-sr-05-completed	CAPTURED	BKASH	2500.00	BDT	\N	2026-05-10 05:59:50.774	{"demoSeed": true}	2026-05-09 21:16:33.463	2026-05-10 05:59:50.776
\.


--
-- Data for Name: Prescription; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Prescription" (id, "serviceRequestId", "doctorId", "animalId", status, instructions, "validUntil", "createdAt", "updatedAt", "aiTechnicianId") FROM stdin;
\.


--
-- Data for Name: PrescriptionItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PrescriptionItem" (id, "prescriptionId", "medicineName", dosage, duration, instruction, quantity, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Review" (id, "customerId", "doctorId", "aiTechnicianId", "serviceRequestId", rating, comment, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ServiceCategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ServiceCategory" (id, name, slug, description, "createdAt", "updatedAt") FROM stdin;
cmoxc48hx0005ac8ou8nyjoa0	Online Consultation	online-consultation	Remote consultation with a veterinarian	2026-05-08 19:55:23.013	2026-05-10 12:25:35.085
cmox9kco20002nk8o1wmv8f87	General consultation	general-consultation	Routine veterinary consultation	2026-05-08 18:43:56.066	2026-05-10 12:25:35.087
cmox9kcob0003nk8o0gu890p7	Emergency visit (legacy)	emergency-visit	Legacy slug — prefer category “Emergency”	2026-05-08 18:43:56.075	2026-05-10 12:25:35.09
cmox9kcog0004nk8o1nuh71ot	Vaccination	vaccination	Preventive vaccination services	2026-05-08 18:43:56.08	2026-05-10 12:25:35.093
cmox9kcoo0005nk8opzaapce0	Livestock health check	livestock-health-check	Field visit for cattle, goats, and other livestock	2026-05-08 18:43:56.088	2026-05-10 12:25:35.096
cmoyu3tpb00078g8onuuliu1n	ফার্ম ভিজিট (প্লেসহোল্ডার)	farm-visit	খামার ভিজিট বুকিং — শীঘ্রই	2026-05-09 21:06:43.103	2026-05-10 05:59:50.301
cmoxc48hk0002ac8ob9ra4n4y	Doctor Visit	doctor-visit	On-site or scheduled visit by a veterinarian	2026-05-08 19:55:23	2026-05-10 12:25:35.074
cmoxc48hp0003ac8otr9at95a	Emergency	emergency	Urgent care or emergency visit	2026-05-08 19:55:23.005	2026-05-10 12:25:35.079
cmoxc48ht0004ac8od32irc7f	AI Service	ai-service	AI-assisted triage or technician-supported service	2026-05-08 19:55:23.009	2026-05-10 12:25:35.082
\.


--
-- Data for Name: ServiceRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ServiceRequest" (id, "customerId", "animalId", "areaId", "serviceCategoryId", "assignedDoctorId", status, urgency, symptoms, "preferredWindow", "locationNotes", "createdAt", "updatedAt", "completedAt", "assignedAiTechnicianId", "assignedAt", "cancelledAt", "emergencyNotes", "isEmergency", "requestType", "scheduledEnd", "scheduledStart", "startedAt", "submittedAt", "villageId", description, "cancelReason") FROM stdin;
demo-seed-sr-07-ai	demo-seed-cprofile-customer	demo-seed-animal-1	cmoxcg56t000gmg8ofe2hikzd	cmoxc48ht0004ac8od32irc7f	\N	IN_PROGRESS	\N	ডেমো: এআই টেকনিশিয়ান সেবা	\N	আশুলিয়া ইউনিয়ন (ডেমো)	2026-05-09 21:16:33.442	2026-05-10 05:59:50.757	\N	cmoyugh35001dz88oypjycacv	2026-05-10 05:59:50.709	\N	\N	f	AI_SERVICE	\N	\N	2026-05-10 05:59:50.709	2026-05-09 21:16:33.442	cmoxc48jj000gac8ojoogi46b	ডেমো সার্ভিস রিকোয়েস্ট — metadata.demoSeed	\N
demo-seed-sr-08-online	demo-seed-cprofile-customer	demo-seed-animal-1	cmoxcg56t000gmg8ofe2hikzd	cmoxc48hx0005ac8ou8nyjoa0	\N	PENDING	\N	ডেমো: অনলাইন কনসালটেশন — অপেক্ষমান	\N	আশুলিয়া ইউনিয়ন (ডেমো)	2026-05-09 21:16:33.449	2026-05-10 05:59:50.762	\N	\N	\N	\N	\N	f	ONLINE_CONSULTATION_LATER	\N	\N	\N	2026-05-09 21:16:33.449	cmoxc48jj000gac8ojoogi46b	ডেমো সার্ভিস রিকোয়েস্ট — metadata.demoSeed	\N
demo-seed-sr-01-pending	demo-seed-cprofile-customer	demo-seed-animal-1	cmoxcg56t000gmg8ofe2hikzd	cmoxc48hk0002ac8ob9ra4n4y	\N	PENDING	\N	ডেমো: নতুন অনুরোধ — অ্যাসাইনমেন্ট অপেক্ষমান	\N	আশুলিয়া ইউনিয়ন (ডেমো)	2026-05-09 21:16:33.384	2026-05-10 05:59:50.712	\N	\N	\N	\N	\N	f	DOCTOR_HOME_VISIT	\N	\N	\N	2026-05-09 21:16:33.384	cmoxc48jj000gac8ojoogi46b	ডেমো সার্ভিস রিকোয়েস্ট — metadata.demoSeed	\N
demo-seed-sr-02-assigned	demo-seed-cprofile-customer	demo-seed-animal-1	cmoxcg56t000gmg8ofe2hikzd	cmoxc48hk0002ac8ob9ra4n4y	cmoyuggwd000iz88oqqtns4i5	ASSIGNED	\N	ডেমো: ডাক্তার অ্যাসাইন করা হয়েছে	\N	আশুলিয়া ইউনিয়ন (ডেমো)	2026-05-09 21:16:33.394	2026-05-10 05:59:50.722	\N	\N	2026-05-10 05:59:50.709	\N	\N	f	DOCTOR_HOME_VISIT	\N	\N	\N	2026-05-09 21:16:33.394	cmoxc48jj000gac8ojoogi46b	ডেমো সার্ভিস রিকোয়েস্ট — metadata.demoSeed	\N
demo-seed-sr-03-accepted	demo-seed-cprofile-customer	demo-seed-animal-1	cmoxcg56t000gmg8ofe2hikzd	cmoxc48hp0003ac8otr9at95a	cmoyuggwd000iz88oqqtns4i5	ACCEPTED	\N	ডেমো: জরুরি — গ্রহণ করা হয়েছে	\N	আশুলিয়া ইউনিয়ন (ডেমো)	2026-05-09 21:16:33.404	2026-05-10 05:59:50.728	\N	\N	2026-05-10 05:59:50.709	\N	\N	t	EMERGENCY_DOCTOR	\N	\N	\N	2026-05-09 21:16:33.404	cmoxc48jj000gac8ojoogi46b	ডেমো সার্ভিস রিকোয়েস্ট — metadata.demoSeed	\N
demo-seed-sr-04-progress	demo-seed-cprofile-customer	demo-seed-animal-1	cmoxcg56t000gmg8ofe2hikzd	cmoxc48hk0002ac8ob9ra4n4y	cmoyuggyi000pz88otlr6c12p	IN_PROGRESS	\N	ডেমো: চিকিৎসা চলছে	\N	আশুলিয়া ইউনিয়ন (ডেমো)	2026-05-09 21:16:33.418	2026-05-10 05:59:50.736	\N	\N	2026-05-10 05:59:50.709	\N	\N	f	DOCTOR_HOME_VISIT	\N	\N	2026-05-10 05:59:50.709	2026-05-09 21:16:33.418	cmoxc48jj000gac8ojoogi46b	ডেমো সার্ভিস রিকোয়েস্ট — metadata.demoSeed	\N
demo-seed-sr-05-completed	demo-seed-cprofile-customer	demo-seed-animal-1	cmoxcg56t000gmg8ofe2hikzd	cmoxc48hk0002ac8ob9ra4n4y	cmoyuggwd000iz88oqqtns4i5	COMPLETED	\N	ডেমো: সম্পন্ন ভিজিট	\N	আশুলিয়া ইউনিয়ন (ডেমো)	2026-05-09 21:16:33.426	2026-05-10 05:59:50.742	2026-05-10 05:59:50.709	\N	2026-05-10 05:59:50.709	\N	\N	f	DOCTOR_HOME_VISIT	\N	\N	2026-05-09 05:59:50.709	2026-05-09 21:16:33.426	cmoxc48jj000gac8ojoogi46b	ডেমো সার্ভিস রিকোয়েস্ট — metadata.demoSeed	\N
demo-seed-sr-06-cancelled	demo-seed-cprofile-customer	demo-seed-animal-1	cmoxcg56t000gmg8ofe2hikzd	cmoxc48hk0002ac8ob9ra4n4y	\N	CANCELLED	\N	ডেমো: বাতিল অনুরোধ	\N	আশুলিয়া ইউনিয়ন (ডেমো)	2026-05-09 21:16:33.434	2026-05-10 05:59:50.75	\N	\N	\N	2026-05-10 05:59:50.709	\N	f	DOCTOR_HOME_VISIT	\N	\N	\N	2026-05-09 21:16:33.434	cmoxc48jj000gac8ojoogi46b	ডেমো সার্ভিস রিকোয়েস্ট — metadata.demoSeed	ডেমো বাতিল
\.


--
-- Data for Name: Setting; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Setting" (id, key, "valueJson", "updatedAt") FROM stdin;
cmoyu3tle00008g8oox3cakg6	mobile.app.config	{"demoBanner": true, "supportPhone": "+8809612345678", "supportWhatsapp": "+8809612345678", "featureFarmVisit": false, "featureOnlineConsultation": true}	2026-05-10 05:59:50.161
cmoyu3tod00018g8oac2542d1	mobile.feature.flags	{"paymentsBkash": false, "pharmacyOrders": false, "farmVisitBooking": false}	2026-05-10 05:59:50.264
cmox9kcpm0008nk8oeoao3h8e	app.name	{"value": "Prani Doctor"}	2026-05-10 12:25:35.319
cmoy32wec000y508onrprk0yx	PLATFORM_COMMISSION_RATE	{"rate": 0.1}	2026-05-10 12:25:35.324
\.


--
-- Data for Name: TreatmentRecord; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TreatmentRecord" (id, "serviceRequestId", "doctorId", "animalId", "chiefComplaint", diagnosis, procedures, "followUpNotes", "recordedAt", "createdAt", "updatedAt", "aiTechnicianId", "followUpDate", symptoms, "treatmentNotes", status) FROM stdin;
\.


--
-- Data for Name: Union; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Union" (id, "upazilaId", name, slug, code, "createdAt", "updatedAt", "isActive", "nameBn", "nameEn", "sortOrder", "isVerified", latitude, longitude, source) FROM stdin;
cmoxc1cdq000big8ozb9s936u	cmoxc1cdi000aig8olmayuzcb	Placeholder Union	placeholder-union-001	\N	2026-05-08 19:53:08.078	2026-05-08 19:53:08.078	t	\N	Placeholder Union	0	f	\N	\N	\N
cmoxc48je000fac8ooh3548fj	cmoxc48j7000eac8o89tszysp	Ward 32 Union (sample)	sample-ward-32-union	888801	2026-05-08 19:55:23.066	2026-05-08 19:55:40.756	t	\N	Ward 32 Union (sample)	0	f	\N	\N	\N
cmoxcg583000nmg8ofy12uz4w	cmoxcg57o000lmg8o2oars5m7	Ashulia Union	ashulia-union	30263347	2026-05-08 20:04:38.643	2026-05-10 12:25:35.204	t	\N	Ashulia Union	0	f	\N	\N	\N
cmoxcg588000omg8o1s4v5r9e	cmoxcg57u000mmg8osw89z83y	Konabari Union	konabari-union	30331863	2026-05-08 20:04:38.648	2026-05-10 12:25:35.213	t	\N	Konabari Union	0	f	\N	\N	\N
cmozyfmqn0002w88oka2rtor3	cmozwcxkp00ad408o3y2tabls	Belkuchi Sadar	belkuchi-sadar-union	953	2026-05-10 15:55:38.591	2026-05-10 16:52:46.517	t	বেলকুচি সদর	Belkuchi Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozqxhzf0015zo8oh0gbf2gm	cmozqxhyt0012zo8o5vb4ut4c	Kagmari	kagmari-union-tangail	30332801	2026-05-10 12:25:35.307	2026-05-10 12:25:35.307	t	কাগমারী	Kagmari	11	f	\N	\N	\N
cmozyfmqz0003w88o8wkq8tsh	cmozwcxkp00ad408o3y2tabls	Dhukuriabera	dhukuriabera-union	954	2026-05-10 15:55:38.603	2026-05-10 16:52:46.523	t	ধুকুরিয়া বেড়া	Dhukuriabera	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmrb0004w88ozrr7ju4d	cmozwcxkp00ad408o3y2tabls	Doulatpur	doulatpur-union	955	2026-05-10 15:55:38.615	2026-05-10 16:52:46.53	t	দৌলতপুর	Doulatpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmro0005w88otc52brzt	cmozwcxkp00ad408o3y2tabls	Bhangabari	bhangabari-union	956	2026-05-10 15:55:38.628	2026-05-10 16:52:46.536	t	ভাঙ্গাবাড়ী	Bhangabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfms10006w88o4ltw0yzc	cmozwcxla00ag408o4uzk1kxv	Chalitadangha	chalitadangha-union	968	2026-05-10 15:55:38.641	2026-05-10 16:52:46.542	t	চালিতাডাঙ্গা	Chalitadangha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmsd0007w88o0nqgbbeh	cmozwcxla00ag408o4uzk1kxv	Chargirish	chargirish-union	969	2026-05-10 15:55:38.653	2026-05-10 16:52:46.549	t	চরগিরিশ	Chargirish	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmsp0008w88o04l53qxi	cmozwcxla00ag408o4uzk1kxv	Gandail	gandail-union	970	2026-05-10 15:55:38.665	2026-05-10 16:52:46.555	t	গান্ধাইল	Gandail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmt30009w88o7btexod0	cmozwcxla00ag408o4uzk1kxv	Kazipur Sadar	kazipur-sadar-union	971	2026-05-10 15:55:38.679	2026-05-10 16:52:46.562	t	কাজিপুর সদর	Kazipur Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmtf000aw88ozy2cf940	cmozwcxla00ag408o4uzk1kxv	Khasrajbari	khasrajbari-union	972	2026-05-10 15:55:38.691	2026-05-10 16:52:46.568	t	খাসরাজবাড়ী	Khasrajbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmtp000bw88oshicr6xl	cmozwcxla00ag408o4uzk1kxv	Maijbari	maijbari-union	973	2026-05-10 15:55:38.701	2026-05-10 16:52:46.575	t	মাইজবাড়ী	Maijbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmu1000cw88os5s0fvq5	cmozwcxla00ag408o4uzk1kxv	Monsur Nagar	monsur-nagar-union	974	2026-05-10 15:55:38.713	2026-05-10 16:52:46.581	t	মনসুর নগর	Monsur Nagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmud000dw88oh0n8fbpz	cmozwcxla00ag408o4uzk1kxv	Natuarpara	natuarpara-union	975	2026-05-10 15:55:38.725	2026-05-10 16:52:46.587	t	নাটুয়ারপাড়া	Natuarpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmun000ew88o57sot2b3	cmozwcxla00ag408o4uzk1kxv	Nishchintapur	nishchintapur-union	976	2026-05-10 15:55:38.735	2026-05-10 16:52:46.593	t	নিশ্চিন্তপুর	Nishchintapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmuy000fw88opp6jczgv	cmozwcxla00ag408o4uzk1kxv	Sonamukhi	sonamukhi-union	977	2026-05-10 15:55:38.746	2026-05-10 16:52:46.6	t	সোনামুখী	Sonamukhi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmva000gw88orjez62st	cmozwcxla00ag408o4uzk1kxv	Subhagacha	subhagacha-union	978	2026-05-10 15:55:38.758	2026-05-10 16:52:46.606	t	শুভগাছা	Subhagacha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmvj000hw88oexn0kzuc	cmozwcxla00ag408o4uzk1kxv	Tekani	tekani-union	979	2026-05-10 15:55:38.767	2026-05-10 16:52:46.612	t	তেকানী	Tekani	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmvv000iw88o9m5e0fhm	cmozwcxlp00ai408olh0ph8t7	Beltail	beltail-union	989	2026-05-10 15:55:38.779	2026-05-10 16:52:46.618	t	বেলতৈল	Beltail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmw6000jw88oy02ulhak	cmozwcxlp00ai408olh0ph8t7	Jalalpur	jalalpur-union	990	2026-05-10 15:55:38.79	2026-05-10 16:52:46.624	t	জালালপুর	Jalalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmwg000kw88ot3lppum3	cmozwcxlp00ai408olh0ph8t7	Kayempure	kayempure-union	991	2026-05-10 15:55:38.8	2026-05-10 16:52:46.631	t	কায়েমপুর	Kayempure	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmwr000lw88o3asax0n5	cmozwcxlp00ai408olh0ph8t7	Garadah	garadah-union	992	2026-05-10 15:55:38.811	2026-05-10 16:52:46.637	t	গাড়াদহ	Garadah	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmx3000mw88ocsp5qngy	cmozwcxlp00ai408olh0ph8t7	Potazia	potazia-union	993	2026-05-10 15:55:38.823	2026-05-10 16:52:46.644	t	পোতাজিয়া	Potazia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmxd000nw88ojhqp8a4t	cmozwcxlp00ai408olh0ph8t7	Rupbati	rupbati-union	994	2026-05-10 15:55:38.833	2026-05-10 16:52:46.65	t	রূপবাটি	Rupbati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmxr000ow88ofyq9ab2j	cmozwcxlp00ai408olh0ph8t7	Gala	gala-union	995	2026-05-10 15:55:38.848	2026-05-10 16:52:46.657	t	গালা	Gala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmy4000pw88o3a3y55t0	cmozwcxlp00ai408olh0ph8t7	Porzona	porzona-union	996	2026-05-10 15:55:38.86	2026-05-10 16:52:46.663	t	পোরজনা	Porzona	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmyh000qw88ooggxqwa6	cmozwcxlp00ai408olh0ph8t7	Habibullah Nagar	habibullah-nagar-union	997	2026-05-10 15:55:38.873	2026-05-10 16:52:46.67	t	হাবিবুল্লাহ নগর	Habibullah Nagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmyq000rw88ovpjlij22	cmozwcxlp00ai408olh0ph8t7	Khukni	khukni-union	998	2026-05-10 15:55:38.882	2026-05-10 16:52:46.676	t	খুকনী	Khukni	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmz2000sw88o2blvzjn8	cmozwcxlp00ai408olh0ph8t7	Koizuri	koizuri-union	999	2026-05-10 15:55:38.894	2026-05-10 16:52:46.683	t	কৈজুরী	Koizuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmze000tw88o4355gx1p	cmozwcxlp00ai408olh0ph8t7	Sonatoni	sonatoni-union	1000	2026-05-10 15:55:38.906	2026-05-10 16:52:46.69	t	সোনাতনী	Sonatoni	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmzn000uw88o24vvs0x6	cmozwcxlp00ai408olh0ph8t7	Narina	narina-union	1001	2026-05-10 15:55:38.916	2026-05-10 16:52:46.7	t	নরিনা	Narina	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmzz000vw88o4pgbhk8k	cmozwcxly00aj408o22d0mujs	Bagbati	bagbati-union	1002	2026-05-10 15:55:38.927	2026-05-10 16:52:46.709	t	বাগবাটি	Bagbati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn0a000ww88ourl7yvc1	cmozwcxly00aj408o22d0mujs	Ratankandi	ratankandi-union	1003	2026-05-10 15:55:38.938	2026-05-10 16:52:46.716	t	রতনকান্দি	Ratankandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn0k000xw88o4l1aqhqq	cmozwcxly00aj408o22d0mujs	Bohuli	bohuli-union	1004	2026-05-10 15:55:38.948	2026-05-10 16:52:46.723	t	বহুলী	Bohuli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmqa0001w88obel0h3j2	cmozwcxkp00ad408o3y2tabls	Baradhul	baradhul-union	952	2026-05-10 15:55:38.578	2026-05-10 16:52:46.51	t	বড়ধুল	Baradhul	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn1v0011w88o67e8zpqa	cmozwcxly00aj408o22d0mujs	Mesra	mesra-union	1008	2026-05-10 15:55:38.995	2026-05-10 16:52:46.752	t	মেছড়া	Mesra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn270012w88oko72qxwu	cmozwcxly00aj408o22d0mujs	Kowakhola	kowakhola-union	1009	2026-05-10 15:55:39.007	2026-05-10 16:52:46.76	t	কাওয়াখোলা	Kowakhola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn2m0013w88o5andgov2	cmozwcxly00aj408o22d0mujs	Kaliahoripur	kaliahoripur-union	1010	2026-05-10 15:55:39.022	2026-05-10 16:52:46.77	t	কালিয়াহরিপুর	Kaliahoripur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn2w0014w88orura5mmp	cmozwcxly00aj408o22d0mujs	Soydabad	soydabad-union	1011	2026-05-10 15:55:39.032	2026-05-10 16:52:46.777	t	সয়দাবাদ	Soydabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn390015w88ojao5xuli	cmozwcxm700ak408orwf035qf	Baruhas	baruhas-union	1012	2026-05-10 15:55:39.045	2026-05-10 16:52:46.783	t	বারুহাস	Baruhas	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn3l0016w88o79ehwgg5	cmozwcxm700ak408orwf035qf	Talam	talam-union	1013	2026-05-10 15:55:39.057	2026-05-10 16:52:46.79	t	তালম	Talam	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn3v0017w88o4pmlvvg8	cmozwcxm700ak408orwf035qf	Soguna	soguna-union	1014	2026-05-10 15:55:39.067	2026-05-10 16:52:46.797	t	সগুনা	Soguna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn480018w88oylqvf5w6	cmozwcxm700ak408orwf035qf	Magura Binod	magura-binod-union	1015	2026-05-10 15:55:39.08	2026-05-10 16:52:46.803	t	মাগুড়া বিনোদ	Magura Binod	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn4k0019w88o952nhd7k	cmozwcxm700ak408orwf035qf	Naogaon	naogaon-union	1016	2026-05-10 15:55:39.092	2026-05-10 16:52:46.81	t	নওগাঁ	Naogaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn4t001aw88o3e0mgc1p	cmozwcxm700ak408orwf035qf	Tarash Sadar	tarash-sadar-union	1017	2026-05-10 15:55:39.101	2026-05-10 16:52:46.817	t	তাড়াশ সদর	Tarash Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn54001bw88oca6j0pvg	cmozwcxm700ak408orwf035qf	Madhainagar	madhainagar-union	1018	2026-05-10 15:55:39.112	2026-05-10 16:52:46.824	t	মাধাইনগর	Madhainagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn5i001cw88orexswi6u	cmozwcxm700ak408orwf035qf	Deshigram	deshigram-union	1019	2026-05-10 15:55:39.126	2026-05-10 16:52:46.83	t	দেশীগ্রাম	Deshigram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn5s001dw88o2yrty1zc	cmozwcxmg00al408oisxpz9o4	Ullapara Sadar	ullapara-sadar-union	1020	2026-05-10 15:55:39.136	2026-05-10 16:52:46.837	t	উল্লাপাড়া সদর	Ullapara Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn64001ew88o5kjna5ub	cmozwcxmg00al408oisxpz9o4	Ramkrisnopur	ramkrisnopur-union	1021	2026-05-10 15:55:39.148	2026-05-10 16:52:46.844	t	রামকৃষ্ণপুর	Ramkrisnopur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn6g001fw88oy10u8ntw	cmozwcxmg00al408oisxpz9o4	Bangala	bangala-union	1022	2026-05-10 15:55:39.16	2026-05-10 16:52:46.85	t	বাঙ্গালা	Bangala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn6u001gw88oczk0wf5n	cmozwcxmg00al408oisxpz9o4	Udhunia	udhunia-union	1023	2026-05-10 15:55:39.174	2026-05-10 16:52:46.856	t	উধুনিয়া	Udhunia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn75001hw88ocqgg38qd	cmozwcxmg00al408oisxpz9o4	Boropangashi	boropangashi-union	1024	2026-05-10 15:55:39.185	2026-05-10 16:52:46.863	t	বড়পাঙ্গাসী	Boropangashi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn7g001iw88o3ot2dv9l	cmozwcxmg00al408oisxpz9o4	Durga Nagar	durga-nagar-union	1025	2026-05-10 15:55:39.196	2026-05-10 16:52:46.869	t	দুর্গা নগর	Durga Nagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn7s001jw88oac1wl9lp	cmozwcxmg00al408oisxpz9o4	Purnimagati	purnimagati-union	1026	2026-05-10 15:55:39.208	2026-05-10 16:52:46.875	t	পূর্ণিমাগাতী	Purnimagati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn80001kw88oc98bmob1	cmozwcxmg00al408oisxpz9o4	Salanga	salanga-union	1027	2026-05-10 15:55:39.216	2026-05-10 16:52:46.882	t	সলঙ্গা	Salanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn8b001lw88ox6wc0lfw	cmozwcxmg00al408oisxpz9o4	Hatikumrul	hatikumrul-union	1028	2026-05-10 15:55:39.227	2026-05-10 16:52:46.888	t	হটিকুমরুল	Hatikumrul	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn8k001mw88oi9u4tw90	cmozwcxmg00al408oisxpz9o4	Borohor	borohor-union	1029	2026-05-10 15:55:39.236	2026-05-10 16:52:46.895	t	বড়হর	Borohor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn8t001nw88ojvthn54i	cmozwcxmg00al408oisxpz9o4	Ponchocroshi	ponchocroshi-union	1030	2026-05-10 15:55:39.245	2026-05-10 16:52:46.901	t	পঞ্চক্রোশী	Ponchocroshi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn94001ow88ohk2knyqo	cmozwcxmg00al408oisxpz9o4	Salo	salo-union	1031	2026-05-10 15:55:39.256	2026-05-10 16:52:46.908	t	সলপ	Salo	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn9d001pw88o382s1x9a	cmozwcxmg00al408oisxpz9o4	Mohonpur	mohonpur-union	1032	2026-05-10 15:55:39.265	2026-05-10 16:52:46.914	t	মোহনপুর	Mohonpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn9o001qw88ouuzm1i41	cmozwcxil00a3408oybnoekt8	Vaina	vaina-union	1033	2026-05-10 15:55:39.276	2026-05-10 16:52:46.921	t	ভায়না	Vaina	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn9y001rw88odphp0ueq	cmozwcxil00a3408oybnoekt8	Tantibonda	tantibonda-union	1034	2026-05-10 15:55:39.286	2026-05-10 16:52:46.927	t	তাঁতিবন্দ	Tantibonda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfna9001sw88og41f8yca	cmozwcxil00a3408oybnoekt8	Manikhat	manikhat-union	1035	2026-05-10 15:55:39.297	2026-05-10 16:52:46.934	t	মানিকহাট	Manikhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnal001tw88o4mh5co13	cmozwcxil00a3408oybnoekt8	Dulai	dulai-union	1036	2026-05-10 15:55:39.309	2026-05-10 16:52:46.939	t	দুলাই	Dulai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnav001uw88olyajp05f	cmozwcxil00a3408oybnoekt8	Ahammadpur	ahammadpur-union	1037	2026-05-10 15:55:39.319	2026-05-10 16:52:46.946	t	আহম্মদপুর	Ahammadpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnb6001vw88oygja0ge0	cmozwcxil00a3408oybnoekt8	Raninagar	raninagar-union	1038	2026-05-10 15:55:39.33	2026-05-10 16:52:46.952	t	রাণীনগর	Raninagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnbh001ww88oxk08ilup	cmozwcxil00a3408oybnoekt8	Satbaria	satbaria-union	1039	2026-05-10 15:55:39.341	2026-05-10 16:52:46.959	t	সাতবাড়ীয়া	Satbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnbq001xw88ov6qzh7fc	cmozwcxil00a3408oybnoekt8	Hatkhali	hatkhali-union	1040	2026-05-10 15:55:39.35	2026-05-10 16:52:46.965	t	হাটখালী	Hatkhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnc1001yw88o8xfr95oa	cmozwcxil00a3408oybnoekt8	Nazirganj	nazirganj-union	1041	2026-05-10 15:55:39.361	2026-05-10 16:52:46.972	t	নাজিরগঞ্জ	Nazirganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfncb001zw88og7txbr5x	cmozwcxil00a3408oybnoekt8	Sagorkandi	sagorkandi-union	1042	2026-05-10 15:55:39.371	2026-05-10 16:52:46.979	t	সাগরকান্দি	Sagorkandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn0x000yw88on7qckxcu	cmozwcxly00aj408o22d0mujs	Sheyalkol	sheyalkol-union	1005	2026-05-10 15:55:38.961	2026-05-10 16:52:46.731	t	শিয়ালকোল	Sheyalkol	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn1k0010w88oyfqr6jjo	cmozwcxly00aj408o22d0mujs	Songacha	songacha-union	1007	2026-05-10 15:55:38.984	2026-05-10 16:52:46.745	t	ছোনগাছা	Songacha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfndg0023w88oyan9f879	cmozwcxhb009x408o6vs6dkx9	Dilpasar	dilpasar-union	1053	2026-05-10 15:55:39.412	2026-05-10 16:52:47.006	t	দিলপাশার	Dilpasar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfndr0024w88on0uc3wiy	cmozwcxhb009x408o6vs6dkx9	Parbhangura	parbhangura-union	1054	2026-05-10 15:55:39.423	2026-05-10 16:52:47.012	t	পারভাঙ্গুড়া	Parbhangura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfne00025w88o9lww53t7	cmozwcxi700a1408oumj6q1el	Maligachha	maligachha-union	1055	2026-05-10 15:55:39.432	2026-05-10 16:52:47.019	t	মালিগাছা	Maligachha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfneb0026w88oaqynl6wv	cmozwcxi700a1408oumj6q1el	Malanchi	malanchi-union	1056	2026-05-10 15:55:39.443	2026-05-10 16:52:47.026	t	মালঞ্চি	Malanchi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnem0027w88owtjgcaxk	cmozwcxi700a1408oumj6q1el	Gayeshpur	gayeshpur-union	1057	2026-05-10 15:55:39.454	2026-05-10 16:52:47.033	t	গয়েশপুর	Gayeshpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnew0028w88oqihca6uu	cmozwcxi700a1408oumj6q1el	Ataikula	ataikula-union	1058	2026-05-10 15:55:39.464	2026-05-10 16:52:47.039	t	আতাইকুলা	Ataikula	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnf70029w88okb81a8nl	cmozwcxi700a1408oumj6q1el	Chartarapur	chartarapur-union	1059	2026-05-10 15:55:39.475	2026-05-10 16:52:47.045	t	চরতারাপুর	Chartarapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnfh002aw88ozd766qbr	cmozwcxi700a1408oumj6q1el	Sadullahpur	sadullahpur-union	1060	2026-05-10 15:55:39.485	2026-05-10 16:52:47.052	t	সাদুল্লাপুর	Sadullahpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnfs002bw88on4kv0dm3	cmozwcxi700a1408oumj6q1el	Bharara	bharara-union	1061	2026-05-10 15:55:39.496	2026-05-10 16:52:47.059	t	ভাঁড়ারা	Bharara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfng4002cw88ohsqra58b	cmozwcxi700a1408oumj6q1el	Dogachi	dogachi-union	1062	2026-05-10 15:55:39.508	2026-05-10 16:52:47.066	t	দোগাছী	Dogachi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfngj002dw88o0a3agacc	cmozwcxi700a1408oumj6q1el	Hemayetpur	hemayetpur-union	1063	2026-05-10 15:55:39.523	2026-05-10 16:52:47.072	t	হেমায়েতপুর	Hemayetpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfngv002ew88oj1a7or72	cmozwcxi700a1408oumj6q1el	Dapunia	dapunia-union	1064	2026-05-10 15:55:39.535	2026-05-10 16:52:47.079	t	দাপুনিয়া	Dapunia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnhi002gw88owsc63cxp	cmozwcxh2009w408on3od5itm	Notun Varenga	notun-varenga-union	1066	2026-05-10 15:55:39.558	2026-05-10 16:52:47.093	t	নতুন ভারেঙ্গা	Notun Varenga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnhs002hw88oy44sxzbf	cmozwcxh2009w408on3od5itm	Koitola	koitola-union	1067	2026-05-10 15:55:39.568	2026-05-10 16:52:47.1	t	কৈটোলা	Koitola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfni4002iw88og3hawpi0	cmozwcxh2009w408on3od5itm	Chakla	chakla-union	1068	2026-05-10 15:55:39.58	2026-05-10 16:52:47.106	t	চাকলা	Chakla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnig002jw88ofgisa5nh	cmozwcxh2009w408on3od5itm	Jatsakhini	jatsakhini-union	1069	2026-05-10 15:55:39.592	2026-05-10 16:52:47.113	t	জাতসাখিনি	Jatsakhini	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfniv002kw88o5aru6yyt	cmozwcxh2009w408on3od5itm	Puran Varenga	puran-varenga-union	1070	2026-05-10 15:55:39.607	2026-05-10 16:52:47.119	t	পুরান ভারেঙ্গা	Puran Varenga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnj4002lw88oxzourjg6	cmozwcxh2009w408on3od5itm	Ruppur	ruppur-union	1071	2026-05-10 15:55:39.616	2026-05-10 16:52:47.126	t	রূপপুর	Ruppur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnjf002mw88oa1hn4i0w	cmozwcxh2009w408on3od5itm	Masumdia	masumdia-union	1072	2026-05-10 15:55:39.627	2026-05-10 16:52:47.133	t	মাসুমদিয়া	Masumdia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnjq002nw88ozhw8ocsb	cmozwcxh2009w408on3od5itm	Dhalar Char	dhalar-char-union	1073	2026-05-10 15:55:39.638	2026-05-10 16:52:47.139	t	ঢালার চর	Dhalar Char	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnk1002ow88o5k34jsad	cmozwcxhj009y408oh5jkmiq9	Handial	handial-union	1079	2026-05-10 15:55:39.649	2026-05-10 16:52:47.146	t	হান্ডিয়াল	Handial	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnkd002pw88opsplla4f	cmozwcxhj009y408oh5jkmiq9	Chhaikola	chhaikola-union	1080	2026-05-10 15:55:39.661	2026-05-10 16:52:47.153	t	ছাইকোলা	Chhaikola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnko002qw88ojgk060gr	cmozwcxhj009y408oh5jkmiq9	Nimaichara	nimaichara-union	1081	2026-05-10 15:55:39.672	2026-05-10 16:52:47.16	t	নিমাইচড়া	Nimaichara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnkx002rw88o8i1gkfmd	cmozwcxhj009y408oh5jkmiq9	Gunaigachha	gunaigachha-union	1082	2026-05-10 15:55:39.681	2026-05-10 16:52:47.166	t	গুনাইগাছা	Gunaigachha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnla002sw88o9t4ijrnq	cmozwcxhj009y408oh5jkmiq9	Parshadanga	parshadanga-union	1083	2026-05-10 15:55:39.694	2026-05-10 16:52:47.174	t	পার্শ্বডাঙ্গা	Parshadanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnll002tw88or36c24yv	cmozwcxhj009y408oh5jkmiq9	Failjana	failjana-union	1084	2026-05-10 15:55:39.705	2026-05-10 16:52:47.181	t	ফৈলজানা	Failjana	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnlv002uw88o89vx67z0	cmozwcxhj009y408oh5jkmiq9	Mulgram	mulgram-union	1085	2026-05-10 15:55:39.715	2026-05-10 16:52:47.187	t	মুলগ্রাম	Mulgram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnm7002vw88o4s1n9s77	cmozwcxhj009y408oh5jkmiq9	Haripur	haripur-union	1086	2026-05-10 15:55:39.727	2026-05-10 16:52:47.193	t	হরিপুর	Haripur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnmh002ww88owrrpcchd	cmozwcxhj009y408oh5jkmiq9	Mothurapur	mothurapur-union	1087	2026-05-10 15:55:39.737	2026-05-10 16:52:47.199	t	মথুরাপুর	Mothurapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnmr002xw88ofw16m7sy	cmozwcxhj009y408oh5jkmiq9	Bilchalan	bilchalan-union	1088	2026-05-10 15:55:39.747	2026-05-10 16:52:47.205	t	বিলচলন	Bilchalan	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnn2002yw88onkp5b63c	cmozwcxhj009y408oh5jkmiq9	Danthia Bamangram	danthia-bamangram-union	1089	2026-05-10 15:55:39.758	2026-05-10 16:52:47.211	t	দাতিয়া বামনগ্রাম	Danthia Bamangram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnnc002zw88o6xkk75xq	cmozwcxie00a2408ovyrhxtwe	Nagdemra	nagdemra-union	1090	2026-05-10 15:55:39.768	2026-05-10 16:52:47.217	t	নাগডেমড়া	Nagdemra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnnn0030w88ocbrt8le5	cmozwcxie00a2408ovyrhxtwe	Dhulauri	dhulauri-union	1091	2026-05-10 15:55:39.779	2026-05-10 16:52:47.223	t	ধুলাউড়ি	Dhulauri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnny0031w88oy7va9fxd	cmozwcxie00a2408ovyrhxtwe	Bhulbaria	bhulbaria-union	1092	2026-05-10 15:55:39.79	2026-05-10 16:52:47.229	t	ভুলবাড়ীয়া	Bhulbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfncw0021w88ow3hqlybw	cmozwcxhb009x408o6vs6dkx9	Khanmarich	khanmarich-union	1051	2026-05-10 15:55:39.392	2026-05-10 16:52:46.992	t	খানমরিচ	Khanmarich	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnd50022w88occor6t8k	cmozwcxhb009x408o6vs6dkx9	Ashtamanisha	ashtamanisha-union	1052	2026-05-10 15:55:39.401	2026-05-10 16:52:46.999	t	অষ্টমণিষা	Ashtamanisha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnpk0036w88obmcwe5z9	cmozwcxie00a2408ovyrhxtwe	Nandanpur	nandanpur-union	1097	2026-05-10 15:55:39.848	2026-05-10 16:52:47.262	t	নন্দনপুর	Nandanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnpy0037w88oodntztzx	cmozwcxie00a2408ovyrhxtwe	Khetupara	khetupara-union	1098	2026-05-10 15:55:39.862	2026-05-10 16:52:47.268	t	ক্ষেতুপাড়া	Khetupara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnqa0038w88ocipkbklo	cmozwcxie00a2408ovyrhxtwe	Ar-Ataikula	ar-ataikula-union	1099	2026-05-10 15:55:39.874	2026-05-10 16:52:47.274	t	আর-আতাইকুলা	Ar-Ataikula	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnqo0039w88oty3zk9lt	cmozwcxhr009z408oofl5p309	Brilahiribari	brilahiribari-union	1100	2026-05-10 15:55:39.888	2026-05-10 16:52:47.281	t	বৃলাহিড়ীবাড়ী	Brilahiribari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnqz003aw88o57siy1zm	cmozwcxhr009z408oofl5p309	Pungali	pungali-union	1101	2026-05-10 15:55:39.899	2026-05-10 16:52:47.287	t	পুঙ্গুলি	Pungali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnrc003bw88o0xk8qug7	cmozwcxhr009z408oofl5p309	Faridpur	faridpur-union	1102	2026-05-10 15:55:39.912	2026-05-10 16:52:47.293	t	ফরিদপুর	Faridpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnrp003cw88om9mao568	cmozwcxhr009z408oofl5p309	Hadal	hadal-union	1103	2026-05-10 15:55:39.925	2026-05-10 16:52:47.299	t	হাদল	Hadal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnrz003dw88oclkrlrbq	cmozwcxhr009z408oofl5p309	Banwarinagar	banwarinagar-union	1104	2026-05-10 15:55:39.935	2026-05-10 16:52:47.306	t	বনওয়ারীনগর	Banwarinagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfns9003ew88oxlryss3p	cmozwcxhr009z408oofl5p309	Demra	demra-union	1105	2026-05-10 15:55:39.945	2026-05-10 16:52:47.312	t	ডেমড়া	Demra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnsk003fw88ovysf6crj	cmozwcx9q008w408oy0bmfleb	Birkedar	birkedar-union	1106	2026-05-10 15:55:39.956	2026-05-10 16:52:47.318	t	বীরকেদার	Birkedar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnst003gw88ovfno5qnj	cmozwcx9q008w408oy0bmfleb	Kalai	kalai-union	1107	2026-05-10 15:55:39.965	2026-05-10 16:52:47.324	t	কালাই	Kalai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnt3003hw88ovaqw251p	cmozwcx9q008w408oy0bmfleb	Paikar	paikar-union	1108	2026-05-10 15:55:39.975	2026-05-10 16:52:47.331	t	পাইকড়	Paikar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfntc003iw88on4wzrtt5	cmozwcx9q008w408oy0bmfleb	Narhatta	narhatta-union	1109	2026-05-10 15:55:39.984	2026-05-10 16:52:47.337	t	নারহট্ট	Narhatta	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfntn003jw88ojizrty8y	cmozwcx9q008w408oy0bmfleb	Murail	murail-union	1110	2026-05-10 15:55:39.995	2026-05-10 16:52:47.344	t	মুরইল	Murail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnty003kw88o5iukmrik	cmozwcx9q008w408oy0bmfleb	Kahaloo	kahaloo-union	1111	2026-05-10 15:55:40.006	2026-05-10 16:52:47.35	t	কাহালু	Kahaloo	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnu7003lw88oh7wvxnb0	cmozwcx9q008w408oy0bmfleb	Durgapur	durgapur-union	1112	2026-05-10 15:55:40.015	2026-05-10 16:52:47.357	t	দূর্গাপুর	Durgapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnui003mw88oeeigjfda	cmozwcx9q008w408oy0bmfleb	Jamgaon	jamgaon-union	1113	2026-05-10 15:55:40.026	2026-05-10 16:52:47.364	t	জামগ্রাম	Jamgaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnus003nw88oazo8uugj	cmozwcx9q008w408oy0bmfleb	Malancha	malancha-union	1114	2026-05-10 15:55:40.036	2026-05-10 16:52:47.37	t	মালঞ্চা	Malancha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnv3003ow88owdvhgn25	cmozwcxab008z408oaowek4rq	Asekpur	asekpur-union	1138	2026-05-10 15:55:40.047	2026-05-10 16:52:47.377	t	আশেকপুর	Asekpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnvh003pw88oyzrw152x	cmozwcxab008z408oaowek4rq	Madla	madla-union	1139	2026-05-10 15:55:40.061	2026-05-10 16:52:47.383	t	মাদলা	Madla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnvt003qw88oceld8j39	cmozwcxab008z408oaowek4rq	Majhira	majhira-union	1140	2026-05-10 15:55:40.073	2026-05-10 16:52:47.389	t	মাঝিড়া	Majhira	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnw3003rw88ogzuqwflx	cmozwcxab008z408oaowek4rq	Aria	aria-union	1141	2026-05-10 15:55:40.083	2026-05-10 16:52:47.396	t	আড়িয়া	Aria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnwf003sw88o96g48v1q	cmozwcxab008z408oaowek4rq	Kharna	kharna-union	1142	2026-05-10 15:55:40.095	2026-05-10 16:52:47.403	t	খরনা	Kharna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnws003tw88oqqitcvbc	cmozwcxab008z408oaowek4rq	Khottapara	khottapara-union	1143	2026-05-10 15:55:40.108	2026-05-10 16:52:47.409	t	খোট্টাপাড়া	Khottapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnx2003uw88oe0k4265z	cmozwcxab008z408oaowek4rq	Chopinagar	chopinagar-union	1144	2026-05-10 15:55:40.118	2026-05-10 16:52:47.415	t	চোপিনগর	Chopinagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnxe003vw88oztz62huf	cmozwcxab008z408oaowek4rq	Amrul	amrul-union	1145	2026-05-10 15:55:40.13	2026-05-10 16:52:47.422	t	আমরুল	Amrul	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnxr003ww88o2m5tspod	cmozwcxab008z408oaowek4rq	Gohail	gohail-union	1146	2026-05-10 15:55:40.143	2026-05-10 16:52:47.428	t	গোহাইল	Gohail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfny2003xw88oi0gpgx4x	cmozwcx8t008r408oy65saoot	Chhatiangram	chhatiangram-union	1153	2026-05-10 15:55:40.154	2026-05-10 16:52:47.435	t	ছাতিয়ানগ্রাম	Chhatiangram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnyd003yw88ois2tqwto	cmozwcx8t008r408oy65saoot	Nasaratpur	nasaratpur-union	1154	2026-05-10 15:55:40.165	2026-05-10 16:52:47.441	t	নশরতপুর	Nasaratpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnyp003zw88o5x1qml62	cmozwcx8t008r408oy65saoot	Adamdighi	adamdighi-union	1155	2026-05-10 15:55:40.177	2026-05-10 16:52:47.448	t	আদমদিঘি	Adamdighi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnz10040w88oa1t984uc	cmozwcx8t008r408oy65saoot	Kundagram	kundagram-union	1156	2026-05-10 15:55:40.189	2026-05-10 16:52:47.455	t	কুন্দগ্রাম	Kundagram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnzc0041w88ommycw5tf	cmozwcx8t008r408oy65saoot	Chapapur	chapapur-union	1157	2026-05-10 15:55:40.2	2026-05-10 16:52:47.461	t	চাঁপাপুর	Chapapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnzo0042w88omcnhbnyj	cmozwcx8t008r408oy65saoot	Shantahar	shantahar-union	1158	2026-05-10 15:55:40.212	2026-05-10 16:52:47.468	t	সান্তাহার	Shantahar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo000043w88oj22pa7qg	cmozwcxav0092408owxek8btf	Sonatala	sonatala-union	1164	2026-05-10 15:55:40.224	2026-05-10 16:52:47.474	t	সোনাতলা	Sonatala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo090044w88ofz766ymo	cmozwcxav0092408owxek8btf	Balua	balua-union	1165	2026-05-10 15:55:40.233	2026-05-10 16:52:47.48	t	বালুয়া	Balua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnoj0033w88ovm8fdg5m	cmozwcxie00a2408ovyrhxtwe	Karamja	karamja-union	1094	2026-05-10 15:55:39.811	2026-05-10 16:52:47.242	t	করমজা	Karamja	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnp50035w88odrqu5tk2	cmozwcxie00a2408ovyrhxtwe	Gaurigram	gaurigram-union	1096	2026-05-10 15:55:39.833	2026-05-10 16:52:47.255	t	গৌরীগ্রাম	Gaurigram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo1l0048w88oxst3jmdy	cmozwcxav0092408owxek8btf	Pakulla	pakulla-union	1169	2026-05-10 15:55:40.281	2026-05-10 16:52:47.507	t	পাকুল্ল্যা	Pakulla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo1x0049w88orq6r9niu	cmozwcxav0092408owxek8btf	Tekani Chukinagar	tekani-chukinagar-union	1170	2026-05-10 15:55:40.293	2026-05-10 16:52:47.514	t	তেকানী চুকাইনগর	Tekani Chukinagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo27004aw88oyu1gvzug	cmozwcx9j008v408o2rzwzrht	Baliadighi	baliadighi-union	1181	2026-05-10 15:55:40.303	2026-05-10 16:52:47.52	t	বালিয়া দিঘী	Baliadighi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo2h004bw88o0t98n321	cmozwcx9j008v408o2rzwzrht	Dakshinpara	dakshinpara-union	1182	2026-05-10 15:55:40.313	2026-05-10 16:52:47.527	t	দক্ষিণপাড়া	Dakshinpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo2s004cw88oh1ki0bq1	cmozwcx9j008v408o2rzwzrht	Durgahata	durgahata-union	1183	2026-05-10 15:55:40.324	2026-05-10 16:52:47.533	t	দুর্গাহাটা	Durgahata	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo31004dw88oml1rg0zc	cmozwcx9j008v408o2rzwzrht	Kagail	kagail-union	1184	2026-05-10 15:55:40.333	2026-05-10 16:52:47.539	t	কাগইল	Kagail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo3c004ew88oc2fnfahz	cmozwcx9j008v408o2rzwzrht	Sonarai	sonarai-union	1185	2026-05-10 15:55:40.344	2026-05-10 16:52:47.546	t	সোনারায়	Sonarai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo3n004fw88o8iwj1pac	cmozwcx9j008v408o2rzwzrht	Rameshwarpur	rameshwarpur-union	1186	2026-05-10 15:55:40.355	2026-05-10 16:52:47.552	t	রামেশ্বরপুর	Rameshwarpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo3w004gw88o86np52tm	cmozwcx9j008v408o2rzwzrht	Naruamala	naruamala-union	1187	2026-05-10 15:55:40.364	2026-05-10 16:52:47.56	t	নাড়ুয়ামালা	Naruamala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo48004hw88o3smi0p9v	cmozwcx9j008v408o2rzwzrht	Nepaltali	nepaltali-union	1188	2026-05-10 15:55:40.376	2026-05-10 16:52:47.567	t	নেপালতলী	Nepaltali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo4h004iw88ohdwow92b	cmozwcx9j008v408o2rzwzrht	Gabtali	gabtali-union	1189	2026-05-10 15:55:40.385	2026-05-10 16:52:47.574	t	গাবতলি	Gabtali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo4r004jw88ou1uiq31y	cmozwcx9j008v408o2rzwzrht	Mahishaban	mahishaban-union	1190	2026-05-10 15:55:40.395	2026-05-10 16:52:47.58	t	মহিষাবান	Mahishaban	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo52004kw88o0y9yjk54	cmozwcx9j008v408o2rzwzrht	Nasipur	nasipur-union	1191	2026-05-10 15:55:40.406	2026-05-10 16:52:47.587	t	নশিপুর	Nasipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo5b004lw88oty9jb0uv	cmozwcxai0090408o0tdcqyzx	Mirzapur	mirzapur-union	1192	2026-05-10 15:55:40.415	2026-05-10 16:52:47.593	t	মির্জাপুর	Mirzapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo5m004mw88o502qtrqi	cmozwcxai0090408o0tdcqyzx	Khamarkandi	khamarkandi-union	1193	2026-05-10 15:55:40.426	2026-05-10 16:52:47.6	t	খামারকান্দি	Khamarkandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo5v004nw88o8m4km1tl	cmozwcxai0090408o0tdcqyzx	Garidaha	garidaha-union	1194	2026-05-10 15:55:40.435	2026-05-10 16:52:47.606	t	গাড়িদহ	Garidaha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo65004ow88o6nbd0q4n	cmozwcxai0090408o0tdcqyzx	Kusumbi	kusumbi-union	1195	2026-05-10 15:55:40.445	2026-05-10 16:52:47.613	t	কুসুম্বী	Kusumbi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo6g004pw88ok5szii9f	cmozwcxai0090408o0tdcqyzx	Bishalpur	bishalpur-union	1196	2026-05-10 15:55:40.456	2026-05-10 16:52:47.627	t	বিশালপুর	Bishalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo6p004qw88o5x2g7584	cmozwcxai0090408o0tdcqyzx	Shimabari	shimabari-union	1197	2026-05-10 15:55:40.465	2026-05-10 16:52:47.654	t	সীমাবাড়ি	Shimabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo79004sw88o9zclhiqx	cmozwcxai0090408o0tdcqyzx	Sughat	sughat-union	1199	2026-05-10 15:55:40.485	2026-05-10 16:52:47.696	t	সুঘাট	Sughat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo7k004tw88oggmjy8z8	cmozwcxai0090408o0tdcqyzx	Khanpur	khanpur-union	1200	2026-05-10 15:55:40.496	2026-05-10 16:52:47.715	t	খানপুর	Khanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo7u004uw88otnao8vr4	cmozwcxai0090408o0tdcqyzx	Bhabanipur	bhabanipur-union	1201	2026-05-10 15:55:40.506	2026-05-10 16:52:47.732	t	ভবানীপুর	Bhabanipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo83004vw88ott4jdt3p	cmozwcxao0091408orwzt76s2	Moidanhatta	moidanhatta-union	1202	2026-05-10 15:55:40.515	2026-05-10 16:52:47.741	t	ময়দানহাট্টা	Moidanhatta	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo8e004ww88ovx9it1y1	cmozwcxao0091408orwzt76s2	Kichok	kichok-union	1203	2026-05-10 15:55:40.526	2026-05-10 16:52:47.752	t	কিচক	Kichok	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo8o004xw88ottxzmv8h	cmozwcxao0091408orwzt76s2	Atmul	atmul-union	1204	2026-05-10 15:55:40.536	2026-05-10 16:52:47.768	t	আটমূল	Atmul	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo8y004yw88o39s6wvta	cmozwcxao0091408orwzt76s2	Pirob	pirob-union	1205	2026-05-10 15:55:40.546	2026-05-10 16:52:47.775	t	পিরব	Pirob	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo9b004zw88odk4lm1tz	cmozwcxao0091408orwzt76s2	Majhihatta	majhihatta-union	1206	2026-05-10 15:55:40.559	2026-05-10 16:52:47.781	t	মাঝিহট্ট	Majhihatta	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo9k0050w88ohk40wlcf	cmozwcxao0091408orwzt76s2	Buriganj	buriganj-union	1207	2026-05-10 15:55:40.568	2026-05-10 16:52:47.787	t	বুড়িগঞ্জ	Buriganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo9u0051w88osz4yj3yl	cmozwcxao0091408orwzt76s2	Bihar	bihar-union	1208	2026-05-10 15:55:40.578	2026-05-10 16:52:47.793	t	বিহার	Bihar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoa50052w88ov9np1b9k	cmozwcxao0091408orwzt76s2	Shibganj	shibganj-union	1209	2026-05-10 15:55:40.589	2026-05-10 16:52:47.799	t	শিবগঞ্জ	Shibganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoae0053w88oh8t5o0tl	cmozwcxao0091408orwzt76s2	Deuly	deuly-union	1210	2026-05-10 15:55:40.598	2026-05-10 16:52:47.805	t	দেউলি	Deuly	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoap0054w88oetgczx8y	cmozwcxao0091408orwzt76s2	Sayedpur	sayedpur-union	1211	2026-05-10 15:55:40.609	2026-05-10 16:52:47.811	t	সৈয়দপুর	Sayedpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoay0055w88ojd9pin88	cmozwcxao0091408orwzt76s2	Mokamtala	mokamtala-union	1212	2026-05-10 15:55:40.618	2026-05-10 16:52:47.817	t	মোকামতলা	Mokamtala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfob80056w88og5c8xzju	cmozwcxao0091408orwzt76s2	Raynagar	raynagar-union	1213	2026-05-10 15:55:40.628	2026-05-10 16:52:47.823	t	রায়নগর	Raynagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfobj0057w88ozqp0qa8t	cmozwcxk300aa408o5gqyvu0m	Darsanpara	darsanpara-union	1214	2026-05-10 15:55:40.639	2026-05-10 16:52:47.829	t	দর্শনপাড়া	Darsanpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo0y0046w88ov608ki08	cmozwcxav0092408owxek8btf	Digdair	digdair-union	1167	2026-05-10 15:55:40.258	2026-05-10 16:52:47.493	t	দিগদাইড়	Digdair	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo190047w88oj2rxrebh	cmozwcxav0092408owxek8btf	Madhupur	madhupur-union	1168	2026-05-10 15:55:40.269	2026-05-10 16:52:47.501	t	মধুপুর	Madhupur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfocz005cw88ofku2u3c5	cmozwcxk300aa408o5gqyvu0m	Harian	harian-union	1219	2026-05-10 15:55:40.691	2026-05-10 16:52:47.862	t	হরিয়ান	Harian	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfod7005dw88o34q2roaz	cmozwcxk300aa408o5gqyvu0m	Borgachi	borgachi-union	1220	2026-05-10 15:55:40.699	2026-05-10 16:52:47.869	t	বড়্গাছি	Borgachi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfodj005ew88o3woxl5i0	cmozwcxk300aa408o5gqyvu0m	Parila	parila-union	1221	2026-05-10 15:55:40.711	2026-05-10 16:52:47.876	t	পারিলা	Parila	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfodv005fw88oi6fn75v4	cmozwcxjg00a7408obq7k8u2l	Naopara	naopara-union	1222	2026-05-10 15:55:40.723	2026-05-10 16:52:47.882	t	নওপাড়া	Naopara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoe4005gw88os9ixb1m6	cmozwcxjg00a7408obq7k8u2l	Kismatgankoir	kismatgankoir-union	1223	2026-05-10 15:55:40.732	2026-05-10 16:52:47.889	t	কিসমতগণকৈড়	Kismatgankoir	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoeg005hw88o60nm7bew	cmozwcxjg00a7408obq7k8u2l	Pananagar	pananagar-union	1224	2026-05-10 15:55:40.744	2026-05-10 16:52:47.895	t	পানানগর	Pananagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoer005iw88o6swssxzn	cmozwcxjg00a7408obq7k8u2l	Deluabari	deluabari-union	1225	2026-05-10 15:55:40.755	2026-05-10 16:52:47.902	t	দেলুয়াবাড়ী	Deluabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfof0005jw88o18s26kbb	cmozwcxjg00a7408obq7k8u2l	Jhaluka	jhaluka-union	1226	2026-05-10 15:55:40.764	2026-05-10 16:52:47.908	t	ঝালুকা	Jhaluka	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfofc005kw88obim5srx3	cmozwcxjg00a7408obq7k8u2l	Maria	maria-union	1227	2026-05-10 15:55:40.776	2026-05-10 16:52:47.915	t	মাড়িয়া	Maria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfofl005lw88o3nlfa31j	cmozwcxjg00a7408obq7k8u2l	Joynogor	joynogor-union	1228	2026-05-10 15:55:40.785	2026-05-10 16:52:47.921	t	জয়নগর	Joynogor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfofv005mw88oteamvzvc	cmozwcxj700a6408oxlz33nek	Yousufpur	yousufpur-union	1235	2026-05-10 15:55:40.795	2026-05-10 16:52:47.93	t	ইউসুফপুর	Yousufpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfog6005nw88o0audfqky	cmozwcxj700a6408oxlz33nek	Solua	solua-union	1236	2026-05-10 15:55:40.806	2026-05-10 16:52:47.939	t	শলুয়া	Solua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfogf005ow88oix11xpjw	cmozwcxj700a6408oxlz33nek	Sardah	sardah-union	1237	2026-05-10 15:55:40.815	2026-05-10 16:52:47.948	t	সরদহ	Sardah	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfogq005pw88orbbghpbw	cmozwcxj700a6408oxlz33nek	Nimpara	nimpara-union	1238	2026-05-10 15:55:40.826	2026-05-10 16:52:47.956	t	নিমপাড়া	Nimpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoh0005qw88o7t4m53e1	cmozwcxj700a6408oxlz33nek	Charghat	charghat-union	1239	2026-05-10 15:55:40.836	2026-05-10 16:52:47.965	t	চারঘাট	Charghat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfohb005rw88oez8azooz	cmozwcxj700a6408oxlz33nek	Vialuxmipur	vialuxmipur-union	1240	2026-05-10 15:55:40.847	2026-05-10 16:52:47.972	t	ভায়ালক্ষ্মীপুর	Vialuxmipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfohm005sw88ofhmm1vug	cmozwcxka00ab408ohptvptsw	Puthia	puthia-union	1241	2026-05-10 15:55:40.858	2026-05-10 16:52:47.98	t	পুঠিয়া	Puthia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfohu005tw88ooxs652gv	cmozwcxka00ab408ohptvptsw	Belpukuria	belpukuria-union	1242	2026-05-10 15:55:40.866	2026-05-10 16:52:47.988	t	বেলপুকুরিয়া	Belpukuria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoi5005uw88oo8bpdwml	cmozwcxka00ab408ohptvptsw	Baneswar	baneswar-union	1243	2026-05-10 15:55:40.877	2026-05-10 16:52:47.996	t	বানেশ্বর	Baneswar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoif005vw88o7f3gzoft	cmozwcxka00ab408ohptvptsw	Valukgachi	valukgachi-union	1244	2026-05-10 15:55:40.887	2026-05-10 16:52:48.003	t	ভালুক গাছি	Valukgachi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoip005ww88o29tfntcl	cmozwcxka00ab408ohptvptsw	Shilmaria	shilmaria-union	1245	2026-05-10 15:55:40.897	2026-05-10 16:52:48.009	t	শিলমাড়িয়া	Shilmaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoj0005xw88o0tpcsv8s	cmozwcxka00ab408ohptvptsw	Jewpara	jewpara-union	1246	2026-05-10 15:55:40.908	2026-05-10 16:52:48.016	t	জিউপাড়া	Jewpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoj8005yw88owl9c0b2v	cmozwcxis00a4408o31ib855y	Bajubagha	bajubagha-union	1247	2026-05-10 15:55:40.916	2026-05-10 16:52:48.022	t	বাজুবাঘা	Bajubagha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfojj005zw88oovbvy6wg	cmozwcxis00a4408o31ib855y	Gorgori	gorgori-union	1248	2026-05-10 15:55:40.927	2026-05-10 16:52:48.029	t	গড়গড়ি	Gorgori	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfojt0060w88ob6weg2rf	cmozwcxis00a4408o31ib855y	Pakuria	pakuria-union	1249	2026-05-10 15:55:40.937	2026-05-10 16:52:48.035	t	পাকুড়িয়া	Pakuria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfok30061w88owiqgkg5c	cmozwcxis00a4408o31ib855y	Monigram	monigram-union	1250	2026-05-10 15:55:40.947	2026-05-10 16:52:48.041	t	মনিগ্রাম	Monigram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfokd0062w88o5d6h7knp	cmozwcxis00a4408o31ib855y	Bausa	bausa-union	1251	2026-05-10 15:55:40.957	2026-05-10 16:52:48.048	t	বাউসা	Bausa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfokm0063w88o4k5j9abh	cmozwcxis00a4408o31ib855y	Arani	arani-union	1252	2026-05-10 15:55:40.966	2026-05-10 16:52:48.054	t	আড়ানী	Arani	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfokx0064w88odntsww5v	cmozwcxjo00a8408ollakdh5a	Godagari	godagari-union	1253	2026-05-10 15:55:40.977	2026-05-10 16:52:48.061	t	গোদাগাড়ী	Godagari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfol80065w88og98rv3am	cmozwcxjo00a8408ollakdh5a	Mohonpur	mohonpur-union-1	1254	2026-05-10 15:55:40.988	2026-05-10 16:52:48.067	t	মোহনপুর	Mohonpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfolh0066w88oc0x1k9sy	cmozwcxjo00a8408ollakdh5a	Pakri	pakri-union	1255	2026-05-10 15:55:40.997	2026-05-10 16:52:48.073	t	পাকড়ী	Pakri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfolr0067w88obro4x769	cmozwcxjo00a8408ollakdh5a	Risikul	risikul-union	1256	2026-05-10 15:55:41.007	2026-05-10 16:52:48.08	t	রিশিকুল	Risikul	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfom00068w88or8fsafow	cmozwcxjo00a8408ollakdh5a	Gogram	gogram-union	1257	2026-05-10 15:55:41.016	2026-05-10 16:52:48.086	t	গোগ্রাম	Gogram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfomb0069w88oicw379s8	cmozwcxjo00a8408ollakdh5a	Matikata	matikata-union	1258	2026-05-10 15:55:41.027	2026-05-10 16:52:48.093	t	মাটিকাটা	Matikata	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfomk006aw88ozq3i6cj2	cmozwcxjo00a8408ollakdh5a	Dewpara	dewpara-union	1259	2026-05-10 15:55:41.036	2026-05-10 16:52:48.1	t	দেওপাড়া	Dewpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoc40059w88oo0s1w75l	cmozwcxk300aa408o5gqyvu0m	Damkura	damkura-union	1216	2026-05-10 15:55:40.66	2026-05-10 16:52:47.841	t	দামকুড়া	Damkura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfocd005aw88odcjtndpo	cmozwcxk300aa408o5gqyvu0m	Horipur	horipur-union	1217	2026-05-10 15:55:40.669	2026-05-10 16:52:47.848	t	হরিপুর	Horipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfonp006ew88ofuwoghvv	cmozwcxkh00ac408ojhp5p223	Badhair	badhair-union	1263	2026-05-10 15:55:41.077	2026-05-10 16:52:48.126	t	বাধাইড়	Badhair	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfony006fw88orrdu5e2t	cmozwcxkh00ac408ojhp5p223	Panchandar	panchandar-union	1264	2026-05-10 15:55:41.086	2026-05-10 16:52:48.133	t	পাঁচন্দর	Panchandar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoo8006gw88oxgbp4mxb	cmozwcxkh00ac408ojhp5p223	Saranjai	saranjai-union	1265	2026-05-10 15:55:41.096	2026-05-10 16:52:48.14	t	সরঞ্জাই	Saranjai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfooj006hw88okbjt2khx	cmozwcxkh00ac408ojhp5p223	Talondo	talondo-union	1266	2026-05-10 15:55:41.107	2026-05-10 16:52:48.146	t	তালন্দ	Talondo	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoos006iw88ozsqds1dl	cmozwcxkh00ac408ojhp5p223	Kamargaon	kamargaon-union	1267	2026-05-10 15:55:41.116	2026-05-10 16:52:48.153	t	কামারগাঁ	Kamargaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfop4006jw88o109sld2p	cmozwcxkh00ac408ojhp5p223	Chanduria	chanduria-union	1268	2026-05-10 15:55:41.128	2026-05-10 16:52:48.16	t	চান্দুড়িয়া	Chanduria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfope006kw88odwllpgk6	cmozwcxiz00a5408oizsnm102	Gobindopara	gobindopara-union	1269	2026-05-10 15:55:41.138	2026-05-10 16:52:48.166	t	গোবিন্দপাড়া	Gobindopara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfopo006lw88oq345ogwj	cmozwcxiz00a5408oizsnm102	Nordas	nordas-union	1270	2026-05-10 15:55:41.148	2026-05-10 16:52:48.173	t	নরদাস	Nordas	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfopz006mw88om61bcqg1	cmozwcxiz00a5408oizsnm102	Dippur	dippur-union	1271	2026-05-10 15:55:41.159	2026-05-10 16:52:48.18	t	দ্বীপপুর	Dippur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoq8006nw88of2hplz6e	cmozwcxiz00a5408oizsnm102	Borobihanoli	borobihanoli-union	1272	2026-05-10 15:55:41.168	2026-05-10 16:52:48.188	t	বড়বিহানলী	Borobihanoli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoqj006ow88on9by33q1	cmozwcxiz00a5408oizsnm102	Auchpara	auchpara-union	1273	2026-05-10 15:55:41.179	2026-05-10 16:52:48.198	t	আউচপাড়া	Auchpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoqv006pw88oby3nu8r2	cmozwcxiz00a5408oizsnm102	Sreepur	sreepur-union	1274	2026-05-10 15:55:41.191	2026-05-10 16:52:48.207	t	শ্রীপুর	Sreepur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfor3006qw88owxwowlhi	cmozwcxiz00a5408oizsnm102	Basupara	basupara-union	1275	2026-05-10 15:55:41.199	2026-05-10 16:52:48.217	t	বাসুপাড়া	Basupara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyforf006rw88ouwo0bx2w	cmozwcxiz00a5408oizsnm102	Kacharikoalipara	kacharikoalipara-union	1276	2026-05-10 15:55:41.211	2026-05-10 16:52:48.224	t	কাচাড়ী কোয়লিপাড়া	Kacharikoalipara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyforr006sw88oh6zra2s8	cmozwcxiz00a5408oizsnm102	Suvodanga	suvodanga-union	1277	2026-05-10 15:55:41.223	2026-05-10 16:52:48.232	t	শুভডাঙ্গা	Suvodanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfos0006tw88o4wdlks3q	cmozwcxiz00a5408oizsnm102	Mariaup	mariaup-union	1278	2026-05-10 15:55:41.232	2026-05-10 16:52:48.24	t	মাড়িয়া	Mariaup	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfosb006uw88okh19ykp9	cmozwcxiz00a5408oizsnm102	Ganipur	ganipur-union	1279	2026-05-10 15:55:41.243	2026-05-10 16:52:48.248	t	গণিপুর	Ganipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfosl006vw88ofgk1pb0h	cmozwcxiz00a5408oizsnm102	Zhikara	zhikara-union	1280	2026-05-10 15:55:41.253	2026-05-10 16:52:48.255	t	ঝিকড়া	Zhikara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfosv006ww88ofukyjz7d	cmozwcxiz00a5408oizsnm102	Gualkandi	gualkandi-union	1281	2026-05-10 15:55:41.263	2026-05-10 16:52:48.263	t	গোয়ালকান্দি	Gualkandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfot6006xw88ocdgm6ezi	cmozwcxiz00a5408oizsnm102	Hamirkutsa	hamirkutsa-union	1282	2026-05-10 15:55:41.274	2026-05-10 16:52:48.272	t	হামিরকুৎসা	Hamirkutsa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfotf006yw88ozecsf2j8	cmozwcxiz00a5408oizsnm102	Jogipara	jogipara-union	1283	2026-05-10 15:55:41.283	2026-05-10 16:52:48.28	t	যোগিপাড়া	Jogipara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfotq006zw88ovgaqcaxr	cmozwcxiz00a5408oizsnm102	Sonadanga	sonadanga-union	1284	2026-05-10 15:55:41.294	2026-05-10 16:52:48.287	t	সোনাডাঙ্গা	Sonadanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfou20070w88oms0tsfim	cmozwcxgg009t408ow27e6tvj	Brahmapur	brahmapur-union	1285	2026-05-10 15:55:41.306	2026-05-10 16:52:48.294	t	ব্রহ্মপুর	Brahmapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoud0071w88o04z744lu	cmozwcxgg009t408ow27e6tvj	Madhnagar	madhnagar-union	1286	2026-05-10 15:55:41.317	2026-05-10 16:52:48.3	t	মাধনগর	Madhnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfous0072w88oe874qrec	cmozwcxgg009t408ow27e6tvj	Khajura	khajura-union	1287	2026-05-10 15:55:41.332	2026-05-10 16:52:48.307	t	খাজুরা	Khajura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfov40073w88or509179v	cmozwcxgg009t408ow27e6tvj	Piprul	piprul-union	1288	2026-05-10 15:55:41.344	2026-05-10 16:52:48.314	t	পিপরুল	Piprul	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfovn0075w88owgj9aud0	cmozwcxgg009t408ow27e6tvj	Chhatni	chhatni-union	1290	2026-05-10 15:55:41.363	2026-05-10 16:52:48.327	t	ছাতনী	Chhatni	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfovy0076w88opooiz7zj	cmozwcxgg009t408ow27e6tvj	Tebaria	tebaria-union	1291	2026-05-10 15:55:41.374	2026-05-10 16:52:48.333	t	তেবাড়িয়া	Tebaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfow70077w88oz7hzrnxp	cmozwcxgg009t408ow27e6tvj	Dighapatia	dighapatia-union	1292	2026-05-10 15:55:41.383	2026-05-10 16:52:48.339	t	দিঘাপতিয়া	Dighapatia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfowi0078w88olwows1gc	cmozwcxgg009t408ow27e6tvj	Luxmipurkholabaria	luxmipurkholabaria-union	1293	2026-05-10 15:55:41.394	2026-05-10 16:52:48.346	t	লক্ষীপুর খোলাবাড়িয়া	Luxmipurkholabaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfowt0079w88ob1lz8z5o	cmozwcxgg009t408ow27e6tvj	Barahorispur	barahorispur-union	1294	2026-05-10 15:55:41.405	2026-05-10 16:52:48.352	t	বড়হরিশপুর	Barahorispur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfox2007aw88oa7cg366s	cmozwcxgg009t408ow27e6tvj	Kaphuria	kaphuria-union	1295	2026-05-10 15:55:41.414	2026-05-10 16:52:48.358	t	কাফুরিয়া	Kaphuria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoxd007bw88oq45ygrkv	cmozwcxgg009t408ow27e6tvj	Halsa	halsa-union	1296	2026-05-10 15:55:41.425	2026-05-10 16:52:48.365	t	হালসা	Halsa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoxm007cw88o2aj42x03	cmozwcxgn009u408o7nw8zkws	Sukash	sukash-union	1297	2026-05-10 15:55:41.434	2026-05-10 16:52:48.372	t	শুকাশ	Sukash	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfon6006cw88o3caed05c	cmozwcxjo00a8408ollakdh5a	Asariadaha	asariadaha-union	1261	2026-05-10 15:55:41.058	2026-05-10 16:52:48.113	t	আষাড়িয়াদহ	Asariadaha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfone006dw88o7ic9fu9z	cmozwcxkh00ac408ojhp5p223	Kalma	kalma-union	1262	2026-05-10 15:55:41.066	2026-05-10 16:52:48.119	t	কলমা	Kalma	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoys007gw88o4b5apdun	cmozwcxgn009u408o7nw8zkws	Chamari	chamari-union	1301	2026-05-10 15:55:41.476	2026-05-10 16:52:48.398	t	চামারী	Chamari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoz2007hw88oygpgdjc8	cmozwcxgn009u408o7nw8zkws	Hatiandaha	hatiandaha-union	1302	2026-05-10 15:55:41.486	2026-05-10 16:52:48.405	t	হাতিয়ানদহ	Hatiandaha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfozb007iw88ootopu1gd	cmozwcxgn009u408o7nw8zkws	Lalore	lalore-union	1303	2026-05-10 15:55:41.495	2026-05-10 16:52:48.412	t	লালোর	Lalore	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfozm007jw88ody4sgbgc	cmozwcxgn009u408o7nw8zkws	Sherkole	sherkole-union	1304	2026-05-10 15:55:41.506	2026-05-10 16:52:48.418	t	শেরকোল	Sherkole	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfozv007kw88ognfgo95q	cmozwcxgn009u408o7nw8zkws	Tajpur	tajpur-union	1305	2026-05-10 15:55:41.515	2026-05-10 16:52:48.425	t	তাজপুর	Tajpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp05007lw88ozpax5vky	cmozwcxgn009u408o7nw8zkws	Chaugram	chaugram-union	1306	2026-05-10 15:55:41.525	2026-05-10 16:52:48.432	t	চৌগ্রাম	Chaugram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp0p007nw88o1ofcfyc5	cmozwcxgn009u408o7nw8zkws	Ramanandakhajura	ramanandakhajura-union	1308	2026-05-10 15:55:41.545	2026-05-10 16:52:48.446	t	রামান্দখাজুরা	Ramanandakhajura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp10007ow88ovh7i2g2t	cmozwcxfl009p408ory4x20pl	Joari	joari-union	1309	2026-05-10 15:55:41.556	2026-05-10 16:52:48.453	t	জোয়াড়ী	Joari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp19007pw88ok70h8zb5	cmozwcxfl009p408ory4x20pl	Baraigram	baraigram-union	1310	2026-05-10 15:55:41.565	2026-05-10 16:52:48.46	t	বড়াইগ্রাম	Baraigram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp1l007qw88o0vq692v3	cmozwcxfl009p408ory4x20pl	Zonail	zonail-union	1311	2026-05-10 15:55:41.577	2026-05-10 16:52:48.467	t	জোনাইল	Zonail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp1x007rw88o4adzwxzq	cmozwcxfl009p408ory4x20pl	Nagor	nagor-union	1312	2026-05-10 15:55:41.589	2026-05-10 16:52:48.473	t	নগর	Nagor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp26007sw88o6agex6u2	cmozwcxfl009p408ory4x20pl	Majgoan	majgoan-union	1313	2026-05-10 15:55:41.598	2026-05-10 16:52:48.48	t	মাঝগাও	Majgoan	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp2h007tw88oyl7d8evr	cmozwcxfl009p408ory4x20pl	Gopalpur	gopalpur-union	1314	2026-05-10 15:55:41.609	2026-05-10 16:52:48.487	t	গোপালপুর	Gopalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp2p007uw88oxmlsm733	cmozwcxfl009p408ory4x20pl	Chandai	chandai-union	1315	2026-05-10 15:55:41.617	2026-05-10 16:52:48.494	t	চান্দাই	Chandai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp30007vw88ol3h70b78	cmozwcxfe009o408ozv5bc08o	Panka	panka-union	1316	2026-05-10 15:55:41.628	2026-05-10 16:52:48.5	t	পাঁকা	Panka	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp3c007ww88okf14yv5d	cmozwcxfe009o408ozv5bc08o	Jamnagor	jamnagor-union	1317	2026-05-10 15:55:41.64	2026-05-10 16:52:48.507	t	জামনগর	Jamnagor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp3l007xw88otcaeb5t7	cmozwcxfe009o408ozv5bc08o	Bagatipara	bagatipara-union	1318	2026-05-10 15:55:41.649	2026-05-10 16:52:48.514	t	বাগাতিপাড়া	Bagatipara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp3x007yw88ouva1hhtw	cmozwcxfe009o408ozv5bc08o	Dayarampur	dayarampur-union	1319	2026-05-10 15:55:41.661	2026-05-10 16:52:48.521	t	দয়ারামপুর	Dayarampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp49007zw88ofrm2b43p	cmozwcxfe009o408ozv5bc08o	Faguardiar	faguardiar-union	1320	2026-05-10 15:55:41.673	2026-05-10 16:52:48.527	t	ফাগুয়ারদিয়াড়	Faguardiar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp4i0080w88o94wgcdvh	cmozwcxg1009r408oce1wumco	Lalpur	lalpur-union	1321	2026-05-10 15:55:41.682	2026-05-10 16:52:48.534	t	লালপুর	Lalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp4t0081w88or1f6q9ay	cmozwcxg1009r408oce1wumco	Iswardi	iswardi-union	1322	2026-05-10 15:55:41.693	2026-05-10 16:52:48.54	t	ঈশ্বরদী	Iswardi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp530082w88ogifa87nu	cmozwcxg1009r408oce1wumco	Chongdhupoil	chongdhupoil-union	1323	2026-05-10 15:55:41.703	2026-05-10 16:52:48.547	t	চংধুপইল	Chongdhupoil	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp5c0083w88opdfg1tv1	cmozwcxg1009r408oce1wumco	Arbab	arbab-union	1324	2026-05-10 15:55:41.712	2026-05-10 16:52:48.553	t	আড়বাব	Arbab	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp5o0084w88oo47ets8g	cmozwcxg1009r408oce1wumco	Bilmaria	bilmaria-union	1325	2026-05-10 15:55:41.724	2026-05-10 16:52:48.559	t	বিলমাড়িয়া	Bilmaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp5w0085w88op85uz8lv	cmozwcxg1009r408oce1wumco	Duaria	duaria-union	1326	2026-05-10 15:55:41.732	2026-05-10 16:52:48.566	t	দুয়ারিয়া	Duaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp670086w88oyc6vu2pi	cmozwcxg1009r408oce1wumco	Oalia	oalia-union	1327	2026-05-10 15:55:41.743	2026-05-10 16:52:48.573	t	ওয়ালিয়া	Oalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp6g0087w88o5bd71sjs	cmozwcxg1009r408oce1wumco	Durduria	durduria-union	1328	2026-05-10 15:55:41.752	2026-05-10 16:52:48.579	t	দুড়দুরিয়া	Durduria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp6r0088w88o0qfaecvd	cmozwcxg1009r408oce1wumco	Arjunpur	arjunpur-union	1329	2026-05-10 15:55:41.763	2026-05-10 16:52:48.585	t	অর্জুনপুর বরমহাটী	Arjunpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp740089w88o1h3gp136	cmozwcxg1009r408oce1wumco	Kadimchilan	kadimchilan-union	1330	2026-05-10 15:55:41.776	2026-05-10 16:52:48.591	t	কদিমচিলান	Kadimchilan	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp7g008aw88o852w2ue3	cmozwcxfs009q408ozhqmun9w	Nazirpur	nazirpur-union	1331	2026-05-10 15:55:41.788	2026-05-10 16:52:48.599	t	নাজিরপুর	Nazirpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp7q008bw88ocs4oqm2g	cmozwcxfs009q408ozhqmun9w	Biaghat	biaghat-union	1332	2026-05-10 15:55:41.798	2026-05-10 16:52:48.606	t	বিয়াঘাট	Biaghat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp80008cw88ouan8t9xy	cmozwcxfs009q408ozhqmun9w	Khubjipur	khubjipur-union	1333	2026-05-10 15:55:41.808	2026-05-10 16:52:48.613	t	খুবজীপুর	Khubjipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp89008dw88ovm9xix0m	cmozwcxfs009q408ozhqmun9w	Dharabarisha	dharabarisha-union	1334	2026-05-10 15:55:41.817	2026-05-10 16:52:48.62	t	ধারাবারিষা	Dharabarisha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp8k008ew88ozh98x7wz	cmozwcxfs009q408ozhqmun9w	Moshindha	moshindha-union	1335	2026-05-10 15:55:41.828	2026-05-10 16:52:48.627	t	মসিন্দা	Moshindha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp8v008fw88or9pk17lu	cmozwcxfs009q408ozhqmun9w	Chapila	chapila-union	1336	2026-05-10 15:55:41.839	2026-05-10 16:52:48.633	t	চাপিলা	Chapila	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoy7007ew88o15575yvw	cmozwcxgn009u408o7nw8zkws	Italy	italy-union	1299	2026-05-10 15:55:41.455	2026-05-10 16:52:48.385	t	ইটালী	Italy	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoyg007fw88o1rxm1uqq	cmozwcxgn009u408o7nw8zkws	Kalam	kalam-union	1300	2026-05-10 15:55:41.464	2026-05-10 16:52:48.392	t	কলম	Kalam	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpa0008jw88otraf72v9	cmozwcxc20098408okl4e6zzn	Raikali	raikali-union	1340	2026-05-10 15:55:41.88	2026-05-10 16:52:48.66	t	রায়কালী	Raikali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpaj008lw88orkgptx10	cmozwcxcg009a408oadc1vfjf	Matrai	matrai-union	1342	2026-05-10 15:55:41.899	2026-05-10 16:52:48.673	t	মাত্রাই	Matrai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpav008mw88o8yu95igr	cmozwcxcg009a408oadc1vfjf	Ahammedabad	ahammedabad-union	1343	2026-05-10 15:55:41.911	2026-05-10 16:52:48.68	t	আহম্মেদাবাদ	Ahammedabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpb7008nw88ovk5uiueq	cmozwcxcg009a408oadc1vfjf	Punot	punot-union	1344	2026-05-10 15:55:41.923	2026-05-10 16:52:48.686	t	পুনট	Punot	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpbf008ow88oo6rjp0bj	cmozwcxcg009a408oadc1vfjf	Zindarpur	zindarpur-union	1345	2026-05-10 15:55:41.931	2026-05-10 16:52:48.693	t	জিন্দারপুর	Zindarpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpbq008pw88oue43gikx	cmozwcxcg009a408oadc1vfjf	Udaipur	udaipur-union	1346	2026-05-10 15:55:41.942	2026-05-10 16:52:48.7	t	উদয়পুর	Udaipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpby008qw88ogqxcqm9j	cmozwcxcn009b408ojfun9jg2	Alampur	alampur-union	1347	2026-05-10 15:55:41.95	2026-05-10 16:52:48.708	t	আলমপুর	Alampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpc9008rw88o9sitiic1	cmozwcxcn009b408ojfun9jg2	Borail	borail-union	1348	2026-05-10 15:55:41.961	2026-05-10 16:52:48.715	t	বড়াইল	Borail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpck008sw88oqp255n4q	cmozwcxcn009b408ojfun9jg2	Tulshiganga	tulshiganga-union	1349	2026-05-10 15:55:41.972	2026-05-10 16:52:48.722	t	তুলশীগংগা	Tulshiganga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpcu008tw88ol3zns88k	cmozwcxcn009b408ojfun9jg2	Mamudpur	mamudpur-union	1350	2026-05-10 15:55:41.982	2026-05-10 16:52:48.729	t	মামুদপুর	Mamudpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpd4008uw88o4jd2kqzz	cmozwcxcn009b408ojfun9jg2	Boratara	boratara-union	1351	2026-05-10 15:55:41.992	2026-05-10 16:52:48.736	t	বড়তারা	Boratara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpdd008vw88oq9g39oaq	cmozwcxct009c408o7xsgts24	Bagjana	bagjana-union	1352	2026-05-10 15:55:42.001	2026-05-10 16:52:48.743	t	বাগজানা	Bagjana	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpdn008ww88oytqz96g9	cmozwcxct009c408o7xsgts24	Dharanji	dharanji-union	1353	2026-05-10 15:55:42.011	2026-05-10 16:52:48.749	t	ধরঞ্জি	Dharanji	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpdz008xw88onxj67x5p	cmozwcxct009c408o7xsgts24	Aymarasulpur	aymarasulpur-union	1354	2026-05-10 15:55:42.023	2026-05-10 16:52:48.756	t	আয়মারসুলপুর	Aymarasulpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpe7008yw88oi87w30zt	cmozwcxct009c408o7xsgts24	Balighata	balighata-union	1355	2026-05-10 15:55:42.031	2026-05-10 16:52:48.763	t	বালিঘাটা	Balighata	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpej008zw88otqzt0y6v	cmozwcxct009c408o7xsgts24	Atapur	atapur-union	1356	2026-05-10 15:55:42.043	2026-05-10 16:52:48.769	t	আটাপুর	Atapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpes0090w88o07kf58dn	cmozwcxct009c408o7xsgts24	Mohammadpur	mohammadpur-union	1357	2026-05-10 15:55:42.052	2026-05-10 16:52:48.778	t	মোহাম্মদপুর	Mohammadpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpf30091w88o1jkl0wdw	cmozwcxct009c408o7xsgts24	Aolai	aolai-union	1358	2026-05-10 15:55:42.063	2026-05-10 16:52:48.785	t	আওলাই	Aolai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpff0092w88oqjc5v0he	cmozwcxct009c408o7xsgts24	Kusumba	kusumba-union	1359	2026-05-10 15:55:42.075	2026-05-10 16:52:48.791	t	কুসুম্বা	Kusumba	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpfo0093w88ojorqxkc2	cmozwcxc90099408oe54dqhx1	Amdai	amdai-union	1360	2026-05-10 15:55:42.084	2026-05-10 16:52:48.797	t	আমদই	Amdai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpfz0094w88oubixkii1	cmozwcxc90099408oe54dqhx1	Bamb	bamb-union	1361	2026-05-10 15:55:42.095	2026-05-10 16:52:48.804	t	বম্বু	Bamb	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpgb0095w88opmt1dvj2	cmozwcxc90099408oe54dqhx1	Dogachi	dogachi-union-1	1362	2026-05-10 15:55:42.107	2026-05-10 16:52:48.81	t	দোগাছি	Dogachi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpgl0096w88oegyqzlr9	cmozwcxc90099408oe54dqhx1	Puranapail	puranapail-union	1363	2026-05-10 15:55:42.117	2026-05-10 16:52:48.816	t	পুরানাপৈল	Puranapail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpgw0097w88osculqar8	cmozwcxc90099408oe54dqhx1	Jamalpur	jamalpur-union	1364	2026-05-10 15:55:42.128	2026-05-10 16:52:48.823	t	জামালপুর	Jamalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfph60098w88om3s749sg	cmozwcxc90099408oe54dqhx1	Chakborkat	chakborkat-union	1365	2026-05-10 15:55:42.138	2026-05-10 16:52:48.829	t	চকবরকত	Chakborkat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfphf0099w88o3344bp8c	cmozwcxc90099408oe54dqhx1	Mohammadabad	mohammadabad-union	1366	2026-05-10 15:55:42.147	2026-05-10 16:52:48.836	t	মোহাম্মদাবাদ	Mohammadabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfphp009aw88o0tg2wdsc	cmozwcxc90099408oe54dqhx1	Dhalahar	dhalahar-union	1367	2026-05-10 15:55:42.157	2026-05-10 16:52:48.842	t	ধলাহার	Dhalahar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfphy009bw88on9ahxv1d	cmozwcxc90099408oe54dqhx1	Bhadsha	bhadsha-union	1368	2026-05-10 15:55:42.166	2026-05-10 16:52:48.848	t	ভাদসা	Bhadsha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpi9009cw88otm94qia5	cmozwcxei009k408o8sts6w1w	Patnitala	patnitala-union	1432	2026-05-10 15:55:42.177	2026-05-10 16:52:48.855	t	পত্নীতলা	Patnitala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpii009dw88oqfhkn1qu	cmozwcxei009k408o8sts6w1w	Nirmail	nirmail-union	1433	2026-05-10 15:55:42.186	2026-05-10 16:52:48.861	t	নিমইল	Nirmail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpis009ew88oy3eua6g4	cmozwcxei009k408o8sts6w1w	Dibar	dibar-union	1434	2026-05-10 15:55:42.196	2026-05-10 16:52:48.868	t	দিবর	Dibar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpj2009fw88okiy25ya1	cmozwcxei009k408o8sts6w1w	Akbarpur	akbarpur-union	1435	2026-05-10 15:55:42.206	2026-05-10 16:52:48.874	t	আকবরপুর	Akbarpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpjb009gw88o7yuqv8gq	cmozwcxei009k408o8sts6w1w	Matindar	matindar-union	1436	2026-05-10 15:55:42.215	2026-05-10 16:52:48.881	t	মাটিন্দর	Matindar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpjm009hw88o3yqz21te	cmozwcxei009k408o8sts6w1w	Krishnapur	krishnapur-union	1437	2026-05-10 15:55:42.226	2026-05-10 16:52:48.888	t	কৃষ্ণপুর	Krishnapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpjv009iw88oly8c80ix	cmozwcxei009k408o8sts6w1w	Patichrara	patichrara-union	1438	2026-05-10 15:55:42.235	2026-05-10 16:52:48.895	t	পাটিচড়া	Patichrara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp9f008hw88o3zmnbzdl	cmozwcxc20098408okl4e6zzn	Sonamukhi	sonamukhi-union-1	1338	2026-05-10 15:55:41.859	2026-05-10 16:52:48.647	t	সোনামূখী	Sonamukhi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp9o008iw88oa0kjg9hr	cmozwcxc20098408okl4e6zzn	Tilakpur	tilakpur-union	1339	2026-05-10 15:55:41.868	2026-05-10 16:52:48.653	t	তিলকপুর	Tilakpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpl9009nw88oc23pdopb	cmozwcxde009f408o1yf3jm1j	Dhamoirhat	dhamoirhat-union	1443	2026-05-10 15:55:42.285	2026-05-10 16:52:48.928	t	ধামইরহাট	Dhamoirhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfplk009ow88oqcu8skrx	cmozwcxde009f408o1yf3jm1j	Alampur	alampur-union-1	1444	2026-05-10 15:55:42.296	2026-05-10 16:52:48.935	t	আলমপুর	Alampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfplu009pw88oqs3ggj1j	cmozwcxde009f408o1yf3jm1j	Umar	umar-union	1445	2026-05-10 15:55:42.306	2026-05-10 16:52:48.941	t	উমার	Umar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpm3009qw88orlhawerd	cmozwcxde009f408o1yf3jm1j	Aranagar	aranagar-union	1446	2026-05-10 15:55:42.315	2026-05-10 16:52:48.949	t	আড়ানগর	Aranagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpmd009rw88opx51ar8g	cmozwcxde009f408o1yf3jm1j	Jahanpur	jahanpur-union	1447	2026-05-10 15:55:42.325	2026-05-10 16:52:48.956	t	জাহানপুর	Jahanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpmm009sw88oovduh1a6	cmozwcxde009f408o1yf3jm1j	Isabpur	isabpur-union	1448	2026-05-10 15:55:42.334	2026-05-10 16:52:48.962	t	ইসবপুর	Isabpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpmw009tw88oiu4d36j1	cmozwcxde009f408o1yf3jm1j	Khelna	khelna-union	1449	2026-05-10 15:55:42.344	2026-05-10 16:52:48.969	t	খেলনা	Khelna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpn6009uw88o6marqin8	cmozwcxde009f408o1yf3jm1j	Agradigun	agradigun-union	1450	2026-05-10 15:55:42.354	2026-05-10 16:52:48.977	t	আগ্রাদ্বিগুন	Agradigun	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpnf009vw88o4naz42jl	cmozwcxe8009j408ocreq5rof	Hajinagar	hajinagar-union	1451	2026-05-10 15:55:42.363	2026-05-10 16:52:48.984	t	হাজীনগর	Hajinagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpnq009ww88oubbb53zi	cmozwcxe8009j408ocreq5rof	Chandannagar	chandannagar-union	1452	2026-05-10 15:55:42.374	2026-05-10 16:52:48.99	t	চন্দননগর	Chandannagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpny009xw88o9tnnnbsy	cmozwcxe8009j408ocreq5rof	Bhabicha	bhabicha-union	1453	2026-05-10 15:55:42.382	2026-05-10 16:52:48.997	t	ভাবিচা	Bhabicha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpo9009yw88ohmromwew	cmozwcxe8009j408ocreq5rof	Niamatpur	niamatpur-union	1454	2026-05-10 15:55:42.393	2026-05-10 16:52:49.003	t	নিয়ামতপুর	Niamatpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpoi009zw88o52asbzrn	cmozwcxe8009j408ocreq5rof	Rasulpur	rasulpur-union	1455	2026-05-10 15:55:42.402	2026-05-10 16:52:49.01	t	রসুলপুর	Rasulpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpos00a0w88odmj8yrod	cmozwcxe8009j408ocreq5rof	Paroil	paroil-union	1456	2026-05-10 15:55:42.412	2026-05-10 16:52:49.016	t	পাড়ইল	Paroil	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpp300a1w88ovaogq7ng	cmozwcxe8009j408ocreq5rof	Sremantapur	sremantapur-union	1457	2026-05-10 15:55:42.423	2026-05-10 16:52:49.022	t	শ্রীমন্তপুর	Sremantapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfppb00a2w88ol69zw1t1	cmozwcxe8009j408ocreq5rof	Bahadurpur	bahadurpur-union	1458	2026-05-10 15:55:42.431	2026-05-10 16:52:49.029	t	বাহাদুরপুর	Bahadurpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfppm00a3w88owj7nehz5	cmozwcxdt009h408ohv7ce1j1	Varsho	varsho-union	1459	2026-05-10 15:55:42.442	2026-05-10 16:52:49.036	t	ভারশো	Varsho	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfppv00a4w88ope2jii79	cmozwcxdt009h408ohv7ce1j1	Valain	valain-union	1460	2026-05-10 15:55:42.451	2026-05-10 16:52:49.042	t	ভালাইন	Valain	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpq500a5w88ovpte6ezd	cmozwcxdt009h408ohv7ce1j1	Paranpur	paranpur-union	1461	2026-05-10 15:55:42.461	2026-05-10 16:52:49.049	t	পরানপুর	Paranpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpqg00a6w88oycwdtgw7	cmozwcxdt009h408ohv7ce1j1	Manda	manda-union	1462	2026-05-10 15:55:42.472	2026-05-10 16:52:49.056	t	মান্দা	Manda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpqp00a7w88o9g4dbjjr	cmozwcxdt009h408ohv7ce1j1	Goneshpur	goneshpur-union	1463	2026-05-10 15:55:42.481	2026-05-10 16:52:49.063	t	গনেশপুর	Goneshpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpr200a8w88oez6ocu68	cmozwcxdt009h408ohv7ce1j1	Moinom	moinom-union	1464	2026-05-10 15:55:42.494	2026-05-10 16:52:49.07	t	মৈনম	Moinom	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfprg00a9w88okk2iwnez	cmozwcxdt009h408ohv7ce1j1	Proshadpur	proshadpur-union	1465	2026-05-10 15:55:42.509	2026-05-10 16:52:49.077	t	প্রসাদপুর	Proshadpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfprp00aaw88obo0555a9	cmozwcxdt009h408ohv7ce1j1	Kosomba	kosomba-union	1466	2026-05-10 15:55:42.517	2026-05-10 16:52:49.085	t	কুসুম্বা	Kosomba	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfprz00abw88oiwuqs9qp	cmozwcxdt009h408ohv7ce1j1	Tetulia	tetulia-union	1467	2026-05-10 15:55:42.527	2026-05-10 16:52:49.092	t	তেঁতুলিয়া	Tetulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfps800acw88oq1qj17kd	cmozwcxdt009h408ohv7ce1j1	Nurullabad	nurullabad-union	1468	2026-05-10 15:55:42.536	2026-05-10 16:52:49.099	t	নূরুল্যাবাদ	Nurullabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpsi00adw88ofskc5nkj	cmozwcxdt009h408ohv7ce1j1	Kalikapur	kalikapur-union	1469	2026-05-10 15:55:42.546	2026-05-10 16:52:49.106	t	কালিকাপুর	Kalikapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpss00aew88oly40ddge	cmozwcxdt009h408ohv7ce1j1	Kashopara	kashopara-union	1470	2026-05-10 15:55:42.556	2026-05-10 16:52:49.113	t	কাঁশোকাপুর	Kashopara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpt000afw88odc6dl7j6	cmozwcxdt009h408ohv7ce1j1	Koshob	koshob-union	1471	2026-05-10 15:55:42.564	2026-05-10 16:52:49.12	t	কশব	Koshob	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfptb00agw88om5u7oo40	cmozwcxdt009h408ohv7ce1j1	Bisnopur	bisnopur-union	1472	2026-05-10 15:55:42.575	2026-05-10 16:52:49.127	t	বিষ্ণপুর	Bisnopur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfptj00ahw88o6hxwnlhu	cmozwcxd0009d408osa00v73d	Shahagola	shahagola-union	1473	2026-05-10 15:55:42.583	2026-05-10 16:52:49.133	t	শাহাগোলা	Shahagola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfptu00aiw88oucqw9fe5	cmozwcxd0009d408osa00v73d	Bhonpara	bhonpara-union	1474	2026-05-10 15:55:42.594	2026-05-10 16:52:49.14	t	ভোঁপড়া	Bhonpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpu500ajw88opagjurg4	cmozwcxd0009d408osa00v73d	Ahsanganj	ahsanganj-union	1475	2026-05-10 15:55:42.605	2026-05-10 16:52:49.146	t	আহসানগঞ্জ	Ahsanganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpue00akw88oowo4nd6j	cmozwcxd0009d408osa00v73d	Panchupur	panchupur-union	1476	2026-05-10 15:55:42.614	2026-05-10 16:52:49.153	t	পাঁচুপুর	Panchupur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpuo00alw88oht6lbufj	cmozwcxd0009d408osa00v73d	Bisha	bisha-union	1477	2026-05-10 15:55:42.624	2026-05-10 16:52:49.16	t	বিশা	Bisha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpuw00amw88o7cff97m3	cmozwcxd0009d408osa00v73d	Maniary	maniary-union	1478	2026-05-10 15:55:42.632	2026-05-10 16:52:49.166	t	মনিয়ারী	Maniary	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpkp009lw88ojtywa9re	cmozwcxei009k408o8sts6w1w	Amair	amair-union	1441	2026-05-10 15:55:42.265	2026-05-10 16:52:48.914	t	আমাইড়	Amair	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpl0009mw88oy9ibi3lo	cmozwcxei009k408o8sts6w1w	Shihara	shihara-union	1442	2026-05-10 15:55:42.276	2026-05-10 16:52:48.921	t	শিহারা	Shihara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpwu00aqw88ogdqnwldx	cmozwcxey009m408ojtafbrff	Kashimpur	kashimpur-union	1482	2026-05-10 15:55:42.702	2026-05-10 16:52:49.192	t	কাশিমপুর	Kashimpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpx500arw88ooshn3vcv	cmozwcxey009m408ojtafbrff	Gona	gona-union	1483	2026-05-10 15:55:42.713	2026-05-10 16:52:49.199	t	গোনা	Gona	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpxj00asw88oarhd5pqn	cmozwcxey009m408ojtafbrff	Paroil	paroil-union-1	1484	2026-05-10 15:55:42.727	2026-05-10 16:52:49.205	t	পারইল	Paroil	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpxu00atw88oq4bj36ms	cmozwcxey009m408ojtafbrff	Borgoca	borgoca-union	1485	2026-05-10 15:55:42.738	2026-05-10 16:52:49.212	t	বরগাছা	Borgoca	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpy500auw88ob3h977bu	cmozwcxey009m408ojtafbrff	Kaligram	kaligram-union	1486	2026-05-10 15:55:42.749	2026-05-10 16:52:49.219	t	কালিগ্রাম	Kaligram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpyj00avw88oofsrh86t	cmozwcxey009m408ojtafbrff	Ekdala	ekdala-union	1487	2026-05-10 15:55:42.763	2026-05-10 16:52:49.225	t	একডালা	Ekdala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpyv00aww88ogtrf9l50	cmozwcxey009m408ojtafbrff	Mirat	mirat-union	1488	2026-05-10 15:55:42.775	2026-05-10 16:52:49.232	t	মিরাট	Mirat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpz400axw88ojy778nzl	cmozwcxe0009i408o5rlp94do	Barshail	barshail-union	1489	2026-05-10 15:55:42.784	2026-05-10 16:52:49.238	t	বর্ষাইল	Barshail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpzf00ayw88obhsqpw5u	cmozwcxe0009i408o5rlp94do	Kritipur	kritipur-union	1490	2026-05-10 15:55:42.795	2026-05-10 16:52:49.245	t	কির্ত্তিপুর	Kritipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpzq00azw88oev9mgvut	cmozwcxe0009i408o5rlp94do	Baktiarpur	baktiarpur-union	1491	2026-05-10 15:55:42.806	2026-05-10 16:52:49.252	t	বক্তারপুর	Baktiarpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq0000b0w88oz9m45t41	cmozwcxe0009i408o5rlp94do	Tilakpur	tilakpur-union-1	1492	2026-05-10 15:55:42.816	2026-05-10 16:52:49.258	t	তিলোকপুর	Tilakpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq0c00b1w88ojdctxwn1	cmozwcxe0009i408o5rlp94do	Hapaniya	hapaniya-union	1493	2026-05-10 15:55:42.828	2026-05-10 16:52:49.265	t	হাপানিয়া	Hapaniya	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq0l00b2w88oatny8z13	cmozwcxe0009i408o5rlp94do	Dubalhati	dubalhati-union	1494	2026-05-10 15:55:42.837	2026-05-10 16:52:49.271	t	দুবলহাটী	Dubalhati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq0v00b3w88o0wbm2fnk	cmozwcxe0009i408o5rlp94do	Boalia	boalia-union	1495	2026-05-10 15:55:42.847	2026-05-10 16:52:49.278	t	বোয়ালিয়া	Boalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq1600b4w88o6r5k2nnw	cmozwcxe0009i408o5rlp94do	Hashaigari	hashaigari-union	1496	2026-05-10 15:55:42.858	2026-05-10 16:52:49.285	t	হাঁসাইগাড়ী	Hashaigari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq1f00b5w88o0vadf0nz	cmozwcxe0009i408o5rlp94do	Chandipur	chandipur-union	1497	2026-05-10 15:55:42.867	2026-05-10 16:52:49.292	t	চন্ডিপুর	Chandipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq1p00b6w88o0lywnnua	cmozwcxe0009i408o5rlp94do	Bolihar	bolihar-union	1498	2026-05-10 15:55:42.877	2026-05-10 16:52:49.298	t	বলিহার	Bolihar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq2000b7w88oygnnn3bm	cmozwcxe0009i408o5rlp94do	Shekerpur	shekerpur-union	1499	2026-05-10 15:55:42.888	2026-05-10 16:52:49.305	t	শিকারপুর	Shekerpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq2a00b8w88o2fndrccq	cmozwcxe0009i408o5rlp94do	Shailgachhi	shailgachhi-union	1500	2026-05-10 15:55:42.898	2026-05-10 16:52:49.311	t	শৈলগাছী	Shailgachhi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq2l00b9w88ocany58y6	cmozwcxeq009l408oub57vtzq	Nitpur	nitpur-union	1501	2026-05-10 15:55:42.909	2026-05-10 16:52:49.318	t	নিতপুর	Nitpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq2w00baw88o3je6hzrg	cmozwcxeq009l408oub57vtzq	Tetulia	tetulia-union-1	1502	2026-05-10 15:55:42.92	2026-05-10 16:52:49.324	t	তেঁতুলিয়া	Tetulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq3600bbw88o5x9uncki	cmozwcxeq009l408oub57vtzq	Chhaor	chhaor-union	1503	2026-05-10 15:55:42.93	2026-05-10 16:52:49.33	t	ছাওড়	Chhaor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq3i00bcw88oflooa46h	cmozwcxeq009l408oub57vtzq	Ganguria	ganguria-union	1504	2026-05-10 15:55:42.942	2026-05-10 16:52:49.338	t	গাঙ্গুরিয়া	Ganguria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq3r00bdw88o7tlx1a59	cmozwcxeq009l408oub57vtzq	Ghatnagar	ghatnagar-union	1505	2026-05-10 15:55:42.951	2026-05-10 16:52:49.345	t	ঘাটনগর	Ghatnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq4300bew88o32b1riqv	cmozwcxeq009l408oub57vtzq	Moshidpur	moshidpur-union	1506	2026-05-10 15:55:42.963	2026-05-10 16:52:49.351	t	মশিদপুর	Moshidpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq4e00bfw88o3e0fcqkd	cmozwcxf5009n408o1aheizmv	Sapahar	sapahar-union	1507	2026-05-10 15:55:42.975	2026-05-10 16:52:49.357	t	সাপাহার	Sapahar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq4o00bgw88o56wqc72l	cmozwcxf5009n408o1aheizmv	Tilna	tilna-union	1508	2026-05-10 15:55:42.984	2026-05-10 16:52:49.364	t	তিলনা	Tilna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq4y00bhw88ocqmn93z2	cmozwcxf5009n408o1aheizmv	Aihai	aihai-union	1509	2026-05-10 15:55:42.994	2026-05-10 16:52:49.37	t	আইহাই	Aihai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq5900biw88orjpphl7g	cmozwcxf5009n408o1aheizmv	Shironti	shironti-union	1510	2026-05-10 15:55:43.005	2026-05-10 16:52:49.376	t	শিরন্টী	Shironti	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq5j00bjw88otropghvu	cmozwcxf5009n408o1aheizmv	Goala	goala-union	1511	2026-05-10 15:55:43.015	2026-05-10 16:52:49.382	t	গোয়ালা	Goala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq5u00bkw88of52r5q75	cmozwcxf5009n408o1aheizmv	Patari	patari-union	1512	2026-05-10 15:55:43.026	2026-05-10 16:52:49.388	t	পাতাড়ী	Patari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq6e00bmw88ohtplyi97	cmozwcx13007n408ow6aqaayh	Hariharnagar	hariharnagar-union	1514	2026-05-10 15:55:43.046	2026-05-10 16:52:49.401	t	হরিহরনগর	Hariharnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq6q00bnw88ofm6o63sx	cmozwcx13007n408ow6aqaayh	Haridaskati	haridaskati-union	1515	2026-05-10 15:55:43.058	2026-05-10 16:52:49.407	t	হরিদাসকাটি	Haridaskati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq6z00bow88o6sdia2r1	cmozwcx13007n408ow6aqaayh	Shyamkur	shyamkur-union	1516	2026-05-10 15:55:43.067	2026-05-10 16:52:49.414	t	শ্যামকুড়	Shyamkur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq7a00bpw88oumhadqv6	cmozwcx13007n408ow6aqaayh	Rohita	rohita-union	1517	2026-05-10 15:55:43.078	2026-05-10 16:52:49.42	t	রোহিতা	Rohita	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpwa00aow88ol1z7sce7	cmozwcxd0009d408osa00v73d	Hatkalupara	hatkalupara-union	1480	2026-05-10 15:55:42.682	2026-05-10 16:52:49.18	t	হাটকালুপাড়া	Hatkalupara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpwl00apw88oywpetwl3	cmozwcxey009m408ojtafbrff	Khatteshawr	khatteshawr-union	1481	2026-05-10 15:55:42.693	2026-05-10 16:52:49.186	t	খট্টেশ্বর রাণীনগর	Khatteshawr	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq8i00btw88or9n3axju	cmozwcx13007n408ow6aqaayh	Bhojgati	bhojgati-union	1521	2026-05-10 15:55:43.122	2026-05-10 16:52:49.446	t	ভোজগাতি	Bhojgati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq8t00buw88objye7mvk	cmozwcx13007n408ow6aqaayh	Durbadanga	durbadanga-union	1522	2026-05-10 15:55:43.133	2026-05-10 16:52:49.453	t	দুর্বাডাংগা	Durbadanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq9400bvw88on6df4nmh	cmozwcx13007n408ow6aqaayh	Dhakuria	dhakuria-union	1523	2026-05-10 15:55:43.144	2026-05-10 16:52:49.461	t	ঢাকুরিয়া	Dhakuria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq9f00bww88oukfd1uog	cmozwcx13007n408ow6aqaayh	Jhanpa	jhanpa-union	1524	2026-05-10 15:55:43.155	2026-05-10 16:52:49.473	t	ঝাঁপা	Jhanpa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqa100byw88oinuc4qif	cmozwcx13007n408ow6aqaayh	Khedapara	khedapara-union	1526	2026-05-10 15:55:43.177	2026-05-10 16:52:49.488	t	খেদাপাড়া	Khedapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqaf00bzw88oj5mhw8is	cmozwcx13007n408ow6aqaayh	Khanpur	khanpur-union-1	1527	2026-05-10 15:55:43.191	2026-05-10 16:52:49.497	t	খানপুর	Khanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqaq00c0w88oxm5t7hor	cmozwcx13007n408ow6aqaayh	Kultia	kultia-union	1528	2026-05-10 15:55:43.202	2026-05-10 16:52:49.504	t	কুলটিয়া	Kultia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqb000c1w88ogssmtvzh	cmozwcx13007n408ow6aqaayh	Kashimnagar	kashimnagar-union	1529	2026-05-10 15:55:43.213	2026-05-10 16:52:49.511	t	কাশিমনগর	Kashimnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqbc00c2w88o4fhhbcv5	cmozwcwzr007h408ov1ixcvmg	Baghutia	baghutia-union	1530	2026-05-10 15:55:43.224	2026-05-10 16:52:49.517	t	বাঘুটিয়া	Baghutia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqbl00c3w88odkqintxs	cmozwcwzr007h408ov1ixcvmg	Chalishia	chalishia-union	1531	2026-05-10 15:55:43.233	2026-05-10 16:52:49.524	t	চলিশিয়া	Chalishia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqbw00c4w88op7k87zed	cmozwcwzr007h408ov1ixcvmg	Sundoli	sundoli-union	1532	2026-05-10 15:55:43.244	2026-05-10 16:52:49.53	t	সুন্দলী	Sundoli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqc700c5w88ou4cpncpk	cmozwcwzr007h408ov1ixcvmg	Siddhipasha	siddhipasha-union	1533	2026-05-10 15:55:43.255	2026-05-10 16:52:49.537	t	সিদ্দিপাশা	Siddhipasha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqcg00c6w88ozj7vb3vp	cmozwcwzr007h408ov1ixcvmg	Sreedharpur	sreedharpur-union	1534	2026-05-10 15:55:43.264	2026-05-10 16:52:49.543	t	শ্রীধরপুর	Sreedharpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqcr00c7w88o7ikxpp4k	cmozwcwzr007h408ov1ixcvmg	Subharara	subharara-union	1535	2026-05-10 15:55:43.276	2026-05-10 16:52:49.55	t	শুভরাড়া	Subharara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqd100c8w88o1ca1i90u	cmozwcwzr007h408ov1ixcvmg	Prambag	prambag-union	1536	2026-05-10 15:55:43.285	2026-05-10 16:52:49.557	t	প্রেমবাগ	Prambag	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqdc00c9w88omgsi7ytk	cmozwcwzr007h408ov1ixcvmg	Payra	payra-union	1537	2026-05-10 15:55:43.296	2026-05-10 16:52:49.563	t	পায়রা	Payra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqdn00caw88o65af64tg	cmozwcx0v007m408osy4w6ofc	Sufalakati	sufalakati-union	1569	2026-05-10 15:55:43.307	2026-05-10 16:52:49.571	t	সুফলাকাটি	Sufalakati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqdw00cbw88oi6a1ip5m	cmozwcx0v007m408osy4w6ofc	Sagardari	sagardari-union	1570	2026-05-10 15:55:43.316	2026-05-10 16:52:49.577	t	সাগরদাড়ী	Sagardari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqe800ccw88oynsrqjjr	cmozwcx0v007m408osy4w6ofc	Majidpur	majidpur-union	1571	2026-05-10 15:55:43.328	2026-05-10 16:52:49.584	t	মজিদপুর	Majidpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqei00cdw88oydyq8d5i	cmozwcx0v007m408osy4w6ofc	Mongolkot	mongolkot-union	1572	2026-05-10 15:55:43.338	2026-05-10 16:52:49.59	t	মঙ্গলকোর্ট	Mongolkot	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqes00cew88ovqafyl5b	cmozwcx0v007m408osy4w6ofc	Bidyanandakati	bidyanandakati-union	1573	2026-05-10 15:55:43.348	2026-05-10 16:52:49.597	t	বিদ্যানন্দকাটি	Bidyanandakati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqf300cfw88o29f2n5fe	cmozwcx0v007m408osy4w6ofc	Panjia	panjia-union	1574	2026-05-10 15:55:43.359	2026-05-10 16:52:49.604	t	পাজিয়া	Panjia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqfc00cgw88os36joghr	cmozwcx0v007m408osy4w6ofc	Trimohini	trimohini-union	1575	2026-05-10 15:55:43.368	2026-05-10 16:52:49.61	t	ত্রিমোহিনী	Trimohini	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqfn00chw88ob5m06x6o	cmozwcx0v007m408osy4w6ofc	Gaurighona	gaurighona-union	1576	2026-05-10 15:55:43.379	2026-05-10 16:52:49.617	t	গৌরিঘোনা	Gaurighona	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqfx00ciw88o0mvsbrvz	cmozwcx0v007m408osy4w6ofc	Keshabpur	keshabpur-union	1577	2026-05-10 15:55:43.389	2026-05-10 16:52:49.624	t	কেশবপুর	Keshabpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqg700cjw88o3a8d3c4m	cmozwcx1b007o408ov3gyf6k8	Ulshi	ulshi-union	1593	2026-05-10 15:55:43.399	2026-05-10 16:52:49.63	t	উলশী	Ulshi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqgi00ckw88or8tfuy13	cmozwcx1b007o408ov3gyf6k8	Sharsha	sharsha-union	1594	2026-05-10 15:55:43.41	2026-05-10 16:52:49.637	t	শার্শা	Sharsha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqgs00clw88odp9c7x8q	cmozwcx1b007o408ov3gyf6k8	Lakshmanpur	lakshmanpur-union	1595	2026-05-10 15:55:43.42	2026-05-10 16:52:49.644	t	লক্ষণপুর	Lakshmanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqh200cmw88ope0khyuj	cmozwcx1b007o408ov3gyf6k8	Benapole	benapole-union	1596	2026-05-10 15:55:43.43	2026-05-10 16:52:49.651	t	বেনাপোল	Benapole	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqhg00cnw88o510d8zjx	cmozwcx1b007o408ov3gyf6k8	Bahadurpur	bahadurpur-union-1	1597	2026-05-10 15:55:43.444	2026-05-10 16:52:49.658	t	বাহাদুরপুর	Bahadurpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqhr00cow88oe6qpf26o	cmozwcx1b007o408ov3gyf6k8	Bagachra	bagachra-union	1598	2026-05-10 15:55:43.455	2026-05-10 16:52:49.664	t	বাগআচড়া	Bagachra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqi100cpw88o5eao6hsa	cmozwcx1b007o408ov3gyf6k8	Putkhali	putkhali-union	1599	2026-05-10 15:55:43.465	2026-05-10 16:52:49.671	t	পুটখালী	Putkhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqic00cqw88o3pmx1b0y	cmozwcx1b007o408ov3gyf6k8	Nizampur	nizampur-union	1600	2026-05-10 15:55:43.476	2026-05-10 16:52:49.677	t	নিজামপুর	Nizampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqil00crw88o4bzyuby1	cmozwcx1b007o408ov3gyf6k8	Dihi	dihi-union	1601	2026-05-10 15:55:43.485	2026-05-10 16:52:49.684	t	ডিহি	Dihi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqiw00csw88o2sgcsn20	cmozwcx1b007o408ov3gyf6k8	Goga	goga-union	1602	2026-05-10 15:55:43.496	2026-05-10 16:52:49.69	t	গোগা	Goga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq7v00brw88o1nt639kx	cmozwcx13007n408ow6aqaayh	Manoharpur	manoharpur-union	1519	2026-05-10 15:55:43.099	2026-05-10 16:52:49.433	t	মনোহরপুর	Manoharpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq8600bsw88ojxg5ih30	cmozwcx13007n408ow6aqaayh	Manirampur	manirampur-union	1520	2026-05-10 15:55:43.11	2026-05-10 16:52:49.44	t	মনিরামপুর	Manirampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqk200cww88ooz601pzw	cmozwcx7p008l408ocnz677hc	Noapara	noapara-union	1617	2026-05-10 15:55:43.538	2026-05-10 16:52:49.717	t	নওয়াপাড়া	Noapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqkc00cxw88oc5926ivv	cmozwcx7p008l408ocnz677hc	Parulia	parulia-union	1618	2026-05-10 15:55:43.548	2026-05-10 16:52:49.723	t	পারুলিয়া	Parulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqkn00cyw88oa8omby41	cmozwcx7p008l408ocnz677hc	Sakhipur	sakhipur-union	1619	2026-05-10 15:55:43.559	2026-05-10 16:52:49.73	t	সখিপুর	Sakhipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqkw00czw88ow7aqv598	cmozwcx7v008m408orfby4a4u	Kushadanga	kushadanga-union	1620	2026-05-10 15:55:43.568	2026-05-10 16:52:49.736	t	কুশোডাংগা	Kushadanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfql900d0w88o350tjs2y	cmozwcx7v008m408orfby4a4u	Keralkata	keralkata-union	1621	2026-05-10 15:55:43.581	2026-05-10 16:52:49.742	t	কেরালকাতা	Keralkata	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqlk00d1w88otel78jxj	cmozwcx7v008m408orfby4a4u	Keragachhi	keragachhi-union	1622	2026-05-10 15:55:43.592	2026-05-10 16:52:49.749	t	কেঁড়াগাছি	Keragachhi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqlu00d2w88ognn39i62	cmozwcx7v008m408orfby4a4u	Kaila	kaila-union	1623	2026-05-10 15:55:43.602	2026-05-10 16:52:49.755	t	কয়লা	Kaila	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqm400d3w88ohae6hr3h	cmozwcx7v008m408orfby4a4u	Jallabad	jallabad-union	1624	2026-05-10 15:55:43.612	2026-05-10 16:52:49.762	t	জালালাবাদ	Jallabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqmf00d4w88ob6oe3ccl	cmozwcx7v008m408orfby4a4u	Jogikhali	jogikhali-union	1625	2026-05-10 15:55:43.623	2026-05-10 16:52:49.769	t	যুগিখালী	Jogikhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqmo00d5w88ogg45cta9	cmozwcx7v008m408orfby4a4u	Langaljhara	langaljhara-union	1626	2026-05-10 15:55:43.633	2026-05-10 16:52:49.775	t	লাঙ্গলঝাড়া	Langaljhara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqn000d6w88otma5dces	cmozwcx7v008m408orfby4a4u	Sonabaria	sonabaria-union	1627	2026-05-10 15:55:43.644	2026-05-10 16:52:49.782	t	সোনাবাড়িয়া	Sonabaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqna00d7w88o4uu2mto6	cmozwcx7v008m408orfby4a4u	Helatala	helatala-union	1628	2026-05-10 15:55:43.654	2026-05-10 16:52:49.788	t	হেলাতলা	Helatala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqnk00d8w88oppc86q8y	cmozwcx7v008m408orfby4a4u	Chandanpur	chandanpur-union	1629	2026-05-10 15:55:43.664	2026-05-10 16:52:49.795	t	চন্দনপুর	Chandanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqnv00d9w88o8hq8ybhj	cmozwcx7v008m408orfby4a4u	Deara	deara-union	1630	2026-05-10 15:55:43.675	2026-05-10 16:52:49.801	t	দেয়ারা	Deara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqo500daw88ohge9qcia	cmozwcx7v008m408orfby4a4u	Joynagar	joynagar-union	1631	2026-05-10 15:55:43.685	2026-05-10 16:52:49.808	t	জয়নগর	Joynagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqog00dbw88or6przvsh	cmozwcx8a008o408ov5ffgn40	Shibpur	shibpur-union	1632	2026-05-10 15:55:43.696	2026-05-10 16:52:49.814	t	শিবপুর	Shibpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqor00dcw88o4hei4oxs	cmozwcx8a008o408ov5ffgn40	Labsa	labsa-union	1633	2026-05-10 15:55:43.707	2026-05-10 16:52:49.821	t	লাবসা	Labsa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqp300ddw88o4ww9sakv	cmozwcx8a008o408ov5ffgn40	Bhomra	bhomra-union	1634	2026-05-10 15:55:43.719	2026-05-10 16:52:49.828	t	ভোমরা	Bhomra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqpj00dew88oh7xhtb5z	cmozwcx8a008o408ov5ffgn40	Brahmarajpur	brahmarajpur-union	1635	2026-05-10 15:55:43.735	2026-05-10 16:52:49.834	t	ব্রক্ষ্মরাজপুর	Brahmarajpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqpy00dfw88otiwtx7ly	cmozwcx8a008o408ov5ffgn40	Balli	balli-union	1636	2026-05-10 15:55:43.75	2026-05-10 16:52:49.841	t	বল্লী	Balli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqq900dgw88oya4iwxq4	cmozwcx8a008o408ov5ffgn40	Banshdaha	banshdaha-union	1637	2026-05-10 15:55:43.761	2026-05-10 16:52:49.847	t	বাঁশদহ	Banshdaha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqqi00dhw88ou0jkup7q	cmozwcx8a008o408ov5ffgn40	Baikari	baikari-union	1638	2026-05-10 15:55:43.77	2026-05-10 16:52:49.853	t	বৈকারী	Baikari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqqr00diw88opbbwusc4	cmozwcx8a008o408ov5ffgn40	Fingri	fingri-union	1639	2026-05-10 15:55:43.779	2026-05-10 16:52:49.86	t	ফিংড়ি	Fingri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqr100djw88o16hmjk57	cmozwcx8a008o408ov5ffgn40	Dhulihar	dhulihar-union	1640	2026-05-10 15:55:43.789	2026-05-10 16:52:49.866	t	ধুলিহর	Dhulihar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqra00dkw88o3m0ioaz3	cmozwcx8a008o408ov5ffgn40	Jhaudanga	jhaudanga-union	1641	2026-05-10 15:55:43.798	2026-05-10 16:52:49.873	t	ঝাউডাঙ্গা	Jhaudanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqrl00dlw88opybge8gl	cmozwcx8a008o408ov5ffgn40	Ghona	ghona-union	1642	2026-05-10 15:55:43.809	2026-05-10 16:52:49.879	t	ঘোনা	Ghona	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqrx00dmw88o6aymasww	cmozwcx8a008o408ov5ffgn40	Kuskhali	kuskhali-union	1643	2026-05-10 15:55:43.821	2026-05-10 16:52:49.886	t	কুশখালী	Kuskhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqs600dnw88oqzrxv0xf	cmozwcx8a008o408ov5ffgn40	Alipur	alipur-union	1644	2026-05-10 15:55:43.83	2026-05-10 16:52:49.892	t	আলিপুর	Alipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqsj00dow88oezbratll	cmozwcx8a008o408ov5ffgn40	Agardari	agardari-union	1645	2026-05-10 15:55:43.843	2026-05-10 16:52:49.899	t	আগরদাড়ী	Agardari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqss00dpw88ok4au4798	cmozwcx8h008p408oberwvm8b	Atulia	atulia-union	1646	2026-05-10 15:55:43.852	2026-05-10 16:52:49.907	t	আটুলিয়া	Atulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqt100dqw88o7bjvtpo1	cmozwcx8h008p408oberwvm8b	Ishwaripur	ishwaripur-union	1647	2026-05-10 15:55:43.861	2026-05-10 16:52:49.914	t	ঈশ্বরীপুর	Ishwaripur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqtb00drw88oaqbhyq0o	cmozwcx8h008p408oberwvm8b	Kaikhali	kaikhali-union	1648	2026-05-10 15:55:43.871	2026-05-10 16:52:49.921	t	কৈখালী	Kaikhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqtk00dsw88oij3u40g0	cmozwcx8h008p408oberwvm8b	Kashimari	kashimari-union	1649	2026-05-10 15:55:43.88	2026-05-10 16:52:49.928	t	কাশিমাড়ী	Kashimari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqtv00dtw88oocqrj72l	cmozwcx8h008p408oberwvm8b	Nurnagar	nurnagar-union	1650	2026-05-10 15:55:43.891	2026-05-10 16:52:49.934	t	নুরনগর	Nurnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqu400duw88ovp8mfr2a	cmozwcx8h008p408oberwvm8b	Padmapukur	padmapukur-union	1651	2026-05-10 15:55:43.9	2026-05-10 16:52:49.941	t	পদ্মপুকুর	Padmapukur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqjg00cuw88odhn8j8x6	cmozwcx7p008l408ocnz677hc	Kulia	kulia-union	1615	2026-05-10 15:55:43.516	2026-05-10 16:52:49.704	t	কুলিয়া	Kulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqjr00cvw88oqx3kqpfs	cmozwcx7p008l408ocnz677hc	Debhata	debhata-union	1616	2026-05-10 15:55:43.527	2026-05-10 16:52:49.711	t	দেবহাটা	Debhata	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqvl00dzw88oujhq6rjo	cmozwcx8h008p408oberwvm8b	Shyamnagar	shyamnagar-union	1656	2026-05-10 15:55:43.953	2026-05-10 16:52:49.972	t	শ্যামনগর	Shyamnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqvx00e0w88ov0xtcrro	cmozwcx8h008p408oberwvm8b	Gabura	gabura-union	1657	2026-05-10 15:55:43.965	2026-05-10 16:52:49.979	t	গাবুরা	Gabura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqwa00e1w88oh00axwnh	cmozwcx8n008q408ocnynb1n8	Sarulia	sarulia-union	1658	2026-05-10 15:55:43.978	2026-05-10 16:52:49.985	t	সরুলিয়া	Sarulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqwm00e2w88o671hj8a9	cmozwcx8n008q408ocnynb1n8	Magura	magura-union	1659	2026-05-10 15:55:43.99	2026-05-10 16:52:49.992	t	মাগুরা	Magura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqww00e3w88o4wn4k4p5	cmozwcx8n008q408ocnynb1n8	Nagarghata	nagarghata-union	1660	2026-05-10 15:55:44	2026-05-10 16:52:49.999	t	নগরঘাটা	Nagarghata	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqx800e4w88o75fb6iyz	cmozwcx8n008q408ocnynb1n8	Dhandia	dhandia-union	1661	2026-05-10 15:55:44.012	2026-05-10 16:52:50.006	t	ধানদিয়া	Dhandia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqxt00e6w88onvdnhl7g	cmozwcx8n008q408ocnynb1n8	Tala	tala-union	1663	2026-05-10 15:55:44.033	2026-05-10 16:52:50.02	t	তালা	Tala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqy600e7w88oqlypwneo	cmozwcx8n008q408ocnynb1n8	Jalalpur	jalalpur-union-1	1664	2026-05-10 15:55:44.046	2026-05-10 16:52:50.027	t	জালালপুর	Jalalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqyh00e8w88oguywwrti	cmozwcx8n008q408ocnynb1n8	Khesra	khesra-union	1665	2026-05-10 15:55:44.057	2026-05-10 16:52:50.033	t	খেশরা	Khesra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqyp00e9w88ohfl2v34n	cmozwcx8n008q408ocnynb1n8	Khalishkhali	khalishkhali-union	1666	2026-05-10 15:55:44.065	2026-05-10 16:52:50.04	t	খলিশখালী	Khalishkhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqz100eaw88ou8f3yf36	cmozwcx8n008q408ocnynb1n8	Khalilnagar	khalilnagar-union	1667	2026-05-10 15:55:44.077	2026-05-10 16:52:50.047	t	খলিলনগর	Khalilnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqzd00ebw88omm23bjw2	cmozwcx8n008q408ocnynb1n8	Kumira	kumira-union	1668	2026-05-10 15:55:44.089	2026-05-10 16:52:50.054	t	কুমিরা	Kumira	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqzn00ecw88ooj1wufl1	cmozwcx8n008q408ocnynb1n8	Islamkati	islamkati-union	1669	2026-05-10 15:55:44.099	2026-05-10 16:52:50.061	t	ইসলামকাটি	Islamkati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqzx00edw88olylyro27	cmozwcx84008n408oivdj2m5q	Kushlia	kushlia-union	1670	2026-05-10 15:55:44.109	2026-05-10 16:52:50.067	t	কুশুলিয়া	Kushlia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr0600eew88ol3hn71qq	cmozwcx84008n408oivdj2m5q	Champaphul	champaphul-union	1671	2026-05-10 15:55:44.118	2026-05-10 16:52:50.073	t	চাম্পাফুল	Champaphul	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr0h00efw88ohf48nhwa	cmozwcx84008n408oivdj2m5q	Tarali	tarali-union	1672	2026-05-10 15:55:44.129	2026-05-10 16:52:50.08	t	তারালী	Tarali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr0q00egw88o4iongjz3	cmozwcx84008n408oivdj2m5q	Dakshin Sreepur	dakshin-sreepur-union	1673	2026-05-10 15:55:44.138	2026-05-10 16:52:50.086	t	দক্ষিণ শ্রীপুর	Dakshin Sreepur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr0z00ehw88o032hfj0f	cmozwcx84008n408oivdj2m5q	Dhalbaria	dhalbaria-union	1674	2026-05-10 15:55:44.147	2026-05-10 16:52:50.092	t	ধলবাড়িয়া	Dhalbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr1a00eiw88o56zvryzu	cmozwcx84008n408oivdj2m5q	Nalta	nalta-union	1675	2026-05-10 15:55:44.158	2026-05-10 16:52:50.098	t	নলতা	Nalta	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr1i00ejw88ou9scvvlb	cmozwcx84008n408oivdj2m5q	Bishnupur	bishnupur-union	1676	2026-05-10 15:55:44.166	2026-05-10 16:52:50.104	t	বিষ্ণুপুর	Bishnupur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr1t00ekw88ok4fy0pfu	cmozwcx84008n408oivdj2m5q	Bharasimla	bharasimla-union	1677	2026-05-10 15:55:44.177	2026-05-10 16:52:50.11	t	ভাড়াশিমলা	Bharasimla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr2300elw88oyvcxzf6a	cmozwcx84008n408oivdj2m5q	Mathureshpur	mathureshpur-union	1678	2026-05-10 15:55:44.187	2026-05-10 16:52:50.116	t	মথুরেশপুর	Mathureshpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr2d00emw88oca3zu2uj	cmozwcx84008n408oivdj2m5q	Ratanpur	ratanpur-union	1679	2026-05-10 15:55:44.197	2026-05-10 16:52:50.122	t	রতনপুর	Ratanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr2p00enw88otp584q7f	cmozwcx84008n408oivdj2m5q	Mautala	mautala-union	1680	2026-05-10 15:55:44.209	2026-05-10 16:52:50.129	t	মৌতলা	Mautala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr2y00eow88opw36qxmi	cmozwcx84008n408oivdj2m5q	Krishnanagar	krishnanagar-union	1681	2026-05-10 15:55:44.218	2026-05-10 16:52:50.135	t	কৃষ্ণনগর	Krishnanagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr3800epw88o5fppjgej	cmozwcx6p008g408o2bcdfh7v	Dariapur	dariapur-union	1682	2026-05-10 15:55:44.228	2026-05-10 16:52:50.141	t	দারিয়াপুর	Dariapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr3i00eqw88oqnepw5ko	cmozwcx6p008g408o2bcdfh7v	Monakhali	monakhali-union	1683	2026-05-10 15:55:44.238	2026-05-10 16:52:50.147	t	মোনাখালী	Monakhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr3r00erw88oheurxnru	cmozwcx6p008g408o2bcdfh7v	Bagowan	bagowan-union	1684	2026-05-10 15:55:44.247	2026-05-10 16:52:50.153	t	বাগোয়ান	Bagowan	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr4200esw88odhxhrjct	cmozwcx6p008g408o2bcdfh7v	Mohajanpur	mohajanpur-union	1685	2026-05-10 15:55:44.258	2026-05-10 16:52:50.159	t	মহাজনপুর	Mohajanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr4a00etw88oiu5qtu5i	cmozwcx6i008f408ofekxxh2t	Amjhupi	amjhupi-union	1686	2026-05-10 15:55:44.266	2026-05-10 16:52:50.166	t	আমঝুপি	Amjhupi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr4l00euw88o65p1yssi	cmozwcx6i008f408ofekxxh2t	Pirojpur	pirojpur-union	1687	2026-05-10 15:55:44.277	2026-05-10 16:52:50.173	t	পিরোজপুর	Pirojpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr4u00evw88oz4z7hw3l	cmozwcx6i008f408ofekxxh2t	Kutubpur	kutubpur-union	1688	2026-05-10 15:55:44.286	2026-05-10 16:52:50.179	t	কতুবপুর	Kutubpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr5400eww88ozhbp1ihp	cmozwcx6i008f408ofekxxh2t	Amdah	amdah-union	1689	2026-05-10 15:55:44.296	2026-05-10 16:52:50.186	t	আমদহ	Amdah	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr5e00exw88oup4nw3k2	cmozwcx6i008f408ofekxxh2t	Buripota	buripota-union	1690	2026-05-10 15:55:44.306	2026-05-10 16:52:50.193	t	বুড়িপোতা	Buripota	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr5n00eyw88o1ihyhmbi	cmozwcx6c008e408ogow87i2v	Tentulbaria	tentulbaria-union	1691	2026-05-10 15:55:44.315	2026-05-10 16:52:50.199	t	তেঁতুলবাড়ীয়া	Tentulbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfquw00dxw88om88xkm35	cmozwcx8h008p408oberwvm8b	Munshiganj	munshiganj-union	1654	2026-05-10 15:55:43.928	2026-05-10 16:52:49.96	t	মুন্সীগজ্ঞ	Munshiganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqv900dyw88o05so6fzd	cmozwcx8h008p408oberwvm8b	Ramjannagar	ramjannagar-union	1655	2026-05-10 15:55:43.941	2026-05-10 16:52:49.966	t	রমজাননগর	Ramjannagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr6s00f2w88ouhco9bof	cmozwcx6c008e408ogow87i2v	Sholotaka	sholotaka-union	1695	2026-05-10 15:55:44.356	2026-05-10 16:52:50.223	t	ষোলটাকা	Sholotaka	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr7100f3w88oljydodn4	cmozwcx6c008e408ogow87i2v	Shaharbati	shaharbati-union	1696	2026-05-10 15:55:44.365	2026-05-10 16:52:50.23	t	সাহারবাটী	Shaharbati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr7c00f4w88oc176pmgz	cmozwcx6c008e408ogow87i2v	Dhankolla	dhankolla-union	1697	2026-05-10 15:55:44.376	2026-05-10 16:52:50.236	t	ধানখোলা	Dhankolla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr7l00f5w88o8ymdhbx9	cmozwcx6c008e408ogow87i2v	Raipur	raipur-union	1698	2026-05-10 15:55:44.385	2026-05-10 16:52:50.242	t	রায়পুর	Raipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr7v00f6w88oxkckamm3	cmozwcx6c008e408ogow87i2v	Kathuli	kathuli-union	1699	2026-05-10 15:55:44.395	2026-05-10 16:52:50.248	t	কাথুলী	Kathuli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr8500f7w88o23fpevag	cmozwcx7b008j408ou5nga1vb	Sheikhati	sheikhati-union	1700	2026-05-10 15:55:44.405	2026-05-10 16:52:50.254	t	সেখহাটী	Sheikhati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr8f00f8w88owxfgiwxe	cmozwcx7b008j408ou5nga1vb	Tularampur	tularampur-union	1701	2026-05-10 15:55:44.415	2026-05-10 16:52:50.261	t	তুলারামপুর	Tularampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr8r00f9w88o9vdlrm7w	cmozwcx7b008j408ou5nga1vb	Kalora	kalora-union	1702	2026-05-10 15:55:44.427	2026-05-10 16:52:50.267	t	কলোড়া	Kalora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr9000faw88ok904f71i	cmozwcx7b008j408ou5nga1vb	Shahabad	shahabad-union	1703	2026-05-10 15:55:44.436	2026-05-10 16:52:50.274	t	শাহাবাদ	Shahabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr9a00fbw88ofgfoduby	cmozwcx7b008j408ou5nga1vb	Bashgram	bashgram-union	1704	2026-05-10 15:55:44.446	2026-05-10 16:52:50.28	t	বাশগ্রাম	Bashgram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr9l00fcw88ohace13nt	cmozwcx7b008j408ou5nga1vb	Habokhali	habokhali-union	1705	2026-05-10 15:55:44.457	2026-05-10 16:52:50.286	t	হবখালী	Habokhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr9u00fdw88old93q5a4	cmozwcx7b008j408ou5nga1vb	Maijpara	maijpara-union	1706	2026-05-10 15:55:44.466	2026-05-10 16:52:50.293	t	মাইজপাড়া	Maijpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfra500few88oiaa1agjp	cmozwcx7b008j408ou5nga1vb	Bisali	bisali-union	1707	2026-05-10 15:55:44.477	2026-05-10 16:52:50.299	t	বিছালী	Bisali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrae00ffw88otv3t22ne	cmozwcx7b008j408ou5nga1vb	Chandiborpur	chandiborpur-union	1708	2026-05-10 15:55:44.486	2026-05-10 16:52:50.305	t	চন্ডিবরপুর	Chandiborpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrao00fgw88oewssu36g	cmozwcx7b008j408ou5nga1vb	Bhadrabila	bhadrabila-union	1709	2026-05-10 15:55:44.496	2026-05-10 16:52:50.311	t	ভদ্রবিলা	Bhadrabila	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfraz00fhw88ou1a1g7vg	cmozwcx7b008j408ou5nga1vb	Auria	auria-union	1710	2026-05-10 15:55:44.507	2026-05-10 16:52:50.317	t	আউড়িয়া	Auria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrb800fiw88os5bz16tm	cmozwcx7b008j408ou5nga1vb	Singasholpur	singasholpur-union	1711	2026-05-10 15:55:44.516	2026-05-10 16:52:50.324	t	সিঙ্গাশোলপুর	Singasholpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrbi00fjw88ou8tznda1	cmozwcx7b008j408ou5nga1vb	Mulia	mulia-union	1712	2026-05-10 15:55:44.526	2026-05-10 16:52:50.33	t	মুলিয়া	Mulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrbr00fkw88oivgda17d	cmozwcx74008i408oa0ssrxpt	Lohagora	lohagora-union	1713	2026-05-10 15:55:44.535	2026-05-10 16:52:50.337	t	লোহাগড়া	Lohagora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrc100flw88oji2df8pk	cmozwcx74008i408oa0ssrxpt	Kashipur	kashipur-union	1714	2026-05-10 15:55:44.545	2026-05-10 16:52:50.343	t	কাশিপুর	Kashipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrcc00fmw88oyhga3sbs	cmozwcx74008i408oa0ssrxpt	Naldi	naldi-union	1715	2026-05-10 15:55:44.556	2026-05-10 16:52:50.35	t	নলদী	Naldi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrcl00fnw88o4lrw6nr6	cmozwcx74008i408oa0ssrxpt	Noagram	noagram-union	1716	2026-05-10 15:55:44.565	2026-05-10 16:52:50.356	t	নোয়াগ্রাম	Noagram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrcw00fow88ollqv5hei	cmozwcx74008i408oa0ssrxpt	Lahuria	lahuria-union	1717	2026-05-10 15:55:44.576	2026-05-10 16:52:50.363	t	লাহুড়িয়া	Lahuria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrd600fpw88o4iacxqcg	cmozwcx74008i408oa0ssrxpt	Mallikpur	mallikpur-union	1718	2026-05-10 15:55:44.586	2026-05-10 16:52:50.369	t	মল্লিকপুর	Mallikpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrdg00fqw88o3giuocm6	cmozwcx74008i408oa0ssrxpt	Salnagar	salnagar-union	1719	2026-05-10 15:55:44.596	2026-05-10 16:52:50.376	t	শালনগর	Salnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrds00frw88ogm4720gq	cmozwcx74008i408oa0ssrxpt	Lakshmipasha	lakshmipasha-union	1720	2026-05-10 15:55:44.608	2026-05-10 16:52:50.383	t	লক্ষীপাশা	Lakshmipasha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfre100fsw88oe13n11nt	cmozwcx74008i408oa0ssrxpt	Joypur	joypur-union	1721	2026-05-10 15:55:44.617	2026-05-10 16:52:50.39	t	জয়পুর	Joypur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrec00ftw88om70omxhv	cmozwcx74008i408oa0ssrxpt	Kotakol	kotakol-union	1722	2026-05-10 15:55:44.628	2026-05-10 16:52:50.397	t	কোটাকোল	Kotakol	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrem00fuw88opsx2g15x	cmozwcx74008i408oa0ssrxpt	Digholia	digholia-union	1723	2026-05-10 15:55:44.638	2026-05-10 16:52:50.403	t	দিঘলিয়া	Digholia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrew00fvw88oybe26qni	cmozwcx74008i408oa0ssrxpt	Itna	itna-union	1724	2026-05-10 15:55:44.648	2026-05-10 16:52:50.41	t	ইতনা	Itna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrf700fww88ot8495ln2	cmozwcx6w008h408oo8tga1s8	Jaynagor	jaynagor-union	1725	2026-05-10 15:55:44.659	2026-05-10 16:52:50.417	t	জয়নগর	Jaynagor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrfg00fxw88ojjtg4dlv	cmozwcx6w008h408oo8tga1s8	Pahordanga	pahordanga-union	1726	2026-05-10 15:55:44.668	2026-05-10 16:52:50.424	t	পহরডাঙ্গা	Pahordanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrg200fzw88o1qamh9qd	cmozwcx6w008h408oo8tga1s8	Salamabad	salamabad-union	1728	2026-05-10 15:55:44.69	2026-05-10 16:52:50.437	t	সালামাবাদ	Salamabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrgb00g0w88om2wu0gpe	cmozwcx6w008h408oo8tga1s8	Baioshona	baioshona-union	1729	2026-05-10 15:55:44.699	2026-05-10 16:52:50.443	t	বাঐসোনা	Baioshona	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrgm00g1w88oxebnjtry	cmozwcx6w008h408oo8tga1s8	Chacuri	chacuri-union	1730	2026-05-10 15:55:44.71	2026-05-10 16:52:50.45	t	চাচুড়ী	Chacuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr6700f0w88oyxfeoh1j	cmozwcx6c008e408ogow87i2v	Bamondi	bamondi-union	1693	2026-05-10 15:55:44.335	2026-05-10 16:52:50.211	t	বামন্দী	Bamondi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr6h00f1w88odousdbi3	cmozwcx6c008e408ogow87i2v	Motmura	motmura-union	1694	2026-05-10 15:55:44.345	2026-05-10 16:52:50.218	t	মটমুড়া	Motmura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrht00g5w88owvj7qpep	cmozwcx6w008h408oo8tga1s8	Purulia	purulia-union	1734	2026-05-10 15:55:44.753	2026-05-10 16:52:50.479	t	পুরুলিয়া	Purulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfri300g6w88o5cesz95b	cmozwcx6w008h408oo8tga1s8	Kalabaria	kalabaria-union	1735	2026-05-10 15:55:44.763	2026-05-10 16:52:50.486	t	কলাবাড়ীয়া	Kalabaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrie00g7w88oz841myuz	cmozwcx6w008h408oo8tga1s8	Mauli	mauli-union	1736	2026-05-10 15:55:44.774	2026-05-10 16:52:50.493	t	মাউলী	Mauli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfriy00g9w88oi5i8kld8	cmozwcx6w008h408oo8tga1s8	Panchgram	panchgram-union	1738	2026-05-10 15:55:44.794	2026-05-10 16:52:50.506	t	পাঁচগ্রাম	Panchgram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrj800gaw88onosgmx83	cmozwcwz2007e408of5ylwar6	Alukdia	alukdia-union	1739	2026-05-10 15:55:44.804	2026-05-10 16:52:50.513	t	আলুকদিয়া	Alukdia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrjh00gbw88ox20us5ko	cmozwcwz2007e408of5ylwar6	Mominpur	mominpur-union	1740	2026-05-10 15:55:44.813	2026-05-10 16:52:50.519	t	মোমিনপুর	Mominpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrjr00gcw88obkpnyeec	cmozwcwz2007e408of5ylwar6	Titudah	titudah-union	1741	2026-05-10 15:55:44.823	2026-05-10 16:52:50.526	t	তিতুদাহ	Titudah	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrk000gdw88o4quyvjih	cmozwcwz2007e408of5ylwar6	Shankarchandra	shankarchandra-union	1742	2026-05-10 15:55:44.832	2026-05-10 16:52:50.533	t	শংকরচন্দ্র	Shankarchandra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrkc00gew88o8cx4usvv	cmozwcwz2007e408of5ylwar6	Begumpur	begumpur-union	1743	2026-05-10 15:55:44.844	2026-05-10 16:52:50.539	t	বেগমপুর	Begumpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrko00gfw88ox9swy1t0	cmozwcwz2007e408of5ylwar6	Kutubpur	kutubpur-union-1	1744	2026-05-10 15:55:44.856	2026-05-10 16:52:50.546	t	কুতুবপুর	Kutubpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrkx00ggw88okkgx5ury	cmozwcwz2007e408of5ylwar6	Padmabila	padmabila-union	1745	2026-05-10 15:55:44.865	2026-05-10 16:52:50.553	t	পদ্মবিলা	Padmabila	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrl800ghw88o5kkwzzrm	cmozwcwyw007d408oyaojkvau	Bhangbaria	bhangbaria-union	1746	2026-05-10 15:55:44.876	2026-05-10 16:52:50.559	t	ভাংবাড়ীয়া	Bhangbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrlh00giw88ourm9pq3d	cmozwcwyw007d408oyaojkvau	Baradi	baradi-union	1747	2026-05-10 15:55:44.885	2026-05-10 16:52:50.566	t	বাড়াদী	Baradi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrlr00gjw88o7aendsbv	cmozwcwyw007d408oyaojkvau	Gangni	gangni-union	1748	2026-05-10 15:55:44.895	2026-05-10 16:52:50.572	t	গাংনী	Gangni	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrm400gkw88ok1p1a45j	cmozwcwyw007d408oyaojkvau	Khadimpur	khadimpur-union	1749	2026-05-10 15:55:44.908	2026-05-10 16:52:50.579	t	খাদিমপুর	Khadimpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrmd00glw88oqtxpbzi2	cmozwcwyw007d408oyaojkvau	Jehala	jehala-union	1750	2026-05-10 15:55:44.917	2026-05-10 16:52:50.585	t	জেহালা	Jehala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrmn00gmw88oh0z1apvz	cmozwcwyw007d408oyaojkvau	Belgachi	belgachi-union	1751	2026-05-10 15:55:44.927	2026-05-10 16:52:50.591	t	বেলগাছি	Belgachi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrmy00gnw88oiojz5k2z	cmozwcwyw007d408oyaojkvau	Dauki	dauki-union	1752	2026-05-10 15:55:44.938	2026-05-10 16:52:50.598	t	ডাউকী	Dauki	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrn700gow88o8qn6ghl2	cmozwcwyw007d408oyaojkvau	Jamjami	jamjami-union	1753	2026-05-10 15:55:44.948	2026-05-10 16:52:50.604	t	জামজামি	Jamjami	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrni00gpw88onk3ab2ck	cmozwcwyw007d408oyaojkvau	Nagdah	nagdah-union	1754	2026-05-10 15:55:44.958	2026-05-10 16:52:50.61	t	নাগদাহ	Nagdah	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrnq00gqw88og5cbyf1a	cmozwcwyw007d408oyaojkvau	Kashkorara	kashkorara-union	1755	2026-05-10 15:55:44.966	2026-05-10 16:52:50.617	t	খাসকররা	Kashkorara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfro100grw88oy9i8rl04	cmozwcwyw007d408oyaojkvau	Chitla	chitla-union	1756	2026-05-10 15:55:44.977	2026-05-10 16:52:50.623	t	চিৎলা	Chitla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrob00gsw88oitewkg07	cmozwcwyw007d408oyaojkvau	Kalidashpur	kalidashpur-union	1757	2026-05-10 15:55:44.987	2026-05-10 16:52:50.629	t	কালিদাসপুর	Kalidashpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrok00gtw88ofc96iqgu	cmozwcwyw007d408oyaojkvau	Kumari	kumari-union	1758	2026-05-10 15:55:44.996	2026-05-10 16:52:50.635	t	কুমারী	Kumari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrou00guw88o1y0pi5us	cmozwcwyw007d408oyaojkvau	Hardi	hardi-union	1759	2026-05-10 15:55:45.006	2026-05-10 16:52:50.641	t	হারদী	Hardi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrp300gvw88oov8o0068	cmozwcwyw007d408oyaojkvau	Ailhash	ailhash-union	1760	2026-05-10 15:55:45.015	2026-05-10 16:52:50.648	t	আইলহাঁস	Ailhash	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrpd00gww88oj4f4l8rx	cmozwcwza007f408o69mh5qz5	Damurhuda	damurhuda-union	1761	2026-05-10 15:55:45.025	2026-05-10 16:52:50.654	t	দামুড়হুদা	Damurhuda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrpm00gxw88oxcq5mxpu	cmozwcwza007f408o69mh5qz5	Karpashdanga	karpashdanga-union	1762	2026-05-10 15:55:45.034	2026-05-10 16:52:50.661	t	কার্পাসডাঙ্গা	Karpashdanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrpx00gyw88ot9l8euhi	cmozwcwza007f408o69mh5qz5	Natipota	natipota-union	1763	2026-05-10 15:55:45.045	2026-05-10 16:52:50.667	t	নতিপোতা	Natipota	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrq700gzw88oy96d22sq	cmozwcwza007f408o69mh5qz5	Hawli	hawli-union	1764	2026-05-10 15:55:45.055	2026-05-10 16:52:50.674	t	হাওলী	Hawli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrqh00h0w88of7bdvkx5	cmozwcwza007f408o69mh5qz5	Kurulgachhi	kurulgachhi-union	1765	2026-05-10 15:55:45.065	2026-05-10 16:52:50.68	t	কুড়ালগাছী	Kurulgachhi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrqs00h1w88owau1w51w	cmozwcwza007f408o69mh5qz5	Perkrishnopur Madna	perkrishnopur-madna-union	1766	2026-05-10 15:55:45.076	2026-05-10 16:52:50.686	t	পারকৃষ্ণপুর মদনা	Perkrishnopur Madna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrr100h2w88orzy6vg48	cmozwcwza007f408o69mh5qz5	Juranpur	juranpur-union	1767	2026-05-10 15:55:45.085	2026-05-10 16:52:50.692	t	জুড়ানপুর	Juranpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrrb00h3w88o8cpp98g5	cmozwcwzi007g408o9wieeikm	Uthali	uthali-union	1768	2026-05-10 15:55:45.095	2026-05-10 16:52:50.698	t	উথলী	Uthali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrrl00h4w88owwqc0cde	cmozwcwzi007g408o9wieeikm	Andulbaria	andulbaria-union	1769	2026-05-10 15:55:45.105	2026-05-10 16:52:50.704	t	আন্দুলবাড়ীয়া	Andulbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrh700g3w88okxi5xsj3	cmozwcx6w008h408oo8tga1s8	Peroli	peroli-union	1732	2026-05-10 15:55:44.731	2026-05-10 16:52:50.465	t	পেড়লী	Peroli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrhj00g4w88oexhjug3l	cmozwcx6w008h408oo8tga1s8	Khashial	khashial-union	1733	2026-05-10 15:55:44.743	2026-05-10 16:52:50.472	t	খাসিয়াল	Khashial	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrso00h8w88oza6ldpef	cmozwcwzi007g408o9wieeikm	Hasadah	hasadah-union	1773	2026-05-10 15:55:45.144	2026-05-10 16:52:50.73	t	হাসাদাহ	Hasadah	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrsx00h9w88o8fr9fhfw	cmozwcx540088408oklsr3z9e	Hatash Haripur	hatash-haripur-union	1774	2026-05-10 15:55:45.153	2026-05-10 16:52:50.736	t	হাটশ হরিপুর	Hatash Haripur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrt700haw88odzd1x6nn	cmozwcx540088408oklsr3z9e	Barkhada	barkhada-union	1775	2026-05-10 15:55:45.163	2026-05-10 16:52:50.742	t	বারখাদা	Barkhada	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrth00hbw88oxismhgkw	cmozwcx540088408oklsr3z9e	Mazampur	mazampur-union	1776	2026-05-10 15:55:45.173	2026-05-10 16:52:50.749	t	মজমপুর	Mazampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrtq00hcw88onrjs3qvc	cmozwcx540088408oklsr3z9e	Bottail	bottail-union	1777	2026-05-10 15:55:45.182	2026-05-10 16:52:50.755	t	বটতৈল	Bottail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfru200hdw88ox2qx0x9d	cmozwcx540088408oklsr3z9e	Alampur	alampur-union-2	1778	2026-05-10 15:55:45.194	2026-05-10 16:52:50.762	t	আলামপুর	Alampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfruc00hew88onp6fzz0g	cmozwcx540088408oklsr3z9e	Ziaraakhi	ziaraakhi-union	1779	2026-05-10 15:55:45.204	2026-05-10 16:52:50.768	t	জিয়ারাখী	Ziaraakhi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrul00hfw88o4pplx8zh	cmozwcx540088408oklsr3z9e	Ailchara	ailchara-union	1780	2026-05-10 15:55:45.213	2026-05-10 16:52:50.774	t	আইলচারা	Ailchara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfruv00hgw88o7c5tjwm7	cmozwcx540088408oklsr3z9e	Patikabari	patikabari-union	1781	2026-05-10 15:55:45.224	2026-05-10 16:52:50.781	t	পাটিকাবাড়ী	Patikabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrv400hhw88o4y9n9f6a	cmozwcx540088408oklsr3z9e	Jhaudia	jhaudia-union	1782	2026-05-10 15:55:45.232	2026-05-10 16:52:50.787	t	ঝাউদিয়া	Jhaudia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrve00hiw88o5wbxcmop	cmozwcx540088408oklsr3z9e	Ujangram	ujangram-union	1783	2026-05-10 15:55:45.242	2026-05-10 16:52:50.793	t	উজানগ্রাম	Ujangram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrvy00hkw88o4e5cijge	cmozwcx540088408oklsr3z9e	Harinarayanpur	harinarayanpur-union	1785	2026-05-10 15:55:45.262	2026-05-10 16:52:50.806	t	হরিনারায়নপুর	Harinarayanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrw800hlw88o03381i9j	cmozwcx540088408oklsr3z9e	Monohardia	monohardia-union	1786	2026-05-10 15:55:45.273	2026-05-10 16:52:50.812	t	মনোহরদিয়া	Monohardia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrwh00hmw88o625znnb5	cmozwcx540088408oklsr3z9e	Goswami Durgapur	goswami-durgapur-union	1787	2026-05-10 15:55:45.281	2026-05-10 16:52:50.818	t	গোস্বামী দুর্গাপুর	Goswami Durgapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrwt00hnw88ogtocgtra	cmozwcx4w0087408otkmghm54	Kaya	kaya-union	1788	2026-05-10 15:55:45.293	2026-05-10 16:52:50.823	t	কয়া	Kaya	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrx300how88osj0kthu1	cmozwcx4w0087408otkmghm54	Jagonnathpur	jagonnathpur-union	1789	2026-05-10 15:55:45.303	2026-05-10 16:52:50.83	t	জগন্নাথপুর	Jagonnathpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrxe00hpw88odyuiznvq	cmozwcx4w0087408otkmghm54	Sadki	sadki-union	1790	2026-05-10 15:55:45.314	2026-05-10 16:52:50.835	t	সদকী	Sadki	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrxp00hqw88o5nmfb38r	cmozwcx4w0087408otkmghm54	Shelaidah	shelaidah-union	1791	2026-05-10 15:55:45.325	2026-05-10 16:52:50.841	t	শিলাইদহ	Shelaidah	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrxy00hrw88ovfgi9gmw	cmozwcx4w0087408otkmghm54	Nandolalpur	nandolalpur-union	1792	2026-05-10 15:55:45.334	2026-05-10 16:52:50.848	t	নন্দলালপুর	Nandolalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfry800hsw88ooiybgio3	cmozwcx4w0087408otkmghm54	Chapra	chapra-union	1793	2026-05-10 15:55:45.344	2026-05-10 16:52:50.854	t	চাপড়া	Chapra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfryk00htw88ovc2j9bja	cmozwcx4w0087408otkmghm54	Bagulat	bagulat-union	1794	2026-05-10 15:55:45.356	2026-05-10 16:52:50.86	t	বাগুলাট	Bagulat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfryt00huw88osjicopn2	cmozwcx4w0087408otkmghm54	Jaduboyra	jaduboyra-union	1795	2026-05-10 15:55:45.365	2026-05-10 16:52:50.867	t	যদুবয়রা	Jaduboyra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrz400hvw88oo7qwzqbf	cmozwcx4w0087408otkmghm54	Chadpur	chadpur-union	1796	2026-05-10 15:55:45.376	2026-05-10 16:52:50.874	t	চাঁদপুর	Chadpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrze00hww88ohz42c0hd	cmozwcx4w0087408otkmghm54	Panti	panti-union	1797	2026-05-10 15:55:45.386	2026-05-10 16:52:50.881	t	পান্টি	Panti	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrzo00hxw88o1uupo5es	cmozwcx4w0087408otkmghm54	Charsadipur	charsadipur-union	1798	2026-05-10 15:55:45.396	2026-05-10 16:52:50.887	t	চরসাদীপুর	Charsadipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrzy00hyw88o3ptlu1xm	cmozwcx4q0086408onw98pmcu	Khoksa	khoksa-union	1799	2026-05-10 15:55:45.406	2026-05-10 16:52:50.893	t	খোকসা	Khoksa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs0700hzw88o41awc1gr	cmozwcx4q0086408onw98pmcu	Osmanpur	osmanpur-union	1800	2026-05-10 15:55:45.415	2026-05-10 16:52:50.9	t	ওসমানপুর	Osmanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs0i00i0w88o0u4yod2j	cmozwcx4q0086408onw98pmcu	Janipur	janipur-union	1801	2026-05-10 15:55:45.426	2026-05-10 16:52:50.906	t	জানিপুর	Janipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs0r00i1w88om8juculy	cmozwcx4q0086408onw98pmcu	Shimulia	shimulia-union	1802	2026-05-10 15:55:45.435	2026-05-10 16:52:50.912	t	শিমুলিয়া	Shimulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs1200i2w88otnmhrk9l	cmozwcx4q0086408onw98pmcu	Joyntihazra	joyntihazra-union	1803	2026-05-10 15:55:45.446	2026-05-10 16:52:50.918	t	জয়ন্তীহাজরা	Joyntihazra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs1d00i3w88odt7h2j3l	cmozwcx4q0086408onw98pmcu	Ambaria	ambaria-union	1804	2026-05-10 15:55:45.457	2026-05-10 16:52:50.924	t	আমবাড়ীয়া	Ambaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs1m00i4w88oqiaq6tk8	cmozwcx4q0086408onw98pmcu	Bethbaria	bethbaria-union	1805	2026-05-10 15:55:45.466	2026-05-10 16:52:50.93	t	বেতবাড়ীয়া	Bethbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs1x00i5w88omzy4i7kz	cmozwcx4q0086408onw98pmcu	Shomospur	shomospur-union	1806	2026-05-10 15:55:45.477	2026-05-10 16:52:50.936	t	শোমসপুর	Shomospur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs2700i6w88oneteq6rj	cmozwcx4q0086408onw98pmcu	Gopgram	gopgram-union	1807	2026-05-10 15:55:45.487	2026-05-10 16:52:50.942	t	গোপগ্রাম	Gopgram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs2g00i7w88o63smas80	cmozwcx5c0089408oxmmj21o9	Chithalia	chithalia-union	1808	2026-05-10 15:55:45.496	2026-05-10 16:52:50.948	t	চিথলিয়া	Chithalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrs500h6w88oo5js45zd	cmozwcwzi007g408o9wieeikm	Shimanto	shimanto-union	1771	2026-05-10 15:55:45.125	2026-05-10 16:52:50.717	t	সীমান্ত	Shimanto	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrsd00h7w88okj4102b3	cmozwcwzi007g408o9wieeikm	Raypur	raypur-union	1772	2026-05-10 15:55:45.133	2026-05-10 16:52:50.723	t	রায়পুর	Raypur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs3m00ibw88omf83jgcs	cmozwcx5c0089408oxmmj21o9	Fulbaria	fulbaria-union	1812	2026-05-10 15:55:45.538	2026-05-10 16:52:50.973	t	ফুলবাড়ীয়া	Fulbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs3v00icw88ods0rwrtv	cmozwcx5c0089408oxmmj21o9	Amla	amla-union	1813	2026-05-10 15:55:45.547	2026-05-10 16:52:50.979	t	আমলা	Amla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs4600idw88oxywm5zso	cmozwcx5c0089408oxmmj21o9	Sadarpur	sadarpur-union	1814	2026-05-10 15:55:45.558	2026-05-10 16:52:50.985	t	সদরপুর	Sadarpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs4g00iew88o8ze1k198	cmozwcx5c0089408oxmmj21o9	Chhatian	chhatian-union	1815	2026-05-10 15:55:45.568	2026-05-10 16:52:50.991	t	ছাতিয়ান	Chhatian	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs4q00ifw88ob2kwwt62	cmozwcx5c0089408oxmmj21o9	Poradaha	poradaha-union	1816	2026-05-10 15:55:45.578	2026-05-10 16:52:51	t	পোড়াদহ	Poradaha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs5100igw88oykp21av7	cmozwcx5c0089408oxmmj21o9	Kursha	kursha-union	1817	2026-05-10 15:55:45.589	2026-05-10 16:52:51.007	t	কুর্শা	Kursha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs5b00ihw88ocjmf4oty	cmozwcx5c0089408oxmmj21o9	Ambaria	ambaria-union-1	1818	2026-05-10 15:55:45.599	2026-05-10 16:52:51.014	t	আমবাড়ীয়া	Ambaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs5m00iiw88owpc1jx2f	cmozwcx5c0089408oxmmj21o9	Dhubail	dhubail-union	1819	2026-05-10 15:55:45.61	2026-05-10 16:52:51.023	t	ধূবইল	Dhubail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs5w00ijw88o9drt0zoo	cmozwcx5c0089408oxmmj21o9	Malihad	malihad-union	1820	2026-05-10 15:55:45.62	2026-05-10 16:52:51.032	t	মালিহাদ	Malihad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs6h00ilw88oyixwz9xe	cmozwcx4j0085408octg40c7w	Adabaria	adabaria-union	1822	2026-05-10 15:55:45.641	2026-05-10 16:52:51.05	t	ড়ীয়া	Adabaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs6q00imw88oefsekj47	cmozwcx4j0085408octg40c7w	Hogolbaria	hogolbaria-union	1823	2026-05-10 15:55:45.65	2026-05-10 16:52:51.06	t	হোগলবাড়ীয়া	Hogolbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs7100inw88ot2ycsx3d	cmozwcx4j0085408octg40c7w	Boalia	boalia-union-1	1824	2026-05-10 15:55:45.661	2026-05-10 16:52:51.069	t	বোয়ালি	Boalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs7c00iow88o0mw1m3wq	cmozwcx4j0085408octg40c7w	Philipnagor	philipnagor-union	1825	2026-05-10 15:55:45.672	2026-05-10 16:52:51.077	t	ফিলিপনগর	Philipnagor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs7m00ipw88ox0oem7fa	cmozwcx4j0085408octg40c7w	Aria	aria-union-1	1826	2026-05-10 15:55:45.682	2026-05-10 16:52:51.085	t	আড়িয়া	Aria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs7x00iqw88og2x6h7g4	cmozwcx4j0085408octg40c7w	Khalishakundi	khalishakundi-union	1827	2026-05-10 15:55:45.693	2026-05-10 16:52:51.094	t	খলিশাকুন্ডি	Khalishakundi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs8600irw88o51ecub0n	cmozwcx4j0085408octg40c7w	Chilmary	chilmary-union	1828	2026-05-10 15:55:45.702	2026-05-10 16:52:51.102	t	চিলমারী	Chilmary	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs8h00isw88owvfp2slz	cmozwcx4j0085408octg40c7w	Mothurapur	mothurapur-union-1	1829	2026-05-10 15:55:45.713	2026-05-10 16:52:51.11	t	মথুরাপুর	Mothurapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs8s00itw88o6zjafdfx	cmozwcx4j0085408octg40c7w	Pragpur	pragpur-union	1830	2026-05-10 15:55:45.724	2026-05-10 16:52:51.118	t	প্রাগপুর	Pragpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs9100iuw88ozqao7msf	cmozwcx4j0085408octg40c7w	Piarpur	piarpur-union	1831	2026-05-10 15:55:45.733	2026-05-10 16:52:51.128	t	পিয়ারপুর	Piarpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs9c00ivw88olgbaq545	cmozwcx4j0085408octg40c7w	Moricha	moricha-union	1832	2026-05-10 15:55:45.744	2026-05-10 16:52:51.136	t	মরিচা	Moricha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs9n00iww88oh6fiok8l	cmozwcx4j0085408octg40c7w	Refaitpur	refaitpur-union	1833	2026-05-10 15:55:45.755	2026-05-10 16:52:51.144	t	রিফাইতপুর	Refaitpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs9w00ixw88o9yl3jsx0	cmozwcx4j0085408octg40c7w	Ramkrishnopur	ramkrishnopur-union	1834	2026-05-10 15:55:45.764	2026-05-10 16:52:51.152	t	রামকৃষ্ণপুর	Ramkrishnopur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsa800iyw88o9vz029la	cmozwcx4c0084408ojzknlt9l	Dharampur	dharampur-union	1835	2026-05-10 15:55:45.776	2026-05-10 16:52:51.16	t	ধরমপুর	Dharampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsah00izw88ocgd3mzdo	cmozwcx4c0084408ojzknlt9l	Bahirchar	bahirchar-union	1836	2026-05-10 15:55:45.785	2026-05-10 16:52:51.168	t	বাহিরচর	Bahirchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsas00j0w88oe9seikwq	cmozwcx4c0084408ojzknlt9l	Mukarimpur	mukarimpur-union	1837	2026-05-10 15:55:45.796	2026-05-10 16:52:51.175	t	মোকারিমপুর	Mukarimpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsb300j1w88o2imtfu9d	cmozwcx4c0084408ojzknlt9l	Juniadah	juniadah-union	1838	2026-05-10 15:55:45.807	2026-05-10 16:52:51.183	t	জুনিয়াদহ	Juniadah	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsbc00j2w88o35498wxd	cmozwcx4c0084408ojzknlt9l	Chandgram	chandgram-union	1839	2026-05-10 15:55:45.816	2026-05-10 16:52:51.19	t	চাঁদগ্রাম	Chandgram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsbp00j3w88o4hpn4zs3	cmozwcx4c0084408ojzknlt9l	Bahadurpur	bahadurpur-union-2	1840	2026-05-10 15:55:45.829	2026-05-10 16:52:51.199	t	বাহাদুরপুর	Bahadurpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsbz00j4w88oqw2a9ox5	cmozwcx5x008c408omwtmxgud	Dhaneshwargati	dhaneshwargati-union	1841	2026-05-10 15:55:45.839	2026-05-10 16:52:51.207	t	ধনেশ্বরগাতী	Dhaneshwargati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsc900j5w88otee5j8r4	cmozwcx5x008c408omwtmxgud	Talkhari	talkhari-union	1842	2026-05-10 15:55:45.849	2026-05-10 16:52:51.217	t	তালখড়ি	Talkhari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfscj00j6w88okrj9wf2g	cmozwcx5x008c408omwtmxgud	Arpara	arpara-union	1843	2026-05-10 15:55:45.859	2026-05-10 16:52:51.227	t	আড়পাড়া	Arpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsct00j7w88oyidvc6r2	cmozwcx5x008c408omwtmxgud	Shatakhali	shatakhali-union	1844	2026-05-10 15:55:45.869	2026-05-10 16:52:51.236	t	শতখালী	Shatakhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsd300j8w88oyw5gg06h	cmozwcx5x008c408omwtmxgud	Shalikha	shalikha-union	1845	2026-05-10 15:55:45.879	2026-05-10 16:52:51.242	t	শালিখা	Shalikha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsde00j9w88o2uxyw38e	cmozwcx5x008c408omwtmxgud	Bunagati	bunagati-union	1846	2026-05-10 15:55:45.891	2026-05-10 16:52:51.25	t	বুনাগাতী	Bunagati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsdn00jaw88o74o6l163	cmozwcx5x008c408omwtmxgud	Gongarampur	gongarampur-union	1847	2026-05-10 15:55:45.899	2026-05-10 16:52:51.256	t	গঙ্গারামপুর	Gongarampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs3100i9w88oq89t66th	cmozwcx5c0089408oxmmj21o9	Talbaria	talbaria-union	1810	2026-05-10 15:55:45.517	2026-05-10 16:52:50.96	t	তালবাড়ীয়া	Talbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs3c00iaw88owhrzffzk	cmozwcx5c0089408oxmmj21o9	Baruipara	baruipara-union	1811	2026-05-10 15:55:45.528	2026-05-10 16:52:50.967	t	বারুইপাড়া	Baruipara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfseu00jew88o1kfzgevm	cmozwcx65008d408ob8uarr42	Kadirpara	kadirpara-union	1851	2026-05-10 15:55:45.942	2026-05-10 16:52:51.286	t	কাদিরপাড়া	Kadirpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsf300jfw88ox0gpmy36	cmozwcx65008d408ob8uarr42	Shobdalpur	shobdalpur-union	1852	2026-05-10 15:55:45.951	2026-05-10 16:52:51.293	t	সব্দালপুর	Shobdalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsff00jgw88ol2nyy2i2	cmozwcx65008d408ob8uarr42	Sreepur	sreepur-union-1	1853	2026-05-10 15:55:45.963	2026-05-10 16:52:51.301	t	শ্রীপুর	Sreepur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsfr00jhw88o53lzv6bk	cmozwcx65008d408ob8uarr42	Nakol	nakol-union	1854	2026-05-10 15:55:45.975	2026-05-10 16:52:51.308	t	নাকোল	Nakol	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsg000jiw88oub67ezod	cmozwcx65008d408ob8uarr42	Amalshar	amalshar-union	1855	2026-05-10 15:55:45.984	2026-05-10 16:52:51.315	t	আমলসার	Amalshar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsgb00jjw88omignyf6q	cmozwcx5j008a408o5ylku40j	Hazipur	hazipur-union	1856	2026-05-10 15:55:45.995	2026-05-10 16:52:51.322	t	হাজীপুর	Hazipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsgl00jkw88oip8aixeq	cmozwcx5j008a408o5ylku40j	Atharokhada	atharokhada-union	1857	2026-05-10 15:55:46.005	2026-05-10 16:52:51.33	t	আঠারখাদা	Atharokhada	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsgu00jlw88oy0t6ru2n	cmozwcx5j008a408o5ylku40j	Kosundi	kosundi-union	1858	2026-05-10 15:55:46.014	2026-05-10 16:52:51.337	t	কছুন্দী	Kosundi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsh500jmw88obw568har	cmozwcx5j008a408o5ylku40j	Bogia	bogia-union	1859	2026-05-10 15:55:46.025	2026-05-10 16:52:51.343	t	বগিয়া	Bogia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfshf00jnw88oqalyb1pv	cmozwcx5j008a408o5ylku40j	Hazrapur	hazrapur-union	1860	2026-05-10 15:55:46.035	2026-05-10 16:52:51.35	t	হাজরাপুর	Hazrapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfshq00jow88owqau4hdt	cmozwcx5j008a408o5ylku40j	Raghobdair	raghobdair-union	1861	2026-05-10 15:55:46.046	2026-05-10 16:52:51.356	t	রাঘবদাইড়	Raghobdair	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsi000jpw88ob8i3lxxm	cmozwcx5j008a408o5ylku40j	Jagdal	jagdal-union	1862	2026-05-10 15:55:46.056	2026-05-10 16:52:51.362	t	জগদল	Jagdal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsi900jqw88owowmazrn	cmozwcx5j008a408o5ylku40j	Chawlia	chawlia-union	1863	2026-05-10 15:55:46.065	2026-05-10 16:52:51.369	t	চাউলিয়া	Chawlia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsik00jrw88ogwc9h9mt	cmozwcx5j008a408o5ylku40j	Satrijitpur	satrijitpur-union	1864	2026-05-10 15:55:46.076	2026-05-10 16:52:51.375	t	শত্রুজিৎপুর	Satrijitpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsit00jsw88op5f5u4x5	cmozwcx5j008a408o5ylku40j	Baroilpolita	baroilpolita-union	1865	2026-05-10 15:55:46.085	2026-05-10 16:52:51.382	t	বেরইল পলিতা	Baroilpolita	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsj300jtw88oslkn93vx	cmozwcx5j008a408o5ylku40j	Kuchiamora	kuchiamora-union	1866	2026-05-10 15:55:46.095	2026-05-10 16:52:51.388	t	কুচিয়ামো	Kuchiamora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsje00juw88oj9hrn8mk	cmozwcx5j008a408o5ylku40j	Gopalgram	gopalgram-union	1867	2026-05-10 15:55:46.106	2026-05-10 16:52:51.395	t	গোপালগ্রাম	Gopalgram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsjn00jvw88owxd4v64h	cmozwcx5j008a408o5ylku40j	Moghi	moghi-union	1868	2026-05-10 15:55:46.115	2026-05-10 16:52:51.402	t	মঘী	Moghi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsjx00jww88ovauhcvgp	cmozwcx5q008b408ow83o3cpt	Digha	digha-union	1869	2026-05-10 15:55:46.125	2026-05-10 16:52:51.408	t	দীঘা	Digha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsk600jxw88op0zplq8f	cmozwcx5q008b408ow83o3cpt	Nohata	nohata-union	1870	2026-05-10 15:55:46.134	2026-05-10 16:52:51.414	t	নহাটা	Nohata	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfskh00jyw88os91tr7eu	cmozwcx5q008b408ow83o3cpt	Palashbaria	palashbaria-union	1871	2026-05-10 15:55:46.145	2026-05-10 16:52:51.42	t	পলাশবাড়ীয়া	Palashbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsks00jzw88oum8arz7h	cmozwcx5q008b408ow83o3cpt	Babukhali	babukhali-union	1872	2026-05-10 15:55:46.156	2026-05-10 16:52:51.427	t	বাবুখালী	Babukhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsl100k0w88ovlsqoal4	cmozwcx5q008b408ow83o3cpt	Balidia	balidia-union	1873	2026-05-10 15:55:46.165	2026-05-10 16:52:51.433	t	বালিদিয়া	Balidia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfslb00k1w88oakotqupl	cmozwcx5q008b408ow83o3cpt	Binodpur	binodpur-union	1874	2026-05-10 15:55:46.175	2026-05-10 16:52:51.44	t	বিনোদপুর	Binodpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfslw00k3w88o8kn0a5j9	cmozwcx5q008b408ow83o3cpt	Rajapur	rajapur-union-1	1876	2026-05-10 15:55:46.196	2026-05-10 16:52:51.453	t	রাজাপুর	Rajapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsm600k4w88oge6xqodb	cmozwcx450083408o1wb41wgp	Terokhada	terokhada-union	1902	2026-05-10 15:55:46.206	2026-05-10 16:52:51.459	t	তেরখাদা	Terokhada	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsmf00k5w88oy0usu3at	cmozwcx450083408o1wb41wgp	Chagladoho	chagladoho-union	1903	2026-05-10 15:55:46.215	2026-05-10 16:52:51.466	t	ছাগলাদহ	Chagladoho	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsmq00k6w88okv4jgtgg	cmozwcx450083408o1wb41wgp	Barasat	barasat-union	1904	2026-05-10 15:55:46.226	2026-05-10 16:52:51.473	t	বারাসাত	Barasat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsn000k7w88ol3srrmot	cmozwcx450083408o1wb41wgp	Sochiadaho	sochiadaho-union	1905	2026-05-10 15:55:46.236	2026-05-10 16:52:51.479	t	সাচিয়াদাহ	Sochiadaho	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsna00k8w88oykvsnq0c	cmozwcx450083408o1wb41wgp	Modhupur	modhupur-union	1906	2026-05-10 15:55:46.246	2026-05-10 16:52:51.486	t	মধুপুর	Modhupur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsnl00k9w88ot3dted7t	cmozwcx450083408o1wb41wgp	Ajgora	ajgora-union	1907	2026-05-10 15:55:46.257	2026-05-10 16:52:51.492	t	আজগড়া	Ajgora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsnu00kaw88ohr690224	cmozwcx3a007y408oubu2mrlk	Dumuria	dumuria-union	1908	2026-05-10 15:55:46.266	2026-05-10 16:52:51.498	t	ডুমুরিয়া	Dumuria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfso400kbw88odljhk2f3	cmozwcx3a007y408oubu2mrlk	Magurghona	magurghona-union	1909	2026-05-10 15:55:46.276	2026-05-10 16:52:51.505	t	মাগুরাঘোনা	Magurghona	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsoe00kcw88o7por23y7	cmozwcx3a007y408oubu2mrlk	Vandarpara	vandarpara-union	1910	2026-05-10 15:55:46.286	2026-05-10 16:52:51.512	t	ভান্ডারপাড়া	Vandarpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsoo00kdw88oavmc24mg	cmozwcx3a007y408oubu2mrlk	Sahos	sahos-union	1911	2026-05-10 15:55:46.296	2026-05-10 16:52:51.519	t	সাহস	Sahos	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfse800jcw88ofgip7mko	cmozwcx65008d408ob8uarr42	Sreekol	sreekol-union	1849	2026-05-10 15:55:45.92	2026-05-10 16:52:51.271	t	শ্রীকোল	Sreekol	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsej00jdw88ok96lk9zq	cmozwcx65008d408ob8uarr42	Dariapur	dariapur-union-1	1850	2026-05-10 15:55:45.931	2026-05-10 16:52:51.279	t	দ্বারিয়াপুর	Dariapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfspu00khw88og6pm0hml	cmozwcx3a007y408oubu2mrlk	Khornia	khornia-union	1915	2026-05-10 15:55:46.338	2026-05-10 16:52:51.544	t	খর্ণিয়া	Khornia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsq300kiw88ojfuk1317	cmozwcx3a007y408oubu2mrlk	Atlia	atlia-union	1916	2026-05-10 15:55:46.347	2026-05-10 16:52:51.551	t	আটলিয়া	Atlia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsqf00kjw88ofz5r4qq2	cmozwcx3a007y408oubu2mrlk	Dhamalia	dhamalia-union	1917	2026-05-10 15:55:46.359	2026-05-10 16:52:51.558	t	ধামালিয়া	Dhamalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsqo00kkw88o9680f4mf	cmozwcx3a007y408oubu2mrlk	Raghunathpur	raghunathpur-union	1918	2026-05-10 15:55:46.368	2026-05-10 16:52:51.564	t	রঘুনাথপুর	Raghunathpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsqy00klw88ocbdcqxq7	cmozwcx3a007y408oubu2mrlk	Rongpur	rongpur-union	1919	2026-05-10 15:55:46.378	2026-05-10 16:52:51.571	t	রংপুর	Rongpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsra00kmw88of6ivqmp7	cmozwcx3a007y408oubu2mrlk	Shorafpur	shorafpur-union	1920	2026-05-10 15:55:46.39	2026-05-10 16:52:51.577	t	শরাফপুর	Shorafpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsrj00knw88oh6308vlv	cmozwcx3a007y408oubu2mrlk	Magurkhali	magurkhali-union	1921	2026-05-10 15:55:46.399	2026-05-10 16:52:51.584	t	মাগুরখালি	Magurkhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsru00kow88ozftofz3x	cmozwcx3h007z408ouiolmz1w	Koyra	koyra-union	1938	2026-05-10 15:55:46.41	2026-05-10 16:52:51.591	t	কয়রা	Koyra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfss400kpw88oamt1pp8l	cmozwcx3h007z408ouiolmz1w	Moharajpur	moharajpur-union	1939	2026-05-10 15:55:46.42	2026-05-10 16:52:51.597	t	মহারাজপুর	Moharajpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfssp00krw88oc4291bua	cmozwcx3h007z408ouiolmz1w	North Bedkashi	north-bedkashi-union	1941	2026-05-10 15:55:46.441	2026-05-10 16:52:51.61	t	উত্তর বেদকাশী	North Bedkashi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfssy00ksw88oyiexydqq	cmozwcx3h007z408ouiolmz1w	South Bedkashi	south-bedkashi-union	1942	2026-05-10 15:55:46.45	2026-05-10 16:52:51.617	t	দক্ষিণ বেদকাশী	South Bedkashi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfst800ktw88opqii930s	cmozwcx3h007z408ouiolmz1w	Amadi	amadi-union	1943	2026-05-10 15:55:46.46	2026-05-10 16:52:51.625	t	আমাদি	Amadi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsti00kuw88o3wkb4nfk	cmozwcx3h007z408ouiolmz1w	Bagali	bagali-union	1944	2026-05-10 15:55:46.47	2026-05-10 16:52:51.631	t	বাগালী	Bagali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsts00kvw88o0dgeu97g	cmozwcwxl0076408o889cro0b	Betaga	betaga-union	1945	2026-05-10 15:55:46.48	2026-05-10 16:52:51.638	t	বেতাগা	Betaga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsu300kww88o3cwyoq4c	cmozwcwxl0076408o889cro0b	Lakhpur	lakhpur-union	1946	2026-05-10 15:55:46.491	2026-05-10 16:52:51.644	t	লখপুর	Lakhpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsuc00kxw88ofvjmzdld	cmozwcwxl0076408o889cro0b	Fakirhat	fakirhat-union	1947	2026-05-10 15:55:46.5	2026-05-10 16:52:51.651	t	ফকিরহাট	Fakirhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsun00kyw88o5c49rgtx	cmozwcwxl0076408o889cro0b	Bahirdia-Mansa	bahirdia-mansa-union	1948	2026-05-10 15:55:46.511	2026-05-10 16:52:51.657	t	বাহিরদিয়া-মানসা	Bahirdia-Mansa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsux00kzw88ohjy1pll1	cmozwcwxl0076408o889cro0b	Piljanga	piljanga-union	1949	2026-05-10 15:55:46.521	2026-05-10 16:52:51.663	t	পিলজংগ	Piljanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsv600l0w88ow13a9bvj	cmozwcwxl0076408o889cro0b	Naldha-Mouvhog	naldha-mouvhog-union	1950	2026-05-10 15:55:46.531	2026-05-10 16:52:51.67	t	নলধা-মৌভোগ	Naldha-Mouvhog	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsvh00l1w88ourlibolj	cmozwcwxl0076408o889cro0b	Mulghar	mulghar-union	1951	2026-05-10 15:55:46.541	2026-05-10 16:52:51.676	t	মূলঘর	Mulghar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsvp00l2w88ow7vaacyf	cmozwcwxl0076408o889cro0b	Suvhadia	suvhadia-union	1952	2026-05-10 15:55:46.549	2026-05-10 16:52:51.683	t	শুভদিয়া	Suvhadia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsw000l3w88oa6cilfv3	cmozwcwx50074408omx9nat8j	Karapara	karapara-union	1953	2026-05-10 15:55:46.56	2026-05-10 16:52:51.689	t	কাড়াপাড়া	Karapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsw900l4w88oy8aqiv8l	cmozwcwx50074408omx9nat8j	Bamorta	bamorta-union	1954	2026-05-10 15:55:46.569	2026-05-10 16:52:51.696	t	বেমরতা	Bamorta	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfswi00l5w88o6y5cfp46	cmozwcwx50074408omx9nat8j	Gotapara	gotapara-union	1955	2026-05-10 15:55:46.578	2026-05-10 16:52:51.702	t	গোটাপাড়া	Gotapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsws00l6w88o312v2xxh	cmozwcwx50074408omx9nat8j	Bishnapur	bishnapur-union	1956	2026-05-10 15:55:46.588	2026-05-10 16:52:51.709	t	বিষ্ণুপুর	Bishnapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsx200l7w88o42bu63j1	cmozwcwx50074408omx9nat8j	Baruipara	baruipara-union-1	1957	2026-05-10 15:55:46.598	2026-05-10 16:52:51.716	t	বারুইপাড়া	Baruipara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsxc00l8w88okdpdyvxp	cmozwcwx50074408omx9nat8j	Jatharapur	jatharapur-union	1958	2026-05-10 15:55:46.608	2026-05-10 16:52:51.722	t	যাত্রাপুর	Jatharapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsxl00l9w88ob7ak2tc5	cmozwcwx50074408omx9nat8j	Shaitgomboj	shaitgomboj-union	1959	2026-05-10 15:55:46.617	2026-05-10 16:52:51.728	t	ষাটগুম্বজ	Shaitgomboj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsxx00law88o0nof0smr	cmozwcwx50074408omx9nat8j	Khanpur	khanpur-union-2	1960	2026-05-10 15:55:46.629	2026-05-10 16:52:51.734	t	খানপুর	Khanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsy700lbw88o8ziluaua	cmozwcwx50074408omx9nat8j	Rakhalgachi	rakhalgachi-union	1961	2026-05-10 15:55:46.639	2026-05-10 16:52:51.741	t	রাখালগাছি	Rakhalgachi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsyg00lcw88o31gmzkb7	cmozwcwx50074408omx9nat8j	Dema	dema-union	1962	2026-05-10 15:55:46.648	2026-05-10 16:52:51.747	t	ডেমা	Dema	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsyr00ldw88o2wovstp8	cmozwcwy00078408ooorl1n5e	Udoypur	udoypur-union	1963	2026-05-10 15:55:46.659	2026-05-10 16:52:51.754	t	উদয়পুর	Udoypur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsz000lew88o502ngfut	cmozwcwy00078408ooorl1n5e	Chunkhola	chunkhola-union	1964	2026-05-10 15:55:46.668	2026-05-10 16:52:51.76	t	চুনখোলা	Chunkhola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfszb00lfw88orpnc4wzp	cmozwcwy00078408ooorl1n5e	Gangni	gangni-union-1	1965	2026-05-10 15:55:46.679	2026-05-10 16:52:51.767	t	গাংনী	Gangni	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfszn00lgw88ofvbvfr8u	cmozwcwy00078408ooorl1n5e	Kulia	kulia-union-1	1966	2026-05-10 15:55:46.691	2026-05-10 16:52:51.776	t	কুলিয়া	Kulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsp900kfw88o50ys47mn	cmozwcx3a007y408oubu2mrlk	Ghutudia	ghutudia-union	1913	2026-05-10 15:55:46.317	2026-05-10 16:52:51.531	t	গুটুদিয়া	Ghutudia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfspj00kgw88od8cmxyfm	cmozwcx3a007y408oubu2mrlk	Shovna	shovna-union	1914	2026-05-10 15:55:46.327	2026-05-10 16:52:51.538	t	শোভনা	Shovna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft0p00lkw88omcnnhd4s	cmozwcwyj007b408oaoabpqif	Gouramva	gouramva-union	1974	2026-05-10 15:55:46.729	2026-05-10 16:52:51.804	t	গৌরম্ভা	Gouramva	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft1000llw88o1du3vamj	cmozwcwyj007b408oaoabpqif	Uzzalkur	uzzalkur-union	1975	2026-05-10 15:55:46.74	2026-05-10 16:52:51.812	t	উজলকুড়	Uzzalkur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft1800lmw88o8wx5xph6	cmozwcwyj007b408oaoabpqif	Baintala	baintala-union	1976	2026-05-10 15:55:46.748	2026-05-10 16:52:51.819	t	বাইনতলা	Baintala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft1j00lnw88o56u2q5oh	cmozwcwyj007b408oaoabpqif	Rampal	rampal-union	1977	2026-05-10 15:55:46.759	2026-05-10 16:52:51.825	t	রামপাল	Rampal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft1s00low88owirwxpij	cmozwcwyj007b408oaoabpqif	Rajnagar	rajnagar-union	1978	2026-05-10 15:55:46.768	2026-05-10 16:52:51.832	t	রাজনগর	Rajnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft2200lpw88ot54bwsss	cmozwcwyj007b408oaoabpqif	Hurka	hurka-union	1979	2026-05-10 15:55:46.778	2026-05-10 16:52:51.84	t	হুড়কা	Hurka	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft2l00lrw88oi8onngyy	cmozwcwyj007b408oaoabpqif	Vospatia	vospatia-union	1981	2026-05-10 15:55:46.797	2026-05-10 16:52:51.856	t	ভোজপাতিয়া	Vospatia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft2v00lsw88oag2yczsy	cmozwcwyj007b408oaoabpqif	Mollikerbar	mollikerbar-union	1982	2026-05-10 15:55:46.807	2026-05-10 16:52:51.863	t	মল্লিকেরবেড়	Mollikerbar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft3400ltw88ow6wk1193	cmozwcwyj007b408oaoabpqif	Bastoli	bastoli-union	1983	2026-05-10 15:55:46.816	2026-05-10 16:52:51.87	t	বাঁশতলী	Bastoli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft3f00luw88oynxedkmw	cmozwcwxt0077408oif6la2gd	Gojalia	gojalia-union	2000	2026-05-10 15:55:46.827	2026-05-10 16:52:51.876	t	গজালিয়া	Gojalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft3o00lvw88oyc2fzqlg	cmozwcwxt0077408oif6la2gd	Dhopakhali	dhopakhali-union	2001	2026-05-10 15:55:46.836	2026-05-10 16:52:51.882	t	ধোপাখালী	Dhopakhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft3y00lww88ovbpatodr	cmozwcwxt0077408oif6la2gd	Moghia	moghia-union	2002	2026-05-10 15:55:46.846	2026-05-10 16:52:51.888	t	মঘিয়া	Moghia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft4800lxw88owh3wkld3	cmozwcwxt0077408oif6la2gd	Kachua	kachua-union	2003	2026-05-10 15:55:46.856	2026-05-10 16:52:51.894	t	কচুয়া	Kachua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft4h00lyw88ohnavlqzb	cmozwcwxt0077408oif6la2gd	Gopalpur	gopalpur-union-1	2004	2026-05-10 15:55:46.865	2026-05-10 16:52:51.9	t	গোপালপুর	Gopalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft4s00lzw88o75aohld9	cmozwcwxt0077408oif6la2gd	Raripara	raripara-union	2005	2026-05-10 15:55:46.876	2026-05-10 16:52:51.906	t	রাড়ীপাড়া	Raripara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft5200m0w88ocaa3ra8m	cmozwcwxt0077408oif6la2gd	Badhal	badhal-union	2006	2026-05-10 15:55:46.886	2026-05-10 16:52:51.913	t	বাধাল	Badhal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft5c00m1w88o4tipv0b7	cmozwcwy60079408onuzco7xt	Burrirdangga	burrirdangga-union	2007	2026-05-10 15:55:46.896	2026-05-10 16:52:51.919	t	বুড়িরডাঙ্গা	Burrirdangga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft5n00m2w88o9ap633h0	cmozwcwy60079408onuzco7xt	Mithakhali	mithakhali-union	2008	2026-05-10 15:55:46.907	2026-05-10 16:52:51.925	t	মিঠাখালী	Mithakhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft5v00m3w88og5d90h4u	cmozwcwy60079408onuzco7xt	Sonailtala	sonailtala-union	2009	2026-05-10 15:55:46.915	2026-05-10 16:52:51.931	t	সোনাইলতলা	Sonailtala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft6600m4w88ov3yh110p	cmozwcwy60079408onuzco7xt	Chadpai	chadpai-union	2010	2026-05-10 15:55:46.926	2026-05-10 16:52:51.937	t	চাঁদপাই	Chadpai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft6e00m5w88osupn8gwt	cmozwcwy60079408onuzco7xt	Chila	chila-union	2011	2026-05-10 15:55:46.934	2026-05-10 16:52:51.944	t	চিলা	Chila	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft6o00m6w88ohw5xv2xm	cmozwcwy60079408onuzco7xt	Sundarban	sundarban-union	2012	2026-05-10 15:55:46.944	2026-05-10 16:52:51.95	t	সুন্দরবন	Sundarban	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft6x00m7w88ogi6y3zqp	cmozwcwxe0075408o6db22h6d	Barobaria	barobaria-union	2013	2026-05-10 15:55:46.953	2026-05-10 16:52:51.956	t	বড়বাড়িয়া	Barobaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft7700m8w88o1hnfaplo	cmozwcwxe0075408o6db22h6d	Kalatala	kalatala-union	2014	2026-05-10 15:55:46.963	2026-05-10 16:52:51.963	t	কলাতলা	Kalatala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft7h00m9w88oxphxrrug	cmozwcwxe0075408o6db22h6d	Hizla	hizla-union	2015	2026-05-10 15:55:46.973	2026-05-10 16:52:51.969	t	হিজলা	Hizla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft7q00maw88oauewdek0	cmozwcwxe0075408o6db22h6d	Shibpur	shibpur-union-1	2016	2026-05-10 15:55:46.982	2026-05-10 16:52:51.976	t	শিবপুর	Shibpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft8200mbw88ozloedc52	cmozwcwxe0075408o6db22h6d	Chitalmari	chitalmari-union	2017	2026-05-10 15:55:46.994	2026-05-10 16:52:51.983	t	চিতলমারী	Chitalmari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft8b00mcw88ohwz7cjci	cmozwcwxe0075408o6db22h6d	Charbaniri	charbaniri-union	2018	2026-05-10 15:55:47.003	2026-05-10 16:52:51.989	t	চরবানিয়ারী	Charbaniri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft8l00mdw88ott9xrhn7	cmozwcwxe0075408o6db22h6d	Shantoshpur	shantoshpur-union	2019	2026-05-10 15:55:47.013	2026-05-10 16:52:51.996	t	সন্তোষপুর	Shantoshpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft8v00mew88op9ikllc8	cmozwcx1p007q408odnkojaod	Sadhuhati	sadhuhati-union	2020	2026-05-10 15:55:47.023	2026-05-10 16:52:52.002	t	সাধুহাটী	Sadhuhati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft9400mfw88o2l9kq1lv	cmozwcx1p007q408odnkojaod	Modhuhati	modhuhati-union	2021	2026-05-10 15:55:47.032	2026-05-10 16:52:52.009	t	মধুহাটী	Modhuhati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft9f00mgw88okn7zgvz0	cmozwcx1p007q408odnkojaod	Saganna	saganna-union	2022	2026-05-10 15:55:47.043	2026-05-10 16:52:52.018	t	সাগান্না	Saganna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft9n00mhw88oi2ifpaye	cmozwcx1p007q408odnkojaod	Halidhani	halidhani-union	2023	2026-05-10 15:55:47.051	2026-05-10 16:52:52.027	t	হলিধানী	Halidhani	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft9y00miw88omfobzvor	cmozwcx1p007q408odnkojaod	Kumrabaria	kumrabaria-union	2024	2026-05-10 15:55:47.062	2026-05-10 16:52:52.036	t	কুমড়াবাড়ীয়া	Kumrabaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfta800mjw88oimwtkn1n	cmozwcx1p007q408odnkojaod	Ganna	ganna-union	2025	2026-05-10 15:55:47.072	2026-05-10 16:52:52.043	t	গান্না	Ganna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft0600liw88oaxyb1axi	cmozwcwy00078408ooorl1n5e	Kodalia	kodalia-union	1968	2026-05-10 15:55:46.71	2026-05-10 16:52:51.792	t	কোদালিয়া	Kodalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft0g00ljw88ol6jsxd7c	cmozwcwy00078408ooorl1n5e	Atjuri	atjuri-union	1969	2026-05-10 15:55:46.72	2026-05-10 16:52:51.798	t	আটজুড়ী	Atjuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftba00mnw88ojsdtf1s4	cmozwcx1p007q408odnkojaod	Harishongkorpur	harishongkorpur-union	2029	2026-05-10 15:55:47.11	2026-05-10 16:52:52.074	t	হরিশংকরপুর	Harishongkorpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftbk00mow88ow334sq9z	cmozwcx1p007q408odnkojaod	Padmakar	padmakar-union	2030	2026-05-10 15:55:47.12	2026-05-10 16:52:52.082	t	পদ্মাকর	Padmakar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftbt00mpw88o0037jmlh	cmozwcx1p007q408odnkojaod	Dogachhi	dogachhi-union	2031	2026-05-10 15:55:47.129	2026-05-10 16:52:52.09	t	দোগাছি	Dogachhi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftc400mqw88oz9uwosjd	cmozwcx1p007q408odnkojaod	Furshondi	furshondi-union	2032	2026-05-10 15:55:47.14	2026-05-10 16:52:52.099	t	ফুরসন্দি	Furshondi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftce00mrw88ofk0hhljg	cmozwcx1p007q408odnkojaod	Ghorshal	ghorshal-union	2033	2026-05-10 15:55:47.15	2026-05-10 16:52:52.107	t	ঘোড়শাল	Ghorshal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftco00msw88o5s0gv4sa	cmozwcx1p007q408odnkojaod	Kalicharanpur	kalicharanpur-union	2034	2026-05-10 15:55:47.16	2026-05-10 16:52:52.116	t	কালীচরণপুর	Kalicharanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftcy00mtw88oymuqduho	cmozwcx1p007q408odnkojaod	Surat	surat-union	2035	2026-05-10 15:55:47.17	2026-05-10 16:52:52.125	t	সুরাট	Surat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftd800muw88osv97ghgy	cmozwcx1p007q408odnkojaod	Naldanga	naldanga-union	2036	2026-05-10 15:55:47.18	2026-05-10 16:52:52.134	t	নলডাঙ্গা	Naldanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftdj00mvw88o5w6rtydt	cmozwcx2k007u408ou4o48wbm	Tribeni	tribeni-union	2037	2026-05-10 15:55:47.191	2026-05-10 16:52:52.141	t	ত্রিবেনী	Tribeni	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftdt00mww88olye413fo	cmozwcx2k007u408ou4o48wbm	Mirzapur	mirzapur-union-1	2038	2026-05-10 15:55:47.201	2026-05-10 16:52:52.148	t	মির্জাপুর	Mirzapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfte400mxw88o7h09xf2k	cmozwcx2k007u408ou4o48wbm	Dignagore	dignagore-union	2039	2026-05-10 15:55:47.212	2026-05-10 16:52:52.155	t	দিগনগর	Dignagore	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftee00myw88ori1bfn78	cmozwcx2k007u408ou4o48wbm	Kancherkol	kancherkol-union	2040	2026-05-10 15:55:47.222	2026-05-10 16:52:52.164	t	কাঁচেরকোল	Kancherkol	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfteo00mzw88o3sggrlv3	cmozwcx2k007u408ou4o48wbm	Sarutia	sarutia-union	2041	2026-05-10 15:55:47.232	2026-05-10 16:52:52.172	t	সারুটিয়া	Sarutia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftey00n0w88of50nywry	cmozwcx2k007u408ou4o48wbm	Hakimpur	hakimpur-union	2042	2026-05-10 15:55:47.243	2026-05-10 16:52:52.179	t	হাকিমপুর	Hakimpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftf800n1w88oh03e5olh	cmozwcx2k007u408ou4o48wbm	Dhaloharachandra	dhaloharachandra-union	2043	2026-05-10 15:55:47.252	2026-05-10 16:52:52.187	t	ধলহরাচন্দ্র	Dhaloharachandra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftfj00n2w88o5x4ruch4	cmozwcx2k007u408ou4o48wbm	Manoharpur	manoharpur-union-1	2044	2026-05-10 15:55:47.263	2026-05-10 16:52:52.196	t	মনোহরপুর	Manoharpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftfu00n3w88oxbcp6qw3	cmozwcx2k007u408ou4o48wbm	Bogura	bogura-union	2045	2026-05-10 15:55:47.274	2026-05-10 16:52:52.204	t	বগুড়া	Bogura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftg300n4w88oygy24525	cmozwcx2k007u408ou4o48wbm	Abaipur	abaipur-union	2046	2026-05-10 15:55:47.283	2026-05-10 16:52:52.212	t	আবাইপুর	Abaipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftge00n5w88o7ye2o4i3	cmozwcx2k007u408ou4o48wbm	Nityanandapur	nityanandapur-union	2047	2026-05-10 15:55:47.294	2026-05-10 16:52:52.219	t	নিত্যানন্দপুর	Nityanandapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftgo00n6w88oaf71cb5v	cmozwcx2k007u408ou4o48wbm	Umedpur	umedpur-union	2048	2026-05-10 15:55:47.304	2026-05-10 16:52:52.229	t	উমেদপুর	Umedpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftgz00n7w88ole1ezzay	cmozwcx2k007u408ou4o48wbm	Dudshar	dudshar-union	2049	2026-05-10 15:55:47.315	2026-05-10 16:52:52.244	t	দুধসর	Dudshar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftha00n8w88opxk2xcod	cmozwcx2k007u408ou4o48wbm	Fulhari	fulhari-union	2050	2026-05-10 15:55:47.326	2026-05-10 16:52:52.252	t	ফুলহরি	Fulhari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfthj00n9w88ozxtsoemb	cmozwcx1i007p408ofpt2dfi0	Bhayna	bhayna-union	2051	2026-05-10 15:55:47.335	2026-05-10 16:52:52.259	t	ভায়না	Bhayna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftht00naw88otwtkuy5d	cmozwcx1i007p408ofpt2dfi0	Joradah	joradah-union	2052	2026-05-10 15:55:47.345	2026-05-10 16:52:52.268	t	জোড়াদহ	Joradah	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfti400nbw88ok3sotczh	cmozwcx1i007p408ofpt2dfi0	Taherhuda	taherhuda-union	2053	2026-05-10 15:55:47.356	2026-05-10 16:52:52.274	t	তাহেরহুদা	Taherhuda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftie00ncw88ofbn73ml6	cmozwcx1i007p408ofpt2dfi0	Daulatpur	daulatpur-union-1	2054	2026-05-10 15:55:47.366	2026-05-10 16:52:52.282	t	দৌলতপুর	Daulatpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftip00ndw88o6a4v8prz	cmozwcx1i007p408ofpt2dfi0	Kapashatia	kapashatia-union	2055	2026-05-10 15:55:47.377	2026-05-10 16:52:52.29	t	কাপাশহাটিয়া	Kapashatia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftj000new88oc7q4qjtd	cmozwcx1i007p408ofpt2dfi0	Falsi	falsi-union	2056	2026-05-10 15:55:47.388	2026-05-10 16:52:52.299	t	ফলসী	Falsi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftjb00nfw88op7cw0je1	cmozwcx1i007p408ofpt2dfi0	Raghunathpur	raghunathpur-union-1	2057	2026-05-10 15:55:47.399	2026-05-10 16:52:52.309	t	রঘুনাথপুর	Raghunathpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftjm00ngw88ofj81rdaq	cmozwcx1i007p408ofpt2dfi0	Chandpur	chandpur-union	2058	2026-05-10 15:55:47.41	2026-05-10 16:52:52.319	t	চাঁদপুর	Chandpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftk600niw88oj1rahhir	cmozwcx1z007r408oo64odo1n	Jamal	jamal-union	2060	2026-05-10 15:55:47.43	2026-05-10 16:52:52.336	t	জামাল	Jamal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftkg00njw88ohicdmfsy	cmozwcx1z007r408oo64odo1n	Kola	kola-union	2061	2026-05-10 15:55:47.44	2026-05-10 16:52:52.343	t	কোলা	Kola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftkr00nkw88oc7hf4oet	cmozwcx1z007r408oo64odo1n	Niamatpur	niamatpur-union-1	2062	2026-05-10 15:55:47.451	2026-05-10 16:52:52.351	t	নিয়ামতপুর	Niamatpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftl200nlw88oapzw12ux	cmozwcx1z007r408oo64odo1n	Simla-Rokonpur	simla-rokonpur-union	2063	2026-05-10 15:55:47.462	2026-05-10 16:52:52.357	t	শিমলা-রোকনপুর	Simla-Rokonpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftar00mlw88o0646d2r3	cmozwcx1p007q408odnkojaod	Paglakanai	paglakanai-union	2027	2026-05-10 15:55:47.091	2026-05-10 16:52:52.06	t	পাগলাকানাই	Paglakanai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftaz00mmw88oh1ckktsj	cmozwcx1p007q408odnkojaod	Porahati	porahati-union	2028	2026-05-10 15:55:47.1	2026-05-10 16:52:52.068	t	পোড়াহাটী	Porahati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftm500npw88o7xnj82oy	cmozwcx1z007r408oo64odo1n	Barabazar	barabazar-union	2067	2026-05-10 15:55:47.501	2026-05-10 16:52:52.385	t	বারবাজার	Barabazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftmg00nqw88o1z1ltlrz	cmozwcx1z007r408oo64odo1n	Kashtabhanga	kashtabhanga-union	2068	2026-05-10 15:55:47.512	2026-05-10 16:52:52.391	t	কাষ্টভাঙ্গা	Kashtabhanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftmq00nrw88o1d7c11f4	cmozwcx1z007r408oo64odo1n	Rakhalgachhi	rakhalgachhi-union	2069	2026-05-10 15:55:47.522	2026-05-10 16:52:52.397	t	রাখালগাছি	Rakhalgachhi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftn000nsw88o1cfk1x96	cmozwcx25007s408ovgcxbugi	Sabdalpur	sabdalpur-union	2070	2026-05-10 15:55:47.532	2026-05-10 16:52:52.403	t	সাবদালপুর	Sabdalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftnb00ntw88os838i2ga	cmozwcx25007s408ovgcxbugi	Dora	dora-union	2071	2026-05-10 15:55:47.543	2026-05-10 16:52:52.41	t	দোড়া	Dora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftnk00nuw88ocqilxefr	cmozwcx25007s408ovgcxbugi	Kushna	kushna-union	2072	2026-05-10 15:55:47.552	2026-05-10 16:52:52.417	t	কুশনা	Kushna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftnu00nvw88ob4qs1siu	cmozwcx25007s408ovgcxbugi	Baluhar	baluhar-union	2073	2026-05-10 15:55:47.562	2026-05-10 16:52:52.423	t	বলুহর	Baluhar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfto500nww88ob1y9h079	cmozwcx25007s408ovgcxbugi	Elangi	elangi-union	2074	2026-05-10 15:55:47.573	2026-05-10 16:52:52.43	t	এলাঙ্গী	Elangi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftof00nxw88oj4dz6h37	cmozwcxsf00bd408o8xnyovpk	Adabaria	adabaria-union-1	2119	2026-05-10 15:55:47.583	2026-05-10 16:52:52.436	t	আদাবারিয়া	Adabaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftoq00nyw88o1k1arjmd	cmozwcxsf00bd408o8xnyovpk	Bauphal	bauphal-union	2120	2026-05-10 15:55:47.594	2026-05-10 16:52:52.443	t	বাউফল	Bauphal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftp000nzw88ocgtpaoxs	cmozwcxsf00bd408o8xnyovpk	Daspara	daspara-union	2121	2026-05-10 15:55:47.604	2026-05-10 16:52:52.45	t	দাস পাড়া	Daspara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftpa00o0w88o8gx8t3cm	cmozwcxsf00bd408o8xnyovpk	Kalaiya	kalaiya-union	2122	2026-05-10 15:55:47.614	2026-05-10 16:52:52.456	t	কালাইয়া	Kalaiya	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftpl00o1w88oo0rqa0n4	cmozwcxsf00bd408o8xnyovpk	Nawmala	nawmala-union	2123	2026-05-10 15:55:47.625	2026-05-10 16:52:52.462	t	নওমালা	Nawmala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftpu00o2w88ol95ybhlm	cmozwcxsf00bd408o8xnyovpk	Najirpur	najirpur-union	2124	2026-05-10 15:55:47.634	2026-05-10 16:52:52.469	t	নাজিরপুর	Najirpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftq600o3w88ox7qxtjoe	cmozwcxsf00bd408o8xnyovpk	Madanpura	madanpura-union	2125	2026-05-10 15:55:47.646	2026-05-10 16:52:52.476	t	মদনপুরা	Madanpura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftqh00o4w88oeld5c61x	cmozwcxsf00bd408o8xnyovpk	Boga	boga-union	2126	2026-05-10 15:55:47.657	2026-05-10 16:52:52.483	t	বগা	Boga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftqq00o5w88owt1xv75e	cmozwcxsf00bd408o8xnyovpk	Kanakdia	kanakdia-union	2127	2026-05-10 15:55:47.666	2026-05-10 16:52:52.489	t	কনকদিয়া	Kanakdia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftrd00o7w88o35alojbl	cmozwcxsf00bd408o8xnyovpk	Keshabpur	keshabpur-union-1	2129	2026-05-10 15:55:47.689	2026-05-10 16:52:52.502	t	কেশবপুর	Keshabpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftrm00o8w88owxue1viz	cmozwcxsf00bd408o8xnyovpk	Dhulia	dhulia-union	2130	2026-05-10 15:55:47.698	2026-05-10 16:52:52.509	t	ধুলিয়া	Dhulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftrx00o9w88oswpky7e5	cmozwcxsf00bd408o8xnyovpk	Kalisuri	kalisuri-union	2131	2026-05-10 15:55:47.709	2026-05-10 16:52:52.515	t	কালিশুরী	Kalisuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfts700oaw88olltuihfp	cmozwcxsf00bd408o8xnyovpk	Kachipara	kachipara-union	2132	2026-05-10 15:55:47.719	2026-05-10 16:52:52.522	t	কাছিপাড়া	Kachipara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftsh00obw88o9qdkkwke	cmozwcxtl00bj408o13q3cqv7	Laukathi	laukathi-union	2133	2026-05-10 15:55:47.729	2026-05-10 16:52:52.529	t	লাউকাঠী	Laukathi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftsr00ocw88osvev4dzx	cmozwcxtl00bj408o13q3cqv7	Lohalia	lohalia-union	2134	2026-05-10 15:55:47.739	2026-05-10 16:52:52.535	t	লোহালিয়া	Lohalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftt000odw88o88cmmze7	cmozwcxtl00bj408o13q3cqv7	Kamalapur	kamalapur-union	2135	2026-05-10 15:55:47.748	2026-05-10 16:52:52.542	t	কমলাপুর	Kamalapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfttb00oew88ol5fbw8fx	cmozwcxtl00bj408o13q3cqv7	Jainkathi	jainkathi-union	2136	2026-05-10 15:55:47.759	2026-05-10 16:52:52.548	t	জৈনকাঠী	Jainkathi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfttr00ofw88o7ribf3lg	cmozwcxtl00bj408o13q3cqv7	Kalikapur	kalikapur-union-2	2137	2026-05-10 15:55:47.775	2026-05-10 16:52:52.555	t	কালিকাপুর	Kalikapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftu100ogw88o5am7atb1	cmozwcxtl00bj408o13q3cqv7	Badarpur	badarpur-union	2138	2026-05-10 15:55:47.785	2026-05-10 16:52:52.561	t	বদরপুর	Badarpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftub00ohw88oolmb0ax6	cmozwcxtl00bj408o13q3cqv7	Itbaria	itbaria-union	2139	2026-05-10 15:55:47.795	2026-05-10 16:52:52.568	t	ইটবাড়ীয়া	Itbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftum00oiw88ozgr4ygqu	cmozwcxtl00bj408o13q3cqv7	Marichbunia	marichbunia-union	2140	2026-05-10 15:55:47.806	2026-05-10 16:52:52.574	t	মরিচবুনিয়া	Marichbunia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftuv00ojw88o4ytxk3vf	cmozwcxtl00bj408o13q3cqv7	Auliapur	auliapur-union	2141	2026-05-10 15:55:47.815	2026-05-10 16:52:52.58	t	আউলিয়াপুর	Auliapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftv800okw88ogxbiaqao	cmozwcxtl00bj408o13q3cqv7	Chotobighai	chotobighai-union	2142	2026-05-10 15:55:47.828	2026-05-10 16:52:52.587	t	ছোট বিঘাই	Chotobighai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftvi00olw88ox1z5y4xw	cmozwcxtl00bj408o13q3cqv7	Borobighai	borobighai-union	2143	2026-05-10 15:55:47.838	2026-05-10 16:52:52.595	t	বড় বিঘাই	Borobighai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftvt00omw88ohg7k98xf	cmozwcxtl00bj408o13q3cqv7	Madarbunia	madarbunia-union	2144	2026-05-10 15:55:47.849	2026-05-10 16:52:52.603	t	মাদারবুনিয়া	Madarbunia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftw700onw88ow4i2ly2x	cmozwcxsu00bf408otpg10t2n	Pangasia	pangasia-union	2145	2026-05-10 15:55:47.863	2026-05-10 16:52:52.611	t	পাংগাশিয়া	Pangasia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftwh00oow88o7pz1nzb0	cmozwcxsu00bf408otpg10t2n	Muradia	muradia-union	2146	2026-05-10 15:55:47.874	2026-05-10 16:52:52.619	t	মুরাদিয়া	Muradia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftlm00nnw88ophjknngc	cmozwcx1z007r408oo64odo1n	Raygram	raygram-union	2065	2026-05-10 15:55:47.482	2026-05-10 16:52:52.371	t	রায়গ্রাম	Raygram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftlw00now88o15mbkrxq	cmozwcx1z007r408oo64odo1n	Maliat	maliat-union	2066	2026-05-10 15:55:47.492	2026-05-10 16:52:52.378	t	মালিয়াট	Maliat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftxk00osw88oqqye78ms	cmozwcxsm00be408o4rl6ghwa	Bashbaria	bashbaria-union	2150	2026-05-10 15:55:47.912	2026-05-10 16:52:52.654	t	বাঁশবাড়ীয়া	Bashbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftxu00otw88o4wn1g1a6	cmozwcxsm00be408o4rl6ghwa	Rangopaldi	rangopaldi-union	2151	2026-05-10 15:55:47.922	2026-05-10 16:52:52.663	t	রণগোপালদী	Rangopaldi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfty400ouw88o1a29b5a2	cmozwcxsm00be408o4rl6ghwa	Alipur	alipur-union-1	2152	2026-05-10 15:55:47.932	2026-05-10 16:52:52.672	t	আলীপুর	Alipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftyo00oww88oliebdj2e	cmozwcxsm00be408o4rl6ghwa	Dashmina	dashmina-union	2154	2026-05-10 15:55:47.952	2026-05-10 16:52:52.688	t	দশমিনা	Dashmina	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftyx00oxw88oqwmy7jl7	cmozwcxsm00be408o4rl6ghwa	Baharampur	baharampur-union	2155	2026-05-10 15:55:47.961	2026-05-10 16:52:52.696	t	বহরমপুর	Baharampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftz900oyw88o4t7abqw7	cmozwcxt700bh408ouiij1sjo	Chakamaia	chakamaia-union	2156	2026-05-10 15:55:47.973	2026-05-10 16:52:52.704	t	চাকামইয়া	Chakamaia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftzh00ozw88onrdxwud6	cmozwcxt700bh408ouiij1sjo	Tiakhali	tiakhali-union	2157	2026-05-10 15:55:47.981	2026-05-10 16:52:52.713	t	টিয়াখালী	Tiakhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftzs00p0w88ofrodp227	cmozwcxt700bh408ouiij1sjo	Lalua	lalua-union	2158	2026-05-10 15:55:47.992	2026-05-10 16:52:52.722	t	লালুয়া	Lalua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu0000p1w88o67onriqi	cmozwcxt700bh408ouiij1sjo	Dhankhali	dhankhali-union	2159	2026-05-10 15:55:48	2026-05-10 16:52:52.729	t	ধানখালী	Dhankhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu0b00p2w88ont09y98g	cmozwcxt700bh408ouiij1sjo	Mithagonj	mithagonj-union	2160	2026-05-10 15:55:48.011	2026-05-10 16:52:52.738	t	মিঠাগঞ্জ	Mithagonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu0k00p3w88o8hco8uh6	cmozwcxt700bh408ouiij1sjo	Nilgonj	nilgonj-union	2161	2026-05-10 15:55:48.02	2026-05-10 16:52:52.748	t	নীলগঞ্জ	Nilgonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu0t00p4w88ot0e0xqb0	cmozwcxt700bh408ouiij1sjo	Dulaser	dulaser-union	2162	2026-05-10 15:55:48.029	2026-05-10 16:52:52.757	t	ধুলাসার	Dulaser	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu1500p5w88op6izu0vk	cmozwcxt700bh408ouiij1sjo	Latachapli	latachapli-union	2163	2026-05-10 15:55:48.041	2026-05-10 16:52:52.765	t	লতাচাপলী	Latachapli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu1h00p6w88o4a4ifihw	cmozwcxt700bh408ouiij1sjo	Mahipur	mahipur-union	2164	2026-05-10 15:55:48.053	2026-05-10 16:52:52.774	t	মহিপুর	Mahipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu1t00p7w88ogr7b0zsn	cmozwcxt700bh408ouiij1sjo	Dalbugonj	dalbugonj-union	2165	2026-05-10 15:55:48.065	2026-05-10 16:52:52.782	t	ডালবুগঞ্জ	Dalbugonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu2700p8w88oqtxede4z	cmozwcxt700bh408ouiij1sjo	Baliatali	baliatali-union	2166	2026-05-10 15:55:48.079	2026-05-10 16:52:52.791	t	বালিয়াতলী	Baliatali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu2j00p9w88obkdg4765	cmozwcxt700bh408ouiij1sjo	Champapur	champapur-union	2167	2026-05-10 15:55:48.091	2026-05-10 16:52:52.798	t	চম্পাপুর	Champapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu2s00paw88onybnk3kn	cmozwcxtf00bi408ouk26dsm6	Madhabkhali	madhabkhali-union	2168	2026-05-10 15:55:48.1	2026-05-10 16:52:52.807	t	মাধবখালী	Madhabkhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu3400pbw88o4y94vzh2	cmozwcxtf00bi408ouk26dsm6	Mirzaganj	mirzaganj-union	2169	2026-05-10 15:55:48.112	2026-05-10 16:52:52.815	t	মির্জাগঞ্জ	Mirzaganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu3g00pcw88oy2k1kruc	cmozwcxtf00bi408ouk26dsm6	Amragachia	amragachia-union	2170	2026-05-10 15:55:48.124	2026-05-10 16:52:52.823	t	আমড়াগাছিয়া	Amragachia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu3o00pdw88orqh10fe6	cmozwcxtf00bi408ouk26dsm6	Deuli Subidkhali	deuli-subidkhali-union	2171	2026-05-10 15:55:48.132	2026-05-10 16:52:52.831	t	দেউলী সুবিদখালী	Deuli Subidkhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu3y00pew88odtch4d44	cmozwcxtf00bi408ouk26dsm6	Kakrabunia	kakrabunia-union	2172	2026-05-10 15:55:48.142	2026-05-10 16:52:52.84	t	কাকড়াবুনিয়া	Kakrabunia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu4500pfw88oyjngsc6l	cmozwcxtf00bi408ouk26dsm6	Majidbaria	majidbaria-union	2173	2026-05-10 15:55:48.149	2026-05-10 16:52:52.847	t	মজিদবাড়িয়া	Majidbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu4g00pgw88oq03drm9v	cmozwcxt100bg408o0r8e3yp9	Amkhola	amkhola-union	2174	2026-05-10 15:55:48.16	2026-05-10 16:52:52.855	t	আমখোলা	Amkhola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu4o00phw88obeamgnpj	cmozwcxt100bg408o0r8e3yp9	Golkhali	golkhali-union	2175	2026-05-10 15:55:48.168	2026-05-10 16:52:52.863	t	গোলখালী	Golkhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu4y00piw88o4jhol4ym	cmozwcxt100bg408o0r8e3yp9	Galachipa	galachipa-union	2176	2026-05-10 15:55:48.178	2026-05-10 16:52:52.871	t	গলাচিপা	Galachipa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu5700pjw88o8s6wjs24	cmozwcxt100bg408o0r8e3yp9	Panpatty	panpatty-union	2177	2026-05-10 15:55:48.187	2026-05-10 16:52:52.878	t	পানপট্টি	Panpatty	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu5i00pkw88o89kivxwf	cmozwcxt100bg408o0r8e3yp9	Ratandi Taltali	ratandi-taltali-union	2178	2026-05-10 15:55:48.198	2026-05-10 16:52:52.886	t	রতনদী তালতলী	Ratandi Taltali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu5s00plw88o2iw3wsfr	cmozwcxt100bg408o0r8e3yp9	Dakua	dakua-union	2179	2026-05-10 15:55:48.208	2026-05-10 16:52:52.894	t	ডাকুয়া	Dakua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu6100pmw88o6v9y39ph	cmozwcxt100bg408o0r8e3yp9	Chiknikandi	chiknikandi-union	2180	2026-05-10 15:55:48.217	2026-05-10 16:52:52.901	t	চিকনিকান্দী	Chiknikandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu6c00pnw88ozb4odm5n	cmozwcxt100bg408o0r8e3yp9	Gazalia	gazalia-union	2181	2026-05-10 15:55:48.228	2026-05-10 16:52:52.908	t	গজালিয়া	Gazalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu6m00pow88ojnfe4uoq	cmozwcxt100bg408o0r8e3yp9	Charkajol	charkajol-union	2182	2026-05-10 15:55:48.239	2026-05-10 16:52:52.916	t	চরকাজল	Charkajol	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu6w00ppw88o47w548iy	cmozwcxt100bg408o0r8e3yp9	Charbiswas	charbiswas-union	2183	2026-05-10 15:55:48.248	2026-05-10 16:52:52.924	t	চরবিশ্বাস	Charbiswas	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu7600pqw88ogukr595x	cmozwcxt100bg408o0r8e3yp9	Bakulbaria	bakulbaria-union	2184	2026-05-10 15:55:48.258	2026-05-10 16:52:52.931	t	বকুলবাড়ীয়া	Bakulbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftx100oqw88ocfnx8i6r	cmozwcxsu00bf408otpg10t2n	Angaria	angaria-union	2148	2026-05-10 15:55:47.893	2026-05-10 16:52:52.638	t	আংগারিয়া	Angaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftxa00orw88out9jursn	cmozwcxsu00bf408otpg10t2n	Sreerampur	sreerampur-union	2149	2026-05-10 15:55:47.902	2026-05-10 16:52:52.646	t	শ্রীরামপুর	Sreerampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu8900puw88o0gqj59rz	cmozwcxtu00bk408o2t614z1n	Chattobaisdia	chattobaisdia-union	2188	2026-05-10 15:55:48.297	2026-05-10 16:52:52.957	t	ছোটবাইশদিয়া	Chattobaisdia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu8j00pvw88o6wk6i77h	cmozwcxtu00bk408o2t614z1n	Charmontaz	charmontaz-union	2189	2026-05-10 15:55:48.307	2026-05-10 16:52:52.964	t	চরমোন্তাজ	Charmontaz	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu8r00pww88os73w9m9o	cmozwcxtu00bk408o2t614z1n	Chalitabunia	chalitabunia-union	2190	2026-05-10 15:55:48.315	2026-05-10 16:52:52.97	t	চালিতাবুনিয়া	Chalitabunia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu9200pxw88ouux8abdu	cmozwcxv900br408ojcmf7p30	Shikder Mallik	shikder-mallik-union	2191	2026-05-10 15:55:48.326	2026-05-10 16:52:52.976	t	শিকদার মল্লিক	Shikder Mallik	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu9a00pyw88o4rf0d808	cmozwcxv900br408ojcmf7p30	Kodomtala	kodomtala-union	2192	2026-05-10 15:55:48.334	2026-05-10 16:52:52.982	t	কদমতলা	Kodomtala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu9l00pzw88ovlde8h1u	cmozwcxv900br408ojcmf7p30	Durgapur	durgapur-union-1	2193	2026-05-10 15:55:48.345	2026-05-10 16:52:52.988	t	দূর্গাপুর	Durgapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu9u00q0w88o4lph5rop	cmozwcxv900br408ojcmf7p30	Kolakhali	kolakhali-union	2194	2026-05-10 15:55:48.354	2026-05-10 16:52:52.995	t	কলাখালী	Kolakhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfua300q1w88ombk2guw3	cmozwcxv900br408ojcmf7p30	Tona	tona-union	2195	2026-05-10 15:55:48.363	2026-05-10 16:52:53.001	t	টোনা	Tona	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuad00q2w88owz0zheal	cmozwcxv900br408ojcmf7p30	Shariktola	shariktola-union	2196	2026-05-10 15:55:48.373	2026-05-10 16:52:53.007	t	শরিকতলা	Shariktola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfual00q3w88o1uxmgqpe	cmozwcxv900br408ojcmf7p30	Shankorpasa	shankorpasa-union	2197	2026-05-10 15:55:48.381	2026-05-10 16:52:53.014	t	শংকরপাশা	Shankorpasa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuav00q4w88o6akdb35o	cmozwcxuu00bp408ooq4fkkek	Mativangga	mativangga-union	2198	2026-05-10 15:55:48.391	2026-05-10 16:52:53.02	t	মাটিভাংগা	Mativangga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfub300q5w88o3wpc0s77	cmozwcxuu00bp408ooq4fkkek	Malikhali	malikhali-union	2199	2026-05-10 15:55:48.399	2026-05-10 16:52:53.028	t	মালিখালী	Malikhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfube00q6w88oxb3d3ac3	cmozwcxuu00bp408ooq4fkkek	Daulbari Dobra	daulbari-dobra-union	2200	2026-05-10 15:55:48.41	2026-05-10 16:52:53.034	t	দেউলবাড়ী দোবড়া	Daulbari Dobra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfubm00q7w88ognggkmh8	cmozwcxuu00bp408ooq4fkkek	Dirgha	dirgha-union	2201	2026-05-10 15:55:48.418	2026-05-10 16:52:53.04	t	দীর্ঘা	Dirgha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfubw00q8w88oyg18yuhg	cmozwcxuu00bp408ooq4fkkek	Kolardoania	kolardoania-union	2202	2026-05-10 15:55:48.428	2026-05-10 16:52:53.047	t	কলারদোয়ানিয়া	Kolardoania	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuc500q9w88ol8ibg34g	cmozwcxuu00bp408ooq4fkkek	Sriramkathi	sriramkathi-union	2203	2026-05-10 15:55:48.437	2026-05-10 16:52:53.054	t	শ্রীরামকাঠী	Sriramkathi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuce00qaw88odx79fszk	cmozwcxuu00bp408ooq4fkkek	Shakhmatia	shakhmatia-union	2204	2026-05-10 15:55:48.446	2026-05-10 16:52:53.061	t	সেখমাটিয়া	Shakhmatia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfucw00qcw88o0pyc729w	cmozwcxuu00bp408ooq4fkkek	Shakharikathi	shakharikathi-union	2206	2026-05-10 15:55:48.464	2026-05-10 16:52:53.074	t	শাখারীকাঠী	Shakharikathi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfud700qdw88omes60cli	cmozwcxug00bn408o8lhe11ag	Sayna Rogunathpur	sayna-rogunathpur-union	2207	2026-05-10 15:55:48.475	2026-05-10 16:52:53.08	t	সয়না রঘুনাথপুর	Sayna Rogunathpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfudf00qew88osanrkbus	cmozwcxug00bn408o8lhe11ag	Amrazuri	amrazuri-union	2208	2026-05-10 15:55:48.483	2026-05-10 16:52:53.086	t	আমড়াজুড়ি	Amrazuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfudq00qfw88o71h4ulwk	cmozwcxug00bn408o8lhe11ag	Kawkhali Sadar	kawkhali-sadar-union	2209	2026-05-10 15:55:48.494	2026-05-10 16:52:53.092	t	কাউখালি সদর	Kawkhali Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfudy00qgw88oy3cvemci	cmozwcxug00bn408o8lhe11ag	Chirapara	chirapara-union	2210	2026-05-10 15:55:48.502	2026-05-10 16:52:53.098	t	চিরাপাড়া	Chirapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfue800qhw88ou5b55roj	cmozwcxug00bn408o8lhe11ag	Shialkhathi	shialkhathi-union	2211	2026-05-10 15:55:48.512	2026-05-10 16:52:53.106	t	শিয়ালকাঠী	Shialkhathi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuej00qiw88o7tsgjywb	cmozwcxu000bl408oy5sx5op3	Vitabaria	vitabaria-union	2215	2026-05-10 15:55:48.523	2026-05-10 16:52:53.114	t	ভিটাবাড়িয়া	Vitabaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuer00qjw88oo7t4095b	cmozwcxu000bl408oy5sx5op3	Nodmulla	nodmulla-union	2216	2026-05-10 15:55:48.531	2026-05-10 16:52:53.12	t	নদমূলা শিয়ালকাঠী	Nodmulla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuf300qkw88ox47z5v9j	cmozwcxu000bl408oy5sx5op3	Telikhali	telikhali-union	2217	2026-05-10 15:55:48.543	2026-05-10 16:52:53.127	t	তেলিখালী	Telikhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfufb00qlw88o1nfk3fu8	cmozwcxu000bl408oy5sx5op3	Ekree	ekree-union	2218	2026-05-10 15:55:48.551	2026-05-10 16:52:53.134	t	ইকড়ী	Ekree	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfufm00qmw88o1yzrqe67	cmozwcxu000bl408oy5sx5op3	Dhaoa	dhaoa-union	2219	2026-05-10 15:55:48.562	2026-05-10 16:52:53.14	t	ধাওয়া	Dhaoa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfufx00qnw88oq8j92omd	cmozwcxu000bl408oy5sx5op3	Vandaria Sadar	vandaria-sadar-union	2220	2026-05-10 15:55:48.573	2026-05-10 16:52:53.147	t	ভান্ডারিয়া সদর	Vandaria Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfug500qow88of614vgkc	cmozwcxu000bl408oy5sx5op3	Gouripur	gouripur-union	2221	2026-05-10 15:55:48.581	2026-05-10 16:52:53.153	t	গৌরীপুর	Gouripur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfugf00qpw88oodi7ic9k	cmozwcxuo00bo408oymr0g0bx	Tuskhali	tuskhali-union	2222	2026-05-10 15:55:48.591	2026-05-10 16:52:53.16	t	তুষখালী	Tuskhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfugn00qqw88omgq0mx1m	cmozwcxuo00bo408oymr0g0bx	Dhanisafa	dhanisafa-union	2223	2026-05-10 15:55:48.599	2026-05-10 16:52:53.167	t	ধানীসাফা	Dhanisafa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfugz00qrw88o3du278lk	cmozwcxuo00bo408oymr0g0bx	Mirukhali	mirukhali-union	2224	2026-05-10 15:55:48.611	2026-05-10 16:52:53.173	t	মিরুখালী	Mirukhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu7q00psw88ortrtpk3m	cmozwcxtu00bk408o2t614z1n	Rangabali	rangabali-union	2186	2026-05-10 15:55:48.278	2026-05-10 16:52:52.943	t	রাঙ্গাবালী	Rangabali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu8000ptw88ouca795hi	cmozwcxtu00bk408o2t614z1n	Barobaisdia	barobaisdia-union	2187	2026-05-10 15:55:48.288	2026-05-10 16:52:52.95	t	বড়বাইশদিয়া	Barobaisdia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfui100qvw88ok4xw6wgx	cmozwcxuo00bo408oymr0g0bx	Shapleza	shapleza-union	2228	2026-05-10 15:55:48.649	2026-05-10 16:52:53.2	t	শাপলেজা	Shapleza	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuib00qww88oaycb2gj9	cmozwcxuo00bo408oymr0g0bx	Daudkhali	daudkhali-union	2229	2026-05-10 15:55:48.659	2026-05-10 16:52:53.206	t	দাউদখালী	Daudkhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuij00qxw88oo9tbcky7	cmozwcxuo00bo408oymr0g0bx	Mathbaria	mathbaria-union	2230	2026-05-10 15:55:48.667	2026-05-10 16:52:53.214	t	মঠবাড়িয়া	Mathbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuiu00qyw88om9jjtw3e	cmozwcxuo00bo408oymr0g0bx	Baramasua	baramasua-union	2231	2026-05-10 15:55:48.678	2026-05-10 16:52:53.221	t	বড়মাছুয়া	Baramasua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfujc00r0w88oo1phm65z	cmozwcxq100b2408o6e336ubm	Razapur	razapur-union	2328	2026-05-10 15:55:48.696	2026-05-10 16:52:53.234	t	রাজাপুর	Razapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfujm00r1w88oz00fpuiw	cmozwcxq100b2408o6e336ubm	Ilisha	ilisha-union	2329	2026-05-10 15:55:48.706	2026-05-10 16:52:53.24	t	ইলিশা	Ilisha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfujv00r2w88ocnsfuoi9	cmozwcxq100b2408o6e336ubm	Westilisa	westilisa-union	2330	2026-05-10 15:55:48.715	2026-05-10 16:52:53.247	t	পশ্চিম ইলিশা	Westilisa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuk600r3w88o0ci1gpqi	cmozwcxq100b2408o6e336ubm	Kachia	kachia-union	2331	2026-05-10 15:55:48.726	2026-05-10 16:52:53.253	t	কাচিয়া	Kachia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuke00r4w88omw7bbp1d	cmozwcxq100b2408o6e336ubm	Bapta	bapta-union	2332	2026-05-10 15:55:48.734	2026-05-10 16:52:53.259	t	বাপ্তা	Bapta	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuko00r5w88o2p7vtpkh	cmozwcxq100b2408o6e336ubm	Dhania	dhania-union	2333	2026-05-10 15:55:48.744	2026-05-10 16:52:53.265	t	ধনিয়া	Dhania	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyful000r6w88o5ggydhlx	cmozwcxq100b2408o6e336ubm	Shibpur	shibpur-union-2	2334	2026-05-10 15:55:48.756	2026-05-10 16:52:53.272	t	শিবপুর	Shibpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyful800r7w88opu8q60fz	cmozwcxq100b2408o6e336ubm	Alinagor	alinagor-union	2335	2026-05-10 15:55:48.764	2026-05-10 16:52:53.278	t	আলীনগর	Alinagor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfulj00r8w88o6vq0nonl	cmozwcxq100b2408o6e336ubm	Charshamya	charshamya-union	2336	2026-05-10 15:55:48.775	2026-05-10 16:52:53.284	t	চরসামাইয়া	Charshamya	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfulr00r9w88omli28g1z	cmozwcxq100b2408o6e336ubm	Vhelumia	vhelumia-union	2337	2026-05-10 15:55:48.783	2026-05-10 16:52:53.291	t	ভেলুমিয়া	Vhelumia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfum100raw88osi37ix5e	cmozwcxq100b2408o6e336ubm	Vheduria	vheduria-union	2338	2026-05-10 15:55:48.793	2026-05-10 16:52:53.297	t	ভেদুরিয়া	Vheduria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuma00rbw88o0hykmgrr	cmozwcxq100b2408o6e336ubm	North Digholdi	north-digholdi-union	2339	2026-05-10 15:55:48.802	2026-05-10 16:52:53.303	t	উত্তর দিঘলদী	North Digholdi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfumk00rcw88o4qxwr4yd	cmozwcxq100b2408o6e336ubm	South Digholdi	south-digholdi-union	2340	2026-05-10 15:55:48.812	2026-05-10 16:52:53.31	t	দক্ষিণ দিঘলদী	South Digholdi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfumu00rdw88o81vwgmh0	cmozwcxr300b7408oagxg7ogh	Hazirhat	hazirhat-union	2375	2026-05-10 15:55:48.822	2026-05-10 16:52:53.316	t	হাজীর হাট	Hazirhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfun300rew88o00olcqmg	cmozwcxr300b7408oagxg7ogh	Monpura	monpura-union	2376	2026-05-10 15:55:48.831	2026-05-10 16:52:53.322	t	মনপুরা	Monpura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfund00rfw88oet5qxff5	cmozwcxr300b7408oagxg7ogh	North Sakuchia	north-sakuchia-union	2377	2026-05-10 15:55:48.841	2026-05-10 16:52:53.329	t	উত্তর সাকুচিয়া	North Sakuchia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfunl00rgw88oh5wp76kj	cmozwcxr300b7408oagxg7ogh	South Sakuchia	south-sakuchia-union	2378	2026-05-10 15:55:48.849	2026-05-10 16:52:53.336	t	দক্ষিন সাকুচিয়া	South Sakuchia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfunv00rhw88osxmpagta	cmozwcxr900b8408o6nkiifty	Chanchra	chanchra-union	2379	2026-05-10 15:55:48.859	2026-05-10 16:52:53.342	t	চাচঁড়া	Chanchra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuob00riw88okgop4n9u	cmozwcxr900b8408o6nkiifty	Shambupur	shambupur-union	2380	2026-05-10 15:55:48.875	2026-05-10 16:52:53.349	t	শম্ভুপুর	Shambupur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuok00rjw88o275xn9m5	cmozwcxr900b8408o6nkiifty	Sonapur	sonapur-union	2381	2026-05-10 15:55:48.884	2026-05-10 16:52:53.355	t	সোনাপুর	Sonapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuov00rkw88oh1m5fw5y	cmozwcxr900b8408o6nkiifty	Chadpur	chadpur-union-1	2382	2026-05-10 15:55:48.895	2026-05-10 16:52:53.361	t	চাঁদপুর	Chadpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfup500rlw88of25wymyb	cmozwcxr900b8408o6nkiifty	Baro Molongchora	baro-molongchora-union	2383	2026-05-10 15:55:48.905	2026-05-10 16:52:53.368	t	বড় মলংচড়া	Baro Molongchora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfupf00rmw88o5f2vbphp	cmozwcxqu00b6408oko63iffp	Badarpur	badarpur-union-1	2384	2026-05-10 15:55:48.915	2026-05-10 16:52:53.374	t	বদরপুর	Badarpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfupq00rnw88os1sjagrf	cmozwcxqu00b6408oko63iffp	Charbhuta	charbhuta-union	2385	2026-05-10 15:55:48.926	2026-05-10 16:52:53.38	t	চরভূতা	Charbhuta	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuq000row88o9innddqw	cmozwcxqu00b6408oko63iffp	Kalma	kalma-union-1	2386	2026-05-10 15:55:48.936	2026-05-10 16:52:53.387	t	কালমা	Kalma	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuq900rpw88oi7lbaja1	cmozwcxqu00b6408oko63iffp	Dholigour Nagar	dholigour-nagar-union	2387	2026-05-10 15:55:48.945	2026-05-10 16:52:53.393	t	ধলীগৌর নগর	Dholigour Nagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuqj00rqw88o4s9vyfq2	cmozwcxqu00b6408oko63iffp	Lalmohan	lalmohan-union	2388	2026-05-10 15:55:48.955	2026-05-10 16:52:53.399	t	লালমোহন	Lalmohan	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuqr00rrw88ohy0yuxro	cmozwcxqu00b6408oko63iffp	Lord Hardinge	lord-hardinge-union	2389	2026-05-10 15:55:48.963	2026-05-10 16:52:53.406	t	লর্ড হার্ডিঞ্জ	Lord Hardinge	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfur200rsw88ony08hq5i	cmozwcxqu00b6408oko63iffp	Ramagonj	ramagonj-union	2390	2026-05-10 15:55:48.974	2026-05-10 16:52:53.412	t	রমাগঞ্জ	Ramagonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv1q00svw88op8tg8nnd	cmozwcykt00ff408oz13ijdd8	Tazpur	tazpur-union	2436	2026-05-10 15:55:49.358	2026-05-10 16:52:53.687	t	তাজপুর	Tazpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuhh00qtw88ogv9px0bq	cmozwcxuo00bo408oymr0g0bx	Betmor Rajpara	betmor-rajpara-union	2226	2026-05-10 15:55:48.629	2026-05-10 16:52:53.186	t	বেতমোর রাজপাড়া	Betmor Rajpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuhs00quw88ojs5jnsfc	cmozwcxuo00bo408oymr0g0bx	Amragachia	amragachia-union-1	2227	2026-05-10 15:55:48.64	2026-05-10 16:52:53.193	t	আমড়াগাছিয়া	Amragachia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfusb00rxw88ogpozdog9	cmozwcxmp00am408o5dlqrv95	Athrogasia	athrogasia-union	2395	2026-05-10 15:55:49.019	2026-05-10 16:52:53.443	t	আঠারগাছিয়া	Athrogasia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfusl00ryw88o5u0e2eyo	cmozwcxmp00am408o5dlqrv95	Kukua	kukua-union	2396	2026-05-10 15:55:49.029	2026-05-10 16:52:53.449	t	কুকুয়া	Kukua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfusw00rzw88oj8l8gw4b	cmozwcxmp00am408o5dlqrv95	Haldia	haldia-union	2397	2026-05-10 15:55:49.04	2026-05-10 16:52:53.457	t	হলদিয়া	Haldia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfut400s0w88o5fkgjvpe	cmozwcxmp00am408o5dlqrv95	Chotobogi	chotobogi-union	2398	2026-05-10 15:55:49.048	2026-05-10 16:52:53.464	t	ছোটবগী	Chotobogi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfutj00s1w88ozw1tbnv4	cmozwcxmp00am408o5dlqrv95	Arpangasia	arpangasia-union	2399	2026-05-10 15:55:49.063	2026-05-10 16:52:53.47	t	আড়পাঙ্গাশিয়া	Arpangasia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfutz00s2w88ocpd4xbix	cmozwcxmp00am408o5dlqrv95	Chowra	chowra-union	2400	2026-05-10 15:55:49.079	2026-05-10 16:52:53.477	t	চাওড়া	Chowra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuu900s3w88ozx0vvyef	cmozwcxn600ao408ohvjcna4y	M. Baliatali	m-baliatali-union	2401	2026-05-10 15:55:49.089	2026-05-10 16:52:53.483	t	এম. বালিয়াতলী	M. Baliatali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuui00s4w88oc7w9fqzo	cmozwcxn600ao408ohvjcna4y	Noltona	noltona-union	2402	2026-05-10 15:55:49.098	2026-05-10 16:52:53.49	t	নলটোনা	Noltona	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuus00s5w88ogh0xr9gv	cmozwcxn600ao408ohvjcna4y	Bodorkhali	bodorkhali-union	2403	2026-05-10 15:55:49.108	2026-05-10 16:52:53.498	t	বদরখালী	Bodorkhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuv000s6w88oyh08vj3n	cmozwcxn600ao408ohvjcna4y	Gowrichanna	gowrichanna-union	2404	2026-05-10 15:55:49.116	2026-05-10 16:52:53.505	t	গৌরিচন্না	Gowrichanna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuva00s7w88o2oldotbi	cmozwcxn600ao408ohvjcna4y	Fuljhuri	fuljhuri-union	2405	2026-05-10 15:55:49.126	2026-05-10 16:52:53.511	t	ফুলঝুড়ি	Fuljhuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuvj00s8w88om8c4sc39	cmozwcxn600ao408ohvjcna4y	Keorabunia	keorabunia-union	2406	2026-05-10 15:55:49.135	2026-05-10 16:52:53.518	t	কেওড়াবুনিয়া	Keorabunia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuvt00s9w88oxf5ldoy6	cmozwcxn600ao408ohvjcna4y	Ayla Patakata	ayla-patakata-union	2407	2026-05-10 15:55:49.145	2026-05-10 16:52:53.524	t	আয়লা পাতাকাটা	Ayla Patakata	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuw400saw88oijcijbnb	cmozwcxn600ao408ohvjcna4y	Burirchor	burirchor-union	2408	2026-05-10 15:55:49.156	2026-05-10 16:52:53.531	t	বুড়িরচর	Burirchor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuwd00sbw88on5q0j75e	cmozwcxn600ao408ohvjcna4y	Dhalua	dhalua-union	2409	2026-05-10 15:55:49.165	2026-05-10 16:52:53.537	t	ঢলুয়া	Dhalua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuwo00scw88obgw02jhw	cmozwcxn600ao408ohvjcna4y	Barguna	barguna-union	2410	2026-05-10 15:55:49.176	2026-05-10 16:52:53.543	t	বরগুনা	Barguna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuww00sdw88oi4yv5h3x	cmozwcxnf00ap408oovrfw9ux	Bibichini	bibichini-union	2411	2026-05-10 15:55:49.184	2026-05-10 16:52:53.55	t	বিবিচিন	Bibichini	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfux600sew88ownv6tnu4	cmozwcxnf00ap408oovrfw9ux	Betagi	betagi-union	2412	2026-05-10 15:55:49.194	2026-05-10 16:52:53.557	t	বেতাগী	Betagi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuxg00sfw88oty2xetan	cmozwcxnf00ap408oovrfw9ux	Hosnabad	hosnabad-union	2413	2026-05-10 15:55:49.204	2026-05-10 16:52:53.564	t	হোসনাবাদ	Hosnabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuxq00sgw88osrtrbwh5	cmozwcxnf00ap408oovrfw9ux	Mokamia	mokamia-union	2414	2026-05-10 15:55:49.214	2026-05-10 16:52:53.571	t	মোকামিয়া	Mokamia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuy000shw88oocjqwnuo	cmozwcxnf00ap408oovrfw9ux	Buramajumder	buramajumder-union	2415	2026-05-10 15:55:49.224	2026-05-10 16:52:53.577	t	বুড়ামজুমদার	Buramajumder	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuy800siw88opr4haymm	cmozwcxnf00ap408oovrfw9ux	Kazirabad	kazirabad-union	2416	2026-05-10 15:55:49.232	2026-05-10 16:52:53.584	t	কাজীরাবাদ	Kazirabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuyj00sjw88or746iqv9	cmozwcxnf00ap408oovrfw9ux	Sarisamuri	sarisamuri-union	2417	2026-05-10 15:55:49.243	2026-05-10 16:52:53.59	t	সরিষামুড়ী	Sarisamuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuyr00skw88o2sp3hniw	cmozwcxmz00an408of3otchn5	Bukabunia	bukabunia-union	2418	2026-05-10 15:55:49.251	2026-05-10 16:52:53.598	t	বুকাবুনিয়া	Bukabunia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuz100slw88ovdea8hgb	cmozwcxmz00an408of3otchn5	Bamna	bamna-union	2419	2026-05-10 15:55:49.261	2026-05-10 16:52:53.604	t	বামনা	Bamna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuzb00smw88ooy1o2c0i	cmozwcxmz00an408of3otchn5	Ramna	ramna-union	2420	2026-05-10 15:55:49.271	2026-05-10 16:52:53.611	t	রামনা	Ramna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuzl00snw88or4h4fxmu	cmozwcxmz00an408of3otchn5	Doutola	doutola-union	2421	2026-05-10 15:55:49.281	2026-05-10 16:52:53.618	t	ডৌয়াতলা	Doutola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuzv00sow88otb220ib8	cmozwcxnt00ar408oca0qnugr	Karibaria	karibaria-union	2429	2026-05-10 15:55:49.291	2026-05-10 16:52:53.628	t	কড়ইবাড়ীয়া	Karibaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv0400spw88owtgvrjua	cmozwcxnt00ar408oca0qnugr	Panchakoralia	panchakoralia-union	2430	2026-05-10 15:55:49.3	2026-05-10 16:52:53.637	t	পচাকোড়ালিয়া	Panchakoralia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv0e00sqw88od1wkvwo8	cmozwcxnt00ar408oca0qnugr	Barabagi	barabagi-union	2431	2026-05-10 15:55:49.31	2026-05-10 16:52:53.645	t	বড়বগি	Barabagi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv0n00srw88oda5x45ce	cmozwcxnt00ar408oca0qnugr	Chhotabagi	chhotabagi-union	2432	2026-05-10 15:55:49.319	2026-05-10 16:52:53.655	t	ছোটবগি	Chhotabagi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv0x00ssw88oniewarre	cmozwcxnt00ar408oca0qnugr	Nishanbaria	nishanbaria-union	2433	2026-05-10 15:55:49.329	2026-05-10 16:52:53.662	t	নিশানবাড়ীয়া	Nishanbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv1700stw88ohtyr3st3	cmozwcxnt00ar408oca0qnugr	Sarikkhali	sarikkhali-union	2434	2026-05-10 15:55:49.339	2026-05-10 16:52:53.671	t	শারিকখালি	Sarikkhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv1g00suw88ovxz8ler9	cmozwcxnt00ar408oca0qnugr	Sonakata	sonakata-union	2435	2026-05-10 15:55:49.348	2026-05-10 16:52:53.678	t	সোনাকাটা	Sonakata	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfurk00ruw88obzs13964	cmozwcxqu00b6408oko63iffp	Farajgonj	farajgonj-union	2392	2026-05-10 15:55:48.992	2026-05-10 16:52:53.424	t	ফরাজগঞ্জ	Farajgonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfurt00rvw88of2rnvf9x	cmozwcxmp00am408o5dlqrv95	Amtali	amtali-union	2393	2026-05-10 15:55:49.001	2026-05-10 16:52:53.431	t	আমতলী	Amtali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv2t00szw88o1vge1df0	cmozwcyj200f5408o06qc3l84	Boaljur	boaljur-union	2440	2026-05-10 15:55:49.397	2026-05-10 16:52:53.722	t	বোয়ালজুর	Boaljur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv3400t0w88oo68w4qkl	cmozwcykt00ff408oz13ijdd8	Burungabazar	burungabazar-union	2441	2026-05-10 15:55:49.408	2026-05-10 16:52:53.73	t	বুরুঙ্গাবাজার	Burungabazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv3c00t1w88ouz16ggug	cmozwcykt00ff408oz13ijdd8	Goalabazar	goalabazar-union	2442	2026-05-10 15:55:49.416	2026-05-10 16:52:53.739	t	গোয়ালাবাজার	Goalabazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv3n00t2w88ozfwvaxww	cmozwcykt00ff408oz13ijdd8	Doyamir	doyamir-union	2443	2026-05-10 15:55:49.427	2026-05-10 16:52:53.747	t	দয়ামীর	Doyamir	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv3x00t3w88ojlb90g1w	cmozwcykt00ff408oz13ijdd8	Usmanpur	usmanpur-union	2444	2026-05-10 15:55:49.437	2026-05-10 16:52:53.756	t	উসমানপুর	Usmanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv4600t4w88o5c0j1dwv	cmozwcyj200f5408o06qc3l84	Dewanbazar	dewanbazar-union	2445	2026-05-10 15:55:49.446	2026-05-10 16:52:53.764	t	দেওয়ান বাজার	Dewanbazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv4q00t6w88oofomctlj	cmozwcyj200f5408o06qc3l84	East Gouripur	east-gouripur-union	2447	2026-05-10 15:55:49.466	2026-05-10 16:52:53.78	t	পূর্ব গৌরীপুর	East Gouripur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv5000t7w88obujw53ah	cmozwcyj200f5408o06qc3l84	Balaganj	balaganj-union	2448	2026-05-10 15:55:49.476	2026-05-10 16:52:53.79	t	বালাগঞ্জ	Balaganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv5900t8w88oml5oevow	cmozwcykt00ff408oz13ijdd8	Sadipur	sadipur-union	2449	2026-05-10 15:55:49.485	2026-05-10 16:52:53.798	t	সাদিরপুর	Sadipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv5j00t9w88on4obs8sv	cmozwcyj900f6408oatdv2o0z	Tilpara	tilpara-union	2450	2026-05-10 15:55:49.495	2026-05-10 16:52:53.807	t	তিলপাড়া	Tilpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv5t00taw88o5cto0bpo	cmozwcyj900f6408oatdv2o0z	Alinagar	alinagar-union	2451	2026-05-10 15:55:49.505	2026-05-10 16:52:53.816	t	আলীনগর	Alinagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv6200tbw88omenke1am	cmozwcyj900f6408oatdv2o0z	Charkhai	charkhai-union	2452	2026-05-10 15:55:49.514	2026-05-10 16:52:53.826	t	চরখাই	Charkhai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv6d00tcw88orcek1g8z	cmozwcyj900f6408oatdv2o0z	Dubag	dubag-union	2453	2026-05-10 15:55:49.525	2026-05-10 16:52:53.835	t	দুবাগ	Dubag	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv6l00tdw88ok8dndm6j	cmozwcyj900f6408oatdv2o0z	Sheola	sheola-union	2454	2026-05-10 15:55:49.533	2026-05-10 16:52:53.843	t	শেওলা	Sheola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv6w00tew88onrxaqfoy	cmozwcyj900f6408oatdv2o0z	Kurarbazar	kurarbazar-union	2455	2026-05-10 15:55:49.544	2026-05-10 16:52:53.851	t	কুড়ারবাজার	Kurarbazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv7500tfw88o8b5gt2df	cmozwcyj900f6408oatdv2o0z	Mathiura	mathiura-union	2456	2026-05-10 15:55:49.553	2026-05-10 16:52:53.858	t	মাথিউরা	Mathiura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv7f00tgw88okilh7dg1	cmozwcyj900f6408oatdv2o0z	Mullapur	mullapur-union	2457	2026-05-10 15:55:49.563	2026-05-10 16:52:53.865	t	মোল্লাপুর	Mullapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv7q00thw88oag89wpis	cmozwcyj900f6408oatdv2o0z	Muria	muria-union	2458	2026-05-10 15:55:49.574	2026-05-10 16:52:53.871	t	মুড়িয়া	Muria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv7z00tiw88o7n4sykjs	cmozwcyj900f6408oatdv2o0z	Lauta	lauta-union	2459	2026-05-10 15:55:49.583	2026-05-10 16:52:53.878	t	লাউতা	Lauta	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv8a00tjw88oz5r9fco6	cmozwcyjf00f7408ou814mfry	Rampasha	rampasha-union	2460	2026-05-10 15:55:49.594	2026-05-10 16:52:53.885	t	রামপাশা	Rampasha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv8p00tkw88oexjor48f	cmozwcyjf00f7408ou814mfry	Lamakazi	lamakazi-union	2461	2026-05-10 15:55:49.609	2026-05-10 16:52:53.892	t	লামাকাজী	Lamakazi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv9200tlw88o9sl8p89s	cmozwcyjf00f7408ou814mfry	Khajanchi	khajanchi-union	2462	2026-05-10 15:55:49.622	2026-05-10 16:52:53.899	t	খাজাঞ্চী	Khajanchi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv9b00tmw88o7idw51bh	cmozwcyjf00f7408ou814mfry	Alankari	alankari-union	2463	2026-05-10 15:55:49.631	2026-05-10 16:52:53.905	t	অলংকারী	Alankari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv9m00tnw88o10nap9vi	cmozwcyjf00f7408ou814mfry	Dewkalash	dewkalash-union	2464	2026-05-10 15:55:49.642	2026-05-10 16:52:53.912	t	দেওকলস	Dewkalash	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv9w00tow88o64mxa0gd	cmozwcyjf00f7408ou814mfry	Bishwanath	bishwanath-union	2465	2026-05-10 15:55:49.652	2026-05-10 16:52:53.919	t	বিশ্বনাথ	Bishwanath	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfva600tpw88om67bq177	cmozwcyjf00f7408ou814mfry	Doshghar	doshghar-union	2466	2026-05-10 15:55:49.662	2026-05-10 16:52:53.925	t	দশঘর	Doshghar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvan00tqw88oym4evhlh	cmozwcyjf00f7408ou814mfry	Daulatpur	daulatpur-union-2	2467	2026-05-10 15:55:49.68	2026-05-10 16:52:53.931	t	দৌলতপুর	Daulatpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvax00trw88okf1hkub9	cmozwcyjn00f8408oxayrlu2s	Telikhal	telikhal-union	2468	2026-05-10 15:55:49.689	2026-05-10 16:52:53.937	t	তেলিখাল	Telikhal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvb600tsw88oigjng0ed	cmozwcyjn00f8408oxayrlu2s	Islampur Paschim	islampur-paschim-union	2469	2026-05-10 15:55:49.698	2026-05-10 16:52:53.943	t	ইসলামপুর পশ্চিম	Islampur Paschim	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvbh00ttw88otwknr0pc	cmozwcyjn00f8408oxayrlu2s	Islampur Purba	islampur-purba-union	2470	2026-05-10 15:55:49.71	2026-05-10 16:52:53.95	t	ইসলামপুর পূর্ব	Islampur Purba	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvbq00tuw88o4txbv5yl	cmozwcyjn00f8408oxayrlu2s	Isakalas	isakalas-union	2471	2026-05-10 15:55:49.718	2026-05-10 16:52:53.956	t	ইসাকলস	Isakalas	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvc200tvw88oel3oded1	cmozwcyjn00f8408oxayrlu2s	Uttor Ronikhai	uttor-ronikhai-union	2472	2026-05-10 15:55:49.73	2026-05-10 16:52:53.962	t	উত্তর রনিখাই	Uttor Ronikhai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvcb00tww88olmqdllsn	cmozwcyjn00f8408oxayrlu2s	Dakkin Ronikhai	dakkin-ronikhai-union	2473	2026-05-10 15:55:49.739	2026-05-10 16:52:53.968	t	দক্ষিন রনিখাই	Dakkin Ronikhai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvck00txw88o6h3bdjip	cmozwcyjz00fa408o6mhaumom	Ghilachora	ghilachora-union	2474	2026-05-10 15:55:49.748	2026-05-10 16:52:53.974	t	ঘিলাছড়া	Ghilachora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv2900sxw88ojfxw1fys	cmozwcykt00ff408oz13ijdd8	West Poilanpur	west-poilanpur-union	2438	2026-05-10 15:55:49.377	2026-05-10 16:52:53.704	t	পশ্চিম পৈলনপুর	West Poilanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv2k00syw88oovesya06	cmozwcyj200f5408o06qc3l84	East Poilanpur	east-poilanpur-union	2439	2026-05-10 15:55:49.388	2026-05-10 16:52:53.712	t	পূর্ব পৈলনপুর	East Poilanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvdo00u1w88os9t7htwd	cmozwcyjz00fa408o6mhaumom	Maijgaon	maijgaon-union	2478	2026-05-10 15:55:49.788	2026-05-10 16:52:53.999	t	মাইজগাঁও	Maijgaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvdx00u2w88osbx6xgk3	cmozwcyk500fb408o4q9ag2f5	Golapganj	golapganj-union	2479	2026-05-10 15:55:49.797	2026-05-10 16:52:54.005	t	গোলাপগঞ্জ	Golapganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfve700u3w88ok24lf5i2	cmozwcyk500fb408o4q9ag2f5	Fulbari	fulbari-union	2480	2026-05-10 15:55:49.807	2026-05-10 16:52:54.011	t	ফুলবাড়ী	Fulbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfveg00u4w88ompv5916h	cmozwcyk500fb408o4q9ag2f5	Lakshmipasha	lakshmipasha-union-1	2481	2026-05-10 15:55:49.816	2026-05-10 16:52:54.017	t	লক্ষ্মীপাশা	Lakshmipasha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfver00u5w88oxn1l7bkz	cmozwcyk500fb408o4q9ag2f5	Budhbaribazar	budhbaribazar-union	2482	2026-05-10 15:55:49.827	2026-05-10 16:52:54.023	t	বুধবারীবাজার	Budhbaribazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvf000u6w88o9syzpasq	cmozwcyk500fb408o4q9ag2f5	Dhakadakshin	dhakadakshin-union	2483	2026-05-10 15:55:49.836	2026-05-10 16:52:54.029	t	ঢাকাদক্ষিন	Dhakadakshin	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvf900u7w88ohh34cl7z	cmozwcyk500fb408o4q9ag2f5	Sharifganj	sharifganj-union	2484	2026-05-10 15:55:49.845	2026-05-10 16:52:54.035	t	শরিফগঞ্জ	Sharifganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvfk00u8w88o4ts8nkpt	cmozwcyk500fb408o4q9ag2f5	Uttar Badepasha	uttar-badepasha-union	2485	2026-05-10 15:55:49.856	2026-05-10 16:52:54.042	t	উত্তর বাদেপাশা	Uttar Badepasha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvfs00u9w88o2o3w6omq	cmozwcyk500fb408o4q9ag2f5	Lakshanaband	lakshanaband-union	2486	2026-05-10 15:55:49.864	2026-05-10 16:52:54.048	t	লক্ষনাবন্দ	Lakshanaband	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvg300uaw88of8qpf7e4	cmozwcyk500fb408o4q9ag2f5	Bhadeshwar	bhadeshwar-union	2487	2026-05-10 15:55:49.875	2026-05-10 16:52:54.055	t	ভাদেশ্বর	Bhadeshwar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvgb00ubw88ow587zjzu	cmozwcyk500fb408o4q9ag2f5	West Amura	west-amura-union	2488	2026-05-10 15:55:49.883	2026-05-10 16:52:54.063	t	পশ্চিম আমুরা	West Amura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvgm00ucw88oesubmmfi	cmozwcykb00fc408ocihx3b9x	Fothepur	fothepur-union	2489	2026-05-10 15:55:49.894	2026-05-10 16:52:54.07	t	ফতেপুর	Fothepur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvgv00udw88ocakvt0fg	cmozwcykb00fc408ocihx3b9x	Rustampur	rustampur-union	2490	2026-05-10 15:55:49.903	2026-05-10 16:52:54.078	t	রুস্তমপুর	Rustampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvh400uew88ox9qx8fb3	cmozwcykb00fc408ocihx3b9x	Paschim Jaflong	paschim-jaflong-union	2491	2026-05-10 15:55:49.912	2026-05-10 16:52:54.086	t	পশ্চিম জাফলং	Paschim Jaflong	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvhe00ufw88onfo93wfv	cmozwcykb00fc408ocihx3b9x	Purba Jaflong	purba-jaflong-union	2492	2026-05-10 15:55:49.922	2026-05-10 16:52:54.094	t	পূর্ব জাফলং	Purba Jaflong	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvhn00ugw88o6vxhcwup	cmozwcykb00fc408ocihx3b9x	Lengura	lengura-union	2493	2026-05-10 15:55:49.931	2026-05-10 16:52:54.102	t	লেঙ্গুড়া	Lengura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvhx00uhw88opjrmg7up	cmozwcykb00fc408ocihx3b9x	Alirgaon	alirgaon-union	2494	2026-05-10 15:55:49.941	2026-05-10 16:52:54.11	t	আলীরগাঁও	Alirgaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvi600uiw88o4q4lm549	cmozwcykb00fc408ocihx3b9x	Nandirgaon	nandirgaon-union	2495	2026-05-10 15:55:49.95	2026-05-10 16:52:54.118	t	নন্দিরগাঁও	Nandirgaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvig00ujw88o1uads1yz	cmozwcykb00fc408ocihx3b9x	Towakul	towakul-union	2496	2026-05-10 15:55:49.96	2026-05-10 16:52:54.125	t	তোয়াকুল	Towakul	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvip00ukw88ow3gqk4d5	cmozwcykb00fc408ocihx3b9x	Daubari	daubari-union	2497	2026-05-10 15:55:49.969	2026-05-10 16:52:54.131	t	ডৌবাড়ী	Daubari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfviy00ulw88o0gs8udt3	cmozwcyko00fe408o8vak29ng	Rajagonj	rajagonj-union	2504	2026-05-10 15:55:49.979	2026-05-10 16:52:54.138	t	রাজাগঞ্জ	Rajagonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvjh00unw88oytojxdiy	cmozwcyko00fe408o8vak29ng	Lakshiprashad Pashim	lakshiprashad-pashim-union	2506	2026-05-10 15:55:49.997	2026-05-10 16:52:54.151	t	লক্ষীপ্রাসাদ পশ্চিম	Lakshiprashad Pashim	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvjr00uow88odmwcjbfe	cmozwcyko00fe408o8vak29ng	Digirpar Purbo	digirpar-purbo-union	2507	2026-05-10 15:55:50.007	2026-05-10 16:52:54.158	t	দিঘিরপার পূর্ব	Digirpar Purbo	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvjz00upw88owehlhyfn	cmozwcyko00fe408o8vak29ng	Satbakh	satbakh-union	2508	2026-05-10 15:55:50.015	2026-05-10 16:52:54.165	t	সাতবাক	Satbakh	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvka00uqw88ox8x3gpc2	cmozwcyko00fe408o8vak29ng	Barachotul	barachotul-union	2509	2026-05-10 15:55:50.026	2026-05-10 16:52:54.172	t	বড়চতুল	Barachotul	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvki00urw88ofdu9sa09	cmozwcyko00fe408o8vak29ng	Kanaighat	kanaighat-union	2510	2026-05-10 15:55:50.034	2026-05-10 16:52:54.179	t	কানাইঘাট	Kanaighat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvks00usw88ow5k11jmi	cmozwcyko00fe408o8vak29ng	Dakhin Banigram	dakhin-banigram-union	2511	2026-05-10 15:55:50.044	2026-05-10 16:52:54.186	t	দক্ষিন বানিগ্রাম	Dakhin Banigram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvl200utw88opfwyh46n	cmozwcyko00fe408o8vak29ng	Jinghabari	jinghabari-union	2512	2026-05-10 15:55:50.054	2026-05-10 16:52:54.192	t	ঝিঙ্গাবাড়ী	Jinghabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvlb00uuw88o2cuv25ap	cmozwcyl000fg408otzq62etd	Jalalabad	jalalabad-union	2513	2026-05-10 15:55:50.063	2026-05-10 16:52:54.199	t	জালালাবাদ	Jalalabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvll00uvw88omdp7sbni	cmozwcyl000fg408otzq62etd	Hatkhula	hatkhula-union	2514	2026-05-10 15:55:50.073	2026-05-10 16:52:54.206	t	হাটখোলা	Hatkhula	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvlu00uww88o29kffu0k	cmozwcyl000fg408otzq62etd	Khadimnagar	khadimnagar-union	2515	2026-05-10 15:55:50.082	2026-05-10 16:52:54.212	t	খাদিমনগর	Khadimnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvm400uxw88o9e227720	cmozwcyl000fg408otzq62etd	Khadimpara	khadimpara-union	2516	2026-05-10 15:55:50.092	2026-05-10 16:52:54.219	t	খাদিমপাড়া	Khadimpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvd300tzw88odwtag8cc	cmozwcyjz00fa408o6mhaumom	Uttar Kushiara	uttar-kushiara-union	2476	2026-05-10 15:55:49.767	2026-05-10 16:52:53.987	t	উত্তর কুশিয়ারা	Uttar Kushiara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvde00u0w88op90fx3ek	cmozwcyjz00fa408o6mhaumom	Uttar Fenchuganj	uttar-fenchuganj-union	2477	2026-05-10 15:55:49.778	2026-05-10 16:52:53.993	t	উত্তর ফেঞ্চুগঞ্জ	Uttar Fenchuganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvnf00v2w88ov9qcuous	cmozwcyl600fh408oeuxdwdyb	Manikpur	manikpur-union	2521	2026-05-10 15:55:50.139	2026-05-10 16:52:54.251	t	মানিকপুর	Manikpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvno00v3w88otdermlel	cmozwcyl600fh408oeuxdwdyb	Sultanpur	sultanpur-union	2522	2026-05-10 15:55:50.148	2026-05-10 16:52:54.258	t	সুলতানপুর	Sultanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvny00v4w88o37fq4drx	cmozwcyl600fh408oeuxdwdyb	Barohal	barohal-union	2523	2026-05-10 15:55:50.158	2026-05-10 16:52:54.264	t	বারহাল	Barohal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvo700v5w88o2keujmpr	cmozwcyl600fh408oeuxdwdyb	Birorsri	birorsri-union	2524	2026-05-10 15:55:50.167	2026-05-10 16:52:54.27	t	বিরশ্রী	Birorsri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvoh00v6w88ozj079tx4	cmozwcyl600fh408oeuxdwdyb	Kajalshah	kajalshah-union	2525	2026-05-10 15:55:50.177	2026-05-10 16:52:54.277	t	কাজলশার	Kajalshah	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvoq00v7w88o38mn3afz	cmozwcyl600fh408oeuxdwdyb	Kolachora	kolachora-union	2526	2026-05-10 15:55:50.186	2026-05-10 16:52:54.283	t	কলাছড়া	Kolachora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvp000v8w88ozhokgbg2	cmozwcyl600fh408oeuxdwdyb	Zakiganj	zakiganj-union	2527	2026-05-10 15:55:50.196	2026-05-10 16:52:54.29	t	জকিগঞ্জ	Zakiganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvpa00v9w88o3vkhk63s	cmozwcyl600fh408oeuxdwdyb	Barothakuri	barothakuri-union	2528	2026-05-10 15:55:50.206	2026-05-10 16:52:54.296	t	বারঠাকুরী	Barothakuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvpj00vaw88one7z1jih	cmozwcyl600fh408oeuxdwdyb	Kaskanakpur	kaskanakpur-union	2529	2026-05-10 15:55:50.215	2026-05-10 16:52:54.303	t	কসকনকপুর	Kaskanakpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvpt00vbw88oz7eh6685	cmozwcyg700ep408ooht80ys4	Baramchal	baramchal-union	2560	2026-05-10 15:55:50.225	2026-05-10 16:52:54.311	t	বরমচাল	Baramchal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvq100vcw88oo14z7m1l	cmozwcyg700ep408ooht80ys4	Bhukshimail	bhukshimail-union	2561	2026-05-10 15:55:50.233	2026-05-10 16:52:54.317	t	ভূকশিমইল	Bhukshimail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvqc00vdw88ozlorp0fd	cmozwcyg700ep408ooht80ys4	Joychandi	joychandi-union	2562	2026-05-10 15:55:50.244	2026-05-10 16:52:54.324	t	জয়চন্ডি	Joychandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvql00vew88ol1oz8tcg	cmozwcyg700ep408ooht80ys4	Brammanbazar	brammanbazar-union	2563	2026-05-10 15:55:50.253	2026-05-10 16:52:54.33	t	ব্রাহ্মণবাজার	Brammanbazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvqv00vfw88o62av54qg	cmozwcyg700ep408ooht80ys4	Kadipur	kadipur-union	2564	2026-05-10 15:55:50.263	2026-05-10 16:52:54.337	t	কাদিপুর	Kadipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvr600vgw88ozpy09sk8	cmozwcyg700ep408ooht80ys4	Kulaura	kulaura-union	2565	2026-05-10 15:55:50.274	2026-05-10 16:52:54.344	t	কুলাউড়া	Kulaura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvrf00vhw88oqylphm2c	cmozwcyg700ep408ooht80ys4	Rauthgaon	rauthgaon-union	2566	2026-05-10 15:55:50.283	2026-05-10 16:52:54.35	t	রাউৎগাঁও	Rauthgaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvrq00viw88ohf37qi7n	cmozwcyg700ep408ooht80ys4	Tilagaon	tilagaon-union	2567	2026-05-10 15:55:50.294	2026-05-10 16:52:54.357	t	টিলাগাঁও	Tilagaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvs000vjw88ov8nb5ncu	cmozwcyg700ep408ooht80ys4	Sharifpur	sharifpur-union	2568	2026-05-10 15:55:50.304	2026-05-10 16:52:54.363	t	শরীফপুর	Sharifpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvs900vkw88ocneb8cme	cmozwcyg700ep408ooht80ys4	Prithimpassa	prithimpassa-union	2569	2026-05-10 15:55:50.313	2026-05-10 16:52:54.37	t	পৃথিমপাশা	Prithimpassa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvsk00vlw88ov5zfzomp	cmozwcyg700ep408ooht80ys4	Kormodha	kormodha-union	2570	2026-05-10 15:55:50.324	2026-05-10 16:52:54.377	t	কর্মধা	Kormodha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvst00vmw88o7bkrekjz	cmozwcyg700ep408ooht80ys4	Bhatera	bhatera-union	2571	2026-05-10 15:55:50.333	2026-05-10 16:52:54.383	t	ভাটেরা	Bhatera	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvt500vnw88obwhuq8sa	cmozwcyg700ep408ooht80ys4	Hazipur	hazipur-union-1	2572	2026-05-10 15:55:50.345	2026-05-10 16:52:54.39	t	হাজীপুর	Hazipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvtg00vow88otha575kb	cmozwcygd00eq408oqtxzaqts	Amtail	amtail-union	2573	2026-05-10 15:55:50.356	2026-05-10 16:52:54.397	t	আমতৈল	Amtail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvtp00vpw88ofl85ov8l	cmozwcygd00eq408oqtxzaqts	Khalilpur	khalilpur-union	2574	2026-05-10 15:55:50.365	2026-05-10 16:52:54.403	t	খলিলপুর	Khalilpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvtz00vqw88o1cmb5uig	cmozwcygd00eq408oqtxzaqts	Monumukh	monumukh-union	2575	2026-05-10 15:55:50.375	2026-05-10 16:52:54.41	t	মনুমুখ	Monumukh	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvu900vrw88o6b9naomf	cmozwcygd00eq408oqtxzaqts	Kamalpur	kamalpur-union	2576	2026-05-10 15:55:50.385	2026-05-10 16:52:54.416	t	কামালপুর	Kamalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvuj00vsw88oqrllkx5q	cmozwcygd00eq408oqtxzaqts	Apar Kagabala	apar-kagabala-union	2577	2026-05-10 15:55:50.395	2026-05-10 16:52:54.422	t	আপার কাগাবলা	Apar Kagabala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvuu00vtw88okel1d8ze	cmozwcygd00eq408oqtxzaqts	Akhailkura	akhailkura-union	2578	2026-05-10 15:55:50.406	2026-05-10 16:52:54.429	t	আখাইলকুড়া	Akhailkura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvv300vuw88ozk51inmx	cmozwcygd00eq408oqtxzaqts	Ekatuna	ekatuna-union	2579	2026-05-10 15:55:50.415	2026-05-10 16:52:54.435	t	একাটুনা	Ekatuna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvve00vvw88o45tfizx9	cmozwcygd00eq408oqtxzaqts	Chadnighat	chadnighat-union	2580	2026-05-10 15:55:50.426	2026-05-10 16:52:54.441	t	চাঁদনীঘাট	Chadnighat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvvn00vww88onevx2jp1	cmozwcygd00eq408oqtxzaqts	Konokpur	konokpur-union	2581	2026-05-10 15:55:50.435	2026-05-10 16:52:54.448	t	কনকপুর	Konokpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvvy00vxw88o57bjli4u	cmozwcygd00eq408oqtxzaqts	Nazirabad	nazirabad-union	2582	2026-05-10 15:55:50.446	2026-05-10 16:52:54.454	t	নাজিরাবাদ	Nazirabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvw800vyw88og4remfpy	cmozwcygd00eq408oqtxzaqts	Mostafapur	mostafapur-union	2583	2026-05-10 15:55:50.456	2026-05-10 16:52:54.46	t	মোস্তফাপুর	Mostafapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvwh00vzw88oz3rs88cb	cmozwcygd00eq408oqtxzaqts	Giasnagar	giasnagar-union	2584	2026-05-10 15:55:50.465	2026-05-10 16:52:54.467	t	গিয়াসনগর	Giasnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvws00w0w88ocedehqwa	cmozwcygj00er408ogkx5dat9	Fotepur	fotepur-union	2585	2026-05-10 15:55:50.476	2026-05-10 16:52:54.474	t	ফতেপুর	Fotepur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvmw00v0w88oimxqdy5p	cmozwcyl000fg408otzq62etd	Mugolgaon	mugolgaon-union	2519	2026-05-10 15:55:50.12	2026-05-10 16:52:54.238	t	মোগলগাও	Mugolgaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvn500v1w88ogywx4o2c	cmozwcyl000fg408otzq62etd	Kandigaon	kandigaon-union	2520	2026-05-10 15:55:50.129	2026-05-10 16:52:54.245	t	কান্দিগাও	Kandigaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvxx00w4w88o828mbw84	cmozwcygj00er408ogkx5dat9	Rajnagar	rajnagar-union-1	2589	2026-05-10 15:55:50.517	2026-05-10 16:52:54.503	t	রাজনগর	Rajnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvy700w5w88ogrvbmz5o	cmozwcygj00er408ogkx5dat9	Tengra	tengra-union	2590	2026-05-10 15:55:50.527	2026-05-10 16:52:54.51	t	টেংরা	Tengra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvyg00w6w88ovvtaqwo1	cmozwcygj00er408ogkx5dat9	Kamarchak	kamarchak-union	2591	2026-05-10 15:55:50.536	2026-05-10 16:52:54.517	t	কামারচাক	Kamarchak	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvyq00w7w88ol50i8o5i	cmozwcygj00er408ogkx5dat9	Munsurnagar	munsurnagar-union	2592	2026-05-10 15:55:50.546	2026-05-10 16:52:54.524	t	মনসুরনগর	Munsurnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvz300w8w88oqucrm02r	cmozwcygq00es408ogzzknshx	Mirzapur	mirzapur-union-2	2593	2026-05-10 15:55:50.559	2026-05-10 16:52:54.531	t	মির্জাপুর	Mirzapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvzc00w9w88o68xcnm4i	cmozwcygq00es408ogzzknshx	Bhunabir	bhunabir-union	2594	2026-05-10 15:55:50.568	2026-05-10 16:52:54.538	t	ভূনবীর	Bhunabir	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvzm00waw88ohcpggyzh	cmozwcygq00es408ogzzknshx	Sreemangal	sreemangal-union	2595	2026-05-10 15:55:50.578	2026-05-10 16:52:54.544	t	শ্রীমঙ্গল	Sreemangal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvzx00wbw88oq84bwb2f	cmozwcygq00es408ogzzknshx	Sindurkhan	sindurkhan-union	2596	2026-05-10 15:55:50.589	2026-05-10 16:52:54.551	t	সিন্দুরখান	Sindurkhan	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw0600wcw88oe8ntfrqj	cmozwcygq00es408ogzzknshx	Kalapur	kalapur-union	2597	2026-05-10 15:55:50.598	2026-05-10 16:52:54.557	t	কালাপুর	Kalapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw0h00wdw88odkbpje1l	cmozwcygq00es408ogzzknshx	Ashidron	ashidron-union	2598	2026-05-10 15:55:50.609	2026-05-10 16:52:54.564	t	আশিদ্রোন	Ashidron	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw0r00wew88ohuwoopr3	cmozwcygq00es408ogzzknshx	Rajghat	rajghat-union	2599	2026-05-10 15:55:50.619	2026-05-10 16:52:54.571	t	রাজঘাট	Rajghat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw1100wfw88ofc2fszk1	cmozwcygq00es408ogzzknshx	Kalighat	kalighat-union	2600	2026-05-10 15:55:50.629	2026-05-10 16:52:54.578	t	কালীঘাট	Kalighat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw1c00wgw88oqhz3t2v3	cmozwcygq00es408ogzzknshx	Satgaon	satgaon-union	2601	2026-05-10 15:55:50.64	2026-05-10 16:52:54.585	t	সাতগাঁও	Satgaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw1m00whw88oef8lrhme	cmozwcyfu00en408ogh771qqb	Jafornagar	jafornagar-union	2602	2026-05-10 15:55:50.65	2026-05-10 16:52:54.591	t	জায়ফরনগর	Jafornagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw1w00wiw88oe1aa5ugs	cmozwcyfu00en408ogh771qqb	West Juri	west-juri-union	2603	2026-05-10 15:55:50.66	2026-05-10 16:52:54.598	t	পশ্চিম জুড়ী	West Juri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw2600wjw88ofqrzpy91	cmozwcyfu00en408ogh771qqb	Gualbari	gualbari-union	2604	2026-05-10 15:55:50.67	2026-05-10 16:52:54.605	t	গোয়ালবাড়ী	Gualbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw2g00wkw88oo57ospku	cmozwcyfu00en408ogh771qqb	Sagornal	sagornal-union	2605	2026-05-10 15:55:50.68	2026-05-10 16:52:54.612	t	সাগরনাল	Sagornal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw2r00wlw88oeeq82qur	cmozwcyfu00en408ogh771qqb	Fultola	fultola-union	2606	2026-05-10 15:55:50.691	2026-05-10 16:52:54.619	t	ফুলতলা	Fultola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw3000wmw88of1dg9mfx	cmozwcyfu00en408ogh771qqb	Eastjuri	eastjuri-union	2607	2026-05-10 15:55:50.7	2026-05-10 16:52:54.628	t	পুর্ব জুড়ী	Eastjuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw3b00wnw88od6befmbp	cmozwcyfc00ek408o40you9d6	Barabhakoir Paschim	barabhakoir-paschim-union	2608	2026-05-10 15:55:50.711	2026-05-10 16:52:54.635	t	বড় ভাকৈর (পশ্চিম)	Barabhakoir Paschim	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw3l00wow88ox9bn7740	cmozwcyfc00ek408o40you9d6	Barabhakoir Purba	barabhakoir-purba-union	2609	2026-05-10 15:55:50.721	2026-05-10 16:52:54.643	t	বড় ভাকৈর (পূর্ব)	Barabhakoir Purba	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw3v00wpw88ow4qmdrg3	cmozwcyfc00ek408o40you9d6	Inatganj	inatganj-union	2610	2026-05-10 15:55:50.731	2026-05-10 16:52:54.65	t	ইনাতগঞ্জ	Inatganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw4600wqw88ot5jzosjz	cmozwcyfc00ek408o40you9d6	Digholbak	digholbak-union	2611	2026-05-10 15:55:50.742	2026-05-10 16:52:54.657	t	দীঘলবাক	Digholbak	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw4f00wrw88ocjmk803w	cmozwcyfc00ek408o40you9d6	Aushkandi	aushkandi-union	2612	2026-05-10 15:55:50.751	2026-05-10 16:52:54.663	t	আউশকান্দি	Aushkandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw4p00wsw88oiof8tc5x	cmozwcyfc00ek408o40you9d6	Kurshi	kurshi-union	2613	2026-05-10 15:55:50.761	2026-05-10 16:52:54.669	t	কুর্শি	Kurshi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw5000wtw88odksfv5o2	cmozwcyfc00ek408o40you9d6	Kargoan	kargoan-union	2614	2026-05-10 15:55:50.772	2026-05-10 16:52:54.676	t	করগাঁও	Kargoan	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw5900wuw88okkvnbr6n	cmozwcyfc00ek408o40you9d6	Nabiganj Sadar	nabiganj-sadar-union	2615	2026-05-10 15:55:50.781	2026-05-10 16:52:54.684	t	নবীগঞ্জ সদর	Nabiganj Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw5k00wvw88obpbzt2hg	cmozwcyfc00ek408o40you9d6	Bausha	bausha-union	2616	2026-05-10 15:55:50.792	2026-05-10 16:52:54.693	t	বাউসা	Bausha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw5t00www88oa1bizui6	cmozwcyfc00ek408o40you9d6	Debparra	debparra-union	2617	2026-05-10 15:55:50.801	2026-05-10 16:52:54.701	t	দেবপাড়া	Debparra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw6400wxw88op0t19ncs	cmozwcyfc00ek408o40you9d6	Gaznaipur	gaznaipur-union	2618	2026-05-10 15:55:50.812	2026-05-10 16:52:54.71	t	গজনাইপুর	Gaznaipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw6o00wzw88o5o1juzu5	cmozwcyfc00ek408o40you9d6	Paniumda	paniumda-union	2620	2026-05-10 15:55:50.832	2026-05-10 16:52:54.728	t	পানিউমদা	Paniumda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw6y00x0w88oiys6n0ad	cmozwcyea00ee408o6rb6rcii	Snanghat	snanghat-union	2621	2026-05-10 15:55:50.842	2026-05-10 16:52:54.738	t	স্নানঘাট	Snanghat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw7800x1w88o3i6sutg2	cmozwcyea00ee408o6rb6rcii	Putijuri	putijuri-union	2622	2026-05-10 15:55:50.852	2026-05-10 16:52:54.746	t	পুটিজুরী	Putijuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw7i00x2w88o11zlf0ai	cmozwcyea00ee408o6rb6rcii	Satkapon	satkapon-union	2623	2026-05-10 15:55:50.862	2026-05-10 16:52:54.755	t	সাতকাপন	Satkapon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvxc00w2w88o1q53pijt	cmozwcygj00er408ogkx5dat9	Munsibazar	munsibazar-union	2587	2026-05-10 15:55:50.496	2026-05-10 16:52:54.488	t	মুন্সিবাজার	Munsibazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvxn00w3w88o519ypmgf	cmozwcygj00er408ogkx5dat9	Panchgaon	panchgaon-union	2588	2026-05-10 15:55:50.507	2026-05-10 16:52:54.496	t	পাঁচগাঁও	Panchgaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw8n00x6w88ogfc47cij	cmozwcyea00ee408o6rb6rcii	Bhadeshwar	bhadeshwar-union-1	2627	2026-05-10 15:55:50.903	2026-05-10 16:52:54.79	t	ভাদেশ্বর	Bhadeshwar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw8x00x7w88o68jt9uhz	cmozwcye400ed408o5zw3ugas	Shibpasha	shibpasha-union	2628	2026-05-10 15:55:50.913	2026-05-10 16:52:54.798	t	শিবপাশা	Shibpasha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw9800x8w88o2q9zwgho	cmozwcye400ed408o5zw3ugas	Kakailsao	kakailsao-union	2629	2026-05-10 15:55:50.924	2026-05-10 16:52:54.807	t	কাকাইলছেও	Kakailsao	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw9r00xaw88oacfso13h	cmozwcye400ed408o5zw3ugas	Badolpur	badolpur-union	2631	2026-05-10 15:55:50.943	2026-05-10 16:52:54.824	t	বদলপুর	Badolpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwa100xbw88o9cqcbkpv	cmozwcye400ed408o5zw3ugas	Jolsuka	jolsuka-union	2632	2026-05-10 15:55:50.953	2026-05-10 16:52:54.832	t	জলসুখা	Jolsuka	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwab00xcw88ohznvwxba	cmozwcyeg00ef408o2ajd392c	Baniachong North East	baniachong-north-east-union	2633	2026-05-10 15:55:50.963	2026-05-10 16:52:54.84	t	বানিয়াচং উত্তর পূর্ব	Baniachong North East	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwam00xdw88obhu4jk4p	cmozwcyeg00ef408o2ajd392c	Baniachong North West	baniachong-north-west-union	2634	2026-05-10 15:55:50.974	2026-05-10 16:52:54.848	t	বানিয়াচং উত্তর পশ্চিম	Baniachong North West	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwav00xew88oluixtxii	cmozwcyeg00ef408o2ajd392c	Baniachong South East	baniachong-south-east-union	2635	2026-05-10 15:55:50.983	2026-05-10 16:52:54.857	t	বানিয়াচং দক্ষিণ পূর্ব	Baniachong South East	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwb600xfw88ouvnz3by9	cmozwcyeg00ef408o2ajd392c	Baniachong South West	baniachong-south-west-union	2636	2026-05-10 15:55:50.994	2026-05-10 16:52:54.866	t	বানিয়াচং দক্ষিণ পশ্চিম	Baniachong South West	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwbj00xgw88og9jvvhyt	cmozwcyeg00ef408o2ajd392c	Daulatpur	daulatpur-union-3	2637	2026-05-10 15:55:51.007	2026-05-10 16:52:54.875	t	দৌলতপুর	Daulatpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwbt00xhw88olqu7czw4	cmozwcyeg00ef408o2ajd392c	Khagaura	khagaura-union	2638	2026-05-10 15:55:51.017	2026-05-10 16:52:54.882	t	খাগাউড়া	Khagaura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwc300xiw88oejxf81vg	cmozwcyeg00ef408o2ajd392c	Baraiuri	baraiuri-union	2639	2026-05-10 15:55:51.027	2026-05-10 16:52:54.891	t	বড়ইউড়ি	Baraiuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwce00xjw88outg5nb9o	cmozwcyeg00ef408o2ajd392c	Kagapasha	kagapasha-union	2640	2026-05-10 15:55:51.038	2026-05-10 16:52:54.899	t	কাগাপাশা	Kagapasha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwco00xkw88ofuxjv6k8	cmozwcyeg00ef408o2ajd392c	Pukra	pukra-union	2641	2026-05-10 15:55:51.048	2026-05-10 16:52:54.909	t	পুকড়া	Pukra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwcy00xlw88oh5iqt9nn	cmozwcyeg00ef408o2ajd392c	Subidpur	subidpur-union	2642	2026-05-10 15:55:51.058	2026-05-10 16:52:54.917	t	সুবিদপুর	Subidpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwd900xmw88o6q7i7ol8	cmozwcyeg00ef408o2ajd392c	Makrampur	makrampur-union	2643	2026-05-10 15:55:51.069	2026-05-10 16:52:54.925	t	মক্রমপুর	Makrampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwdj00xnw88owqkn306m	cmozwcyeg00ef408o2ajd392c	Sujatpur	sujatpur-union	2644	2026-05-10 15:55:51.079	2026-05-10 16:52:54.933	t	সুজাতপুর	Sujatpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwdv00xow88oxw7il6l3	cmozwcyeg00ef408o2ajd392c	Mandari	mandari-union	2645	2026-05-10 15:55:51.091	2026-05-10 16:52:54.943	t	মন্দরী	Mandari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwe400xpw88od2b7hs9e	cmozwcyeg00ef408o2ajd392c	Muradpur	muradpur-union	2646	2026-05-10 15:55:51.1	2026-05-10 16:52:54.952	t	মুরাদপুর	Muradpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwef00xqw88oa1kuao8f	cmozwcyeg00ef408o2ajd392c	Pailarkandi	pailarkandi-union	2647	2026-05-10 15:55:51.111	2026-05-10 16:52:54.961	t	পৈলারকান্দি	Pailarkandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfweq00xrw88o39eok4aj	cmozwcyez00ei408osy7j5xv5	Lakhai	lakhai-union	2648	2026-05-10 15:55:51.122	2026-05-10 16:52:54.97	t	লাখাই	Lakhai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwf000xsw88oyjqdn8kv	cmozwcyez00ei408osy7j5xv5	Murakari	murakari-union	2649	2026-05-10 15:55:51.132	2026-05-10 16:52:54.978	t	মোড়াকরি	Murakari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwfc00xtw88o93tpdgmb	cmozwcyez00ei408osy7j5xv5	Muriauk	muriauk-union	2650	2026-05-10 15:55:51.144	2026-05-10 16:52:54.986	t	মুড়িয়াউক	Muriauk	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwfl00xuw88oafefki6i	cmozwcyez00ei408osy7j5xv5	Bamoi	bamoi-union	2651	2026-05-10 15:55:51.153	2026-05-10 16:52:54.994	t	বামৈ	Bamoi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwfv00xvw88oiw6xefn0	cmozwcyez00ei408osy7j5xv5	Karab	karab-union	2652	2026-05-10 15:55:51.163	2026-05-10 16:52:55.002	t	করাব	Karab	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwg600xww88oyce768ir	cmozwcyez00ei408osy7j5xv5	Bulla	bulla-union	2653	2026-05-10 15:55:51.174	2026-05-10 16:52:55.01	t	বুল্লা	Bulla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwgf00xxw88otjc4pboc	cmozwcyen00eg408od66bk894	Gazipur	gazipur-union	2654	2026-05-10 15:55:51.183	2026-05-10 16:52:55.018	t	গাজীপুর	Gazipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwgq00xyw88os93gkmhw	cmozwcyen00eg408od66bk894	Ahammadabad	ahammadabad-union	2655	2026-05-10 15:55:51.194	2026-05-10 16:52:55.024	t	আহম্মদাবাদ	Ahammadabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwgz00xzw88oemccvqhb	cmozwcyen00eg408od66bk894	Deorgach	deorgach-union	2656	2026-05-10 15:55:51.203	2026-05-10 16:52:55.031	t	দেওরগাছ	Deorgach	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwh900y0w88obo363o7d	cmozwcyen00eg408od66bk894	Paikpara	paikpara-union	2657	2026-05-10 15:55:51.213	2026-05-10 16:52:55.037	t	পাইকপাড়া	Paikpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwhk00y1w88o5vu7xtae	cmozwcyen00eg408od66bk894	Shankhala	shankhala-union	2658	2026-05-10 15:55:51.224	2026-05-10 16:52:55.044	t	শানখলা	Shankhala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwht00y2w88obe6cr6ob	cmozwcyen00eg408od66bk894	Chunarughat	chunarughat-union	2659	2026-05-10 15:55:51.233	2026-05-10 16:52:55.05	t	চুনারুঘাট	Chunarughat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwi400y3w88otx6plgh0	cmozwcyen00eg408od66bk894	Ubahata	ubahata-union	2660	2026-05-10 15:55:51.244	2026-05-10 16:52:55.057	t	উবাহাটা	Ubahata	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxns012dw88obgqfrebf	cmozwcwse006h408oeflpt6d1	Baghabo	baghabo-union	2839	2026-05-10 15:55:52.744	2026-05-10 16:52:56.04	t	বাঘাব	Baghabo	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw8200x4w88oux93v84x	cmozwcyea00ee408o6rb6rcii	Lamatashi	lamatashi-union	2625	2026-05-10 15:55:50.882	2026-05-10 16:52:54.772	t	লামাতাশী	Lamatashi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw8c00x5w88oxb54x3oc	cmozwcyea00ee408o6rb6rcii	Mirpur	mirpur-union	2626	2026-05-10 15:55:50.892	2026-05-10 16:52:54.781	t	মিরপুর	Mirpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwj700y7w88ovucecf0t	cmozwcyet00eh408ocx2nzwim	Lukra	lukra-union	2664	2026-05-10 15:55:51.283	2026-05-10 16:52:55.085	t	লুকড়া	Lukra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwjh00y8w88opdfs6jem	cmozwcyet00eh408ocx2nzwim	Richi	richi-union	2665	2026-05-10 15:55:51.293	2026-05-10 16:52:55.092	t	রিচি	Richi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwjr00y9w88ozxfhxngi	cmozwcyet00eh408ocx2nzwim	Teghoria	teghoria-union	2666	2026-05-10 15:55:51.303	2026-05-10 16:52:55.098	t	তেঘরিয়া	Teghoria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwk200yaw88ovo0ejkfb	cmozwcyet00eh408ocx2nzwim	Poil	poil-union	2667	2026-05-10 15:55:51.314	2026-05-10 16:52:55.105	t	পইল	Poil	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwkc00ybw88oxnrozcos	cmozwcyet00eh408ocx2nzwim	Gopaya	gopaya-union	2668	2026-05-10 15:55:51.324	2026-05-10 16:52:55.112	t	গোপায়া	Gopaya	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwkw00ydw88onua1gyqo	cmozwcyet00eh408ocx2nzwim	Nurpur	nurpur-union	2670	2026-05-10 15:55:51.344	2026-05-10 16:52:55.125	t	নুরপুর	Nurpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwl600yew88o29zlhqt2	cmozwcyet00eh408ocx2nzwim	Shayestaganj	shayestaganj-union	2671	2026-05-10 15:55:51.354	2026-05-10 16:52:55.132	t	শায়েস্তাগঞ্জ	Shayestaganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwlg00yfw88o2kc95q77	cmozwcyet00eh408ocx2nzwim	Nijampur	nijampur-union	2672	2026-05-10 15:55:51.364	2026-05-10 16:52:55.139	t	নিজামপুর	Nijampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwlr00ygw88oncr1x0y7	cmozwcyet00eh408ocx2nzwim	Laskerpur	laskerpur-union	2673	2026-05-10 15:55:51.375	2026-05-10 16:52:55.145	t	লস্করপুর	Laskerpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwm000yhw88ork4v8zuz	cmozwcyf600ej408oddqxc0m2	Dharmaghar	dharmaghar-union	2674	2026-05-10 15:55:51.384	2026-05-10 16:52:55.151	t	ধর্মঘর	Dharmaghar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwma00yiw88ohffdzu7l	cmozwcyf600ej408oddqxc0m2	Choumohani	choumohani-union	2675	2026-05-10 15:55:51.394	2026-05-10 16:52:55.157	t	চৌমুহনী	Choumohani	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwml00yjw88ou677t4v3	cmozwcyf600ej408oddqxc0m2	Bahara	bahara-union	2676	2026-05-10 15:55:51.405	2026-05-10 16:52:55.164	t	বহরা	Bahara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwmv00ykw88otwaqb1mu	cmozwcyf600ej408oddqxc0m2	Adaoir	adaoir-union	2677	2026-05-10 15:55:51.415	2026-05-10 16:52:55.17	t	আদাঐর	Adaoir	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwn600ylw88ofbqwiogj	cmozwcyf600ej408oddqxc0m2	Andiura	andiura-union	2678	2026-05-10 15:55:51.426	2026-05-10 16:52:55.176	t	আন্দিউড়া	Andiura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwnf00ymw88oye227md8	cmozwcyf600ej408oddqxc0m2	Shahjahanpur	shahjahanpur-union	2679	2026-05-10 15:55:51.435	2026-05-10 16:52:55.183	t	শাহজাহানপুর	Shahjahanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwnp00ynw88o9izv0a8y	cmozwcyf600ej408oddqxc0m2	Jagadishpur	jagadishpur-union	2680	2026-05-10 15:55:51.445	2026-05-10 16:52:55.189	t	জগদীশপুর	Jagadishpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwo000yow88oiiswi2ux	cmozwcyf600ej408oddqxc0m2	Bulla	bulla-union-1	2681	2026-05-10 15:55:51.456	2026-05-10 16:52:55.196	t	বুল্লা	Bulla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwoa00ypw88odm3c2i4x	cmozwcyf600ej408oddqxc0m2	Noapara	noapara-union-1	2682	2026-05-10 15:55:51.466	2026-05-10 16:52:55.202	t	নোয়াপাড়া	Noapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwol00yqw88o2ky60tej	cmozwcyf600ej408oddqxc0m2	Chhatiain	chhatiain-union	2683	2026-05-10 15:55:51.477	2026-05-10 16:52:55.209	t	ছাতিয়াইন	Chhatiain	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwov00yrw88op68yrjaq	cmozwcyf600ej408oddqxc0m2	Bagashura	bagashura-union	2684	2026-05-10 15:55:51.487	2026-05-10 16:52:55.215	t	বাঘাসুরা	Bagashura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwp500ysw88oiyghgymj	cmozwcyiq00f3408o3pe9hgg9	Jahangirnagar	jahangirnagar-union	2685	2026-05-10 15:55:51.497	2026-05-10 16:52:55.221	t	জাহাঙ্গীরনগর	Jahangirnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwpf00ytw88oac7xy7m4	cmozwcyiq00f3408o3pe9hgg9	Rangarchar	rangarchar-union	2686	2026-05-10 15:55:51.507	2026-05-10 16:52:55.227	t	রংগারচর	Rangarchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwpo00yuw88ovlmm2q44	cmozwcyiq00f3408o3pe9hgg9	Aptabnagar	aptabnagar-union	2687	2026-05-10 15:55:51.516	2026-05-10 16:52:55.233	t	আপ্তাবনগর	Aptabnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwpy00yvw88oofh3kbcz	cmozwcyiq00f3408o3pe9hgg9	Gourarang	gourarang-union	2688	2026-05-10 15:55:51.526	2026-05-10 16:52:55.24	t	গৌরারং	Gourarang	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwq800yww88o4bt4jg9a	cmozwcyiq00f3408o3pe9hgg9	Mollapara	mollapara-union	2689	2026-05-10 15:55:51.536	2026-05-10 16:52:55.246	t	মোল্লাপাড়া	Mollapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwqi00yxw88och4c4z64	cmozwcyiq00f3408o3pe9hgg9	Laxmansree	laxmansree-union	2690	2026-05-10 15:55:51.546	2026-05-10 16:52:55.252	t	লক্ষণশ্রী	Laxmansree	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwqs00yyw88oz0stw9ic	cmozwcyiq00f3408o3pe9hgg9	Kathair	kathair-union	2691	2026-05-10 15:55:51.556	2026-05-10 16:52:55.259	t	কাঠইর	Kathair	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwr100yzw88oj659vjl6	cmozwcyiq00f3408o3pe9hgg9	Surma	surma-union	2692	2026-05-10 15:55:51.565	2026-05-10 16:52:55.265	t	সুরমা	Surma	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwrd00z0w88oae1zek8q	cmozwcyiq00f3408o3pe9hgg9	Mohonpur	mohonpur-union-2	2693	2026-05-10 15:55:51.577	2026-05-10 16:52:55.273	t	মোহনপুর	Mohonpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwrm00z1w88os5nt48gy	cmozwcyh400eu408o1h19r7js	Islampur	islampur-union	2707	2026-05-10 15:55:51.586	2026-05-10 16:52:55.28	t	ইসলামপুর	Islampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwrw00z2w88oxi5gtcux	cmozwcyh400eu408o1h19r7js	Noarai	noarai-union	2708	2026-05-10 15:55:51.596	2026-05-10 16:52:55.286	t	নোয়ারাই	Noarai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfws600z3w88ov3b9vw4g	cmozwcyh400eu408o1h19r7js	Chhatak Sadar	chhatak-sadar-union	2709	2026-05-10 15:55:51.606	2026-05-10 16:52:55.293	t	ছাতক সদর	Chhatak Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwsf00z4w88osghfv14e	cmozwcyh400eu408o1h19r7js	Kalaruka	kalaruka-union	2710	2026-05-10 15:55:51.615	2026-05-10 16:52:55.299	t	কালারুকা	Kalaruka	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwsz00z6w88oivdpk330	cmozwcyh400eu408o1h19r7js	Chhaila Afjalabad	chhaila-afjalabad-union	2712	2026-05-10 15:55:51.635	2026-05-10 16:52:55.312	t	ছৈলা আফজলাবাদ	Chhaila Afjalabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwin00y5w88oh3sun1wa	cmozwcyen00eg408od66bk894	Ranigaon	ranigaon-union	2662	2026-05-10 15:55:51.263	2026-05-10 16:52:55.071	t	রাণীগাঁও	Ranigaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwiy00y6w88ozj0shg1e	cmozwcyen00eg408od66bk894	Mirashi	mirashi-union	2663	2026-05-10 15:55:51.274	2026-05-10 16:52:55.078	t	মিরাশী	Mirashi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwu200zaw88oogine526	cmozwcyh400eu408o1h19r7js	Jauwabazar	jauwabazar-union	2716	2026-05-10 15:55:51.674	2026-05-10 16:52:55.34	t	জাউয়া বাজার	Jauwabazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwub00zbw88otnb0t3fc	cmozwcyh400eu408o1h19r7js	Singchapair	singchapair-union	2717	2026-05-10 15:55:51.683	2026-05-10 16:52:55.347	t	সিংচাপইড়	Singchapair	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwul00zcw88oaggej5t5	cmozwcyh400eu408o1h19r7js	Dolarbazar	dolarbazar-union	2718	2026-05-10 15:55:51.693	2026-05-10 16:52:55.353	t	দোলারবাজার	Dolarbazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwuu00zdw88omosvey43	cmozwcyh400eu408o1h19r7js	Bhatgaon	bhatgaon-union	2719	2026-05-10 15:55:51.702	2026-05-10 16:52:55.36	t	ভাতগাঁও	Bhatgaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwv400zew88ompn3qhl2	cmozwcyht00ey408oda7s6w2k	Kolkolia	kolkolia-union	2720	2026-05-10 15:55:51.712	2026-05-10 16:52:55.367	t	কলকলিয়া	Kolkolia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwve00zfw88oqftgfo9o	cmozwcyht00ey408oda7s6w2k	Patli	patli-union	2721	2026-05-10 15:55:51.722	2026-05-10 16:52:55.373	t	পাটলী	Patli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwvo00zgw88ojsm1ba2y	cmozwcyht00ey408oda7s6w2k	Mirpur	mirpur-union-1	2722	2026-05-10 15:55:51.732	2026-05-10 16:52:55.38	t	মীরপুর	Mirpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfww800ziw88oagy27i3v	cmozwcyht00ey408oda7s6w2k	Raniganj	raniganj-union	2724	2026-05-10 15:55:51.752	2026-05-10 16:52:55.392	t	রানীগঞ্জ	Raniganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwwi00zjw88o3rbksqk3	cmozwcyht00ey408oda7s6w2k	Syedpur Shaharpara	syedpur-shaharpara-union	2725	2026-05-10 15:55:51.762	2026-05-10 16:52:55.399	t	সৈয়দপুর শাহাড়পাড়া	Syedpur Shaharpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwws00zkw88oqxmv09jx	cmozwcyht00ey408oda7s6w2k	Asharkandi	asharkandi-union	2726	2026-05-10 15:55:51.772	2026-05-10 16:52:55.405	t	আশারকান্দি	Asharkandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwx100zlw88ot27stq8g	cmozwcyht00ey408oda7s6w2k	Pailgaon	pailgaon-union	2727	2026-05-10 15:55:51.781	2026-05-10 16:52:55.412	t	পাইলগাঁও	Pailgaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwxb00zmw88onnnhjmko	cmozwcyhn00ex408olcflnbjf	Banglabazar	banglabazar-union	2728	2026-05-10 15:55:51.791	2026-05-10 16:52:55.418	t	বাংলাবাজার	Banglabazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwxk00znw88oi2jzk5dp	cmozwcyhn00ex408olcflnbjf	Norsingpur	norsingpur-union	2729	2026-05-10 15:55:51.8	2026-05-10 16:52:55.424	t	নরসিংহপুর	Norsingpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwxu00zow88ohywqzz7d	cmozwcyhn00ex408olcflnbjf	Dowarabazar	dowarabazar-union	2730	2026-05-10 15:55:51.81	2026-05-10 16:52:55.431	t	দোয়ারাবাজার	Dowarabazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwy400zpw88olhqlkdll	cmozwcyhn00ex408olcflnbjf	Mannargaon	mannargaon-union	2731	2026-05-10 15:55:51.82	2026-05-10 16:52:55.438	t	মান্নারগাঁও	Mannargaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwye00zqw88of2kvw8m2	cmozwcyhn00ex408olcflnbjf	Pandargaon	pandargaon-union	2732	2026-05-10 15:55:51.83	2026-05-10 16:52:55.444	t	পান্ডারগাঁও	Pandargaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwyo00zrw88ogn3fdh98	cmozwcyhn00ex408olcflnbjf	Dohalia	dohalia-union	2733	2026-05-10 15:55:51.84	2026-05-10 16:52:55.45	t	দোহালিয়া	Dohalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwyy00zsw88o54n14w2j	cmozwcyhn00ex408olcflnbjf	Laxmipur	laxmipur-union	2734	2026-05-10 15:55:51.85	2026-05-10 16:52:55.457	t	লক্ষীপুর	Laxmipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwz900ztw88o2dsgd6bp	cmozwcyhn00ex408olcflnbjf	Boglabazar	boglabazar-union	2735	2026-05-10 15:55:51.861	2026-05-10 16:52:55.464	t	বোগলাবাজার	Boglabazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwzk00zuw88os1us1v4k	cmozwcyhn00ex408olcflnbjf	Surma	surma-union-1	2736	2026-05-10 15:55:51.872	2026-05-10 16:52:55.471	t	সুরমা	Surma	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwzt00zvw88o844fwmbf	cmozwcyiw00f4408oq3ubrum1	Sreepur North	sreepur-north-union	2737	2026-05-10 15:55:51.881	2026-05-10 16:52:55.478	t	শ্রীপুর উত্তর	Sreepur North	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx0400zww88op220dh8j	cmozwcyiw00f4408oq3ubrum1	Sreepur South	sreepur-south-union	2738	2026-05-10 15:55:51.892	2026-05-10 16:52:55.485	t	শ্রীপুর দক্ষিণ	Sreepur South	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx0c00zxw88oaq2qoh1w	cmozwcyiw00f4408oq3ubrum1	Bordal South	bordal-south-union	2739	2026-05-10 15:55:51.9	2026-05-10 16:52:55.491	t	বড়দল দক্ষিণ	Bordal South	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx0m00zyw88o5l5f2urc	cmozwcyiw00f4408oq3ubrum1	Bordal North	bordal-north-union	2740	2026-05-10 15:55:51.91	2026-05-10 16:52:55.497	t	বড়দল উত্তর	Bordal North	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx0v00zzw88o6fnvu3lp	cmozwcyiw00f4408oq3ubrum1	Badaghat	badaghat-union	2741	2026-05-10 15:55:51.919	2026-05-10 16:52:55.504	t	বাদাঘাট	Badaghat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx140100w88o0gh8lb4o	cmozwcyiw00f4408oq3ubrum1	Tahirpur Sadar	tahirpur-sadar-union	2742	2026-05-10 15:55:51.928	2026-05-10 16:52:55.51	t	তাহিরপুর সদর	Tahirpur Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx1f0101w88oxv11a5s1	cmozwcyiw00f4408oq3ubrum1	Balijuri	balijuri-union	2743	2026-05-10 15:55:51.939	2026-05-10 16:52:55.517	t	বালিজুরী	Balijuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx1n0102w88oc5ufn8xh	cmozwcyhh00ew408o7g6pow05	Bongshikunda North	bongshikunda-north-union	2744	2026-05-10 15:55:51.947	2026-05-10 16:52:55.523	t	বংশীকুন্ডা উত্তর	Bongshikunda North	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx1x0103w88o5go0wvnw	cmozwcyhh00ew408o7g6pow05	Bongshikunda South	bongshikunda-south-union	2745	2026-05-10 15:55:51.957	2026-05-10 16:52:55.53	t	বংশীকুন্ডা দক্ষিণ	Bongshikunda South	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx250104w88ocryw437g	cmozwcyhh00ew408o7g6pow05	Chamordani	chamordani-union	2746	2026-05-10 15:55:51.965	2026-05-10 16:52:55.536	t	চামরদানী	Chamordani	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx2f0105w88oeqagy33l	cmozwcyhh00ew408o7g6pow05	Madhyanagar	madhyanagar-union	2747	2026-05-10 15:55:51.975	2026-05-10 16:52:55.542	t	মধ্যনগর	Madhyanagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx2n0106w88okbrmk5nv	cmozwcyhh00ew408o7g6pow05	Paikurati	paikurati-union	2748	2026-05-10 15:55:51.983	2026-05-10 16:52:55.548	t	পাইকুরাটী	Paikurati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx2x0107w88owwqbv7j3	cmozwcyhh00ew408o7g6pow05	Selbarash	selbarash-union	2749	2026-05-10 15:55:51.993	2026-05-10 16:52:55.554	t	সেলবরষ	Selbarash	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwtj00z8w88oqg8mymv5	cmozwcyh400eu408o1h19r7js	Khurma South	khurma-south-union	2714	2026-05-10 15:55:51.655	2026-05-10 16:52:55.326	t	খুরমা দক্ষিণ	Khurma South	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwts00z9w88on0xt947v	cmozwcyh400eu408o1h19r7js	Chormohalla	chormohalla-union	2715	2026-05-10 15:55:51.664	2026-05-10 16:52:55.333	t	চরমহল্লা	Chormohalla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx3z010bw88olz95rkdv	cmozwcyhh00ew408o7g6pow05	Sukhair Rajapur South	sukhair-rajapur-south-union	2753	2026-05-10 15:55:52.031	2026-05-10 16:52:55.58	t	সুখাইড় রাজাপুর দক্ষিণ	Sukhair Rajapur South	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx4b010cw88o5m1f6g2z	cmozwcyhz00ez408ov0vtsmf2	Beheli	beheli-union	2754	2026-05-10 15:55:52.043	2026-05-10 16:52:55.586	t	বেহেলী	Beheli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx4j010dw88ocyr7g4gi	cmozwcyhz00ez408ov0vtsmf2	Sachnabazar	sachnabazar-union	2755	2026-05-10 15:55:52.051	2026-05-10 16:52:55.592	t	সাচনাবাজার	Sachnabazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx4t010ew88oprx9fon7	cmozwcyhz00ez408ov0vtsmf2	Bhimkhali	bhimkhali-union	2756	2026-05-10 15:55:52.061	2026-05-10 16:52:55.599	t	ভীমখালী	Bhimkhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx53010fw88o6w46uef3	cmozwcyhz00ez408ov0vtsmf2	Fenerbak	fenerbak-union	2757	2026-05-10 15:55:52.071	2026-05-10 16:52:55.605	t	ফেনারবাক	Fenerbak	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx5c010gw88o79saea72	cmozwcyhz00ez408ov0vtsmf2	Jamalganj Sadar	jamalganj-sadar-union	2758	2026-05-10 15:55:52.08	2026-05-10 16:52:55.612	t	জামালগঞ্জ সদর	Jamalganj Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx5n010hw88o5w1a7tgl	cmozwcyic00f1408oogkynfyt	Atgaon	atgaon-union	2759	2026-05-10 15:55:52.091	2026-05-10 16:52:55.618	t	আটগাঁও	Atgaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx5v010iw88ojfmp8xyd	cmozwcyic00f1408oogkynfyt	Habibpur	habibpur-union	2760	2026-05-10 15:55:52.099	2026-05-10 16:52:55.624	t	হবিবপুর	Habibpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx66010jw88oe0uoejq8	cmozwcyic00f1408oogkynfyt	Bahara	bahara-union-1	2761	2026-05-10 15:55:52.11	2026-05-10 16:52:55.63	t	বাহারা	Bahara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx6f010kw88o7bom60xe	cmozwcyic00f1408oogkynfyt	Shalla Sadar	shalla-sadar-union	2762	2026-05-10 15:55:52.119	2026-05-10 16:52:55.636	t	শাল্লা সদর	Shalla Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx6p010lw88owpzp2sha	cmozwcyhb00ev408o6ma5qv34	Rafinagar	rafinagar-union	2763	2026-05-10 15:55:52.129	2026-05-10 16:52:55.642	t	রফিনগর	Rafinagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx70010mw88od28631bq	cmozwcyhb00ev408o6ma5qv34	Bhatipara	bhatipara-union	2764	2026-05-10 15:55:52.14	2026-05-10 16:52:55.649	t	ভাটিপাড়া	Bhatipara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx7a010nw88o36x6b1be	cmozwcyhb00ev408o6ma5qv34	Rajanagar	rajanagar-union	2765	2026-05-10 15:55:52.15	2026-05-10 16:52:55.654	t	রাজানগর	Rajanagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx7m010ow88otsli3b66	cmozwcyhb00ev408o6ma5qv34	Charnarchar	charnarchar-union	2766	2026-05-10 15:55:52.162	2026-05-10 16:52:55.66	t	চরনারচর	Charnarchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx7z010pw88ozt3mwv0f	cmozwcyhb00ev408o6ma5qv34	Derai Sarmangal	derai-sarmangal-union	2767	2026-05-10 15:55:52.175	2026-05-10 16:52:55.666	t	দিরাই সরমঙ্গল	Derai Sarmangal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx89010qw88o8ndmnqpn	cmozwcyhb00ev408o6ma5qv34	Karimpur	karimpur-union	2768	2026-05-10 15:55:52.185	2026-05-10 16:52:55.672	t	করিমপুর	Karimpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx8k010rw88ojszmacvn	cmozwcyhb00ev408o6ma5qv34	Jagddol	jagddol-union	2769	2026-05-10 15:55:52.196	2026-05-10 16:52:55.678	t	জগদল	Jagddol	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx8w010sw88ovki9a9kb	cmozwcyhb00ev408o6ma5qv34	Taral	taral-union	2770	2026-05-10 15:55:52.208	2026-05-10 16:52:55.684	t	তাড়ল	Taral	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx97010tw88ophzm6xmt	cmozwcyhb00ev408o6ma5qv34	Kulanj	kulanj-union	2771	2026-05-10 15:55:52.219	2026-05-10 16:52:55.691	t	কুলঞ্জ	Kulanj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx9h010uw88os7cfquac	cmozwcwre006c408o859nqsq7	Amlaba	amlaba-union	2772	2026-05-10 15:55:52.229	2026-05-10 16:52:55.697	t	আমলাব	Amlaba	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx9r010vw88omgwcwyya	cmozwcwre006c408o859nqsq7	Bajnaba	bajnaba-union	2773	2026-05-10 15:55:52.239	2026-05-10 16:52:55.704	t	বাজনাব	Bajnaba	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx9z010ww88ot36yk9x6	cmozwcwre006c408o859nqsq7	Belabo	belabo-union	2774	2026-05-10 15:55:52.247	2026-05-10 16:52:55.711	t	বেলাব	Belabo	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxaa010xw88o3enjbbul	cmozwcwre006c408o859nqsq7	Binnabayd	binnabayd-union	2775	2026-05-10 15:55:52.258	2026-05-10 16:52:55.717	t	বিন্নাবাইদ	Binnabayd	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxai010yw88ozeqduawe	cmozwcwre006c408o859nqsq7	Charuzilab	charuzilab-union	2776	2026-05-10 15:55:52.266	2026-05-10 16:52:55.723	t	চরউজিলাব	Charuzilab	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxas010zw88ovs944m5q	cmozwcwre006c408o859nqsq7	Naraynpur	naraynpur-union	2777	2026-05-10 15:55:52.276	2026-05-10 16:52:55.729	t	নারায়নপুর	Naraynpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxb10110w88og16nlztp	cmozwcwre006c408o859nqsq7	Sallabad	sallabad-union	2778	2026-05-10 15:55:52.285	2026-05-10 16:52:55.735	t	সল্লাবাদ	Sallabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxbb0111w88o1ipruxtt	cmozwcwre006c408o859nqsq7	Patuli	patuli-union	2779	2026-05-10 15:55:52.295	2026-05-10 16:52:55.741	t	পাটুলী	Patuli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxbl0112w88o33wb90ak	cmozwcwre006c408o859nqsq7	Diara	diara-union	2780	2026-05-10 15:55:52.305	2026-05-10 16:52:55.747	t	দেয়ারা মডেল	Diara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxbu0113w88oloau9ing	cmozwcwrr006e408os1tiwl4c	Alokbali	alokbali-union	2793	2026-05-10 15:55:52.314	2026-05-10 16:52:55.753	t	আলোকবালী	Alokbali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxc40114w88oqvr635vk	cmozwcwrr006e408os1tiwl4c	Chardighaldi	chardighaldi-union	2794	2026-05-10 15:55:52.324	2026-05-10 16:52:55.759	t	চরদিঘলদী	Chardighaldi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxcc0115w88os54bgofo	cmozwcwrr006e408os1tiwl4c	Chinishpur	chinishpur-union	2795	2026-05-10 15:55:52.332	2026-05-10 16:52:55.765	t	চিনিশপুর	Chinishpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxcm0116w88obhxs0vun	cmozwcwrr006e408os1tiwl4c	Hajipur	hajipur-union	2796	2026-05-10 15:55:52.342	2026-05-10 16:52:55.771	t	হাজীপুর	Hajipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxcv0117w88ow0b1rymb	cmozwcwrr006e408os1tiwl4c	Karimpur	karimpur-union-1	2797	2026-05-10 15:55:52.351	2026-05-10 16:52:55.777	t	করিমপুর	Karimpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxd50118w88o7yf1ockm	cmozwcwrr006e408os1tiwl4c	Khathalia	khathalia-union	2798	2026-05-10 15:55:52.361	2026-05-10 16:52:55.783	t	কাঠালিয়া	Khathalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx3g0109w88ox6oq0djb	cmozwcyhh00ew408o7g6pow05	Joyasree	joyasree-union	2751	2026-05-10 15:55:52.012	2026-05-10 16:52:55.567	t	জয়শ্রী	Joyasree	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx3r010aw88o1httw3f2	cmozwcyhh00ew408o7g6pow05	Sukhair Rajapur North	sukhair-rajapur-north-union	2752	2026-05-10 15:55:52.023	2026-05-10 16:52:55.574	t	সুখাইড় রাজাপুর উত্তর	Sukhair Rajapur North	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxeh011dw88omj00fb24	cmozwcwrr006e408os1tiwl4c	Paikarchar	paikarchar-union	2803	2026-05-10 15:55:52.409	2026-05-10 16:52:55.815	t	পাইকারচর	Paikarchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxeq011ew88ozfaryur6	cmozwcwrr006e408os1tiwl4c	Panchdona	panchdona-union	2804	2026-05-10 15:55:52.418	2026-05-10 16:52:55.821	t	পাঁচদোনা	Panchdona	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxf0011fw88ozrkhvgql	cmozwcwrr006e408os1tiwl4c	Silmandi	silmandi-union	2805	2026-05-10 15:55:52.428	2026-05-10 16:52:55.828	t	শিলমান্দী	Silmandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxf9011gw88orbe0nibc	cmozwcwrr006e408os1tiwl4c	Amdia	amdia-union	2806	2026-05-10 15:55:52.437	2026-05-10 16:52:55.834	t	আমদিয়া ২	Amdia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxfi011hw88ognmf7c1u	cmozwcwrx006f408ozvsqcpbi	Danga	danga-union	2807	2026-05-10 15:55:52.446	2026-05-10 16:52:55.839	t	ডাংঙ্গা	Danga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxfs011iw88oig68vnkp	cmozwcwrx006f408ozvsqcpbi	Charsindur	charsindur-union	2808	2026-05-10 15:55:52.456	2026-05-10 16:52:55.846	t	চরসিন্দুর	Charsindur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxg0011jw88o82hb1ek9	cmozwcwrx006f408ozvsqcpbi	Jinardi	jinardi-union	2809	2026-05-10 15:55:52.464	2026-05-10 16:52:55.852	t	জিনারদী	Jinardi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxga011kw88oz1dor714	cmozwcwrx006f408ozvsqcpbi	Gazaria	gazaria-union	2810	2026-05-10 15:55:52.474	2026-05-10 16:52:55.858	t	গজারিয়া	Gazaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxgi011lw88o690m3qay	cmozwcws4006g408orhfhyx1h	Chanpur	chanpur-union	2811	2026-05-10 15:55:52.482	2026-05-10 16:52:55.864	t	চানপুর	Chanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxgt011mw88org4kt7rr	cmozwcws4006g408orhfhyx1h	Alipura	alipura-union	2812	2026-05-10 15:55:52.493	2026-05-10 16:52:55.87	t	অলিপুরা	Alipura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxhb011ow88okxyfp6ez	cmozwcws4006g408orhfhyx1h	Adiabad	adiabad-union	2814	2026-05-10 15:55:52.511	2026-05-10 16:52:55.883	t	আদিয়াবাদ	Adiabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxhk011pw88oup0dhj39	cmozwcws4006g408orhfhyx1h	Banshgari	banshgari-union	2815	2026-05-10 15:55:52.52	2026-05-10 16:52:55.889	t	বাঁশগাড়ী	Banshgari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxht011qw88oxykv6oly	cmozwcws4006g408orhfhyx1h	Chanderkandi	chanderkandi-union	2816	2026-05-10 15:55:52.529	2026-05-10 16:52:55.895	t	চান্দেরকান্দি	Chanderkandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxi3011rw88onqyjivkh	cmozwcws4006g408orhfhyx1h	Chararalia	chararalia-union	2817	2026-05-10 15:55:52.539	2026-05-10 16:52:55.902	t	চরআড়ালিয়া	Chararalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxic011sw88oz6mqs3rw	cmozwcws4006g408orhfhyx1h	Charmadhua	charmadhua-union	2818	2026-05-10 15:55:52.548	2026-05-10 16:52:55.908	t	চরমধুয়া	Charmadhua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxil011tw88orem7vdko	cmozwcws4006g408orhfhyx1h	Charsubuddi	charsubuddi-union	2819	2026-05-10 15:55:52.557	2026-05-10 16:52:55.914	t	চরসুবুদ্দি	Charsubuddi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxiu011uw88oginlvq2k	cmozwcws4006g408orhfhyx1h	Daukarchar	daukarchar-union	2820	2026-05-10 15:55:52.566	2026-05-10 16:52:55.92	t	ডৌকারচর	Daukarchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxj4011vw88ofi6urek4	cmozwcws4006g408orhfhyx1h	Hairmara	hairmara-union	2821	2026-05-10 15:55:52.576	2026-05-10 16:52:55.926	t	হাইরমারা	Hairmara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxjc011ww88oa2lk9uwk	cmozwcws4006g408orhfhyx1h	Maheshpur	maheshpur-union	2822	2026-05-10 15:55:52.584	2026-05-10 16:52:55.932	t	মহেষপুর	Maheshpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxjm011xw88otl8jax67	cmozwcws4006g408orhfhyx1h	Mirzanagar	mirzanagar-union	2823	2026-05-10 15:55:52.594	2026-05-10 16:52:55.938	t	মির্জানগর	Mirzanagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxjw011yw88oqgrfdqjv	cmozwcws4006g408orhfhyx1h	Mirzarchar	mirzarchar-union	2824	2026-05-10 15:55:52.604	2026-05-10 16:52:55.944	t	মির্জারচর	Mirzarchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxk5011zw88o76t2y960	cmozwcws4006g408orhfhyx1h	Nilakhya	nilakhya-union	2825	2026-05-10 15:55:52.613	2026-05-10 16:52:55.95	t	নিলক্ষ্যা	Nilakhya	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxkf0120w88onoj5sgek	cmozwcws4006g408orhfhyx1h	Palashtali	palashtali-union	2826	2026-05-10 15:55:52.623	2026-05-10 16:52:55.956	t	পলাশতলী	Palashtali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxkn0121w88ovqwlk2p0	cmozwcws4006g408orhfhyx1h	Paratali	paratali-union	2827	2026-05-10 15:55:52.631	2026-05-10 16:52:55.963	t	পাড়াতলী	Paratali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxkx0122w88ond8dj6pb	cmozwcws4006g408orhfhyx1h	Sreenagar	sreenagar-union	2828	2026-05-10 15:55:52.641	2026-05-10 16:52:55.969	t	শ্রীনগর	Sreenagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxl50123w88o0z6eiftw	cmozwcws4006g408orhfhyx1h	Roypura	roypura-union	2829	2026-05-10 15:55:52.649	2026-05-10 16:52:55.975	t	রায়পুরা	Roypura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxlg0124w88ouy2gujkx	cmozwcws4006g408orhfhyx1h	Musapur	musapur-union	2830	2026-05-10 15:55:52.66	2026-05-10 16:52:55.982	t	মুছাপুর	Musapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxlo0125w88ow41bnn9p	cmozwcws4006g408orhfhyx1h	Uttar Bakharnagar	uttar-bakharnagar-union	2831	2026-05-10 15:55:52.668	2026-05-10 16:52:55.988	t	উত্তর বাখরনগর	Uttar Bakharnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxly0126w88o3zgbop4u	cmozwcws4006g408orhfhyx1h	Marjal	marjal-union	2832	2026-05-10 15:55:52.678	2026-05-10 16:52:55.995	t	মরজাল	Marjal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxm70127w88or5am1wwy	cmozwcwse006h408oeflpt6d1	Dulalpur	dulalpur-union	2833	2026-05-10 15:55:52.687	2026-05-10 16:52:56.001	t	দুলালপুর	Dulalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxmh0128w88oc4ihj2q4	cmozwcwse006h408oeflpt6d1	Joynagar	joynagar-union-1	2834	2026-05-10 15:55:52.697	2026-05-10 16:52:56.008	t	জয়নগর	Joynagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxmr0129w88oqwwi25sp	cmozwcwse006h408oeflpt6d1	Sadharchar	sadharchar-union	2835	2026-05-10 15:55:52.707	2026-05-10 16:52:56.014	t	সাধারচর	Sadharchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxmz012aw88ox7g8lhro	cmozwcwse006h408oeflpt6d1	Masimpur	masimpur-union	2836	2026-05-10 15:55:52.716	2026-05-10 16:52:56.02	t	মাছিমপুর	Masimpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxna012bw88oeu8p8iz2	cmozwcwse006h408oeflpt6d1	Chakradha	chakradha-union	2837	2026-05-10 15:55:52.726	2026-05-10 16:52:56.027	t	চক্রধা	Chakradha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxni012cw88o7el55ipo	cmozwcwse006h408oeflpt6d1	Joshar	joshar-union	2838	2026-05-10 15:55:52.734	2026-05-10 16:52:56.033	t	যোশর	Joshar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxdy011bw88oubw2vldv	cmozwcwrr006e408os1tiwl4c	Meherpara	meherpara-union	2801	2026-05-10 15:55:52.39	2026-05-10 16:52:55.801	t	মেহেড়পাড়া	Meherpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxe6011cw88oq6m97tln	cmozwcwrr006e408os1tiwl4c	Nazarpur	nazarpur-union	2802	2026-05-10 15:55:52.398	2026-05-10 16:52:55.807	t	নজরপুর	Nazarpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxot012hw88oj7dkelpy	cmozwcwji0055408oskyiwncv	Baktarpur	baktarpur-union	2843	2026-05-10 15:55:52.781	2026-05-10 16:52:56.066	t	বক্তারপুর	Baktarpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxp3012iw88ozmzm5h2w	cmozwcwji0055408oskyiwncv	Jamalpurnew	jamalpurnew-union	2844	2026-05-10 15:55:52.791	2026-05-10 16:52:56.073	t	জামালপুর	Jamalpurnew	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxpl012kw88o9ow33vnn	cmozwcwji0055408oskyiwncv	Moktarpur	moktarpur-union	2846	2026-05-10 15:55:52.809	2026-05-10 16:52:56.086	t	মোক্তারপুর	Moktarpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxpt012lw88o9ddru2o1	cmozwcwji0055408oskyiwncv	Nagari	nagari-union	2847	2026-05-10 15:55:52.817	2026-05-10 16:52:56.092	t	নাগরী	Nagari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxq3012mw88o2k4kdh5j	cmozwcwji0055408oskyiwncv	Tumulia	tumulia-union	2848	2026-05-10 15:55:52.827	2026-05-10 16:52:56.098	t	তুমুলিয়া	Tumulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxqd012nw88oxtdmn6lz	cmozwcwjc0054408ogkx0pf73	Atabaha	atabaha-union	2849	2026-05-10 15:55:52.837	2026-05-10 16:52:56.106	t	আটাবহ	Atabaha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxqm012ow88onub8gm6m	cmozwcwjc0054408ogkx0pf73	Boali	boali-union	2850	2026-05-10 15:55:52.846	2026-05-10 16:52:56.114	t	বোয়ালী	Boali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxqw012pw88ofblzqwby	cmozwcwjc0054408ogkx0pf73	Chapair	chapair-union	2851	2026-05-10 15:55:52.856	2026-05-10 16:52:56.123	t	চাপাইর	Chapair	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxr8012qw88orlp3m8il	cmozwcwjc0054408ogkx0pf73	Dhaliora	dhaliora-union	2852	2026-05-10 15:55:52.868	2026-05-10 16:52:56.132	t	ঢালজোড়া	Dhaliora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxrl012rw88oh0lywrfn	cmozwcwjc0054408ogkx0pf73	Fulbaria	fulbaria-union-1	2853	2026-05-10 15:55:52.881	2026-05-10 16:52:56.141	t	ফুলবাড়ীয়া	Fulbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxrw012sw88oywpf79ql	cmozwcwjc0054408ogkx0pf73	Madhyapara	madhyapara-union	2854	2026-05-10 15:55:52.892	2026-05-10 16:52:56.149	t	মধ্যপাড়া	Madhyapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxs6012tw88otr3ppzkt	cmozwcwjc0054408ogkx0pf73	Mouchak	mouchak-union	2855	2026-05-10 15:55:52.902	2026-05-10 16:52:56.157	t	মৌচাক	Mouchak	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxsg012uw88oshdbteae	cmozwcwjc0054408ogkx0pf73	Sutrapur	sutrapur-union	2856	2026-05-10 15:55:52.912	2026-05-10 16:52:56.165	t	সূত্রাপুর	Sutrapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxss012vw88o2exvro8g	cmozwcwjc0054408ogkx0pf73	Srifaltali	srifaltali-union	2857	2026-05-10 15:55:52.924	2026-05-10 16:52:56.172	t	শ্রীফলতলী	Srifaltali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxt2012ww88o95se8jnb	cmozwcwjp0056408oguguulla	Barishaba	barishaba-union	2858	2026-05-10 15:55:52.934	2026-05-10 16:52:56.181	t	বারিষাব	Barishaba	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxtf012xw88olxr8o9st	cmozwcwjp0056408oguguulla	Ghagotia	ghagotia-union	2859	2026-05-10 15:55:52.947	2026-05-10 16:52:56.188	t	ঘাগটিয়া	Ghagotia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxtq012yw88ovq0hr586	cmozwcwjp0056408oguguulla	Kapasia	kapasia-union	2860	2026-05-10 15:55:52.958	2026-05-10 16:52:56.196	t	কাপাসিয়া	Kapasia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxu1012zw88oooz00i7s	cmozwcwjp0056408oguguulla	Chandpur	chandpur-union-1	2861	2026-05-10 15:55:52.969	2026-05-10 16:52:56.202	t	চাঁদপুর	Chandpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxub0130w88ok0di7ocn	cmozwcwjp0056408oguguulla	Targoan	targoan-union	2862	2026-05-10 15:55:52.979	2026-05-10 16:52:56.209	t	তরগাঁও	Targoan	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxul0131w88om2vy64u0	cmozwcwjp0056408oguguulla	Karihata	karihata-union	2863	2026-05-10 15:55:52.989	2026-05-10 16:52:56.215	t	কড়িহাতা	Karihata	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxuu0132w88oipgoxw1r	cmozwcwjp0056408oguguulla	Tokh	tokh-union	2864	2026-05-10 15:55:52.998	2026-05-10 16:52:56.222	t	টোক	Tokh	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxv50133w88oo1811wt5	cmozwcwjp0056408oguguulla	Sinhasree	sinhasree-union	2865	2026-05-10 15:55:53.009	2026-05-10 16:52:56.228	t	সিংহশ্রী	Sinhasree	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxvh0134w88o727587yo	cmozwcwjp0056408oguguulla	Durgapur	durgapur-union-2	2866	2026-05-10 15:55:53.021	2026-05-10 16:52:56.235	t	দূর্গাপুর	Durgapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxvq0135w88oc718lt0w	cmozwcwjp0056408oguguulla	Sonmania	sonmania-union	2867	2026-05-10 15:55:53.03	2026-05-10 16:52:56.242	t	সনমানিয়া	Sonmania	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxw10136w88oq0bllote	cmozwcwjp0056408oguguulla	Rayed	rayed-union	2868	2026-05-10 15:55:53.041	2026-05-10 16:52:56.249	t	রায়েদ	Rayed	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxw90137w88os3c0m2r7	cmozwcwj50053408olm5kfuzk	Baria	baria-union	2869	2026-05-10 15:55:53.049	2026-05-10 16:52:56.255	t	বাড়ীয়া	Baria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxwk0138w88ojqeuq28l	cmozwcwj50053408olm5kfuzk	Basan	basan-union	2870	2026-05-10 15:55:53.06	2026-05-10 16:52:56.262	t	বাসন	Basan	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxwu0139w88ovp16fmcs	cmozwcwj50053408olm5kfuzk	Gachha	gachha-union	2871	2026-05-10 15:55:53.07	2026-05-10 16:52:56.268	t	গাছা	Gachha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxx4013aw88ocp6ne2yk	cmozwcwj50053408olm5kfuzk	Kashimpur	kashimpur-union-1	2872	2026-05-10 15:55:53.08	2026-05-10 16:52:56.274	t	কাশিমপুর	Kashimpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxxf013bw88offuv3cue	cmozwcwj50053408olm5kfuzk	Kayaltia	kayaltia-union	2873	2026-05-10 15:55:53.091	2026-05-10 16:52:56.281	t	কাউলতিয়া	Kayaltia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxxp013cw88ona28advi	cmozwcwj50053408olm5kfuzk	Konabari	konabari-union-1	2874	2026-05-10 15:55:53.101	2026-05-10 16:52:56.287	t	কোনাবাড়ী	Konabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxy2013dw88ocfgvazft	cmozwcwj50053408olm5kfuzk	Mirzapur	mirzapur-union-3	2875	2026-05-10 15:55:53.114	2026-05-10 16:52:56.294	t	মির্জাপুর	Mirzapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxyd013ew88ohptswq5y	cmozwcwj50053408olm5kfuzk	Pubail	pubail-union	2876	2026-05-10 15:55:53.125	2026-05-10 16:52:56.301	t	পূবাইল	Pubail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxyl013fw88o5jpvglj2	cmozwcwjv0057408oet213wos	Barmi	barmi-union	2877	2026-05-10 15:55:53.133	2026-05-10 16:52:56.308	t	বরমী	Barmi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxyx013gw88okpfao9x0	cmozwcwjv0057408oet213wos	Gazipur	gazipur-union-1	2878	2026-05-10 15:55:53.145	2026-05-10 16:52:56.315	t	গাজীপুর	Gazipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxz7013hw88oi23y7u0d	cmozwcwjv0057408oet213wos	Gosinga	gosinga-union	2879	2026-05-10 15:55:53.155	2026-05-10 16:52:56.321	t	গোসিংগা	Gosinga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxob012fw88osr9qt1tu	cmozwcwse006h408oeflpt6d1	Putia	putia-union	2841	2026-05-10 15:55:52.763	2026-05-10 16:52:56.053	t	পুটিয়া	Putia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxol012gw88oq7ykvhh9	cmozwcwji0055408oskyiwncv	Bahadursadi	bahadursadi-union	2842	2026-05-10 15:55:52.773	2026-05-10 16:52:56.06	t	বাহাদুরশাদী	Bahadursadi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy0a013lw88o9hw29931	cmozwcwjv0057408oet213wos	Rajabari	rajabari-union	2883	2026-05-10 15:55:53.194	2026-05-10 16:52:56.349	t	রাজাবাড়ী	Rajabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy0k013mw88omricniq7	cmozwcwjv0057408oet213wos	Telihati	telihati-union	2884	2026-05-10 15:55:53.204	2026-05-10 16:52:56.356	t	তেলিহাটী	Telihati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy0u013nw88o1348r3wy	cmozwcwuj006r408onw56n2uh	Binodpur	binodpur-union-1	2885	2026-05-10 15:55:53.214	2026-05-10 16:52:56.363	t	বিনোদপুর	Binodpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy14013ow88ohekwl0z6	cmozwcwuj006r408onw56n2uh	Tulasar	tulasar-union	2886	2026-05-10 15:55:53.224	2026-05-10 16:52:56.37	t	তুলাসার	Tulasar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy1c013pw88oukoop4xk	cmozwcwuj006r408onw56n2uh	Palong	palong-union	2887	2026-05-10 15:55:53.232	2026-05-10 16:52:56.379	t	পালং	Palong	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy1m013qw88oj7h296v8	cmozwcwuj006r408onw56n2uh	Domshar	domshar-union	2888	2026-05-10 15:55:53.242	2026-05-10 16:52:56.387	t	ডোমসার	Domshar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy1u013rw88odz8013y4	cmozwcwuj006r408onw56n2uh	Rudrakar	rudrakar-union	2889	2026-05-10 15:55:53.25	2026-05-10 16:52:56.394	t	রুদ্রকর	Rudrakar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy26013sw88o49eew89g	cmozwcwuj006r408onw56n2uh	Angaria	angaria-union-1	2890	2026-05-10 15:55:53.262	2026-05-10 16:52:56.401	t	আংগারিয়া	Angaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy2h013tw88o7dfqw5zh	cmozwcwuj006r408onw56n2uh	Chitolia	chitolia-union	2891	2026-05-10 15:55:53.273	2026-05-10 16:52:56.41	t	চিতলয়া	Chitolia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy2p013uw88o08esm0ir	cmozwcwuj006r408onw56n2uh	Mahmudpur	mahmudpur-union	2892	2026-05-10 15:55:53.281	2026-05-10 16:52:56.418	t	মাহমুদপুর	Mahmudpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy2z013vw88o2ycbhhlz	cmozwcwuj006r408onw56n2uh	Chikondi	chikondi-union	2893	2026-05-10 15:55:53.291	2026-05-10 16:52:56.425	t	চিকন্দি	Chikondi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy38013ww88oj3qbzt6n	cmozwcwuj006r408onw56n2uh	Chandrapur	chandrapur-union	2894	2026-05-10 15:55:53.3	2026-05-10 16:52:56.433	t	চন্দ্রপুর	Chandrapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy3i013xw88o6l8y7bmr	cmozwcwuj006r408onw56n2uh	Shulpara	shulpara-union	2895	2026-05-10 15:55:53.31	2026-05-10 16:52:56.439	t	শৌলপাড়া	Shulpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy40013zw88ozonvpbua	cmozwcwuc006q408ohnhi9bwl	Dingamanik	dingamanik-union	2897	2026-05-10 15:55:53.328	2026-05-10 16:52:56.452	t	ডিংগামানিক	Dingamanik	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy4b0140w88o8g2pfbb6	cmozwcwuc006q408ohnhi9bwl	Garishar	garishar-union	2898	2026-05-10 15:55:53.339	2026-05-10 16:52:56.458	t	ঘড়িষার	Garishar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy4k0141w88op4xdx2vf	cmozwcwuc006q408ohnhi9bwl	Nowpara	nowpara-union	2899	2026-05-10 15:55:53.348	2026-05-10 16:52:56.465	t	নওপাড়া	Nowpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy4u0142w88o20588mjd	cmozwcwuc006q408ohnhi9bwl	Moktererchar	moktererchar-union	2900	2026-05-10 15:55:53.358	2026-05-10 16:52:56.471	t	মোত্তারেরচর	Moktererchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy520143w88o8778larv	cmozwcwuc006q408ohnhi9bwl	Charatra	charatra-union	2901	2026-05-10 15:55:53.366	2026-05-10 16:52:56.477	t	চরআত্রা	Charatra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy5f0144w88opcnai236	cmozwcwuc006q408ohnhi9bwl	Rajnagar	rajnagar-union-2	2902	2026-05-10 15:55:53.379	2026-05-10 16:52:56.484	t	রাজনগর	Rajnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy5p0145w88o30nwhs7c	cmozwcwuc006q408ohnhi9bwl	Japsa	japsa-union	2903	2026-05-10 15:55:53.389	2026-05-10 16:52:56.49	t	জপসা	Japsa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy5y0146w88ote6rg8ij	cmozwcwuc006q408ohnhi9bwl	Vojeshwar	vojeshwar-union	2904	2026-05-10 15:55:53.398	2026-05-10 16:52:56.497	t	ভোজেশ্বর	Vojeshwar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy680147w88ollw1j91v	cmozwcwuc006q408ohnhi9bwl	Fategongpur	fategongpur-union	2905	2026-05-10 15:55:53.408	2026-05-10 16:52:56.503	t	ফতেজংপুর	Fategongpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy6g0148w88otgm153qu	cmozwcwuc006q408ohnhi9bwl	Bijari	bijari-union	2906	2026-05-10 15:55:53.416	2026-05-10 16:52:56.51	t	বিঝারি	Bijari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy6r0149w88om7yv4o7f	cmozwcwuc006q408ohnhi9bwl	Vumkhara	vumkhara-union	2907	2026-05-10 15:55:53.427	2026-05-10 16:52:56.517	t	ভূমখাড়া	Vumkhara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy71014aw88oayx50e4p	cmozwcwuc006q408ohnhi9bwl	Nashason	nashason-union	2908	2026-05-10 15:55:53.437	2026-05-10 16:52:56.524	t	নশাসন	Nashason	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy7a014bw88ob0h31wvs	cmozwcwuq006s408odew5xcj1	Zajira Sadar	zajira-sadar-union	2909	2026-05-10 15:55:53.446	2026-05-10 16:52:56.532	t	জাজিরা সদর	Zajira Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy7k014cw88o9oumdaoc	cmozwcwuq006s408odew5xcj1	Mulna	mulna-union	2910	2026-05-10 15:55:53.456	2026-05-10 16:52:56.539	t	মূলনা	Mulna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy7s014dw88ohd87y932	cmozwcwuq006s408odew5xcj1	Barokandi	barokandi-union	2911	2026-05-10 15:55:53.464	2026-05-10 16:52:56.546	t	বড়কান্দি	Barokandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy83014ew88o852rt15o	cmozwcwuq006s408odew5xcj1	Bilaspur	bilaspur-union	2912	2026-05-10 15:55:53.475	2026-05-10 16:52:56.552	t	বিলাসপুর	Bilaspur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy8b014fw88or5v1hcpk	cmozwcwuq006s408odew5xcj1	Kundarchar	kundarchar-union	2913	2026-05-10 15:55:53.483	2026-05-10 16:52:56.559	t	কুন্ডেরচর	Kundarchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy8m014gw88ou0ceu9x4	cmozwcwuq006s408odew5xcj1	Palerchar	palerchar-union	2914	2026-05-10 15:55:53.494	2026-05-10 16:52:56.566	t	পালেরচর	Palerchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy8w014hw88od8vziwgr	cmozwcwuq006s408odew5xcj1	Purba Nawdoba	purba-nawdoba-union	2915	2026-05-10 15:55:53.504	2026-05-10 16:52:56.573	t	পুর্ব নাওডোবা	Purba Nawdoba	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy95014iw88orkdyids3	cmozwcwuq006s408odew5xcj1	Nawdoba	nawdoba-union	2916	2026-05-10 15:55:53.513	2026-05-10 16:52:56.579	t	নাওডোবা	Nawdoba	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy9g014jw88obsltzhzp	cmozwcwuq006s408odew5xcj1	Shenerchar	shenerchar-union	2917	2026-05-10 15:55:53.524	2026-05-10 16:52:56.586	t	সেনেরচর	Shenerchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy9o014kw88ompcvxjfq	cmozwcwuq006s408odew5xcj1	Bknagar	bknagar-union	2918	2026-05-10 15:55:53.532	2026-05-10 16:52:56.592	t	বি. কে. নগর	Bknagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxzs013jw88o51ijqfri	cmozwcwjv0057408oet213wos	Kaoraid	kaoraid-union	2881	2026-05-10 15:55:53.176	2026-05-10 16:52:56.335	t	কাওরাইদ	Kaoraid	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy00013kw88oo0oza529	cmozwcwjv0057408oet213wos	Prahladpur	prahladpur-union	2882	2026-05-10 15:55:53.184	2026-05-10 16:52:56.342	t	প্রহলাদপুর	Prahladpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyau014ow88o5706gq38	cmozwcwu2006p408o7jmzxyd4	Alaolpur	alaolpur-union	2922	2026-05-10 15:55:53.574	2026-05-10 16:52:56.619	t	আলাওলপুর	Alaolpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyb2014pw88oe18v9ck5	cmozwcwu2006p408o7jmzxyd4	Kodalpur	kodalpur-union	2923	2026-05-10 15:55:53.582	2026-05-10 16:52:56.626	t	কোদালপুর	Kodalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfybd014qw88oy9k25o5b	cmozwcwu2006p408o7jmzxyd4	Goshairhat	goshairhat-union	2924	2026-05-10 15:55:53.593	2026-05-10 16:52:56.633	t	গোসাইরহাট	Goshairhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfybm014rw88ot3z4hio8	cmozwcwu2006p408o7jmzxyd4	Edilpur	edilpur-union	2925	2026-05-10 15:55:53.602	2026-05-10 16:52:56.639	t	ইদিলপুর	Edilpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfybw014sw88opnn3sdjw	cmozwcwu2006p408o7jmzxyd4	Nalmuri	nalmuri-union	2926	2026-05-10 15:55:53.612	2026-05-10 16:52:56.646	t	নলমুড়ি	Nalmuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyc6014tw88oypqrrakg	cmozwcwu2006p408o7jmzxyd4	Samontasar	samontasar-union	2927	2026-05-10 15:55:53.622	2026-05-10 16:52:56.652	t	সামন্তসার	Samontasar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfycf014uw88odqm5nvnd	cmozwcwu2006p408o7jmzxyd4	Kuchipatti	kuchipatti-union	2928	2026-05-10 15:55:53.631	2026-05-10 16:52:56.658	t	কুচাইপট্টি	Kuchipatti	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfycq014vw88ox9dwaluq	cmozwcwtn006n408o4i674wgx	Ramvadrapur	ramvadrapur-union	2929	2026-05-10 15:55:53.642	2026-05-10 16:52:56.664	t	রামভদ্রপুর	Ramvadrapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyd1014ww88ortb6ut16	cmozwcwtn006n408o4i674wgx	Mahisar	mahisar-union	2930	2026-05-10 15:55:53.653	2026-05-10 16:52:56.67	t	মহিষার	Mahisar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfydf014xw88ogcewaj74	cmozwcwtn006n408o4i674wgx	Saygaon	saygaon-union	2931	2026-05-10 15:55:53.667	2026-05-10 16:52:56.676	t	ছয়গাঁও	Saygaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfydq014yw88oq2kefk09	cmozwcwtn006n408o4i674wgx	Narayanpur	narayanpur-union	2932	2026-05-10 15:55:53.678	2026-05-10 16:52:56.682	t	নারায়নপুর	Narayanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfye0014zw88oqd1fujyn	cmozwcwtn006n408o4i674wgx	D.M Khali	d-m-khali-union	2933	2026-05-10 15:55:53.688	2026-05-10 16:52:56.688	t	ডি.এম খালি	D.M Khali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfye90150w88oij0odmwr	cmozwcwtn006n408o4i674wgx	Charkumaria	charkumaria-union	2934	2026-05-10 15:55:53.697	2026-05-10 16:52:56.694	t	চরকুমারিয়া	Charkumaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyel0151w88okf6r4yq1	cmozwcwtn006n408o4i674wgx	Sakhipur	sakhipur-union-1	2935	2026-05-10 15:55:53.709	2026-05-10 16:52:56.7	t	সখিপুর	Sakhipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyet0152w88o1h13y6ed	cmozwcwtn006n408o4i674wgx	Kachikata	kachikata-union	2936	2026-05-10 15:55:53.717	2026-05-10 16:52:56.707	t	কাচিকাঁটা	Kachikata	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyf40153w88oqpk850i6	cmozwcwtn006n408o4i674wgx	North Tarabunia	north-tarabunia-union	2937	2026-05-10 15:55:53.728	2026-05-10 16:52:56.713	t	উত্তর তারাবুনিয়া	North Tarabunia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyfe0154w88oe3kfiymm	cmozwcwtn006n408o4i674wgx	Charvaga	charvaga-union	2938	2026-05-10 15:55:53.738	2026-05-10 16:52:56.719	t	চরভাগা	Charvaga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyfn0155w88ol3ttp8wi	cmozwcwtn006n408o4i674wgx	Arsinagar	arsinagar-union	2939	2026-05-10 15:55:53.747	2026-05-10 16:52:56.726	t	আরশিনগর	Arsinagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyg60157w88o1d1ss54k	cmozwcwtn006n408o4i674wgx	Charsensas	charsensas-union	2941	2026-05-10 15:55:53.766	2026-05-10 16:52:56.738	t	চরসেনসাস	Charsensas	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfygh0158w88o52db264t	cmozwcwtu006o408ow5s6rbbv	Shidulkura	shidulkura-union	2942	2026-05-10 15:55:53.777	2026-05-10 16:52:56.745	t	শিধলকুড়া	Shidulkura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfygp0159w88oxvlrxvsa	cmozwcwtu006o408ow5s6rbbv	Kaneshar	kaneshar-union	2943	2026-05-10 15:55:53.785	2026-05-10 16:52:56.751	t	কনেস্বর	Kaneshar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyh0015aw88o7bsaqxog	cmozwcwtu006o408ow5s6rbbv	Purba Damudya	purba-damudya-union	2944	2026-05-10 15:55:53.796	2026-05-10 16:52:56.758	t	পুর্ব ডামুড্যা	Purba Damudya	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyhb015bw88o5hhh3gjv	cmozwcwtu006o408ow5s6rbbv	Islampur	islampur-union-1	2945	2026-05-10 15:55:53.807	2026-05-10 16:52:56.764	t	ইসলামপুর	Islampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyhj015cw88oht8sxr8x	cmozwcwtu006o408ow5s6rbbv	Dankati	dankati-union	2946	2026-05-10 15:55:53.815	2026-05-10 16:52:56.771	t	ধানকাটি	Dankati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyhu015dw88omdqfpmzi	cmozwcwtu006o408ow5s6rbbv	Sidya	sidya-union	2947	2026-05-10 15:55:53.826	2026-05-10 16:52:56.777	t	সিড্যা	Sidya	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyi2015ew88omn9auk3w	cmozwcwtu006o408ow5s6rbbv	Darulaman	darulaman-union	2948	2026-05-10 15:55:53.834	2026-05-10 16:52:56.784	t	দারুল আমান	Darulaman	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyic015fw88oyep0hu1z	cmozwcwqf0067408o019ziqr8	Satgram	satgram-union	2949	2026-05-10 15:55:53.844	2026-05-10 16:52:56.792	t	সাতগ্রাম	Satgram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyim015gw88os7tdizls	cmozwcwqf0067408o019ziqr8	Duptara	duptara-union	2950	2026-05-10 15:55:53.854	2026-05-10 16:52:56.801	t	দুপ্তারা	Duptara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyiv015hw88owfownrsu	cmozwcwqf0067408o019ziqr8	Brahammandi	brahammandi-union	2951	2026-05-10 15:55:53.863	2026-05-10 16:52:56.808	t	ব্রা‏হ্মন্দী	Brahammandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyj6015iw88obtbrcyg8	cmozwcwqf0067408o019ziqr8	Fatepur	fatepur-union	2952	2026-05-10 15:55:53.874	2026-05-10 16:52:56.816	t	ফতেপুর	Fatepur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyjf015jw88og5tdpkrv	cmozwcwqf0067408o019ziqr8	Bishnandi	bishnandi-union	2953	2026-05-10 15:55:53.883	2026-05-10 16:52:56.824	t	বিশনন্দী	Bishnandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyjq015kw88oe9r6eeui	cmozwcwqf0067408o019ziqr8	Mahmudpur	mahmudpur-union-1	2954	2026-05-10 15:55:53.894	2026-05-10 16:52:56.832	t	মাহমুদপুর	Mahmudpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyjz015lw88o92u5sb3p	cmozwcwqf0067408o019ziqr8	Highjadi	highjadi-union	2955	2026-05-10 15:55:53.903	2026-05-10 16:52:56.838	t	হাইজাদী	Highjadi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyk9015mw88o6q9muaui	cmozwcwqf0067408o019ziqr8	Uchitpura	uchitpura-union	2956	2026-05-10 15:55:53.913	2026-05-10 16:52:56.845	t	উচিৎপুরা	Uchitpura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyaa014mw88ocfowakxr	cmozwcwuq006s408odew5xcj1	Jaynagor	jaynagor-union-1	2920	2026-05-10 15:55:53.554	2026-05-10 16:52:56.606	t	জয়নগর	Jaynagor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyaj014nw88o9ic4bt6l	cmozwcwu2006p408o7jmzxyd4	Nager Para	nager-para-union	2921	2026-05-10 15:55:53.563	2026-05-10 16:52:56.613	t	নাগের পাড়া	Nager Para	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyle015qw88o3lhowf9y	cmozwcwql0068408ogbgyptxy	Modonpur	modonpur-union	2960	2026-05-10 15:55:53.954	2026-05-10 16:52:56.881	t	মদনপুর	Modonpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyln015rw88o4kfdl3c6	cmozwcwql0068408ogbgyptxy	Bandar	bandar-union	2961	2026-05-10 15:55:53.963	2026-05-10 16:52:56.889	t	বন্দর	Bandar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyly015sw88on96e9hm0	cmozwcwql0068408ogbgyptxy	Dhamgar	dhamgar-union	2962	2026-05-10 15:55:53.974	2026-05-10 16:52:56.897	t	ধামগর	Dhamgar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfym7015tw88oldy5qs7x	cmozwcwql0068408ogbgyptxy	Kolagathia	kolagathia-union	2963	2026-05-10 15:55:53.983	2026-05-10 16:52:56.904	t	কলাগাছিয়া	Kolagathia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfymi015uw88o3i4q7vm9	cmozwcwqs0069408o37vu3e7y	Alirtek	alirtek-union	2964	2026-05-10 15:55:53.994	2026-05-10 16:52:56.911	t	আলিরটেক	Alirtek	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfymu015vw88odwxwsu4l	cmozwcwqs0069408o37vu3e7y	Kashipur	kashipur-union-1	2965	2026-05-10 15:55:54.006	2026-05-10 16:52:56.918	t	কাশীপুর	Kashipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyn4015ww88ogwvlqu1h	cmozwcwqs0069408o37vu3e7y	Kutubpur	kutubpur-union-2	2966	2026-05-10 15:55:54.016	2026-05-10 16:52:56.927	t	কুতুবপুর	Kutubpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfynf015xw88og7skgc3t	cmozwcwqs0069408o37vu3e7y	Gognagar	gognagar-union	2967	2026-05-10 15:55:54.027	2026-05-10 16:52:56.937	t	গোগনগর	Gognagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyno015yw88orgjl12hm	cmozwcwqs0069408o37vu3e7y	Baktaboli	baktaboli-union	2968	2026-05-10 15:55:54.036	2026-05-10 16:52:56.944	t	বক্তাবলী	Baktaboli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyny015zw88o9f9xu12d	cmozwcwqs0069408o37vu3e7y	Enayetnagor	enayetnagor-union	2969	2026-05-10 15:55:54.046	2026-05-10 16:52:56.951	t	এনায়েত নগর	Enayetnagor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyo80160w88ok3qv48rj	cmozwcwr0006a408o926j820b	Murapara	murapara-union	2970	2026-05-10 15:55:54.056	2026-05-10 16:52:56.958	t	মুড়াপাড়া	Murapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyoh0161w88oou7asn1b	cmozwcwr0006a408o926j820b	Bhulta	bhulta-union	2971	2026-05-10 15:55:54.065	2026-05-10 16:52:56.964	t	ভূলতা	Bhulta	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyor0162w88o38dkc89x	cmozwcwr0006a408o926j820b	Golakandail	golakandail-union	2972	2026-05-10 15:55:54.075	2026-05-10 16:52:56.972	t	গোলাকান্দাইল	Golakandail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyp00163w88o5y6u1svy	cmozwcwr0006a408o926j820b	Daudpur	daudpur-union	2973	2026-05-10 15:55:54.084	2026-05-10 16:52:56.979	t	দাউদপুর	Daudpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfypa0164w88o11qyu5w3	cmozwcwr0006a408o926j820b	Rupganj	rupganj-union	2974	2026-05-10 15:55:54.094	2026-05-10 16:52:56.986	t	রূপগঞ্জ	Rupganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfypk0165w88ol16ux9r7	cmozwcwr0006a408o926j820b	Kayetpara	kayetpara-union	2975	2026-05-10 15:55:54.104	2026-05-10 16:52:56.992	t	কায়েতপাড়া	Kayetpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfypu0166w88ozj8yysgu	cmozwcwr0006a408o926j820b	Bholobo	bholobo-union	2976	2026-05-10 15:55:54.114	2026-05-10 16:52:56.999	t	ভোলাব	Bholobo	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyq60167w88opci9atbu	cmozwcwr7006b408o4eypid5n	Pirojpur	pirojpur-union-1	2977	2026-05-10 15:55:54.126	2026-05-10 16:52:57.005	t	পিরোজপুর	Pirojpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyqf0168w88o9zsfj31o	cmozwcwr7006b408o4eypid5n	Shambhupura	shambhupura-union	2978	2026-05-10 15:55:54.135	2026-05-10 16:52:57.011	t	শম্ভুপুরা	Shambhupura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyqp0169w88oqtaebzc1	cmozwcwr7006b408o4eypid5n	Mograpara	mograpara-union	2979	2026-05-10 15:55:54.145	2026-05-10 16:52:57.018	t	মোগরাপাড়া	Mograpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyr0016aw88odddd7q0h	cmozwcwr7006b408o4eypid5n	Baidyerbazar	baidyerbazar-union	2980	2026-05-10 15:55:54.156	2026-05-10 16:52:57.024	t	বৈদ্যেরবাজার	Baidyerbazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyr9016bw88o9313z8tp	cmozwcwr7006b408o4eypid5n	Baradi	baradi-union-1	2981	2026-05-10 15:55:54.165	2026-05-10 16:52:57.03	t	বারদী	Baradi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyrk016cw88o3lbdpo65	cmozwcwr7006b408o4eypid5n	Noagaon	noagaon-union	2982	2026-05-10 15:55:54.176	2026-05-10 16:52:57.036	t	নোয়াগাঁও	Noagaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyru016dw88o2mgntx0o	cmozwcwr7006b408o4eypid5n	Jampur	jampur-union	2983	2026-05-10 15:55:54.186	2026-05-10 16:52:57.042	t	জামপুর	Jampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfys4016ew88odckh9gd8	cmozwcwr7006b408o4eypid5n	Sadipur	sadipur-union-1	2984	2026-05-10 15:55:54.196	2026-05-10 16:52:57.048	t	সাদীপুর	Sadipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfysf016fw88osuagifiz	cmozwcwr7006b408o4eypid5n	Sonmandi	sonmandi-union	2985	2026-05-10 15:55:54.207	2026-05-10 16:52:57.055	t	সনমান্দি	Sonmandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyso016gw88ojuv2rd88	cmozwcwr7006b408o4eypid5n	Kanchpur	kanchpur-union	2986	2026-05-10 15:55:54.216	2026-05-10 16:52:57.061	t	কাচপুর	Kanchpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfysz016hw88oud2zo00r	cmozwcwuw006t408oupq979fg	Basail	basail-union	2987	2026-05-10 15:55:54.227	2026-05-10 16:52:57.067	t	বাসাইল	Basail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyt8016iw88oit471vjz	cmozwcwuw006t408oupq979fg	Kanchanpur	kanchanpur-union	2988	2026-05-10 15:55:54.236	2026-05-10 16:52:57.073	t	কাঞ্চনপুর	Kanchanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyti016jw88o05hn97fy	cmozwcwuw006t408oupq979fg	Habla	habla-union	2989	2026-05-10 15:55:54.246	2026-05-10 16:52:57.08	t	হাবলা	Habla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyts016kw88orn41s45n	cmozwcwuw006t408oupq979fg	Kashil	kashil-union	2990	2026-05-10 15:55:54.256	2026-05-10 16:52:57.086	t	কাশিল	Kashil	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyu0016lw88okcpmfphl	cmozwcwuw006t408oupq979fg	Fulki	fulki-union	2991	2026-05-10 15:55:54.264	2026-05-10 16:52:57.092	t	ফুলকি	Fulki	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyub016mw88o2hueelm7	cmozwcwuw006t408oupq979fg	Kauljani	kauljani-union	2992	2026-05-10 15:55:54.275	2026-05-10 16:52:57.098	t	কাউলজানী	Kauljani	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyuj016nw88o7ud3bc1j	cmozwcwv9006v408ohkxcnvaf	Deuli	deuli-union	2999	2026-05-10 15:55:54.283	2026-05-10 16:52:57.104	t	দেউলী	Deuli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyuu016ow88oh966xq5u	cmozwcwv9006v408ohkxcnvaf	Lauhati	lauhati-union	3000	2026-05-10 15:55:54.294	2026-05-10 16:52:57.11	t	লাউহাটি	Lauhati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyv3016pw88ocxzq1xmh	cmozwcwv9006v408ohkxcnvaf	Patharail	patharail-union	3001	2026-05-10 15:55:54.303	2026-05-10 16:52:57.116	t	পাথরাইল	Patharail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyks015ow88ow1uat6dt	cmozwcwqf0067408o019ziqr8	Kagkanda	kagkanda-union	2958	2026-05-10 15:55:53.932	2026-05-10 16:52:56.866	t	খাগকান্দা	Kagkanda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyl4015pw88o5fgag7sg	cmozwcwql0068408ogbgyptxy	Musapur	musapur-union-1	2959	2026-05-10 15:55:53.944	2026-05-10 16:52:56.874	t	মুছাপুর	Musapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyw6016tw88oaf4hh4r8	cmozwcwv9006v408ohkxcnvaf	Atia	atia-union	3005	2026-05-10 15:55:54.342	2026-05-10 16:52:57.144	t	আটিয়া	Atia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfywf016uw88opqv9h1hh	cmozwcwv9006v408ohkxcnvaf	Dubail	dubail-union	3006	2026-05-10 15:55:54.351	2026-05-10 16:52:57.151	t	ডুবাইল	Dubail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfywp016vw88o2y0ai027	cmozwcwvm006x408olvnsw3wm	Deulabari	deulabari-union	3007	2026-05-10 15:55:54.361	2026-05-10 16:52:57.158	t	দেউলাবাড়ী	Deulabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfywz016ww88o7ngvphh9	cmozwcwvm006x408olvnsw3wm	Ghatail	ghatail-union	3008	2026-05-10 15:55:54.371	2026-05-10 16:52:57.165	t	ঘাটাইল	Ghatail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyx8016xw88ocgt2mvyn	cmozwcwvm006x408olvnsw3wm	Jamuria	jamuria-union	3009	2026-05-10 15:55:54.38	2026-05-10 16:52:57.173	t	জামুরিয়া	Jamuria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyxi016yw88o4pq91eqr	cmozwcwvm006x408olvnsw3wm	Lokerpara	lokerpara-union	3010	2026-05-10 15:55:54.39	2026-05-10 16:52:57.18	t	লোকেরপাড়া	Lokerpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyxr016zw88oj7uz0pa2	cmozwcwvm006x408olvnsw3wm	Anehola	anehola-union	3011	2026-05-10 15:55:54.399	2026-05-10 16:52:57.188	t	আনেহলা	Anehola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyy20170w88ojtq6za82	cmozwcwvm006x408olvnsw3wm	Dighalkandia	dighalkandia-union	3012	2026-05-10 15:55:54.41	2026-05-10 16:52:57.196	t	দিঘলকান্দি	Dighalkandia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyya0171w88o76viej2e	cmozwcwvm006x408olvnsw3wm	Digar	digar-union	3013	2026-05-10 15:55:54.418	2026-05-10 16:52:57.203	t	দিগড়	Digar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyyk0172w88o50l6hsk0	cmozwcwvm006x408olvnsw3wm	Deopara	deopara-union	3014	2026-05-10 15:55:54.428	2026-05-10 16:52:57.21	t	দেওপাড়া	Deopara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyyu0173w88ohwjbuh9d	cmozwcwvm006x408olvnsw3wm	Sandhanpur	sandhanpur-union	3015	2026-05-10 15:55:54.438	2026-05-10 16:52:57.218	t	সন্ধানপুর	Sandhanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyz40174w88ohoocz2yt	cmozwcwvm006x408olvnsw3wm	Rasulpur	rasulpur-union-1	3016	2026-05-10 15:55:54.448	2026-05-10 16:52:57.225	t	রসুলপুর	Rasulpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyzf0175w88oe81yta5i	cmozwcwvm006x408olvnsw3wm	Dhalapara	dhalapara-union	3017	2026-05-10 15:55:54.459	2026-05-10 16:52:57.232	t	ধলাপাড়া	Dhalapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyzn0176w88o1o1qqw37	cmozwcwvs006y408oqcxlozud	Hadera	hadera-union	3018	2026-05-10 15:55:54.467	2026-05-10 16:52:57.239	t	হাদিরা	Hadera	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyzx0177w88ozft6cu7k	cmozwcwvs006y408oqcxlozud	Jhawail	jhawail-union	3019	2026-05-10 15:55:54.477	2026-05-10 16:52:57.246	t	ঝাওয়াইল	Jhawail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz060178w88okbr8fac3	cmozwcwvs006y408oqcxlozud	Nagdashimla	nagdashimla-union	3020	2026-05-10 15:55:54.486	2026-05-10 16:52:57.253	t	নগদাশিমলা	Nagdashimla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz0g0179w88omwejfzuv	cmozwcwvs006y408oqcxlozud	Dhopakandi	dhopakandi-union	3021	2026-05-10 15:55:54.496	2026-05-10 16:52:57.26	t	ধোপাকান্দি	Dhopakandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz0r017aw88osgnrwa60	cmozwcwvs006y408oqcxlozud	Alamnagor	alamnagor-union	3022	2026-05-10 15:55:54.507	2026-05-10 16:52:57.268	t	আলমনগর	Alamnagor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz10017bw88oolcm4bzu	cmozwcwvs006y408oqcxlozud	Hemnagor	hemnagor-union	3023	2026-05-10 15:55:54.516	2026-05-10 16:52:57.274	t	হেমনগর	Hemnagor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz1e017cw88o85sbujex	cmozwcwvs006y408oqcxlozud	Mirzapur	mirzapur-union-4	3024	2026-05-10 15:55:54.53	2026-05-10 16:52:57.281	t	মির্জাপুর	Mirzapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz1p017dw88ol0swrevv	cmozwcww50070408o0kao16s8	Alokdia	alokdia-union	3025	2026-05-10 15:55:54.541	2026-05-10 16:52:57.288	t	আলোকদিয়া	Alokdia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz1x017ew88osmctmxtf	cmozwcww50070408o0kao16s8	Aushnara	aushnara-union	3026	2026-05-10 15:55:54.549	2026-05-10 16:52:57.295	t	আউশনারা	Aushnara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz28017fw88osgie7uku	cmozwcww50070408o0kao16s8	Aronkhola	aronkhola-union	3027	2026-05-10 15:55:54.56	2026-05-10 16:52:57.302	t	অরণখোলা	Aronkhola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz2i017gw88oha514emb	cmozwcww50070408o0kao16s8	Sholakuri	sholakuri-union	3028	2026-05-10 15:55:54.57	2026-05-10 16:52:57.309	t	শোলাকুড়ি	Sholakuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz2r017hw88o6cq3naqx	cmozwcww50070408o0kao16s8	Golabari	golabari-union	3029	2026-05-10 15:55:54.579	2026-05-10 16:52:57.316	t	গোলাবাড়ী	Golabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz31017iw88opvbndv1i	cmozwcww50070408o0kao16s8	Mirjabari	mirjabari-union	3030	2026-05-10 15:55:54.589	2026-05-10 16:52:57.323	t	মির্জাবাড়ী	Mirjabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz3a017jw88oq21e4tui	cmozwcwwc0071408o1bgccsuy	Mahera	mahera-union	3031	2026-05-10 15:55:54.598	2026-05-10 16:52:57.33	t	মহেড়া	Mahera	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz3k017kw88ow9ytpowv	cmozwcwwc0071408o1bgccsuy	Jamurki	jamurki-union	3032	2026-05-10 15:55:54.608	2026-05-10 16:52:57.336	t	জামুর্কী	Jamurki	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz3u017lw88o8emc4h6t	cmozwcwwc0071408o1bgccsuy	Fatepur	fatepur-union-1	3033	2026-05-10 15:55:54.618	2026-05-10 16:52:57.342	t	ফতেপুর	Fatepur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz44017mw88op6q4fzbf	cmozwcwwc0071408o1bgccsuy	Banail	banail-union	3034	2026-05-10 15:55:54.629	2026-05-10 16:52:57.349	t	বানাইল	Banail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz4g017nw88oxa1scau0	cmozwcwwc0071408o1bgccsuy	Anaitara	anaitara-union	3035	2026-05-10 15:55:54.64	2026-05-10 16:52:57.356	t	আনাইতারা	Anaitara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz4p017ow88ori2a49h0	cmozwcwwc0071408o1bgccsuy	Warshi	warshi-union	3036	2026-05-10 15:55:54.649	2026-05-10 16:52:57.364	t	ওয়ার্শী	Warshi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz4z017pw88on3fkokbg	cmozwcwwc0071408o1bgccsuy	Bhatram	bhatram-union	3037	2026-05-10 15:55:54.659	2026-05-10 16:52:57.37	t	ভাতগ্রাম	Bhatram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz5h017rw88o2g3w5oh2	cmozwcwwc0071408o1bgccsuy	Gorai	gorai-union	3039	2026-05-10 15:55:54.677	2026-05-10 16:52:57.384	t	গোড়াই	Gorai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz5r017sw88oortr181j	cmozwcwwc0071408o1bgccsuy	Ajgana	ajgana-union	3040	2026-05-10 15:55:54.687	2026-05-10 16:52:57.392	t	আজগানা	Ajgana	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyvo016rw88o8siin50f	cmozwcwv9006v408ohkxcnvaf	Fazilhati	fazilhati-union	3003	2026-05-10 15:55:54.324	2026-05-10 16:52:57.13	t	ফাজিলহাটি	Fazilhati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyvw016sw88odxatszxh	cmozwcwv9006v408ohkxcnvaf	Elasin	elasin-union	3004	2026-05-10 15:55:54.332	2026-05-10 16:52:57.137	t	এলাসিন	Elasin	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz6u017ww88oe0gt3kx6	cmozwcwwc0071408o1bgccsuy	Latifpur	latifpur-union	3044	2026-05-10 15:55:54.726	2026-05-10 16:52:57.421	t	লতিফপুর	Latifpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz72017xw88oabkld2k7	cmozwcwwj0072408o27zha7cz	Bharra	bharra-union	3045	2026-05-10 15:55:54.734	2026-05-10 16:52:57.429	t	ভারড়া	Bharra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz7d017yw88ohzh10odn	cmozwcwwj0072408o27zha7cz	Sahabathpur	sahabathpur-union	3046	2026-05-10 15:55:54.745	2026-05-10 16:52:57.436	t	সহবতপুর	Sahabathpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz7m017zw88ombu1udqe	cmozwcwwj0072408o27zha7cz	Goyhata	goyhata-union	3047	2026-05-10 15:55:54.754	2026-05-10 16:52:57.443	t	গয়হাটা	Goyhata	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz7v0180w88ox98ehvh7	cmozwcwwj0072408o27zha7cz	Solimabad	solimabad-union	3048	2026-05-10 15:55:54.763	2026-05-10 16:52:57.451	t	সলিমাবাদ	Solimabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz850181w88oeiv0oggk	cmozwcwwj0072408o27zha7cz	Nagorpur	nagorpur-union	3049	2026-05-10 15:55:54.773	2026-05-10 16:52:57.458	t	নাগরপুর	Nagorpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz8e0182w88odu4vol0d	cmozwcwwj0072408o27zha7cz	Mamudnagor	mamudnagor-union	3050	2026-05-10 15:55:54.782	2026-05-10 16:52:57.465	t	মামুদনগর	Mamudnagor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz8o0183w88oakpnrjet	cmozwcwwj0072408o27zha7cz	Mokna	mokna-union	3051	2026-05-10 15:55:54.792	2026-05-10 16:52:57.472	t	মোকনা	Mokna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz8x0184w88oq3xjt52i	cmozwcwwj0072408o27zha7cz	Pakutia	pakutia-union	3052	2026-05-10 15:55:54.801	2026-05-10 16:52:57.479	t	পাকুটিয়া	Pakutia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz970185w88ox4rlw9ep	cmozwcwwj0072408o27zha7cz	Bekrah Atgram	bekrah-atgram-union	3053	2026-05-10 15:55:54.811	2026-05-10 16:52:57.485	t	বেকরা আটগ্রাম	Bekrah Atgram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz9h0186w88ofdukhh0a	cmozwcwwj0072408o27zha7cz	Dhuburia	dhuburia-union	3054	2026-05-10 15:55:54.821	2026-05-10 16:52:57.492	t	ধুবড়িয়া	Dhuburia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz9q0187w88oa1dt6457	cmozwcwwj0072408o27zha7cz	Bhadra	bhadra-union	3055	2026-05-10 15:55:54.83	2026-05-10 16:52:57.5	t	ভাদ্রা	Bhadra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfza00188w88orjfkzbe2	cmozwcwwj0072408o27zha7cz	Doptior	doptior-union	3056	2026-05-10 15:55:54.84	2026-05-10 16:52:57.506	t	দপ্তিয়র	Doptior	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfza90189w88of037nnz8	cmozwcwwq0073408ogwl4o7nk	Kakrajan	kakrajan-union	3057	2026-05-10 15:55:54.849	2026-05-10 16:52:57.513	t	কাকড়াজান	Kakrajan	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzaj018aw88o0si83xdj	cmozwcwwq0073408ogwl4o7nk	Gajaria	gajaria-union	3058	2026-05-10 15:55:54.859	2026-05-10 16:52:57.52	t	গজারিয়া	Gajaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzas018bw88od2x6o15i	cmozwcwwq0073408ogwl4o7nk	Jaduppur	jaduppur-union	3059	2026-05-10 15:55:54.868	2026-05-10 16:52:57.527	t	যাদবপুর	Jaduppur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzb2018cw88obttr48e2	cmozwcwwq0073408ogwl4o7nk	Hatibandha	hatibandha-union	3060	2026-05-10 15:55:54.878	2026-05-10 16:52:57.534	t	হাতীবান্ধা	Hatibandha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzbc018dw88of6ie3rg0	cmozwcwwq0073408ogwl4o7nk	Kalia	kalia-union	3061	2026-05-10 15:55:54.888	2026-05-10 16:52:57.541	t	কালিয়া	Kalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzbn018ew88oaggpaw84	cmozwcwwq0073408ogwl4o7nk	Dariapur	dariapur-union-2	3062	2026-05-10 15:55:54.899	2026-05-10 16:52:57.55	t	দরিয়াপুর	Dariapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzbx018fw88oedbpeuip	cmozwcwwq0073408ogwl4o7nk	Kalmegha	kalmegha-union	3063	2026-05-10 15:55:54.909	2026-05-10 16:52:57.558	t	কালমেঘা	Kalmegha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzc5018gw88oi74bvzto	cmozwcwwq0073408ogwl4o7nk	Baharatoil	baharatoil-union	3064	2026-05-10 15:55:54.917	2026-05-10 16:52:57.565	t	বহেড়াতৈল	Baharatoil	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzcf018hw88oj14fp3vq	cmozqxhyt0012zo8o5vb4ut4c	Mogra	mogra-union	3065	2026-05-10 15:55:54.927	2026-05-10 16:52:57.572	t	মগড়া	Mogra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzcs018iw88ofklnvvvj	cmozqxhyt0012zo8o5vb4ut4c	Gala	gala-union-1	3066	2026-05-10 15:55:54.94	2026-05-10 16:52:57.58	t	গালা	Gala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzd0018jw88ohuhb2mi2	cmozqxhyt0012zo8o5vb4ut4c	Gharinda	gharinda-union	3067	2026-05-10 15:55:54.948	2026-05-10 16:52:57.587	t	ঘারিন্দা	Gharinda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzdb018kw88ofxb553f3	cmozqxhyt0012zo8o5vb4ut4c	Karatia	karatia-union	3068	2026-05-10 15:55:54.959	2026-05-10 16:52:57.594	t	করটিয়া	Karatia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzdj018lw88oza24yupu	cmozqxhyt0012zo8o5vb4ut4c	Silimpur	silimpur-union	3069	2026-05-10 15:55:54.967	2026-05-10 16:52:57.601	t	ছিলিমপুর	Silimpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzdu018mw88oisckx8uk	cmozqxhyt0012zo8o5vb4ut4c	Porabari	porabari-union	3070	2026-05-10 15:55:54.978	2026-05-10 16:52:57.608	t	পোড়াবাড়ী	Porabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfze4018nw88o7clr4qvh	cmozqxhyt0012zo8o5vb4ut4c	Dyenna	dyenna-union	3071	2026-05-10 15:55:54.988	2026-05-10 16:52:57.615	t	দাইন্যা	Dyenna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzec018ow88osgsxc5ux	cmozqxhyt0012zo8o5vb4ut4c	Baghil	baghil-union	3072	2026-05-10 15:55:54.996	2026-05-10 16:52:57.622	t	বাঘিল	Baghil	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzen018pw88o747sjmog	cmozqxhyt0012zo8o5vb4ut4c	Kakua	kakua-union	3073	2026-05-10 15:55:55.007	2026-05-10 16:52:57.629	t	কাকুয়া	Kakua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzev018qw88oi2kcg1r5	cmozqxhyt0012zo8o5vb4ut4c	Hugra	hugra-union	3074	2026-05-10 15:55:55.015	2026-05-10 16:52:57.636	t	হুগড়া	Hugra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzf6018rw88ou0c2njq3	cmozqxhyt0012zo8o5vb4ut4c	Katuli	katuli-union	3075	2026-05-10 15:55:55.026	2026-05-10 16:52:57.643	t	কাতুলী	Katuli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzff018sw88oseoagl56	cmozqxhyt0012zo8o5vb4ut4c	Mahamudnagar	mahamudnagar-union	3076	2026-05-10 15:55:55.035	2026-05-10 16:52:57.65	t	মাহমুদনগর	Mahamudnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzfs018tw88os0u33ss3	cmozwcwvz006z408o9kvczxku	Durgapur	durgapur-union-3	3077	2026-05-10 15:55:55.048	2026-05-10 16:52:57.657	t	দুর্গাপুর	Durgapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzg2018uw88ordctecm6	cmozwcwvz006z408o9kvczxku	Birbashinda	birbashinda-union	3078	2026-05-10 15:55:55.058	2026-05-10 16:52:57.664	t	বীরবাসিন্দা	Birbashinda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz6a017uw88oy9vojp0q	cmozwcwwc0071408o1bgccsuy	Bastail	bastail-union	3042	2026-05-10 15:55:54.706	2026-05-10 16:52:57.406	t	বাঁশতৈল	Bastail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz6j017vw88odcvxfllm	cmozwcwwc0071408o1bgccsuy	Baora	baora-union	3043	2026-05-10 15:55:54.715	2026-05-10 16:52:57.414	t	ভাওড়া	Baora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzhe018zw88oit87p39e	cmozwcwvz006z408o9kvczxku	Salla	salla-union	3083	2026-05-10 15:55:55.106	2026-05-10 16:52:57.698	t	সল্লা	Salla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzhn0190w88o2vubfnxd	cmozwcwvz006z408o9kvczxku	Nagbari	nagbari-union	3084	2026-05-10 15:55:55.115	2026-05-10 16:52:57.705	t	নাগবাড়ী	Nagbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzhx0191w88ouxoud1r2	cmozwcwvz006z408o9kvczxku	Bangra	bangra-union	3085	2026-05-10 15:55:55.125	2026-05-10 16:52:57.712	t	বাংড়া	Bangra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzi50192w88o1pucw0yv	cmozwcwvz006z408o9kvczxku	Paikora	paikora-union	3086	2026-05-10 15:55:55.133	2026-05-10 16:52:57.718	t	পাইকড়া	Paikora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzig0193w88o3kqu3f5f	cmozwcwvz006z408o9kvczxku	Dashokia	dashokia-union	3087	2026-05-10 15:55:55.144	2026-05-10 16:52:57.725	t	দশকিয়া	Dashokia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzip0194w88ot6o4nub0	cmozwcwvz006z408o9kvczxku	Parkhi	parkhi-union	3088	2026-05-10 15:55:55.153	2026-05-10 16:52:57.732	t	পারখী	Parkhi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzja0196w88ov3fyhjo4	cmozwcwvf006w408o1w4vd82p	Dhopakhali	dhopakhali-union-1	3090	2026-05-10 15:55:55.174	2026-05-10 16:52:57.745	t	ধোপাখালী	Dhopakhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzji0197w88on8zspp7h	cmozwcwvf006w408o1w4vd82p	Paiska	paiska-union	3091	2026-05-10 15:55:55.182	2026-05-10 16:52:57.752	t	পাইস্কা	Paiska	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzjt0198w88own0akwer	cmozwcwvf006w408o1w4vd82p	Mushuddi	mushuddi-union	3092	2026-05-10 15:55:55.193	2026-05-10 16:52:57.759	t	মুশুদ্দি	Mushuddi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzk20199w88oidq3h9c7	cmozwcwvf006w408o1w4vd82p	Bolibodrow	bolibodrow-union	3093	2026-05-10 15:55:55.202	2026-05-10 16:52:57.767	t	বলিভদ্র	Bolibodrow	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzkc019aw88otmz7ff45	cmozwcwvf006w408o1w4vd82p	Birtara	birtara-union	3094	2026-05-10 15:55:55.212	2026-05-10 16:52:57.774	t	বীরতারা	Birtara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzkm019bw88o8rhyuuco	cmozwcwvf006w408o1w4vd82p	Baniajan	baniajan-union	3095	2026-05-10 15:55:55.222	2026-05-10 16:52:57.782	t	বানিয়াজান	Baniajan	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzku019cw88obag2xu92	cmozwcwvf006w408o1w4vd82p	Jadunathpur	jadunathpur-union	3096	2026-05-10 15:55:55.23	2026-05-10 16:52:57.79	t	যদুনাথপুর	Jadunathpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzl5019dw88o4j9hlyca	cmozwcwlo005g408o0nexocqx	Chawganga	chawganga-union	3097	2026-05-10 15:55:55.241	2026-05-10 16:52:57.797	t	চৌগাংগা	Chawganga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzld019ew88ospz4eagk	cmozwcwlo005g408o0nexocqx	Joysiddi	joysiddi-union	3098	2026-05-10 15:55:55.249	2026-05-10 16:52:57.804	t	জয়সিদ্ধি	Joysiddi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzlo019fw88od1220j8k	cmozwcwlo005g408o0nexocqx	Alonjori	alonjori-union	3099	2026-05-10 15:55:55.26	2026-05-10 16:52:57.812	t	এলংজুরী	Alonjori	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzlx019gw88odhykmz6x	cmozwcwlo005g408o0nexocqx	Badla	badla-union	3100	2026-05-10 15:55:55.269	2026-05-10 16:52:57.819	t	বাদলা	Badla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzm7019hw88on1qto2z4	cmozwcwlo005g408o0nexocqx	Boribari	boribari-union	3101	2026-05-10 15:55:55.279	2026-05-10 16:52:57.826	t	বড়িবাড়ি	Boribari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzmi019iw88o3eqj3jae	cmozwcwlo005g408o0nexocqx	Itna	itna-union-1	3102	2026-05-10 15:55:55.29	2026-05-10 16:52:57.833	t	ইটনা	Itna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzmq019jw88on4vddb4q	cmozwcwlo005g408o0nexocqx	Mriga	mriga-union	3103	2026-05-10 15:55:55.298	2026-05-10 16:52:57.84	t	মৃগা	Mriga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzn1019kw88oqpza4lpn	cmozwcwlo005g408o0nexocqx	Dhonpur	dhonpur-union	3104	2026-05-10 15:55:55.309	2026-05-10 16:52:57.847	t	ধনপুর	Dhonpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzna019lw88obbts02wv	cmozwcwlo005g408o0nexocqx	Raytoti	raytoti-union	3105	2026-05-10 15:55:55.318	2026-05-10 16:52:57.854	t	রায়টুটি	Raytoti	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfznk019mw88o0x7i500e	cmozwcwm1005i408okvy3qxz7	Banagram	banagram-union	3106	2026-05-10 15:55:55.328	2026-05-10 16:52:57.862	t	বনগ্রাম	Banagram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfznu019nw88ouie1plly	cmozwcwm1005i408okvy3qxz7	Shahasram Dhuldia	shahasram-dhuldia-union	3107	2026-05-10 15:55:55.338	2026-05-10 16:52:57.869	t	সহশ্রাম ধুলদিয়া	Shahasram Dhuldia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzo3019ow88ohvqpnvxj	cmozwcwm1005i408okvy3qxz7	Kargaon	kargaon-union	3108	2026-05-10 15:55:55.347	2026-05-10 16:52:57.876	t	কারগাঁও	Kargaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzof019pw88oyo8a1r4i	cmozwcwm1005i408okvy3qxz7	Chandpur	chandpur-union-2	3109	2026-05-10 15:55:55.359	2026-05-10 16:52:57.883	t	চান্দপুর	Chandpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzon019qw88oj9jepvp3	cmozwcwm1005i408okvy3qxz7	Mumurdia	mumurdia-union	3110	2026-05-10 15:55:55.367	2026-05-10 16:52:57.889	t	মুমুরদিয়া	Mumurdia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzoy019rw88okepg889h	cmozwcwm1005i408okvy3qxz7	Acmita	acmita-union	3111	2026-05-10 15:55:55.378	2026-05-10 16:52:57.896	t	আচমিতা	Acmita	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzp8019sw88o9kgj0ml6	cmozwcwm1005i408okvy3qxz7	Mosua	mosua-union	3112	2026-05-10 15:55:55.388	2026-05-10 16:52:57.903	t	মসূয়া	Mosua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzph019tw88orkcm5j60	cmozwcwm1005i408okvy3qxz7	Lohajuree	lohajuree-union	3113	2026-05-10 15:55:55.397	2026-05-10 16:52:57.91	t	লোহাজুরী	Lohajuree	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzpu019uw88o67gaugv9	cmozwcwm1005i408okvy3qxz7	Jalalpur	jalalpur-union-2	3114	2026-05-10 15:55:55.41	2026-05-10 16:52:57.917	t	জালালপুর	Jalalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzq3019vw88ovi6fcgu0	cmozwcwla005e408opz9mju4e	Sadekpur	sadekpur-union	3115	2026-05-10 15:55:55.419	2026-05-10 16:52:57.923	t	সাদেকপুর	Sadekpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzqc019ww88o86g87p5e	cmozwcwla005e408opz9mju4e	Aganagar	aganagar-union	3116	2026-05-10 15:55:55.428	2026-05-10 16:52:57.93	t	আগানগর	Aganagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzqn019xw88ohla0ijaz	cmozwcwla005e408opz9mju4e	Shimulkandi	shimulkandi-union	3117	2026-05-10 15:55:55.439	2026-05-10 16:52:57.937	t	শিমুলকান্দি	Shimulkandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzqx019yw88oxpgqep1c	cmozwcwla005e408opz9mju4e	Gajaria	gajaria-union-1	3118	2026-05-10 15:55:55.449	2026-05-10 16:52:57.944	t	গজারিয়া	Gajaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzgu018xw88ov18tvwhw	cmozwcwvz006z408o9kvczxku	Kokdahara	kokdahara-union	3081	2026-05-10 15:55:55.086	2026-05-10 16:52:57.684	t	কোকডহরা	Kokdahara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzh3018yw88o69ohjg21	cmozwcwvz006z408o9kvczxku	Balla	balla-union	3082	2026-05-10 15:55:55.095	2026-05-10 16:52:57.691	t	বল্লা	Balla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzs401a2w88oqvz8gjqt	cmozwcwn4005o408o2engn65t	Taljanga	taljanga-union	3122	2026-05-10 15:55:55.492	2026-05-10 16:52:57.973	t	তালজাঙ্গা	Taljanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzsd01a3w88oyypradkr	cmozwcwn4005o408o2engn65t	Rauti	rauti-union	3123	2026-05-10 15:55:55.501	2026-05-10 16:52:57.979	t	রাউতি	Rauti	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzso01a4w88owc9yb420	cmozwcwn4005o408o2engn65t	Dhola	dhola-union	3124	2026-05-10 15:55:55.512	2026-05-10 16:52:57.986	t	ধলা	Dhola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzsx01a5w88odpaj2499	cmozwcwn4005o408o2engn65t	Jawar	jawar-union	3125	2026-05-10 15:55:55.521	2026-05-10 16:52:57.993	t	জাওয়ার	Jawar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzt601a6w88o0mpni3dm	cmozwcwn4005o408o2engn65t	Damiha	damiha-union	3126	2026-05-10 15:55:55.53	2026-05-10 16:52:58	t	দামিহা	Damiha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzth01a7w88o09cxcdka	cmozwcwn4005o408o2engn65t	Digdair	digdair-union-1	3127	2026-05-10 15:55:55.541	2026-05-10 16:52:58.007	t	দিগদাইর	Digdair	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfztr01a8w88ogb8pauu0	cmozwcwn4005o408o2engn65t	Tarail-Sachail	tarail-sachail-union	3128	2026-05-10 15:55:55.551	2026-05-10 16:52:58.015	t	তাড়াইল-সাচাইল	Tarail-Sachail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzu101a9w88oh8ucxdt5	cmozwcwlh005f408o1wzruflg	Jinari	jinari-union	3129	2026-05-10 15:55:55.561	2026-05-10 16:52:58.022	t	জিনারী	Jinari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzub01aaw88o73gilne4	cmozwcwlh005f408o1wzruflg	Gobindapur	gobindapur-union	3130	2026-05-10 15:55:55.571	2026-05-10 16:52:58.029	t	গোবিন্দপুর	Gobindapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzuk01abw88o4zaevfkv	cmozwcwlh005f408o1wzruflg	Sidhla	sidhla-union	3131	2026-05-10 15:55:55.58	2026-05-10 16:52:58.036	t	সিদলা	Sidhla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzuu01acw88o3c6lqyvz	cmozwcwlh005f408o1wzruflg	Araibaria	araibaria-union	3132	2026-05-10 15:55:55.59	2026-05-10 16:52:58.043	t	আড়াইবাড়িয়া	Araibaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzv201adw88oh6ro98o1	cmozwcwlh005f408o1wzruflg	Sahedal	sahedal-union	3133	2026-05-10 15:55:55.598	2026-05-10 16:52:58.05	t	সাহেদল	Sahedal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzvd01aew88oyn70gmlr	cmozwcwlh005f408o1wzruflg	Pumdi	pumdi-union	3134	2026-05-10 15:55:55.609	2026-05-10 16:52:58.057	t	পুমদি	Pumdi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzvn01afw88os99g7o23	cmozwcwmx005n408og7ts9g6t	Jangalia	jangalia-union-1	3135	2026-05-10 15:55:55.619	2026-05-10 16:52:58.064	t	জাঙ্গালিয়া	Jangalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzvw01agw88ombnlgzr7	cmozwcwmx005n408og7ts9g6t	Hosendi	hosendi-union	3136	2026-05-10 15:55:55.628	2026-05-10 16:52:58.072	t	হোসেনদি	Hosendi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzw701ahw88osz92ljyr	cmozwcwmx005n408og7ts9g6t	Narandi	narandi-union	3137	2026-05-10 15:55:55.639	2026-05-10 16:52:58.079	t	নারান্দি	Narandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzwg01aiw88oja9ql2yv	cmozwcwmx005n408og7ts9g6t	Shukhia	shukhia-union	3138	2026-05-10 15:55:55.648	2026-05-10 16:52:58.086	t	সুখিয়া	Shukhia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzwy01akw88o368f53gm	cmozwcwmx005n408og7ts9g6t	Chandipasha	chandipasha-union	3140	2026-05-10 15:55:55.666	2026-05-10 16:52:58.1	t	চান্দিপাশা	Chandipasha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzx901alw88o4e1t3ock	cmozwcwmx005n408og7ts9g6t	Charfaradi	charfaradi-union	3141	2026-05-10 15:55:55.677	2026-05-10 16:52:58.106	t	চারফারাদি	Charfaradi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzxi01amw88ou5w6oqr9	cmozwcwmx005n408og7ts9g6t	Burudia	burudia-union	3142	2026-05-10 15:55:55.686	2026-05-10 16:52:58.114	t	বুড়ুদিয়া	Burudia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzxt01anw88oypi8zp51	cmozwcwmx005n408og7ts9g6t	Egarasindur	egarasindur-union	3143	2026-05-10 15:55:55.697	2026-05-10 16:52:58.12	t	ইজারাসিন্দুর	Egarasindur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzy401aow88oxid0u0yr	cmozwcwmx005n408og7ts9g6t	Pakundia	pakundia-union	3144	2026-05-10 15:55:55.708	2026-05-10 16:52:58.127	t	পাকন্দিয়া	Pakundia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzyc01apw88o1znh28h8	cmozwcwme005k408oygvx3ebd	Ramdi	ramdi-union	3145	2026-05-10 15:55:55.716	2026-05-10 16:52:58.134	t	রামদী	Ramdi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzyo01aqw88ob5ldo69h	cmozwcwme005k408oygvx3ebd	Osmanpur	osmanpur-union-1	3146	2026-05-10 15:55:55.728	2026-05-10 16:52:58.141	t	উছমানপুর	Osmanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzyy01arw88o1ic8nao0	cmozwcwme005k408oygvx3ebd	Chhaysuti	chhaysuti-union	3147	2026-05-10 15:55:55.738	2026-05-10 16:52:58.148	t	ছয়সূতী	Chhaysuti	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzz701asw88ow1zdwygi	cmozwcwme005k408oygvx3ebd	Salua	salua-union	3148	2026-05-10 15:55:55.747	2026-05-10 16:52:58.156	t	সালুয়া	Salua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzzh01atw88ou2kv266u	cmozwcwme005k408oygvx3ebd	Gobaria Abdullahpur	gobaria-abdullahpur-union	3149	2026-05-10 15:55:55.757	2026-05-10 16:52:58.164	t	গোবরিয়া আব্দুল্লাহপুর	Gobaria Abdullahpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzzq01auw88o7ix4s6as	cmozwcwme005k408oygvx3ebd	Faridpur	faridpur-union-1	3150	2026-05-10 15:55:55.766	2026-05-10 16:52:58.171	t	ফরিদপুর	Faridpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg00101avw88oul67fmlt	cmozwcwm7005j408oyox6ex8s	Rashidabad	rashidabad-union	3151	2026-05-10 15:55:55.777	2026-05-10 16:52:58.179	t	রশিদাবাদ	Rashidabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg00a01aww88o0ivqt7zz	cmozwcwm7005j408oyox6ex8s	Latibabad	latibabad-union	3152	2026-05-10 15:55:55.786	2026-05-10 16:52:58.186	t	লতিবাবাদ	Latibabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg00k01axw88o4hguyb5n	cmozwcwm7005j408oyox6ex8s	Maizkhapan	maizkhapan-union	3153	2026-05-10 15:55:55.796	2026-05-10 16:52:58.193	t	মাইজখাপন	Maizkhapan	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg00u01ayw88oyotp0eth	cmozwcwm7005j408oyox6ex8s	Mohinanda	mohinanda-union	3154	2026-05-10 15:55:55.806	2026-05-10 16:52:58.201	t	মহিনন্দ	Mohinanda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg01301azw88ozvysg4y8	cmozwcwm7005j408oyox6ex8s	Joshodal	joshodal-union	3155	2026-05-10 15:55:55.815	2026-05-10 16:52:58.209	t	যশোদল	Joshodal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg01d01b0w88oz1n6gab6	cmozwcwm7005j408oyox6ex8s	Bowlai	bowlai-union	3156	2026-05-10 15:55:55.825	2026-05-10 16:52:58.217	t	বৌলাই	Bowlai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg01l01b1w88o1v3arf5u	cmozwcwm7005j408oyox6ex8s	Binnati	binnati-union	3157	2026-05-10 15:55:55.833	2026-05-10 16:52:58.223	t	বিন্নাটি	Binnati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzri01a0w88oma8ppanm	cmozwcwla005e408opz9mju4e	Sreenagar	sreenagar-union-1	3120	2026-05-10 15:55:55.47	2026-05-10 16:52:57.957	t	শ্রীনগর	Sreenagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzru01a1w88o1qn7ldy2	cmozwcwla005e408opz9mju4e	Shibpur	shibpur-union-3	3121	2026-05-10 15:55:55.482	2026-05-10 16:52:57.965	t	শিবপুর	Shibpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg02z01b6w88ou35rgfp5	cmozwcwl4005d408oucxsbeun	Kailag	kailag-union	3173	2026-05-10 15:55:55.883	2026-05-10 16:52:58.258	t	কৈলাগ	Kailag	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg03901b7w88oebrfyumc	cmozwcwl4005d408oucxsbeun	Pirijpur	pirijpur-union	3174	2026-05-10 15:55:55.893	2026-05-10 16:52:58.266	t	পিরিজপুর	Pirijpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg03i01b8w88oe7cfgnd3	cmozwcwl4005d408oucxsbeun	Gazirchar	gazirchar-union	3175	2026-05-10 15:55:55.902	2026-05-10 16:52:58.272	t	গাজীরচর	Gazirchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg03s01b9w88oi2gqg8m5	cmozwcwl4005d408oucxsbeun	Hilochia	hilochia-union	3176	2026-05-10 15:55:55.912	2026-05-10 16:52:58.283	t	হিলচিয়া	Hilochia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg04201baw88oavoiqvbp	cmozwcwl4005d408oucxsbeun	Maijchar9	maijchar9-union	3177	2026-05-10 15:55:55.922	2026-05-10 16:52:58.292	t	মাইজচর	Maijchar9	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg04b01bbw88ohrncblnz	cmozwcwl4005d408oucxsbeun	Homypur	homypur-union	3178	2026-05-10 15:55:55.931	2026-05-10 16:52:58.3	t	হুমাইপর	Homypur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg04l01bcw88o3jivg89u	cmozwcwl4005d408oucxsbeun	Halimpur	halimpur-union	3179	2026-05-10 15:55:55.941	2026-05-10 16:52:58.306	t	হালিমপুর	Halimpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg04u01bdw88o315zxu2t	cmozwcwl4005d408oucxsbeun	Sararchar	sararchar-union	3180	2026-05-10 15:55:55.95	2026-05-10 16:52:58.313	t	সরারচর	Sararchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg05401bew88o2q0uwj3v	cmozwcwl4005d408oucxsbeun	Dilalpur	dilalpur-union	3181	2026-05-10 15:55:55.96	2026-05-10 16:52:58.321	t	দিলালপুর	Dilalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg05d01bfw88oo08fwm19	cmozwcwl4005d408oucxsbeun	Dighirpar	dighirpar-union	3182	2026-05-10 15:55:55.97	2026-05-10 16:52:58.329	t	দিঘীরপাড়	Dighirpar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg05n01bgw88oprwrryhh	cmozwcwl4005d408oucxsbeun	Boliardi	boliardi-union	3183	2026-05-10 15:55:55.979	2026-05-10 16:52:58.337	t	বলিয়ার্দী	Boliardi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg05x01bhw88ocqqfv9ou	cmozwcwkx005c408oxuzbfz5w	Dewghar	dewghar-union	3184	2026-05-10 15:55:55.989	2026-05-10 16:52:58.347	t	দেওঘর	Dewghar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg06601biw88o6898v5db	cmozwcwkx005c408oxuzbfz5w	Kastul	kastul-union	3185	2026-05-10 15:55:55.998	2026-05-10 16:52:58.357	t	কাস্তুল	Kastul	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg06g01bjw88o217p8iq1	cmozwcwkx005c408oxuzbfz5w	Austagram Sadar	austagram-sadar-union	3186	2026-05-10 15:55:56.008	2026-05-10 16:52:58.365	t	অষ্টগ্রাম সদর	Austagram Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg06o01bkw88o2s9ytgm1	cmozwcwkx005c408oxuzbfz5w	Bangalpara	bangalpara-union	3187	2026-05-10 15:55:56.016	2026-05-10 16:52:58.372	t	বাঙ্গালপাড়া	Bangalpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg07001blw88o0mhi5l4m	cmozwcwkx005c408oxuzbfz5w	Kalma	kalma-union-2	3188	2026-05-10 15:55:56.028	2026-05-10 16:52:58.379	t	কলমা	Kalma	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg07c01bmw88okvgjnn0d	cmozwcwkx005c408oxuzbfz5w	Adampur	adampur-union	3189	2026-05-10 15:55:56.04	2026-05-10 16:52:58.385	t	আদমপুর	Adampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg07u01bow88og4zzbbu9	cmozwcwkx005c408oxuzbfz5w	Purba Austagram	purba-austagram-union	3191	2026-05-10 15:55:56.058	2026-05-10 16:52:58.398	t	পূর্ব অষ্টগ্রাম	Purba Austagram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg08201bpw88o4n97qprq	cmozwcwmr005m408o2z8ydedn	Chatirchar	chatirchar-union	3199	2026-05-10 15:55:56.066	2026-05-10 16:52:58.405	t	ছাতিরচর	Chatirchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg08d01bqw88o375e3zr7	cmozwcwmr005m408o2z8ydedn	Guroi	guroi-union	3200	2026-05-10 15:55:56.077	2026-05-10 16:52:58.411	t	গুরই	Guroi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg08n01brw88o7xknnd1w	cmozwcwmr005m408o2z8ydedn	Jaraitala	jaraitala-union	3201	2026-05-10 15:55:56.087	2026-05-10 16:52:58.418	t	জারইতলা	Jaraitala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg08w01bsw88ozaftt6wl	cmozwcwmr005m408o2z8ydedn	Nikli Sadar	nikli-sadar-union	3202	2026-05-10 15:55:56.096	2026-05-10 16:52:58.424	t	নিকলী সদর	Nikli Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg09601btw88oa4svwhz6	cmozwcwmr005m408o2z8ydedn	Karpasa	karpasa-union	3203	2026-05-10 15:55:56.106	2026-05-10 16:52:58.43	t	কারপাশা	Karpasa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg09f01buw88of3x63uvg	cmozwcwmr005m408o2z8ydedn	Dampara	dampara-union	3204	2026-05-10 15:55:56.115	2026-05-10 16:52:58.437	t	দামপাড়া	Dampara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg09p01bvw88o35wwmmya	cmozwcwmr005m408o2z8ydedn	Singpur	singpur-union	3205	2026-05-10 15:55:56.125	2026-05-10 16:52:58.443	t	সিংপুর	Singpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg09z01bww88oytvbjt9s	cmozwcwoi005w408obhoh7xmb	Balla	balla-union-1	3206	2026-05-10 15:55:56.135	2026-05-10 16:52:58.449	t	বাল্লা	Balla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0ab01bxw88of1q0yzro	cmozwcwoi005w408obhoh7xmb	Gala	gala-union-2	3207	2026-05-10 15:55:56.147	2026-05-10 16:52:58.455	t	গালা	Gala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0al01byw88or8q7q520	cmozwcwoi005w408obhoh7xmb	Chala	chala-union	3208	2026-05-10 15:55:56.157	2026-05-10 16:52:58.461	t	চালা	Chala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0au01bzw88okd4yowub	cmozwcwoi005w408obhoh7xmb	Blara	blara-union	3209	2026-05-10 15:55:56.166	2026-05-10 16:52:58.468	t	বলড়া	Blara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0b501c0w88ol5jylifl	cmozwcwoi005w408obhoh7xmb	Harukandi	harukandi-union	3210	2026-05-10 15:55:56.177	2026-05-10 16:52:58.475	t	হারুকান্দি	Harukandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0be01c1w88omx2ge0b6	cmozwcwoi005w408obhoh7xmb	Baira	baira-union	3211	2026-05-10 15:55:56.186	2026-05-10 16:52:58.481	t	বয়রা	Baira	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0bo01c2w88odrufnppg	cmozwcwoi005w408obhoh7xmb	Ramkrishnapur	ramkrishnapur-union	3212	2026-05-10 15:55:56.196	2026-05-10 16:52:58.488	t	রামকৃঞ্চপুর	Ramkrishnapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0bz01c3w88o3mjqksqw	cmozwcwoi005w408obhoh7xmb	Gopinathpur	gopinathpur-union-1	3213	2026-05-10 15:55:56.207	2026-05-10 16:52:58.495	t	গোপীনাথপুর	Gopinathpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0c801c4w88o2b22nbjy	cmozwcwoi005w408obhoh7xmb	Kanchanpur	kanchanpur-union-1	3214	2026-05-10 15:55:56.216	2026-05-10 16:52:58.502	t	কাঞ্চনপুর	Kanchanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg02g01b4w88ojyclolfz	cmozwcwm7005j408oyox6ex8s	Karshakarial	karshakarial-union	3160	2026-05-10 15:55:55.864	2026-05-10 16:52:58.245	t	কর্শাকড়িয়াইল	Karshakarial	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg02r01b5w88oedypjvlv	cmozwcwm7005j408oyox6ex8s	Danapatuli	danapatuli-union	3161	2026-05-10 15:55:55.875	2026-05-10 16:52:58.252	t	দানাপাটুলী	Danapatuli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0dk01c8w88oc0siajvj	cmozwcwoi005w408obhoh7xmb	Azimnagar	azimnagar-union	3218	2026-05-10 15:55:56.264	2026-05-10 16:52:58.531	t	আজিমনগর	Azimnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0dw01c9w88ogosxzy1f	cmozwcwou005y408o46q3ue0n	Baried	baried-union	3219	2026-05-10 15:55:56.276	2026-05-10 16:52:58.538	t	বরাইদ	Baried	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0e601caw88ojd5ftvz7	cmozwcwou005y408o46q3ue0n	Dighulia	dighulia-union	3220	2026-05-10 15:55:56.286	2026-05-10 16:52:58.545	t	দিঘুলিয়া	Dighulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0eh01cbw88ohf0u4f4j	cmozwcwou005y408o46q3ue0n	Baliyati	baliyati-union	3221	2026-05-10 15:55:56.297	2026-05-10 16:52:58.552	t	বালিয়াটি	Baliyati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0et01ccw88o9kqe5ehh	cmozwcwou005y408o46q3ue0n	Dargram	dargram-union	3222	2026-05-10 15:55:56.309	2026-05-10 16:52:58.559	t	দড়গ্রাম	Dargram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0f101cdw88opyje0cwh	cmozwcwou005y408o46q3ue0n	Tilli	tilli-union	3223	2026-05-10 15:55:56.317	2026-05-10 16:52:58.567	t	তিল্লী	Tilli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0fa01cew88of80glay2	cmozwcwou005y408o46q3ue0n	Hargaj	hargaj-union	3224	2026-05-10 15:55:56.326	2026-05-10 16:52:58.573	t	হরগজ	Hargaj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0fs01cgw88oj9yyu018	cmozwcwou005y408o46q3ue0n	Dhankora	dhankora-union	3226	2026-05-10 15:55:56.344	2026-05-10 16:52:58.587	t	ধানকোড়া	Dhankora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0g101chw88oyxclv4vl	cmozwcwou005y408o46q3ue0n	Fukurhati	fukurhati-union	3227	2026-05-10 15:55:56.353	2026-05-10 16:52:58.594	t	ফুকুরহাটি	Fukurhati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0ga01ciw88o7evaixxe	cmozwcwoo005x408opthked81	Betila-Mitara	betila-mitara-union	3228	2026-05-10 15:55:56.362	2026-05-10 16:52:58.601	t	বেতিলা-মিতরা	Betila-Mitara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0gk01cjw88o469nuysw	cmozwcwoo005x408opthked81	Jagir	jagir-union	3229	2026-05-10 15:55:56.372	2026-05-10 16:52:58.608	t	জাগীর	Jagir	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0gs01ckw88or0bh9tar	cmozwcwoo005x408opthked81	Atigram	atigram-union	3230	2026-05-10 15:55:56.38	2026-05-10 16:52:58.615	t	আটিগ্রাম	Atigram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0h301clw88ous2drbe3	cmozwcwoo005x408opthked81	Dighi	dighi-union	3231	2026-05-10 15:55:56.391	2026-05-10 16:52:58.621	t	দিঘী	Dighi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0hb01cmw88od20pj3e9	cmozwcwoo005x408opthked81	Putile	putile-union	3232	2026-05-10 15:55:56.399	2026-05-10 16:52:58.628	t	পুটাইল	Putile	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0hl01cnw88ow5y0aywx	cmozwcwoo005x408opthked81	Hatipara	hatipara-union	3233	2026-05-10 15:55:56.409	2026-05-10 16:52:58.635	t	হাটিপাড়া	Hatipara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0ht01cow88oes2c68mq	cmozwcwoo005x408opthked81	Vararia	vararia-union	3234	2026-05-10 15:55:56.417	2026-05-10 16:52:58.641	t	ভাড়ারিয়া	Vararia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0i301cpw88om4q9rowj	cmozwcwoo005x408opthked81	Nbogram	nbogram-union	3235	2026-05-10 15:55:56.427	2026-05-10 16:52:58.648	t	নবগ্রাম	Nbogram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0ic01cqw88oqo4jrnub	cmozwcwoo005x408opthked81	Garpara	garpara-union	3236	2026-05-10 15:55:56.436	2026-05-10 16:52:58.655	t	গড়পাড়া	Garpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0in01crw88o4s0bv7qy	cmozwcwoo005x408opthked81	Krishnapur	krishnapur-union-1	3237	2026-05-10 15:55:56.447	2026-05-10 16:52:58.661	t	কৃঞ্চপুর	Krishnapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0ix01csw88og6qjknoh	cmozwcwha004u408ojw3mld1b	Savar	savar-union	3271	2026-05-10 15:55:56.457	2026-05-10 16:52:58.668	t	সাভার	Savar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0j501ctw88oztj2pqh9	cmozwcwha004u408ojw3mld1b	Birulia	birulia-union	3272	2026-05-10 15:55:56.465	2026-05-10 16:52:58.674	t	বিরুলিয়া	Birulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0jg01cuw88ofkv1u19i	cmozwcwha004u408ojw3mld1b	Dhamsona	dhamsona-union	3273	2026-05-10 15:55:56.476	2026-05-10 16:52:58.68	t	ধামসোনা	Dhamsona	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0jq01cvw88oe5mtmjx4	cmozwcwha004u408ojw3mld1b	Shimulia	shimulia-union-1	3274	2026-05-10 15:55:56.486	2026-05-10 16:52:58.687	t	শিমুলিয়া	Shimulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0k101cww88oz5p4mhdv	cmozwcwha004u408ojw3mld1b	Ashulia	ashulia-union-1	3275	2026-05-10 15:55:56.497	2026-05-10 16:52:58.693	t	আশুলিয়া	Ashulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0kc01cxw88oxdt56qnv	cmozwcwha004u408ojw3mld1b	Yearpur	yearpur-union	3276	2026-05-10 15:55:56.508	2026-05-10 16:52:58.699	t	ইয়ারপুর	Yearpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0kk01cyw88offq19rfq	cmozwcwha004u408ojw3mld1b	Vakurta	vakurta-union	3277	2026-05-10 15:55:56.516	2026-05-10 16:52:58.705	t	ভাকুর্তা	Vakurta	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0kv01czw88o28jzdz13	cmozwcwha004u408ojw3mld1b	Pathalia	pathalia-union	3278	2026-05-10 15:55:56.527	2026-05-10 16:52:58.712	t	পাথালিয়া	Pathalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0l501d0w88oplyt985o	cmozwcwha004u408ojw3mld1b	Bongaon	bongaon-union	3279	2026-05-10 15:55:56.537	2026-05-10 16:52:58.718	t	বনগাঁও	Bongaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0le01d1w88o3418w4ew	cmozwcwha004u408ojw3mld1b	Kaundia	kaundia-union	3280	2026-05-10 15:55:56.546	2026-05-10 16:52:58.724	t	কাউন্দিয়া	Kaundia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0lp01d2w88oxh3wysnq	cmozwcwha004u408ojw3mld1b	Tetuljhora	tetuljhora-union	3281	2026-05-10 15:55:56.557	2026-05-10 16:52:58.73	t	তেঁতুলঝোড়া	Tetuljhora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0lx01d3w88oiwgxl0pc	cmozwcwha004u408ojw3mld1b	Aminbazar	aminbazar-union	3282	2026-05-10 15:55:56.565	2026-05-10 16:52:58.736	t	আমিনবাজার	Aminbazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0m801d4w88osjgfh571	cmozwcwgl004q408o0mdrfb9l	Chauhat	chauhat-union	3283	2026-05-10 15:55:56.576	2026-05-10 16:52:58.742	t	চৌহাট	Chauhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0mg01d5w88o4efk4k96	cmozwcwgl004q408o0mdrfb9l	Amta	amta-union	3284	2026-05-10 15:55:56.584	2026-05-10 16:52:58.749	t	আমতা	Amta	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0mq01d6w88okie5c14n	cmozwcwgl004q408o0mdrfb9l	Balia	balia-union	3285	2026-05-10 15:55:56.595	2026-05-10 16:52:58.756	t	বালিয়া	Balia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0n001d7w88oirwmap0m	cmozwcwgl004q408o0mdrfb9l	Jadabpur	jadabpur-union	3286	2026-05-10 15:55:56.604	2026-05-10 16:52:58.763	t	যাদবপুর	Jadabpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0n901d8w88ojh11nze8	cmozwcwgl004q408o0mdrfb9l	Baisakanda	baisakanda-union	3287	2026-05-10 15:55:56.613	2026-05-10 16:52:58.77	t	বাইশাকান্দা	Baisakanda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0cx01c6w88okshsy2w1	cmozwcwoi005w408obhoh7xmb	Sutalorie	sutalorie-union	3216	2026-05-10 15:55:56.241	2026-05-10 16:52:58.516	t	সুতালড়ী	Sutalorie	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0d801c7w88oktgajeob	cmozwcwoi005w408obhoh7xmb	Dhulsura	dhulsura-union	3217	2026-05-10 15:55:56.252	2026-05-10 16:52:58.523	t	ধূলশুড়া	Dhulsura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0od01dcw88ooavb7f2h	cmozwcwgl004q408o0mdrfb9l	Sutipara	sutipara-union	3291	2026-05-10 15:55:56.653	2026-05-10 16:52:58.795	t	সূতিপাড়া	Sutipara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0on01ddw88ogfx95784	cmozwcwgl004q408o0mdrfb9l	Sombhag	sombhag-union	3292	2026-05-10 15:55:56.663	2026-05-10 16:52:58.801	t	সোমভাগ	Sombhag	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0oy01dew88oaujd30e1	cmozwcwgl004q408o0mdrfb9l	Vararia	vararia-union-1	3293	2026-05-10 15:55:56.674	2026-05-10 16:52:58.807	t	ভাড়ারিয়া	Vararia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0p601dfw88oz5wikio6	cmozwcwgl004q408o0mdrfb9l	Dhamrai	dhamrai-union	3294	2026-05-10 15:55:56.682	2026-05-10 16:52:58.814	t	ধামরাই	Dhamrai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0ph01dgw88o5t8pnyzf	cmozwcwgl004q408o0mdrfb9l	Kulla	kulla-union	3295	2026-05-10 15:55:56.693	2026-05-10 16:52:58.82	t	কুল্লা	Kulla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0pq01dhw88ooiausrw2	cmozwcwgl004q408o0mdrfb9l	Rowail	rowail-union	3296	2026-05-10 15:55:56.702	2026-05-10 16:52:58.826	t	রোয়াইল	Rowail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0q001diw88o5cbd9yyd	cmozwcwgl004q408o0mdrfb9l	Suapur	suapur-union	3297	2026-05-10 15:55:56.712	2026-05-10 16:52:58.833	t	সুয়াপুর	Suapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0qa01djw88oydfsvobh	cmozwcwgl004q408o0mdrfb9l	Nannar	nannar-union	3298	2026-05-10 15:55:56.722	2026-05-10 16:52:58.839	t	নান্নার	Nannar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0qi01dkw88o4fi18d8k	cmozwcwgx004s408owcn9irxo	Hazratpur	hazratpur-union	3299	2026-05-10 15:55:56.73	2026-05-10 16:52:58.846	t	হযরতপুর	Hazratpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0qs01dlw88oxxbirosz	cmozwcwgx004s408owcn9irxo	Kalatia	kalatia-union	3300	2026-05-10 15:55:56.74	2026-05-10 16:52:58.853	t	কলাতিয়া	Kalatia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0r101dmw88okh0j4lyo	cmozwcwgx004s408owcn9irxo	Taranagar	taranagar-union	3301	2026-05-10 15:55:56.749	2026-05-10 16:52:58.86	t	তারানগর	Taranagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0rb01dnw88okb3ms7v5	cmozwcwgx004s408owcn9irxo	Sakta	sakta-union	3302	2026-05-10 15:55:56.759	2026-05-10 16:52:58.867	t	শাক্তা	Sakta	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0rj01dow88ohcwalmjq	cmozwcwgx004s408owcn9irxo	Ruhitpur	ruhitpur-union	3303	2026-05-10 15:55:56.767	2026-05-10 16:52:58.874	t	রোহিতপুর	Ruhitpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0rt01dpw88onxr0wk2n	cmozwcwgx004s408owcn9irxo	Basta	basta-union	3304	2026-05-10 15:55:56.777	2026-05-10 16:52:58.88	t	বাস্তা	Basta	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0s201dqw88o9d0tc4lf	cmozwcwgx004s408owcn9irxo	Kalindi	kalindi-union	3305	2026-05-10 15:55:56.786	2026-05-10 16:52:58.886	t	কালিন্দি	Kalindi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0sc01drw88o2ew6bdvw	cmozwcwgx004s408owcn9irxo	Zinzira	zinzira-union	3306	2026-05-10 15:55:56.796	2026-05-10 16:52:58.893	t	জিনজিরা	Zinzira	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0sn01dsw88oqyau97l1	cmozwcwgx004s408owcn9irxo	Suvadda	suvadda-union	3307	2026-05-10 15:55:56.807	2026-05-10 16:52:58.899	t	শুভাঢ্যা	Suvadda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0sv01dtw88otdb5jye4	cmozwcwgx004s408owcn9irxo	Taghoria	taghoria-union	3308	2026-05-10 15:55:56.815	2026-05-10 16:52:58.906	t	তেঘরিয়া	Taghoria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0t601duw88o9xje6bys	cmozwcwgx004s408owcn9irxo	Konda	konda-union	3309	2026-05-10 15:55:56.826	2026-05-10 16:52:58.912	t	কোন্ডা	Konda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0tg01dvw88o7m40cfau	cmozwcwgx004s408owcn9irxo	Aganagar	aganagar-union-1	3310	2026-05-10 15:55:56.836	2026-05-10 16:52:58.919	t	আগানগর	Aganagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0tp01dww88o6aod68rb	cmozwcwh3004t408ohe7hj3xu	Shikaripara	shikaripara-union	3311	2026-05-10 15:55:56.845	2026-05-10 16:52:58.925	t	শিকারীপাড়া	Shikaripara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0tz01dxw88osq9l68og	cmozwcwh3004t408ohe7hj3xu	Joykrishnapur	joykrishnapur-union	3312	2026-05-10 15:55:56.855	2026-05-10 16:52:58.931	t	জয়কৃষ্ণপুর	Joykrishnapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0u701dyw88oldq2esv5	cmozwcwh3004t408ohe7hj3xu	Baruakhali	baruakhali-union	3313	2026-05-10 15:55:56.863	2026-05-10 16:52:58.938	t	বারুয়াখালী	Baruakhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0ui01dzw88oifg51a5u	cmozwcwh3004t408ohe7hj3xu	Nayansree	nayansree-union	3314	2026-05-10 15:55:56.874	2026-05-10 16:52:58.944	t	নয়নশ্রী	Nayansree	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0uq01e0w88ozafy9amz	cmozwcwh3004t408ohe7hj3xu	Sholla	sholla-union	3315	2026-05-10 15:55:56.882	2026-05-10 16:52:58.951	t	শোল্লা	Sholla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0v201e1w88oahdzwzwi	cmozwcwh3004t408ohe7hj3xu	Jantrail	jantrail-union	3316	2026-05-10 15:55:56.894	2026-05-10 16:52:58.957	t	যন্ত্রাইল	Jantrail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0vb01e2w88otyqunhw9	cmozwcwh3004t408ohe7hj3xu	Bandura	bandura-union	3317	2026-05-10 15:55:56.903	2026-05-10 16:52:58.964	t	বান্দুরা	Bandura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0vk01e3w88oih3fbd1k	cmozwcwh3004t408ohe7hj3xu	Kalakopa	kalakopa-union	3318	2026-05-10 15:55:56.912	2026-05-10 16:52:58.97	t	কলাকোপা	Kalakopa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0vu01e4w88opu8klar5	cmozwcwh3004t408ohe7hj3xu	Bakshanagar	bakshanagar-union	3319	2026-05-10 15:55:56.922	2026-05-10 16:52:58.977	t	বক্সনগর	Bakshanagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0w301e5w88ohz4ed63f	cmozwcwh3004t408ohe7hj3xu	Barrah	barrah-union	3320	2026-05-10 15:55:56.931	2026-05-10 16:52:58.984	t	বাহ্রা	Barrah	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0wd01e6w88ofu0q83hj	cmozwcwh3004t408ohe7hj3xu	Kailail	kailail-union	3321	2026-05-10 15:55:56.941	2026-05-10 16:52:58.99	t	কৈলাইল	Kailail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0wm01e7w88omf929guz	cmozwcwh3004t408ohe7hj3xu	Agla	agla-union	3322	2026-05-10 15:55:56.95	2026-05-10 16:52:58.996	t	আগলা	Agla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0ww01e8w88o4isfrbyo	cmozwcwh3004t408ohe7hj3xu	Galimpur	galimpur-union	3323	2026-05-10 15:55:56.96	2026-05-10 16:52:59.003	t	গালিমপুর	Galimpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0x501e9w88otqce62gf	cmozwcwh3004t408ohe7hj3xu	Churain	churain-union	3324	2026-05-10 15:55:56.969	2026-05-10 16:52:59.009	t	চুড়াইন	Churain	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0xe01eaw88og12pl1j1	cmozwcwgr004r408od4cx7vnr	Nayabari	nayabari-union	3325	2026-05-10 15:55:56.978	2026-05-10 16:52:59.015	t	নয়াবাড়ী	Nayabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0xo01ebw88o64twuaea	cmozwcwgr004r408od4cx7vnr	Kusumhathi	kusumhathi-union	3326	2026-05-10 15:55:56.988	2026-05-10 16:52:59.021	t	কুসুমহাটি	Kusumhathi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0o301dbw88oln778btt	cmozwcwgl004q408o0mdrfb9l	Sanora	sanora-union	3290	2026-05-10 15:55:56.643	2026-05-10 16:52:58.789	t	সানোড়া	Sanora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0yp01efw88o8ohk5zrg	cmozwcwgr004r408od4cx7vnr	Muksudpur	muksudpur-union	3330	2026-05-10 15:55:57.025	2026-05-10 16:52:59.046	t	মুকসুদপুর	Muksudpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0z001egw88op9ndss7y	cmozwcwgr004r408od4cx7vnr	Mahmudpur	mahmudpur-union-2	3331	2026-05-10 15:55:57.036	2026-05-10 16:52:59.053	t	মাহমুদপুর	Mahmudpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0zb01ehw88ozpv9yfg2	cmozwcwgr004r408od4cx7vnr	Bilaspur	bilaspur-union-1	3332	2026-05-10 15:55:57.047	2026-05-10 16:52:59.059	t	বিলাসপুর	Bilaspur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0zm01eiw88o2auybq5p	cmozwcwpq0063408ofl7p0f6j	Rampal	rampal-union-1	3333	2026-05-10 15:55:57.058	2026-05-10 16:52:59.066	t	রামপাল	Rampal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0zu01ejw88o85xhn2zf	cmozwcwpq0063408ofl7p0f6j	Panchashar	panchashar-union	3334	2026-05-10 15:55:57.066	2026-05-10 16:52:59.072	t	পঞ্চসার	Panchashar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg10501ekw88ov1ahw5vo	cmozwcwpq0063408ofl7p0f6j	Bajrajogini	bajrajogini-union	3335	2026-05-10 15:55:57.077	2026-05-10 16:52:59.079	t	বজ্রযোগিনী	Bajrajogini	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg10e01elw88ooj0kynjo	cmozwcwpq0063408ofl7p0f6j	Mohakali	mohakali-union	3336	2026-05-10 15:55:57.086	2026-05-10 16:52:59.085	t	মহাকালী	Mohakali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg10o01emw88ors8cyyv7	cmozwcwpq0063408ofl7p0f6j	Charkewar	charkewar-union	3337	2026-05-10 15:55:57.096	2026-05-10 16:52:59.091	t	চরকেওয়ার	Charkewar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg10y01enw88o676u0phj	cmozwcwpq0063408ofl7p0f6j	Mollakandi	mollakandi-union	3338	2026-05-10 15:55:57.106	2026-05-10 16:52:59.097	t	মোল্লাকান্দি	Mollakandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg11701eow88o0tfk3zpu	cmozwcwpq0063408ofl7p0f6j	Adhara	adhara-union	3339	2026-05-10 15:55:57.115	2026-05-10 16:52:59.103	t	আধারা	Adhara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg11h01epw88ounr192re	cmozwcwpq0063408ofl7p0f6j	Shiloy	shiloy-union	3340	2026-05-10 15:55:57.125	2026-05-10 16:52:59.11	t	শিলই	Shiloy	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg11r01eqw88oaax35x6e	cmozwcwpq0063408ofl7p0f6j	Banglabazar	banglabazar-union-1	3341	2026-05-10 15:55:57.135	2026-05-10 16:52:59.116	t	বাংলাবাজার	Banglabazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg12001erw88ol1vpx2eg	cmozwcwq20065408opkldguln	Baraikhali	baraikhali-union	3342	2026-05-10 15:55:57.144	2026-05-10 16:52:59.122	t	বাড়েখাল	Baraikhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg12a01esw88onev9x3p8	cmozwcwq20065408opkldguln	Hashara	hashara-union	3343	2026-05-10 15:55:57.154	2026-05-10 16:52:59.128	t	হাসাড়া	Hashara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg12j01etw88oa3tqa40w	cmozwcwq20065408opkldguln	Birtara	birtara-union-1	3344	2026-05-10 15:55:57.163	2026-05-10 16:52:59.135	t	বাড়তারা	Birtara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg12u01euw88osp3awwf5	cmozwcwq20065408opkldguln	Shologhor	shologhor-union	3345	2026-05-10 15:55:57.174	2026-05-10 16:52:59.141	t	ষোলঘর	Shologhor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg13401evw88o0gy8c5sa	cmozwcwq20065408opkldguln	Sreenagar	sreenagar-union-2	3346	2026-05-10 15:55:57.184	2026-05-10 16:52:59.148	t	শ্রীনগর	Sreenagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg13e01eww88odtkfwous	cmozwcwq20065408opkldguln	Patabhog	patabhog-union	3347	2026-05-10 15:55:57.194	2026-05-10 16:52:59.154	t	পাঢাভোগ	Patabhog	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg13n01exw88o9c9w5f4q	cmozwcwq20065408opkldguln	Shamshiddi	shamshiddi-union	3348	2026-05-10 15:55:57.203	2026-05-10 16:52:59.16	t	শ্যামসিদ্দি	Shamshiddi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg13w01eyw88otikwqrop	cmozwcwq20065408opkldguln	Kolapara	kolapara-union	3349	2026-05-10 15:55:57.212	2026-05-10 16:52:59.167	t	কুলাপাড়া	Kolapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg14601ezw88om6l3mhv2	cmozwcwq20065408opkldguln	Vaggakol	vaggakol-union	3350	2026-05-10 15:55:57.222	2026-05-10 16:52:59.173	t	ভাগ্যকুল	Vaggakol	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg14f01f0w88oizu2irai	cmozwcwq20065408opkldguln	Bagra	bagra-union	3351	2026-05-10 15:55:57.231	2026-05-10 16:52:59.179	t	বাঘড়া	Bagra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg14q01f1w88ozqu9w3gk	cmozwcwq20065408opkldguln	Rarikhal	rarikhal-union	3352	2026-05-10 15:55:57.242	2026-05-10 16:52:59.186	t	রাঢ়ীখাল	Rarikhal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg14y01f2w88olym2xy2k	cmozwcwq20065408opkldguln	Kukutia	kukutia-union	3353	2026-05-10 15:55:57.25	2026-05-10 16:52:59.192	t	কুকুটিয়া	Kukutia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg15901f3w88o8gf4nli5	cmozwcwq20065408opkldguln	Atpara	atpara-union	3354	2026-05-10 15:55:57.261	2026-05-10 16:52:59.199	t	আটপাড়া	Atpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg15j01f4w88oprlzy6a3	cmozwcwq20065408opkldguln	Tantor	tantor-union	3355	2026-05-10 15:55:57.271	2026-05-10 16:52:59.205	t	তন্তর	Tantor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg15s01f5w88oyfejep9y	cmozwcwpw0064408oomorbsj3	Chitracoat	chitracoat-union	3356	2026-05-10 15:55:57.28	2026-05-10 16:52:59.212	t	চিত্রকোট	Chitracoat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg16201f6w88obhd8flb7	cmozwcwpw0064408oomorbsj3	Sekhornagar	sekhornagar-union	3357	2026-05-10 15:55:57.29	2026-05-10 16:52:59.218	t	শেখরনগার	Sekhornagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg16b01f7w88odkhuy8y6	cmozwcwpw0064408oomorbsj3	Rajanagar	rajanagar-union-1	3358	2026-05-10 15:55:57.299	2026-05-10 16:52:59.224	t	রাজানগর	Rajanagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg16m01f8w88omljdwx3l	cmozwcwpw0064408oomorbsj3	Keyain	keyain-union	3359	2026-05-10 15:55:57.31	2026-05-10 16:52:59.23	t	কেয়াইন	Keyain	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg16w01f9w88olqobs2mv	cmozwcwpw0064408oomorbsj3	Basail	basail-union-1	3360	2026-05-10 15:55:57.32	2026-05-10 16:52:59.237	t	বাসাইল	Basail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg17f01fbw88oywtkh8ov	cmozwcwpw0064408oomorbsj3	Latabdi	latabdi-union	3362	2026-05-10 15:55:57.339	2026-05-10 16:52:59.25	t	লতাব্দী	Latabdi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg17o01fcw88o78gvk2dj	cmozwcwpw0064408oomorbsj3	Rasunia	rasunia-union	3363	2026-05-10 15:55:57.348	2026-05-10 16:52:59.256	t	রশুনিয়া	Rasunia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg17y01fdw88oegpn0250	cmozwcwpw0064408oomorbsj3	Ichhapura	ichhapura-union	3364	2026-05-10 15:55:57.358	2026-05-10 16:52:59.262	t	ইছাপুরা	Ichhapura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg18701few88ozch89ed9	cmozwcwpw0064408oomorbsj3	Bairagadi	bairagadi-union	3365	2026-05-10 15:55:57.367	2026-05-10 16:52:59.269	t	বয়রাগাদি	Bairagadi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0y701edw88o6et4qwnt	cmozwcwgr004r408od4cx7vnr	Sutarpara	sutarpara-union	3328	2026-05-10 15:55:57.007	2026-05-10 16:52:59.034	t	সুতারপাড়া	Sutarpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0yf01eew88ohz08o2qy	cmozwcwgr004r408od4cx7vnr	Narisha	narisha-union	3329	2026-05-10 15:55:57.015	2026-05-10 16:52:59.04	t	নারিশা	Narisha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg19c01fiw88o8gymhagt	cmozwcwpw0064408oomorbsj3	Joyinshar	joyinshar-union	3369	2026-05-10 15:55:57.408	2026-05-10 16:52:59.294	t	জৈনসার	Joyinshar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg19m01fjw88o09skaxai	cmozwcwq90066408ohus1loq9	Betka	betka-union	3388	2026-05-10 15:55:57.418	2026-05-10 16:52:59.3	t	বেতকা	Betka	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg19w01fkw88o3ex8nxmr	cmozwcwq90066408ohus1loq9	Abdullapur	abdullapur-union	3389	2026-05-10 15:55:57.428	2026-05-10 16:52:59.306	t	আব্দুল্লাপুর	Abdullapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1a701flw88o9klk2ve6	cmozwcwq90066408ohus1loq9	Sonarong Tongibari	sonarong-tongibari-union	3390	2026-05-10 15:55:57.439	2026-05-10 16:52:59.314	t	সোনারং টংগীবাড়ী	Sonarong Tongibari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1ag01fmw88o25mcbstc	cmozwcwq90066408ohus1loq9	Autshahi	autshahi-union	3391	2026-05-10 15:55:57.448	2026-05-10 16:52:59.321	t	আউটশাহী	Autshahi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1aq01fnw88oq4nkhvco	cmozwcwq90066408ohus1loq9	Arial Baligaon	arial-baligaon-union	3392	2026-05-10 15:55:57.458	2026-05-10 16:52:59.328	t	আড়িয়ল বালিগাঁও	Arial Baligaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1ay01fow88omxxe5g62	cmozwcwq90066408ohus1loq9	Dhipur	dhipur-union	3393	2026-05-10 15:55:57.467	2026-05-10 16:52:59.335	t	ধীপুর	Dhipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1b901fpw88o49vz5836	cmozwcwq90066408ohus1loq9	Kathadia Shimolia	kathadia-shimolia-union	3394	2026-05-10 15:55:57.477	2026-05-10 16:52:59.341	t	কাঠাদিয়া শিমুলিয়া	Kathadia Shimolia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1bj01fqw88orn7j62zs	cmozwcwq90066408ohus1loq9	Joslong	joslong-union	3395	2026-05-10 15:55:57.487	2026-05-10 16:52:59.348	t	যশলং	Joslong	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1bt01frw88osxt3h19d	cmozwcwq90066408ohus1loq9	Panchgaon	panchgaon-union-1	3396	2026-05-10 15:55:57.497	2026-05-10 16:52:59.354	t	পাঁচগাও	Panchgaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1c401fsw88okh6s9gzw	cmozwcwq90066408ohus1loq9	Kamarkhara	kamarkhara-union	3397	2026-05-10 15:55:57.508	2026-05-10 16:52:59.36	t	কামারখাড়া	Kamarkhara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1cd01ftw88okakrvkek	cmozwcwq90066408ohus1loq9	Hasailbanari	hasailbanari-union	3398	2026-05-10 15:55:57.517	2026-05-10 16:52:59.367	t	হাসাইল বানারী	Hasailbanari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1co01fuw88o2z27s40e	cmozwcwq90066408ohus1loq9	Dighirpar	dighirpar-union-1	3399	2026-05-10 15:55:57.528	2026-05-10 16:52:59.373	t	দিঘীরপাড়	Dighirpar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1cz01fvw88oiqo9knk1	cmozwcwth006m408onye78hwm	Mijanpur	mijanpur-union	3400	2026-05-10 15:55:57.539	2026-05-10 16:52:59.38	t	মিজানপুর	Mijanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1d801fww88om92x6wyw	cmozwcwth006m408onye78hwm	Borat	borat-union	3401	2026-05-10 15:55:57.548	2026-05-10 16:52:59.386	t	বরাট	Borat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1dk01fxw88o6n3jhjy6	cmozwcwth006m408onye78hwm	Chandoni	chandoni-union	3402	2026-05-10 15:55:57.56	2026-05-10 16:52:59.393	t	চন্দনী	Chandoni	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1dv01fyw88oka3hekq3	cmozwcwth006m408onye78hwm	Khangonj	khangonj-union	3403	2026-05-10 15:55:57.571	2026-05-10 16:52:59.4	t	খানগঞ্জ	Khangonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1e501fzw88o86qpao8f	cmozwcwth006m408onye78hwm	Banibaha	banibaha-union	3404	2026-05-10 15:55:57.581	2026-05-10 16:52:59.406	t	বানীবহ	Banibaha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1eh01g0w88obbc5dls8	cmozwcwth006m408onye78hwm	Dadshee	dadshee-union	3405	2026-05-10 15:55:57.593	2026-05-10 16:52:59.413	t	দাদশী	Dadshee	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1et01g1w88o2soourfj	cmozwcwth006m408onye78hwm	Mulghar	mulghar-union-1	3406	2026-05-10 15:55:57.605	2026-05-10 16:52:59.419	t	মুলঘর	Mulghar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1f201g2w88ol168huii	cmozwcwth006m408onye78hwm	Basantapur	basantapur-union	3407	2026-05-10 15:55:57.614	2026-05-10 16:52:59.426	t	বসন্তপুর	Basantapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1fd01g3w88oj4gixjey	cmozwcwth006m408onye78hwm	Khankhanapur	khankhanapur-union	3408	2026-05-10 15:55:57.625	2026-05-10 16:52:59.432	t	খানখানাপুর	Khankhanapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1fp01g4w88ogrpfe6ee	cmozwcwth006m408onye78hwm	Alipur	alipur-union-2	3409	2026-05-10 15:55:57.637	2026-05-10 16:52:59.438	t	আলীপুর	Alipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1g001g5w88o7w98arp8	cmozwcwth006m408onye78hwm	Ramkantapur	ramkantapur-union	3410	2026-05-10 15:55:57.648	2026-05-10 16:52:59.445	t	রামকান্তপুর	Ramkantapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1gb01g6w88op0g6gvcz	cmozwcwth006m408onye78hwm	Shahidwahabpur	shahidwahabpur-union	3411	2026-05-10 15:55:57.659	2026-05-10 16:52:59.451	t	শহীদওহাবপুর	Shahidwahabpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1gl01g7w88oigc2qysu	cmozwcwth006m408onye78hwm	Panchuria	panchuria-union	3412	2026-05-10 15:55:57.669	2026-05-10 16:52:59.458	t	পাঁচুরিয়া	Panchuria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1gw01g8w88o7nm1pxdm	cmozwcwth006m408onye78hwm	Sultanpur	sultanpur-union-1	3413	2026-05-10 15:55:57.68	2026-05-10 16:52:59.464	t	সুলতানপুর	Sultanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1h801g9w88ocs9fi18a	cmozwcwsu006j408oj0mcml75	Doulatdia	doulatdia-union	3414	2026-05-10 15:55:57.692	2026-05-10 16:52:59.47	t	দৌলতদিয়া	Doulatdia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1hi01gaw88os2xyhi6t	cmozwcwsu006j408oj0mcml75	Debugram	debugram-union	3415	2026-05-10 15:55:57.702	2026-05-10 16:52:59.476	t	দেবগ্রাম	Debugram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1hs01gbw88oc21dt44y	cmozwcwsu006j408oj0mcml75	Uzancar	uzancar-union	3416	2026-05-10 15:55:57.712	2026-05-10 16:52:59.483	t	উজানচর	Uzancar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1i401gcw88okmmtvon9	cmozwcwsu006j408oj0mcml75	Chotovakla	chotovakla-union	3417	2026-05-10 15:55:57.724	2026-05-10 16:52:59.49	t	ছোটভাকলা	Chotovakla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1if01gdw88o1gark6cx	cmozwcwsn006i408os20ys3zw	Islampur	islampur-union-2	3428	2026-05-10 15:55:57.735	2026-05-10 16:52:59.496	t	ইসলামপুর	Islampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1ir01gew88o9wqwqft9	cmozwcwsn006i408os20ys3zw	Baharpur	baharpur-union	3429	2026-05-10 15:55:57.747	2026-05-10 16:52:59.502	t	বহরপুর	Baharpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1j201gfw88ox26vyxbu	cmozwcwsn006i408os20ys3zw	Nawabpur	nawabpur-union	3430	2026-05-10 15:55:57.758	2026-05-10 16:52:59.509	t	নবাবপুর	Nawabpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1jb01ggw88ocziimw6u	cmozwcwsn006i408os20ys3zw	Narua	narua-union	3431	2026-05-10 15:55:57.767	2026-05-10 16:52:59.515	t	নারুয়া	Narua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg19201fhw88o0n8cfpfv	cmozwcwpw0064408oomorbsj3	Kola	kola-union-1	3368	2026-05-10 15:55:57.398	2026-05-10 16:52:59.287	t	কোলা	Kola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1ki01gkw88ows7arkzf	cmozwcwt1006k408occwoej2r	Kalukhali	kalukhali-union	3435	2026-05-10 15:55:57.81	2026-05-10 16:52:59.541	t	কালুখালী	Kalukhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1ks01glw88ohjx956e2	cmozwcwt1006k408occwoej2r	Ratandia	ratandia-union	3436	2026-05-10 15:55:57.82	2026-05-10 16:52:59.547	t	রতনদিয়া	Ratandia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1l401gmw88ozdvs5ba8	cmozwcwt1006k408occwoej2r	Kalikapur	kalikapur-union-3	3437	2026-05-10 15:55:57.832	2026-05-10 16:52:59.553	t	কালিকাপুর	Kalikapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1lh01gnw88otarfnzcp	cmozwcwt1006k408occwoej2r	Boalia	boalia-union-2	3438	2026-05-10 15:55:57.845	2026-05-10 16:52:59.559	t	বোয়ালিয়া	Boalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1ls01gow88ofp1nl4qs	cmozwcwt1006k408occwoej2r	Majbari	majbari-union	3439	2026-05-10 15:55:57.856	2026-05-10 16:52:59.566	t	মাজবাড়ী	Majbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1m101gpw88ogmgrcsu2	cmozwcwt1006k408occwoej2r	Madapur	madapur-union	3440	2026-05-10 15:55:57.865	2026-05-10 16:52:59.572	t	মদাপুর	Madapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1mm01grw88oh4ebj371	cmozwcwt1006k408occwoej2r	Mrigi	mrigi-union	3442	2026-05-10 15:55:57.886	2026-05-10 16:52:59.586	t	মৃগী	Mrigi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1mw01gsw88oyadlz1np	cmozwcwnm005r408ol87f12dp	Sirkhara	sirkhara-union	3443	2026-05-10 15:55:57.896	2026-05-10 16:52:59.592	t	শিড়খাড়া	Sirkhara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1nb01gtw88owtzz6t83	cmozwcwnm005r408ol87f12dp	Bahadurpur	bahadurpur-union-3	3444	2026-05-10 15:55:57.911	2026-05-10 16:52:59.598	t	বাহাদুরপুর	Bahadurpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1nm01guw88oev75sx5b	cmozwcwnm005r408ol87f12dp	Kunia	kunia-union	3445	2026-05-10 15:55:57.922	2026-05-10 16:52:59.605	t	কুনিয়া	Kunia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1nv01gvw88oo4ez2d93	cmozwcwnm005r408ol87f12dp	Peyarpur	peyarpur-union	3446	2026-05-10 15:55:57.931	2026-05-10 16:52:59.611	t	পেয়ারপুর	Peyarpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1o801gww88op5wwmayb	cmozwcwnm005r408ol87f12dp	Kandua	kandua-union	3447	2026-05-10 15:55:57.944	2026-05-10 16:52:59.618	t	কেন্দুয়া	Kandua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1ol01gxw88ot1appou9	cmozwcwnm005r408ol87f12dp	Mastofapur	mastofapur-union	3448	2026-05-10 15:55:57.957	2026-05-10 16:52:59.625	t	মস্তফাপুর	Mastofapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1ov01gyw88oxyf2yh4g	cmozwcwnm005r408ol87f12dp	Dudkhali	dudkhali-union	3449	2026-05-10 15:55:57.967	2026-05-10 16:52:59.631	t	দুধখালী	Dudkhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1pb01gzw88oe5fyifoz	cmozwcwnm005r408ol87f12dp	Kalikapur	kalikapur-union-4	3450	2026-05-10 15:55:57.983	2026-05-10 16:52:59.638	t	কালিকাপুর	Kalikapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1po01h0w88oqjntmeuk	cmozwcwnm005r408ol87f12dp	Chilarchar	chilarchar-union	3451	2026-05-10 15:55:57.996	2026-05-10 16:52:59.644	t	ছিলারচর	Chilarchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1q501h1w88ogk8evf4h	cmozwcwnm005r408ol87f12dp	Panchkhola	panchkhola-union	3452	2026-05-10 15:55:58.013	2026-05-10 16:52:59.65	t	পাঁচখোলা	Panchkhola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1qi01h2w88okw1mil1x	cmozwcwnm005r408ol87f12dp	Ghatmajhi	ghatmajhi-union	3453	2026-05-10 15:55:58.026	2026-05-10 16:52:59.656	t	ঘটমাঝি	Ghatmajhi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1qz01h3w88oefhbfrno	cmozwcwnm005r408ol87f12dp	Jhaoudi	jhaoudi-union	3454	2026-05-10 15:55:58.043	2026-05-10 16:52:59.663	t	ঝাউদী	Jhaoudi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1rd01h4w88o3nncmzlf	cmozwcwnm005r408ol87f12dp	Khoajpur	khoajpur-union	3455	2026-05-10 15:55:58.057	2026-05-10 16:52:59.669	t	খোয়াজপুর	Khoajpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1rl01h5w88o2nzm8ecb	cmozwcwnm005r408ol87f12dp	Rasti	rasti-union	3456	2026-05-10 15:55:58.065	2026-05-10 16:52:59.676	t	রাস্তি	Rasti	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1rw01h6w88o4r717bai	cmozwcwnm005r408ol87f12dp	Dhurail	dhurail-union	3457	2026-05-10 15:55:58.076	2026-05-10 16:52:59.682	t	ধুরাইল	Dhurail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1s401h7w88oufxdrxwr	cmozwcwnz005t408o375riw7g	Shibchar	shibchar-union	3458	2026-05-10 15:55:58.084	2026-05-10 16:52:59.688	t	শিবচর	Shibchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1se01h8w88oesux6vet	cmozwcwnz005t408o375riw7g	Ditiyakhando	ditiyakhando-union	3459	2026-05-10 15:55:58.094	2026-05-10 16:52:59.694	t	দ্বিতীয়খন্ড	Ditiyakhando	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1so01h9w88oxhgl7moz	cmozwcwnz005t408o375riw7g	Nilokhe	nilokhe-union	3460	2026-05-10 15:55:58.104	2026-05-10 16:52:59.701	t	নিলখি	Nilokhe	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1sw01haw88o46zfpu2f	cmozwcwnz005t408o375riw7g	Bandarkhola	bandarkhola-union	3461	2026-05-10 15:55:58.112	2026-05-10 16:52:59.707	t	বন্দরখোলা	Bandarkhola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1t601hbw88ouatg72cw	cmozwcwnz005t408o375riw7g	Charjanazat	charjanazat-union	3462	2026-05-10 15:55:58.122	2026-05-10 16:52:59.714	t	চরজানাজাত	Charjanazat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1te01hcw88ojle3ogof	cmozwcwnz005t408o375riw7g	Madbarerchar	madbarerchar-union	3463	2026-05-10 15:55:58.13	2026-05-10 16:52:59.72	t	মাদবরেরচর	Madbarerchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1to01hdw88opzbldpsl	cmozwcwnz005t408o375riw7g	Panchar	panchar-union	3464	2026-05-10 15:55:58.14	2026-05-10 16:52:59.726	t	পাঁচচর	Panchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1tw01hew88o31m0byz9	cmozwcwnz005t408o375riw7g	Sannasirchar	sannasirchar-union	3465	2026-05-10 15:55:58.148	2026-05-10 16:52:59.732	t	সন্যাসিরচর	Sannasirchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1u601hfw88ob7k0rvpm	cmozwcwnz005t408o375riw7g	Kathalbari	kathalbari-union	3466	2026-05-10 15:55:58.158	2026-05-10 16:52:59.739	t	কাঁঠালবাড়ী	Kathalbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1uj01hgw88onyvyhqpo	cmozwcwnz005t408o375riw7g	Kutubpur	kutubpur-union-3	3467	2026-05-10 15:55:58.171	2026-05-10 16:52:59.745	t	কুতুবপুর	Kutubpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1us01hhw88ok754vwua	cmozwcwnz005t408o375riw7g	Kadirpur	kadirpur-union	3468	2026-05-10 15:55:58.18	2026-05-10 16:52:59.752	t	কাদিরপুর	Kadirpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1v201hiw88ownb1t1b6	cmozwcwnz005t408o375riw7g	Vhandarikandi	vhandarikandi-union	3469	2026-05-10 15:55:58.19	2026-05-10 16:52:59.758	t	ভান্ডারীকান্দি	Vhandarikandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2vf01kqw88o85rarim7	cmozwcwht004x408ov978wc6m	Dadpur	dadpur-union	3587	2026-05-10 15:55:59.499	2026-05-10 16:53:00.564	t	দাদপুর	Dadpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1jx01giw88orsro7p4f	cmozwcwsn006i408os20ys3zw	Janjal	janjal-union	3433	2026-05-10 15:55:57.789	2026-05-10 16:52:59.528	t	জঙ্গল	Janjal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1k701gjw88oa2ke8yh6	cmozwcwsn006i408os20ys3zw	Jamalpur	jamalpur-union-1	3434	2026-05-10 15:55:57.799	2026-05-10 16:52:59.535	t	জামালপুর	Jamalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1wf01hnw88oxa313cw4	cmozwcwnz005t408o375riw7g	Vhadrasion	vhadrasion-union	3474	2026-05-10 15:55:58.239	2026-05-10 16:52:59.79	t	ভদ্রাসন	Vhadrasion	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1wo01how88ofqnbkmch	cmozwcwnz005t408o375riw7g	Shiruail	shiruail-union	3475	2026-05-10 15:55:58.248	2026-05-10 16:52:59.796	t	শিরুয়াইল	Shiruail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1wy01hpw88o9x2t9jx8	cmozwcwnz005t408o375riw7g	Dattapara	dattapara-union	3476	2026-05-10 15:55:58.258	2026-05-10 16:52:59.802	t	দত্তপাড়া	Dattapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1x801hqw88owwbjrivq	cmozwcwng005q408oqq038cjg	Alinagar	alinagar-union-1	3477	2026-05-10 15:55:58.268	2026-05-10 16:52:59.809	t	আলীনগর	Alinagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1xi01hrw88o56a742fh	cmozwcwng005q408oqq038cjg	Baligram	baligram-union	3478	2026-05-10 15:55:58.278	2026-05-10 16:52:59.815	t	বালীগ্রাম	Baligram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1xs01hsw88o460a9f7a	cmozwcwng005q408oqq038cjg	Basgari	basgari-union	3479	2026-05-10 15:55:58.288	2026-05-10 16:52:59.821	t	বাঁশগাড়ী	Basgari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1y101htw88o2tguon1q	cmozwcwng005q408oqq038cjg	Chardoulatkhan	chardoulatkhan-union	3480	2026-05-10 15:55:58.297	2026-05-10 16:52:59.828	t	চরদৌলতখান	Chardoulatkhan	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1yb01huw88o2io3w115	cmozwcwng005q408oqq038cjg	Dashar	dashar-union	3481	2026-05-10 15:55:58.307	2026-05-10 16:52:59.835	t	ডাসার	Dashar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1yl01hvw88o0an6c3op	cmozwcwng005q408oqq038cjg	Enayetnagor	enayetnagor-union-1	3482	2026-05-10 15:55:58.317	2026-05-10 16:52:59.841	t	এনায়েতনগর	Enayetnagor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1yw01hww88o545vnmpp	cmozwcwng005q408oqq038cjg	Gopalpur	gopalpur-union-2	3483	2026-05-10 15:55:58.329	2026-05-10 16:52:59.848	t	গোপালপুর	Gopalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1z701hxw88o24i3bja1	cmozwcwng005q408oqq038cjg	Koyaria	koyaria-union	3484	2026-05-10 15:55:58.339	2026-05-10 16:52:59.854	t	কয়ারিয়া	Koyaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1zf01hyw88ontnvs0d5	cmozwcwng005q408oqq038cjg	Kazibakai	kazibakai-union	3485	2026-05-10 15:55:58.347	2026-05-10 16:52:59.86	t	কাজীবাকাই	Kazibakai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1zr01hzw88ooh84nhbg	cmozwcwng005q408oqq038cjg	Laxmipur	laxmipur-union-1	3486	2026-05-10 15:55:58.359	2026-05-10 16:52:59.867	t	লক্ষীপুর	Laxmipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1zz01i0w88ot6lskup9	cmozwcwng005q408oqq038cjg	Nabogram	nabogram-union	3487	2026-05-10 15:55:58.367	2026-05-10 16:52:59.874	t	নবগ্রাম	Nabogram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg20a01i1w88oe5309hcg	cmozwcwng005q408oqq038cjg	Ramjanpur	ramjanpur-union	3488	2026-05-10 15:55:58.378	2026-05-10 16:52:59.881	t	রমজানপুর	Ramjanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg20k01i2w88omxh10lym	cmozwcwng005q408oqq038cjg	Shahebrampur	shahebrampur-union	3489	2026-05-10 15:55:58.388	2026-05-10 16:52:59.888	t	সাহেবরামপুর	Shahebrampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg20t01i3w88o2uk1avfr	cmozwcwng005q408oqq038cjg	Shikarmongol	shikarmongol-union	3490	2026-05-10 15:55:58.397	2026-05-10 16:52:59.894	t	শিকারমঙ্গল	Shikarmongol	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg21501i4w88ormy8zbia	cmozwcwnt005s408ow5msdrav	Haridasdi-Mahendrodi	haridasdi-mahendrodi-union	3491	2026-05-10 15:55:58.409	2026-05-10 16:52:59.9	t	হরিদাসদী-মহেন্দ্রদী	Haridasdi-Mahendrodi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg21d01i5w88oz05vsyx0	cmozwcwnt005s408ow5msdrav	Kadambari	kadambari-union	3492	2026-05-10 15:55:58.417	2026-05-10 16:52:59.906	t	কদমবাড়ী	Kadambari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg21n01i6w88omvsfg16p	cmozwcwnt005s408ow5msdrav	Bajitpur	bajitpur-union	3493	2026-05-10 15:55:58.427	2026-05-10 16:52:59.912	t	বাজিতপুর	Bajitpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg21w01i7w88otfsol2q3	cmozwcwnt005s408ow5msdrav	Amgram	amgram-union	3494	2026-05-10 15:55:58.436	2026-05-10 16:52:59.918	t	আমগ্রাম	Amgram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg22501i8w88opdvlyb4x	cmozwcwnt005s408ow5msdrav	Rajoir	rajoir-union	3495	2026-05-10 15:55:58.445	2026-05-10 16:52:59.925	t	রাজৈর	Rajoir	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg22f01i9w88o9amn8h5n	cmozwcwnt005s408ow5msdrav	Khaliya	khaliya-union	3496	2026-05-10 15:55:58.455	2026-05-10 16:52:59.931	t	খালিয়া	Khaliya	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg22o01iaw88or4fmp3kx	cmozwcwnt005s408ow5msdrav	Ishibpur	ishibpur-union	3497	2026-05-10 15:55:58.464	2026-05-10 16:52:59.938	t	ইশিবপুর	Ishibpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg22y01ibw88oq2ib5go4	cmozwcwnt005s408ow5msdrav	Badarpasa	badarpasa-union	3498	2026-05-10 15:55:58.474	2026-05-10 16:52:59.944	t	বদরপাশা	Badarpasa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg23701icw88oaug2fw8t	cmozwcwnt005s408ow5msdrav	Kabirajpur	kabirajpur-union	3499	2026-05-10 15:55:58.483	2026-05-10 16:52:59.95	t	কবিরাজপুর	Kabirajpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg23h01idw88omha01o9o	cmozwcwnt005s408ow5msdrav	Hosenpur	hosenpur-union	3500	2026-05-10 15:55:58.493	2026-05-10 16:52:59.957	t	হোসেনপুর	Hosenpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg23r01iew88ov01154mz	cmozwcwnt005s408ow5msdrav	Paikpara	paikpara-union-1	3501	2026-05-10 15:55:58.503	2026-05-10 16:52:59.963	t	পাইকপাড়া	Paikpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg24101ifw88o17inh169	cmozqxhyn0011zo8oeum3cm8h	Jalalabad	jalalabad-union-1	3502	2026-05-10 15:55:58.513	2026-05-10 16:52:59.969	t	জালালাবাদ	Jalalabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg24b01igw88orxf9e7ou	cmozqxhyn0011zo8oeum3cm8h	Shuktail	shuktail-union	3503	2026-05-10 15:55:58.523	2026-05-10 16:52:59.975	t	শুকতাইল	Shuktail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg24j01ihw88out7t6ypr	cmozqxhyn0011zo8oeum3cm8h	Chandradighalia	chandradighalia-union	3504	2026-05-10 15:55:58.531	2026-05-10 16:52:59.982	t	চন্দ্রদিঘলিয়া	Chandradighalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg24v01iiw88o01p5cv8k	cmozqxhyn0011zo8oeum3cm8h	Gopinathpur	gopinathpur-union-2	3505	2026-05-10 15:55:58.543	2026-05-10 16:52:59.989	t	গোপীনাথপুর	Gopinathpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg25501ijw88oryf3sxxs	cmozqxhyn0011zo8oeum3cm8h	Paikkandi	paikkandi-union	3506	2026-05-10 15:55:58.553	2026-05-10 16:52:59.996	t	পাইককান্দি	Paikkandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg25e01ikw88ofvn19uxc	cmozqxhyn0011zo8oeum3cm8h	Urfi	urfi-union	3507	2026-05-10 15:55:58.563	2026-05-10 16:53:00.004	t	উরফি	Urfi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1vu01hlw88ocdykgubh	cmozwcwnz005t408o375riw7g	Baskandi	baskandi-union	3472	2026-05-10 15:55:58.218	2026-05-10 16:52:59.777	t	বাঁশকান্দি	Baskandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1w501hmw88o67p72gcy	cmozwcwnz005t408o375riw7g	Umedpur	umedpur-union-1	3473	2026-05-10 15:55:58.229	2026-05-10 16:52:59.784	t	উমেদপুর	Umedpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg26g01iow88o0r2xji4t	cmozqxhyn0011zo8oeum3cm8h	Horidaspur	horidaspur-union	3511	2026-05-10 15:55:58.6	2026-05-10 16:53:00.033	t	হরিদাসপুর	Horidaspur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg26q01ipw88ogyu6737q	cmozqxhyn0011zo8oeum3cm8h	Ulpur	ulpur-union	3512	2026-05-10 15:55:58.61	2026-05-10 16:53:00.039	t	উলপুর	Ulpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg26z01iqw88obl0ji908	cmozqxhyn0011zo8oeum3cm8h	Nizra	nizra-union	3513	2026-05-10 15:55:58.619	2026-05-10 16:53:00.046	t	নিজড়া	Nizra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg27901irw88ocu2mtivh	cmozqxhyn0011zo8oeum3cm8h	Karpara	karpara-union	3514	2026-05-10 15:55:58.629	2026-05-10 16:53:00.053	t	করপাড়া	Karpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg27n01isw88on5w3oj0a	cmozqxhyn0011zo8oeum3cm8h	Durgapur	durgapur-union-4	3515	2026-05-10 15:55:58.643	2026-05-10 16:53:00.059	t	দুর্গাপুর	Durgapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozqxhza0014zo8o3cn91dsg	cmozqxhyn0011zo8oeum3cm8h	Kajulia	kazulia-union-gopalganj	3516	2026-05-10 12:25:35.302	2026-05-10 16:53:00.066	t	কাজুলিয়া	Kajulia	10	f	\N	\N	nuhil/bangladesh-geocode
cmozyg28701itw88o01oqfuna	cmozqxhyn0011zo8oeum3cm8h	Majhigati	majhigati-union	3517	2026-05-10 15:55:58.663	2026-05-10 16:53:00.072	t	মাঝিগাতী	Majhigati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg28h01iuw88odlmrsxw3	cmozqxhyn0011zo8oeum3cm8h	Roghunathpur	roghunathpur-union	3518	2026-05-10 15:55:58.673	2026-05-10 16:53:00.078	t	রঘুনাথপুর	Roghunathpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg28q01ivw88orfkcmkjk	cmozqxhyn0011zo8oeum3cm8h	Gobra	gobra-union	3519	2026-05-10 15:55:58.682	2026-05-10 16:53:00.085	t	গোবরা	Gobra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg29001iww88oica5h6x2	cmozqxhyn0011zo8oeum3cm8h	Borashi	borashi-union	3520	2026-05-10 15:55:58.692	2026-05-10 16:53:00.092	t	বোড়াশী	Borashi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg29901ixw88o0p87dpga	cmozqxhyn0011zo8oeum3cm8h	Kati	kati-union	3521	2026-05-10 15:55:58.701	2026-05-10 16:53:00.098	t	কাঠি	Kati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg29j01iyw88oiz5n9473	cmozqxhyn0011zo8oeum3cm8h	Boultali	boultali-union	3522	2026-05-10 15:55:58.711	2026-05-10 16:53:00.105	t	বৌলতলী	Boultali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg29y01izw88o1399tlnj	cmozwcwk80058408okkhdz8pw	Kashiani	kashiani-union	3523	2026-05-10 15:55:58.726	2026-05-10 16:53:00.112	t	কাশিয়ানী	Kashiani	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2ad01j0w88ooh226upn	cmozwcwk80058408okkhdz8pw	Hatiara	hatiara-union	3524	2026-05-10 15:55:58.741	2026-05-10 16:53:00.118	t	হাতিয়াড়া	Hatiara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2am01j1w88o1v0axujw	cmozwcwk80058408okkhdz8pw	Fukura	fukura-union	3525	2026-05-10 15:55:58.75	2026-05-10 16:53:00.125	t	ফুকরা	Fukura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2ay01j2w88o5zh8yqs2	cmozwcwk80058408okkhdz8pw	Rajpat	rajpat-union	3526	2026-05-10 15:55:58.762	2026-05-10 16:53:00.131	t	রাজপাট	Rajpat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2b901j3w88o36978o4t	cmozwcwk80058408okkhdz8pw	Bethuri	bethuri-union	3527	2026-05-10 15:55:58.773	2026-05-10 16:53:00.138	t	বেথুড়ী	Bethuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2bi01j4w88omcs8qh7o	cmozwcwk80058408okkhdz8pw	Nijamkandi	nijamkandi-union	3528	2026-05-10 15:55:58.782	2026-05-10 16:53:00.144	t	নিজামকান্দি	Nijamkandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2br01j5w88ov0t7wqbw	cmozwcwk80058408okkhdz8pw	Sajail	sajail-union	3529	2026-05-10 15:55:58.791	2026-05-10 16:53:00.15	t	সাজাইল	Sajail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2c101j6w88o252cwbrp	cmozwcwk80058408okkhdz8pw	Mamudpur	mamudpur-union-1	3530	2026-05-10 15:55:58.801	2026-05-10 16:53:00.157	t	মাহমুদপুর	Mamudpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2ck01j8w88ojba6nszz	cmozwcwk80058408okkhdz8pw	Orakandia	orakandia-union	3532	2026-05-10 15:55:58.82	2026-05-10 16:53:00.169	t	ওড়াকান্দি	Orakandia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2ct01j9w88ofvadcsjl	cmozwcwk80058408okkhdz8pw	Parulia	parulia-union-1	3533	2026-05-10 15:55:58.829	2026-05-10 16:53:00.175	t	পারুলিয়া	Parulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2d601jaw88ogwvmeoim	cmozwcwk80058408okkhdz8pw	Ratail	ratail-union	3534	2026-05-10 15:55:58.842	2026-05-10 16:53:00.181	t	রাতইল	Ratail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2df01jbw88oexlhnnmi	cmozwcwk80058408okkhdz8pw	Puisur	puisur-union	3535	2026-05-10 15:55:58.851	2026-05-10 16:53:00.188	t	পুইশুর	Puisur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2dn01jcw88ooy56a8x0	cmozwcwk80058408okkhdz8pw	Singa	singa-union	3536	2026-05-10 15:55:58.859	2026-05-10 16:53:00.194	t	সিংগা	Singa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2dv01jdw88ots5t0k2k	cmozwcwkr005b408oj0swwomg	Kushli	kushli-union	3537	2026-05-10 15:55:58.867	2026-05-10 16:53:00.202	t	কুশলী	Kushli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2e701jew88oxrisbv9j	cmozwcwkr005b408oj0swwomg	Gopalpur	gopalpur-union-3	3538	2026-05-10 15:55:58.879	2026-05-10 16:53:00.212	t	গোপালপুর	Gopalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2ej01jfw88okb5d5zej	cmozwcwkr005b408oj0swwomg	Patgati	patgati-union	3539	2026-05-10 15:55:58.891	2026-05-10 16:53:00.22	t	পাটগাতী	Patgati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2f201jgw88ov5if32l9	cmozwcwkr005b408oj0swwomg	Borni	borni-union	3540	2026-05-10 15:55:58.91	2026-05-10 16:53:00.228	t	বর্ণি	Borni	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2fx01jhw88oqqk68j5y	cmozwcwkr005b408oj0swwomg	Dumaria	dumaria-union	3541	2026-05-10 15:55:58.941	2026-05-10 16:53:00.236	t	ডুমরিয়া	Dumaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2gi01jiw88o78wr7u7i	cmozwcwke0059408oehx8kn8q	Sadullapur	sadullapur-union	3542	2026-05-10 15:55:58.962	2026-05-10 16:53:00.245	t	সাদুল্লাপুর	Sadullapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2h701jjw88o2435w5vl	cmozwcwke0059408oehx8kn8q	Ramshil	ramshil-union	3543	2026-05-10 15:55:58.987	2026-05-10 16:53:00.252	t	রামশীল	Ramshil	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2i001jkw88o1xxnqxtk	cmozwcwke0059408oehx8kn8q	Bandhabari	bandhabari-union	3544	2026-05-10 15:55:59.016	2026-05-10 16:53:00.26	t	বান্ধাবাড়ী	Bandhabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2j201jlw88o34t87tcf	cmozwcwke0059408oehx8kn8q	Kolabari	kolabari-union	3545	2026-05-10 15:55:59.054	2026-05-10 16:53:00.268	t	কলাবাড়ী	Kolabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2k501jmw88orzsxdhzi	cmozwcwke0059408oehx8kn8q	Kushla	kushla-union	3546	2026-05-10 15:55:59.093	2026-05-10 16:53:00.275	t	কুশলা	Kushla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2kf01jnw88ouzvfpidv	cmozwcwke0059408oehx8kn8q	Amtoli	amtoli-union	3547	2026-05-10 15:55:59.103	2026-05-10 16:53:00.281	t	আমতলী	Amtoli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg25x01imw88o4mh4obyv	cmozqxhyn0011zo8oeum3cm8h	Satpar	satpar-union	3509	2026-05-10 15:55:58.581	2026-05-10 16:53:00.019	t	সাতপাড়	Satpar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg26701inw88osjtn3xsm	cmozqxhyn0011zo8oeum3cm8h	Sahapur	sahapur-union	3510	2026-05-10 15:55:58.591	2026-05-10 16:53:00.027	t	সাহাপুর	Sahapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2lx01jrw88o3jpekprs	cmozwcwke0059408oehx8kn8q	Hiron	hiron-union	3551	2026-05-10 15:55:59.157	2026-05-10 16:53:00.308	t	হিরণ	Hiron	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2m501jsw88oyt78lm8c	cmozwcwke0059408oehx8kn8q	Kandi	kandi-union	3552	2026-05-10 15:55:59.165	2026-05-10 16:53:00.314	t	কান্দি	Kandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2mf01jtw88ouih2bun6	cmozwcwkl005a408oavtk0k3g	Ujani	ujani-union	3553	2026-05-10 15:55:59.175	2026-05-10 16:53:00.32	t	উজানী	Ujani	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2mn01juw88ozt4q4gcv	cmozwcwkl005a408oavtk0k3g	Nanikhir	nanikhir-union	3554	2026-05-10 15:55:59.183	2026-05-10 16:53:00.327	t	ননীক্ষীর	Nanikhir	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2mx01jvw88oconf0npl	cmozwcwkl005a408oavtk0k3g	Dignagar	dignagar-union	3555	2026-05-10 15:55:59.193	2026-05-10 16:53:00.334	t	দিগনগর	Dignagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2n501jww88ohpd6l1r0	cmozwcwkl005a408oavtk0k3g	Poshargati	poshargati-union	3556	2026-05-10 15:55:59.201	2026-05-10 16:53:00.341	t	পশারগাতি	Poshargati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2nf01jxw88o0fu5yjbw	cmozwcwkl005a408oavtk0k3g	Gobindopur	gobindopur-union	3557	2026-05-10 15:55:59.211	2026-05-10 16:53:00.347	t	গোবিন্দপুর	Gobindopur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2no01jyw88op3fkcs8u	cmozwcwkl005a408oavtk0k3g	Khandarpara	khandarpara-union	3558	2026-05-10 15:55:59.22	2026-05-10 16:53:00.354	t	খান্দারপাড়া	Khandarpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2nx01jzw88onhiqikz6	cmozwcwkl005a408oavtk0k3g	Bohugram	bohugram-union	3559	2026-05-10 15:55:59.229	2026-05-10 16:53:00.36	t	বহুগ্রাম	Bohugram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2of01k1w88okwerfukw	cmozwcwkl005a408oavtk0k3g	Vabrashur	vabrashur-union	3561	2026-05-10 15:55:59.247	2026-05-10 16:53:00.373	t	ভাবড়াশুর	Vabrashur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2oq01k2w88oocb4pdb0	cmozwcwkl005a408oavtk0k3g	Moharajpur	moharajpur-union-1	3562	2026-05-10 15:55:59.258	2026-05-10 16:53:00.379	t	মহারাজপুর	Moharajpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2oz01k3w88oqvygwpfa	cmozwcwkl005a408oavtk0k3g	Batikamari	batikamari-union	3563	2026-05-10 15:55:59.267	2026-05-10 16:53:00.387	t	বাটিকামারী	Batikamari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2p901k4w88ogyltgjhb	cmozwcwkl005a408oavtk0k3g	Jalirpar	jalirpar-union	3564	2026-05-10 15:55:59.277	2026-05-10 16:53:00.394	t	জলিরপাড়	Jalirpar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2ph01k5w88ocx1jyvas	cmozwcwkl005a408oavtk0k3g	Raghdi	raghdi-union	3565	2026-05-10 15:55:59.285	2026-05-10 16:53:00.401	t	রাঘদী	Raghdi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2pr01k6w88o2enic0c8	cmozwcwkl005a408oavtk0k3g	Gohala	gohala-union	3566	2026-05-10 15:55:59.295	2026-05-10 16:53:00.408	t	গোহালা	Gohala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2q101k7w88okojkn7u1	cmozwcwkl005a408oavtk0k3g	Mochna	mochna-union	3567	2026-05-10 15:55:59.305	2026-05-10 16:53:00.415	t	মোচনা	Mochna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2qb01k8w88ojrdlgcq7	cmozwcwkl005a408oavtk0k3g	Kashalia	kashalia-union	3568	2026-05-10 15:55:59.315	2026-05-10 16:53:00.422	t	কাশালিয়া	Kashalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2ql01k9w88otmstq1ed	cmozqxhyy0013zo8o01av8gas	Ishangopalpur	ishangopalpur-union	3569	2026-05-10 15:55:59.325	2026-05-10 16:53:00.43	t	ঈশানগোপালপুর	Ishangopalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2qt01kaw88os5dpm6k4	cmozqxhyy0013zo8o01av8gas	Charmadbdia	charmadbdia-union	3570	2026-05-10 15:55:59.333	2026-05-10 16:53:00.438	t	চরমাধবদিয়া	Charmadbdia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozqxhzl0016zo8og2gcp2kr	cmozqxhyy0013zo8o01av8gas	Aliabad	aliabad-union-faridpur	3571	2026-05-10 12:25:35.313	2026-05-10 16:53:00.445	t	আলিয়াবাদ	Aliabad	12	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2rb01kbw88o69wd92de	cmozqxhyy0013zo8o01av8gas	Uttarchannel	uttarchannel-union	3572	2026-05-10 15:55:59.351	2026-05-10 16:53:00.452	t	নর্থচ্যানেল	Uttarchannel	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2rl01kcw88o47sypg0x	cmozqxhyy0013zo8o01av8gas	Decreerchar	decreerchar-union	3573	2026-05-10 15:55:59.361	2026-05-10 16:53:00.46	t	ডিক্রিরচর	Decreerchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2ru01kdw88o73zbqy3p	cmozqxhyy0013zo8o01av8gas	Majchar	majchar-union	3574	2026-05-10 15:55:59.37	2026-05-10 16:53:00.467	t	মাচ্চর	Majchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2s401kew88ogyhmeibk	cmozqxhyy0013zo8o01av8gas	Krishnanagar	krishnanagar-union-1	3575	2026-05-10 15:55:59.38	2026-05-10 16:53:00.475	t	কৃষ্ণনগর	Krishnanagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2sf01kfw88ooyxk9i4o	cmozqxhyy0013zo8o01av8gas	Ambikapur	ambikapur-union	3576	2026-05-10 15:55:59.391	2026-05-10 16:53:00.483	t	অম্বিকাপুর	Ambikapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2so01kgw88o0g59h535	cmozqxhyy0013zo8o01av8gas	Kanaipur	kanaipur-union	3577	2026-05-10 15:55:59.4	2026-05-10 16:53:00.49	t	কানাইপুর	Kanaipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2sy01khw88ox2f07lzy	cmozqxhyy0013zo8o01av8gas	Kaijuri	kaijuri-union	3578	2026-05-10 15:55:59.41	2026-05-10 16:53:00.498	t	কৈজুরী	Kaijuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2t701kiw88o0389rigb	cmozqxhyy0013zo8o01av8gas	Greda	greda-union	3579	2026-05-10 15:55:59.419	2026-05-10 16:53:00.506	t	গেরদা	Greda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2th01kjw88op4bebmvc	cmozwcwhh004v408oj79uw3k8	Buraich	buraich-union	3580	2026-05-10 15:55:59.429	2026-05-10 16:53:00.514	t	বুড়াইচ	Buraich	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2tq01kkw88oquat96mz	cmozwcwhh004v408oj79uw3k8	Alfadanga	alfadanga-union	3581	2026-05-10 15:55:59.438	2026-05-10 16:53:00.521	t	আলফাডাঙ্গা	Alfadanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2tz01klw88ourueeyzy	cmozwcwhh004v408oj79uw3k8	Tagarbanda	tagarbanda-union	3582	2026-05-10 15:55:59.447	2026-05-10 16:53:00.528	t	টগরবন্দ	Tagarbanda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2u901kmw88oso71lesf	cmozwcwhh004v408oj79uw3k8	Bana	bana-union	3583	2026-05-10 15:55:59.457	2026-05-10 16:53:00.535	t	বানা	Bana	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2uj01knw88odoa7tdeh	cmozwcwhh004v408oj79uw3k8	Panchuria	panchuria-union-1	3584	2026-05-10 15:55:59.467	2026-05-10 16:53:00.542	t	পাঁচুড়িয়া	Panchuria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2uw01kow88oawbk0q66	cmozwcwhh004v408oj79uw3k8	Gopalpur	gopalpur-union-4	3585	2026-05-10 15:55:59.48	2026-05-10 16:53:00.55	t	গোপালপুর	Gopalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2v601kpw88oub7ebj0q	cmozwcwht004x408ov978wc6m	Boalmari	boalmari-union	3586	2026-05-10 15:55:59.49	2026-05-10 16:53:00.557	t	বোয়ালমারী	Boalmari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2l201jpw88oaimg5udj	cmozwcwke0059408oehx8kn8q	Ghaghor	ghaghor-union	3549	2026-05-10 15:55:59.126	2026-05-10 16:53:00.294	t	ঘাঘর	Ghaghor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2lm01jqw88opwd45ls8	cmozwcwke0059408oehx8kn8q	Radhaganj	radhaganj-union	3550	2026-05-10 15:55:59.146	2026-05-10 16:53:00.301	t	রাধাগঞ্জ	Radhaganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2wm01kuw88ozyhdfy9i	cmozwcwht004x408ov978wc6m	Chandpur	chandpur-union-3	3591	2026-05-10 15:55:59.542	2026-05-10 16:53:00.593	t	চাঁদপুর	Chandpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2x401kww88o9x2gslbi	cmozwcwht004x408ov978wc6m	Satair	satair-union	3593	2026-05-10 15:55:59.56	2026-05-10 16:53:00.607	t	সাতৈর	Satair	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2xd01kxw88ok1c5a60d	cmozwcwht004x408ov978wc6m	Rupapat	rupapat-union	3594	2026-05-10 15:55:59.569	2026-05-10 16:53:00.614	t	রূপাপাত	Rupapat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2xn01kyw88o3ali1wb2	cmozwcwht004x408ov978wc6m	Shekhar	shekhar-union	3595	2026-05-10 15:55:59.579	2026-05-10 16:53:00.62	t	শেখর	Shekhar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2xw01kzw88og4t2cblg	cmozwcwht004x408ov978wc6m	Moyna	moyna-union	3596	2026-05-10 15:55:59.588	2026-05-10 16:53:00.627	t	ময়না	Moyna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2y501l0w88o3mivrvst	cmozwcwir0051408op6w94njt	Char Bisnopur	char-bisnopur-union	3597	2026-05-10 15:55:59.597	2026-05-10 16:53:00.634	t	চর বিষ্ণুপুর	Char Bisnopur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2yf01l1w88o8eajdzin	cmozwcwir0051408op6w94njt	Akoter Char	akoter-char-union	3598	2026-05-10 15:55:59.607	2026-05-10 16:53:00.64	t	আকোটের চর	Akoter Char	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2yo01l2w88o4rwrc4lm	cmozwcwir0051408op6w94njt	Char Nasirpur	char-nasirpur-union	3599	2026-05-10 15:55:59.616	2026-05-10 16:53:00.647	t	চর নাসিরপুর	Char Nasirpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2yy01l3w88oplami7dt	cmozwcwir0051408op6w94njt	Narikel Bariya	narikel-bariya-union	3600	2026-05-10 15:55:59.626	2026-05-10 16:53:00.654	t	নারিকেল বাড়িয়া	Narikel Bariya	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2z701l4w88oarp0mpin	cmozwcwir0051408op6w94njt	Bhashanchar	bhashanchar-union	3601	2026-05-10 15:55:59.635	2026-05-10 16:53:00.661	t	ভাষানচর	Bhashanchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2zi01l5w88ou4djdsag	cmozwcwir0051408op6w94njt	Krishnapur	krishnapur-union-2	3602	2026-05-10 15:55:59.646	2026-05-10 16:53:00.669	t	কৃষ্ণপুর	Krishnapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2zt01l6w88ofizjsqfi	cmozwcwir0051408op6w94njt	Sadarpur	sadarpur-union-1	3603	2026-05-10 15:55:59.657	2026-05-10 16:53:00.676	t	সদরপুর	Sadarpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg30201l7w88ouieku6ul	cmozwcwir0051408op6w94njt	Char Manair	char-manair-union	3604	2026-05-10 15:55:59.666	2026-05-10 16:53:00.684	t	চর মানাইর	Char Manair	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg30e01l8w88or2fdnlaq	cmozwcwir0051408op6w94njt	Dhaukhali	dhaukhali-union	3605	2026-05-10 15:55:59.678	2026-05-10 16:53:00.69	t	ঢেউখালী	Dhaukhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg30t01l9w88ou4gensnc	cmozwcwil0050408o35vzjv1l	Charjashordi	charjashordi-union	3606	2026-05-10 15:55:59.693	2026-05-10 16:53:00.697	t	চরযশোরদী	Charjashordi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg31201law88o6kxkvmah	cmozwcwil0050408o35vzjv1l	Purapara	purapara-union	3607	2026-05-10 15:55:59.702	2026-05-10 16:53:00.704	t	পুরাপাড়া	Purapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg31d01lbw88o690914aw	cmozwcwil0050408o35vzjv1l	Laskardia	laskardia-union	3608	2026-05-10 15:55:59.713	2026-05-10 16:53:00.712	t	লস্করদিয়া	Laskardia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg31p01lcw88o6u0jpcaq	cmozwcwil0050408o35vzjv1l	Ramnagar	ramnagar-union	3609	2026-05-10 15:55:59.725	2026-05-10 16:53:00.718	t	রামনগর	Ramnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg31z01ldw88ouawgt3p1	cmozwcwil0050408o35vzjv1l	Kaichail	kaichail-union	3610	2026-05-10 15:55:59.735	2026-05-10 16:53:00.724	t	কাইচাইল	Kaichail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg32901lew88o2f2oxvmi	cmozwcwil0050408o35vzjv1l	Talma	talma-union	3611	2026-05-10 15:55:59.745	2026-05-10 16:53:00.732	t	তালমা	Talma	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg32o01lfw88opmvyjyc2	cmozwcwil0050408o35vzjv1l	Fulsuti	fulsuti-union	3612	2026-05-10 15:55:59.76	2026-05-10 16:53:00.739	t	ফুলসুতি	Fulsuti	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg32x01lgw88oiyf2u37l	cmozwcwil0050408o35vzjv1l	Dangi	dangi-union	3613	2026-05-10 15:55:59.769	2026-05-10 16:53:00.746	t	ডাঙ্গী	Dangi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg33701lhw88onokh86wp	cmozwcwil0050408o35vzjv1l	Kodalia Shohidnagar	kodalia-shohidnagar-union	3614	2026-05-10 15:55:59.779	2026-05-10 16:53:00.753	t	কোদালিয়া শহিদনগর	Kodalia Shohidnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg33h01liw88o5bd6nto1	cmozwcwhn004w408oals5wrmf	Gharua	gharua-union	3615	2026-05-10 15:55:59.789	2026-05-10 16:53:00.76	t	ঘারুয়া	Gharua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg33q01ljw88oj2ds5y13	cmozwcwhn004w408oals5wrmf	Nurullagonj	nurullagonj-union	3616	2026-05-10 15:55:59.798	2026-05-10 16:53:00.767	t	নুরুল্যাগঞ্জ	Nurullagonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg34001lkw88o7wa65u3m	cmozwcwhn004w408oals5wrmf	Manikdha	manikdha-union	3617	2026-05-10 15:55:59.808	2026-05-10 16:53:00.774	t	মানিকদহ	Manikdha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg34901llw88odepdi3qw	cmozwcwhn004w408oals5wrmf	Kawlibera	kawlibera-union	3618	2026-05-10 15:55:59.817	2026-05-10 16:53:00.78	t	কাউলিবেড়া	Kawlibera	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg34k01lmw88onavz4bfv	cmozwcwhn004w408oals5wrmf	Nasirabad	nasirabad-union	3619	2026-05-10 15:55:59.828	2026-05-10 16:53:00.787	t	নাছিরাবাদ	Nasirabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg34t01lnw88ogt6znpsg	cmozwcwhn004w408oals5wrmf	Tujerpur	tujerpur-union	3620	2026-05-10 15:55:59.837	2026-05-10 16:53:00.793	t	তুজারপুর	Tujerpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg35301low88ouozhbl2f	cmozwcwhn004w408oals5wrmf	Algi	algi-union	3621	2026-05-10 15:55:59.847	2026-05-10 16:53:00.8	t	আলগী	Algi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg35c01lpw88o7w59dpz3	cmozwcwhn004w408oals5wrmf	Chumurdi	chumurdi-union	3622	2026-05-10 15:55:59.856	2026-05-10 16:53:00.806	t	চুমুরদী	Chumurdi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg35m01lqw88oqpojwurr	cmozwcwhn004w408oals5wrmf	Kalamridha	kalamridha-union	3623	2026-05-10 15:55:59.866	2026-05-10 16:53:00.812	t	কালামৃধা	Kalamridha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg35w01lrw88oxqtzm1j0	cmozwcwhn004w408oals5wrmf	Azimnagor	azimnagor-union	3624	2026-05-10 15:55:59.876	2026-05-10 16:53:00.819	t	আজিমনগর	Azimnagor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg36401lsw88oicr586i9	cmozwcwhn004w408oals5wrmf	Chandra	chandra-union	3625	2026-05-10 15:55:59.884	2026-05-10 16:53:00.826	t	চান্দ্রা	Chandra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg36f01ltw88oihawzim3	cmozwcwhn004w408oals5wrmf	Hamirdi	hamirdi-union	3626	2026-05-10 15:55:59.895	2026-05-10 16:53:00.833	t	হামিরদী	Hamirdi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2vy01ksw88on5e05x5s	cmozwcwht004x408ov978wc6m	Ghoshpur	ghoshpur-union	3589	2026-05-10 15:55:59.518	2026-05-10 16:53:00.578	t	ঘোষপুর	Ghoshpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2w801ktw88o3ljooxfw	cmozwcwht004x408ov978wc6m	Gunbaha	gunbaha-union	3590	2026-05-10 15:55:59.528	2026-05-10 16:53:00.586	t	গুনবহা	Gunbaha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg37g01lxw88ocnnlshxj	cmozwcwie004z408o5m7cfj5c	Megchami	megchami-union	3634	2026-05-10 15:55:59.932	2026-05-10 16:53:00.857	t	মেগচামী	Megchami	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg37s01lyw88o0xmib2jt	cmozwcwie004z408o5m7cfj5c	Raipur	raipur-union-1	3635	2026-05-10 15:55:59.944	2026-05-10 16:53:00.864	t	রায়পুর	Raipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg38001lzw88oi6sn9fbb	cmozwcwie004z408o5m7cfj5c	Bagat	bagat-union	3636	2026-05-10 15:55:59.952	2026-05-10 16:53:00.87	t	বাগাট	Bagat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg38a01m0w88odgx0lktt	cmozwcwie004z408o5m7cfj5c	Dumain	dumain-union	3637	2026-05-10 15:55:59.962	2026-05-10 16:53:00.877	t	ডুমাইন	Dumain	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg38l01m1w88o0nr8s5yn	cmozwcwie004z408o5m7cfj5c	Nowpara	nowpara-union-1	3638	2026-05-10 15:55:59.973	2026-05-10 16:53:00.883	t	নওপাড়া	Nowpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg38u01m2w88od30wlq85	cmozwcwie004z408o5m7cfj5c	Kamarkhali	kamarkhali-union	3639	2026-05-10 15:55:59.982	2026-05-10 16:53:00.889	t	কামারখালী	Kamarkhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg39401m3w88og61occum	cmozwcwiy0052408ognfm7rb7	Bhawal	bhawal-union	3640	2026-05-10 15:55:59.992	2026-05-10 16:53:00.896	t	ভাওয়াল	Bhawal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg39c01m4w88o9610tc7f	cmozwcwiy0052408ognfm7rb7	Atghar	atghar-union	3641	2026-05-10 15:56:00	2026-05-10 16:53:00.902	t	আটঘর	Atghar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg39p01m5w88oxlk78jkz	cmozwcwiy0052408ognfm7rb7	Mazadia	mazadia-union	3642	2026-05-10 15:56:00.013	2026-05-10 16:53:00.909	t	মাঝারদিয়া	Mazadia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg39z01m6w88ozbm3jt2f	cmozwcwiy0052408ognfm7rb7	Ballabhdi	ballabhdi-union	3643	2026-05-10 15:56:00.023	2026-05-10 16:53:00.915	t	বল্লভদী	Ballabhdi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3a801m7w88ojsmyw8up	cmozwcwiy0052408ognfm7rb7	Gatti	gatti-union	3644	2026-05-10 15:56:00.032	2026-05-10 16:53:00.921	t	গট্টি	Gatti	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3aj01m8w88o62v38456	cmozwcwiy0052408ognfm7rb7	Jadunandi	jadunandi-union	3645	2026-05-10 15:56:00.043	2026-05-10 16:53:00.927	t	যদুনন্দী	Jadunandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3b301maw88olne6ya2q	cmozwcwiy0052408ognfm7rb7	Sonapur	sonapur-union-1	3647	2026-05-10 15:56:00.063	2026-05-10 16:53:00.94	t	সোনাপুর	Sonapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3bd01mbw88omirtku1v	cmozwcyb400dy408oa2mrqqs6	Panchagarh Sadar	panchagarh-sadar-union	3648	2026-05-10 15:56:00.073	2026-05-10 16:53:00.946	t	পঞ্চগড় সদর	Panchagarh Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3bm01mcw88o4m5ki9jf	cmozwcyb400dy408oa2mrqqs6	Satmara	satmara-union	3649	2026-05-10 15:56:00.082	2026-05-10 16:53:00.953	t	সাতমেরা	Satmara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3bw01mdw88otnx9lhlj	cmozwcyb400dy408oa2mrqqs6	Amarkhana	amarkhana-union	3650	2026-05-10 15:56:00.092	2026-05-10 16:53:00.959	t	অমরখানা	Amarkhana	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3c401mew88o7u0o670p	cmozwcyb400dy408oa2mrqqs6	Haribhasa	haribhasa-union	3651	2026-05-10 15:56:00.1	2026-05-10 16:53:00.966	t	হাড়িভাসা	Haribhasa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3ce01mfw88oqsddtu5o	cmozwcyb400dy408oa2mrqqs6	Chaklahat	chaklahat-union	3652	2026-05-10 15:56:00.11	2026-05-10 16:53:00.973	t	চাকলাহাট	Chaklahat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3cn01mgw88oawpet7k6	cmozwcyb400dy408oa2mrqqs6	Hafizabad	hafizabad-union	3653	2026-05-10 15:56:00.119	2026-05-10 16:53:00.98	t	হাফিজাবাদ	Hafizabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3cx01mhw88ok51904qa	cmozwcyb400dy408oa2mrqqs6	Kamat Kajol Dighi	kamat-kajol-dighi-union	3654	2026-05-10 15:56:00.129	2026-05-10 16:53:00.986	t	কামাত কাজল দীঘি	Kamat Kajol Dighi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3d601miw88ofe4earkd	cmozwcyb400dy408oa2mrqqs6	Dhakkamara	dhakkamara-union	3655	2026-05-10 15:56:00.138	2026-05-10 16:53:00.993	t	ধাক্কামারা	Dhakkamara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3dh01mjw88o4rls477i	cmozwcyb400dy408oa2mrqqs6	Magura	magura-union-1	3656	2026-05-10 15:56:00.15	2026-05-10 16:53:01	t	মাগুরা	Magura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3ds01mkw88ofl1i8057	cmozwcyb400dy408oa2mrqqs6	Garinabari	garinabari-union	3657	2026-05-10 15:56:00.16	2026-05-10 16:53:01.008	t	গরিনাবাড়ী	Garinabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3e001mlw88oj0peyr42	cmozwcyaw00dx408ok3y5d60i	Chilahati	chilahati-union	3658	2026-05-10 15:56:00.168	2026-05-10 16:53:01.015	t	চিলাহাটি	Chilahati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3ea01mmw88onyilyqer	cmozwcyaw00dx408ok3y5d60i	Shaldanga	shaldanga-union	3659	2026-05-10 15:56:00.178	2026-05-10 16:53:01.022	t	শালডাঙ্গা	Shaldanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3ej01mnw88oy5aikchp	cmozwcyaw00dx408ok3y5d60i	Debiganj Sadar	debiganj-sadar-union	3660	2026-05-10 15:56:00.187	2026-05-10 16:53:01.029	t	দেবীগঞ্জ সদর	Debiganj Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3et01mow88op40zsy0t	cmozwcyaw00dx408ok3y5d60i	Pamuli	pamuli-union	3661	2026-05-10 15:56:00.197	2026-05-10 16:53:01.036	t	পামুলী	Pamuli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3f201mpw88ofjsd2oc8	cmozwcyaw00dx408ok3y5d60i	Sundardighi	sundardighi-union	3662	2026-05-10 15:56:00.206	2026-05-10 16:53:01.042	t	সুন্দরদিঘী	Sundardighi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3fb01mqw88oeq7i99tv	cmozwcyaw00dx408ok3y5d60i	Sonahar Mollikadaha	sonahar-mollikadaha-union	3663	2026-05-10 15:56:00.215	2026-05-10 16:53:01.05	t	সোনাহার মল্লিকাদহ	Sonahar Mollikadaha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3fk01mrw88ox1fvlpkf	cmozwcyaw00dx408ok3y5d60i	Tepriganj	tepriganj-union	3664	2026-05-10 15:56:00.224	2026-05-10 16:53:01.058	t	টেপ্রীগঞ্জ	Tepriganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3fs01msw88oxfmduu8h	cmozwcyaw00dx408ok3y5d60i	Dandopal	dandopal-union	3665	2026-05-10 15:56:00.232	2026-05-10 16:53:01.067	t	দন্ডপাল	Dandopal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3g301mtw88o8qkf89y6	cmozwcyaw00dx408ok3y5d60i	Debiduba	debiduba-union	3666	2026-05-10 15:56:00.243	2026-05-10 16:53:01.074	t	দেবীডুবা	Debiduba	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3gb01muw88ov0js54es	cmozwcyaw00dx408ok3y5d60i	Chengthi Hazra Danga	chengthi-hazra-danga-union	3667	2026-05-10 15:56:00.251	2026-05-10 16:53:01.083	t	চেংঠী হাজরা ডাঙ্গা	Chengthi Hazra Danga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3gl01mvw88o4priewna	cmozwcyan00dw408o1wyo02oa	Jholaishal Shiri	jholaishal-shiri-union	3668	2026-05-10 15:56:00.261	2026-05-10 16:53:01.089	t	ঝলইশাল শিরি	Jholaishal Shiri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg36x01lvw88o1nz6wqds	cmozwcwie004z408o5m7cfj5c	Jahapur	jahapur-union	3632	2026-05-10 15:55:59.913	2026-05-10 16:53:00.845	t	জাহাপুর	Jahapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg37701lww88ohwdzc0xv	cmozwcwie004z408o5m7cfj5c	Gazna	gazna-union	3633	2026-05-10 15:55:59.923	2026-05-10 16:53:00.851	t	গাজনা	Gazna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3hm01mzw88otwkw3w55	cmozwcyan00dw408o1wyo02oa	Boroshoshi	boroshoshi-union	3672	2026-05-10 15:56:00.298	2026-05-10 16:53:01.118	t	বড়শশী	Boroshoshi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3hy01n0w88oaekwk9em	cmozwcyan00dw408o1wyo02oa	Chandanbari	chandanbari-union	3673	2026-05-10 15:56:00.31	2026-05-10 16:53:01.125	t	চন্দনবাড়ী	Chandanbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3ia01n1w88ol1qgyw9a	cmozwcyan00dw408o1wyo02oa	Marea Bamonhat	marea-bamonhat-union	3674	2026-05-10 15:56:00.322	2026-05-10 16:53:01.133	t	মাড়েয়া বামনহাট	Marea Bamonhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3il01n2w88oov67h27k	cmozwcyan00dw408o1wyo02oa	Boda	boda-union	3675	2026-05-10 15:56:00.333	2026-05-10 16:53:01.139	t	বোদা	Boda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3iz01n3w88ot2zc5z4s	cmozwcyan00dw408o1wyo02oa	Sakoa	sakoa-union	3676	2026-05-10 15:56:00.347	2026-05-10 16:53:01.146	t	সাকোয়া	Sakoa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3jc01n4w88olr4syjb3	cmozwcyan00dw408o1wyo02oa	Pachpir	pachpir-union	3677	2026-05-10 15:56:00.36	2026-05-10 16:53:01.153	t	পাচপীর	Pachpir	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3jm01n5w88oxjreg7wv	cmozwcy2p00cs408o3axv0vza	Shibrampur	shibrampur-union	3701	2026-05-10 15:56:00.37	2026-05-10 16:53:01.16	t	শিবরামপুর	Shibrampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3jx01n6w88ow52nirfq	cmozwcy2p00cs408o3axv0vza	Polashbari	polashbari-union	3702	2026-05-10 15:56:00.381	2026-05-10 16:53:01.166	t	পলাশবাড়ী	Polashbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3k901n7w88o61y3svqg	cmozwcy2p00cs408o3axv0vza	Shatagram	shatagram-union	3703	2026-05-10 15:56:00.393	2026-05-10 16:53:01.172	t	শতগ্রাম	Shatagram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3kh01n8w88oyx0ole3a	cmozwcy2p00cs408o3axv0vza	Paltapur	paltapur-union	3704	2026-05-10 15:56:00.401	2026-05-10 16:53:01.179	t	পাল্টাপুর	Paltapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3kr01n9w88oitcvwwq2	cmozwcy2p00cs408o3axv0vza	Sujalpur	sujalpur-union	3705	2026-05-10 15:56:00.411	2026-05-10 16:53:01.185	t	সুজালপুর	Sujalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3l001naw88omqvm470u	cmozwcy2p00cs408o3axv0vza	Nijpara	nijpara-union	3706	2026-05-10 15:56:00.42	2026-05-10 16:53:01.191	t	নিজপাড়া	Nijpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3ll01ncw88o0ccagmgk	cmozwcy2p00cs408o3axv0vza	Bhognagar	bhognagar-union	3708	2026-05-10 15:56:00.441	2026-05-10 16:53:01.203	t	ভোগনগর	Bhognagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3lu01ndw88oymta5g4m	cmozwcy2p00cs408o3axv0vza	Sator	sator-union	3709	2026-05-10 15:56:00.45	2026-05-10 16:53:01.21	t	সাতোর	Sator	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3m701new88oa9uyzaum	cmozwcy2p00cs408o3axv0vza	Mohonpur	mohonpur-union-3	3710	2026-05-10 15:56:00.463	2026-05-10 16:53:01.217	t	মোহনপুর	Mohonpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3mi01nfw88orzw3cur2	cmozwcy2p00cs408o3axv0vza	Moricha	moricha-union-1	3711	2026-05-10 15:56:00.474	2026-05-10 16:53:01.223	t	মরিচা	Moricha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3mr01ngw88o9xn32329	cmozwcy3q00cy408oq0v07k8m	Bulakipur	bulakipur-union	3712	2026-05-10 15:56:00.483	2026-05-10 16:53:01.23	t	বুলাকীপুর	Bulakipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3n101nhw88oly3asv12	cmozwcy3q00cy408oq0v07k8m	Palsha	palsha-union	3713	2026-05-10 15:56:00.493	2026-05-10 16:53:01.236	t	পালশা	Palsha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3n901niw88ozq4trwti	cmozwcy3q00cy408oq0v07k8m	Singra	singra-union	3714	2026-05-10 15:56:00.501	2026-05-10 16:53:01.242	t	সিংড়া	Singra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3nj01njw88oulqrfblo	cmozwcy3q00cy408oq0v07k8m	Ghoraghat	ghoraghat-union	3715	2026-05-10 15:56:00.511	2026-05-10 16:53:01.25	t	ঘোড়াঘাট	Ghoraghat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3ns01nkw88ora9cwi3k	cmozwcy2j00cr408odifl8irz	Mukundopur	mukundopur-union	3716	2026-05-10 15:56:00.521	2026-05-10 16:53:01.256	t	মুকুন্দপুর	Mukundopur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3o301nlw88ok90et9e6	cmozwcy2j00cr408odifl8irz	Katla	katla-union	3717	2026-05-10 15:56:00.531	2026-05-10 16:53:01.262	t	কাটলা	Katla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3og01nmw88opsoou0jd	cmozwcy2j00cr408odifl8irz	Khanpur	khanpur-union-3	3718	2026-05-10 15:56:00.544	2026-05-10 16:53:01.268	t	খানপুর	Khanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3op01nnw88ocrvn73pp	cmozwcy2j00cr408odifl8irz	Dior	dior-union	3719	2026-05-10 15:56:00.553	2026-05-10 16:53:01.274	t	দিওড়	Dior	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3oy01now88off5t57ok	cmozwcy2j00cr408odifl8irz	Binail	binail-union	3720	2026-05-10 15:56:00.562	2026-05-10 16:53:01.281	t	বিনাইল	Binail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3p901npw88omqdhl5qq	cmozwcy2j00cr408odifl8irz	Jatbani	jatbani-union	3721	2026-05-10 15:56:00.573	2026-05-10 16:53:01.287	t	জোতবানী	Jatbani	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3pj01nqw88o0t9qa7be	cmozwcy2j00cr408odifl8irz	Poliproyagpur	poliproyagpur-union	3722	2026-05-10 15:56:00.583	2026-05-10 16:53:01.294	t	পলিপ্রয়াগপুর	Poliproyagpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3pu01nrw88oph86d8bi	cmozwcy4l00d3408ot4der4hh	Belaichandi	belaichandi-union	3723	2026-05-10 15:56:00.594	2026-05-10 16:53:01.301	t	বেলাইচন্ডি	Belaichandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3q301nsw88op439deig	cmozwcy4l00d3408ot4der4hh	Monmothopur	monmothopur-union	3724	2026-05-10 15:56:00.603	2026-05-10 16:53:01.307	t	মন্মথপুর	Monmothopur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3qd01ntw88opfbagxlw	cmozwcy4l00d3408ot4der4hh	Rampur	rampur-union	3725	2026-05-10 15:56:00.613	2026-05-10 16:53:01.314	t	রামপুর	Rampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3qp01nuw88olhkm3an7	cmozwcy4l00d3408ot4der4hh	Polashbari	polashbari-union-1	3726	2026-05-10 15:56:00.625	2026-05-10 16:53:01.32	t	পলাশবাড়ী	Polashbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3qz01nvw88ohf0zlu33	cmozwcy4l00d3408ot4der4hh	Chandipur	chandipur-union-1	3727	2026-05-10 15:56:00.635	2026-05-10 16:53:01.326	t	চন্ডীপুর	Chandipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3rb01nww88o4qvof041	cmozwcy4l00d3408ot4der4hh	Mominpur	mominpur-union-1	3728	2026-05-10 15:56:00.647	2026-05-10 16:53:01.332	t	মোমিনপুর	Mominpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3rl01nxw88o3xw89bgs	cmozwcy4l00d3408ot4der4hh	Mostofapur	mostofapur-union	3729	2026-05-10 15:56:00.657	2026-05-10 16:53:01.338	t	মোস্তফাপুর	Mostofapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3rv01nyw88o2bm91lzr	cmozwcy4l00d3408ot4der4hh	Habra	habra-union	3730	2026-05-10 15:56:00.667	2026-05-10 16:53:01.344	t	হাবড়া	Habra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3h401mxw88odeagq13c	cmozwcyan00dw408o1wyo02oa	Banghari	banghari-union	3670	2026-05-10 15:56:00.28	2026-05-10 16:53:01.104	t	বেংহারী	Banghari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3he01myw88ojbkq0t9t	cmozwcyan00dw408o1wyo02oa	Kajoldighi Kaligonj	kajoldighi-kaligonj-union	3671	2026-05-10 15:56:00.29	2026-05-10 16:53:01.111	t	কাজলদীঘি কালিগঞ্জ	Kajoldighi Kaligonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3t401o2w88os2seimjg	cmozwcy3100cu408ox4zjayq4	Eshania	eshania-union	3734	2026-05-10 15:56:00.712	2026-05-10 16:53:01.369	t	ঈশানিয়া	Eshania	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3te01o3w88onaijyj2t	cmozwcy3100cu408ox4zjayq4	Atgaon	atgaon-union-1	3735	2026-05-10 15:56:00.722	2026-05-10 16:53:01.376	t	আটগাঁও	Atgaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3tn01o4w88oouz9zsbm	cmozwcy3100cu408ox4zjayq4	Shatail	shatail-union	3736	2026-05-10 15:56:00.731	2026-05-10 16:53:01.382	t	ছাতইল	Shatail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3tx01o5w88ou5a4t8wb	cmozwcy3100cu408ox4zjayq4	Rongaon	rongaon-union	3737	2026-05-10 15:56:00.741	2026-05-10 16:53:01.389	t	রনগাঁও	Rongaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3u501o6w88ophjwnyfi	cmozwcy3100cu408ox4zjayq4	Murshidhat	murshidhat-union	3738	2026-05-10 15:56:00.749	2026-05-10 16:53:01.395	t	মুর্শিদহাট	Murshidhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3ug01o7w88o5j9atddy	cmozwcy3k00cx408ojdl8um18	Aloary	aloary-union	3745	2026-05-10 15:56:00.76	2026-05-10 16:53:01.401	t	এলুয়াড়ী	Aloary	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3uo01o8w88oznb87262	cmozwcy3k00cx408ojdl8um18	Aladipur	aladipur-union	3746	2026-05-10 15:56:00.768	2026-05-10 16:53:01.408	t	আলাদিপুর	Aladipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3v001o9w88omk46f68i	cmozwcy3k00cx408ojdl8um18	Kagihal	kagihal-union	3747	2026-05-10 15:56:00.78	2026-05-10 16:53:01.414	t	কাজীহাল	Kagihal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3va01oaw88o9zurmsma	cmozwcy3k00cx408ojdl8um18	Bethdighi	bethdighi-union	3748	2026-05-10 15:56:00.79	2026-05-10 16:53:01.421	t	বেতদিঘী	Bethdighi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3vj01obw88ob77ubfrf	cmozwcy3k00cx408ojdl8um18	Khairbari	khairbari-union	3749	2026-05-10 15:56:00.799	2026-05-10 16:53:01.427	t	খয়েরবাড়ী	Khairbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3vw01ocw88opb3jtjvg	cmozwcy3k00cx408ojdl8um18	Daulatpur	daulatpur-union-4	3750	2026-05-10 15:56:00.812	2026-05-10 16:53:01.433	t	দৌলতপুর	Daulatpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3w601odw88oxakrhwf6	cmozwcy3k00cx408ojdl8um18	Shibnagor	shibnagor-union	3751	2026-05-10 15:56:00.822	2026-05-10 16:53:01.44	t	শিবনগর	Shibnagor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3wf01oew88ox56ewwwv	cmozwcy3e00cw408oshexlyku	Chealgazi	chealgazi-union	3752	2026-05-10 15:56:00.831	2026-05-10 16:53:01.446	t	চেহেলগাজী	Chealgazi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3wp01ofw88oexb0iu7h	cmozwcy3e00cw408oshexlyku	Sundorbon	sundorbon-union	3753	2026-05-10 15:56:00.841	2026-05-10 16:53:01.452	t	সুন্দরবন	Sundorbon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3wy01ogw88oaihqrthi	cmozwcy3e00cw408oshexlyku	Fazilpur	fazilpur-union	3754	2026-05-10 15:56:00.85	2026-05-10 16:53:01.459	t	ফাজিলপুর	Fazilpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3x801ohw88oif53l3m4	cmozwcy3e00cw408oshexlyku	Shekpura	shekpura-union	3755	2026-05-10 15:56:00.86	2026-05-10 16:53:01.466	t	শেখপুরা	Shekpura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3xg01oiw88ol5q6rwyz	cmozwcy3e00cw408oshexlyku	Shashora	shashora-union	3756	2026-05-10 15:56:00.868	2026-05-10 16:53:01.472	t	শশরা	Shashora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3xr01ojw88obnmslutw	cmozwcy3e00cw408oshexlyku	Auliapur	auliapur-union-1	3757	2026-05-10 15:56:00.879	2026-05-10 16:53:01.479	t	আউলিয়াপুর	Auliapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3y001okw88off7cw2oe	cmozwcy3e00cw408oshexlyku	Uthrail	uthrail-union	3758	2026-05-10 15:56:00.888	2026-05-10 16:53:01.485	t	উথরাইল	Uthrail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3ya01olw88o0qr9yzm1	cmozwcy3e00cw408oshexlyku	Sankarpur	sankarpur-union	3759	2026-05-10 15:56:00.898	2026-05-10 16:53:01.491	t	শংকরপুর	Sankarpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3yj01omw88o8crg9tq6	cmozwcy3e00cw408oshexlyku	Askorpur	askorpur-union	3760	2026-05-10 15:56:00.907	2026-05-10 16:53:01.498	t	আস্করপুর	Askorpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3ys01onw88o9dfeevhd	cmozwcy3e00cw408oshexlyku	Kamalpur	kamalpur-union-1	3761	2026-05-10 15:56:00.916	2026-05-10 16:53:01.504	t	কমলপুর	Kamalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3z301oow88oavmgzpdy	cmozwcy3w00cz408o87kpbjb4	Alihat	alihat-union	3762	2026-05-10 15:56:00.927	2026-05-10 16:53:01.511	t	আলীহাট	Alihat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3zm01oqw88od86grdh4	cmozwcy3w00cz408o87kpbjb4	Boalder	boalder-union	3764	2026-05-10 15:56:00.946	2026-05-10 16:53:01.525	t	বোয়ালদার	Boalder	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3zv01orw88oxl53hdp3	cmozwcy4800d1408o7tl4ahhw	Alokjhari	alokjhari-union	3765	2026-05-10 15:56:00.955	2026-05-10 16:53:01.532	t	আলোকঝাড়ী	Alokjhari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg40501osw88oyx2wqvsr	cmozwcy4800d1408o7tl4ahhw	Bherbheri	bherbheri-union	3766	2026-05-10 15:56:00.965	2026-05-10 16:53:01.539	t	ভেড়ভেড়ী	Bherbheri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg40f01otw88on8ax9317	cmozwcy4800d1408o7tl4ahhw	Angarpara	angarpara-union	3767	2026-05-10 15:56:00.975	2026-05-10 16:53:01.546	t	আঙ্গারপাড়া	Angarpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg40n01ouw88ohqv2donm	cmozwcy4800d1408o7tl4ahhw	Goaldihi	goaldihi-union	3768	2026-05-10 15:56:00.983	2026-05-10 16:53:01.552	t	গোয়ালডিহি	Goaldihi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg40y01ovw88ocqyijgd8	cmozwcy4800d1408o7tl4ahhw	Bhabki	bhabki-union	3769	2026-05-10 15:56:00.994	2026-05-10 16:53:01.558	t	ভাবকী	Bhabki	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg41701oww88od5l62zho	cmozwcy4800d1408o7tl4ahhw	Khamarpara	khamarpara-union	3770	2026-05-10 15:56:01.003	2026-05-10 16:53:01.564	t	খামারপাড়া	Khamarpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg41j01oxw88ozwtqni80	cmozwcy2v00ct408ospodesr3	Azimpur	azimpur-union	3771	2026-05-10 15:56:01.015	2026-05-10 16:53:01.571	t	আজিমপুর	Azimpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg41u01oyw88oe2ah2c02	cmozwcy2v00ct408ospodesr3	Farakkabad	farakkabad-union	3772	2026-05-10 15:56:01.026	2026-05-10 16:53:01.577	t	ফরাক্কাবাদ	Farakkabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg42401ozw88orte8ce87	cmozwcy2v00ct408ospodesr3	Dhamoir	dhamoir-union	3773	2026-05-10 15:56:01.036	2026-05-10 16:53:01.584	t	ধামইর	Dhamoir	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg42e01p0w88o8zu5bvkd	cmozwcy2v00ct408ospodesr3	Shohorgram	shohorgram-union	3774	2026-05-10 15:56:01.046	2026-05-10 16:53:01.591	t	শহরগ্রাম	Shohorgram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg42p01p1w88obz8gsv2l	cmozwcy2v00ct408ospodesr3	Birol	birol-union	3775	2026-05-10 15:56:01.057	2026-05-10 16:53:01.598	t	বিরল	Birol	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3sl01o0w88ovbx17318	cmozwcy4l00d3408ot4der4hh	Harirampur	harirampur-union	3732	2026-05-10 15:56:00.693	2026-05-10 16:53:01.356	t	হরিরামপুর	Harirampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3su01o1w88ojn8w5csh	cmozwcy3100cu408ox4zjayq4	Nafanagar	nafanagar-union	3733	2026-05-10 15:56:00.702	2026-05-10 16:53:01.363	t	নাফানগর	Nafanagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg43r01p5w88o3bnpgg15	cmozwcy2v00ct408ospodesr3	Mongalpur	mongalpur-union	3779	2026-05-10 15:56:01.095	2026-05-10 16:53:01.624	t	মঙ্গলপুর	Mongalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg44201p6w88oxng3w2kw	cmozwcy2v00ct408ospodesr3	Ranipukur	ranipukur-union	3780	2026-05-10 15:56:01.106	2026-05-10 16:53:01.631	t	রাণীপুকুর	Ranipukur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg44b01p7w88o362iceny	cmozwcy2v00ct408ospodesr3	Rajarampur	rajarampur-union	3781	2026-05-10 15:56:01.115	2026-05-10 16:53:01.637	t	রাজারামপুর	Rajarampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg44l01p8w88o7tpa3on8	cmozwcy3700cv408oijj6w4s3	Nashratpur	nashratpur-union	3782	2026-05-10 15:56:01.125	2026-05-10 16:53:01.643	t	নশরতপুর	Nashratpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg44u01p9w88obiiuq3vf	cmozwcy3700cv408oijj6w4s3	Satnala	satnala-union	3783	2026-05-10 15:56:01.134	2026-05-10 16:53:01.651	t	সাতনালা	Satnala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg45501paw88o5q04p7c7	cmozwcy3700cv408oijj6w4s3	Fatejangpur	fatejangpur-union	3784	2026-05-10 15:56:01.145	2026-05-10 16:53:01.658	t	ফতেজংপুর	Fatejangpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg45e01pbw88ojjwyf08c	cmozwcy3700cv408oijj6w4s3	Isobpur	isobpur-union	3785	2026-05-10 15:56:01.154	2026-05-10 16:53:01.665	t	ইসবপুর	Isobpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg45p01pcw88oqo0gptcs	cmozwcy3700cv408oijj6w4s3	Abdulpur	abdulpur-union-1	3786	2026-05-10 15:56:01.165	2026-05-10 16:53:01.671	t	আব্দুলপুর	Abdulpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg45z01pdw88ohwcesrni	cmozwcy3700cv408oijj6w4s3	Amarpur	amarpur-union	3787	2026-05-10 15:56:01.175	2026-05-10 16:53:01.678	t	অমরপুর	Amarpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg46801pew88oikka4akh	cmozwcy3700cv408oijj6w4s3	Auliapukur	auliapukur-union	3788	2026-05-10 15:56:01.184	2026-05-10 16:53:01.684	t	আউলিয়াপুকুর	Auliapukur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg46i01pfw88ou7uookzv	cmozwcy3700cv408oijj6w4s3	Saitara	saitara-union	3789	2026-05-10 15:56:01.194	2026-05-10 16:53:01.691	t	সাইতারা	Saitara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg46s01pgw88o7o2bi7z0	cmozwcy3700cv408oijj6w4s3	Viail	viail-union	3790	2026-05-10 15:56:01.204	2026-05-10 16:53:01.697	t	ভিয়াইল	Viail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg47201phw88ofz4tmzvu	cmozwcy3700cv408oijj6w4s3	Punotti	punotti-union	3791	2026-05-10 15:56:01.214	2026-05-10 16:53:01.704	t	পুনট্টি	Punotti	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg47f01piw88obsy26k13	cmozwcy3700cv408oijj6w4s3	Tetulia	tetulia-union-2	3792	2026-05-10 15:56:01.227	2026-05-10 16:53:01.71	t	তেতুলিয়া	Tetulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg47o01pjw88oztzo7lvs	cmozwcy3700cv408oijj6w4s3	Alokdihi	alokdihi-union	3793	2026-05-10 15:56:01.236	2026-05-10 16:53:01.717	t	আলোকডিহি	Alokdihi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg47z01pkw88on86bj06y	cmozwcy8j00dn408oqcyqccdh	Rajpur	rajpur-union	3794	2026-05-10 15:56:01.247	2026-05-10 16:53:01.723	t	রাজপুর	Rajpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg48a01plw88oog31ybv5	cmozwcy8j00dn408oqcyqccdh	Harati	harati-union	3795	2026-05-10 15:56:01.258	2026-05-10 16:53:01.729	t	হারাটি	Harati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg48j01pmw88owr10xojb	cmozwcy8j00dn408oqcyqccdh	Mogolhat	mogolhat-union	3796	2026-05-10 15:56:01.267	2026-05-10 16:53:01.735	t	মোগলহাট	Mogolhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg48u01pnw88ov0t5wfsv	cmozwcy8j00dn408oqcyqccdh	Gokunda	gokunda-union	3797	2026-05-10 15:56:01.278	2026-05-10 16:53:01.741	t	গোকুন্ডা	Gokunda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg49501pow88ozbsj17tc	cmozwcy8j00dn408oqcyqccdh	Barobari	barobari-union	3798	2026-05-10 15:56:01.289	2026-05-10 16:53:01.747	t	বড়বাড়ী	Barobari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg49f01ppw88ooomt970l	cmozwcy8j00dn408oqcyqccdh	Kulaghat	kulaghat-union	3799	2026-05-10 15:56:01.299	2026-05-10 16:53:01.754	t	কুলাঘাট	Kulaghat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg49z01prw88ohmixcfz1	cmozwcy8j00dn408oqcyqccdh	Khuniagachh	khuniagachh-union	3801	2026-05-10 15:56:01.319	2026-05-10 16:53:01.766	t	খুনিয়াগাছ	Khuniagachh	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4aa01psw88oel1l7akp	cmozwcy8j00dn408oqcyqccdh	Panchagram	panchagram-union	3802	2026-05-10 15:56:01.33	2026-05-10 16:53:01.773	t	পঞ্চগ্রাম	Panchagram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4ak01ptw88o40m00w1c	cmozwcy8b00dm408o6wq1n0nv	Bhotmari	bhotmari-union	3803	2026-05-10 15:56:01.34	2026-05-10 16:53:01.779	t	ভোটমারী	Bhotmari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4at01puw88owim5vvnd	cmozwcy8b00dm408o6wq1n0nv	Modati	modati-union	3804	2026-05-10 15:56:01.349	2026-05-10 16:53:01.786	t	মদাতী	Modati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4b401pvw88ozq4letlj	cmozwcy8b00dm408o6wq1n0nv	Dologram	dologram-union	3805	2026-05-10 15:56:01.36	2026-05-10 16:53:01.792	t	দলগ্রাম	Dologram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4bd01pww88od7ufrkrr	cmozwcy8b00dm408o6wq1n0nv	Tushbhandar	tushbhandar-union	3806	2026-05-10 15:56:01.369	2026-05-10 16:53:01.799	t	তুষভান্ডার	Tushbhandar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4bn01pxw88oojegryws	cmozwcy8b00dm408o6wq1n0nv	Goral	goral-union	3807	2026-05-10 15:56:01.379	2026-05-10 16:53:01.805	t	গোড়ল	Goral	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4bx01pyw88onnw1vwn8	cmozwcy8b00dm408o6wq1n0nv	Chondropur	chondropur-union	3808	2026-05-10 15:56:01.389	2026-05-10 16:53:01.811	t	চন্দ্রপুর	Chondropur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4c601pzw88o5aartwsg	cmozwcy8b00dm408o6wq1n0nv	Cholbola	cholbola-union	3809	2026-05-10 15:56:01.398	2026-05-10 16:53:01.818	t	চলবলা	Cholbola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4ch01q0w88ohgoa28nz	cmozwcy8b00dm408o6wq1n0nv	Kakina	kakina-union	3810	2026-05-10 15:56:01.409	2026-05-10 16:53:01.824	t	কাকিনা	Kakina	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4cq01q1w88obcjo5q27	cmozwcy7y00dl408ot3kb5afz	Barokhata	barokhata-union	3811	2026-05-10 15:56:01.418	2026-05-10 16:53:01.83	t	বড়খাতা	Barokhata	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4d101q2w88orny0g3r9	cmozwcy7y00dl408ot3kb5afz	Goddimari	goddimari-union	3812	2026-05-10 15:56:01.429	2026-05-10 16:53:01.836	t	গড্ডিমারী	Goddimari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4dc01q3w88on2s4rw2x	cmozwcy7y00dl408ot3kb5afz	Singimari	singimari-union	3813	2026-05-10 15:56:01.44	2026-05-10 16:53:01.843	t	সিংগীমারী	Singimari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4dl01q4w88opurzxy7o	cmozwcy7y00dl408ot3kb5afz	Tongvhanga	tongvhanga-union	3814	2026-05-10 15:56:01.449	2026-05-10 16:53:01.849	t	টংভাঙ্গা	Tongvhanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg43701p3w88o8rhfyw77	cmozwcy2v00ct408ospodesr3	Bijora	bijora-union	3777	2026-05-10 15:56:01.076	2026-05-10 16:53:01.612	t	বিজোড়া	Bijora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg43g01p4w88o0ahewz0j	cmozwcy2v00ct408ospodesr3	Dharmapur	dharmapur-union	3778	2026-05-10 15:56:01.084	2026-05-10 16:53:01.618	t	ধর্মপুর	Dharmapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4eq01q8w88o7ciyjrm4	cmozwcy7y00dl408ot3kb5afz	Gotamari	gotamari-union	3818	2026-05-10 15:56:01.49	2026-05-10 16:53:01.875	t	গোতামারী	Gotamari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4ez01q9w88otjxjz9j8	cmozwcy7y00dl408ot3kb5afz	Vhelaguri	vhelaguri-union	3819	2026-05-10 15:56:01.499	2026-05-10 16:53:01.881	t	ভেলাগুড়ি	Vhelaguri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4fa01qaw88oosun7o37	cmozwcy7y00dl408ot3kb5afz	Shaniajan	shaniajan-union	3820	2026-05-10 15:56:01.51	2026-05-10 16:53:01.887	t	সানিয়াজান	Shaniajan	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4fj01qbw88ojio6jgae	cmozwcy7y00dl408ot3kb5afz	Fakirpara	fakirpara-union	3821	2026-05-10 15:56:01.519	2026-05-10 16:53:01.894	t	ফকিরপাড়া	Fakirpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4ft01qcw88ofdeuoa6e	cmozwcy7y00dl408ot3kb5afz	Dawabari	dawabari-union	3822	2026-05-10 15:56:01.529	2026-05-10 16:53:01.9	t	ডাউয়াবাড়ী	Dawabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4g501qdw88olidr2uue	cmozwcy8s00do408o2vmm0nf1	Sreerampur	sreerampur-union-1	3823	2026-05-10 15:56:01.541	2026-05-10 16:53:01.906	t	শ্রীরামপুর	Sreerampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4ge01qew88o8alj4ryc	cmozwcy8s00do408o2vmm0nf1	Patgram	patgram-union	3824	2026-05-10 15:56:01.55	2026-05-10 16:53:01.912	t	পাটগ্রাম	Patgram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4gp01qfw88ol65a8unv	cmozwcy8s00do408o2vmm0nf1	Jagatber	jagatber-union	3825	2026-05-10 15:56:01.561	2026-05-10 16:53:01.918	t	জগতবেড়	Jagatber	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4gz01qgw88o9a8cva0p	cmozwcy8s00do408o2vmm0nf1	Kuchlibari	kuchlibari-union	3826	2026-05-10 15:56:01.571	2026-05-10 16:53:01.924	t	কুচলিবাড়ী	Kuchlibari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4h901qhw88om4azzx4j	cmozwcy8s00do408o2vmm0nf1	Jongra	jongra-union	3827	2026-05-10 15:56:01.581	2026-05-10 16:53:01.931	t	জোংড়া	Jongra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4hk01qiw88o4s4uq4oy	cmozwcy8s00do408o2vmm0nf1	Baura	baura-union	3828	2026-05-10 15:56:01.592	2026-05-10 16:53:01.939	t	বাউড়া	Baura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4ht01qjw88o3j429xs3	cmozwcy8s00do408o2vmm0nf1	Dahagram	dahagram-union	3829	2026-05-10 15:56:01.601	2026-05-10 16:53:01.947	t	দহগ্রাম	Dahagram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4i401qkw88oyehnxldx	cmozwcy8s00do408o2vmm0nf1	Burimari	burimari-union	3830	2026-05-10 15:56:01.612	2026-05-10 16:53:01.956	t	বুড়িমারী	Burimari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4ie01qlw88ocvne5onf	cmozwcy7s00dk408ol6s6sryx	Bhelabari	bhelabari-union	3831	2026-05-10 15:56:01.622	2026-05-10 16:53:01.962	t	ভেলাবাড়ী	Bhelabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4in01qmw88o5t7ud2xb	cmozwcy7s00dk408ol6s6sryx	Bhadai	bhadai-union	3832	2026-05-10 15:56:01.631	2026-05-10 16:53:01.969	t	ভাদাই	Bhadai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4iy01qnw88ornp8hsst	cmozwcy7s00dk408ol6s6sryx	Kamlabari	kamlabari-union	3833	2026-05-10 15:56:01.642	2026-05-10 16:53:01.976	t	কমলাবাড়ী	Kamlabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4je01qow88ogofpcmsf	cmozwcy7s00dk408ol6s6sryx	Durgapur	durgapur-union-5	3834	2026-05-10 15:56:01.658	2026-05-10 16:53:01.983	t	দূর্গাপুর	Durgapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4jo01qpw88op7d5h2fk	cmozwcy7s00dk408ol6s6sryx	Sarpukur	sarpukur-union	3835	2026-05-10 15:56:01.668	2026-05-10 16:53:01.99	t	সারপুকুর	Sarpukur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4jy01qqw88o2oknidij	cmozwcy7s00dk408ol6s6sryx	Saptibari	saptibari-union	3836	2026-05-10 15:56:01.678	2026-05-10 16:53:01.999	t	সাপ্টিবাড়ী	Saptibari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4k901qrw88ox5dfzyre	cmozwcy7s00dk408ol6s6sryx	Palashi	palashi-union	3837	2026-05-10 15:56:01.689	2026-05-10 16:53:02.008	t	পলাশী	Palashi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4kj01qsw88o3niwjglz	cmozwcy7s00dk408ol6s6sryx	Mohishkhocha	mohishkhocha-union	3838	2026-05-10 15:56:01.699	2026-05-10 16:53:02.017	t	মহিষখোচা	Mohishkhocha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4kt01qtw88olo7x8pg6	cmozwcy9800dq408o1aej365k	Gomnati	gomnati-union	3844	2026-05-10 15:56:01.709	2026-05-10 16:53:02.024	t	গোমনাতি	Gomnati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4l101quw88ofne5ph05	cmozwcy9800dq408o1aej365k	Bhogdaburi	bhogdaburi-union	3845	2026-05-10 15:56:01.717	2026-05-10 16:53:02.031	t	ভোগডাবুড়ী	Bhogdaburi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4lc01qvw88omw7lsv6n	cmozwcy9800dq408o1aej365k	Ketkibari	ketkibari-union	3846	2026-05-10 15:56:01.728	2026-05-10 16:53:02.037	t	কেতকীবাড়ী	Ketkibari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4lo01qww88ojcoyn4zg	cmozwcy9800dq408o1aej365k	Jorabari	jorabari-union	3847	2026-05-10 15:56:01.74	2026-05-10 16:53:02.044	t	জোড়াবাড়ী	Jorabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4lx01qxw88ogqxoi7bq	cmozwcy9800dq408o1aej365k	Bamunia	bamunia-union	3848	2026-05-10 15:56:01.749	2026-05-10 16:53:02.052	t	বামুনীয়া	Bamunia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4m801qyw88otr0ctnqq	cmozwcy9800dq408o1aej365k	Panga Motukpur	panga-motukpur-union	3849	2026-05-10 15:56:01.76	2026-05-10 16:53:02.059	t	পাংগা মটকপুর	Panga Motukpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4mh01qzw88oc0oxj5go	cmozwcy9800dq408o1aej365k	Boragari	boragari-union	3850	2026-05-10 15:56:01.769	2026-05-10 16:53:02.066	t	বোড়াগাড়ী	Boragari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4mr01r0w88o9s5hz77h	cmozwcy9800dq408o1aej365k	Domar	domar-union	3851	2026-05-10 15:56:01.779	2026-05-10 16:53:02.072	t	ডোমার	Domar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4n101r1w88oqppybhod	cmozwcy9800dq408o1aej365k	Sonaray	sonaray-union	3852	2026-05-10 15:56:01.789	2026-05-10 16:53:02.078	t	সোনারায়	Sonaray	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4nb01r2w88obq69y6v1	cmozwcy9800dq408o1aej365k	Harinchara	harinchara-union	3853	2026-05-10 15:56:01.799	2026-05-10 16:53:02.085	t	হরিণচরা	Harinchara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4nw01r4w88opuam09gq	cmozwcy9000dp408ogs5j27h4	Balapara	balapara-union	3855	2026-05-10 15:56:01.82	2026-05-10 16:53:02.097	t	বালাপাড়া	Balapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4o601r5w88ow83732j4	cmozwcy9000dp408ogs5j27h4	Dimla Sadar	dimla-sadar-union	3856	2026-05-10 15:56:01.83	2026-05-10 16:53:02.103	t	ডিমলা সদর	Dimla Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4oh01r6w88ooau3c17v	cmozwcy9000dp408ogs5j27h4	Khogakharibari	khogakharibari-union	3857	2026-05-10 15:56:01.841	2026-05-10 16:53:02.11	t	খগা খড়িবাড়ী	Khogakharibari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4e401q6w88oy26racf5	cmozwcy7y00dl408ot3kb5afz	Paticapara	paticapara-union	3816	2026-05-10 15:56:01.468	2026-05-10 16:53:01.862	t	পাটিকাপাড়া	Paticapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4ef01q7w88oj2db95vq	cmozwcy7y00dl408ot3kb5afz	Nowdabas	nowdabas-union	3817	2026-05-10 15:56:01.479	2026-05-10 16:53:01.869	t	নওদাবাস	Nowdabas	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4pt01rbw88o66yvmiq1	cmozwcy9000dp408ogs5j27h4	Tepa Khribari	tepa-khribari-union	3862	2026-05-10 15:56:01.889	2026-05-10 16:53:02.14	t	টেপা খরীবাড়ী	Tepa Khribari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4q201rcw88oex8tez90	cmozwcy9000dp408ogs5j27h4	Purba Chhatnay	purba-chhatnay-union	3863	2026-05-10 15:56:01.898	2026-05-10 16:53:02.148	t	পুর্ব ছাতনাই	Purba Chhatnay	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4qd01rdw88olw93b512	cmozwcy9f00dr408o4j6krrwl	Douabari	douabari-union	3864	2026-05-10 15:56:01.909	2026-05-10 16:53:02.155	t	ডাউয়াবাড়ী	Douabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4qn01rew88oi8u6ndf0	cmozwcy9f00dr408o4j6krrwl	Golmunda	golmunda-union	3865	2026-05-10 15:56:01.919	2026-05-10 16:53:02.161	t	গোলমুন্ডা	Golmunda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4qx01rfw88o8ix3ie0t	cmozwcy9f00dr408o4j6krrwl	Balagram	balagram-union	3866	2026-05-10 15:56:01.93	2026-05-10 16:53:02.168	t	বালাগ্রাম	Balagram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4r801rgw88o35u65y7k	cmozwcy9f00dr408o4j6krrwl	Golna	golna-union	3867	2026-05-10 15:56:01.94	2026-05-10 16:53:02.174	t	গোলনা	Golna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4rh01rhw88ol3wkmrua	cmozwcy9f00dr408o4j6krrwl	Dharmapal	dharmapal-union	3868	2026-05-10 15:56:01.949	2026-05-10 16:53:02.181	t	ধর্মপাল	Dharmapal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4rt01riw88o6gblhu41	cmozwcy9f00dr408o4j6krrwl	Simulbari	simulbari-union	3869	2026-05-10 15:56:01.961	2026-05-10 16:53:02.187	t	শিমুলবাড়ী	Simulbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4s301rjw88o2qj1kxk3	cmozwcy9f00dr408o4j6krrwl	Mirganj	mirganj-union	3870	2026-05-10 15:56:01.971	2026-05-10 16:53:02.193	t	মীরগঞ্জ	Mirganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4sc01rkw88oybs0k084	cmozwcy9f00dr408o4j6krrwl	Kathali	kathali-union	3871	2026-05-10 15:56:01.98	2026-05-10 16:53:02.199	t	কাঠালী	Kathali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4sn01rlw88ouwf5zbqh	cmozwcy9f00dr408o4j6krrwl	Khutamara	khutamara-union	3872	2026-05-10 15:56:01.991	2026-05-10 16:53:02.205	t	খুটামারা	Khutamara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4sw01rmw88o3yy7w9j6	cmozwcy9f00dr408o4j6krrwl	Shaulmari	shaulmari-union	3873	2026-05-10 15:56:02	2026-05-10 16:53:02.212	t	শৌলমারী	Shaulmari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4t701rnw88owhm8myw1	cmozwcy9f00dr408o4j6krrwl	Kaimari	kaimari-union	3874	2026-05-10 15:56:02.011	2026-05-10 16:53:02.218	t	কৈমারী	Kaimari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4th01row88o1ywvn3s7	cmozwcya100dt408o2pjzjf2u	Chaora Bargacha	chaora-bargacha-union	3884	2026-05-10 15:56:02.021	2026-05-10 16:53:02.225	t	চওড়া বড়গাছা	Chaora Bargacha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4tr01rpw88omenizk86	cmozwcya100dt408o2pjzjf2u	Gorgram	gorgram-union	3885	2026-05-10 15:56:02.031	2026-05-10 16:53:02.234	t	গোড়গ্রাম	Gorgram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4u101rqw88oknv96m4e	cmozwcya100dt408o2pjzjf2u	Khoksabari	khoksabari-union	3886	2026-05-10 15:56:02.041	2026-05-10 16:53:02.242	t	খোকসাবাড়ী	Khoksabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4ua01rrw88ox83369ga	cmozwcya100dt408o2pjzjf2u	Palasbari	palasbari-union	3887	2026-05-10 15:56:02.05	2026-05-10 16:53:02.249	t	পলাশবাড়ী	Palasbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4um01rsw88ofrhvx2ue	cmozwcya100dt408o2pjzjf2u	Ramnagar	ramnagar-union-1	3888	2026-05-10 15:56:02.062	2026-05-10 16:53:02.256	t	রামনগর	Ramnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4uz01rtw88o8ui0sj4r	cmozwcya100dt408o2pjzjf2u	Kachukata	kachukata-union	3889	2026-05-10 15:56:02.075	2026-05-10 16:53:02.263	t	কচুকাটা	Kachukata	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4v701ruw88ooyqw4blh	cmozwcya100dt408o2pjzjf2u	Panchapukur	panchapukur-union	3890	2026-05-10 15:56:02.083	2026-05-10 16:53:02.27	t	পঞ্চপুকুর	Panchapukur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4vj01rvw88odkym3zr0	cmozwcya100dt408o2pjzjf2u	Itakhola	itakhola-union	3891	2026-05-10 15:56:02.095	2026-05-10 16:53:02.277	t	ইটাখোলা	Itakhola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4vu01rww88oh034ny4r	cmozwcya100dt408o2pjzjf2u	Kundapukur	kundapukur-union	3892	2026-05-10 15:56:02.106	2026-05-10 16:53:02.283	t	কুন্দপুকুর	Kundapukur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4w701rxw88ofxhfegoj	cmozwcya100dt408o2pjzjf2u	Sonaray	sonaray-union-1	3893	2026-05-10 15:56:02.119	2026-05-10 16:53:02.29	t	সোনারায়	Sonaray	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4wi01ryw88o54ls8nh7	cmozwcya100dt408o2pjzjf2u	Songalsi	songalsi-union	3894	2026-05-10 15:56:02.13	2026-05-10 16:53:02.296	t	সংগলশী	Songalsi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4wt01rzw88oywwmhpzh	cmozwcya100dt408o2pjzjf2u	Charaikhola	charaikhola-union	3895	2026-05-10 15:56:02.141	2026-05-10 16:53:02.303	t	চড়াইখোলা	Charaikhola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4x201s0w88o15n3klqq	cmozwcya100dt408o2pjzjf2u	Chapra Sarnjami	chapra-sarnjami-union	3896	2026-05-10 15:56:02.15	2026-05-10 16:53:02.309	t	চাপড়া সরঞ্জানী	Chapra Sarnjami	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4xd01s1w88opwnsgxzh	cmozwcya100dt408o2pjzjf2u	Lakshmicha	lakshmicha-union	3897	2026-05-10 15:56:02.161	2026-05-10 16:53:02.315	t	লক্ষ্মীচাপ	Lakshmicha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4xn01s2w88oz1w930e8	cmozwcya100dt408o2pjzjf2u	Tupamari	tupamari-union	3898	2026-05-10 15:56:02.171	2026-05-10 16:53:02.321	t	টুপামারী	Tupamari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4xy01s3w88oq4kpcqd0	cmozwcy5j00d8408o8qosz68l	Rasulpur	rasulpur-union-2	3899	2026-05-10 15:56:02.182	2026-05-10 16:53:02.328	t	রসুলপুর	Rasulpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4y901s4w88o2v8dno2d	cmozwcy5j00d8408o8qosz68l	Noldanga	noldanga-union	3900	2026-05-10 15:56:02.193	2026-05-10 16:53:02.334	t	নলডাঙ্গা	Noldanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4yi01s5w88oa4i5wgpl	cmozwcy5j00d8408o8qosz68l	Damodorpur	damodorpur-union	3901	2026-05-10 15:56:02.202	2026-05-10 16:53:02.34	t	দামোদরপুর	Damodorpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4yw01s6w88oeuf37dgl	cmozwcy5j00d8408o8qosz68l	Jamalpur	jamalpur-union-2	3902	2026-05-10 15:56:02.216	2026-05-10 16:53:02.347	t	জামালপুর	Jamalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4za01s7w88otuq8woy6	cmozwcy5j00d8408o8qosz68l	Faridpur	faridpur-union-2	3903	2026-05-10 15:56:02.23	2026-05-10 16:53:02.353	t	ফরিদপুর	Faridpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4zl01s8w88oi55bwmxg	cmozwcy5j00d8408o8qosz68l	Dhaperhat	dhaperhat-union	3904	2026-05-10 15:56:02.241	2026-05-10 16:53:02.359	t	ধাপেরহাট	Dhaperhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4p001r8w88ouhgl7q1a	cmozwcy9000dp408ogs5j27h4	Noutara	noutara-union	3859	2026-05-10 15:56:01.86	2026-05-10 16:53:02.122	t	নাউতারা	Noutara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4pj01raw88ouzhp02om	cmozwcy9000dp408ogs5j27h4	Jhunagach Chapani	jhunagach-chapani-union	3861	2026-05-10 15:56:01.879	2026-05-10 16:53:02.134	t	ঝুনাগাছ চাপানী	Jhunagach Chapani	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg50s01scw88oeeuug2xi	cmozwcy5j00d8408o8qosz68l	Kamarpara	kamarpara-union	3908	2026-05-10 15:56:02.284	2026-05-10 16:53:02.386	t	কামারপাড়া	Kamarpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg51301sdw88oj63oismn	cmozwcy5j00d8408o8qosz68l	Khodkomor	khodkomor-union	3909	2026-05-10 15:56:02.295	2026-05-10 16:53:02.392	t	খোদকোমরপুর	Khodkomor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg51f01sew88ohhmtu7y8	cmozwcy4z00d5408osamppnlr	Laxmipur	laxmipur-union-2	3910	2026-05-10 15:56:02.307	2026-05-10 16:53:02.399	t	লক্ষ্মীপুর	Laxmipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg51n01sfw88oxtbu9zyn	cmozwcy4z00d5408osamppnlr	Malibari	malibari-union	3911	2026-05-10 15:56:02.315	2026-05-10 16:53:02.405	t	মালীবাড়ী	Malibari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg51y01sgw88ovs61rm4w	cmozwcy4z00d5408osamppnlr	Kuptola	kuptola-union	3912	2026-05-10 15:56:02.326	2026-05-10 16:53:02.412	t	কুপতলা	Kuptola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg52601shw88odkz0uv07	cmozwcy4z00d5408osamppnlr	Shahapara	shahapara-union	3913	2026-05-10 15:56:02.334	2026-05-10 16:53:02.418	t	সাহাপাড়া	Shahapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg52i01siw88oikw3gocl	cmozwcy4z00d5408osamppnlr	Ballamjhar	ballamjhar-union	3914	2026-05-10 15:56:02.346	2026-05-10 16:53:02.424	t	বল্লমঝাড়	Ballamjhar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg53201skw88okjhrhv02	cmozwcy4z00d5408osamppnlr	Badiakhali	badiakhali-union	3916	2026-05-10 15:56:02.366	2026-05-10 16:53:02.437	t	বাদিয়াখালী	Badiakhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg53e01slw88omvvs3jna	cmozwcy4z00d5408osamppnlr	Boali	boali-union-1	3917	2026-05-10 15:56:02.378	2026-05-10 16:53:02.443	t	বোয়ালী	Boali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg53p01smw88otemw8i3d	cmozwcy4z00d5408osamppnlr	Ghagoa	ghagoa-union	3918	2026-05-10 15:56:02.389	2026-05-10 16:53:02.449	t	ঘাগোয়া	Ghagoa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg53y01snw88ohc3fcs41	cmozwcy4z00d5408osamppnlr	Gidari	gidari-union	3919	2026-05-10 15:56:02.398	2026-05-10 16:53:02.455	t	গিদারী	Gidari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg54a01sow88ol9fcl0i6	cmozwcy4z00d5408osamppnlr	Kholahati	kholahati-union	3920	2026-05-10 15:56:02.41	2026-05-10 16:53:02.462	t	খোলাহাটী	Kholahati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg54m01spw88oa2jnkdx1	cmozwcy4z00d5408osamppnlr	Mollarchar	mollarchar-union	3921	2026-05-10 15:56:02.422	2026-05-10 16:53:02.468	t	মোল্লারচর	Mollarchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg54v01sqw88ozmhreccm	cmozwcy4z00d5408osamppnlr	Kamarjani	kamarjani-union	3922	2026-05-10 15:56:02.431	2026-05-10 16:53:02.475	t	কামারজানি	Kamarjani	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg55501srw88or51vgp0h	cmozwcy5c00d7408odmld0wci	Kishoregari	kishoregari-union	3923	2026-05-10 15:56:02.441	2026-05-10 16:53:02.481	t	কিশোরগাড়ী	Kishoregari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg55e01ssw88ohgisme3l	cmozwcy5c00d7408odmld0wci	Hosenpur	hosenpur-union-1	3924	2026-05-10 15:56:02.45	2026-05-10 16:53:02.488	t	হোসেনপুর	Hosenpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg55o01stw88o77ej0ern	cmozwcy5c00d7408odmld0wci	Palashbari	palashbari-union	3925	2026-05-10 15:56:02.46	2026-05-10 16:53:02.495	t	পলাশবাড়ী	Palashbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg55w01suw88ojca9b0u2	cmozwcy5c00d7408odmld0wci	Barisal	barisal-union	3926	2026-05-10 15:56:02.468	2026-05-10 16:53:02.502	t	বরিশাল	Barisal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg56601svw88otgpl72q8	cmozwcy5c00d7408odmld0wci	Mohdipur	mohdipur-union	3927	2026-05-10 15:56:02.478	2026-05-10 16:53:02.509	t	মহদীপুর	Mohdipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg56f01sww88o37ntee15	cmozwcy5c00d7408odmld0wci	Betkapa	betkapa-union	3928	2026-05-10 15:56:02.487	2026-05-10 16:53:02.516	t	বেতকাপা	Betkapa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg56p01sxw88op2lzvwnv	cmozwcy5c00d7408odmld0wci	Pobnapur	pobnapur-union	3929	2026-05-10 15:56:02.497	2026-05-10 16:53:02.523	t	পবনাপুর	Pobnapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg56z01syw88o2wbtapis	cmozwcy5c00d7408odmld0wci	Monohorpur	monohorpur-union	3930	2026-05-10 15:56:02.507	2026-05-10 16:53:02.53	t	মনোহরপুর	Monohorpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg57701szw88oytmdk3xv	cmozwcy5c00d7408odmld0wci	Harinathpur	harinathpur-union	3931	2026-05-10 15:56:02.515	2026-05-10 16:53:02.537	t	হরিণাথপুর	Harinathpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg57i01t0w88o3rt1m0ya	cmozwcy5p00d9408ob3gu4i1x	Padumsahar	padumsahar-union	3932	2026-05-10 15:56:02.526	2026-05-10 16:53:02.543	t	পদুমশহর	Padumsahar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg57r01t1w88omumrduw1	cmozwcy5p00d9408ob3gu4i1x	Varotkhali	varotkhali-union	3933	2026-05-10 15:56:02.535	2026-05-10 16:53:02.549	t	ভরতখালী	Varotkhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg58101t2w88oipejnsfs	cmozwcy5p00d9408ob3gu4i1x	Saghata	saghata-union	3934	2026-05-10 15:56:02.545	2026-05-10 16:53:02.556	t	সাঘাটা	Saghata	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg58c01t3w88oa8mbbqp3	cmozwcy5p00d9408ob3gu4i1x	Muktinagar	muktinagar-union	3935	2026-05-10 15:56:02.556	2026-05-10 16:53:02.563	t	মুক্তিনগর	Muktinagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg58m01t4w88osfoboac4	cmozwcy5p00d9408ob3gu4i1x	Kachua	kachua-union-1	3936	2026-05-10 15:56:02.566	2026-05-10 16:53:02.57	t	কচুয়া	Kachua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg58x01t5w88oxwclk0tj	cmozwcy5p00d9408ob3gu4i1x	Ghuridah	ghuridah-union	3937	2026-05-10 15:56:02.577	2026-05-10 16:53:02.576	t	ঘুরিদহ	Ghuridah	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg59501t6w88os30a8syo	cmozwcy5p00d9408ob3gu4i1x	Holdia	holdia-union	3938	2026-05-10 15:56:02.585	2026-05-10 16:53:02.583	t	হলদিয়া	Holdia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg59h01t7w88ot8opfbtc	cmozwcy5p00d9408ob3gu4i1x	Jumarbari	jumarbari-union	3939	2026-05-10 15:56:02.597	2026-05-10 16:53:02.59	t	জুমারবাড়ী	Jumarbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg59r01t8w88o4n779340	cmozwcy5p00d9408ob3gu4i1x	Kamalerpara	kamalerpara-union	3940	2026-05-10 15:56:02.607	2026-05-10 16:53:02.596	t	কামালেরপাড়া	Kamalerpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5a001t9w88onruytpw2	cmozwcy5p00d9408ob3gu4i1x	Bonarpara	bonarpara-union	3941	2026-05-10 15:56:02.616	2026-05-10 16:53:02.603	t	বোনারপাড়া	Bonarpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5aa01taw88o3r01itym	cmozwcy5500d6408o58onciv1	Kamdia	kamdia-union	3942	2026-05-10 15:56:02.626	2026-05-10 16:53:02.61	t	কামদিয়া	Kamdia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5aj01tbw88oef8605z1	cmozwcy5500d6408o58onciv1	Katabari	katabari-union	3943	2026-05-10 15:56:02.635	2026-05-10 16:53:02.616	t	কাটাবাড়ী	Katabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg50801saw88o1ou46jty	cmozwcy5j00d8408o8qosz68l	Vatgram	vatgram-union	3906	2026-05-10 15:56:02.264	2026-05-10 16:53:02.373	t	ভাতগ্রাম	Vatgram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg50k01sbw88oin5psdxu	cmozwcy5j00d8408o8qosz68l	Bongram	bongram-union	3907	2026-05-10 15:56:02.276	2026-05-10 16:53:02.379	t	বনগ্রাম	Bongram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5bm01tfw88oedqaljdf	cmozwcy5500d6408o58onciv1	Dorbosto	dorbosto-union	3947	2026-05-10 15:56:02.674	2026-05-10 16:53:02.642	t	দরবস্ত ইয়নিয়ন	Dorbosto	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5bv01tgw88onsvk69np	cmozwcy5500d6408o58onciv1	Talukkanupur	talukkanupur-union	3948	2026-05-10 15:56:02.683	2026-05-10 16:53:02.649	t	তালুককানুপুর	Talukkanupur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5c501thw88olrnoyrio	cmozwcy5500d6408o58onciv1	Nakai	nakai-union	3949	2026-05-10 15:56:02.693	2026-05-10 16:53:02.656	t	নাকাই	Nakai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5ce01tiw88ojfpsakxq	cmozwcy5500d6408o58onciv1	Harirampur	harirampur-union-1	3950	2026-05-10 15:56:02.702	2026-05-10 16:53:02.662	t	হরিরামপুর	Harirampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5co01tjw88owckpd65d	cmozwcy5500d6408o58onciv1	Rakhalburuj	rakhalburuj-union	3951	2026-05-10 15:56:02.712	2026-05-10 16:53:02.668	t	রাখালবুরুজ	Rakhalburuj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5cy01tkw88oul2cb0wa	cmozwcy5500d6408o58onciv1	Phulbari	phulbari-union	3952	2026-05-10 15:56:02.722	2026-05-10 16:53:02.675	t	ফুলবাড়ী	Phulbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5d701tlw88o5w7chrz6	cmozwcy5500d6408o58onciv1	Gumaniganj	gumaniganj-union	3953	2026-05-10 15:56:02.731	2026-05-10 16:53:02.681	t	গুমানীগঞ্জ	Gumaniganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5dh01tmw88obxobs2wu	cmozwcy5500d6408o58onciv1	Kamardoho	kamardoho-union	3954	2026-05-10 15:56:02.741	2026-05-10 16:53:02.688	t	কামারদহ	Kamardoho	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5dp01tnw88okbdcj2aj	cmozwcy5500d6408o58onciv1	Kochasahar	kochasahar-union	3955	2026-05-10 15:56:02.749	2026-05-10 16:53:02.694	t	কোচাশহর	Kochasahar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5e401tow88o2t4msc28	cmozwcy5500d6408o58onciv1	Shibpur	shibpur-union-4	3956	2026-05-10 15:56:02.764	2026-05-10 16:53:02.7	t	শিবপুর	Shibpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5ee01tpw88oalshbdfu	cmozwcy5500d6408o58onciv1	Mahimaganj	mahimaganj-union	3957	2026-05-10 15:56:02.774	2026-05-10 16:53:02.706	t	মহিমাগঞ্জ	Mahimaganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5en01tqw88owktjukzr	cmozwcy5500d6408o58onciv1	Shalmara	shalmara-union	3958	2026-05-10 15:56:02.783	2026-05-10 16:53:02.713	t	শালমারা	Shalmara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5ex01trw88o5h0lypfg	cmozwcy5w00da408oxde9xr83	Bamondanga	bamondanga-union	3959	2026-05-10 15:56:02.793	2026-05-10 16:53:02.719	t	বামনডাঙ্গা	Bamondanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5f601tsw88ohz1ngyll	cmozwcy5w00da408oxde9xr83	Sonaroy	sonaroy-union	3960	2026-05-10 15:56:02.802	2026-05-10 16:53:02.725	t	সোনারায়	Sonaroy	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5fg01ttw88oijerwt54	cmozwcy5w00da408oxde9xr83	Tarapur	tarapur-union	3961	2026-05-10 15:56:02.812	2026-05-10 16:53:02.731	t	তারাপুর	Tarapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5fq01tuw88oxlddhcns	cmozwcy5w00da408oxde9xr83	Belka	belka-union	3962	2026-05-10 15:56:02.822	2026-05-10 16:53:02.738	t	বেলকা	Belka	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5fz01tvw88omi0t8ln3	cmozwcy5w00da408oxde9xr83	Dohbond	dohbond-union	3963	2026-05-10 15:56:02.831	2026-05-10 16:53:02.745	t	দহবন্দ	Dohbond	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5g901tww88osvp4apdt	cmozwcy5w00da408oxde9xr83	Sorbanondo	sorbanondo-union	3964	2026-05-10 15:56:02.841	2026-05-10 16:53:02.752	t	সর্বানন্দ	Sorbanondo	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5gh01txw88okuskwhok	cmozwcy5w00da408oxde9xr83	Ramjibon	ramjibon-union	3965	2026-05-10 15:56:02.849	2026-05-10 16:53:02.759	t	রামজীবন	Ramjibon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5gs01tyw88o60u95zs6	cmozwcy5w00da408oxde9xr83	Dhopadanga	dhopadanga-union	3966	2026-05-10 15:56:02.86	2026-05-10 16:53:02.766	t	ধোপাডাঙ্গা	Dhopadanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5h001tzw88okgoe322n	cmozwcy5w00da408oxde9xr83	Chaporhati	chaporhati-union	3967	2026-05-10 15:56:02.868	2026-05-10 16:53:02.772	t	ছাপরহাটী	Chaporhati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5hb01u0w88o9enh9y83	cmozwcy5w00da408oxde9xr83	Shantiram	shantiram-union	3968	2026-05-10 15:56:02.879	2026-05-10 16:53:02.778	t	শান্তিরাম	Shantiram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5hk01u1w88o04xsjppn	cmozwcy5w00da408oxde9xr83	Konchibari	konchibari-union	3969	2026-05-10 15:56:02.888	2026-05-10 16:53:02.785	t	কঞ্চিবাড়ী	Konchibari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5hv01u2w88oqf5ie5lc	cmozwcy5w00da408oxde9xr83	Sreepur	sreepur-union-2	3970	2026-05-10 15:56:02.899	2026-05-10 16:53:02.791	t	শ্রীপুর	Sreepur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5i701u3w88ovx3aaza6	cmozwcy5w00da408oxde9xr83	Chandipur	chandipur-union-2	3971	2026-05-10 15:56:02.911	2026-05-10 16:53:02.798	t	চন্ডিপুর	Chandipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5is01u5w88odch910xa	cmozwcy5w00da408oxde9xr83	Haripur	haripur-union-1	3973	2026-05-10 15:56:02.932	2026-05-10 16:53:02.814	t	হরিপুর	Haripur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5j201u6w88oskzvmh33	cmozwcydx00ec408olmpdm0zf	Ruhea	ruhea-union	3981	2026-05-10 15:56:02.942	2026-05-10 16:53:02.821	t	রুহিয়া	Ruhea	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5jb01u7w88opgqeajsj	cmozwcydx00ec408olmpdm0zf	Akhanagar	akhanagar-union	3982	2026-05-10 15:56:02.951	2026-05-10 16:53:02.828	t	আখানগর	Akhanagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5jm01u8w88owh3yxs0h	cmozwcydx00ec408olmpdm0zf	Ahcha	ahcha-union	3983	2026-05-10 15:56:02.962	2026-05-10 16:53:02.835	t	আকচা	Ahcha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5jw01u9w88o1plw3pyl	cmozwcydx00ec408olmpdm0zf	Baragaon	baragaon-union	3984	2026-05-10 15:56:02.972	2026-05-10 16:53:02.842	t	বড়গাঁও	Baragaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5k601uaw88ot9a52i6t	cmozwcydx00ec408olmpdm0zf	Balia	balia-union-1	3985	2026-05-10 15:56:02.982	2026-05-10 16:53:02.849	t	বালিয়া	Balia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5ki01ubw88outj1ez3i	cmozwcydx00ec408olmpdm0zf	Auliapur	auliapur-union-2	3986	2026-05-10 15:56:02.994	2026-05-10 16:53:02.855	t	আউলিয়াপুর	Auliapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5kq01ucw88oiiq07eu2	cmozwcydx00ec408olmpdm0zf	Chilarang	chilarang-union	3987	2026-05-10 15:56:03.002	2026-05-10 16:53:02.862	t	চিলারং	Chilarang	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5l001udw88onkwigv3y	cmozwcydx00ec408olmpdm0zf	Rahimanpur	rahimanpur-union	3988	2026-05-10 15:56:03.012	2026-05-10 16:53:02.868	t	রহিমানপুর	Rahimanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5lc01uew88ocwpml6iv	cmozwcydx00ec408olmpdm0zf	Roypur	roypur-union	3989	2026-05-10 15:56:03.024	2026-05-10 16:53:02.875	t	রায়পুর	Roypur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5b301tdw88or4tjywcv	cmozwcy5500d6408o58onciv1	Rajahar	rajahar-union	3945	2026-05-10 15:56:02.655	2026-05-10 16:53:02.629	t	রাজাহার	Rajahar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5bc01tew88oel5q4bq1	cmozwcy5500d6408o58onciv1	Sapmara	sapmara-union	3946	2026-05-10 15:56:02.664	2026-05-10 16:53:02.636	t	সাপমারা	Sapmara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5mr01uiw88o4qw8wz96	cmozwcydx00ec408olmpdm0zf	Gareya	gareya-union	3993	2026-05-10 15:56:03.075	2026-05-10 16:53:02.901	t	গড়েয়া	Gareya	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5mz01ujw88obmaxe0j7	cmozwcydx00ec408olmpdm0zf	Rajagaon	rajagaon-union	3994	2026-05-10 15:56:03.083	2026-05-10 16:53:02.908	t	রাজাগাঁও	Rajagaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5na01ukw88oijjbm5s2	cmozwcydx00ec408olmpdm0zf	Debipur	debipur-union	3995	2026-05-10 15:56:03.094	2026-05-10 16:53:02.914	t	দেবীপুর	Debipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5nl01ulw88orzh1qfm9	cmozwcydx00ec408olmpdm0zf	Nargun	nargun-union	3996	2026-05-10 15:56:03.105	2026-05-10 16:53:02.92	t	নারগুন	Nargun	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5nv01umw88oihqy7g8b	cmozwcydx00ec408olmpdm0zf	Jagannathpur	jagannathpur-union	3997	2026-05-10 15:56:03.116	2026-05-10 16:53:02.927	t	জগন্নাথপুর	Jagannathpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5o701unw88oyhnb0vg9	cmozwcydx00ec408olmpdm0zf	Sukhanpukhari	sukhanpukhari-union	3998	2026-05-10 15:56:03.127	2026-05-10 16:53:02.933	t	শুখানপুকুরী	Sukhanpukhari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5ok01uow88o10goo0al	cmozwcydx00ec408olmpdm0zf	Begunbari	begunbari-union	3999	2026-05-10 15:56:03.14	2026-05-10 16:53:02.94	t	বেগুনবাড়ী	Begunbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5ov01upw88offsgernf	cmozwcydx00ec408olmpdm0zf	Ruhia Pashchim	ruhia-pashchim-union	4000	2026-05-10 15:56:03.151	2026-05-10 16:53:02.946	t	রুহিয়া পশ্চিম	Ruhia Pashchim	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5p501uqw88ostu186uo	cmozwcydx00ec408olmpdm0zf	Dholarhat	dholarhat-union	4001	2026-05-10 15:56:03.161	2026-05-10 16:53:02.953	t	ঢোলারহাট	Dholarhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5pf01urw88ouf18b4rw	cmozwcydj00ea408oa4nx8e44	Bhomradaha	bhomradaha-union	4002	2026-05-10 15:56:03.171	2026-05-10 16:53:02.96	t	ভোমরাদহ	Bhomradaha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5po01usw88o2a0flgfq	cmozwcydj00ea408oa4nx8e44	Kosharaniganj	kosharaniganj-union	4003	2026-05-10 15:56:03.18	2026-05-10 16:53:02.966	t	কোষারাণীগঞ্জ	Kosharaniganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5pz01utw88olqpi1l74	cmozwcydj00ea408oa4nx8e44	Khangaon	khangaon-union	4004	2026-05-10 15:56:03.191	2026-05-10 16:53:02.972	t	খনগাঁও	Khangaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5q801uuw88o4x9drffw	cmozwcydj00ea408oa4nx8e44	Saidpur	saidpur-union	4005	2026-05-10 15:56:03.2	2026-05-10 16:53:02.978	t	সৈয়দপুর	Saidpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5qi01uvw88oa83fck7b	cmozwcydj00ea408oa4nx8e44	Pirganj	pirganj-union	4006	2026-05-10 15:56:03.21	2026-05-10 16:53:02.985	t	পীরগঞ্জ	Pirganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5qt01uww88oy2bxq2k3	cmozwcydj00ea408oa4nx8e44	Hajipur	hajipur-union-1	4007	2026-05-10 15:56:03.221	2026-05-10 16:53:02.99	t	হাজীপুর	Hajipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5r701uxw88oubb4675j	cmozwcydj00ea408oa4nx8e44	Daulatpur	daulatpur-union-5	4008	2026-05-10 15:56:03.235	2026-05-10 16:53:02.997	t	দৌলতপুর	Daulatpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5rg01uyw88o7lmfpbnt	cmozwcydj00ea408oa4nx8e44	Sengaon	sengaon-union	4009	2026-05-10 15:56:03.244	2026-05-10 16:53:03.003	t	সেনগাঁও	Sengaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5rq01uzw88oy241x16a	cmozwcydj00ea408oa4nx8e44	Jabarhat	jabarhat-union	4010	2026-05-10 15:56:03.254	2026-05-10 16:53:03.009	t	জাবরহাট	Jabarhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5rz01v0w88ofbpa4mb9	cmozwcydj00ea408oa4nx8e44	Bairchuna	bairchuna-union	4011	2026-05-10 15:56:03.263	2026-05-10 16:53:03.015	t	বৈরচুনা	Bairchuna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5s901v1w88o1ik2hf8u	cmozwcydc00e9408oj1cjz7my	Gedura	gedura-union	4020	2026-05-10 15:56:03.273	2026-05-10 16:53:03.021	t	গেদুড়া	Gedura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5si01v2w88oq9bwufvo	cmozwcydc00e9408oj1cjz7my	Amgaon	amgaon-union	4021	2026-05-10 15:56:03.282	2026-05-10 16:53:03.027	t	আমগাঁও	Amgaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5ss01v3w88ovetg5jw6	cmozwcydc00e9408oj1cjz7my	Bakua	bakua-union	4022	2026-05-10 15:56:03.292	2026-05-10 16:53:03.033	t	বকুয়া	Bakua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5td01v5w88ob74ow455	cmozwcydc00e9408oj1cjz7my	Haripur	haripur-union-2	4024	2026-05-10 15:56:03.313	2026-05-10 16:53:03.045	t	হরিপুর	Haripur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5tn01v6w88oh3zovupn	cmozwcydc00e9408oj1cjz7my	Bhaturia	bhaturia-union	4025	2026-05-10 15:56:03.323	2026-05-10 16:53:03.053	t	ভাতুরিয়া	Bhaturia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5tw01v7w88oa26iy6kc	cmozwcyd300e8408oz1dhqtgl	Paria	paria-union	4026	2026-05-10 15:56:03.332	2026-05-10 16:53:03.059	t	পাড়িয়া	Paria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5u601v8w88o8l9wazn0	cmozwcyd300e8408oz1dhqtgl	Charol	charol-union	4027	2026-05-10 15:56:03.342	2026-05-10 16:53:03.066	t	চারোল	Charol	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5ug01v9w88oa85ntijt	cmozwcyd300e8408oz1dhqtgl	Dhontola	dhontola-union	4028	2026-05-10 15:56:03.352	2026-05-10 16:53:03.072	t	ধনতলা	Dhontola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5uq01vaw88o4nbtfsjs	cmozwcyd300e8408oz1dhqtgl	Boropalashbari	boropalashbari-union	4029	2026-05-10 15:56:03.362	2026-05-10 16:53:03.079	t	বড়পলাশবাড়ী	Boropalashbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5v001vbw88o9h9hptxc	cmozwcyd300e8408oz1dhqtgl	Duosuo	duosuo-union	4030	2026-05-10 15:56:03.372	2026-05-10 16:53:03.085	t	দুওসুও	Duosuo	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5v901vcw88ojxwowe5b	cmozwcyd300e8408oz1dhqtgl	Vanor	vanor-union	4031	2026-05-10 15:56:03.381	2026-05-10 16:53:03.092	t	ভানোর	Vanor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5vj01vdw88ous2scnvw	cmozwcyd300e8408oz1dhqtgl	Amjankhore	amjankhore-union	4032	2026-05-10 15:56:03.391	2026-05-10 16:53:03.098	t	আমজানখোর	Amjankhore	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5vs01vew88ov2zobmod	cmozwcyd300e8408oz1dhqtgl	Borobari	borobari-union	4033	2026-05-10 15:56:03.4	2026-05-10 16:53:03.105	t	বড়বাড়ী	Borobari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5w401vfw88olwnlowh3	cmozwcycp00e6408ovp874z6d	Mominpur	mominpur-union-2	4034	2026-05-10 15:56:03.412	2026-05-10 16:53:03.112	t	মমিনপুর	Mominpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5wd01vgw88oaw1tmu8l	cmozwcycp00e6408ovp874z6d	Horidebpur	horidebpur-union	4035	2026-05-10 15:56:03.421	2026-05-10 16:53:03.118	t	হরিদেবপুর	Horidebpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5wn01vhw88obuw8s5hn	cmozwcycp00e6408ovp874z6d	Uttam	uttam-union	4036	2026-05-10 15:56:03.431	2026-05-10 16:53:03.126	t	উত্তম	Uttam	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5m501ugw88og1rnapbu	cmozwcydx00ec408olmpdm0zf	Mohammadpur	mohammadpur-union-3	3991	2026-05-10 15:56:03.053	2026-05-10 16:53:02.888	t	মোহাম্মদপুর	Mohammadpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5mh01uhw88ogurlq1w1	cmozwcydx00ec408olmpdm0zf	Salandar	salandar-union	3992	2026-05-10 15:56:03.065	2026-05-10 16:53:02.895	t	সালন্দর	Salandar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5xq01vlw88otk56ihy9	cmozwcycp00e6408ovp874z6d	Rajendrapur	rajendrapur-union	4040	2026-05-10 15:56:03.47	2026-05-10 16:53:03.152	t	রাজেন্দ্রপুর	Rajendrapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5y901vnw88ofbpnpemj	cmozwcycp00e6408ovp874z6d	Chandanpat	chandanpat-union	4042	2026-05-10 15:56:03.49	2026-05-10 16:53:03.165	t	চন্দনপাট	Chandanpat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5yi01vow88o0nso7fy2	cmozwcycp00e6408ovp874z6d	Dorshona	dorshona-union	4043	2026-05-10 15:56:03.498	2026-05-10 16:53:03.171	t	দর্শানা	Dorshona	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5ys01vpw88o9fry47nu	cmozwcycp00e6408ovp874z6d	Tampat	tampat-union	4044	2026-05-10 15:56:03.508	2026-05-10 16:53:03.177	t	তামপাট	Tampat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5z001vqw88opg9qb5pf	cmozwcybr00e1408oy4ssf19h	Betgari	betgari-union	4045	2026-05-10 15:56:03.516	2026-05-10 16:53:03.184	t	বেতগাড়ী	Betgari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5zb01vrw88oprmfrjo1	cmozwcybr00e1408oy4ssf19h	Kholeya	kholeya-union	4046	2026-05-10 15:56:03.527	2026-05-10 16:53:03.19	t	খলেয়া	Kholeya	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5zj01vsw88o3g2ljqve	cmozwcybr00e1408oy4ssf19h	Borobil	borobil-union	4047	2026-05-10 15:56:03.535	2026-05-10 16:53:03.196	t	বড়বিল	Borobil	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5zu01vtw88o13dom5je	cmozwcybr00e1408oy4ssf19h	Kolcondo	kolcondo-union	4048	2026-05-10 15:56:03.546	2026-05-10 16:53:03.203	t	কোলকোন্দ	Kolcondo	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg60401vuw88oit8ww7q3	cmozwcybr00e1408oy4ssf19h	Gongachora	gongachora-union	4049	2026-05-10 15:56:03.556	2026-05-10 16:53:03.209	t	গংগাচড়া	Gongachora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg60d01vvw88onbw5p10c	cmozwcybr00e1408oy4ssf19h	Gojoghonta	gojoghonta-union	4050	2026-05-10 15:56:03.565	2026-05-10 16:53:03.216	t	গজঘন্টা	Gojoghonta	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg60o01vww88o82x78glt	cmozwcybr00e1408oy4ssf19h	Morneya	morneya-union	4051	2026-05-10 15:56:03.576	2026-05-10 16:53:03.222	t	মর্ণেয়া	Morneya	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg60w01vxw88ooezunetz	cmozwcybr00e1408oy4ssf19h	Alambiditor	alambiditor-union	4052	2026-05-10 15:56:03.584	2026-05-10 16:53:03.229	t	আলমবিদিতর	Alambiditor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg61601vyw88oypaj9bo3	cmozwcybr00e1408oy4ssf19h	Lakkhitari	lakkhitari-union	4053	2026-05-10 15:56:03.594	2026-05-10 16:53:03.235	t	লক্ষীটারী	Lakkhitari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg61f01vzw88o7nlqcjvo	cmozwcybr00e1408oy4ssf19h	Nohali	nohali-union	4054	2026-05-10 15:56:03.603	2026-05-10 16:53:03.241	t	নোহালী	Nohali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg61p01w0w88orgd7i1tb	cmozwcyc400e3408onye97q76	Khoragach	khoragach-union	4070	2026-05-10 15:56:03.613	2026-05-10 16:53:03.248	t	খোরাগাছ	Khoragach	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg62101w1w88o81d1tbds	cmozwcyc400e3408onye97q76	Ranipukur	ranipukur-union-1	4071	2026-05-10 15:56:03.625	2026-05-10 16:53:03.255	t	রাণীপুকুর	Ranipukur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg62901w2w88oti9ac3du	cmozwcyc400e3408onye97q76	Payrabond	payrabond-union	4072	2026-05-10 15:56:03.633	2026-05-10 16:53:03.261	t	পায়রাবন্দ	Payrabond	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg62k01w3w88oyeadr1od	cmozwcyc400e3408onye97q76	Vangni	vangni-union	4073	2026-05-10 15:56:03.644	2026-05-10 16:53:03.268	t	ভাংনী	Vangni	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg62t01w4w88oo3n9lx9t	cmozwcyc400e3408onye97q76	Balarhat	balarhat-union	4074	2026-05-10 15:56:03.653	2026-05-10 16:53:03.274	t	বালারহাট	Balarhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg63501w5w88oapt4rkq2	cmozwcyc400e3408onye97q76	Kafrikhal	kafrikhal-union	4075	2026-05-10 15:56:03.665	2026-05-10 16:53:03.281	t	কাফ্রিখাল	Kafrikhal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg63l01w6w88oj9hj37ib	cmozwcyc400e3408onye97q76	Latibpur	latibpur-union	4076	2026-05-10 15:56:03.681	2026-05-10 16:53:03.287	t	লতিবপুর	Latibpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg63x01w7w88o9ifexhl1	cmozwcyc400e3408onye97q76	Chengmari	chengmari-union	4077	2026-05-10 15:56:03.693	2026-05-10 16:53:03.294	t	চেংমারী	Chengmari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg64601w8w88o5j783dqt	cmozwcyc400e3408onye97q76	Moyenpur	moyenpur-union	4078	2026-05-10 15:56:03.702	2026-05-10 16:53:03.3	t	ময়েনপুর	Moyenpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg64i01w9w88om4jrq8kh	cmozwcyc400e3408onye97q76	Baluya Masimpur	baluya-masimpur-union	4079	2026-05-10 15:56:03.714	2026-05-10 16:53:03.306	t	বালুয়া মাসিমপুর	Baluya Masimpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg64s01waw88o5ybf411l	cmozwcyc400e3408onye97q76	Borobala	borobala-union	4080	2026-05-10 15:56:03.724	2026-05-10 16:53:03.312	t	বড়বালা	Borobala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg65701wbw88ofglx2511	cmozwcyc400e3408onye97q76	Mirzapur	mirzapur-union-5	4081	2026-05-10 15:56:03.739	2026-05-10 16:53:03.318	t	মির্জাপুর	Mirzapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg65k01wcw88o7hdmfe9f	cmozwcyc400e3408onye97q76	Imadpur	imadpur-union	4082	2026-05-10 15:56:03.752	2026-05-10 16:53:03.324	t	ইমাদপুর	Imadpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg66201wdw88o8ryu6585	cmozwcyc400e3408onye97q76	Milonpur	milonpur-union	4083	2026-05-10 15:56:03.77	2026-05-10 16:53:03.331	t	মিলনপুর	Milonpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg66e01wew88oo5vrcwaz	cmozwcyc400e3408onye97q76	Mgopalpur	mgopalpur-union	4084	2026-05-10 15:56:03.782	2026-05-10 16:53:03.336	t	গোপালপুর	Mgopalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg66v01wfw88o44zfqw5p	cmozwcyc400e3408onye97q76	Durgapur	durgapur-union-6	4085	2026-05-10 15:56:03.799	2026-05-10 16:53:03.343	t	দূর্গাপুর	Durgapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg67501wgw88oo284neq1	cmozwcyc400e3408onye97q76	Boro Hazratpur	boro-hazratpur-union	4086	2026-05-10 15:56:03.809	2026-05-10 16:53:03.349	t	বড় হযরতপুর	Boro Hazratpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg67d01whw88ovvcmvspt	cmozwcyby00e2408og8iuvobw	Sarai	sarai-union	4102	2026-05-10 15:56:03.817	2026-05-10 16:53:03.356	t	সারাই	Sarai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg67n01wiw88o7xb51wtm	cmozwcyby00e2408og8iuvobw	Balapara	balapara-union-1	4103	2026-05-10 15:56:03.827	2026-05-10 16:53:03.362	t	বালাপাড়া	Balapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg67v01wjw88otwcidz3z	cmozwcyby00e2408og8iuvobw	Shahidbag	shahidbag-union	4104	2026-05-10 15:56:03.835	2026-05-10 16:53:03.368	t	শহীদবাগ	Shahidbag	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg68501wkw88oeru0a22x	cmozwcyby00e2408og8iuvobw	Haragach	haragach-union	4105	2026-05-10 15:56:03.845	2026-05-10 16:53:03.375	t	হারাগাছ	Haragach	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5x701vjw88opzf381am	cmozwcycp00e6408ovp874z6d	Topodhan	topodhan-union	4038	2026-05-10 15:56:03.451	2026-05-10 16:53:03.139	t	তপোধন	Topodhan	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5xh01vkw88oaszo3k9d	cmozwcycp00e6408ovp874z6d	Satgara	satgara-union	4039	2026-05-10 15:56:03.461	2026-05-10 16:53:03.146	t	সাতগারা	Satgara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg69801wow88okjiw7hf5	cmozwcy6g00dd408oak91urht	Ghogadhoh	ghogadhoh-union	4118	2026-05-10 15:56:03.884	2026-05-10 16:53:03.404	t	ঘোগাদহ	Ghogadhoh	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg69l01wpw88o06ienurh	cmozwcy6g00dd408oak91urht	Belgacha	belgacha-union	4119	2026-05-10 15:56:03.897	2026-05-10 16:53:03.411	t	বেলগাছা	Belgacha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg69y01wqw88o88ybiaof	cmozwcy6g00dd408oak91urht	Mogolbasa	mogolbasa-union	4120	2026-05-10 15:56:03.91	2026-05-10 16:53:03.418	t	মোগলবাসা	Mogolbasa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6ac01wrw88ozj984m56	cmozwcy6g00dd408oak91urht	Panchgachi	panchgachi-union	4121	2026-05-10 15:56:03.924	2026-05-10 16:53:03.424	t	পাঁচগাছি	Panchgachi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6an01wsw88o12yxekxc	cmozwcy6g00dd408oak91urht	Jatrapur	jatrapur-union	4122	2026-05-10 15:56:03.935	2026-05-10 16:53:03.431	t	যাত্রাপুর	Jatrapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6ax01wtw88oayeim85f	cmozwcy6g00dd408oak91urht	Kanthalbari	kanthalbari-union	4123	2026-05-10 15:56:03.945	2026-05-10 16:53:03.437	t	কাঁঠালবাড়ী	Kanthalbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6b601wuw88ok0wornj0	cmozwcy6g00dd408oak91urht	Bhogdanga	bhogdanga-union	4124	2026-05-10 15:56:03.954	2026-05-10 16:53:03.443	t	ভোগডাঙ্গা	Bhogdanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6bf01wvw88oav9rpmj9	cmozwcy6n00de408oim2h0f7l	Ramkhana	ramkhana-union	4125	2026-05-10 15:56:03.963	2026-05-10 16:53:03.449	t	রামখানা	Ramkhana	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6bp01www88o399qp6sc	cmozwcy6n00de408oim2h0f7l	Raigonj	raigonj-union	4126	2026-05-10 15:56:03.973	2026-05-10 16:53:03.455	t	রায়গঞ্জ	Raigonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6bz01wxw88oycrn4vse	cmozwcy6n00de408oim2h0f7l	Bamondanga	bamondanga-union-1	4127	2026-05-10 15:56:03.983	2026-05-10 16:53:03.46	t	বামনডাঙ্গা	Bamondanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6c901wyw88o5ehk3lhv	cmozwcy6n00de408oim2h0f7l	Berubari	berubari-union	4128	2026-05-10 15:56:03.993	2026-05-10 16:53:03.467	t	বেরুবাড়ী	Berubari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6ch01wzw88o3qr91tdx	cmozwcy6n00de408oim2h0f7l	Sontaspur	sontaspur-union	4129	2026-05-10 15:56:04.001	2026-05-10 16:53:03.473	t	সন্তোষপুর	Sontaspur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6cs01x0w88o5apu2q8z	cmozwcy6n00de408oim2h0f7l	Hasnabad	hasnabad-union	4130	2026-05-10 15:56:04.012	2026-05-10 16:53:03.479	t	হাসনাবাদ	Hasnabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6d501x1w88od4doifu5	cmozwcy6n00de408oim2h0f7l	Newyashi	newyashi-union	4131	2026-05-10 15:56:04.025	2026-05-10 16:53:03.486	t	নেওয়াশী	Newyashi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6dl01x2w88oi1cpd4tb	cmozwcy6n00de408oim2h0f7l	Bhitorbond	bhitorbond-union	4132	2026-05-10 15:56:04.041	2026-05-10 16:53:03.493	t	ভিতরবন্দ	Bhitorbond	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6dx01x3w88otbg1kbyl	cmozwcy6n00de408oim2h0f7l	Kaligonj	kaligonj-union	4133	2026-05-10 15:56:04.053	2026-05-10 16:53:03.5	t	কালীগঞ্জ	Kaligonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6e701x4w88oyd3u4y64	cmozwcy6n00de408oim2h0f7l	Noonkhawa	noonkhawa-union	4134	2026-05-10 15:56:04.063	2026-05-10 16:53:03.507	t	নুনখাওয়া	Noonkhawa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6eh01x5w88oc0o7jn35	cmozwcy6n00de408oim2h0f7l	Narayanpur	narayanpur-union-1	4135	2026-05-10 15:56:04.073	2026-05-10 16:53:03.514	t	নারায়নপুর	Narayanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6eq01x6w88oh3y21q6l	cmozwcy6n00de408oim2h0f7l	Kedar	kedar-union	4136	2026-05-10 15:56:04.082	2026-05-10 16:53:03.521	t	কেদার	Kedar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6f001x7w88oniu4qe9e	cmozwcy6n00de408oim2h0f7l	Kachakata	kachakata-union	4137	2026-05-10 15:56:04.092	2026-05-10 16:53:03.527	t	কঁচাকাঁটা	Kachakata	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6fi01x9w88o0dbv1tmy	cmozwcy6300db408or1oyvxch	Pathordubi	pathordubi-union	4139	2026-05-10 15:56:04.11	2026-05-10 16:53:03.54	t	পাথরডুবি	Pathordubi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6fq01xaw88oh5i8f0za	cmozwcy6300db408or1oyvxch	Shilkhuri	shilkhuri-union	4140	2026-05-10 15:56:04.118	2026-05-10 16:53:03.547	t	শিলখুড়ি	Shilkhuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6g001xbw88o8khl4kh8	cmozwcy6300db408or1oyvxch	Tilai	tilai-union	4141	2026-05-10 15:56:04.128	2026-05-10 16:53:03.554	t	তিলাই	Tilai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6g901xcw88onmv2kz5q	cmozwcy6300db408or1oyvxch	Paikarchara	paikarchara-union	4142	2026-05-10 15:56:04.137	2026-05-10 16:53:03.56	t	পাইকেরছড়া	Paikarchara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6gj01xdw88oiuz2mrid	cmozwcy6300db408or1oyvxch	Bhurungamari	bhurungamari-union	4143	2026-05-10 15:56:04.147	2026-05-10 16:53:03.567	t	ভূরুঙ্গামারী	Bhurungamari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6gs01xew88of8silnpt	cmozwcy6300db408or1oyvxch	Joymonirhat	joymonirhat-union	4144	2026-05-10 15:56:04.156	2026-05-10 16:53:03.573	t	জয়মনিরহাট	Joymonirhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6h201xfw88oa4xl5agy	cmozwcy6300db408or1oyvxch	Andharirjhar	andharirjhar-union	4145	2026-05-10 15:56:04.166	2026-05-10 16:53:03.58	t	আন্ধারীরঝাড়	Andharirjhar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6hc01xgw88op1g5qpfk	cmozwcy6300db408or1oyvxch	Char-Bhurungamari	char-bhurungamari-union	4146	2026-05-10 15:56:04.176	2026-05-10 16:53:03.586	t	চর-ভূরুঙ্গামারী	Char-Bhurungamari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6hl01xhw88o4c77410e	cmozwcy6300db408or1oyvxch	Bangasonahat	bangasonahat-union	4147	2026-05-10 15:56:04.185	2026-05-10 16:53:03.592	t	বঙ্গসোনাহাট	Bangasonahat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6hv01xiw88ofbb2s8r3	cmozwcy6300db408or1oyvxch	Boldia	boldia-union	4148	2026-05-10 15:56:04.195	2026-05-10 16:53:03.599	t	বলদিয়া	Boldia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6i401xjw88o6qcfei1q	cmozwcy6u00df408onhofo16u	Nawdanga	nawdanga-union	4149	2026-05-10 15:56:04.204	2026-05-10 16:53:03.605	t	নাওডাঙ্গা	Nawdanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6ie01xkw88oge2ot5gj	cmozwcy6u00df408onhofo16u	Shimulbari	shimulbari-union	4150	2026-05-10 15:56:04.214	2026-05-10 16:53:03.613	t	শিমুলবাড়ী	Shimulbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6ip01xlw88oxx2gj923	cmozwcy6u00df408onhofo16u	Phulbari	phulbari-union-1	4151	2026-05-10 15:56:04.225	2026-05-10 16:53:03.62	t	ফুলবাড়ী	Phulbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6ix01xmw88ovrle8eqq	cmozwcy6u00df408onhofo16u	Baravita	baravita-union	4152	2026-05-10 15:56:04.233	2026-05-10 16:53:03.627	t	বড়ভিটা	Baravita	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg68n01wmw88olp544m5s	cmozwcyby00e2408og8iuvobw	Kurshaupk	kurshaupk-union	4107	2026-05-10 15:56:03.864	2026-05-10 16:53:03.389	t	কুর্শা	Kurshaupk	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg68y01wnw88o58rn952n	cmozwcy6g00dd408oak91urht	Holokhana	holokhana-union	4117	2026-05-10 15:56:03.874	2026-05-10 16:53:03.397	t	হলোখানা	Holokhana	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6k201xqw88oeosdt3au	cmozwcy7100dg408ohilocqc2	Rajarhat	rajarhat-union	4156	2026-05-10 15:56:04.274	2026-05-10 16:53:03.653	t	রাজারহাট	Rajarhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6kb01xrw88o2q84bpm9	cmozwcy7100dg408ohilocqc2	Nazimkhan	nazimkhan-union	4157	2026-05-10 15:56:04.283	2026-05-10 16:53:03.66	t	নাজিমখাঁন	Nazimkhan	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6kt01xtw88omxj76kwa	cmozwcy7100dg408ohilocqc2	Chakirpashar	chakirpashar-union	4159	2026-05-10 15:56:04.301	2026-05-10 16:53:03.672	t	চাকিরপশার	Chakirpashar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6l301xuw88ohf4ce95d	cmozwcy7100dg408ohilocqc2	Biddanondo	biddanondo-union	4160	2026-05-10 15:56:04.311	2026-05-10 16:53:03.678	t	বিদ্যানন্দ	Biddanondo	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6lb01xvw88ogee3u4tk	cmozwcy7100dg408ohilocqc2	Umarmajid	umarmajid-union	4161	2026-05-10 15:56:04.319	2026-05-10 16:53:03.684	t	উমর মজিদ	Umarmajid	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6lm01xww88opkgxeod3	cmozwcy7l00dj408op8usqk94	Daldalia	daldalia-union	4162	2026-05-10 15:56:04.33	2026-05-10 16:53:03.691	t	দলদলিয়া	Daldalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6m401xxw88ow53gm6c3	cmozwcy7l00dj408op8usqk94	Durgapur	durgapur-union-7	4163	2026-05-10 15:56:04.348	2026-05-10 16:53:03.697	t	দুর্গাপুর	Durgapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6me01xyw88oe50nv0pu	cmozwcy7l00dj408op8usqk94	Pandul	pandul-union	4164	2026-05-10 15:56:04.358	2026-05-10 16:53:03.703	t	পান্ডুল	Pandul	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6mm01xzw88oihaz0aol	cmozwcy7l00dj408op8usqk94	Buraburi	buraburi-union	4165	2026-05-10 15:56:04.366	2026-05-10 16:53:03.71	t	বুড়াবুড়ী	Buraburi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6mw01y0w88ompm4mnnr	cmozwcy7l00dj408op8usqk94	Dharanibari	dharanibari-union	4166	2026-05-10 15:56:04.376	2026-05-10 16:53:03.716	t	ধরণীবাড়ী	Dharanibari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6n401y1w88o4krp4650	cmozwcy7l00dj408op8usqk94	Dhamsreni	dhamsreni-union	4167	2026-05-10 15:56:04.384	2026-05-10 16:53:03.723	t	ধামশ্রেণী	Dhamsreni	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6nf01y2w88o729pcz94	cmozwcy7l00dj408op8usqk94	Gunaigas	gunaigas-union	4168	2026-05-10 15:56:04.395	2026-05-10 16:53:03.729	t	গুনাইগাছ	Gunaigas	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6no01y3w88odb9v9y6y	cmozwcy7l00dj408op8usqk94	Bazra	bazra-union	4169	2026-05-10 15:56:04.404	2026-05-10 16:53:03.736	t	বজরা	Bazra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6nz01y4w88ozq5rfch4	cmozwcy7l00dj408op8usqk94	Tobockpur	tobockpur-union	4170	2026-05-10 15:56:04.415	2026-05-10 16:53:03.742	t	তবকপুর	Tobockpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6od01y5w88ol6yzhnit	cmozwcy7l00dj408op8usqk94	Hatia	hatia-union	4171	2026-05-10 15:56:04.429	2026-05-10 16:53:03.748	t	হাতিয়া	Hatia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6oo01y6w88o6n7a7biy	cmozwcy7l00dj408op8usqk94	Begumgonj	begumgonj-union	4172	2026-05-10 15:56:04.44	2026-05-10 16:53:03.755	t	বেগমগঞ্জ	Begumgonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6p001y7w88oq9mtnqhe	cmozwcy7l00dj408op8usqk94	Shahabiar Alga	shahabiar-alga-union	4173	2026-05-10 15:56:04.452	2026-05-10 16:53:03.761	t	সাহেবের আলগা	Shahabiar Alga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6pb01y8w88oobk9n0g0	cmozwcy7l00dj408op8usqk94	Thetrai	thetrai-union	4174	2026-05-10 15:56:04.463	2026-05-10 16:53:03.767	t	থেতরাই	Thetrai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6po01y9w88o6swsyep0	cmozwcy6900dc408oa6won1pj	Ranigonj	ranigonj-union	4175	2026-05-10 15:56:04.476	2026-05-10 16:53:03.774	t	রাণীগঞ্জ	Ranigonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6px01yaw88o264gawqx	cmozwcy6900dc408oa6won1pj	Nayarhat	nayarhat-union	4176	2026-05-10 15:56:04.485	2026-05-10 16:53:03.78	t	নয়ারহাট	Nayarhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6q801ybw88ol9p2a4o0	cmozwcy6900dc408oa6won1pj	Thanahat	thanahat-union	4177	2026-05-10 15:56:04.496	2026-05-10 16:53:03.787	t	থানাহাট	Thanahat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6qi01ycw88olry4j74x	cmozwcy6900dc408oa6won1pj	Ramna	ramna-union-1	4178	2026-05-10 15:56:04.506	2026-05-10 16:53:03.793	t	রমনা	Ramna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6qr01ydw88oq9nsz3im	cmozwcy6900dc408oa6won1pj	Chilmari	chilmari-union	4179	2026-05-10 15:56:04.515	2026-05-10 16:53:03.8	t	চিলমারী	Chilmari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6r001yew88o39f6sm3u	cmozwcy6900dc408oa6won1pj	Austomirchar	austomirchar-union	4180	2026-05-10 15:56:04.524	2026-05-10 16:53:03.807	t	অষ্টমীর চর	Austomirchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6r801yfw88oe4lgambm	cmozwcy2600cp408owudjab3v	Kamararchor	kamararchor-union	4189	2026-05-10 15:56:04.532	2026-05-10 16:53:03.813	t	কামারের চর	Kamararchor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6ri01ygw88omxr86lwr	cmozwcy2600cp408owudjab3v	Chorsherpur	chorsherpur-union	4190	2026-05-10 15:56:04.542	2026-05-10 16:53:03.819	t	চরশেরপুর	Chorsherpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6rq01yhw88ob6v3af5k	cmozwcy2600cp408owudjab3v	Bajitkhila	bajitkhila-union	4191	2026-05-10 15:56:04.55	2026-05-10 16:53:03.826	t	বাজিতখিলা	Bajitkhila	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6s101yiw88oa7dhy1x9	cmozwcy2600cp408owudjab3v	Gajir Khamar	gajir-khamar-union	4192	2026-05-10 15:56:04.561	2026-05-10 16:53:03.832	t	গাজির খামার	Gajir Khamar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6sc01yjw88op1v5uklr	cmozwcy2600cp408owudjab3v	Dhola	dhola-union-1	4193	2026-05-10 15:56:04.572	2026-05-10 16:53:03.838	t	ধলা	Dhola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6sl01ykw88orszxnwrm	cmozwcy2600cp408owudjab3v	Pakuriya	pakuriya-union	4194	2026-05-10 15:56:04.581	2026-05-10 16:53:03.844	t	পাকুরিয়া	Pakuriya	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6sv01ylw88ofoszg72w	cmozwcy2600cp408owudjab3v	Vatshala	vatshala-union	4195	2026-05-10 15:56:04.591	2026-05-10 16:53:03.85	t	ভাতশালা	Vatshala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6t401ymw88oj9vwid3i	cmozwcy2600cp408owudjab3v	Losmonpur	losmonpur-union	4196	2026-05-10 15:56:04.6	2026-05-10 16:53:03.856	t	লছমনপুর	Losmonpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6te01ynw88owx2gocf0	cmozwcy2600cp408owudjab3v	Rouha	rouha-union	4197	2026-05-10 15:56:04.61	2026-05-10 16:53:03.862	t	রৌহা	Rouha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6tn01yow88oerinm58m	cmozwcy2600cp408owudjab3v	Kamariya	kamariya-union	4198	2026-05-10 15:56:04.619	2026-05-10 16:53:03.868	t	কামারিয়া	Kamariya	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg74901zrw88ojs9jiobg	cmozwcxzk00cb408ontv4r3zp	Kanthal	kanthal-union	4256	2026-05-10 15:56:05.001	2026-05-10 16:53:04.117	t	কাঁঠাল	Kanthal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6jj01xow88ohjdbmnaj	cmozwcy6u00df408onhofo16u	Kashipur	kashipur-union-2	4154	2026-05-10 15:56:04.255	2026-05-10 16:53:03.64	t	কাশিপুর	Kashipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6js01xpw88obpljpht3	cmozwcy7100dg408ohilocqc2	Chinai	chinai-union	4155	2026-05-10 15:56:04.264	2026-05-10 16:53:03.647	t	ছিনাই	Chinai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6us01ysw88oha2i1pdz	cmozwcy2600cp408owudjab3v	Balairchar	balairchar-union	4202	2026-05-10 15:56:04.66	2026-05-10 16:53:03.894	t	বলাইরচর	Balairchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6v201ytw88ol6c2dxxc	cmozwcy2000co408odws6k3gl	Puraga	puraga-union	4203	2026-05-10 15:56:04.67	2026-05-10 16:53:03.9	t	পোড়াগাও	Puraga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6vc01yuw88onc16v8l6	cmozwcy2000co408odws6k3gl	Nonni	nonni-union	4204	2026-05-10 15:56:04.68	2026-05-10 16:53:03.907	t	নন্নী	Nonni	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6vm01yvw88oy6pkblc6	cmozwcy2000co408odws6k3gl	Morichpuran	morichpuran-union	4205	2026-05-10 15:56:04.69	2026-05-10 16:53:03.913	t	মরিচপুরাণ	Morichpuran	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6vx01yww88ogtopimcb	cmozwcy2000co408odws6k3gl	Rajnogor	rajnogor-union	4206	2026-05-10 15:56:04.701	2026-05-10 16:53:03.92	t	রাজনগর	Rajnogor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6w701yxw88okeccm3w8	cmozwcy2000co408odws6k3gl	Nayabil	nayabil-union	4207	2026-05-10 15:56:04.711	2026-05-10 16:53:03.926	t	নয়াবীল	Nayabil	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6wg01yyw88ovea4r2qd	cmozwcy2000co408odws6k3gl	Ramchondrokura	ramchondrokura-union	4208	2026-05-10 15:56:04.72	2026-05-10 16:53:03.932	t	রামচন্দ্রকুড়া	Ramchondrokura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6wr01yzw88o7pkj68tk	cmozwcy2000co408odws6k3gl	Kakorkandhi	kakorkandhi-union	4209	2026-05-10 15:56:04.731	2026-05-10 16:53:03.938	t	কাকরকান্দি	Kakorkandhi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6x101z0w88ojf3hzm5z	cmozwcy2000co408odws6k3gl	Nalitabari	nalitabari-union	4210	2026-05-10 15:56:04.741	2026-05-10 16:53:03.945	t	নালিতাবাড়ী	Nalitabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6xa01z1w88o46rvsggr	cmozwcy2000co408odws6k3gl	Juganiya	juganiya-union	4211	2026-05-10 15:56:04.75	2026-05-10 16:53:03.951	t	যোগনীয়া	Juganiya	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6xk01z2w88oattioh1q	cmozwcy2000co408odws6k3gl	Bagber	bagber-union	4212	2026-05-10 15:56:04.76	2026-05-10 16:53:03.959	t	বাঘবেড়	Bagber	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6xt01z3w88oswo9s94r	cmozwcy2000co408odws6k3gl	Koloshpar	koloshpar-union	4213	2026-05-10 15:56:04.769	2026-05-10 16:53:03.966	t	কলসপাড়	Koloshpar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6y301z4w88omb0djapu	cmozwcy2000co408odws6k3gl	Rupnarayankura	rupnarayankura-union	4214	2026-05-10 15:56:04.779	2026-05-10 16:53:03.973	t	রূপনারায়নকুড়া	Rupnarayankura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6yd01z5w88o5bpo44sc	cmozwcy1p00cm408o6b1gou6z	Kansa	kansa-union	4234	2026-05-10 15:56:04.789	2026-05-10 16:53:03.98	t	কাংশা	Kansa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6ym01z6w88o23lr9s7t	cmozwcy1p00cm408o6b1gou6z	Dansail	dansail-union	4235	2026-05-10 15:56:04.798	2026-05-10 16:53:03.987	t	ধানশাইল	Dansail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6yw01z7w88ov5ah63yn	cmozwcy1p00cm408o6b1gou6z	Nolkura	nolkura-union	4236	2026-05-10 15:56:04.808	2026-05-10 16:53:03.993	t	নলকুড়া	Nolkura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6z601z8w88ok5hj1lnc	cmozwcy1p00cm408o6b1gou6z	Gouripur	gouripur-union-1	4237	2026-05-10 15:56:04.818	2026-05-10 16:53:03.999	t	গৌরিপুর	Gouripur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6zg01z9w88on28xra6t	cmozwcy1p00cm408o6b1gou6z	Jhenaigati	jhenaigati-union	4238	2026-05-10 15:56:04.828	2026-05-10 16:53:04.005	t	ঝিনাইগাতী	Jhenaigati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6zr01zaw88oiy4dpc34	cmozwcy1p00cm408o6b1gou6z	Hatibandha	hatibandha-union-1	4239	2026-05-10 15:56:04.839	2026-05-10 16:53:04.011	t	হাতিবান্দা	Hatibandha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg70001zbw88o4ns4iel1	cmozwcy1p00cm408o6b1gou6z	Malijhikanda	malijhikanda-union	4240	2026-05-10 15:56:04.848	2026-05-10 16:53:04.017	t	মালিঝিকান্দা	Malijhikanda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg70a01zcw88oyu0j31lo	cmozwcxxc00c1408obvzm6eke	Deukhola	deukhola-union	4241	2026-05-10 15:56:04.858	2026-05-10 16:53:04.023	t	দেওখোলা	Deukhola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg70j01zdw88o9ouofdzs	cmozwcxxc00c1408obvzm6eke	Naogaon	naogaon-union-1	4242	2026-05-10 15:56:04.867	2026-05-10 16:53:04.03	t	নাওগাঁও	Naogaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg70u01zew88ozxjzpivi	cmozwcxxc00c1408obvzm6eke	Putijana	putijana-union	4243	2026-05-10 15:56:04.878	2026-05-10 16:53:04.037	t	পুটিজানা	Putijana	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg71301zfw88of2q1w8bf	cmozwcxxc00c1408obvzm6eke	Kushmail	kushmail-union	4244	2026-05-10 15:56:04.887	2026-05-10 16:53:04.043	t	কুশমাইল	Kushmail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg71e01zgw88ohy5b7ty5	cmozwcxxc00c1408obvzm6eke	Fulbaria	fulbaria-union-2	4245	2026-05-10 15:56:04.898	2026-05-10 16:53:04.05	t	ফুলবাড়ীয়া	Fulbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg71o01zhw88o3sutp348	cmozwcxxc00c1408obvzm6eke	Bakta	bakta-union	4246	2026-05-10 15:56:04.908	2026-05-10 16:53:04.056	t	বাক্তা	Bakta	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg72601zjw88o54q5kqdj	cmozwcxxc00c1408obvzm6eke	Enayetpur	enayetpur-union	4248	2026-05-10 15:56:04.927	2026-05-10 16:53:04.068	t	এনায়েতপুর	Enayetpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg72f01zkw88ojd2yg5xd	cmozwcxxc00c1408obvzm6eke	Kaladaha	kaladaha-union	4249	2026-05-10 15:56:04.935	2026-05-10 16:53:04.075	t	কালাদহ	Kaladaha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg72q01zlw88oqcpw9sba	cmozwcxxc00c1408obvzm6eke	Radhakanai	radhakanai-union	4250	2026-05-10 15:56:04.946	2026-05-10 16:53:04.081	t	রাধাকানাই	Radhakanai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg72z01zmw88oxkarkfcr	cmozwcxxc00c1408obvzm6eke	Asimpatuli	asimpatuli-union	4251	2026-05-10 15:56:04.955	2026-05-10 16:53:04.087	t	আছিমপাটুলী	Asimpatuli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg73801znw88o96hvyt90	cmozwcxxc00c1408obvzm6eke	Vobanipur	vobanipur-union	4252	2026-05-10 15:56:04.964	2026-05-10 16:53:04.093	t	ভবানীপুর	Vobanipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg73h01zow88oayhm22qk	cmozwcxxc00c1408obvzm6eke	Balian	balian-union	4253	2026-05-10 15:56:04.973	2026-05-10 16:53:04.099	t	বালিয়ান	Balian	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg73r01zpw88o902gv716	cmozwcxzk00cb408ontv4r3zp	Dhanikhola	dhanikhola-union	4254	2026-05-10 15:56:04.983	2026-05-10 16:53:04.105	t	ধানীখোলা	Dhanikhola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg74101zqw88ok3rrfjmr	cmozwcxzk00cb408ontv4r3zp	Bailor	bailor-union	4255	2026-05-10 15:56:04.993	2026-05-10 16:53:04.111	t	বৈলর	Bailor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6u701yqw88onziluo9z	cmozwcy2600cp408owudjab3v	Chorpokhimari	chorpokhimari-union	4200	2026-05-10 15:56:04.639	2026-05-10 16:53:03.881	t	চর পক্ষীমারি	Chorpokhimari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6uh01yrw88oharl91nf	cmozwcy2600cp408owudjab3v	Betmari Ghughurakandi	betmari-ghughurakandi-union	4201	2026-05-10 15:56:04.649	2026-05-10 16:53:03.888	t	বেতমারি ঘুঘুরাকান্দি	Betmari Ghughurakandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg75d01zvw88oxswq2rog	cmozwcxzk00cb408ontv4r3zp	Sakhua	sakhua-union	4260	2026-05-10 15:56:05.041	2026-05-10 16:53:04.142	t	সাখুয়া	Sakhua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg75m01zww88oojpizzuk	cmozwcxzk00cb408ontv4r3zp	Balipara	balipara-union	4261	2026-05-10 15:56:05.05	2026-05-10 16:53:04.148	t	বালিপাড়া	Balipara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg75w01zxw88oy90h8rha	cmozwcxzk00cb408ontv4r3zp	Mokshapur	mokshapur-union	4262	2026-05-10 15:56:05.06	2026-05-10 16:53:04.154	t	মোক্ষপুর	Mokshapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg76401zyw88owx1zcvjy	cmozwcxzk00cb408ontv4r3zp	Mathbari	mathbari-union	4263	2026-05-10 15:56:05.068	2026-05-10 16:53:04.16	t	মঠবাড়ী	Mathbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg76e01zzw88oh3pro0y7	cmozwcxzk00cb408ontv4r3zp	Amirabari	amirabari-union	4264	2026-05-10 15:56:05.078	2026-05-10 16:53:04.166	t	আমিরাবাড়ী	Amirabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg76p0200w88ooshd8bm1	cmozwcxzk00cb408ontv4r3zp	Rampur	rampur-union-1	4265	2026-05-10 15:56:05.089	2026-05-10 16:53:04.172	t	রামপুর	Rampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg76y0201w88ombs9j6rh	cmozwcxwz00bz408otrbwjyrb	Uthura	uthura-union	4266	2026-05-10 15:56:05.098	2026-05-10 16:53:04.179	t	উথুরা	Uthura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7780202w88ovfbsepsk	cmozwcxwz00bz408otrbwjyrb	Meduari	meduari-union	4267	2026-05-10 15:56:05.108	2026-05-10 16:53:04.185	t	মেদুয়ারী	Meduari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg77h0203w88o21sp7qtn	cmozwcxwz00bz408otrbwjyrb	Varadoba	varadoba-union	4268	2026-05-10 15:56:05.117	2026-05-10 16:53:04.191	t	ভরাডোবা	Varadoba	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg77s0204w88obvxv7a4x	cmozwcxwz00bz408otrbwjyrb	Dhitpur	dhitpur-union	4269	2026-05-10 15:56:05.128	2026-05-10 16:53:04.198	t	ধীতপুর	Dhitpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7810205w88oybdhzvc6	cmozwcxwz00bz408otrbwjyrb	Dakatia	dakatia-union	4270	2026-05-10 15:56:05.137	2026-05-10 16:53:04.204	t	ডাকাতিয়া	Dakatia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg78c0206w88oavovzr3q	cmozwcxwz00bz408otrbwjyrb	Birunia	birunia-union	4271	2026-05-10 15:56:05.148	2026-05-10 16:53:04.211	t	বিরুনিয়া	Birunia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg78m0207w88ozy0bvbcx	cmozwcxwz00bz408otrbwjyrb	Bhaluka	bhaluka-union	4272	2026-05-10 15:56:05.158	2026-05-10 16:53:04.218	t	ভালুকা	Bhaluka	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg78v0208w88oerlbg33x	cmozwcxwz00bz408otrbwjyrb	Mallikbari	mallikbari-union	4273	2026-05-10 15:56:05.167	2026-05-10 16:53:04.225	t	মল্লিকবাড়ী	Mallikbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7950209w88ooxapybc8	cmozwcxwz00bz408otrbwjyrb	Kachina	kachina-union	4274	2026-05-10 15:56:05.177	2026-05-10 16:53:04.231	t	কাচিনা	Kachina	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg79d020aw88o6113cesp	cmozwcxwz00bz408otrbwjyrb	Habirbari	habirbari-union	4275	2026-05-10 15:56:05.185	2026-05-10 16:53:04.238	t	হবিরবাড়ী	Habirbari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg79o020bw88oe176vrtm	cmozwcxwz00bz408otrbwjyrb	Rajoi	rajoi-union	4276	2026-05-10 15:56:05.196	2026-05-10 16:53:04.245	t	রাজৈ	Rajoi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7a6020dw88ofk3zmgzj	cmozwcxys00c8408ooyjlk05f	Bororchar	bororchar-union	4288	2026-05-10 15:56:05.214	2026-05-10 16:53:04.258	t	বোররচর	Bororchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7ai020ew88ojvjbwiab	cmozwcxys00c8408ooyjlk05f	Dapunia	dapunia-union-1	4289	2026-05-10 15:56:05.226	2026-05-10 16:53:04.264	t	দাপুনিয়া	Dapunia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7ar020fw88opb1awilc	cmozwcxys00c8408ooyjlk05f	Aqua	aqua-union	4290	2026-05-10 15:56:05.235	2026-05-10 16:53:04.27	t	আকুয়া	Aqua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7b1020gw88ox2fe76fn	cmozwcxys00c8408ooyjlk05f	Khagdohor	khagdohor-union	4291	2026-05-10 15:56:05.245	2026-05-10 16:53:04.277	t	খাগডহর	Khagdohor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7ba020hw88ok2u26jhj	cmozwcxys00c8408ooyjlk05f	Charnilaxmia	charnilaxmia-union	4292	2026-05-10 15:56:05.254	2026-05-10 16:53:04.283	t	চরনিলক্ষিয়া	Charnilaxmia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7bk020iw88omp10hdk0	cmozwcxys00c8408ooyjlk05f	Kushtia	kushtia-union	4293	2026-05-10 15:56:05.264	2026-05-10 16:53:04.291	t	কুষ্টিয়া	Kushtia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7bt020jw88okhdeic35	cmozwcxys00c8408ooyjlk05f	Paranganj	paranganj-union	4294	2026-05-10 15:56:05.273	2026-05-10 16:53:04.299	t	পরানগঞ্জ	Paranganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7c2020kw88ospc4z4c8	cmozwcxys00c8408ooyjlk05f	Sirta	sirta-union	4295	2026-05-10 15:56:05.282	2026-05-10 16:53:04.308	t	সিরতা	Sirta	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7cd020lw88o12cp8i8k	cmozwcxys00c8408ooyjlk05f	Char Ishwardia	char-ishwardia-union	4296	2026-05-10 15:56:05.293	2026-05-10 16:53:04.316	t	চর ঈশ্বরদিয়া	Char Ishwardia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7cm020mw88ovh0xd9ix	cmozwcxys00c8408ooyjlk05f	Ghagra	ghagra-union	4297	2026-05-10 15:56:05.302	2026-05-10 16:53:04.325	t	ঘাগড়া	Ghagra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7cy020nw88o3pjvnzwj	cmozwcxys00c8408ooyjlk05f	Vabokhali	vabokhali-union	4298	2026-05-10 15:56:05.314	2026-05-10 16:53:04.333	t	ভাবখালী	Vabokhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7d8020ow88o7c35bfz7	cmozwcxys00c8408ooyjlk05f	Boyra	boyra-union	4299	2026-05-10 15:56:05.324	2026-05-10 16:53:04.341	t	বয়ড়া	Boyra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7dh020pw88ocm2idh9q	cmozwcxx600c0408ozewfhwlf	Dakshin Maijpara	dakshin-maijpara-union	4300	2026-05-10 15:56:05.333	2026-05-10 16:53:04.348	t	দক্ষিণ মাইজপাড়া	Dakshin Maijpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7dr020qw88o9n9ibdf0	cmozwcxx600c0408ozewfhwlf	Gamaritola	gamaritola-union	4301	2026-05-10 15:56:05.343	2026-05-10 16:53:04.355	t	গামারীতলা	Gamaritola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7dz020rw88o8x8w77ly	cmozwcxx600c0408ozewfhwlf	Dhobaura	dhobaura-union	4302	2026-05-10 15:56:05.351	2026-05-10 16:53:04.363	t	ধোবাউড়া	Dhobaura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7ea020sw88o1qpuapyp	cmozwcxx600c0408ozewfhwlf	Porakandulia	porakandulia-union	4303	2026-05-10 15:56:05.362	2026-05-10 16:53:04.37	t	পোড়াকান্দুলিয়া	Porakandulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7ej020tw88orxx32j0j	cmozwcxx600c0408ozewfhwlf	Goatala	goatala-union	4304	2026-05-10 15:56:05.371	2026-05-10 16:53:04.376	t	গোয়াতলা	Goatala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7es020uw88o1s068uqx	cmozwcxx600c0408ozewfhwlf	Ghoshgaon	ghoshgaon-union	4305	2026-05-10 15:56:05.38	2026-05-10 16:53:04.383	t	ঘোষগাঁও	Ghoshgaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg74s01ztw88ozc6mz82u	cmozwcxzk00cb408ontv4r3zp	Trishal	trishal-union	4258	2026-05-10 15:56:05.02	2026-05-10 16:53:04.13	t	ত্রিশাল	Trishal	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg75301zuw88optj25jva	cmozwcxzk00cb408ontv4r3zp	Harirampur	harirampur-union-2	4259	2026-05-10 15:56:05.031	2026-05-10 16:53:04.136	t	হরিরামপুর	Harirampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7ft020yw88o671hcvz1	cmozwcxza00ca408o4yty6a02	Balikha	balikha-union	4318	2026-05-10 15:56:05.417	2026-05-10 16:53:04.406	t	বালিখা	Balikha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7g4020zw88ozlkxxe4f	cmozwcxza00ca408o4yty6a02	Kakni	kakni-union	4319	2026-05-10 15:56:05.428	2026-05-10 16:53:04.413	t	কাকনী	Kakni	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7gc0210w88ogmwvqmc7	cmozwcxza00ca408o4yty6a02	Dhakua	dhakua-union	4320	2026-05-10 15:56:05.436	2026-05-10 16:53:04.419	t	ঢাকুয়া	Dhakua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7gv0212w88o2cmpxdie	cmozwcxza00ca408o4yty6a02	Galagaon	galagaon-union	4323	2026-05-10 15:56:05.455	2026-05-10 16:53:04.431	t	গালাগাঁও	Galagaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7h60213w88o477a42zj	cmozwcxza00ca408o4yty6a02	Kamargaon	kamargaon-union-1	4324	2026-05-10 15:56:05.466	2026-05-10 16:53:04.437	t	কামারগাঁও	Kamargaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7hg0214w88oht3ay933	cmozwcxza00ca408o4yty6a02	Kamaria	kamaria-union	4325	2026-05-10 15:56:05.476	2026-05-10 16:53:04.443	t	কামারিয়া	Kamaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7hr0215w88oj4pl0wpm	cmozwcxza00ca408o4yty6a02	Rampur	rampur-union-2	4326	2026-05-10 15:56:05.487	2026-05-10 16:53:04.449	t	রামপুর	Rampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7i10216w88onzfgb19j	cmozwcxy500c5408ov7d7ah6w	Bhubankura	bhubankura-union	4327	2026-05-10 15:56:05.497	2026-05-10 16:53:04.456	t	ভূবনকুড়া	Bhubankura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7ib0217w88oi1spc6ky	cmozwcxy500c5408ov7d7ah6w	Jugli	jugli-union	4328	2026-05-10 15:56:05.507	2026-05-10 16:53:04.462	t	জুগলী	Jugli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7ij0218w88oew329cia	cmozwcxy500c5408ov7d7ah6w	Kaichapur	kaichapur-union	4329	2026-05-10 15:56:05.515	2026-05-10 16:53:04.469	t	কৈচাপুর	Kaichapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7iu0219w88o08gbynh4	cmozwcxy500c5408ov7d7ah6w	Haluaghat	haluaghat-union	4330	2026-05-10 15:56:05.526	2026-05-10 16:53:04.475	t	হালুয়াঘাট	Haluaghat	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7j3021aw88odw5c3ok5	cmozwcxy500c5408ov7d7ah6w	Gazirbhita	gazirbhita-union	4331	2026-05-10 15:56:05.535	2026-05-10 16:53:04.481	t	গাজিরভিটা	Gazirbhita	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7jd021bw88o35fo64bs	cmozwcxy500c5408ov7d7ah6w	Bildora	bildora-union	4332	2026-05-10 15:56:05.545	2026-05-10 16:53:04.487	t	বিলডোরা	Bildora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7jm021cw88oeaum1szq	cmozwcxy500c5408ov7d7ah6w	Sakuai	sakuai-union	4333	2026-05-10 15:56:05.554	2026-05-10 16:53:04.493	t	শাকুয়াই	Sakuai	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7jw021dw88offqsi5it	cmozwcxy500c5408ov7d7ah6w	Narail	narail-union	4334	2026-05-10 15:56:05.564	2026-05-10 16:53:04.5	t	নড়াইল	Narail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7k5021ew88o85d9turg	cmozwcxy500c5408ov7d7ah6w	Dhara	dhara-union	4335	2026-05-10 15:56:05.573	2026-05-10 16:53:04.506	t	ধারা	Dhara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7kf021fw88ookixxf00	cmozwcxy500c5408ov7d7ah6w	Dhurail	dhurail-union-1	4336	2026-05-10 15:56:05.583	2026-05-10 16:53:04.512	t	ধুরাইল	Dhurail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7kq021gw88on0aap1go	cmozwcxy500c5408ov7d7ah6w	Amtoil	amtoil-union	4337	2026-05-10 15:56:05.594	2026-05-10 16:53:04.519	t	আমতৈল	Amtoil	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7kz021hw88o80qjtd82	cmozwcxy500c5408ov7d7ah6w	Swadeshi	swadeshi-union	4338	2026-05-10 15:56:05.603	2026-05-10 16:53:04.525	t	স্বদেশী	Swadeshi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7l9021iw88okwpx1io0	cmozwcxxy00c4408oxtzd0ifa	Sahanati	sahanati-union	4339	2026-05-10 15:56:05.613	2026-05-10 16:53:04.533	t	সহনাটি	Sahanati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7lj021jw88o16441axs	cmozwcxxy00c4408oxtzd0ifa	Achintapur	achintapur-union	4340	2026-05-10 15:56:05.623	2026-05-10 16:53:04.54	t	অচিন্তপুর	Achintapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7ls021kw88orj1lmcg5	cmozwcxxy00c4408oxtzd0ifa	Mailakanda	mailakanda-union	4341	2026-05-10 15:56:05.632	2026-05-10 16:53:04.546	t	মইলাকান্দা	Mailakanda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7m2021lw88oywbnplbi	cmozwcxxy00c4408oxtzd0ifa	Bokainagar	bokainagar-union	4342	2026-05-10 15:56:05.642	2026-05-10 16:53:04.552	t	বোকাইনগর	Bokainagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7md021mw88ok113g4a3	cmozwcxxy00c4408oxtzd0ifa	Gouripur	gouripur-union-2	4343	2026-05-10 15:56:05.653	2026-05-10 16:53:04.559	t	গৌরীপুর	Gouripur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7mn021nw88ohygz3dx0	cmozwcxxy00c4408oxtzd0ifa	Maoha	maoha-union	4344	2026-05-10 15:56:05.663	2026-05-10 16:53:04.566	t	মাওহা	Maoha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7mw021ow88ov8xn0skv	cmozwcxxy00c4408oxtzd0ifa	Ramgopalpur	ramgopalpur-union	4345	2026-05-10 15:56:05.672	2026-05-10 16:53:04.573	t	রামগোপালপুর	Ramgopalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7n5021pw88odjxx9h85	cmozwcxxy00c4408oxtzd0ifa	Douhakhola	douhakhola-union	4346	2026-05-10 15:56:05.681	2026-05-10 16:53:04.579	t	ডৌহাখলা	Douhakhola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7nf021qw88o1d4565uf	cmozwcxxy00c4408oxtzd0ifa	Bhangnamari	bhangnamari-union	4347	2026-05-10 15:56:05.691	2026-05-10 16:53:04.586	t	ভাংনামারী	Bhangnamari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7np021rw88otjazzjce	cmozwcxxy00c4408oxtzd0ifa	Sidhla	sidhla-union-1	4348	2026-05-10 15:56:05.701	2026-05-10 16:53:04.592	t	সিধলা	Sidhla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7o2021sw88ov6n91o4t	cmozwcxxr00c3408ol13hhxla	Rasulpur	rasulpur-union-3	4349	2026-05-10 15:56:05.714	2026-05-10 16:53:04.599	t	রসুলপুর	Rasulpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7od021tw88o8jljqe35	cmozwcxxr00c3408ol13hhxla	Barobaria	barobaria-union-1	4350	2026-05-10 15:56:05.725	2026-05-10 16:53:04.606	t	বারবারিয়া	Barobaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7om021uw88o6r9bwe4l	cmozwcxxr00c3408ol13hhxla	Charalgi	charalgi-union	4351	2026-05-10 15:56:05.734	2026-05-10 16:53:04.612	t	চরআলগী	Charalgi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7ow021vw88ow4xigf9g	cmozwcxxr00c3408ol13hhxla	Saltia	saltia-union	4352	2026-05-10 15:56:05.745	2026-05-10 16:53:04.618	t	সালটিয়া	Saltia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7p5021ww88ovmuh76fx	cmozwcxxr00c3408ol13hhxla	Raona	raona-union	4353	2026-05-10 15:56:05.753	2026-05-10 16:53:04.624	t	রাওনা	Raona	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7pf021xw88oor83oiay	cmozwcxxr00c3408ol13hhxla	Longair	longair-union	4354	2026-05-10 15:56:05.763	2026-05-10 16:53:04.631	t	লংগাইর	Longair	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7pp021yw88ojw1vpfrf	cmozwcxxr00c3408ol13hhxla	Paithol	paithol-union	4355	2026-05-10 15:56:05.773	2026-05-10 16:53:04.637	t	পাইথল	Paithol	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7fb020ww88oisn8se1f	cmozwcxza00ca408o4yty6a02	Banihala	banihala-union	4312	2026-05-10 15:56:05.4	2026-05-10 16:53:04.395	t	বানিহালা	Banihala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7fl020xw88oc1oqzmvm	cmozwcxza00ca408o4yty6a02	Biska	biska-union	4313	2026-05-10 15:56:05.409	2026-05-10 16:53:04.401	t	বিস্কা	Biska	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7qs0222w88o3yz1d30o	cmozwcxxr00c3408ol13hhxla	Panchbagh	panchbagh-union	4359	2026-05-10 15:56:05.812	2026-05-10 16:53:04.662	t	পাঁচবাগ	Panchbagh	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7r20223w88ogs39icc5	cmozwcxxr00c3408ol13hhxla	Usthi	usthi-union	4360	2026-05-10 15:56:05.822	2026-05-10 16:53:04.669	t	উস্থি	Usthi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7rb0224w88onboj1j4e	cmozwcxxr00c3408ol13hhxla	Dotterbazar	dotterbazar-union	4361	2026-05-10 15:56:05.831	2026-05-10 16:53:04.675	t	দত্তেরবাজার	Dotterbazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7rm0225w88orhspveub	cmozwcxxr00c3408ol13hhxla	Niguari	niguari-union	4362	2026-05-10 15:56:05.842	2026-05-10 16:53:04.682	t	নিগুয়ারী	Niguari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7rv0226w88or9wvqcmw	cmozwcxxr00c3408ol13hhxla	Tangabo	tangabo-union	4363	2026-05-10 15:56:05.851	2026-05-10 16:53:04.689	t	টাংগাব	Tangabo	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7s50227w88ok8cu0tti	cmozwcxz000c9408oo7ayufgk	Batagoir	batagoir-union	4375	2026-05-10 15:56:05.861	2026-05-10 16:53:04.695	t	বেতাগৈর	Batagoir	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7se0228w88oak4hzspy	cmozwcxz000c9408oo7ayufgk	Nandail	nandail-union	4376	2026-05-10 15:56:05.87	2026-05-10 16:53:04.701	t	নান্দাইল	Nandail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7sp0229w88ol6fobzza	cmozwcxz000c9408oo7ayufgk	Chandipasha	chandipasha-union-1	4377	2026-05-10 15:56:05.881	2026-05-10 16:53:04.708	t	চন্ডীপাশা	Chandipasha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7sz022aw88oeo3eqhrt	cmozwcxz000c9408oo7ayufgk	Gangail	gangail-union	4378	2026-05-10 15:56:05.891	2026-05-10 16:53:04.714	t	গাংগাইল	Gangail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7t7022bw88o3cz2zx1r	cmozwcxz000c9408oo7ayufgk	Rajgati	rajgati-union	4379	2026-05-10 15:56:05.899	2026-05-10 16:53:04.721	t	রাজগাতী	Rajgati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7ti022cw88onfgku5rg	cmozwcxz000c9408oo7ayufgk	Muajjempur	muajjempur-union	4380	2026-05-10 15:56:05.91	2026-05-10 16:53:04.727	t	মোয়াজ্জেমপুর	Muajjempur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7tr022dw88ongjt5jst	cmozwcxz000c9408oo7ayufgk	Sherpur	sherpur-union	4381	2026-05-10 15:56:05.919	2026-05-10 16:53:04.733	t	শেরপুর	Sherpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7u1022ew88oap37urav	cmozwcxz000c9408oo7ayufgk	Singroil	singroil-union	4382	2026-05-10 15:56:05.929	2026-05-10 16:53:04.74	t	সিংরইল	Singroil	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7ub022fw88okg8ncluy	cmozwcxz000c9408oo7ayufgk	Achargaon	achargaon-union	4383	2026-05-10 15:56:05.939	2026-05-10 16:53:04.747	t	আচারগাঁও	Achargaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7uk022gw88oa3kquvk1	cmozwcxz000c9408oo7ayufgk	Mushulli	mushulli-union	4384	2026-05-10 15:56:05.948	2026-05-10 16:53:04.753	t	মুশুল্লী	Mushulli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7uu022hw88onuywhs09	cmozwcxz000c9408oo7ayufgk	Kharua	kharua-union	4385	2026-05-10 15:56:05.958	2026-05-10 16:53:04.759	t	খারুয়া	Kharua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7v2022iw88or8in28kz	cmozwcxz000c9408oo7ayufgk	Jahangirpur	jahangirpur-union	4386	2026-05-10 15:56:05.966	2026-05-10 16:53:04.766	t	জাহাঙ্গীরপুর	Jahangirpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7vd022jw88oc4tpb3o1	cmozwcxw400bv408o9a2wheb3	Kendua	kendua-union	4387	2026-05-10 15:56:05.977	2026-05-10 16:53:04.772	t	কেন্দুয়া	Kendua	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7vm022kw88obmsya96w	cmozwcxw400bv408o9a2wheb3	Sharifpur	sharifpur-union-1	4388	2026-05-10 15:56:05.986	2026-05-10 16:53:04.778	t	শরিফপুর	Sharifpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7vw022lw88oqc028qyp	cmozwcxw400bv408o9a2wheb3	Laxirchar	laxirchar-union	4389	2026-05-10 15:56:05.996	2026-05-10 16:53:04.785	t	লক্ষীরচর	Laxirchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7w5022mw88oju4merux	cmozwcxw400bv408o9a2wheb3	Tolshirchar	tolshirchar-union	4390	2026-05-10 15:56:06.005	2026-05-10 16:53:04.791	t	তুলশীরচর	Tolshirchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7we022nw88o1wnvk3xk	cmozwcxw400bv408o9a2wheb3	Itail	itail-union	4391	2026-05-10 15:56:06.014	2026-05-10 16:53:04.798	t	ইটাইল	Itail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7wo022ow88ot4xpv94t	cmozwcxw400bv408o9a2wheb3	Narundi	narundi-union	4392	2026-05-10 15:56:06.024	2026-05-10 16:53:04.805	t	নরুন্দী	Narundi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7ww022pw88oyuj437jk	cmozwcxw400bv408o9a2wheb3	Ghorada	ghorada-union	4393	2026-05-10 15:56:06.032	2026-05-10 16:53:04.811	t	ঘোড়াধাপ	Ghorada	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7x7022qw88olkd880oc	cmozwcxw400bv408o9a2wheb3	Bashchara	bashchara-union	4394	2026-05-10 15:56:06.043	2026-05-10 16:53:04.818	t	বাশঁচড়া	Bashchara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7xf022rw88ov04m3c6d	cmozwcxw400bv408o9a2wheb3	Ranagacha	ranagacha-union	4395	2026-05-10 15:56:06.051	2026-05-10 16:53:04.824	t	রানাগাছা	Ranagacha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7xp022sw88ovq4he9fd	cmozwcxw400bv408o9a2wheb3	Sheepur	sheepur-union	4396	2026-05-10 15:56:06.061	2026-05-10 16:53:04.83	t	শ্রীপুর	Sheepur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7y7022uw88ofwt1mnih	cmozwcxw400bv408o9a2wheb3	Titpalla	titpalla-union	4398	2026-05-10 15:56:06.079	2026-05-10 16:53:04.842	t	তিতপল্লা	Titpalla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7yg022vw88o0a22ebra	cmozwcxw400bv408o9a2wheb3	Mesta	mesta-union	4399	2026-05-10 15:56:06.088	2026-05-10 16:53:04.849	t	মেষ্টা	Mesta	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7yp022ww88oswbjxfxp	cmozwcxw400bv408o9a2wheb3	Digpait	digpait-union	4400	2026-05-10 15:56:06.097	2026-05-10 16:53:04.855	t	দিগপাইত	Digpait	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7yz022xw88okneadvg0	cmozwcxw400bv408o9a2wheb3	Rashidpur	rashidpur-union	4401	2026-05-10 15:56:06.107	2026-05-10 16:53:04.861	t	রশিদপুর	Rashidpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7z8022yw88o11ame2gr	cmozwcxvw00bu408oeltkh90m	Kulkandi	kulkandi-union	4413	2026-05-10 15:56:06.116	2026-05-10 16:53:04.867	t	কুলকান্দি	Kulkandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7zi022zw88o33bsyq10	cmozwcxvw00bu408oeltkh90m	Belghacha	belghacha-union	4414	2026-05-10 15:56:06.126	2026-05-10 16:53:04.873	t	বেলগাছা	Belghacha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7zq0230w88o4e5c7q45	cmozwcxvw00bu408oeltkh90m	Chinaduli	chinaduli-union	4415	2026-05-10 15:56:06.134	2026-05-10 16:53:04.879	t	চিনাডুলী	Chinaduli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg8010231w88o8nzz7rpt	cmozwcxvw00bu408oeltkh90m	Shapdari	shapdari-union	4416	2026-05-10 15:56:06.145	2026-05-10 16:53:04.885	t	সাপধরী	Shapdari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7q80220w88oqk4pzv95	cmozwcxxr00c3408ol13hhxla	Josora	josora-union	4357	2026-05-10 15:56:05.792	2026-05-10 16:53:04.649	t	যশরা	Josora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7qh0221w88oy5ae8b1v	cmozwcxxr00c3408ol13hhxla	Moshakhali	moshakhali-union	4358	2026-05-10 15:56:05.801	2026-05-10 16:53:04.656	t	মশাখালী	Moshakhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg8150235w88ozcj1ckzm	cmozwcxvw00bu408oeltkh90m	Palabandha	palabandha-union	4420	2026-05-10 15:56:06.185	2026-05-10 16:53:04.91	t	পলবান্ধা	Palabandha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg81g0236w88od80xesel	cmozwcxvw00bu408oeltkh90m	Gualerchar	gualerchar-union	4421	2026-05-10 15:56:06.196	2026-05-10 16:53:04.916	t	গোয়ালেরচর	Gualerchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg81p0237w88o5cigdkxg	cmozwcxvw00bu408oeltkh90m	Gaibandha	gaibandha-union	4422	2026-05-10 15:56:06.205	2026-05-10 16:53:04.922	t	গাইবান্ধা	Gaibandha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg81z0238w88or1y49cyq	cmozwcxvw00bu408oeltkh90m	Charputimari	charputimari-union	4423	2026-05-10 15:56:06.215	2026-05-10 16:53:04.928	t	চরপুটিমারী	Charputimari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg8280239w88o3tyrzw8f	cmozwcxvw00bu408oeltkh90m	Chargualini	chargualini-union	4424	2026-05-10 15:56:06.224	2026-05-10 16:53:04.934	t	চরগোয়ালীনি	Chargualini	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg82g023aw88oc0dxlcu7	cmozwcxwr00by408omr41knee	Satpoa	satpoa-union	4433	2026-05-10 15:56:06.232	2026-05-10 16:53:04.94	t	সাতপোয়া	Satpoa	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg82q023bw88ogjbhhcm0	cmozwcxwr00by408omr41knee	Pogaldigha	pogaldigha-union	4434	2026-05-10 15:56:06.242	2026-05-10 16:53:04.946	t	পোগলদিঘা	Pogaldigha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg82z023cw88onlzwqkns	cmozwcxwr00by408omr41knee	Doail	doail-union	4435	2026-05-10 15:56:06.251	2026-05-10 16:53:04.952	t	ডোয়াইল	Doail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg839023dw88o6jok4psg	cmozwcxwr00by408omr41knee	Aona	aona-union	4436	2026-05-10 15:56:06.261	2026-05-10 16:53:04.958	t	আওনা	Aona	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg83h023ew88o8qsd91tc	cmozwcxwr00by408omr41knee	Pingna	pingna-union	4437	2026-05-10 15:56:06.269	2026-05-10 16:53:04.964	t	পিংনা	Pingna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg83r023fw88ow2xcpa2k	cmozwcxwr00by408omr41knee	Bhatara	bhatara-union	4438	2026-05-10 15:56:06.279	2026-05-10 16:53:04.97	t	ভাটারা	Bhatara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg840023gw88o9pwstv7y	cmozwcxwr00by408omr41knee	Kamrabad	kamrabad-union	4439	2026-05-10 15:56:06.288	2026-05-10 16:53:04.976	t	কামরাবাদ	Kamrabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg849023hw88oefx7cjmm	cmozwcxwr00by408omr41knee	Mahadan	mahadan-union	4440	2026-05-10 15:56:06.297	2026-05-10 16:53:04.982	t	মহাদান	Mahadan	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg84j023iw88ocjblpzjh	cmozwcxwc00bw408ot5uss2tc	Char Pakerdah	char-pakerdah-union	4441	2026-05-10 15:56:06.307	2026-05-10 16:53:04.988	t	চর পাকেরদহ	Char Pakerdah	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg84s023jw88oknsw9agv	cmozwcxwc00bw408ot5uss2tc	Karaichara	karaichara-union	4442	2026-05-10 15:56:06.316	2026-05-10 16:53:04.995	t	কড়ইচড়া	Karaichara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg852023kw88ofen47hse	cmozwcxwc00bw408ot5uss2tc	Gunaritala	gunaritala-union	4443	2026-05-10 15:56:06.326	2026-05-10 16:53:05	t	গুনারীতলা	Gunaritala	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg85c023lw88owcbryz3u	cmozwcxwc00bw408ot5uss2tc	Balijuri	balijuri-union-1	4444	2026-05-10 15:56:06.336	2026-05-10 16:53:05.007	t	বালিজুড়ী	Balijuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg85m023mw88o5hnjzd42	cmozwcxwc00bw408ot5uss2tc	Jorekhali	jorekhali-union	4445	2026-05-10 15:56:06.346	2026-05-10 16:53:05.014	t	জোড়খালী	Jorekhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg85v023nw88orcqlenj6	cmozwcxwc00bw408ot5uss2tc	Adarvita	adarvita-union	4446	2026-05-10 15:56:06.355	2026-05-10 16:53:05.02	t	আদারভিটা	Adarvita	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg865023ow88oo2kab567	cmozwcxwc00bw408ot5uss2tc	Sidhuli	sidhuli-union	4447	2026-05-10 15:56:06.365	2026-05-10 16:53:05.027	t	সিধুলী	Sidhuli	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfn1a000zw88ojm0kmzlj	cmozwcxly00aj408o22d0mujs	Khokshabari	khokshabari-union	1006	2026-05-10 15:55:38.974	2026-05-10 16:52:46.738	t	খোকশাবাড়ী	Khokshabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfncl0020w88otjeutbk2	cmozwcxhb009x408o6vs6dkx9	Bhangura	bhangura-union	1050	2026-05-10 15:55:39.381	2026-05-10 16:52:46.986	t	ভাঙ্গুড়া	Bhangura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfno70032w88o13r5vh0v	cmozwcxie00a2408ovyrhxtwe	Dhopadaha	dhopadaha-union	1093	2026-05-10 15:55:39.799	2026-05-10 16:52:47.236	t	ধোপাদহ	Dhopadaha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo0l0045w88ofoazgfm2	cmozwcxav0092408owxek8btf	Zorgacha	zorgacha-union	1166	2026-05-10 15:55:40.246	2026-05-10 16:52:47.487	t	জোড়গাছা	Zorgacha	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfo70004rw88o8sqitxos	cmozwcxai0090408o0tdcqyzx	Shahbondegi	shahbondegi-union	1198	2026-05-10 15:55:40.476	2026-05-10 16:52:47.68	t	শাহবন্দেগী	Shahbondegi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfobs0058w88od7inqcfv	cmozwcxk300aa408o5gqyvu0m	Hujuripara	hujuripara-union	1215	2026-05-10 15:55:40.648	2026-05-10 16:52:47.835	t	হুজুরী পাড়া	Hujuripara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfomu006bw88o1iy99gke	cmozwcxjo00a8408ollakdh5a	Basudebpur	basudebpur-union	1260	2026-05-10 15:55:41.046	2026-05-10 16:52:48.106	t	বাসুদেবপুর	Basudebpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfove0074w88o4c3anlmg	cmozwcxgg009t408ow27e6tvj	Biprobelghoria	biprobelghoria-union	1289	2026-05-10 15:55:41.354	2026-05-10 16:52:48.32	t	বিপ্রবেলঘড়িয়া	Biprobelghoria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfoxw007dw88op8kzzklt	cmozwcxgn009u408o7nw8zkws	Dahia	dahia-union	1298	2026-05-10 15:55:41.444	2026-05-10 16:52:48.379	t	ডাহিয়া	Dahia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp0f007mw88oumsn86sr	cmozwcxgn009u408o7nw8zkws	Chhatardighi	chhatardighi-union	1307	2026-05-10 15:55:41.535	2026-05-10 16:52:48.439	t	ছাতারদিঘী	Chhatardighi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfp94008gw88otj0rqxjm	cmozwcxc20098408okl4e6zzn	Rukindipur	rukindipur-union	1337	2026-05-10 15:55:41.848	2026-05-10 16:52:48.64	t	রুকিন্দীপুর	Rukindipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpk5009jw88oc1ya13aj	cmozwcxei009k408o8sts6w1w	Nazipur	nazipur-union	1439	2026-05-10 15:55:42.245	2026-05-10 16:52:48.901	t	নজিপুর	Nazipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpkg009kw88oqttpljtt	cmozwcxei009k408o8sts6w1w	Ghasnagar	ghasnagar-union	1440	2026-05-10 15:55:42.256	2026-05-10 16:52:48.908	t	ঘষনগর	Ghasnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpv800anw88on6pdxbku	cmozwcxd0009d408osa00v73d	Kalikapur	kalikapur-union-1	1479	2026-05-10 15:55:42.644	2026-05-10 16:52:49.173	t	কালিকাপুর	Kalikapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg80m0233w88os9pyyv9q	cmozwcxvw00bu408oeltkh90m	Islampur	islampur-union-3	4418	2026-05-10 15:56:06.166	2026-05-10 16:53:04.897	t	ইসলামপুর	Islampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg80w0234w88oz5az7fon	cmozwcxvw00bu408oeltkh90m	Partharshi	partharshi-union	4419	2026-05-10 15:56:06.176	2026-05-10 16:53:04.903	t	পাথশী	Partharshi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq9p00bxw88ohqnfsc91	cmozwcx13007n408ow6aqaayh	Chaluahati	chaluahati-union	1525	2026-05-10 15:55:43.165	2026-05-10 16:52:49.481	t	চালুয়াহাটি	Chaluahati	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqj700ctw88o6byfubq4	cmozwcx1b007o408ov3gyf6k8	Kayba	kayba-union	1603	2026-05-10 15:55:43.507	2026-05-10 16:52:49.697	t	কায়বা	Kayba	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfque00dvw88ofz0vvuo4	cmozwcx8h008p408oberwvm8b	Burigoalini	burigoalini-union	1652	2026-05-10 15:55:43.91	2026-05-10 16:52:49.947	t	বুড়িগোয়ালিনী	Burigoalini	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqun00dww88oouu70rdh	cmozwcx8h008p408oberwvm8b	Bhurulia	bhurulia-union	1653	2026-05-10 15:55:43.919	2026-05-10 16:52:49.954	t	ভুরুলিয়া	Bhurulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfqxk00e5w88o07sxd6fl	cmozwcx8n008q408ocnynb1n8	Tentulia	tentulia-union	1662	2026-05-10 15:55:44.024	2026-05-10 16:52:50.013	t	তেতুলিয়া	Tentulia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfr5y00ezw88ozdxkzacy	cmozwcx6c008e408ogow87i2v	Kazipur	kazipur-union	1692	2026-05-10 15:55:44.326	2026-05-10 16:52:50.205	t	কাজিপুর	Kazipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrfr00fyw88o5tcp8yr9	cmozwcx6w008h408oo8tga1s8	Babrahasla	babrahasla-union	1727	2026-05-10 15:55:44.679	2026-05-10 16:52:50.43	t	বাবরা-হাচলা	Babrahasla	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrgx00g2w88ofu7jmbhp	cmozwcx6w008h408oo8tga1s8	Hamidpur	hamidpur-union	1731	2026-05-10 15:55:44.721	2026-05-10 16:52:50.457	t	হামিদপুর	Hamidpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrru00h5w88o51g2qmxm	cmozwcwzi007g408o9wieeikm	Banka	banka-union	1770	2026-05-10 15:55:45.114	2026-05-10 16:52:50.711	t	বাঁকা	Banka	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrvn00hjw88oyh4ha3hf	cmozwcx540088408oklsr3z9e	Abdulpur	abdulpur-union	1784	2026-05-10 15:55:45.251	2026-05-10 16:52:50.799	t	আব্দালপুর	Abdulpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs2t00i8w88oa9z6d1wy	cmozwcx5c0089408oxmmj21o9	Bahalbaria	bahalbaria-union	1809	2026-05-10 15:55:45.509	2026-05-10 16:52:50.954	t	বহলবাড়ীয়া	Bahalbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfs6600ikw88oej6lujyb	cmozwcx4j0085408octg40c7w	Daulatpur	daulatpur-union	1821	2026-05-10 15:55:45.63	2026-05-10 16:52:51.041	t	দৌলতপুর	Daulatpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsdy00jbw88o9hcmpzgp	cmozwcx65008d408ob8uarr42	Goyespur	goyespur-union	1848	2026-05-10 15:55:45.91	2026-05-10 16:52:51.264	t	গয়েশপুর	Goyespur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsll00k2w88o5i8h89fj	cmozwcx5q008b408ow83o3cpt	Mohammadpur	mohammadpur-union-1	1875	2026-05-10 15:55:46.185	2026-05-10 16:52:51.446	t	মহম্মদপুর	Mohammadpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfsoz00kew88o5qis5kjw	cmozwcx3a007y408oubu2mrlk	Rudaghora	rudaghora-union	1912	2026-05-10 15:55:46.307	2026-05-10 16:52:51.525	t	রুদাঘরা	Rudaghora	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfssd00kqw88o8nklft3o	cmozwcx3h007z408ouiolmz1w	Moheswaripur	moheswaripur-union	1940	2026-05-10 15:55:46.429	2026-05-10 16:52:51.604	t	মহেশ্বরীপুর	Moheswaripur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfszw00lhw88o1qzvkk75	cmozwcwy00078408ooorl1n5e	Gaola	gaola-union	1967	2026-05-10 15:55:46.7	2026-05-10 16:52:51.785	t	গাওলা	Gaola	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftag00mkw88oitcysxog	cmozwcx1p007q408odnkojaod	Maharazpur	maharazpur-union	2026	2026-05-10 15:55:47.08	2026-05-10 16:52:52.052	t	মহারাজপুর	Maharazpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftld00nmw88orm26xdpd	cmozwcx1z007r408oo64odo1n	Trilochanpur	trilochanpur-union	2064	2026-05-10 15:55:47.473	2026-05-10 16:52:52.364	t	ত্রিলোচনপুর	Trilochanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftr100o6w88oz4uyjny7	cmozwcxsf00bd408o8xnyovpk	Shurjamoni	shurjamoni-union	2128	2026-05-10 15:55:47.677	2026-05-10 16:52:52.496	t	সূর্য্যমনি	Shurjamoni	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftwq00opw88oamxlpwh6	cmozwcxsu00bf408otpg10t2n	Labukhali	labukhali-union	2147	2026-05-10 15:55:47.882	2026-05-10 16:52:52.628	t	লেবুখালী	Labukhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftyf00ovw88or5pvz816	cmozwcxsm00be408o4rl6ghwa	Betagi Shankipur	betagi-shankipur-union	2153	2026-05-10 15:55:47.943	2026-05-10 16:52:52.679	t	বেতাগী সানকিপুর	Betagi Shankipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfu7g00prw88ou19edbcr	cmozwcxt100bg408o0r8e3yp9	Kalagachhia	kalagachhia-union	2185	2026-05-10 15:55:48.268	2026-05-10 16:52:52.937	t	কলাগাছিয়া	Kalagachhia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuco00qbw88omowdx3ka	cmozwcxuu00bp408ooq4fkkek	Nazirpur Sadar	nazirpur-sadar-union	2205	2026-05-10 15:55:48.456	2026-05-10 16:52:53.068	t	নাজিরপুর সদর	Nazirpur Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuh700qsw88okwc9sk23	cmozwcxuo00bo408oymr0g0bx	Tikikata	tikikata-union	2225	2026-05-10 15:55:48.619	2026-05-10 16:52:53.18	t	টিকিকাটা	Tikikata	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfuj300qzw88ok75awypg	cmozwcxuo00bo408oymr0g0bx	Haltagulishakhali	haltagulishakhali-union	2232	2026-05-10 15:55:48.687	2026-05-10 16:52:53.228	t	হলতাগুলিশাখালী	Haltagulishakhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfura00rtw88ozvm2i8o1	cmozwcxqu00b6408oko63iffp	Paschim Char Umed	paschim-char-umed-union	2391	2026-05-10 15:55:48.982	2026-05-10 16:52:53.418	t	পশ্চিম চর উমেদ	Paschim Char Umed	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv1z00sww88o881t74wk	cmozwcykt00ff408oz13ijdd8	Umorpur	umorpur-union	2437	2026-05-10 15:55:49.367	2026-05-10 16:52:53.695	t	উমরপুর	Umorpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfv4h00t5w88onp4gi82y	cmozwcyj200f5408o06qc3l84	West Gouripur	west-gouripur-union	2446	2026-05-10 15:55:49.457	2026-05-10 16:52:53.773	t	পশ্চিম গৌরীপুর	West Gouripur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvcv00tyw88o0gehsnj5	cmozwcyjz00fa408o6mhaumom	Fenchuganj	fenchuganj-union	2475	2026-05-10 15:55:49.759	2026-05-10 16:52:53.981	t	ফেঞ্চুগঞ্জ	Fenchuganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvmd00uyw88ozxlq6f8p	cmozwcyl000fg408otzq62etd	Tultikor	tultikor-union	2517	2026-05-10 15:55:50.101	2026-05-10 16:52:54.225	t	টুলটিকর	Tultikor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvmn00uzw88o6h6sh0e8	cmozwcyl000fg408otzq62etd	Tukerbazar	tukerbazar-union	2518	2026-05-10 15:55:50.111	2026-05-10 16:52:54.232	t	টুকেরবাজার	Tukerbazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvx200w1w88on07y1hmj	cmozwcygj00er408ogkx5dat9	Uttorbhag	uttorbhag-union	2586	2026-05-10 15:55:50.486	2026-05-10 16:52:54.482	t	উত্তরভাগ	Uttorbhag	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw6f00wyw88oahvig2j3	cmozwcyfc00ek408o40you9d6	Kaliarbhanga	kaliarbhanga-union	2619	2026-05-10 15:55:50.823	2026-05-10 16:52:54.719	t	কালিয়ারভাংগা	Kaliarbhanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq7l00bqw88o6d1edp2e	cmozwcx13007n408ow6aqaayh	Maswimnagar	maswimnagar-union	1518	2026-05-10 15:55:43.089	2026-05-10 16:52:49.426	t	মশ্মিমনগর	Maswimnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwkl00ycw88ovmwkkuyu	cmozwcyet00eh408ocx2nzwim	Rajiura	rajiura-union	2669	2026-05-10 15:55:51.333	2026-05-10 16:52:55.119	t	রাজিউড়া	Rajiura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwsq00z5w88oe8gq6j08	cmozwcyh400eu408o1h19r7js	Gobindganj-Syedergaon	gobindganj-syedergaon-union	2711	2026-05-10 15:55:51.626	2026-05-10 16:52:55.306	t	গোবিন্দগঞ্জ-সৈদেরগাঁও	Gobindganj-Syedergaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwt900z7w88or119getj	cmozwcyh400eu408o1h19r7js	Khurma North	khurma-north-union	2713	2026-05-10 15:55:51.645	2026-05-10 16:52:55.319	t	খুরমা উত্তর	Khurma North	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwvz00zhw88oq6fh4lvj	cmozwcyht00ey408oda7s6w2k	Chilaura Holdipur	chilaura-holdipur-union	2723	2026-05-10 15:55:51.743	2026-05-10 16:52:55.386	t	চিলাউড়া হলদিপুর	Chilaura Holdipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfx360108w88oz7kb5p8d	cmozwcyhh00ew408o7g6pow05	Dharmapasha Sadar	dharmapasha-sadar-union	2750	2026-05-10 15:55:52.002	2026-05-10 16:52:55.561	t	ধর্মপাশা সদর	Dharmapasha Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxdf0119w88ok2jkyy2z	cmozwcwrr006e408os1tiwl4c	Nuralapur	nuralapur-union	2799	2026-05-10 15:55:52.371	2026-05-10 16:52:55.789	t	নূরালাপুর	Nuralapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxdo011aw88owfj3751i	cmozwcwrr006e408os1tiwl4c	Mahishasura	mahishasura-union	2800	2026-05-10 15:55:52.38	2026-05-10 16:52:55.795	t	মহিষাশুড়া	Mahishasura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxh1011nw88oghh4ncco	cmozwcws4006g408orhfhyx1h	Amirganj	amirganj-union	2813	2026-05-10 15:55:52.501	2026-05-10 16:52:55.877	t	আমিরগঞ্জ	Amirganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxo2012ew88o1trig9oe	cmozwcwse006h408oeflpt6d1	Ayubpur	ayubpur-union	2840	2026-05-10 15:55:52.754	2026-05-10 16:52:56.046	t	আয়ুবপুর	Ayubpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxpb012jw88oao0yc1cz	cmozwcwji0055408oskyiwncv	Jangalia	jangalia-union	2845	2026-05-10 15:55:52.799	2026-05-10 16:52:56.079	t	জাঙ্গালিয়া	Jangalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfxzg013iw88obt48tu7t	cmozwcwjv0057408oet213wos	Maona	maona-union	2880	2026-05-10 15:55:53.164	2026-05-10 16:52:56.328	t	মাওনা	Maona	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy3q013yw88ow4ic0q0v	cmozwcwuc006q408ohnhi9bwl	Kedarpur	kedarpur-union	2896	2026-05-10 15:55:53.318	2026-05-10 16:52:56.446	t	কেদারপুর	Kedarpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfy9z014lw88ocnmrr3mx	cmozwcwuq006s408odew5xcj1	Barogopalpur	barogopalpur-union	2919	2026-05-10 15:55:53.543	2026-05-10 16:52:56.599	t	বড়গোপালপুর	Barogopalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyfy0156w88osxzpbi4h	cmozwcwtn006n408o4i674wgx	South Tarabunia	south-tarabunia-union	2940	2026-05-10 15:55:53.758	2026-05-10 16:52:56.732	t	দক্ষিন তারাবুনিয়া	South Tarabunia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfykk015nw88okapc58ep	cmozwcwqf0067408o019ziqr8	Kalapaharia	kalapaharia-union	2957	2026-05-10 15:55:53.924	2026-05-10 16:52:56.856	t	কালাপাহাড়িয়া	Kalapaharia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfyvd016qw88o09moqawj	cmozwcwv9006v408ohkxcnvaf	Delduar	delduar-union	3002	2026-05-10 15:55:54.313	2026-05-10 16:52:57.123	t	দেলদুয়ার	Delduar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz57017qw88oihb1lpfn	cmozwcwwc0071408o1bgccsuy	Bahuria	bahuria-union	3038	2026-05-10 15:55:54.667	2026-05-10 16:52:57.377	t	বহুরিয়া	Bahuria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfz60017tw88ocb5nywdm	cmozwcwwc0071408o1bgccsuy	Tarafpur	tarafpur-union	3041	2026-05-10 15:55:54.696	2026-05-10 16:52:57.399	t	তরফপুর	Tarafpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzga018vw88o9d7e3r53	cmozwcwvz006z408o9kvczxku	Narandia	narandia-union	3079	2026-05-10 15:55:55.066	2026-05-10 16:52:57.67	t	নারান্দিয়া	Narandia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzgl018ww88o6yf56oqt	cmozwcwvz006z408o9kvczxku	Shahadebpur	shahadebpur-union	3080	2026-05-10 15:55:55.077	2026-05-10 16:52:57.677	t	সহদেবপুর	Shahadebpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzr7019zw88onhqy5170	cmozwcwla005e408opz9mju4e	Kalika Prashad	kalika-prashad-union	3119	2026-05-10 15:55:55.459	2026-05-10 16:52:57.951	t	কালিকা প্রসাদ	Kalika Prashad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfzwq01ajw88ob1s3cq0t	cmozwcwmx005n408og7ts9g6t	Patuavabga	patuavabga-union	3139	2026-05-10 15:55:55.658	2026-05-10 16:52:58.093	t	পটুয়াভাঙ্গা	Patuavabga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg01w01b2w88o1po8atf5	cmozwcwm7005j408oyox6ex8s	Maria	maria-union-1	3158	2026-05-10 15:55:55.844	2026-05-10 16:52:58.231	t	মারিয়া	Maria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg02701b3w88oemuv3lbm	cmozwcwm7005j408oyox6ex8s	Chowddoshata	chowddoshata-union	3159	2026-05-10 15:55:55.855	2026-05-10 16:52:58.237	t	চৌদ্দশত	Chowddoshata	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0ck01c5w88o40sk1f4p	cmozwcwoi005w408obhoh7xmb	Lacharagonj	lacharagonj-union	3215	2026-05-10 15:55:56.228	2026-05-10 16:52:58.509	t	লেছড়াগঞ্জ	Lacharagonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0fj01cfw88ocicsu9ln	cmozwcwou005y408o46q3ue0n	Saturia	saturia-union	3225	2026-05-10 15:55:56.335	2026-05-10 16:52:58.581	t	সাটুরিয়া	Saturia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0nk01d9w88oxo6bqzae	cmozwcwgl004q408o0mdrfb9l	Kushura	kushura-union	3288	2026-05-10 15:55:56.624	2026-05-10 16:52:58.776	t	কুশুরা	Kushura	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0xw01ecw88ocii9eqdn	cmozwcwgr004r408od4cx7vnr	Raipara	raipara-union	3327	2026-05-10 15:55:56.996	2026-05-10 16:52:59.027	t	রাইপাড়া	Raipara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg17501faw88o4anhq4zs	cmozwcwpw0064408oomorbsj3	Baluchar	baluchar-union	3361	2026-05-10 15:55:57.329	2026-05-10 16:52:59.243	t	বালুচর	Baluchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg18h01ffw88of90nm8qt	cmozwcwpw0064408oomorbsj3	Malkhanagar	malkhanagar-union	3366	2026-05-10 15:55:57.377	2026-05-10 16:52:59.275	t	মালখানগর	Malkhanagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1jm01ghw88outiesaue	cmozwcwsn006i408os20ys3zw	Baliakandi	baliakandi-union	3432	2026-05-10 15:55:57.778	2026-05-10 16:52:59.521	t	বালিয়াকান্দি	Baliakandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1mc01gqw88ox3n2hmzt	cmozwcwt1006k408occwoej2r	Shawrail	shawrail-union	3441	2026-05-10 15:55:57.876	2026-05-10 16:52:59.578	t	সাওরাইল	Shawrail	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1va01hjw88ogbg40pnl	cmozwcwnz005t408o375riw7g	Bahertala South	bahertala-south-union	3470	2026-05-10 15:55:58.198	2026-05-10 16:52:59.764	t	বহেরাতলা দক্ষিণ	Bahertala South	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg1vl01hkw88oj160585e	cmozwcwnz005t408o375riw7g	Baheratala North	baheratala-north-union	3471	2026-05-10 15:55:58.209	2026-05-10 16:52:59.771	t	বহেরাতলা উত্তর	Baheratala North	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfwie00y4w88obpqspd4f	cmozwcyen00eg408od66bk894	Shatiajuri	shatiajuri-union	2661	2026-05-10 15:55:51.254	2026-05-10 16:52:55.064	t	সাটিয়াজুরী	Shatiajuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2ko01jow88oq5p46uhv	cmozwcwke0059408oehx8kn8q	Pinjuri	pinjuri-union	3548	2026-05-10 15:55:59.112	2026-05-10 16:53:00.288	t	পিঞ্জুরী	Pinjuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2o601k0w88oegdt6tey	cmozwcwkl005a408oavtk0k3g	Banshbaria	banshbaria-union	3560	2026-05-10 15:55:59.238	2026-05-10 16:53:00.367	t	বাশঁবাড়িয়া	Banshbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2vp01krw88oqp51n1sn	cmozwcwht004x408ov978wc6m	Chatul	chatul-union	3588	2026-05-10 15:55:59.51	2026-05-10 16:53:00.571	t	চতুল	Chatul	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2wu01kvw88o4l4jzug0	cmozwcwht004x408ov978wc6m	Parameshwardi	parameshwardi-union	3592	2026-05-10 15:55:59.55	2026-05-10 16:53:00.6	t	পরমেশ্বরদী	Parameshwardi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg36n01luw88oxra20bqm	cmozwcwie004z408o5m7cfj5c	Madhukhali	madhukhali-union	3631	2026-05-10 15:55:59.903	2026-05-10 16:53:00.839	t	মধুখালী	Madhukhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3as01m9w88ojrfjkqk9	cmozwcwiy0052408ognfm7rb7	Ramkantapur	ramkantapur-union-1	3646	2026-05-10 15:56:00.052	2026-05-10 16:53:00.933	t	রামকান্তপুর	Ramkantapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3gu01mww88o0hp9hza8	cmozwcyan00dw408o1wyo02oa	Moidandighi	moidandighi-union	3669	2026-05-10 15:56:00.27	2026-05-10 16:53:01.096	t	ময়দান দীঘি	Moidandighi	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3lb01nbw88ohjlmr5eo	cmozwcy2p00cs408o3axv0vza	Mohammadpur	mohammadpur-union-2	3707	2026-05-10 15:56:00.431	2026-05-10 16:53:01.197	t	মোহাম্মদপুর	Mohammadpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3s901nzw88opoh5f4bk	cmozwcy4l00d3408ot4der4hh	Hamidpur	hamidpur-union-1	3731	2026-05-10 15:56:00.681	2026-05-10 16:53:01.35	t	হামিদপুর	Hamidpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg42x01p2w88o7z1o9wi6	cmozwcy2v00ct408ospodesr3	Bhandra	bhandra-union	3776	2026-05-10 15:56:01.065	2026-05-10 16:53:01.605	t	ভান্ডারা	Bhandra	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg49q01pqw88ogodv8tlk	cmozwcy8j00dn408oqcyqccdh	Mohendranagar	mohendranagar-union	3800	2026-05-10 15:56:01.31	2026-05-10 16:53:01.76	t	মহেন্দ্রনগর	Mohendranagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4dv01q5w88obon6bm9y	cmozwcy7y00dl408ot3kb5afz	Sindurna	sindurna-union	3815	2026-05-10 15:56:01.459	2026-05-10 16:53:01.856	t	সিন্দুর্ণা	Sindurna	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4nn01r3w88oa24ec8jt	cmozwcy9000dp408ogs5j27h4	Paschim Chhatnay	paschim-chhatnay-union	3854	2026-05-10 15:56:01.811	2026-05-10 16:53:02.091	t	পশ্চিম ছাতনাই	Paschim Chhatnay	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4op01r7w88opvsxjvt4	cmozwcy9000dp408ogs5j27h4	Gayabari	gayabari-union	3858	2026-05-10 15:56:01.849	2026-05-10 16:53:02.116	t	গয়াবাড়ী	Gayabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4p901r9w88osu72lqlj	cmozwcy9000dp408ogs5j27h4	Khalisha Chapani	khalisha-chapani-union	3860	2026-05-10 15:56:01.869	2026-05-10 16:53:02.128	t	খালিশা চাপানী	Khalisha Chapani	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg4zu01s9w88omnnben17	cmozwcy5j00d8408o8qosz68l	Idilpur	idilpur-union	3905	2026-05-10 15:56:02.25	2026-05-10 16:53:02.366	t	ইদিলপুর	Idilpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg52t01sjw88ochejszj4	cmozwcy4z00d5408osamppnlr	Ramchandrapur	ramchandrapur-union	3915	2026-05-10 15:56:02.357	2026-05-10 16:53:02.431	t	রামচন্দ্রপুর	Ramchandrapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5at01tcw88oysugs8a4	cmozwcy5500d6408o58onciv1	Shakhahar	shakhahar-union	3944	2026-05-10 15:56:02.645	2026-05-10 16:53:02.623	t	শাখাহার	Shakhahar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5ii01u4w88oj6zb0xps	cmozwcy5w00da408oxde9xr83	Kapasia	kapasia-union-1	3972	2026-05-10 15:56:02.922	2026-05-10 16:53:02.805	t	কাপাসিয়া	Kapasia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5lo01ufw88ofmgax3s8	cmozwcydx00ec408olmpdm0zf	Jamalpur	jamalpur-union-3	3990	2026-05-10 15:56:03.036	2026-05-10 16:53:02.881	t	জামালপুর	Jamalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5t001v4w88o7tdhzm9r	cmozwcydc00e9408oj1cjz7my	Dangipara	dangipara-union	4023	2026-05-10 15:56:03.3	2026-05-10 16:53:03.039	t	ডাঙ্গীপাড়া	Dangipara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5wy01viw88ocbfbuai2	cmozwcycp00e6408ovp874z6d	Porshuram	porshuram-union	4037	2026-05-10 15:56:03.442	2026-05-10 16:53:03.132	t	পরশুরাম	Porshuram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg5y001vmw88or6bgwexz	cmozwcycp00e6408ovp874z6d	Sadwapuskoroni	sadwapuskoroni-union	4041	2026-05-10 15:56:03.48	2026-05-10 16:53:03.158	t	সদ্যপুস্করনী	Sadwapuskoroni	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg68e01wlw88oss2re9t2	cmozwcyby00e2408og8iuvobw	Tepamodhupur	tepamodhupur-union	4106	2026-05-10 15:56:03.854	2026-05-10 16:53:03.381	t	টেপামধুপুর	Tepamodhupur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6f801x8w88oyfl0lykx	cmozwcy6n00de408oim2h0f7l	Bollobherkhas	bollobherkhas-union	4138	2026-05-10 15:56:04.1	2026-05-10 16:53:03.534	t	বল্লভেরখাস	Bollobherkhas	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6j701xnw88okr33sygt	cmozwcy6u00df408onhofo16u	Bhangamor	bhangamor-union	4153	2026-05-10 15:56:04.244	2026-05-10 16:53:03.634	t	ভাঙ্গামোড়	Bhangamor	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6kl01xsw88oa2f8zqza	cmozwcy7100dg408ohilocqc2	Gharialdanga	gharialdanga-union	4158	2026-05-10 15:56:04.293	2026-05-10 16:53:03.666	t	ঘড়িয়ালডাঙ্গা	Gharialdanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg6tx01ypw88o083dexkx	cmozwcy2600cp408owudjab3v	Chor Mochoriya	chor-mochoriya-union	4199	2026-05-10 15:56:04.629	2026-05-10 16:53:03.875	t	চর মোচারিয়া	Chor Mochoriya	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg71w01ziw88oh4ozkkgj	cmozwcxxc00c1408obvzm6eke	Rangamatia	rangamatia-union	4247	2026-05-10 15:56:04.916	2026-05-10 16:53:04.062	t	রাঙ্গামাটিয়া	Rangamatia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg74j01zsw88oc5u8fbvg	cmozwcxzk00cb408ontv4r3zp	Kanihari	kanihari-union	4257	2026-05-10 15:56:05.011	2026-05-10 16:53:04.123	t	কানিহারী	Kanihari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg79x020cw88oxydk8hlg	cmozwcxys00c8408ooyjlk05f	Austadhar	austadhar-union	4287	2026-05-10 15:56:05.205	2026-05-10 16:53:04.251	t	অষ্টধার	Austadhar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7f3020vw88oc7dysw2f	cmozwcxx600c0408ozewfhwlf	Baghber	baghber-union	4306	2026-05-10 15:56:05.391	2026-05-10 16:53:04.389	t	বাঘবেড়	Baghber	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7gm0211w88o5a8jbgv8	cmozwcxza00ca408o4yty6a02	Tarakanda	tarakanda-union	4322	2026-05-10 15:56:05.446	2026-05-10 16:53:04.425	t	তারাকান্দা	Tarakanda	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7py021zw88od93036za	cmozwcxxr00c3408ol13hhxla	Gafargaon	gafargaon-union	4356	2026-05-10 15:56:05.782	2026-05-10 16:53:04.643	t	গফরগাঁও	Gafargaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg2cb01j7w88omq1jznji	cmozwcwk80058408okkhdz8pw	Maheshpur	maheshpur-union-1	3531	2026-05-10 15:55:58.811	2026-05-10 16:53:00.163	t	মহেশপুর	Maheshpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg80a0232w88o096014to	cmozwcxvw00bu408oeltkh90m	Noarpara	noarpara-union	4417	2026-05-10 15:56:06.154	2026-05-10 16:53:04.891	t	নোয়ারপাড়া	Noarpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gybk0000dk8o70ma9zu9	cmozwcw75003d408o33qfovr4	Subil	subil-union	1	2026-05-10 16:52:39.488	2026-05-10 16:52:39.488	t	সুবিল	Subil	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyc10001dk8oep9p2nw2	cmozwcw75003d408o33qfovr4	North Gunaighor	north-gunaighor-union	2	2026-05-10 16:52:39.505	2026-05-10 16:52:39.505	t	উত্তর গুনাইঘর	North Gunaighor	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gycf0002dk8ofbdsnyql	cmozwcw75003d408o33qfovr4	South Gunaighor	south-gunaighor-union	3	2026-05-10 16:52:39.519	2026-05-10 16:52:39.519	t	দক্ষিণ গুনাইঘর	South Gunaighor	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gycv0003dk8o5bw3gqad	cmozwcw75003d408o33qfovr4	Boroshalghor	boroshalghor-union	4	2026-05-10 16:52:39.535	2026-05-10 16:52:39.535	t	বড়শালঘর	Boroshalghor	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyd90004dk8okuvld0jk	cmozwcw75003d408o33qfovr4	Rajameher	rajameher-union	5	2026-05-10 16:52:39.549	2026-05-10 16:52:39.549	t	রাজামেহার	Rajameher	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gydp0005dk8o71l6gkzh	cmozwcw75003d408o33qfovr4	Yousufpur	yousufpur-union-1	6	2026-05-10 16:52:39.565	2026-05-10 16:52:39.565	t	ইউসুফপুর	Yousufpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gye90006dk8o90sr6qgu	cmozwcw75003d408o33qfovr4	Rasulpur	rasulpur-union-4	7	2026-05-10 16:52:39.585	2026-05-10 16:52:39.585	t	রসুলপুর	Rasulpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyel0007dk8owvh4xtcb	cmozwcw75003d408o33qfovr4	Fatehabad	fatehabad-union	8	2026-05-10 16:52:39.597	2026-05-10 16:52:39.597	t	ফতেহাবাদ	Fatehabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyev0008dk8o8wdtd9gw	cmozwcw75003d408o33qfovr4	Elahabad	elahabad-union	9	2026-05-10 16:52:39.607	2026-05-10 16:52:39.607	t	এলাহাবাদ	Elahabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyf70009dk8oe062erif	cmozwcw75003d408o33qfovr4	Jafargonj	jafargonj-union	10	2026-05-10 16:52:39.619	2026-05-10 16:52:39.619	t	জাফরগঞ্জ	Jafargonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyfi000adk8ob00b0es3	cmozwcw75003d408o33qfovr4	Dhampti	dhampti-union	11	2026-05-10 16:52:39.63	2026-05-10 16:52:39.63	t	ধামতী	Dhampti	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyfu000bdk8ojvui9kpu	cmozwcw75003d408o33qfovr4	Mohanpur	mohanpur-union	12	2026-05-10 16:52:39.642	2026-05-10 16:52:39.642	t	মোহনপুর	Mohanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyg4000cdk8o2dugl556	cmozwcw75003d408o33qfovr4	Vani	vani-union	13	2026-05-10 16:52:39.652	2026-05-10 16:52:39.652	t	ভানী	Vani	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyge000ddk8orsm2wydv	cmozwcw75003d408o33qfovr4	Barkamta	barkamta-union	14	2026-05-10 16:52:39.662	2026-05-10 16:52:39.662	t	বরকামতা	Barkamta	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gygq000edk8ov72i5qsn	cmozwcw75003d408o33qfovr4	Sultanpur	sultanpur-union-2	15	2026-05-10 16:52:39.675	2026-05-10 16:52:39.675	t	সুলতানপুর	Sultanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyh2000fdk8o6c71ohzf	cmozwcw610037408opisugy0z	Aganagar	aganagar-union-2	16	2026-05-10 16:52:39.686	2026-05-10 16:52:39.686	t	আগানগর	Aganagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnov0034w88os8v2d5k5	cmozwcxie00a2408ovyrhxtwe	Kashinathpur	kashinathpur-union	1095	2026-05-10 15:55:39.823	2026-05-10 16:52:47.249	t	কাশিনাথপুর	Kashinathpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfocn005bw88ojplhgfrb	cmozwcxk300aa408o5gqyvu0m	Horogram	horogram-union	1218	2026-05-10 15:55:40.68	2026-05-10 16:52:47.855	t	হড়গ্রাম	Horogram	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfpab008kw88oow8i73ba	cmozwcxc20098408okl4e6zzn	Gopinathpur	gopinathpur-union	1341	2026-05-10 15:55:41.891	2026-05-10 16:52:48.667	t	গোপীনাথপুর	Gopinathpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfq6400blw88ovv291ya1	cmozwcx13007n408ow6aqaayh	Nehalpur	nehalpur-union	1513	2026-05-10 15:55:43.036	2026-05-10 16:52:49.395	t	নেহালপুর	Nehalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfrin00g8w88o90dgvozz	cmozwcx6w008h408oo8tga1s8	Boronaleliasabad	boronaleliasabad-union	1737	2026-05-10 15:55:44.783	2026-05-10 16:52:50.499	t	বড়নাল-ইলিয়াছাবাদ	Boronaleliasabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyft2c00lqw88oe6bidm9j	cmozwcwyj007b408oaoabpqif	Perikhali	perikhali-union	1980	2026-05-10 15:55:46.788	2026-05-10 16:52:51.849	t	পেড়িখালী	Perikhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyftjv00nhw88o2bipiqsa	cmozwcx1z007r408oo64odo1n	Sundarpurdurgapur	sundarpurdurgapur-union	2059	2026-05-10 15:55:47.419	2026-05-10 16:52:52.328	t	সুন্দরপুর-দূর্গাপুর	Sundarpurdurgapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfus300rww88oeh71tp7f	cmozwcxmp00am408o5dlqrv95	Gulishakhali	gulishakhali-union	2394	2026-05-10 15:55:49.011	2026-05-10 16:52:53.437	t	গুলিশাখালী	Gulishakhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfvj800umw88ojejhr5d3	cmozwcyko00fe408o8vak29ng	Lakshiprashad Purbo	lakshiprashad-purbo-union	2505	2026-05-10 15:55:49.988	2026-05-10 16:52:54.144	t	লক্ষীপ্রাসাদ পূর্ব	Lakshiprashad Purbo	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw7s00x3w88oiomr7li5	cmozwcyea00ee408o6rb6rcii	Bahubal Sadar	bahubal-sadar-union	2624	2026-05-10 15:55:50.872	2026-05-10 16:52:54.763	t	বাহুবল সদর	Bahubal Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfw9h00x9w88o5o2vgzut	cmozwcye400ed408o5zw3ugas	Ajmiriganj Sadar	ajmiriganj-sadar-union	2630	2026-05-10 15:55:50.933	2026-05-10 16:52:54.816	t	আজমিরীগঞ্জ সদর	Ajmiriganj Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfziy0195w88ouedk4nyy	cmozwcwvz006z408o9kvczxku	Gohaliabari	gohaliabari-union	3089	2026-05-10 15:55:55.162	2026-05-10 16:52:57.738	t	গোহালিয়াবাড়ী	Gohaliabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg07k01bnw88ojnt2jrxu	cmozwcwkx005c408oxuzbfz5w	Khyerpur-Abdullahpur	khyerpur-abdullahpur-union	3190	2026-05-10 15:55:56.048	2026-05-10 16:52:58.391	t	খয়েরপুর-আব্দুল্লাপুর	Khyerpur-Abdullahpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg0ns01daw88obmpt794u	cmozwcwgl004q408o0mdrfb9l	Gangutia	gangutia-union	3289	2026-05-10 15:55:56.633	2026-05-10 16:52:58.783	t	গাংগুটিয়া	Gangutia	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg18s01fgw88oh5ggr8g2	cmozwcwpw0064408oomorbsj3	Madhypara	madhypara-union	3367	2026-05-10 15:55:57.388	2026-05-10 16:52:59.281	t	মধ্যপাড়া	Madhypara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg25p01ilw88oynxis1tb	cmozqxhyn0011zo8oeum3cm8h	Lotifpur	lotifpur-union	3508	2026-05-10 15:55:58.573	2026-05-10 16:53:00.012	t	লতিফপুর	Lotifpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg3zc01opw88of6zbawiw	cmozwcy3w00cz408o87kpbjb4	Khattamadobpara	khattamadobpara-union	3763	2026-05-10 15:56:00.936	2026-05-10 16:53:01.518	t	খট্টামাধবপাড়া	Khattamadobpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyg7xx022tw88ozwtmvdjo	cmozwcxw400bv408o9a2wheb3	Shahbajpur	shahbajpur-union	4397	2026-05-10 15:56:06.069	2026-05-10 16:53:04.836	t	শাহবাজপুর	Shahbajpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyhd000gdk8ocr8momuy	cmozwcw610037408opisugy0z	Bhabanipur	bhabanipur-union-1	17	2026-05-10 16:52:39.697	2026-05-10 16:52:39.697	t	ভবানীপুর	Bhabanipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyhm000hdk8o1au8wzee	cmozwcw610037408opisugy0z	North Khoshbas	north-khoshbas-union	18	2026-05-10 16:52:39.706	2026-05-10 16:52:39.706	t	উত্তর খোশবাস	North Khoshbas	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyhw000idk8oa6klf4ml	cmozwcw610037408opisugy0z	South Khoshbas	south-khoshbas-union	19	2026-05-10 16:52:39.716	2026-05-10 16:52:39.716	t	দক্ষিন খোশবাস	South Khoshbas	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyi5000jdk8ohp2fyivf	cmozwcw610037408opisugy0z	Jhalam	jhalam-union	20	2026-05-10 16:52:39.725	2026-05-10 16:52:39.725	t	ঝলম	Jhalam	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyig000kdk8ooxh6ns2h	cmozwcw610037408opisugy0z	Chitodda	chitodda-union	21	2026-05-10 16:52:39.736	2026-05-10 16:52:39.736	t	চিতড্ডা	Chitodda	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyiq000ldk8owib51bpj	cmozwcw610037408opisugy0z	North Shilmuri	north-shilmuri-union	22	2026-05-10 16:52:39.746	2026-05-10 16:52:39.746	t	উত্তর শিলমুড়ি	North Shilmuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyj2000mdk8osq4rl558	cmozwcw610037408opisugy0z	South Shilmuri	south-shilmuri-union	23	2026-05-10 16:52:39.758	2026-05-10 16:52:39.758	t	দক্ষিন শিলমুড়ি	South Shilmuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyjg000ndk8opxqbk8qo	cmozwcw610037408opisugy0z	Galimpur	galimpur-union-1	24	2026-05-10 16:52:39.772	2026-05-10 16:52:39.772	t	গালিমপুর	Galimpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyjt000odk8oazuxvqp9	cmozwcw610037408opisugy0z	Shakpur	shakpur-union	25	2026-05-10 16:52:39.785	2026-05-10 16:52:39.785	t	শাকপুর	Shakpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyk4000pdk8opwey4oma	cmozwcw610037408opisugy0z	Bhaukshar	bhaukshar-union	26	2026-05-10 16:52:39.796	2026-05-10 16:52:39.796	t	ভাউকসার	Bhaukshar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gykf000qdk8o5y9hzjv8	cmozwcw610037408opisugy0z	Adda	adda-union	27	2026-05-10 16:52:39.807	2026-05-10 16:52:39.807	t	আড্ডা	Adda	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gykq000rdk8oouqlow9o	cmozwcw610037408opisugy0z	Adra	adra-union	28	2026-05-10 16:52:39.818	2026-05-10 16:52:39.818	t	আদ্রা	Adra	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyl0000sdk8ovemozn26	cmozwcw610037408opisugy0z	Payalgacha	payalgacha-union	29	2026-05-10 16:52:39.828	2026-05-10 16:52:39.828	t	পয়ালগাছা	Payalgacha	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gylc000tdk8ob799n30x	cmozwcw610037408opisugy0z	Laxmipur	laxmipur-union-3	30	2026-05-10 16:52:39.84	2026-05-10 16:52:39.84	t	লক্ষীপুর	Laxmipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gylm000udk8o2dq26wwd	cmozwcw680038408o52a2au1n	Shidli	shidli-union	31	2026-05-10 16:52:39.85	2026-05-10 16:52:39.85	t	শিদলাই	Shidli	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gylv000vdk8o9av7nmoz	cmozwcw680038408o52a2au1n	Chandla	chandla-union	32	2026-05-10 16:52:39.859	2026-05-10 16:52:39.859	t	চান্দলা	Chandla	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gym4000wdk8oavik73cx	cmozwcw680038408o52a2au1n	Shashidal	shashidal-union	33	2026-05-10 16:52:39.868	2026-05-10 16:52:39.868	t	শশীদল	Shashidal	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyme000xdk8o3ku1y60i	cmozwcw680038408o52a2au1n	Dulalpur	dulalpur-union-1	34	2026-05-10 16:52:39.878	2026-05-10 16:52:39.878	t	দুলালপুর	Dulalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gymn000ydk8osuuhzb8v	cmozwcw680038408o52a2au1n	Brahmanpara Sadar	brahmanpara-sadar-union	35	2026-05-10 16:52:39.887	2026-05-10 16:52:39.887	t	ব্রাহ্মনপাড়া সদর	Brahmanpara Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gymw000zdk8o9q1m7fzs	cmozwcw680038408o52a2au1n	Shahebabad	shahebabad-union	36	2026-05-10 16:52:39.896	2026-05-10 16:52:39.896	t	সাহেবাবাদ	Shahebabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyn40010dk8orsn59k24	cmozwcw680038408o52a2au1n	Malapara	malapara-union	37	2026-05-10 16:52:39.904	2026-05-10 16:52:39.904	t	মালাপাড়া	Malapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gynd0011dk8o45224k4g	cmozwcw680038408o52a2au1n	Madhabpur	madhabpur-union	38	2026-05-10 16:52:39.913	2026-05-10 16:52:39.913	t	মাধবপুর	Madhabpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gynm0012dk8o1sf0mbrf	cmozwcw6l003a408okeo8t987	Shuhilpur	shuhilpur-union	39	2026-05-10 16:52:39.922	2026-05-10 16:52:39.922	t	সুহিলপুর	Shuhilpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gynw0013dk8o8n9eg1tl	cmozwcw6l003a408okeo8t987	Bataghashi	bataghashi-union	40	2026-05-10 16:52:39.932	2026-05-10 16:52:39.932	t	বাতাঘাসি	Bataghashi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyo50014dk8otzut9rgp	cmozwcw6l003a408okeo8t987	Joag	joag-union	41	2026-05-10 16:52:39.941	2026-05-10 16:52:39.941	t	জোয়াগ	Joag	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyof0015dk8ogb0ioihf	cmozwcw6l003a408okeo8t987	Borcarai	borcarai-union	42	2026-05-10 16:52:39.951	2026-05-10 16:52:39.951	t	বরকরই	Borcarai	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyoo0016dk8owsxb2n4w	cmozwcw6l003a408okeo8t987	Madhaiya	madhaiya-union	43	2026-05-10 16:52:39.96	2026-05-10 16:52:39.96	t	মাধাইয়া	Madhaiya	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyp00017dk8op7kvtmjp	cmozwcw6l003a408okeo8t987	Dollai Nowabpur	dollai-nowabpur-union	44	2026-05-10 16:52:39.972	2026-05-10 16:52:39.972	t	দোল্লাই নবাবপুর	Dollai Nowabpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gypb0018dk8o6qdloxem	cmozwcw6l003a408okeo8t987	Mohichial	mohichial-union	45	2026-05-10 16:52:39.983	2026-05-10 16:52:39.983	t	মহিচাইল	Mohichial	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gypl0019dk8ox8b1worv	cmozwcw6l003a408okeo8t987	Gollai	gollai-union	46	2026-05-10 16:52:39.993	2026-05-10 16:52:39.993	t	গল্লাই	Gollai	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gypy001adk8odg42dfa7	cmozwcw6l003a408okeo8t987	Keronkhal	keronkhal-union	47	2026-05-10 16:52:40.006	2026-05-10 16:52:40.006	t	কেরণখাল	Keronkhal	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyq8001bdk8o6uikur3v	cmozwcw6l003a408okeo8t987	Maijkhar	maijkhar-union	48	2026-05-10 16:52:40.016	2026-05-10 16:52:40.016	t	মাইজখার	Maijkhar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyqh001cdk8ojv3udj0v	cmozwcw6l003a408okeo8t987	Etberpur	etberpur-union	49	2026-05-10 16:52:40.025	2026-05-10 16:52:40.025	t	এতবারপুর	Etberpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyqr001ddk8ozjfv0h7x	cmozwcw6l003a408okeo8t987	Barera	barera-union	50	2026-05-10 16:52:40.035	2026-05-10 16:52:40.035	t	বাড়েরা	Barera	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyr3001edk8oas9s5h6i	cmozwcw6l003a408okeo8t987	Borcoit	borcoit-union	51	2026-05-10 16:52:40.047	2026-05-10 16:52:40.047	t	বরকইট	Borcoit	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyrg001fdk8oop6lhwyj	cmozwcw6s003b408ohv2cjmbb	Sreepur	sreepur-union-3	52	2026-05-10 16:52:40.06	2026-05-10 16:52:40.06	t	শ্রীপুর	Sreepur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyrq001gdk8oluxcqu67	cmozwcw6s003b408ohv2cjmbb	Kashinagar	kashinagar-union	53	2026-05-10 16:52:40.07	2026-05-10 16:52:40.07	t	কাশিনগর	Kashinagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gys5001hdk8ox59gesbm	cmozwcw6s003b408ohv2cjmbb	Kalikapur	kalikapur-union-5	54	2026-05-10 16:52:40.085	2026-05-10 16:52:40.085	t	কালিকাপুর	Kalikapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyse001idk8oszxdjhr2	cmozwcw6s003b408ohv2cjmbb	Shuvapur	shuvapur-union	55	2026-05-10 16:52:40.095	2026-05-10 16:52:40.095	t	শুভপুর	Shuvapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gysn001jdk8o15fzl3cn	cmozwcw6s003b408ohv2cjmbb	Ghulpasha	ghulpasha-union	56	2026-05-10 16:52:40.103	2026-05-10 16:52:40.103	t	ঘোলপাশা	Ghulpasha	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gysx001kdk8o6fsw6spd	cmozwcw6s003b408ohv2cjmbb	Moonshirhat	moonshirhat-union	57	2026-05-10 16:52:40.113	2026-05-10 16:52:40.113	t	মুন্সীরহাট	Moonshirhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyt6001ldk8omvf9tem2	cmozwcw6s003b408ohv2cjmbb	Batisha	batisha-union	58	2026-05-10 16:52:40.122	2026-05-10 16:52:40.122	t	বাতিসা	Batisha	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gytg001mdk8ox535celh	cmozwcw6s003b408ohv2cjmbb	Kankapait	kankapait-union	59	2026-05-10 16:52:40.132	2026-05-10 16:52:40.132	t	কনকাপৈত	Kankapait	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gytq001ndk8o1lgizwyb	cmozwcw6s003b408ohv2cjmbb	Cheora	cheora-union	60	2026-05-10 16:52:40.142	2026-05-10 16:52:40.142	t	চিওড়া	Cheora	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gytz001odk8oovxj2njd	cmozwcw6s003b408ohv2cjmbb	Jagannatdighi	jagannatdighi-union	61	2026-05-10 16:52:40.151	2026-05-10 16:52:40.151	t	জগন্নাথদিঘী	Jagannatdighi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyu9001pdk8oo9i22tq2	cmozwcw6s003b408ohv2cjmbb	Goonabati	goonabati-union	62	2026-05-10 16:52:40.161	2026-05-10 16:52:40.161	t	গুনবতী	Goonabati	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyuj001qdk8o9k2u694e	cmozwcw6s003b408ohv2cjmbb	Alkara	alkara-union	63	2026-05-10 16:52:40.171	2026-05-10 16:52:40.171	t	আলকরা	Alkara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyus001rdk8ot8w7qss1	cmozwcw6y003c408o8auj2i65	Doulotpur	doulotpur-union	64	2026-05-10 16:52:40.18	2026-05-10 16:52:40.18	t	দৌলতপুর	Doulotpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyv1001sdk8o3x4b0ddq	cmozwcw6y003c408o8auj2i65	Daudkandi	daudkandi-union	65	2026-05-10 16:52:40.189	2026-05-10 16:52:40.189	t	দাউদকান্দি	Daudkandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyvb001tdk8o46iz1e37	cmozwcw6y003c408o8auj2i65	North Eliotgonj	north-eliotgonj-union	66	2026-05-10 16:52:40.199	2026-05-10 16:52:40.199	t	উত্তর ইলিয়টগঞ্জ	North Eliotgonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyvm001udk8o9jg5wswr	cmozwcw6y003c408o8auj2i65	South Eliotgonj	south-eliotgonj-union	67	2026-05-10 16:52:40.21	2026-05-10 16:52:40.21	t	দক্ষিন ইলিয়টগঞ্জ	South Eliotgonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyvx001vdk8ol1s7idly	cmozwcw6y003c408o8auj2i65	Zinglatoli	zinglatoli-union	68	2026-05-10 16:52:40.221	2026-05-10 16:52:40.221	t	জিংলাতলী	Zinglatoli	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyw7001wdk8osrgdmvaw	cmozwcw6y003c408o8auj2i65	Sundolpur	sundolpur-union	69	2026-05-10 16:52:40.231	2026-05-10 16:52:40.231	t	সুন্দলপুর	Sundolpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gywj001xdk8ocxeurgmt	cmozwcw6y003c408o8auj2i65	Gouripur	gouripur-union-3	70	2026-05-10 16:52:40.243	2026-05-10 16:52:40.243	t	গৌরীপুর	Gouripur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gywu001ydk8o09fn9agm	cmozwcw6y003c408o8auj2i65	East Mohammadpur	east-mohammadpur-union	71	2026-05-10 16:52:40.254	2026-05-10 16:52:40.254	t	পুর্ব মোহাম্মদপুর	East Mohammadpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyx3001zdk8op3i4jgd0	cmozwcw6y003c408o8auj2i65	West Mohammadpur	west-mohammadpur-union	72	2026-05-10 16:52:40.263	2026-05-10 16:52:40.263	t	পশ্চিম মোহাম্মদপুর	West Mohammadpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyxc0020dk8o19s6uzd7	cmozwcw6y003c408o8auj2i65	Goalmari	goalmari-union	73	2026-05-10 16:52:40.272	2026-05-10 16:52:40.272	t	গোয়ালমারী	Goalmari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyxm0021dk8onhtsopcq	cmozwcw6y003c408o8auj2i65	Maruka	maruka-union	74	2026-05-10 16:52:40.282	2026-05-10 16:52:40.282	t	মারুকা	Maruka	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyxu0022dk8o9dmg2lnz	cmozwcw6y003c408o8auj2i65	Betessor	betessor-union	75	2026-05-10 16:52:40.29	2026-05-10 16:52:40.29	t	বিটেশ্বর	Betessor	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyy30023dk8orkyf9u0e	cmozwcw6y003c408o8auj2i65	Podua	podua-union	76	2026-05-10 16:52:40.299	2026-05-10 16:52:40.299	t	পদুয়া	Podua	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyyb0024dk8ok4t8shbv	cmozwcw6y003c408o8auj2i65	West Passgacia	west-passgacia-union	77	2026-05-10 16:52:40.307	2026-05-10 16:52:40.307	t	পশ্চিম পাচঁগাছিয়া	West Passgacia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyyk0025dk8oxtrgabpa	cmozwcw6y003c408o8auj2i65	Baropara	baropara-union	78	2026-05-10 16:52:40.316	2026-05-10 16:52:40.316	t	বারপাড়া	Baropara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyyu0026dk8omuwc2xlt	cmozwcw7c003e408opcyxhdx0	Mathabanga	mathabanga-union	79	2026-05-10 16:52:40.326	2026-05-10 16:52:40.326	t	মাথাভাঙ্গা	Mathabanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyz20027dk8o7eakv6gs	cmozwcw7c003e408opcyxhdx0	Gagutiea	gagutiea-union	80	2026-05-10 16:52:40.334	2026-05-10 16:52:40.334	t	ঘাগুটিয়া	Gagutiea	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyzc0028dk8oaeeztgs0	cmozwcw7c003e408opcyxhdx0	Asadpur	asadpur-union	81	2026-05-10 16:52:40.344	2026-05-10 16:52:40.344	t	আছাদপুর	Asadpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyzl0029dk8o6z1ii5yn	cmozwcw7c003e408opcyxhdx0	Chanderchor	chanderchor-union	82	2026-05-10 16:52:40.353	2026-05-10 16:52:40.353	t	চান্দেরচর	Chanderchor	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gyzv002adk8ok2ucwste	cmozwcw7c003e408opcyxhdx0	Vashania	vashania-union	83	2026-05-10 16:52:40.363	2026-05-10 16:52:40.363	t	ভাষানিয়া	Vashania	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz05002bdk8ow3eo0n2r	cmozwcw7c003e408opcyxhdx0	Nilokhi	nilokhi-union	84	2026-05-10 16:52:40.373	2026-05-10 16:52:40.373	t	নিলখী	Nilokhi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz0e002cdk8oh93rgykp	cmozwcw7c003e408opcyxhdx0	Garmora	garmora-union	85	2026-05-10 16:52:40.382	2026-05-10 16:52:40.382	t	ঘারমোড়া	Garmora	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz0o002ddk8oddhvwvb2	cmozwcw7c003e408opcyxhdx0	Joypur	joypur-union-1	86	2026-05-10 16:52:40.392	2026-05-10 16:52:40.392	t	জয়পুর	Joypur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz10002edk8ovpzryaql	cmozwcw7c003e408opcyxhdx0	Dulalpur	dulalpur-union-2	87	2026-05-10 16:52:40.404	2026-05-10 16:52:40.404	t	দুলালপুর	Dulalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz1a002fdk8o4278397c	cmozwcw7j003f408oh55uaz0l	Bakoi	bakoi-union	88	2026-05-10 16:52:40.414	2026-05-10 16:52:40.414	t	বাকই	Bakoi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz1j002gdk8oilw66qr1	cmozwcw7j003f408oh55uaz0l	Mudafargonj	mudafargonj-union	89	2026-05-10 16:52:40.423	2026-05-10 16:52:40.423	t	মুদাফফর গঞ্জ	Mudafargonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz1t002hdk8o5dkxr0sh	cmozwcw7j003f408oh55uaz0l	Kandirpar	kandirpar-union	90	2026-05-10 16:52:40.433	2026-05-10 16:52:40.433	t	কান্দিরপাড়	Kandirpar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz23002idk8o59gx9sn1	cmozwcw7j003f408oh55uaz0l	Gobindapur	gobindapur-union-1	91	2026-05-10 16:52:40.443	2026-05-10 16:52:40.443	t	গোবিন্দপুর	Gobindapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz2c002jdk8onygzzm05	cmozwcw7j003f408oh55uaz0l	Uttarda	uttarda-union	92	2026-05-10 16:52:40.452	2026-05-10 16:52:40.452	t	উত্তরদা	Uttarda	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz2l002kdk8o4ttf9xe5	cmozwcw7j003f408oh55uaz0l	Laksam Purba	laksam-purba-union	93	2026-05-10 16:52:40.461	2026-05-10 16:52:40.461	t	লাকসাম পুর্ব	Laksam Purba	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz2v002ldk8oaanwjy6o	cmozwcw7j003f408oh55uaz0l	Azgora	azgora-union	94	2026-05-10 16:52:40.471	2026-05-10 16:52:40.471	t	আজগরা	Azgora	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz34002mdk8oye8o8u8t	cmozwcw8c003j408o8j960nep	Sreekil	sreekil-union	95	2026-05-10 16:52:40.48	2026-05-10 16:52:40.48	t	শ্রীকাইল	Sreekil	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz3d002ndk8osoenvxh5	cmozwcw8c003j408o8j960nep	Akubpur	akubpur-union	96	2026-05-10 16:52:40.489	2026-05-10 16:52:40.489	t	আকুবপুর	Akubpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz3m002odk8oklc9nn7d	cmozwcw8c003j408o8j960nep	Andicot	andicot-union	97	2026-05-10 16:52:40.498	2026-05-10 16:52:40.498	t	আন্দিকোট	Andicot	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz3v002pdk8owepougab	cmozwcw8c003j408o8j960nep	Purbadair (East)	purbadair-east-union	98	2026-05-10 16:52:40.507	2026-05-10 16:52:40.507	t	পুর্বধৈইর (পুর্ব)	Purbadair (East)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz44002qdk8oon5n7b1o	cmozwcw8c003j408o8j960nep	Purbadair (West)	purbadair-west-union	99	2026-05-10 16:52:40.517	2026-05-10 16:52:40.517	t	পুর্বধৈইর (পশ্চিম)	Purbadair (West)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz4f002rdk8o2vopsekr	cmozwcw8c003j408o8j960nep	Bangara (East)	bangara-east-union	100	2026-05-10 16:52:40.527	2026-05-10 16:52:40.527	t	বাঙ্গরা (পূর্ব)	Bangara (East)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz4o002sdk8ouj86ftp7	cmozwcw8c003j408o8j960nep	Bangara (West)	bangara-west-union	101	2026-05-10 16:52:40.536	2026-05-10 16:52:40.536	t	বাঙ্গরা (পশ্চিম)	Bangara (West)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz4y002tdk8ocl8lkaxy	cmozwcw8c003j408o8j960nep	Chapitala	chapitala-union	102	2026-05-10 16:52:40.546	2026-05-10 16:52:40.546	t	চাপিতলা	Chapitala	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz57002udk8ol47e2mlj	cmozwcw8c003j408o8j960nep	Camalla	camalla-union	103	2026-05-10 16:52:40.555	2026-05-10 16:52:40.555	t	কামাল্লা	Camalla	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz5h002vdk8ol5mr7s03	cmozwcw8c003j408o8j960nep	Jatrapur	jatrapur-union-1	104	2026-05-10 16:52:40.565	2026-05-10 16:52:40.565	t	যাত্রাপুর	Jatrapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz5q002wdk8ox2kc722o	cmozwcw8c003j408o8j960nep	Ramachandrapur (North)	ramachandrapur-north-union	105	2026-05-10 16:52:40.574	2026-05-10 16:52:40.574	t	রামচন্দ্রপুর (উত্তর)	Ramachandrapur (North)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz5z002xdk8oif36717c	cmozwcw8c003j408o8j960nep	Ramachandrapur (South)	ramachandrapur-south-union	106	2026-05-10 16:52:40.583	2026-05-10 16:52:40.583	t	রামচন্দ্রপুর (দক্ষিন)	Ramachandrapur (South)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz68002ydk8o3gvla76s	cmozwcw8c003j408o8j960nep	Muradnagar Sadar	muradnagar-sadar-union	107	2026-05-10 16:52:40.592	2026-05-10 16:52:40.592	t	মুরাদনগর সদর	Muradnagar Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz6i002zdk8ovcr9zst4	cmozwcw8c003j408o8j960nep	Nobipur (East)	nobipur-east-union	108	2026-05-10 16:52:40.602	2026-05-10 16:52:40.602	t	নবীপুর (পুর্ব)	Nobipur (East)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz6r0030dk8of6oac955	cmozwcw8c003j408o8j960nep	Nobipur (West)	nobipur-west-union	109	2026-05-10 16:52:40.611	2026-05-10 16:52:40.611	t	নবীপুর (পশ্চিম)	Nobipur (West)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz720031dk8oq8ytdpmk	cmozwcw8c003j408o8j960nep	Damgar	damgar-union	110	2026-05-10 16:52:40.622	2026-05-10 16:52:40.622	t	ধামঘর	Damgar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz7d0032dk8ohargwfri	cmozwcw8c003j408o8j960nep	Jahapur	jahapur-union-1	111	2026-05-10 16:52:40.633	2026-05-10 16:52:40.633	t	জাহাপুর	Jahapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz7l0033dk8oukevefpk	cmozwcw8c003j408o8j960nep	Salikandi	salikandi-union	112	2026-05-10 16:52:40.641	2026-05-10 16:52:40.641	t	ছালিয়াকান্দি	Salikandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz7v0034dk8ohshnkbl7	cmozwcw8c003j408o8j960nep	Darura	darura-union	113	2026-05-10 16:52:40.651	2026-05-10 16:52:40.651	t	দারোরা	Darura	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz840035dk8oz36fudfc	cmozwcw8c003j408o8j960nep	Paharpur	paharpur-union	114	2026-05-10 16:52:40.66	2026-05-10 16:52:40.66	t	পাহাড়পুর	Paharpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz8d0036dk8od0voffth	cmozwcw8c003j408o8j960nep	Babutipara	babutipara-union	115	2026-05-10 16:52:40.669	2026-05-10 16:52:40.669	t	বাবুটিপাড়া	Babutipara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz8m0037dk8owi6p8u1u	cmozwcw8c003j408o8j960nep	Tanki	tanki-union	116	2026-05-10 16:52:40.678	2026-05-10 16:52:40.678	t	টনকী	Tanki	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz8v0038dk8o2pix9jn4	cmozwcw8i003k408oiozneei1	Bangadda	bangadda-union	117	2026-05-10 16:52:40.687	2026-05-10 16:52:40.687	t	বাঙ্গড্ডা	Bangadda	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz960039dk8ozbwbi94b	cmozwcw8i003k408oiozneei1	Paria	paria-union-1	118	2026-05-10 16:52:40.698	2026-05-10 16:52:40.698	t	পেরিয়া	Paria	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz9f003adk8o7v81zd6h	cmozwcw8i003k408oiozneei1	Raykot	raykot-union	119	2026-05-10 16:52:40.707	2026-05-10 16:52:40.707	t	রায়কোট	Raykot	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz9o003bdk8ox69wqhx9	cmozwcw8i003k408oiozneei1	Mokara	mokara-union	120	2026-05-10 16:52:40.716	2026-05-10 16:52:40.716	t	মোকরা	Mokara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gz9x003cdk8osbj6jmn9	cmozwcw8i003k408oiozneei1	Makrabpur	makrabpur-union	121	2026-05-10 16:52:40.725	2026-05-10 16:52:40.725	t	মক্রবপুর	Makrabpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gza7003ddk8o1lvnho01	cmozwcw8i003k408oiozneei1	Heshakhal	heshakhal-union	122	2026-05-10 16:52:40.735	2026-05-10 16:52:40.735	t	হেসাখাল	Heshakhal	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzai003edk8ouuks0skt	cmozwcw8i003k408oiozneei1	Adra	adra-union-1	123	2026-05-10 16:52:40.746	2026-05-10 16:52:40.746	t	আদ্রা	Adra	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzar003fdk8oc4bh76eh	cmozwcw8i003k408oiozneei1	Judda	judda-union	124	2026-05-10 16:52:40.755	2026-05-10 16:52:40.755	t	জোড্ডা	Judda	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzb2003gdk8ojdk434so	cmozwcw8i003k408oiozneei1	Dhalua	dhalua-union-1	125	2026-05-10 16:52:40.766	2026-05-10 16:52:40.766	t	ঢালুয়া	Dhalua	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzbb003hdk8obugcq4yq	cmozwcw8i003k408oiozneei1	Doulkha	doulkha-union	126	2026-05-10 16:52:40.775	2026-05-10 16:52:40.775	t	দৌলখাঁড়	Doulkha	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzbm003idk8ou5lui3ap	cmozwcw8i003k408oiozneei1	Boxgonj	boxgonj-union	127	2026-05-10 16:52:40.786	2026-05-10 16:52:40.786	t	বক্সগঞ্জ	Boxgonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzbw003jdk8ov6hnk32z	cmozwcw8i003k408oiozneei1	Satbaria	satbaria-union-1	128	2026-05-10 16:52:40.796	2026-05-10 16:52:40.796	t	সাতবাড়ীয়া	Satbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzc6003kdk8og8at3obe	cmozwcw85003i408ohfwmeiff	Chandanpur	chandanpur-union-1	135	2026-05-10 16:52:40.806	2026-05-10 16:52:40.806	t	চন্দনপুর	Chandanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzcf003ldk8ogzqj9ai1	cmozwcw85003i408ohfwmeiff	Chalibanga	chalibanga-union	136	2026-05-10 16:52:40.815	2026-05-10 16:52:40.815	t	চালিভাঙ্গা	Chalibanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzco003mdk8of06vtgyy	cmozwcw85003i408ohfwmeiff	Radanagar	radanagar-union	137	2026-05-10 16:52:40.824	2026-05-10 16:52:40.824	t	রাধানগর	Radanagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzcw003ndk8ove4kwaqt	cmozwcw85003i408ohfwmeiff	Manikarchar	manikarchar-union	138	2026-05-10 16:52:40.832	2026-05-10 16:52:40.832	t	মানিকারচর	Manikarchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzd5003odk8ozqvop132	cmozwcw85003i408ohfwmeiff	Barakanda	barakanda-union	139	2026-05-10 16:52:40.841	2026-05-10 16:52:40.841	t	বড়কান্দা	Barakanda	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzde003pdk8oqd691q7l	cmozwcw85003i408ohfwmeiff	Govindapur	govindapur-union	140	2026-05-10 16:52:40.85	2026-05-10 16:52:40.85	t	গোবিন্দপুর	Govindapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzdm003qdk8ofi3od8qr	cmozwcw85003i408ohfwmeiff	Luterchar	luterchar-union	141	2026-05-10 16:52:40.859	2026-05-10 16:52:40.859	t	লুটেরচর	Luterchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzdw003rdk8o37xxwzlp	cmozwcw85003i408ohfwmeiff	Vaorkhola	vaorkhola-union	142	2026-05-10 16:52:40.868	2026-05-10 16:52:40.868	t	ভাওরখোলা	Vaorkhola	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gze5003sdk8oobmuxr5o	cmozwcw8w003m408oz7jw2bm6	Satani	satani-union	168	2026-05-10 16:52:40.877	2026-05-10 16:52:40.877	t	সাতানী	Satani	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzee003tdk8o0w5rwa99	cmozwcw8w003m408oz7jw2bm6	Jagatpur	jagatpur-union	169	2026-05-10 16:52:40.886	2026-05-10 16:52:40.886	t	জগতপুর	Jagatpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzeo003udk8o1nkt8d20	cmozwcw8w003m408oz7jw2bm6	Balorampur	balorampur-union	170	2026-05-10 16:52:40.896	2026-05-10 16:52:40.896	t	বলরামপুর	Balorampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzew003vdk8ooav4clg6	cmozwcw8w003m408oz7jw2bm6	Karikandi	karikandi-union	171	2026-05-10 16:52:40.904	2026-05-10 16:52:40.904	t	কড়িকান্দি	Karikandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzf6003wdk8ozzx0sohb	cmozwcw8w003m408oz7jw2bm6	Kalakandi	kalakandi-union	172	2026-05-10 16:52:40.914	2026-05-10 16:52:40.914	t	কলাকান্দি	Kalakandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzfe003xdk8oofoqx8sa	cmozwcw8w003m408oz7jw2bm6	Vitikandi	vitikandi-union	173	2026-05-10 16:52:40.922	2026-05-10 16:52:40.922	t	ভিটিকান্দি	Vitikandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzfn003ydk8obod3lv5a	cmozwcw8w003m408oz7jw2bm6	Narayandia	narayandia-union	174	2026-05-10 16:52:40.931	2026-05-10 16:52:40.931	t	নারান্দিয়া	Narayandia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzfw003zdk8ocx6vfuqp	cmozwcw8w003m408oz7jw2bm6	Zearkandi	zearkandi-union	175	2026-05-10 16:52:40.94	2026-05-10 16:52:40.94	t	জিয়ারকান্দি	Zearkandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzg50040dk8oku7r3vuw	cmozwcw8w003m408oz7jw2bm6	Majidpur	majidpur-union-1	176	2026-05-10 16:52:40.949	2026-05-10 16:52:40.949	t	মজিদপুর	Majidpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzge0041dk8okcts5tf1	cmozwcw6e0039408ok3svi20z	Moynamoti	moynamoti-union	177	2026-05-10 16:52:40.958	2026-05-10 16:52:40.958	t	ময়নামতি	Moynamoti	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzgo0042dk8orr2acg9a	cmozwcw6e0039408ok3svi20z	Varella	varella-union	178	2026-05-10 16:52:40.968	2026-05-10 16:52:40.968	t	ভারেল্লা	Varella	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzgw0043dk8oi55ahqri	cmozwcw6e0039408ok3svi20z	Mokam	mokam-union	179	2026-05-10 16:52:40.976	2026-05-10 16:52:40.976	t	মোকাম	Mokam	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzh70044dk8oy64005tz	cmozwcw6e0039408ok3svi20z	Burichang Sadar	burichang-sadar-union	180	2026-05-10 16:52:40.987	2026-05-10 16:52:40.987	t	বুড়িচং সদর	Burichang Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzhg0045dk8orj4bjiel	cmozwcw6e0039408ok3svi20z	Bakshimul	bakshimul-union	181	2026-05-10 16:52:40.996	2026-05-10 16:52:40.996	t	বাকশীমূল	Bakshimul	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzhp0046dk8owsbvitty	cmozwcw6e0039408ok3svi20z	Pirjatrapur	pirjatrapur-union	182	2026-05-10 16:52:41.005	2026-05-10 16:52:41.005	t	পীরযাত্রাপুর	Pirjatrapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzhy0047dk8ohuaanjbn	cmozwcw6e0039408ok3svi20z	Sholonal	sholonal-union	183	2026-05-10 16:52:41.014	2026-05-10 16:52:41.014	t	ষোলনল	Sholonal	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzi80048dk8ophjxo1qj	cmozwcw6e0039408ok3svi20z	Rajapur	rajapur-union-2	184	2026-05-10 16:52:41.024	2026-05-10 16:52:41.024	t	রাজাপুর	Rajapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzii0049dk8o5uw4e6jz	cmozwcw7q003g408oa9tb8gzb	Bagmara (North)	bagmara-north-union	185	2026-05-10 16:52:41.034	2026-05-10 16:52:41.034	t	বাগমারা (উত্তর)	Bagmara (North)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzit004adk8or1v07tkd	cmozwcw7q003g408oa9tb8gzb	Bagmara (South)	bagmara-south-union	186	2026-05-10 16:52:41.045	2026-05-10 16:52:41.045	t	বাগমারা (দক্ষিন)	Bagmara (South)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzj3004bdk8o7sq8icvm	cmozwcw7q003g408oa9tb8gzb	Bhuloin (North)	bhuloin-north-union	187	2026-05-10 16:52:41.055	2026-05-10 16:52:41.055	t	ভূলইন (উত্তর)	Bhuloin (North)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzjd004cdk8o59mu64nj	cmozwcw7q003g408oa9tb8gzb	Bhuloin (South)	bhuloin-south-union	188	2026-05-10 16:52:41.065	2026-05-10 16:52:41.065	t	ভূলইন (দক্ষিন)	Bhuloin (South)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzjm004ddk8ogxm1ungs	cmozwcw7q003g408oa9tb8gzb	Belgor (North)	belgor-north-union	189	2026-05-10 16:52:41.074	2026-05-10 16:52:41.074	t	বেলঘর (উত্তর)	Belgor (North)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzjv004edk8oyif54zg8	cmozwcw7q003g408oa9tb8gzb	Belgor (South)	belgor-south-union	190	2026-05-10 16:52:41.083	2026-05-10 16:52:41.083	t	বেলঘর (দক্ষিন)	Belgor (South)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzk5004fdk8om630hnmf	cmozwcw7q003g408oa9tb8gzb	Perul (North)	perul-north-union	191	2026-05-10 16:52:41.093	2026-05-10 16:52:41.093	t	পেরুল (উত্তর)	Perul (North)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzkf004gdk8o57ne06cx	cmozwcw7q003g408oa9tb8gzb	Perul (South)	perul-south-union	192	2026-05-10 16:52:41.103	2026-05-10 16:52:41.103	t	পেরুল (দক্ষিন)	Perul (South)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzkp004hdk8ob1cqikjl	cmozwcw93003n408o766xb4rx	Mohamaya	mohamaya-union	193	2026-05-10 16:52:41.113	2026-05-10 16:52:41.113	t	মহামায়া	Mohamaya	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzky004idk8ot2b9amdr	cmozwcw93003n408o766xb4rx	Pathannagar	pathannagar-union	194	2026-05-10 16:52:41.122	2026-05-10 16:52:41.122	t	পাঠাননগর	Pathannagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzl8004jdk8o14pvey55	cmozwcw93003n408o766xb4rx	Subhapur	subhapur-union	195	2026-05-10 16:52:41.132	2026-05-10 16:52:41.132	t	শুভপুর	Subhapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzlh004kdk8o8ja0k1zw	cmozwcw93003n408o766xb4rx	Radhanagar	radhanagar-union	196	2026-05-10 16:52:41.141	2026-05-10 16:52:41.141	t	রাধানগর	Radhanagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzlr004ldk8onkfxiyi3	cmozwcw93003n408o766xb4rx	Gopal	gopal-union	197	2026-05-10 16:52:41.151	2026-05-10 16:52:41.151	t	ঘোপাল	Gopal	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzm0004mdk8oumyss76p	cmozwcw9h003p408o93ypjeny	Sarishadi	sarishadi-union	198	2026-05-10 16:52:41.16	2026-05-10 16:52:41.16	t	শর্শদি	Sarishadi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzma004ndk8owldikv5m	cmozwcw9h003p408o93ypjeny	Panchgachia	panchgachia-union	199	2026-05-10 16:52:41.17	2026-05-10 16:52:41.17	t	পাঁচগাছিয়া	Panchgachia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h20h00d4dk8otvxcyww4	cmozwcwce0044408ort3fd7ux	Raipur	raipur-union-2	599	2026-05-10 16:52:44.273	2026-05-10 16:52:44.273	t	রায়পুর	Raipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzmj004odk8opfjci343	cmozwcw9h003p408o93ypjeny	Dhormapur	dhormapur-union	200	2026-05-10 16:52:41.179	2026-05-10 16:52:41.179	t	ধর্মপুর	Dhormapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzmt004pdk8ooa6deiyp	cmozwcw9h003p408o93ypjeny	Kazirbag	kazirbag-union	201	2026-05-10 16:52:41.189	2026-05-10 16:52:41.189	t	কাজিরবাগ	Kazirbag	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzn3004qdk8oux2wk6uj	cmozwcw9h003p408o93ypjeny	Kalidah	kalidah-union	202	2026-05-10 16:52:41.199	2026-05-10 16:52:41.199	t	কালিদহ	Kalidah	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gznd004rdk8o4zdw08k2	cmozwcw9h003p408o93ypjeny	Baligaon	baligaon-union	203	2026-05-10 16:52:41.209	2026-05-10 16:52:41.209	t	বালিগাঁও	Baligaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gznn004sdk8oncqkbu69	cmozwcw9h003p408o93ypjeny	Dholia	dholia-union	204	2026-05-10 16:52:41.219	2026-05-10 16:52:41.219	t	ধলিয়া	Dholia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gznx004tdk8omerfj7uj	cmozwcw9h003p408o93ypjeny	Lemua	lemua-union	205	2026-05-10 16:52:41.229	2026-05-10 16:52:41.229	t	লেমুয়া	Lemua	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzo8004udk8o5qj1ci2x	cmozwcw9h003p408o93ypjeny	Chonua	chonua-union	206	2026-05-10 16:52:41.24	2026-05-10 16:52:41.24	t	ছনুয়া	Chonua	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzoj004vdk8o8hrwufvj	cmozwcw9h003p408o93ypjeny	Motobi	motobi-union	207	2026-05-10 16:52:41.251	2026-05-10 16:52:41.251	t	মোটবী	Motobi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzot004wdk8o7seh823z	cmozwcw9h003p408o93ypjeny	Fazilpur	fazilpur-union-1	208	2026-05-10 16:52:41.261	2026-05-10 16:52:41.261	t	ফাজিলপুর	Fazilpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzp3004xdk8oi09u6lu8	cmozwcw9h003p408o93ypjeny	Forhadnogor	forhadnogor-union	209	2026-05-10 16:52:41.271	2026-05-10 16:52:41.271	t	ফরহাদনগর	Forhadnogor	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzpd004ydk8oe8c6qdlx	cmozwcwa2003s408or2b6xcjo	Charmozlishpur	charmozlishpur-union	210	2026-05-10 16:52:41.281	2026-05-10 16:52:41.281	t	চরমজলিশপুর	Charmozlishpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzpn004zdk8ox21omg5j	cmozwcwa2003s408or2b6xcjo	Bogadana	bogadana-union	211	2026-05-10 16:52:41.291	2026-05-10 16:52:41.291	t	বগাদানা	Bogadana	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzpx0050dk8ooebj95yk	cmozwcwa2003s408or2b6xcjo	Motigonj	motigonj-union	212	2026-05-10 16:52:41.301	2026-05-10 16:52:41.301	t	মতিগঞ্জ	Motigonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzq70051dk8o1jqotac7	cmozwcwa2003s408or2b6xcjo	Mongolkandi	mongolkandi-union	213	2026-05-10 16:52:41.311	2026-05-10 16:52:41.311	t	মঙ্গলকান্দি	Mongolkandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzqg0052dk8os7pz0u6h	cmozwcwa2003s408or2b6xcjo	Chardorbesh	chardorbesh-union	214	2026-05-10 16:52:41.32	2026-05-10 16:52:41.32	t	চরদরবেশ	Chardorbesh	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzqp0053dk8o92dyoz5r	cmozwcwa2003s408or2b6xcjo	Chorchandia	chorchandia-union	215	2026-05-10 16:52:41.33	2026-05-10 16:52:41.33	t	চরচান্দিয়া	Chorchandia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzqy0054dk8ohnrunmzz	cmozwcwa2003s408or2b6xcjo	Sonagazi	sonagazi-union	216	2026-05-10 16:52:41.338	2026-05-10 16:52:41.338	t	সোনাগাজী	Sonagazi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzr80055dk8o4vermta0	cmozwcwa2003s408or2b6xcjo	Amirabad	amirabad-union	217	2026-05-10 16:52:41.348	2026-05-10 16:52:41.348	t	আমিরাবাদ	Amirabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzrh0056dk8ov1ekx1ih	cmozwcwa2003s408or2b6xcjo	Nababpur	nababpur-union	218	2026-05-10 16:52:41.357	2026-05-10 16:52:41.357	t	নবাবপুর	Nababpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzrr0057dk8o78rxk6xm	cmozwcw9o003q408o0cu2w7rb	Fulgazi	fulgazi-union	219	2026-05-10 16:52:41.367	2026-05-10 16:52:41.367	t	ফুলগাজী	Fulgazi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzrz0058dk8ok4c831pa	cmozwcw9o003q408o0cu2w7rb	Munshirhat	munshirhat-union	220	2026-05-10 16:52:41.375	2026-05-10 16:52:41.375	t	মুন্সিরহাট	Munshirhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzs90059dk8oitd6jkwd	cmozwcw9o003q408o0cu2w7rb	Dorbarpur	dorbarpur-union	221	2026-05-10 16:52:41.385	2026-05-10 16:52:41.385	t	দরবারপুর	Dorbarpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzsh005adk8oysob5xwa	cmozwcw9o003q408o0cu2w7rb	Anandopur	anandopur-union	222	2026-05-10 16:52:41.393	2026-05-10 16:52:41.393	t	আনন্দপুর	Anandopur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzsq005bdk8oan0jhluw	cmozwcw9o003q408o0cu2w7rb	Amzadhat	amzadhat-union	223	2026-05-10 16:52:41.402	2026-05-10 16:52:41.402	t	আমজাদহাট	Amzadhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzt0005cdk8o39wzg893	cmozwcw9o003q408o0cu2w7rb	Gmhat	gmhat-union	224	2026-05-10 16:52:41.412	2026-05-10 16:52:41.412	t	জি,এম, হাট	Gmhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzta005ddk8oo7qnhdhg	cmozwcw9a003o408otrfpgryz	Sindurpur	sindurpur-union	228	2026-05-10 16:52:41.422	2026-05-10 16:52:41.422	t	সিন্দুরপুর	Sindurpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gztn005edk8owcpdxvz6	cmozwcw9a003o408otrfpgryz	Rajapur	rajapur-union-3	229	2026-05-10 16:52:41.435	2026-05-10 16:52:41.435	t	রাজাপুর	Rajapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gztw005fdk8oaadudwoh	cmozwcw9a003o408otrfpgryz	Purbachandrapur	purbachandrapur-union	230	2026-05-10 16:52:41.444	2026-05-10 16:52:41.444	t	পূর্বচন্দ্রপুর	Purbachandrapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzu7005gdk8odsy4x7r0	cmozwcw9a003o408otrfpgryz	Ramnagar	ramnagar-union-2	231	2026-05-10 16:52:41.455	2026-05-10 16:52:41.455	t	রামনগর	Ramnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzuh005hdk8o61r6ca1q	cmozwcw9a003o408otrfpgryz	Yeakubpur	yeakubpur-union	232	2026-05-10 16:52:41.465	2026-05-10 16:52:41.465	t	ইয়াকুবপুর	Yeakubpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzuq005idk8ocl2r88js	cmozwcw9a003o408otrfpgryz	Daganbhuiyan	daganbhuiyan-union	233	2026-05-10 16:52:41.474	2026-05-10 16:52:41.474	t	দাগনভূঞা	Daganbhuiyan	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzv0005jdk8od4wt2yil	cmozwcw9a003o408otrfpgryz	Matubhuiyan	matubhuiyan-union	234	2026-05-10 16:52:41.484	2026-05-10 16:52:41.484	t	মাতুভূঞা	Matubhuiyan	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzv9005kdk8o1eq0157e	cmozwcw9a003o408otrfpgryz	Jayloskor	jayloskor-union	235	2026-05-10 16:52:41.493	2026-05-10 16:52:41.493	t	জায়লস্কর	Jayloskor	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzvj005ldk8ome7w833b	cmozwcvya0025408oji6l0509	Basudeb	basudeb-union	236	2026-05-10 16:52:41.503	2026-05-10 16:52:41.503	t	বাসুদেব	Basudeb	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzvt005mdk8oa4be693n	cmozwcvya0025408oji6l0509	Machihata	machihata-union	237	2026-05-10 16:52:41.513	2026-05-10 16:52:41.513	t	মাছিহাতা	Machihata	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzw6005ndk8o7lrv4qau	cmozwcvya0025408oji6l0509	Sultanpur	sultanpur-union-3	238	2026-05-10 16:52:41.527	2026-05-10 16:52:41.527	t	সুলতানপুর	Sultanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzwh005odk8oz4p2dls6	cmozwcvya0025408oji6l0509	Ramrail	ramrail-union	239	2026-05-10 16:52:41.537	2026-05-10 16:52:41.537	t	রামরাইল	Ramrail	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzwt005pdk8ocun8twov	cmozwcvya0025408oji6l0509	Sadekpur	sadekpur-union-1	240	2026-05-10 16:52:41.549	2026-05-10 16:52:41.549	t	সাদেকপুর	Sadekpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzx2005qdk8oxu17zc02	cmozwcvya0025408oji6l0509	Talsahar	talsahar-union	241	2026-05-10 16:52:41.558	2026-05-10 16:52:41.558	t	তালশহর	Talsahar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzxc005rdk8o5fo8fctb	cmozwcvya0025408oji6l0509	Natai	natai-union	243	2026-05-10 16:52:41.568	2026-05-10 16:52:41.579	t	নাটাই (উত্তর)	Natai	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzxz005sdk8oe6jj3lt6	cmozwcvya0025408oji6l0509	Shuhilpur	shuhilpur-union-1	244	2026-05-10 16:52:41.591	2026-05-10 16:52:41.591	t	সুহিলপুর	Shuhilpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzy8005tdk8o1l82jhac	cmozwcvya0025408oji6l0509	Bodhal	bodhal-union	245	2026-05-10 16:52:41.6	2026-05-10 16:52:41.6	t	বুধল	Bodhal	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzyi005udk8owdvf2g6z	cmozwcvya0025408oji6l0509	Majlishpur	majlishpur-union	246	2026-05-10 16:52:41.61	2026-05-10 16:52:41.61	t	মজলিশপুর	Majlishpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzyv005vdk8ojetzz5e7	cmozwcvyi0026408o2h70teia	Mulagram	mulagram-union	247	2026-05-10 16:52:41.623	2026-05-10 16:52:41.623	t	মূলগ্রাম	Mulagram	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzz6005wdk8o0oaa292j	cmozwcvyi0026408o2h70teia	Mehari	mehari-union	248	2026-05-10 16:52:41.634	2026-05-10 16:52:41.634	t	মেহারী	Mehari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzzf005xdk8owambinqh	cmozwcvyi0026408o2h70teia	Badair	badair-union	249	2026-05-10 16:52:41.643	2026-05-10 16:52:41.643	t	বাদৈর	Badair	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzzp005ydk8o39kp2nw8	cmozwcvyi0026408o2h70teia	Kharera	kharera-union	250	2026-05-10 16:52:41.653	2026-05-10 16:52:41.653	t	খাড়েরা	Kharera	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00gzzz005zdk8okd991nsa	cmozwcvyi0026408o2h70teia	Benauty	benauty-union	251	2026-05-10 16:52:41.663	2026-05-10 16:52:41.663	t	বিনাউটি	Benauty	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h00c0060dk8opz19ig5t	cmozwcvyi0026408o2h70teia	Gopinathpur	gopinathpur-union-3	252	2026-05-10 16:52:41.676	2026-05-10 16:52:41.676	t	গোপীনাথপুর	Gopinathpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h00n0061dk8oy8dh3wfn	cmozwcvyi0026408o2h70teia	Kasbaw	kasbaw-union	253	2026-05-10 16:52:41.687	2026-05-10 16:52:41.687	t	কসবা	Kasbaw	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h00z0062dk8osnjzybdm	cmozwcvyi0026408o2h70teia	Kuti	kuti-union	254	2026-05-10 16:52:41.699	2026-05-10 16:52:41.699	t	কুটি	Kuti	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0180063dk8o7f3g6btr	cmozwcvyi0026408o2h70teia	Kayempur	kayempur-union	255	2026-05-10 16:52:41.708	2026-05-10 16:52:41.708	t	কাইমপুর	Kayempur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h01h0064dk8oo8vo7d6r	cmozwcvyi0026408o2h70teia	Bayek	bayek-union	256	2026-05-10 16:52:41.717	2026-05-10 16:52:41.717	t	বায়েক	Bayek	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h01q0065dk8oor26wncy	cmozwcvyw0028408ot9a6vljz	Chatalpar	chatalpar-union	257	2026-05-10 16:52:41.726	2026-05-10 16:52:41.726	t	চাতলপাড়	Chatalpar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h01y0066dk8oglsr8lgh	cmozwcvyw0028408ot9a6vljz	Bhalakut	bhalakut-union	258	2026-05-10 16:52:41.734	2026-05-10 16:52:41.734	t	ভলাকুট	Bhalakut	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0270067dk8oouwkh3sd	cmozwcvyw0028408ot9a6vljz	Kunda	kunda-union	259	2026-05-10 16:52:41.743	2026-05-10 16:52:41.743	t	কুন্ডা	Kunda	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h02g0068dk8o39z5jegz	cmozwcvyw0028408ot9a6vljz	Goalnagar	goalnagar-union	260	2026-05-10 16:52:41.752	2026-05-10 16:52:41.752	t	গোয়ালনগর	Goalnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h02o0069dk8oppuf97rw	cmozwcvyw0028408ot9a6vljz	Nasirnagar	nasirnagar-union	261	2026-05-10 16:52:41.76	2026-05-10 16:52:41.76	t	নাসিরনগর	Nasirnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h02x006adk8oea18jno3	cmozwcvyw0028408ot9a6vljz	Burishwar	burishwar-union	262	2026-05-10 16:52:41.769	2026-05-10 16:52:41.769	t	বুড়িশ্বর	Burishwar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h036006bdk8op1kkabpz	cmozwcvyw0028408ot9a6vljz	Fandauk	fandauk-union	263	2026-05-10 16:52:41.778	2026-05-10 16:52:41.778	t	ফান্দাউক	Fandauk	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h03f006cdk8ocyp10c03	cmozwcvyw0028408ot9a6vljz	Goniauk	goniauk-union	264	2026-05-10 16:52:41.787	2026-05-10 16:52:41.787	t	গুনিয়াউক	Goniauk	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h03o006ddk8o0ajq5g2z	cmozwcvyw0028408ot9a6vljz	Chapartala	chapartala-union	265	2026-05-10 16:52:41.796	2026-05-10 16:52:41.796	t	চাপৈরতলা	Chapartala	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h03w006edk8olthm5k5c	cmozwcvyw0028408ot9a6vljz	Dharnondol	dharnondol-union	266	2026-05-10 16:52:41.804	2026-05-10 16:52:41.804	t	ধরমন্ডল	Dharnondol	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h048006fdk8o22dc26oa	cmozwcvyw0028408ot9a6vljz	Haripur	haripur-union-3	267	2026-05-10 16:52:41.816	2026-05-10 16:52:41.816	t	হরিপুর	Haripur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h04i006gdk8orqlbr98l	cmozwcvyw0028408ot9a6vljz	Purbabhag	purbabhag-union	268	2026-05-10 16:52:41.826	2026-05-10 16:52:41.826	t	পূর্বভাগ	Purbabhag	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h04r006hdk8osrgu306f	cmozwcvyw0028408ot9a6vljz	Gokarna	gokarna-union	269	2026-05-10 16:52:41.835	2026-05-10 16:52:41.835	t	গোকর্ণ	Gokarna	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h050006idk8oypqjilfo	cmozwcvz30029408orlsll997	Auraol	auraol-union	270	2026-05-10 16:52:41.844	2026-05-10 16:52:41.844	t	অরুয়াইল	Auraol	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h059006jdk8omwct1hoo	cmozwcvz30029408orlsll997	Pakshimuul	pakshimuul-union	271	2026-05-10 16:52:41.853	2026-05-10 16:52:41.853	t	পাকশিমুল	Pakshimuul	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h05i006kdk8oooowo9tg	cmozwcvz30029408orlsll997	Chunta	chunta-union	272	2026-05-10 16:52:41.862	2026-05-10 16:52:41.862	t	চুন্টা	Chunta	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h05r006ldk8o5xdgxp1m	cmozwcvz30029408orlsll997	Kalikaccha	kalikaccha-union	273	2026-05-10 16:52:41.871	2026-05-10 16:52:41.871	t	কালীকচ্ছ	Kalikaccha	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h060006mdk8opaf4jxqk	cmozwcvz30029408orlsll997	Panishor	panishor-union	274	2026-05-10 16:52:41.88	2026-05-10 16:52:41.88	t	পানিশ্বর	Panishor	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h069006ndk8oak9efm06	cmozwcvz30029408orlsll997	Sarail	sarail-union	275	2026-05-10 16:52:41.889	2026-05-10 16:52:41.889	t	সরাইল সদর	Sarail	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h06i006odk8ow7d6m9oa	cmozwcvz30029408orlsll997	Noagoun	noagoun-union	276	2026-05-10 16:52:41.898	2026-05-10 16:52:41.898	t	নোয়াগাঁও	Noagoun	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h06r006pdk8onqme41mg	cmozwcvz30029408orlsll997	Shahajadapur	shahajadapur-union	277	2026-05-10 16:52:41.907	2026-05-10 16:52:41.907	t	শাহজাদাপুর	Shahajadapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h070006qdk8o5nl3grmy	cmozwcvz30029408orlsll997	Shahbazpur	shahbazpur-union	278	2026-05-10 16:52:41.916	2026-05-10 16:52:41.916	t	শাহবাজপুর	Shahbazpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h079006rdk8o9ro5fx4y	cmozwcvxk0022408o31m692rt	Ashuganj	ashuganj-union	279	2026-05-10 16:52:41.925	2026-05-10 16:52:41.925	t	আশুগঞ্জ সদর	Ashuganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h07i006sdk8os0w4mhgv	cmozwcvxk0022408o31m692rt	Charchartala	charchartala-union	280	2026-05-10 16:52:41.934	2026-05-10 16:52:41.934	t	চরচারতলা	Charchartala	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h07y006tdk8o9go8xky0	cmozwcvxk0022408o31m692rt	Durgapur	durgapur-union-8	281	2026-05-10 16:52:41.95	2026-05-10 16:52:41.95	t	দুর্গাপুর	Durgapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h086006udk8ov649jept	cmozwcvxk0022408o31m692rt	Araishidha	araishidha-union	282	2026-05-10 16:52:41.958	2026-05-10 16:52:41.958	t	আড়াইসিধা	Araishidha	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h08f006vdk8oif7fsv63	cmozwcvxk0022408o31m692rt	Talshaharw	talshaharw-union	283	2026-05-10 16:52:41.967	2026-05-10 16:52:41.967	t	তালশহর(পঃ)	Talshaharw	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h08p006wdk8o2wtiqoxf	cmozwcvxk0022408o31m692rt	Sarifpur	sarifpur-union	284	2026-05-10 16:52:41.977	2026-05-10 16:52:41.977	t	শরীফপুর	Sarifpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h08y006xdk8orhh2f18b	cmozwcvxk0022408o31m692rt	Lalpur	lalpur-union-1	285	2026-05-10 16:52:41.986	2026-05-10 16:52:41.986	t	লালপুর	Lalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h097006ydk8opyliiylo	cmozwcvxk0022408o31m692rt	Tarua	tarua-union	286	2026-05-10 16:52:41.995	2026-05-10 16:52:41.995	t	তারুয়া	Tarua	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h09h006zdk8okhnlbohb	cmozwcvxc0021408or7329h6u	Monionda	monionda-union	287	2026-05-10 16:52:42.005	2026-05-10 16:52:42.005	t	মনিয়ন্দ	Monionda	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h09q0070dk8ojcfh24mu	cmozwcvxc0021408or7329h6u	Dharkhar	dharkhar-union	288	2026-05-10 16:52:42.014	2026-05-10 16:52:42.014	t	ধরখার	Dharkhar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0a00071dk8on2cu2vpb	cmozwcvxc0021408or7329h6u	Mogra	mogra-union-1	289	2026-05-10 16:52:42.024	2026-05-10 16:52:42.024	t	মোগড়া	Mogra	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0a90072dk8och11to4c	cmozwcvxc0021408or7329h6u	Akhauran	akhauran-union	290	2026-05-10 16:52:42.033	2026-05-10 16:52:42.033	t	আখাউড়া (উঃ)	Akhauran	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0aj0073dk8ourkjfbxy	cmozwcvxc0021408or7329h6u	Akhauras	akhauras-union	291	2026-05-10 16:52:42.043	2026-05-10 16:52:42.043	t	আখাউড়া (দঃ)	Akhauras	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0at0074dk8o2d0gk8h5	cmozwcvyp0027408ohnhab8j7	Barail	barail-union	292	2026-05-10 16:52:42.053	2026-05-10 16:52:42.053	t	বড়াইল	Barail	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0b20075dk8osuy8g7i6	cmozwcvyp0027408ohnhab8j7	Birgaon	birgaon-union	293	2026-05-10 16:52:42.062	2026-05-10 16:52:42.062	t	বীরগাঁও	Birgaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0bd0076dk8ot1bplmp2	cmozwcvyp0027408ohnhab8j7	Krishnanagar	krishnanagar-union-2	294	2026-05-10 16:52:42.073	2026-05-10 16:52:42.073	t	কৃষ্ণনগর	Krishnanagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0bn0077dk8oasw0zz7p	cmozwcvyp0027408ohnhab8j7	Nathghar	nathghar-union	295	2026-05-10 16:52:42.083	2026-05-10 16:52:42.083	t	নাটঘর	Nathghar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0bw0078dk8oqh5yzxq2	cmozwcvyp0027408ohnhab8j7	Biddayakut	biddayakut-union	296	2026-05-10 16:52:42.092	2026-05-10 16:52:42.092	t	বিদ্যাকুট	Biddayakut	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0c50079dk8o9abb73uc	cmozwcvyp0027408ohnhab8j7	Nabinagare	nabinagare-union	297	2026-05-10 16:52:42.102	2026-05-10 16:52:42.102	t	নবীনগর (পূর্ব)	Nabinagare	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0cg007adk8o3b336yn5	cmozwcvyp0027408ohnhab8j7	Nabinagarw	nabinagarw-union	298	2026-05-10 16:52:42.112	2026-05-10 16:52:42.112	t	নবীনগর(পশ্চিম)	Nabinagarw	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0cp007bdk8oon8r9mxk	cmozwcvyp0027408ohnhab8j7	Bitghar	bitghar-union	299	2026-05-10 16:52:42.121	2026-05-10 16:52:42.121	t	বিটঘর	Bitghar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0d3007cdk8ow8b2k1nt	cmozwcvyp0027408ohnhab8j7	Shibpur	shibpur-union-5	300	2026-05-10 16:52:42.135	2026-05-10 16:52:42.135	t	শিবপুর	Shibpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0de007ddk8ob783hj0s	cmozwcvyp0027408ohnhab8j7	Sreerampur	sreerampur-union-2	301	2026-05-10 16:52:42.146	2026-05-10 16:52:42.146	t	শ্রীরামপুর	Sreerampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0do007edk8obf7mg4u6	cmozwcvyp0027408ohnhab8j7	Jinudpur	jinudpur-union	302	2026-05-10 16:52:42.156	2026-05-10 16:52:42.156	t	জিনোদপুর	Jinudpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0dx007fdk8o1jzq1of9	cmozwcvyp0027408ohnhab8j7	Laurfatehpur	laurfatehpur-union	303	2026-05-10 16:52:42.165	2026-05-10 16:52:42.165	t	লাউরফতেপুর	Laurfatehpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0e7007gdk8o2gjom91b	cmozwcvyp0027408ohnhab8j7	Ibrahimpur	ibrahimpur-union	304	2026-05-10 16:52:42.176	2026-05-10 16:52:42.176	t	ইব্রাহিমপুর	Ibrahimpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0eh007hdk8onhtpr0e1	cmozwcvyp0027408ohnhab8j7	Satmura	satmura-union	305	2026-05-10 16:52:42.185	2026-05-10 16:52:42.185	t	সাতমোড়া	Satmura	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0eq007idk8o4zzmyfsf	cmozwcvyp0027408ohnhab8j7	Shamogram	shamogram-union	306	2026-05-10 16:52:42.194	2026-05-10 16:52:42.194	t	শ্যামগ্রাম	Shamogram	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0ez007jdk8o8b2vk6ji	cmozwcvyp0027408ohnhab8j7	Rasullabad	rasullabad-union	307	2026-05-10 16:52:42.203	2026-05-10 16:52:42.203	t	রসুল্লাবাদ	Rasullabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0f8007kdk8oavnwk331	cmozwcvyp0027408ohnhab8j7	Barikandi	barikandi-union	308	2026-05-10 16:52:42.212	2026-05-10 16:52:42.212	t	বড়িকান্দি	Barikandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0fh007ldk8o4pyq5q93	cmozwcvyp0027408ohnhab8j7	Salimganj	salimganj-union	309	2026-05-10 16:52:42.221	2026-05-10 16:52:42.221	t	ছলিমগঞ্জ	Salimganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0fr007mdk8ojmj923yg	cmozwcvyp0027408ohnhab8j7	Ratanpur	ratanpur-union-1	310	2026-05-10 16:52:42.231	2026-05-10 16:52:42.231	t	রতনপুর	Ratanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0g0007ndk8o4u550ruo	cmozwcvyp0027408ohnhab8j7	Kaitala (North)	kaitala-north-union	311	2026-05-10 16:52:42.24	2026-05-10 16:52:42.24	t	কাইতলা (উত্তর)	Kaitala (North)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0ga007odk8oyfhai2kp	cmozwcvyp0027408ohnhab8j7	Kaitala (South)	kaitala-south-union	312	2026-05-10 16:52:42.25	2026-05-10 16:52:42.25	t	কাইতলা (দক্ষিন)	Kaitala (South)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0gj007pdk8o1e2mzr7m	cmozwcvy00024408okchdszxm	Bhudanty	bhudanty-union	326	2026-05-10 16:52:42.259	2026-05-10 16:52:42.259	t	বুধন্তি	Bhudanty	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0gs007qdk8o9w1a064l	cmozwcvy00024408okchdszxm	Chandura	chandura-union	327	2026-05-10 16:52:42.268	2026-05-10 16:52:42.268	t	চান্দুরা	Chandura	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0h2007rdk8o6dzeic7o	cmozwcvy00024408okchdszxm	Ichapura	ichapura-union	328	2026-05-10 16:52:42.278	2026-05-10 16:52:42.278	t	ইছাপুরা	Ichapura	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0hb007sdk8ovguw2fh5	cmozwcvy00024408okchdszxm	Champaknagar	champaknagar-union	329	2026-05-10 16:52:42.287	2026-05-10 16:52:42.287	t	চম্পকনগর	Champaknagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0hj007tdk8ojc0x75pu	cmozwcvy00024408okchdszxm	Harashpur	harashpur-union	330	2026-05-10 16:52:42.295	2026-05-10 16:52:42.295	t	হরষপুর	Harashpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0hs007udk8onob0oi46	cmozwcvy00024408okchdszxm	Pattan	pattan-union	331	2026-05-10 16:52:42.304	2026-05-10 16:52:42.304	t	পত্তন	Pattan	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0i1007vdk8o0n11aynf	cmozwcvy00024408okchdszxm	Singerbil	singerbil-union	332	2026-05-10 16:52:42.313	2026-05-10 16:52:42.313	t	সিংগারবিল	Singerbil	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0ia007wdk8olwzjetm5	cmozwcvy00024408okchdszxm	Bishupor	bishupor-union	333	2026-05-10 16:52:42.322	2026-05-10 16:52:42.322	t	বিষ্ণুপুর	Bishupor	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0ik007xdk8o7nrp8wd4	cmozwcvy00024408okchdszxm	Charislampur	charislampur-union	334	2026-05-10 16:52:42.332	2026-05-10 16:52:42.332	t	চর-ইসলামপুর	Charislampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0iw007ydk8ocdtw9ag2	cmozwcvy00024408okchdszxm	Paharpur	paharpur-union-1	335	2026-05-10 16:52:42.344	2026-05-10 16:52:42.344	t	পাহাড়পুর	Paharpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0j5007zdk8ozb7lf863	cmozwcwge004p408o9dgcv92o	Jibtali	jibtali-union	336	2026-05-10 16:52:42.353	2026-05-10 16:52:42.353	t	জীবতলি	Jibtali	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0je0080dk8ocg5a2dfs	cmozwcwge004p408o9dgcv92o	Sapchari	sapchari-union	337	2026-05-10 16:52:42.362	2026-05-10 16:52:42.362	t	সাপছড়ি	Sapchari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0jo0081dk8oy4yudt0k	cmozwcwge004p408o9dgcv92o	Kutukchari	kutukchari-union	338	2026-05-10 16:52:42.372	2026-05-10 16:52:42.372	t	কুতুকছড়ি	Kutukchari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0jy0082dk8oqopbn50t	cmozwcwge004p408o9dgcv92o	Bandukbhanga	bandukbhanga-union	339	2026-05-10 16:52:42.382	2026-05-10 16:52:42.382	t	বন্দুকভাঙ্গা	Bandukbhanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0k70083dk8o8vg5ccj7	cmozwcwge004p408o9dgcv92o	Balukhali	balukhali-union	340	2026-05-10 16:52:42.391	2026-05-10 16:52:42.391	t	বালুখালী	Balukhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0kh0084dk8oi5uctt4y	cmozwcwge004p408o9dgcv92o	Mogban	mogban-union	341	2026-05-10 16:52:42.401	2026-05-10 16:52:42.401	t	মগবান	Mogban	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0kq0085dk8o0dbuuk00	cmozwcwfi004k408oxmnj068b	Raikhali	raikhali-union	342	2026-05-10 16:52:42.41	2026-05-10 16:52:42.41	t	রাইখালী	Raikhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0kz0086dk8o9vl635qj	cmozwcwfi004k408oxmnj068b	Kaptai	kaptai-union	343	2026-05-10 16:52:42.419	2026-05-10 16:52:42.419	t	কাপ্তাই	Kaptai	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0l80087dk8odzmf28e9	cmozwcwfi004k408oxmnj068b	Wagga	wagga-union	344	2026-05-10 16:52:42.428	2026-05-10 16:52:42.428	t	ওয়াজ্ঞা	Wagga	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0li0088dk8oslw3uo68	cmozwcwfi004k408oxmnj068b	Chandraghona	chandraghona-union	345	2026-05-10 16:52:42.438	2026-05-10 16:52:42.438	t	চন্দ্রঘোনা	Chandraghona	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0ls0089dk8o96d6hjgq	cmozwcwfi004k408oxmnj068b	Chitmorom	chitmorom-union	346	2026-05-10 16:52:42.448	2026-05-10 16:52:42.448	t	চিৎমরম	Chitmorom	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0m2008adk8otsq9bjn4	cmozwcwfp004l408oval4p47c	Ghagra	ghagra-union-1	347	2026-05-10 16:52:42.458	2026-05-10 16:52:42.458	t	ঘাগড়া	Ghagra	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0mb008bdk8one054n07	cmozwcwfp004l408oval4p47c	Fatikchari	fatikchari-union	348	2026-05-10 16:52:42.467	2026-05-10 16:52:42.467	t	ফটিকছড়ি	Fatikchari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0mk008cdk8o71ssmdvm	cmozwcwfp004l408oval4p47c	Betbunia	betbunia-union	349	2026-05-10 16:52:42.476	2026-05-10 16:52:42.476	t	বেতবুনিয়া	Betbunia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0mt008ddk8owzhhpchn	cmozwcwfp004l408oval4p47c	Kalampati	kalampati-union	350	2026-05-10 16:52:42.485	2026-05-10 16:52:42.485	t	কলমপতি	Kalampati	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0n2008edk8obj0sdscp	cmozwcwey004h408ow9o35up2	Subalong	subalong-union	359	2026-05-10 16:52:42.494	2026-05-10 16:52:42.494	t	সুবলং	Subalong	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0nb008fdk8ok3154spy	cmozwcwey004h408ow9o35up2	Barkal	barkal-union	360	2026-05-10 16:52:42.503	2026-05-10 16:52:42.503	t	বরকল	Barkal	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0nk008gdk8oj8q41ye4	cmozwcwey004h408ow9o35up2	Bushanchara	bushanchara-union	361	2026-05-10 16:52:42.512	2026-05-10 16:52:42.512	t	ভূষনছড়া	Bushanchara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0nu008hdk8ouyst2dqm	cmozwcwey004h408ow9o35up2	Aimachara	aimachara-union	362	2026-05-10 16:52:42.522	2026-05-10 16:52:42.522	t	আইমাছড়া	Aimachara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0o3008idk8omfqvyhtj	cmozwcwey004h408ow9o35up2	Borohorina	borohorina-union	363	2026-05-10 16:52:42.531	2026-05-10 16:52:42.531	t	বড় হরিণা	Borohorina	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0od008jdk8o7dopq3ig	cmozwcwfv004m408oukoiryq5	Langad	langad-union	364	2026-05-10 16:52:42.541	2026-05-10 16:52:42.541	t	লংগদু	Langad	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0om008kdk8o9cic7tmx	cmozwcwfv004m408oukoiryq5	Maeinimukh	maeinimukh-union	365	2026-05-10 16:52:42.55	2026-05-10 16:52:42.55	t	মাইনীমুখ	Maeinimukh	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0ov008ldk8ok0heik1e	cmozwcwfv004m408oukoiryq5	Vasannadam	vasannadam-union	366	2026-05-10 16:52:42.559	2026-05-10 16:52:42.559	t	ভাসান্যাদম	Vasannadam	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0p5008mdk8ouz0misbu	cmozwcwfv004m408oukoiryq5	Bogachattar	bogachattar-union	367	2026-05-10 16:52:42.569	2026-05-10 16:52:42.569	t	বগাচতর	Bogachattar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0pe008ndk8o2r674f7d	cmozwcwfv004m408oukoiryq5	Gulshakhali	gulshakhali-union	368	2026-05-10 16:52:42.578	2026-05-10 16:52:42.578	t	গুলশাখালী	Gulshakhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0po008odk8ovakh5j6x	cmozwcwfv004m408oukoiryq5	Kalapakujja	kalapakujja-union	369	2026-05-10 16:52:42.588	2026-05-10 16:52:42.588	t	কালাপাকুজ্যা	Kalapakujja	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0py008pdk8ojyt99vo7	cmozwcwfv004m408oukoiryq5	Atarakchara	atarakchara-union	370	2026-05-10 16:52:42.598	2026-05-10 16:52:42.598	t	আটারকছড়া	Atarakchara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0q7008qdk8ow9lg6a1n	cmozwcwg8004o408ocp4toe3j	Ghilachari	ghilachari-union	371	2026-05-10 16:52:42.607	2026-05-10 16:52:42.607	t	ঘিলাছড়ি	Ghilachari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0qi008rdk8oowytx0ho	cmozwcwg8004o408ocp4toe3j	Gaindya	gaindya-union	372	2026-05-10 16:52:42.618	2026-05-10 16:52:42.618	t	গাইন্দ্যা	Gaindya	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0qs008sdk8otok91gqo	cmozwcwg8004o408ocp4toe3j	Bangalhalia	bangalhalia-union	373	2026-05-10 16:52:42.628	2026-05-10 16:52:42.628	t	বাঙ্গালহালিয়া	Bangalhalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0r3008tdk8o9fnvgxhm	cmozwcwg1004n408os46jw63e	Sabekkhong	sabekkhong-union	381	2026-05-10 16:52:42.639	2026-05-10 16:52:42.639	t	সাবেক্ষ্যং	Sabekkhong	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0rd008udk8o6p6zpple	cmozwcwg1004n408os46jw63e	Naniarchar	naniarchar-union	382	2026-05-10 16:52:42.649	2026-05-10 16:52:42.649	t	নানিয়ারচর	Naniarchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0rm008vdk8o7w8yrjev	cmozwcwg1004n408os46jw63e	Burighat	burighat-union	383	2026-05-10 16:52:42.658	2026-05-10 16:52:42.658	t	বুড়িঘাট	Burighat	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0rw008wdk8oh6k7g9gr	cmozwcwg1004n408os46jw63e	Ghilachhari	ghilachhari-union	384	2026-05-10 16:52:42.668	2026-05-10 16:52:42.668	t	ঘিলাছড়ি	Ghilachhari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0s6008xdk8oxbz1lory	cmozwcwdx004c408oqvkph7pk	Charmatua	charmatua-union	385	2026-05-10 16:52:42.678	2026-05-10 16:52:42.678	t	চরমটুয়া	Charmatua	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0sg008ydk8obe28fgf8	cmozwcwdx004c408oqvkph7pk	Dadpur	dadpur-union-1	386	2026-05-10 16:52:42.688	2026-05-10 16:52:42.688	t	দাদপুর	Dadpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0sr008zdk8orlwgi0zl	cmozwcwdx004c408oqvkph7pk	Noannoi	noannoi-union	387	2026-05-10 16:52:42.699	2026-05-10 16:52:42.699	t	নোয়ান্নই	Noannoi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0t10090dk8o97oz05t3	cmozwcwdx004c408oqvkph7pk	Kadirhanif	kadirhanif-union	388	2026-05-10 16:52:42.709	2026-05-10 16:52:42.709	t	কাদির হানিফ	Kadirhanif	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0td0091dk8o53o5y9ca	cmozwcwdx004c408oqvkph7pk	Binodpur	binodpur-union-2	389	2026-05-10 16:52:42.721	2026-05-10 16:52:42.721	t	বিনোদপুর	Binodpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0tn0092dk8o6vn5szdl	cmozwcwdx004c408oqvkph7pk	Dharmapur	dharmapur-union-1	390	2026-05-10 16:52:42.731	2026-05-10 16:52:42.731	t	ধর্মপুর	Dharmapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0tw0093dk8o5vva1n34	cmozwcwdx004c408oqvkph7pk	Aujbalia	aujbalia-union	391	2026-05-10 16:52:42.74	2026-05-10 16:52:42.74	t	এওজবালিয়া	Aujbalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0u50094dk8odgo7rkwn	cmozwcwdx004c408oqvkph7pk	Kaladara	kaladara-union	392	2026-05-10 16:52:42.749	2026-05-10 16:52:42.749	t	কালাদরপ	Kaladara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0uf0095dk8ojl1hg9is	cmozwcwdx004c408oqvkph7pk	Ashwadia	ashwadia-union	393	2026-05-10 16:52:42.759	2026-05-10 16:52:42.759	t	অশ্বদিয়া	Ashwadia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0uo0096dk8o72zpf6qh	cmozwcwdx004c408oqvkph7pk	Newajpur	newajpur-union	394	2026-05-10 16:52:42.768	2026-05-10 16:52:42.768	t	নিয়াজপুর	Newajpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0uw0097dk8ojdeyl4sn	cmozwcwdx004c408oqvkph7pk	East Charmatua	east-charmatua-union	395	2026-05-10 16:52:42.776	2026-05-10 16:52:42.776	t	পূর্ব চরমটুয়া	East Charmatua	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0v50098dk8oev6rx1mq	cmozwcwdx004c408oqvkph7pk	Andarchar	andarchar-union	396	2026-05-10 16:52:42.785	2026-05-10 16:52:42.785	t	আন্ডারচর	Andarchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0ve0099dk8oj0betob6	cmozwcwdx004c408oqvkph7pk	Noakhali	noakhali-union	397	2026-05-10 16:52:42.794	2026-05-10 16:52:42.794	t	নোয়াখালী	Noakhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0vn009adk8oyllh74ow	cmozwcwdc0049408o03ow1sf8	Sirajpur	sirajpur-union	398	2026-05-10 16:52:42.803	2026-05-10 16:52:42.803	t	সিরাজপুর	Sirajpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0vw009bdk8odnau60a2	cmozwcwdc0049408o03ow1sf8	Charparboti	charparboti-union	399	2026-05-10 16:52:42.812	2026-05-10 16:52:42.812	t	চরপার্বতী	Charparboti	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0w5009cdk8okgg57x7n	cmozwcwdc0049408o03ow1sf8	Charhazari	charhazari-union	400	2026-05-10 16:52:42.821	2026-05-10 16:52:42.821	t	চরহাজারী	Charhazari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0we009ddk8ou922rmsc	cmozwcwdc0049408o03ow1sf8	Charkakra	charkakra-union	401	2026-05-10 16:52:42.83	2026-05-10 16:52:42.83	t	চরকাঁকড়া	Charkakra	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0wm009edk8okqcq4e37	cmozwcwdc0049408o03ow1sf8	Charfakira	charfakira-union	402	2026-05-10 16:52:42.838	2026-05-10 16:52:42.838	t	চরফকিরা	Charfakira	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0wx009fdk8ownc4btoh	cmozwcwdc0049408o03ow1sf8	Musapur	musapur-union-2	403	2026-05-10 16:52:42.849	2026-05-10 16:52:42.849	t	মুসাপুর	Musapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0x6009gdk8o4xtohm5r	cmozwcwdc0049408o03ow1sf8	Charelahi	charelahi-union	404	2026-05-10 16:52:42.858	2026-05-10 16:52:42.858	t	চরএলাহী	Charelahi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0xi009hdk8ot1uu5ukl	cmozwcwdc0049408o03ow1sf8	Rampur	rampur-union-3	405	2026-05-10 16:52:42.87	2026-05-10 16:52:42.87	t	রামপুর	Rampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0xr009idk8oegtjl6gb	cmozwcwcy0047408oocoy54zz	Amanullapur	amanullapur-union	406	2026-05-10 16:52:42.879	2026-05-10 16:52:42.879	t	আমানউল্ল্যাপুর	Amanullapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0y5009jdk8o2cg2s8ol	cmozwcwcy0047408oocoy54zz	Gopalpur	gopalpur-union-5	407	2026-05-10 16:52:42.893	2026-05-10 16:52:42.893	t	গোপালপুর	Gopalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0ye009kdk8ofj6z6x6r	cmozwcwcy0047408oocoy54zz	Jirtali	jirtali-union	408	2026-05-10 16:52:42.902	2026-05-10 16:52:42.902	t	জিরতলী	Jirtali	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0yr009ldk8o9jn040yh	cmozwcwcy0047408oocoy54zz	Kutubpur	kutubpur-union-4	409	2026-05-10 16:52:42.916	2026-05-10 16:52:42.916	t	কুতবপুর	Kutubpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0z0009mdk8olkxu7uog	cmozwcwcy0047408oocoy54zz	Alyearpur	alyearpur-union	410	2026-05-10 16:52:42.924	2026-05-10 16:52:42.924	t	আলাইয়ারপুর	Alyearpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0z9009ndk8otj93he1y	cmozwcwcy0047408oocoy54zz	Chayani	chayani-union	411	2026-05-10 16:52:42.933	2026-05-10 16:52:42.933	t	ছয়ানী	Chayani	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0zk009odk8orpmjt2tw	cmozwcwcy0047408oocoy54zz	Rajganj	rajganj-union	412	2026-05-10 16:52:42.944	2026-05-10 16:52:42.944	t	রাজগঞ্জ	Rajganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h0zu009pdk8okzcyeg8f	cmozwcwcy0047408oocoy54zz	Eklashpur	eklashpur-union	413	2026-05-10 16:52:42.954	2026-05-10 16:52:42.954	t	একলাশপুর	Eklashpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h103009qdk8ols4ih9id	cmozwcwcy0047408oocoy54zz	Begumganj	begumganj-union	414	2026-05-10 16:52:42.963	2026-05-10 16:52:42.963	t	বেগমগঞ্জ	Begumganj	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h10d009rdk8oozjfceqk	cmozwcwcy0047408oocoy54zz	Mirwarishpur	mirwarishpur-union	415	2026-05-10 16:52:42.973	2026-05-10 16:52:42.973	t	মিরওয়ারিশপুর	Mirwarishpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h10m009sdk8o1gsgk0jf	cmozwcwcy0047408oocoy54zz	Narottampur	narottampur-union	416	2026-05-10 16:52:42.982	2026-05-10 16:52:42.982	t	নরোত্তমপুর	Narottampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h113009tdk8o9b2xas38	cmozwcwcy0047408oocoy54zz	Durgapur	durgapur-union-9	417	2026-05-10 16:52:42.999	2026-05-10 16:52:42.999	t	দূর্গাপুর	Durgapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h11h009udk8o5ex4829c	cmozwcwcy0047408oocoy54zz	Rasulpur	rasulpur-union-5	418	2026-05-10 16:52:43.013	2026-05-10 16:52:43.013	t	রসুলপুর	Rasulpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h11s009vdk8o0nv29xyp	cmozwcwcy0047408oocoy54zz	Hajipur	hajipur-union-2	419	2026-05-10 16:52:43.024	2026-05-10 16:52:43.024	t	হাজীপুর	Hajipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h123009wdk8o785lm72n	cmozwcwcy0047408oocoy54zz	Sharifpur	sharifpur-union-2	420	2026-05-10 16:52:43.035	2026-05-10 16:52:43.035	t	শরীফপুর	Sharifpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h12e009xdk8oq6ht8rfk	cmozwcwcy0047408oocoy54zz	Kadirpur	kadirpur-union-1	421	2026-05-10 16:52:43.046	2026-05-10 16:52:43.046	t	কাদিরপুর	Kadirpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h12o009ydk8o3y2z5x1x	cmozwcwek004f408ov4r0o6e1	Charjabbar	charjabbar-union	431	2026-05-10 16:52:43.056	2026-05-10 16:52:43.056	t	চরজাব্বার	Charjabbar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h12x009zdk8ollyaa8h5	cmozwcwek004f408ov4r0o6e1	Charbata	charbata-union	432	2026-05-10 16:52:43.065	2026-05-10 16:52:43.065	t	চরবাটা	Charbata	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h13700a0dk8orx79npm4	cmozwcwek004f408ov4r0o6e1	Charclerk	charclerk-union	433	2026-05-10 16:52:43.075	2026-05-10 16:52:43.075	t	চরক্লার্ক	Charclerk	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h13g00a1dk8omn4h2udi	cmozwcwek004f408ov4r0o6e1	Charwapda	charwapda-union	434	2026-05-10 16:52:43.084	2026-05-10 16:52:43.084	t	চরওয়াপদা	Charwapda	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h13p00a2dk8o8su2p1ac	cmozwcwek004f408ov4r0o6e1	Charjubilee	charjubilee-union	435	2026-05-10 16:52:43.093	2026-05-10 16:52:43.093	t	চরজুবলী	Charjubilee	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h20q00d5dk8olsnzx4m0	cmozwcwce0044408ort3fd7ux	Keora	keora-union	600	2026-05-10 16:52:44.282	2026-05-10 16:52:44.282	t	কেরোয়া	Keora	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h13z00a3dk8oghblawqx	cmozwcwek004f408ov4r0o6e1	Charaman Ullah	charaman-ullah-union	436	2026-05-10 16:52:43.103	2026-05-10 16:52:43.103	t	চরআমান উল্যা	Charaman Ullah	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h14900a4dk8oxe734uxu	cmozwcwek004f408ov4r0o6e1	East Charbata	east-charbata-union	437	2026-05-10 16:52:43.113	2026-05-10 16:52:43.113	t	পূর্ব চরবাটা	East Charbata	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h14n00a5dk8osayzkh0s	cmozwcwek004f408ov4r0o6e1	Mohammadpur	mohammadpur-union-4	438	2026-05-10 16:52:43.127	2026-05-10 16:52:43.127	t	মোহাম্মদপুর	Mohammadpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h14y00a6dk8o6t2dhiv9	cmozwcwdq004b408ojkxdy4ma	Narottampur	narottampur-union-1	439	2026-05-10 16:52:43.138	2026-05-10 16:52:43.138	t	নরোত্তমপুর	Narottampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h15800a7dk8o5wcujsdc	cmozwcwdq004b408ojkxdy4ma	Dhanshiri	dhanshiri-union	440	2026-05-10 16:52:43.148	2026-05-10 16:52:43.148	t	ধানসিঁড়ি	Dhanshiri	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h15h00a8dk8on0zybuis	cmozwcwdq004b408ojkxdy4ma	Sundalpur	sundalpur-union	441	2026-05-10 16:52:43.157	2026-05-10 16:52:43.157	t	সুন্দলপুর	Sundalpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h15t00a9dk8ol0a9ewwu	cmozwcwdq004b408ojkxdy4ma	Ghoshbag	ghoshbag-union	442	2026-05-10 16:52:43.169	2026-05-10 16:52:43.169	t	ঘোষবাগ	Ghoshbag	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h16200aadk8o1an96tuk	cmozwcwdq004b408ojkxdy4ma	Chaprashirhat	chaprashirhat-union	443	2026-05-10 16:52:43.178	2026-05-10 16:52:43.178	t	চাপরাশিরহাট	Chaprashirhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h16b00abdk8o91edtqh4	cmozwcwdq004b408ojkxdy4ma	Dhanshalik	dhanshalik-union	444	2026-05-10 16:52:43.187	2026-05-10 16:52:43.187	t	ধানশালিক	Dhanshalik	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h16l00acdk8ohoyat4sa	cmozwcwdq004b408ojkxdy4ma	Batoiya	batoiya-union	445	2026-05-10 16:52:43.197	2026-05-10 16:52:43.197	t	বাটইয়া	Batoiya	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h16v00addk8ozvn9hbrx	cmozwcwd50048408ozyeyytv2	Sahapur	sahapur-union-1	455	2026-05-10 16:52:43.207	2026-05-10 16:52:43.207	t	সাহাপুর	Sahapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h17400aedk8ojbk76tgq	cmozwcwd50048408ozyeyytv2	Ramnarayanpur	ramnarayanpur-union	456	2026-05-10 16:52:43.216	2026-05-10 16:52:43.216	t	রামনারায়নপুর	Ramnarayanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h17d00afdk8onoimgaps	cmozwcwd50048408ozyeyytv2	Porokote	porokote-union	457	2026-05-10 16:52:43.225	2026-05-10 16:52:43.225	t	পরকোট	Porokote	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h17m00agdk8og20qohsr	cmozwcwd50048408ozyeyytv2	Badalkot	badalkot-union	458	2026-05-10 16:52:43.234	2026-05-10 16:52:43.234	t	বাদলকোট	Badalkot	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h17y00ahdk8oqdfuww8o	cmozwcwd50048408ozyeyytv2	Panchgaon	panchgaon-union-2	459	2026-05-10 16:52:43.246	2026-05-10 16:52:43.246	t	পাঁচগাঁও	Panchgaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h18700aidk8o8u820lmw	cmozwcwd50048408ozyeyytv2	Hat-Pukuria Ghatlabag	hat-pukuria-ghatlabag-union	460	2026-05-10 16:52:43.255	2026-05-10 16:52:43.255	t	হাট-পুকুরিয়া ঘাটলাবাগ	Hat-Pukuria Ghatlabag	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h18g00ajdk8ol7s88048	cmozwcwd50048408ozyeyytv2	Noakhala	noakhala-union	461	2026-05-10 16:52:43.264	2026-05-10 16:52:43.264	t	নোয়াখলা	Noakhala	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h18o00akdk8obqv91dz5	cmozwcwd50048408ozyeyytv2	Khilpara	khilpara-union	462	2026-05-10 16:52:43.272	2026-05-10 16:52:43.272	t	খিলপাড়া	Khilpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h19200aldk8owhfn101l	cmozwcwd50048408ozyeyytv2	Mohammadpur	mohammadpur-union-5	463	2026-05-10 16:52:43.286	2026-05-10 16:52:43.286	t	মোহাম্মদপুর	Mohammadpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h19d00amdk8ouy2zssbw	cmozwcvzq002c408owvuircb3	Gazipur	gazipur-union-2	474	2026-05-10 16:52:43.297	2026-05-10 16:52:43.297	t	গাজীপুর	Gazipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h19m00andk8obwfd2uia	cmozwcvzq002c408owvuircb3	Algidurgapur (North)	algidurgapur-north-union	475	2026-05-10 16:52:43.306	2026-05-10 16:52:43.306	t	আলগী দুর্গাপুর (উত্তর)	Algidurgapur (North)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h19v00aodk8o36pkt694	cmozwcvzq002c408owvuircb3	Algidurgapur (South)	algidurgapur-south-union	476	2026-05-10 16:52:43.315	2026-05-10 16:52:43.315	t	আলগী দুর্গাপুর (দক্ষিণ)	Algidurgapur (South)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1a400apdk8o53kuyibn	cmozwcvzq002c408owvuircb3	Nilkamal	nilkamal-union	477	2026-05-10 16:52:43.324	2026-05-10 16:52:43.324	t	নীলকমল	Nilkamal	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1ac00aqdk8oug6xkl4e	cmozwcvzq002c408owvuircb3	Haimchar	haimchar-union	478	2026-05-10 16:52:43.332	2026-05-10 16:52:43.332	t	হাইমচর	Haimchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1al00ardk8o5txsj2i5	cmozwcvzq002c408owvuircb3	Charbhairabi	charbhairabi-union	479	2026-05-10 16:52:43.341	2026-05-10 16:52:43.341	t	চরভৈরবী	Charbhairabi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1au00asdk8ogf8y6yiu	cmozwcw05002e408ov15e2wti	Pathair	pathair-union	480	2026-05-10 16:52:43.35	2026-05-10 16:52:43.35	t	পাথৈর	Pathair	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1b300atdk8oy1d64yth	cmozwcw05002e408ov15e2wti	Bitara	bitara-union	481	2026-05-10 16:52:43.359	2026-05-10 16:52:43.359	t	বিতারা	Bitara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1bd00audk8olvxksfhy	cmozwcw05002e408ov15e2wti	Shohodebpur (East)	shohodebpur-east-union	482	2026-05-10 16:52:43.369	2026-05-10 16:52:43.369	t	সহদেবপুর (পূর্ব)	Shohodebpur (East)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1bm00avdk8odw1qcujr	cmozwcw05002e408ov15e2wti	Shohodebpur (West)	shohodebpur-west-union	483	2026-05-10 16:52:43.378	2026-05-10 16:52:43.378	t	সহদেবপুর (পশ্চিম)	Shohodebpur (West)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1bw00awdk8oeab56sb2	cmozwcw05002e408ov15e2wti	Kachua (North)	kachua-north-union	484	2026-05-10 16:52:43.388	2026-05-10 16:52:43.388	t	কচুয়া (উত্তর)	Kachua (North)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1c500axdk8oo8ya0aeu	cmozwcw05002e408ov15e2wti	Kachua (South)	kachua-south-union	485	2026-05-10 16:52:43.397	2026-05-10 16:52:43.397	t	কচুয়া (দক্ষিণ)	Kachua (South)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1cf00aydk8ozt5pjv86	cmozwcw05002e408ov15e2wti	Gohat (North)	gohat-north-union	486	2026-05-10 16:52:43.407	2026-05-10 16:52:43.407	t	গোহাট (উত্তর)	Gohat (North)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1cp00azdk8ojxkutymf	cmozwcw05002e408ov15e2wti	Kadla	kadla-union	487	2026-05-10 16:52:43.417	2026-05-10 16:52:43.417	t	কাদলা	Kadla	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1cz00b0dk8otljfvdc6	cmozwcw05002e408ov15e2wti	Ashrafpur	ashrafpur-union	488	2026-05-10 16:52:43.427	2026-05-10 16:52:43.427	t	আসরাফপুর	Ashrafpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1d900b1dk8oqr9hzuuk	cmozwcw05002e408ov15e2wti	Gohat (South)	gohat-south-union	489	2026-05-10 16:52:43.437	2026-05-10 16:52:43.437	t	গোহাট (দক্ষিণ)	Gohat (South)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1dj00b2dk8ocffxwkf4	cmozwcw05002e408ov15e2wti	Sachar	sachar-union	490	2026-05-10 16:52:43.447	2026-05-10 16:52:43.447	t	সাচার	Sachar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1dv00b3dk8ostrrtyx8	cmozwcw05002e408ov15e2wti	Koroia	koroia-union	491	2026-05-10 16:52:43.459	2026-05-10 16:52:43.459	t	কড়ইয়া	Koroia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1e800b4dk8ob8ll30m0	cmozwcw0r002h408o0fampbrj	Tamta (South)	tamta-south-union	492	2026-05-10 16:52:43.472	2026-05-10 16:52:43.472	t	টামটা (দক্ষিণ)	Tamta (South)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1ek00b5dk8o9eddf0ox	cmozwcw0r002h408o0fampbrj	Tamta (North)	tamta-north-union	493	2026-05-10 16:52:43.484	2026-05-10 16:52:43.484	t	টামটা (উত্তর)	Tamta (North)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1ev00b6dk8o75b31096	cmozwcw0r002h408o0fampbrj	Meher (North)	meher-north-union	494	2026-05-10 16:52:43.495	2026-05-10 16:52:43.495	t	মেহের (উত্তর)	Meher (North)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1f600b7dk8ocjxc7oov	cmozwcw0r002h408o0fampbrj	Meher (South)	meher-south-union	495	2026-05-10 16:52:43.506	2026-05-10 16:52:43.506	t	মেহের (দক্ষিণ)	Meher (South)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1fj00b8dk8o7122ygcp	cmozwcw0r002h408o0fampbrj	Suchipara (North)	suchipara-north-union	496	2026-05-10 16:52:43.519	2026-05-10 16:52:43.519	t	সুচিপাড়া (উত্তর)	Suchipara (North)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1fu00b9dk8obyxz6bmg	cmozwcw0r002h408o0fampbrj	Suchipara (South)	suchipara-south-union	497	2026-05-10 16:52:43.53	2026-05-10 16:52:43.53	t	সুচিপাড়া (দক্ষিণ)	Suchipara (South)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1g500badk8oafymrzg5	cmozwcw0r002h408o0fampbrj	Chitoshi (East)	chitoshi-east-union	498	2026-05-10 16:52:43.541	2026-05-10 16:52:43.541	t	চিতষী (পূর্ব)	Chitoshi (East)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1gh00bbdk8oa842uyew	cmozwcw0r002h408o0fampbrj	Raysree (South)	raysree-south-union	499	2026-05-10 16:52:43.553	2026-05-10 16:52:43.553	t	রায়শ্রী (দক্ষিন)	Raysree (South)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1gs00bcdk8ot2rxyktd	cmozwcw0r002h408o0fampbrj	Raysree (North)	raysree-north-union	500	2026-05-10 16:52:43.564	2026-05-10 16:52:43.564	t	রায়শ্রী (উত্তর)	Raysree (North)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1h400bddk8owsniwaeq	cmozwcw0r002h408o0fampbrj	Chitoshiwest	chitoshiwest-union	501	2026-05-10 16:52:43.576	2026-05-10 16:52:43.576	t	চিতষী (পশ্চিম)	Chitoshiwest	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1hj00bedk8o9rzeu2y6	cmozwcvza002a408oia2tb8kg	Bishnapur	bishnapur-union-1	502	2026-05-10 16:52:43.591	2026-05-10 16:52:43.591	t	বিষ্ণপুর	Bishnapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1hu00bfdk8owaophycn	cmozwcvza002a408oia2tb8kg	Ashikati	ashikati-union	503	2026-05-10 16:52:43.602	2026-05-10 16:52:43.602	t	আশিকাটি	Ashikati	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1i600bgdk8ol4fkcmw4	cmozwcvza002a408oia2tb8kg	Shahmahmudpur	shahmahmudpur-union	504	2026-05-10 16:52:43.614	2026-05-10 16:52:43.614	t	শাহ্‌ মাহমুদপুর	Shahmahmudpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1ii00bhdk8o4qly5ykp	cmozwcvza002a408oia2tb8kg	Kalyanpur	kalyanpur-union	505	2026-05-10 16:52:43.626	2026-05-10 16:52:43.626	t	কল্যাণপুর	Kalyanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1j100bidk8ovl0akzh9	cmozwcvza002a408oia2tb8kg	Rampur	rampur-union-4	506	2026-05-10 16:52:43.645	2026-05-10 16:52:43.645	t	রামপুর	Rampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1jd00bjdk8o27ecom13	cmozwcvza002a408oia2tb8kg	Maishadi	maishadi-union	507	2026-05-10 16:52:43.657	2026-05-10 16:52:43.657	t	মৈশাদী	Maishadi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1jr00bkdk8oimz1ymfw	cmozwcvza002a408oia2tb8kg	Tarpurchandi	tarpurchandi-union	508	2026-05-10 16:52:43.671	2026-05-10 16:52:43.671	t	তরপুচন্ডী	Tarpurchandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1k400bldk8o12c1rkug	cmozwcvza002a408oia2tb8kg	Baghadi	baghadi-union	509	2026-05-10 16:52:43.684	2026-05-10 16:52:43.684	t	বাগাদী	Baghadi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1kg00bmdk8oghh8h0yy	cmozwcvza002a408oia2tb8kg	Laxmipur Model	laxmipur-model-union	510	2026-05-10 16:52:43.696	2026-05-10 16:52:43.696	t	লক্ষীপুর মডেল	Laxmipur Model	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1kt00bndk8omtbn5xzl	cmozwcvza002a408oia2tb8kg	Hanarchar	hanarchar-union	511	2026-05-10 16:52:43.709	2026-05-10 16:52:43.709	t	হানারচর	Hanarchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1l500bodk8oi84xyjc3	cmozwcvza002a408oia2tb8kg	Chandra	chandra-union-1	512	2026-05-10 16:52:43.722	2026-05-10 16:52:43.722	t	চান্দ্রা	Chandra	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1lh00bpdk8oei2vfexw	cmozwcvza002a408oia2tb8kg	Rajrajeshwar	rajrajeshwar-union	513	2026-05-10 16:52:43.733	2026-05-10 16:52:43.733	t	রাজরাজেশ্বর	Rajrajeshwar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1lu00bqdk8o9uqahpwr	cmozwcvza002a408oia2tb8kg	Ibrahimpur	ibrahimpur-union-1	514	2026-05-10 16:52:43.746	2026-05-10 16:52:43.746	t	ইব্রাহীমপুর	Ibrahimpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1m800brdk8o9je266vv	cmozwcvza002a408oia2tb8kg	Balia	balia-union-2	515	2026-05-10 16:52:43.761	2026-05-10 16:52:43.761	t	বালিয়া	Balia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1mm00bsdk8o6lzrlj1y	cmozwcvzy002d408on6z9a3kv	Rajargaon (North)	rajargaon-north-union	522	2026-05-10 16:52:43.774	2026-05-10 16:52:43.774	t	রাজারগাঁও (উত্তর)	Rajargaon (North)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1mx00btdk8osbde1q7g	cmozwcvzy002d408on6z9a3kv	Bakila	bakila-union	523	2026-05-10 16:52:43.785	2026-05-10 16:52:43.785	t	বাকিলা	Bakila	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1n500budk8o244lvdx5	cmozwcvzy002d408on6z9a3kv	Kalocho (North)	kalocho-north-union	524	2026-05-10 16:52:43.794	2026-05-10 16:52:43.794	t	কালচোঁ (উত্তর)	Kalocho (North)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1ne00bvdk8ocspcrxc1	cmozwcvzy002d408on6z9a3kv	Hajiganj Sadar	hajiganj-sadar-union	525	2026-05-10 16:52:43.802	2026-05-10 16:52:43.802	t	হাজীগঞ্জ সদর	Hajiganj Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1nn00bwdk8oc6fcn1uc	cmozwcvzy002d408on6z9a3kv	Kalocho (South)	kalocho-south-union	526	2026-05-10 16:52:43.811	2026-05-10 16:52:43.811	t	কালচোঁ (দক্ষিণ)	Kalocho (South)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1nv00bxdk8ozzo7is0m	cmozwcvzy002d408on6z9a3kv	Barkul (East)	barkul-east-union	527	2026-05-10 16:52:43.819	2026-05-10 16:52:43.819	t	বড়কুল (পূর্ব)	Barkul (East)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1o300bydk8oo4v9yomq	cmozwcvzy002d408on6z9a3kv	Barkul (West)	barkul-west-union	528	2026-05-10 16:52:43.827	2026-05-10 16:52:43.827	t	বড়কুল (পশ্চিম)	Barkul (West)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1oc00bzdk8o1tblhqbg	cmozwcvzy002d408on6z9a3kv	Hatila (East)	hatila-east-union	529	2026-05-10 16:52:43.836	2026-05-10 16:52:43.836	t	হাটিলা (পূর্ব)	Hatila (East)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1oo00c0dk8or51i1595	cmozwcvzy002d408on6z9a3kv	Hatila (West)	hatila-west-union	530	2026-05-10 16:52:43.848	2026-05-10 16:52:43.848	t	হাটিলা (পশ্চিম)	Hatila (West)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1oz00c1dk8oru8p3zy4	cmozwcvzy002d408on6z9a3kv	Gandharbapur (North)	gandharbapur-north-union	531	2026-05-10 16:52:43.86	2026-05-10 16:52:43.86	t	গন্ধর্ব্যপুর (উত্তর)	Gandharbapur (North)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1pb00c2dk8ol86buhwz	cmozwcvzy002d408on6z9a3kv	Gandharbapur (South)	gandharbapur-south-union	532	2026-05-10 16:52:43.871	2026-05-10 16:52:43.871	t	গন্ধর্ব্যপুর (দক্ষিণ)	Gandharbapur (South)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h20z00d6dk8oeq73h0q5	cmozwcwcr0046408o8p0sl2i2	Char Poragacha	char-poragacha-union	601	2026-05-10 16:52:44.291	2026-05-10 16:52:44.291	t	চর পোড়াগাছা	Char Poragacha	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1pm00c3dk8oxa1xmdjw	cmozwcwc70043408ohap9tq2x	Hamsadi (North)	hamsadi-north-union	562	2026-05-10 16:52:43.882	2026-05-10 16:52:43.882	t	হামছাদী (উত্তর)	Hamsadi (North)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1px00c4dk8oxbp79l8g	cmozwcwc70043408ohap9tq2x	Hamsadi (South)	hamsadi-south-union	563	2026-05-10 16:52:43.893	2026-05-10 16:52:43.893	t	হামছাদী (দক্ষিন)	Hamsadi (South)	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1q700c5dk8olcrudxrp	cmozwcwc70043408ohap9tq2x	Dalalbazar	dalalbazar-union	564	2026-05-10 16:52:43.903	2026-05-10 16:52:43.903	t	দালাল বাজার	Dalalbazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1qi00c6dk8oiw9bulzp	cmozwcwc70043408ohap9tq2x	Charruhita	charruhita-union	565	2026-05-10 16:52:43.914	2026-05-10 16:52:43.914	t	চররুহিতা	Charruhita	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1qr00c7dk8o6oomqef7	cmozwcwc70043408ohap9tq2x	Parbotinagar	parbotinagar-union	566	2026-05-10 16:52:43.923	2026-05-10 16:52:43.923	t	পার্বতীনগর	Parbotinagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1r100c8dk8oaua72qxb	cmozwcwc70043408ohap9tq2x	Bangakha	bangakha-union	567	2026-05-10 16:52:43.933	2026-05-10 16:52:43.933	t	বাঙ্গাখাঁ	Bangakha	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1ra00c9dk8ok8mo5buz	cmozwcwc70043408ohap9tq2x	Dattapara	dattapara-union-1	568	2026-05-10 16:52:43.943	2026-05-10 16:52:43.943	t	দত্তপাড়া	Dattapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1rl00cadk8o9nnu16kk	cmozwcwc70043408ohap9tq2x	Basikpur	basikpur-union	569	2026-05-10 16:52:43.953	2026-05-10 16:52:43.953	t	বশিকপুর	Basikpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1rv00cbdk8ok6tcya6c	cmozwcwc70043408ohap9tq2x	Chandrogonj	chandrogonj-union	570	2026-05-10 16:52:43.963	2026-05-10 16:52:43.963	t	চন্দ্রগঞ্জ	Chandrogonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1s600ccdk8os1wdf2kr	cmozwcwc70043408ohap9tq2x	Nourthjoypur	nourthjoypur-union	571	2026-05-10 16:52:43.974	2026-05-10 16:52:43.974	t	উত্তর জয়পুর	Nourthjoypur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1sg00cddk8ohg2nery4	cmozwcwc70043408ohap9tq2x	Hazirpara	hazirpara-union	572	2026-05-10 16:52:43.984	2026-05-10 16:52:43.984	t	হাজিরপাড়া	Hazirpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1sr00cedk8o9r8pkviq	cmozwcwc70043408ohap9tq2x	Charshahi	charshahi-union	573	2026-05-10 16:52:43.995	2026-05-10 16:52:43.995	t	চরশাহী	Charshahi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1t300cfdk8oblbga6w3	cmozwcwc70043408ohap9tq2x	Digli	digli-union	574	2026-05-10 16:52:44.007	2026-05-10 16:52:44.007	t	দিঘলী	Digli	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1te00cgdk8olahfgf6s	cmozwcwc70043408ohap9tq2x	Laharkandi	laharkandi-union	575	2026-05-10 16:52:44.018	2026-05-10 16:52:44.018	t	লাহারকান্দি	Laharkandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1to00chdk8oxjpmw8wf	cmozwcwc70043408ohap9tq2x	Vobanigonj	vobanigonj-union	576	2026-05-10 16:52:44.028	2026-05-10 16:52:44.028	t	ভবানীগঞ্জ	Vobanigonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1tz00cidk8ojsvtkf04	cmozwcwc70043408ohap9tq2x	Kusakhali	kusakhali-union	577	2026-05-10 16:52:44.039	2026-05-10 16:52:44.039	t	কুশাখালী	Kusakhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1u900cjdk8o3tcorvhc	cmozwcwc70043408ohap9tq2x	Sakchor	sakchor-union	578	2026-05-10 16:52:44.049	2026-05-10 16:52:44.049	t	শাকচর	Sakchor	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1ul00ckdk8oehfdf5zu	cmozwcwc70043408ohap9tq2x	Tearigonj	tearigonj-union	579	2026-05-10 16:52:44.061	2026-05-10 16:52:44.061	t	তেয়ারীগঞ্জ	Tearigonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1ux00cldk8o1z1qnn30	cmozwcwc70043408ohap9tq2x	Tumchor	tumchor-union	580	2026-05-10 16:52:44.073	2026-05-10 16:52:44.073	t	টুমচর	Tumchor	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1v800cmdk8o9fav2i7s	cmozwcwc70043408ohap9tq2x	Charramoni Mohon	charramoni-mohon-union	581	2026-05-10 16:52:44.084	2026-05-10 16:52:44.084	t	চররমনী মোহন	Charramoni Mohon	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1vj00cndk8ovptgeatd	cmozwcwc00042408of07ukkcu	Charkalkini	charkalkini-union	582	2026-05-10 16:52:44.095	2026-05-10 16:52:44.095	t	চর কালকিনি	Charkalkini	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1vv00codk8onproi0nc	cmozwcwc00042408of07ukkcu	Shaheberhat	shaheberhat-union	583	2026-05-10 16:52:44.107	2026-05-10 16:52:44.107	t	সাহেবেরহাট	Shaheberhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1w600cpdk8o40h5r6st	cmozwcwc00042408of07ukkcu	Char Martin	char-martin-union	584	2026-05-10 16:52:44.118	2026-05-10 16:52:44.118	t	চর মার্টিন	Char Martin	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1wi00cqdk8ox0bn1uqd	cmozwcwc00042408of07ukkcu	Char Folcon	char-folcon-union	585	2026-05-10 16:52:44.13	2026-05-10 16:52:44.13	t	চর ফলকন	Char Folcon	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1ws00crdk8osn75b5x7	cmozwcwc00042408of07ukkcu	Patarirhat	patarirhat-union	586	2026-05-10 16:52:44.14	2026-05-10 16:52:44.14	t	পাটারীরহাট	Patarirhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1x300csdk8ozmdjjwww	cmozwcwc00042408of07ukkcu	Hajirhat	hajirhat-union	587	2026-05-10 16:52:44.151	2026-05-10 16:52:44.151	t	হাজিরহাট	Hajirhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1xe00ctdk8ota19qocz	cmozwcwc00042408of07ukkcu	Char Kadira	char-kadira-union	588	2026-05-10 16:52:44.162	2026-05-10 16:52:44.162	t	চর কাদিরা	Char Kadira	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1xp00cudk8o3ap47iht	cmozwcwc00042408of07ukkcu	Torabgonj	torabgonj-union	589	2026-05-10 16:52:44.173	2026-05-10 16:52:44.173	t	তোরাবগঞ্জ	Torabgonj	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1xz00cvdk8o2fzzdf1e	cmozwcwc00042408of07ukkcu	Charlorench	charlorench-union	590	2026-05-10 16:52:44.183	2026-05-10 16:52:44.183	t	চর লরেঞ্চ	Charlorench	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1yb00cwdk8oet57rmr4	cmozwcwce0044408ort3fd7ux	North Char Ababil	north-char-ababil-union	591	2026-05-10 16:52:44.195	2026-05-10 16:52:44.195	t	উত্তর চর আবাবিল	North Char Ababil	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1ym00cxdk8o147p07c8	cmozwcwce0044408ort3fd7ux	North Char Bangshi	north-char-bangshi-union	592	2026-05-10 16:52:44.206	2026-05-10 16:52:44.206	t	উত্তর চর বংশী	North Char Bangshi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1yw00cydk8ot2abhl2o	cmozwcwce0044408ort3fd7ux	Char Mohana	char-mohana-union	593	2026-05-10 16:52:44.216	2026-05-10 16:52:44.216	t	চর মোহনা	Char Mohana	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1z700czdk8oy0mke73w	cmozwcwce0044408ort3fd7ux	Sonapur	sonapur-union-2	594	2026-05-10 16:52:44.227	2026-05-10 16:52:44.227	t	সোনাপুর	Sonapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1zg00d0dk8o056mq98h	cmozwcwce0044408ort3fd7ux	Charpata	charpata-union	595	2026-05-10 16:52:44.236	2026-05-10 16:52:44.236	t	চর পাতা	Charpata	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1zp00d1dk8o0omacapu	cmozwcwce0044408ort3fd7ux	Bamni	bamni-union	596	2026-05-10 16:52:44.245	2026-05-10 16:52:44.245	t	বামনী	Bamni	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h1zy00d2dk8oaijfshz5	cmozwcwce0044408ort3fd7ux	South Char Bangshi	south-char-bangshi-union	597	2026-05-10 16:52:44.254	2026-05-10 16:52:44.254	t	দক্ষিন চর বংশী	South Char Bangshi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h20700d3dk8o5wuzlkj4	cmozwcwce0044408ort3fd7ux	South Char Ababil	south-char-ababil-union	598	2026-05-10 16:52:44.263	2026-05-10 16:52:44.263	t	দক্ষিন চর আবাবিল	South Char Ababil	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h21700d7dk8ot2ecd3uy	cmozwcwcr0046408o8p0sl2i2	Charbadam	charbadam-union	602	2026-05-10 16:52:44.299	2026-05-10 16:52:44.299	t	চর বাদাম	Charbadam	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h21g00d8dk8oubttgyu8	cmozwcwcr0046408o8p0sl2i2	Char Abdullah	char-abdullah-union	603	2026-05-10 16:52:44.308	2026-05-10 16:52:44.308	t	চর আবদুল্যাহ	Char Abdullah	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h21p00d9dk8ovn7lltz3	cmozwcwcr0046408o8p0sl2i2	Alxendar	alxendar-union	604	2026-05-10 16:52:44.317	2026-05-10 16:52:44.317	t	আলেকজান্ডার	Alxendar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h21y00dadk8oecetpm6x	cmozwcwcr0046408o8p0sl2i2	Char Algi	char-algi-union	605	2026-05-10 16:52:44.326	2026-05-10 16:52:44.326	t	চর আলগী	Char Algi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h22800dbdk8o554su6ag	cmozwcwcr0046408o8p0sl2i2	Char Ramiz	char-ramiz-union	606	2026-05-10 16:52:44.336	2026-05-10 16:52:44.336	t	চর রমিজ	Char Ramiz	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h22g00dcdk8o5m1omzgm	cmozwcwcr0046408o8p0sl2i2	Borokheri	borokheri-union	607	2026-05-10 16:52:44.344	2026-05-10 16:52:44.344	t	বড়খেড়ী	Borokheri	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h22r00dddk8o9dgknfq2	cmozwcwcr0046408o8p0sl2i2	Chargazi	chargazi-union	608	2026-05-10 16:52:44.355	2026-05-10 16:52:44.355	t	চরগাজী	Chargazi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h23200dedk8ofjys82ru	cmozwcwcl0045408os4f46oas	Kanchanpur	kanchanpur-union-2	609	2026-05-10 16:52:44.366	2026-05-10 16:52:44.366	t	কাঞ্চনপুর	Kanchanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h23b00dfdk8obmx9f3n2	cmozwcwcl0045408os4f46oas	Noagaon	noagaon-union-1	610	2026-05-10 16:52:44.375	2026-05-10 16:52:44.375	t	নোয়াগাঁও	Noagaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h23l00dgdk8o8zz1hzxp	cmozwcwcl0045408os4f46oas	Bhadur	bhadur-union	611	2026-05-10 16:52:44.385	2026-05-10 16:52:44.385	t	ভাদুর	Bhadur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h23u00dhdk8opetcxhob	cmozwcwcl0045408os4f46oas	Ichhapur	ichhapur-union	612	2026-05-10 16:52:44.394	2026-05-10 16:52:44.394	t	ইছাপুর	Ichhapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h24600didk8onj0zsq3u	cmozwcwcl0045408os4f46oas	Chandipur	chandipur-union-3	613	2026-05-10 16:52:44.406	2026-05-10 16:52:44.406	t	চন্ডিপুর	Chandipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h24e00djdk8ozfmsg8xq	cmozwcwcl0045408os4f46oas	Lamchar	lamchar-union	614	2026-05-10 16:52:44.414	2026-05-10 16:52:44.414	t	লামচর	Lamchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h24n00dkdk8o6zufwfbu	cmozwcwcl0045408os4f46oas	Darbeshpur	darbeshpur-union	615	2026-05-10 16:52:44.423	2026-05-10 16:52:44.423	t	দরবেশপুর	Darbeshpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h24x00dldk8ovvc87zom	cmozwcwcl0045408os4f46oas	Karpara	karpara-union-1	616	2026-05-10 16:52:44.433	2026-05-10 16:52:44.433	t	করপাড়া	Karpara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h25500dmdk8ot07mmcn6	cmozwcwcl0045408os4f46oas	Bholakot	bholakot-union	617	2026-05-10 16:52:44.441	2026-05-10 16:52:44.441	t	ভোলাকোট	Bholakot	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h25e00dndk8o7f8vmj62	cmozwcwcl0045408os4f46oas	Bhatra	bhatra-union	618	2026-05-10 16:52:44.45	2026-05-10 16:52:44.45	t	ভাটরা	Bhatra	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h25p00dodk8od4uvui9a	cmozwcw35002s408ou637b00w	Rajanagar	rajanagar-union-2	619	2026-05-10 16:52:44.461	2026-05-10 16:52:44.461	t	রাজানগর	Rajanagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h25z00dpdk8ofa21l4rf	cmozwcw35002s408ou637b00w	Hosnabad	hosnabad-union-1	620	2026-05-10 16:52:44.471	2026-05-10 16:52:44.471	t	হোছনাবাদ	Hosnabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h26800dqdk8o5a0aufau	cmozwcw35002s408ou637b00w	Swanirbor Rangunia	swanirbor-rangunia-union	621	2026-05-10 16:52:44.48	2026-05-10 16:52:44.48	t	স্বনির্ভর রাঙ্গুনিয়া	Swanirbor Rangunia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h26h00drdk8ojh1b3yv7	cmozwcw35002s408ou637b00w	Mariumnagar	mariumnagar-union	622	2026-05-10 16:52:44.489	2026-05-10 16:52:44.489	t	মরিয়মনগর	Mariumnagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h26r00dsdk8ofigmewlw	cmozwcw35002s408ou637b00w	Parua	parua-union	623	2026-05-10 16:52:44.499	2026-05-10 16:52:44.499	t	পারুয়া	Parua	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h27000dtdk8oyq51ki4d	cmozwcw35002s408ou637b00w	Pomra	pomra-union	624	2026-05-10 16:52:44.508	2026-05-10 16:52:44.508	t	পোমরা	Pomra	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h27a00dudk8ot6kq6qgt	cmozwcw35002s408ou637b00w	Betagi	betagi-union-1	625	2026-05-10 16:52:44.518	2026-05-10 16:52:44.518	t	বেতাগী	Betagi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h27i00dvdk8oqigmupbo	cmozwcw35002s408ou637b00w	Sharafbhata	sharafbhata-union	626	2026-05-10 16:52:44.526	2026-05-10 16:52:44.526	t	সরফভাটা	Sharafbhata	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h27r00dwdk8ojl7hkax2	cmozwcw35002s408ou637b00w	Shilok	shilok-union	627	2026-05-10 16:52:44.535	2026-05-10 16:52:44.535	t	শিলক	Shilok	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h28000dxdk8onzisu5bt	cmozwcw35002s408ou637b00w	Chandraghona	chandraghona-union-1	628	2026-05-10 16:52:44.544	2026-05-10 16:52:44.544	t	চন্দ্রঘোনা	Chandraghona	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h28900dydk8ovktm4bdq	cmozwcw35002s408ou637b00w	Kodala	kodala-union	629	2026-05-10 16:52:44.553	2026-05-10 16:52:44.553	t	কোদালা	Kodala	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h28l00dzdk8oh7ivjeev	cmozwcw35002s408ou637b00w	Islampur	islampur-union-4	630	2026-05-10 16:52:44.565	2026-05-10 16:52:44.565	t	ইসলামপুর	Islampur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h28u00e0dk8olb0plcz1	cmozwcw35002s408ou637b00w	South Rajanagar	south-rajanagar-union	631	2026-05-10 16:52:44.574	2026-05-10 16:52:44.574	t	দক্ষিণ রাজানগর	South Rajanagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h29300e1dk8or48fisuv	cmozwcw35002s408ou637b00w	Lalanagar	lalanagar-union	632	2026-05-10 16:52:44.583	2026-05-10 16:52:44.583	t	লালানগর	Lalanagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h29d00e2dk8orb2cax2z	cmozwcw3z002w408odgkeg23g	Kumira	kumira-union-1	633	2026-05-10 16:52:44.593	2026-05-10 16:52:44.593	t	কুমিরা	Kumira	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h29m00e3dk8oi2d74fbx	cmozwcw3z002w408odgkeg23g	Banshbaria	banshbaria-union-1	634	2026-05-10 16:52:44.602	2026-05-10 16:52:44.602	t	বাঁশবারীয়া	Banshbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h29w00e4dk8o2i8amvre	cmozwcw3z002w408odgkeg23g	Barabkunda	barabkunda-union	635	2026-05-10 16:52:44.612	2026-05-10 16:52:44.612	t	বারবকুন্ড	Barabkunda	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2a400e5dk8o4ozpgd9a	cmozwcw3z002w408odgkeg23g	Bariadyala	bariadyala-union	636	2026-05-10 16:52:44.62	2026-05-10 16:52:44.62	t	বাড়িয়াডিয়ালা	Bariadyala	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2af00e6dk8ot555y0y4	cmozwcw3z002w408odgkeg23g	Muradpur	muradpur-union-1	637	2026-05-10 16:52:44.631	2026-05-10 16:52:44.631	t	মুরাদপুর	Muradpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2ao00e7dk8o0nur7k8m	cmozwcw3z002w408odgkeg23g	Saidpur	saidpur-union-1	638	2026-05-10 16:52:44.64	2026-05-10 16:52:44.64	t	সাঈদপুর	Saidpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2ay00e8dk8o53pdkvkx	cmozwcw3z002w408odgkeg23g	Salimpur	salimpur-union	639	2026-05-10 16:52:44.65	2026-05-10 16:52:44.65	t	সালিমপুর	Salimpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2b700e9dk8ocgqpquz5	cmozwcw3z002w408odgkeg23g	Sonaichhari	sonaichhari-union	640	2026-05-10 16:52:44.659	2026-05-10 16:52:44.659	t	সোনাইছড়ি	Sonaichhari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2bg00eadk8oot3yytua	cmozwcw3z002w408odgkeg23g	Bhatiari	bhatiari-union	641	2026-05-10 16:52:44.668	2026-05-10 16:52:44.668	t	ভাটিয়ারী	Bhatiari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2bp00ebdk8o4ykafjwy	cmozwcw2v002r408orzg66oom	Asia	asia-union	658	2026-05-10 16:52:44.677	2026-05-10 16:52:44.677	t	আশিয়া	Asia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2by00ecdk8o5kzs75zt	cmozwcw2v002r408orzg66oom	Kachuai	kachuai-union	659	2026-05-10 16:52:44.686	2026-05-10 16:52:44.686	t	কাচুয়াই	Kachuai	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2c700eddk8oqa39etb9	cmozwcw2v002r408orzg66oom	Kasiais	kasiais-union	660	2026-05-10 16:52:44.695	2026-05-10 16:52:44.695	t	কাশিয়াইশ	Kasiais	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2cg00eedk8o52ldvqpr	cmozwcw2v002r408orzg66oom	Kusumpura	kusumpura-union	661	2026-05-10 16:52:44.704	2026-05-10 16:52:44.704	t	কুসুমপুরা	Kusumpura	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2cp00efdk8ozqwr7io1	cmozwcw2v002r408orzg66oom	Kelishahar	kelishahar-union	662	2026-05-10 16:52:44.713	2026-05-10 16:52:44.713	t	কেলিশহর	Kelishahar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2cx00egdk8o3uygjnyn	cmozwcw2v002r408orzg66oom	Kolagaon	kolagaon-union	663	2026-05-10 16:52:44.721	2026-05-10 16:52:44.721	t	কোলাগাঁও	Kolagaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2d600ehdk8oi2ot38i4	cmozwcw2v002r408orzg66oom	Kharana	kharana-union	664	2026-05-10 16:52:44.73	2026-05-10 16:52:44.73	t	খরনা	Kharana	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2de00eidk8ozb335ryv	cmozwcw2v002r408orzg66oom	Char Patharghata	char-patharghata-union	665	2026-05-10 16:52:44.738	2026-05-10 16:52:44.738	t	চর পাথরঘাটা	Char Patharghata	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2dm00ejdk8orfj4l2e6	cmozwcw2v002r408orzg66oom	Char Lakshya	char-lakshya-union	666	2026-05-10 16:52:44.747	2026-05-10 16:52:44.747	t	চর লক্ষ্যা	Char Lakshya	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2dv00ekdk8o7macoj8l	cmozwcw2v002r408orzg66oom	Chanhara	chanhara-union	667	2026-05-10 16:52:44.755	2026-05-10 16:52:44.755	t	ছনহরা	Chanhara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2e500eldk8oe247g5bp	cmozwcw2v002r408orzg66oom	Janglukhain	janglukhain-union	668	2026-05-10 16:52:44.765	2026-05-10 16:52:44.765	t	জঙ্গলখাইন	Janglukhain	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2ed00emdk8od1mcm911	cmozwcw2v002r408orzg66oom	Jiri	jiri-union	669	2026-05-10 16:52:44.773	2026-05-10 16:52:44.773	t	জিরি	Jiri	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2em00endk8ozli6nxla	cmozwcw2v002r408orzg66oom	Juldha	juldha-union	670	2026-05-10 16:52:44.782	2026-05-10 16:52:44.782	t	জুলধা	Juldha	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2ew00eodk8oiptk4ruk	cmozwcw2v002r408orzg66oom	Dakkhin Bhurshi	dakkhin-bhurshi-union	671	2026-05-10 16:52:44.792	2026-05-10 16:52:44.792	t	দক্ষিণ ভূর্ষি	Dakkhin Bhurshi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2f600epdk8o68qrqtf8	cmozwcw2v002r408orzg66oom	Dhalghat	dhalghat-union	672	2026-05-10 16:52:44.802	2026-05-10 16:52:44.802	t	ধলঘাট	Dhalghat	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2fh00eqdk8o92n3ipck	cmozwcw2v002r408orzg66oom	Bara Uthan	bara-uthan-union	673	2026-05-10 16:52:44.813	2026-05-10 16:52:44.813	t	বড় উঠান	Bara Uthan	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2fq00erdk8ogsec5l8n	cmozwcw2v002r408orzg66oom	Baralia	baralia-union	674	2026-05-10 16:52:44.822	2026-05-10 16:52:44.822	t	বরলিয়া	Baralia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2g000esdk8ohc5o41ep	cmozwcw2v002r408orzg66oom	Bhatikhain	bhatikhain-union	675	2026-05-10 16:52:44.832	2026-05-10 16:52:44.832	t	ভাটিখাইন	Bhatikhain	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2g900etdk8ol2clcw0p	cmozwcw2v002r408orzg66oom	Sikalbaha	sikalbaha-union	676	2026-05-10 16:52:44.841	2026-05-10 16:52:44.841	t	শিকলবাহা	Sikalbaha	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2gj00eudk8os58bnm6h	cmozwcw2v002r408orzg66oom	Sobhandandi	sobhandandi-union	677	2026-05-10 16:52:44.852	2026-05-10 16:52:44.852	t	শোভনদন্ডী	Sobhandandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2gt00evdk8ozrzjsnsi	cmozwcw2v002r408orzg66oom	Habilasdwi	habilasdwi-union	678	2026-05-10 16:52:44.861	2026-05-10 16:52:44.861	t	হাবিলাসদ্বীপ	Habilasdwi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2h400ewdk8o9fqh8175	cmozwcw2v002r408orzg66oom	Haidgaon	haidgaon-union	679	2026-05-10 16:52:44.872	2026-05-10 16:52:44.872	t	হাইদগাঁও	Haidgaon	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2hg00exdk8o6pncj8zt	cmozwcw3l002u408ok63hc0m1	Rahmatpur	rahmatpur-union	680	2026-05-10 16:52:44.884	2026-05-10 16:52:44.884	t	রহমতপুর	Rahmatpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2hr00eydk8oql5fxm8o	cmozwcw3l002u408ok63hc0m1	Harispur	harispur-union	681	2026-05-10 16:52:44.895	2026-05-10 16:52:44.895	t	হরিশপুর	Harispur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2i100ezdk8o3jtsfcla	cmozwcw3l002u408ok63hc0m1	Kalapania	kalapania-union	682	2026-05-10 16:52:44.905	2026-05-10 16:52:44.905	t	কালাপানিয়া	Kalapania	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2ia00f0dk8okkqitcpo	cmozwcw3l002u408ok63hc0m1	Amanullah	amanullah-union	683	2026-05-10 16:52:44.914	2026-05-10 16:52:44.914	t	আমানউল্যা	Amanullah	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2ij00f1dk8owljfw12c	cmozwcw3l002u408ok63hc0m1	Santoshpur	santoshpur-union	684	2026-05-10 16:52:44.923	2026-05-10 16:52:44.923	t	সন্তোষপুর	Santoshpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2is00f2dk8oyej5ikmp	cmozwcw3l002u408ok63hc0m1	Gachhua	gachhua-union	685	2026-05-10 16:52:44.932	2026-05-10 16:52:44.932	t	গাছুয়া	Gachhua	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2j000f3dk8o25aken6c	cmozwcw3l002u408ok63hc0m1	Bauria	bauria-union	686	2026-05-10 16:52:44.94	2026-05-10 16:52:44.94	t	বাউরিয়া	Bauria	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2j900f4dk8ojt02lbdk	cmozwcw3l002u408ok63hc0m1	Haramia	haramia-union	687	2026-05-10 16:52:44.949	2026-05-10 16:52:44.949	t	হারামিয়া	Haramia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2jh00f5dk8ofxmsqniv	cmozwcw3l002u408ok63hc0m1	Magdhara	magdhara-union	688	2026-05-10 16:52:44.957	2026-05-10 16:52:44.957	t	মগধরা	Magdhara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2jp00f6dk8osb63ujqw	cmozwcw3l002u408ok63hc0m1	Maitbhanga	maitbhanga-union	689	2026-05-10 16:52:44.965	2026-05-10 16:52:44.965	t	মাইটভাঙ্গা	Maitbhanga	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2jy00f7dk8oaplvm2m5	cmozwcw3l002u408ok63hc0m1	Sarikait	sarikait-union	690	2026-05-10 16:52:44.974	2026-05-10 16:52:44.974	t	সারিকাইত	Sarikait	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2ka00f8dk8ohxeyjzus	cmozwcw3l002u408ok63hc0m1	Musapur	musapur-union-3	691	2026-05-10 16:52:44.986	2026-05-10 16:52:44.986	t	মুছাপুর	Musapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2kk00f9dk8ods11zb4k	cmozwcw3l002u408ok63hc0m1	Azimpur	azimpur-union-1	692	2026-05-10 16:52:44.996	2026-05-10 16:52:44.996	t	আজিমপুর	Azimpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2kt00fadk8oneexgbhn	cmozwcw3l002u408ok63hc0m1	Urirchar	urirchar-union	693	2026-05-10 16:52:45.005	2026-05-10 16:52:45.005	t	উড়িরচর	Urirchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2l200fbdk8o6wdr7eob	cmozwcw18002j408ooiydjja6	Pukuria	pukuria-union	694	2026-05-10 16:52:45.014	2026-05-10 16:52:45.014	t	পুকুরিয়া	Pukuria	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2la00fcdk8o45yg83jc	cmozwcw18002j408ooiydjja6	Sadhanpur	sadhanpur-union	695	2026-05-10 16:52:45.022	2026-05-10 16:52:45.022	t	সাধনপুর	Sadhanpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2lj00fddk8oxfk7notn	cmozwcw18002j408ooiydjja6	Khankhanabad	khankhanabad-union	696	2026-05-10 16:52:45.031	2026-05-10 16:52:45.031	t	খানখানাবাদ	Khankhanabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2ls00fedk8o1qe4b97f	cmozwcw18002j408ooiydjja6	Baharchhara	baharchhara-union	697	2026-05-10 16:52:45.04	2026-05-10 16:52:45.04	t	বাহারছড়া	Baharchhara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2m100ffdk8okrw60gmv	cmozwcw18002j408ooiydjja6	Kalipur	kalipur-union	698	2026-05-10 16:52:45.049	2026-05-10 16:52:45.049	t	কালীপুর	Kalipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2ma00fgdk8oaioy48z6	cmozwcw18002j408ooiydjja6	Bailchhari	bailchhari-union	699	2026-05-10 16:52:45.058	2026-05-10 16:52:45.058	t	বৈলছড়ি	Bailchhari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2mk00fhdk8o0wuo2p15	cmozwcw18002j408ooiydjja6	Katharia	katharia-union	700	2026-05-10 16:52:45.068	2026-05-10 16:52:45.068	t	কাথরিয়া	Katharia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2mt00fidk8ok3rqr7vt	cmozwcw18002j408ooiydjja6	Saral	saral-union	701	2026-05-10 16:52:45.077	2026-05-10 16:52:45.077	t	সরল	Saral	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2n100fjdk8om52hj8x5	cmozwcw18002j408ooiydjja6	Silk	silk-union	702	2026-05-10 16:52:45.085	2026-05-10 16:52:45.085	t	শীলকুপ	Silk	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2na00fkdk8o91yb5doi	cmozwcw18002j408ooiydjja6	Chambal	chambal-union	703	2026-05-10 16:52:45.094	2026-05-10 16:52:45.094	t	চাম্বল	Chambal	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2nj00fldk8owa07nmpd	cmozwcw18002j408ooiydjja6	Gandamara	gandamara-union	704	2026-05-10 16:52:45.103	2026-05-10 16:52:45.103	t	গন্ডামারা	Gandamara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2nr00fmdk8o4g9yzjt7	cmozwcw18002j408ooiydjja6	Sekherkhil	sekherkhil-union	705	2026-05-10 16:52:45.111	2026-05-10 16:52:45.111	t	শেখেরখীল	Sekherkhil	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2o000fndk8ob3f4uuki	cmozwcw18002j408ooiydjja6	Puichhari	puichhari-union	706	2026-05-10 16:52:45.12	2026-05-10 16:52:45.12	t	পুঁইছড়ি	Puichhari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2o900fodk8o7d21jplp	cmozwcw18002j408ooiydjja6	Chhanua	chhanua-union	707	2026-05-10 16:52:45.129	2026-05-10 16:52:45.129	t	ছনুয়া	Chhanua	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2oh00fpdk8oplbzafcd	cmozwcw1f002k408orhs51235	Kandhurkhil	kandhurkhil-union	708	2026-05-10 16:52:45.137	2026-05-10 16:52:45.137	t	কধুরখীল	Kandhurkhil	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2or00fqdk8okw8kshr7	cmozwcw1f002k408orhs51235	Pashchim Gamdandi	pashchim-gamdandi-union	709	2026-05-10 16:52:45.147	2026-05-10 16:52:45.147	t	পশ্চিম গোমদন্ডী	Pashchim Gamdandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2p000frdk8o7sxx3tpv	cmozwcw1f002k408orhs51235	Purba Gomdandi	purba-gomdandi-union	710	2026-05-10 16:52:45.156	2026-05-10 16:52:45.156	t	পুর্ব গোমদন্ডী	Purba Gomdandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2p900fsdk8o3ccy6fds	cmozwcw1f002k408orhs51235	Sakpura	sakpura-union	711	2026-05-10 16:52:45.165	2026-05-10 16:52:45.165	t	শাকপুরা	Sakpura	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2ph00ftdk8oh79gq004	cmozwcw1f002k408orhs51235	Saroatali	saroatali-union	712	2026-05-10 16:52:45.173	2026-05-10 16:52:45.173	t	সারোয়াতলী	Saroatali	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2pr00fudk8o3nrrswd0	cmozwcw1f002k408orhs51235	Popadia	popadia-union	713	2026-05-10 16:52:45.183	2026-05-10 16:52:45.183	t	পোপাদিয়া	Popadia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2pz00fvdk8obyxt5rss	cmozwcw1f002k408orhs51235	Charandwi	charandwi-union	714	2026-05-10 16:52:45.191	2026-05-10 16:52:45.191	t	চরনদ্বীপ	Charandwi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2q800fwdk8o54uf6u6b	cmozwcw1f002k408orhs51235	Sreepur-Kharandwi	sreepur-kharandwi-union	715	2026-05-10 16:52:45.2	2026-05-10 16:52:45.2	t	শ্রীপুর-খরন্দীপ	Sreepur-Kharandwi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2qh00fxdk8oygkk5yc7	cmozwcw1f002k408orhs51235	Amuchia	amuchia-union	716	2026-05-10 16:52:45.209	2026-05-10 16:52:45.209	t	আমুচিয়া	Amuchia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2qq00fydk8os07rljc8	cmozwcw1f002k408orhs51235	Ahla Karaldenga	ahla-karaldenga-union	717	2026-05-10 16:52:45.218	2026-05-10 16:52:45.218	t	আহল্লা করলডেঙ্গা	Ahla Karaldenga	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2qz00fzdk8ooodp87x1	cmozwcw0y002i408ojo194erb	Boirag	boirag-union	718	2026-05-10 16:52:45.227	2026-05-10 16:52:45.227	t	বৈরাগ	Boirag	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2r800g0dk8o7ztqd7a5	cmozwcw0y002i408ojo194erb	Barasat	barasat-union-1	719	2026-05-10 16:52:45.236	2026-05-10 16:52:45.236	t	বারশত	Barasat	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2rk00g1dk8op38ycrkm	cmozwcw0y002i408ojo194erb	Raipur	raipur-union-3	720	2026-05-10 16:52:45.248	2026-05-10 16:52:45.248	t	রায়পুর	Raipur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2rs00g2dk8ovjj4c43n	cmozwcw0y002i408ojo194erb	Battali	battali-union	721	2026-05-10 16:52:45.256	2026-05-10 16:52:45.256	t	বটতলী	Battali	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2s100g3dk8ow5z9np1w	cmozwcw0y002i408ojo194erb	Barumchara	barumchara-union	722	2026-05-10 16:52:45.265	2026-05-10 16:52:45.265	t	বরম্নমচড়া	Barumchara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2sa00g4dk8oug5tq0lf	cmozwcw0y002i408ojo194erb	Baroakhan	baroakhan-union	723	2026-05-10 16:52:45.274	2026-05-10 16:52:45.274	t	বারখাইন	Baroakhan	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2sk00g5dk8oc98odvk8	cmozwcw0y002i408ojo194erb	Anwara	anwara-union	724	2026-05-10 16:52:45.284	2026-05-10 16:52:45.284	t	আনোয়ারা	Anwara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2su00g6dk8oca1mi7lo	cmozwcw0y002i408ojo194erb	Chatari	chatari-union	725	2026-05-10 16:52:45.294	2026-05-10 16:52:45.294	t	চাতরী	Chatari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2t200g7dk8oay4y303l	cmozwcw0y002i408ojo194erb	Paraikora	paraikora-union	726	2026-05-10 16:52:45.302	2026-05-10 16:52:45.302	t	পরৈকোড়া	Paraikora	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2tb00g8dk8ouk3t9e72	cmozwcw0y002i408ojo194erb	Haildhar	haildhar-union	727	2026-05-10 16:52:45.311	2026-05-10 16:52:45.311	t	হাইলধর	Haildhar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2tk00g9dk8osmnzcy9k	cmozwcw0y002i408ojo194erb	Juidandi	juidandi-union	728	2026-05-10 16:52:45.32	2026-05-10 16:52:45.32	t	জুঁইদন্ডী	Juidandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2tt00gadk8opruw3q7h	cmozwcw1m002l408oyx6au1sc	Kanchanabad	kanchanabad-union	729	2026-05-10 16:52:45.329	2026-05-10 16:52:45.329	t	কাঞ্চনাবাদ	Kanchanabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2u200gbdk8odlmepbiv	cmozwcw1m002l408oyx6au1sc	Joara	joara-union	730	2026-05-10 16:52:45.338	2026-05-10 16:52:45.338	t	জোয়ারা	Joara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2uc00gcdk8ok64bbw14	cmozwcw1m002l408oyx6au1sc	Barkal	barkal-union-1	731	2026-05-10 16:52:45.348	2026-05-10 16:52:45.348	t	বরকল	Barkal	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2ul00gddk8o2efdb8qc	cmozwcw1m002l408oyx6au1sc	Barama	barama-union	732	2026-05-10 16:52:45.357	2026-05-10 16:52:45.357	t	বরমা	Barama	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2ut00gedk8o3iip7kcl	cmozwcw1m002l408oyx6au1sc	Bailtali	bailtali-union	733	2026-05-10 16:52:45.365	2026-05-10 16:52:45.365	t	বৈলতলী	Bailtali	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2v400gfdk8o6xhxdlyn	cmozwcw1m002l408oyx6au1sc	Satbaria	satbaria-union-2	734	2026-05-10 16:52:45.376	2026-05-10 16:52:45.376	t	সাতবাড়িয়া	Satbaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2vd00ggdk8oozp6gddu	cmozwcw1m002l408oyx6au1sc	Hashimpur	hashimpur-union	735	2026-05-10 16:52:45.385	2026-05-10 16:52:45.385	t	হাশিমপুর	Hashimpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2vn00ghdk8ob6g1st06	cmozwcw1m002l408oyx6au1sc	Dohazari	dohazari-union	736	2026-05-10 16:52:45.395	2026-05-10 16:52:45.395	t	দোহাজারী	Dohazari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2vx00gidk8oy2tv9yog	cmozwcw1m002l408oyx6au1sc	Dhopachhari	dhopachhari-union	737	2026-05-10 16:52:45.405	2026-05-10 16:52:45.405	t	ধোপাছড়ী	Dhopachhari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2w600gjdk8oeyqwtenn	cmozwcw3s002v408oq6583vlw	Charati	charati-union	738	2026-05-10 16:52:45.414	2026-05-10 16:52:45.414	t	চরতী	Charati	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2wf00gkdk8ocljqcsru	cmozwcw3s002v408oq6583vlw	Khagaria	khagaria-union	739	2026-05-10 16:52:45.423	2026-05-10 16:52:45.423	t	খাগরিয়া	Khagaria	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2wo00gldk8o0vj7h8f1	cmozwcw3s002v408oq6583vlw	Nalua	nalua-union	740	2026-05-10 16:52:45.432	2026-05-10 16:52:45.432	t	নলুয়া	Nalua	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2ww00gmdk8otidbbec2	cmozwcw3s002v408oq6583vlw	Kanchana	kanchana-union	741	2026-05-10 16:52:45.44	2026-05-10 16:52:45.44	t	কাঞ্চনা	Kanchana	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2x500gndk8odq3ofdul	cmozwcw3s002v408oq6583vlw	Amilaisi	amilaisi-union	742	2026-05-10 16:52:45.449	2026-05-10 16:52:45.449	t	আমিলাইশ	Amilaisi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2xf00godk8ofiwdkskz	cmozwcw3s002v408oq6583vlw	Eochiai	eochiai-union	743	2026-05-10 16:52:45.459	2026-05-10 16:52:45.459	t	এওচিয়া	Eochiai	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2xo00gpdk8od3c9ezsx	cmozwcw3s002v408oq6583vlw	Madarsa	madarsa-union	744	2026-05-10 16:52:45.468	2026-05-10 16:52:45.468	t	মাদার্শা	Madarsa	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2xy00gqdk8omhmtlxez	cmozwcw3s002v408oq6583vlw	Dhemsa	dhemsa-union	745	2026-05-10 16:52:45.478	2026-05-10 16:52:45.478	t	ঢেমশা	Dhemsa	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2y800grdk8of1xlvnnr	cmozwcw3s002v408oq6583vlw	Paschim Dhemsa	paschim-dhemsa-union	746	2026-05-10 16:52:45.488	2026-05-10 16:52:45.488	t	পশ্চিম ঢেমশা	Paschim Dhemsa	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2yh00gsdk8o76q8hcwi	cmozwcw3s002v408oq6583vlw	Keochia	keochia-union	747	2026-05-10 16:52:45.497	2026-05-10 16:52:45.497	t	কেঁওচিয়া	Keochia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2yq00gtdk8ok7r9573m	cmozwcw3s002v408oq6583vlw	Kaliais	kaliais-union	748	2026-05-10 16:52:45.506	2026-05-10 16:52:45.506	t	কালিয়াইশ	Kaliais	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2z100gudk8o8zw8kk0k	cmozwcw3s002v408oq6583vlw	Bazalia	bazalia-union	749	2026-05-10 16:52:45.517	2026-05-10 16:52:45.517	t	বাজালিয়া	Bazalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2zb00gvdk8odzvmg19q	cmozwcw3s002v408oq6583vlw	Puranagar	puranagar-union	750	2026-05-10 16:52:45.527	2026-05-10 16:52:45.527	t	পুরানগড়	Puranagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2zl00gwdk8otahyno21	cmozwcw3s002v408oq6583vlw	Sadaha	sadaha-union	751	2026-05-10 16:52:45.537	2026-05-10 16:52:45.537	t	ছদাহা	Sadaha	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h2zv00gxdk8og6qd94hw	cmozwcw3s002v408oq6583vlw	Satkania	satkania-union	752	2026-05-10 16:52:45.547	2026-05-10 16:52:45.547	t	সাতকানিয়া	Satkania	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h30400gydk8oe4sawjlx	cmozwcw3s002v408oq6583vlw	Sonakania	sonakania-union	753	2026-05-10 16:52:45.556	2026-05-10 16:52:45.556	t	সোনাকানিয়া	Sonakania	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h30d00gzdk8olcfx2j05	cmozwcw2e002p408obeo976wt	Padua	padua-union	754	2026-05-10 16:52:45.565	2026-05-10 16:52:45.565	t	পদুয়া	Padua	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h30m00h0dk8o3mov73nl	cmozwcw2e002p408obeo976wt	Barahatia	barahatia-union	755	2026-05-10 16:52:45.574	2026-05-10 16:52:45.574	t	বড়হাতিয়া	Barahatia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h30w00h1dk8o18zt68s1	cmozwcw2e002p408obeo976wt	Amirabad	amirabad-union-1	756	2026-05-10 16:52:45.584	2026-05-10 16:52:45.584	t	আমিরাবাদ	Amirabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h31500h2dk8oqjywpl1c	cmozwcw2e002p408obeo976wt	Charamba	charamba-union	757	2026-05-10 16:52:45.593	2026-05-10 16:52:45.593	t	চরম্বা	Charamba	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h31e00h3dk8oq1b0ldxj	cmozwcw2e002p408obeo976wt	Kalauzan	kalauzan-union	758	2026-05-10 16:52:45.602	2026-05-10 16:52:45.602	t	কলাউজান	Kalauzan	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h31n00h4dk8o6yu1k3bh	cmozwcw2e002p408obeo976wt	Lohagara	lohagara-union	759	2026-05-10 16:52:45.611	2026-05-10 16:52:45.611	t	লোহাগাড়া	Lohagara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h31w00h5dk8o30lfuf56	cmozwcw2e002p408obeo976wt	Putibila	putibila-union	760	2026-05-10 16:52:45.62	2026-05-10 16:52:45.62	t	পুটিবিলা	Putibila	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h32500h6dk8okakzwd9f	cmozwcw2e002p408obeo976wt	Chunati	chunati-union	761	2026-05-10 16:52:45.629	2026-05-10 16:52:45.629	t	চুনতি	Chunati	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h32d00h7dk8od4b46epb	cmozwcw2e002p408obeo976wt	Adhunagar	adhunagar-union	762	2026-05-10 16:52:45.637	2026-05-10 16:52:45.637	t	আধুনগর	Adhunagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h32m00h8dk8o2eflr2kx	cmozwcw20002n408ozre0lgrx	Farhadabad	farhadabad-union	763	2026-05-10 16:52:45.646	2026-05-10 16:52:45.646	t	ফরহাদাবাদ	Farhadabad	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h32v00h9dk8o7xum86pc	cmozwcw20002n408ozre0lgrx	Dhalai	dhalai-union	764	2026-05-10 16:52:45.655	2026-05-10 16:52:45.655	t	ধলই	Dhalai	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h33400hadk8o9rkckkfs	cmozwcw20002n408ozre0lgrx	Mirjapur	mirjapur-union	765	2026-05-10 16:52:45.664	2026-05-10 16:52:45.664	t	মির্জাপুর	Mirjapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h33d00hbdk8o65rmqlh5	cmozwcw20002n408ozre0lgrx	Nangolmora	nangolmora-union	766	2026-05-10 16:52:45.673	2026-05-10 16:52:45.673	t	নাঙ্গলমোরা	Nangolmora	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h33m00hcdk8ovaasmuvm	cmozwcw20002n408ozre0lgrx	Gomanmordan	gomanmordan-union	767	2026-05-10 16:52:45.682	2026-05-10 16:52:45.682	t	গুমানমর্দ্দন	Gomanmordan	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h33v00hddk8oy6m5xxka	cmozwcw20002n408ozre0lgrx	Chipatali	chipatali-union	768	2026-05-10 16:52:45.691	2026-05-10 16:52:45.691	t	ছিপাতলী	Chipatali	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h34400hedk8ooum3095l	cmozwcw20002n408ozre0lgrx	Mekhal	mekhal-union	769	2026-05-10 16:52:45.7	2026-05-10 16:52:45.7	t	মেখল	Mekhal	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h34d00hfdk8oug1pp081	cmozwcw20002n408ozre0lgrx	Garduara	garduara-union	770	2026-05-10 16:52:45.709	2026-05-10 16:52:45.709	t	গড়দুয়ারা	Garduara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h34m00hgdk8on6ksqlxq	cmozwcw20002n408ozre0lgrx	Fathepur	fathepur-union	771	2026-05-10 16:52:45.718	2026-05-10 16:52:45.718	t	ফতেপুর	Fathepur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h34w00hhdk8osm3lq2r7	cmozwcw20002n408ozre0lgrx	Chikondandi	chikondandi-union	772	2026-05-10 16:52:45.728	2026-05-10 16:52:45.728	t	চিকনদন্ডী	Chikondandi	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h35500hidk8oh49wvvlg	cmozwcw20002n408ozre0lgrx	Uttar Madrasha	uttar-madrasha-union	773	2026-05-10 16:52:45.737	2026-05-10 16:52:45.737	t	উত্তর মাদার্শা	Uttar Madrasha	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h35e00hjdk8oan1tmtvv	cmozwcw20002n408ozre0lgrx	Dakkin Madrasha	dakkin-madrasha-union	774	2026-05-10 16:52:45.746	2026-05-10 16:52:45.746	t	দক্ষিন মাদার্শা	Dakkin Madrasha	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h35n00hkdk8o7tm2na4x	cmozwcw20002n408ozre0lgrx	Sikarpur	sikarpur-union	775	2026-05-10 16:52:45.755	2026-05-10 16:52:45.755	t	শিকারপুর	Sikarpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h35v00hldk8ohboj3jp7	cmozwcw20002n408ozre0lgrx	Budirchar	budirchar-union	776	2026-05-10 16:52:45.764	2026-05-10 16:52:45.764	t	বুডিরশ্চর	Budirchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h36400hmdk8orsewz2uf	cmozwcw20002n408ozre0lgrx	Hathazari	hathazari-union	777	2026-05-10 16:52:45.772	2026-05-10 16:52:45.772	t	হাটহাজারী	Hathazari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h36f00hndk8oklyaesgi	cmozwcw1t002m408osgwwrrca	Dharmapur	dharmapur-union-2	778	2026-05-10 16:52:45.783	2026-05-10 16:52:45.783	t	ধর্মপুর	Dharmapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h36o00hodk8olpuuvzs2	cmozwcw1t002m408osgwwrrca	Baganbazar	baganbazar-union	779	2026-05-10 16:52:45.792	2026-05-10 16:52:45.792	t	বাগান বাজার	Baganbazar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h36x00hpdk8og0bd3uy8	cmozwcw1t002m408osgwwrrca	Dantmara	dantmara-union	780	2026-05-10 16:52:45.801	2026-05-10 16:52:45.801	t	দাঁতমারা	Dantmara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h37600hqdk8ocxykmuyw	cmozwcw1t002m408osgwwrrca	Narayanhat	narayanhat-union	781	2026-05-10 16:52:45.81	2026-05-10 16:52:45.81	t	নারায়নহাট	Narayanhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h37f00hrdk8obozabuyc	cmozwcw1t002m408osgwwrrca	Bhujpur	bhujpur-union	782	2026-05-10 16:52:45.819	2026-05-10 16:52:45.819	t	ভূজপুর	Bhujpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h37o00hsdk8oh7wtfixp	cmozwcw1t002m408osgwwrrca	Harualchari	harualchari-union	783	2026-05-10 16:52:45.828	2026-05-10 16:52:45.828	t	হারুয়ালছড়ি	Harualchari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h37x00htdk8ongabcu6v	cmozwcw1t002m408osgwwrrca	Paindong	paindong-union	784	2026-05-10 16:52:45.837	2026-05-10 16:52:45.837	t	পাইনদং	Paindong	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h38600hudk8oti2wrokr	cmozwcw1t002m408osgwwrrca	Kanchannagor	kanchannagor-union	785	2026-05-10 16:52:45.846	2026-05-10 16:52:45.846	t	কাঞ্চনগর	Kanchannagor	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h38f00hvdk8o57ynxowu	cmozwcw1t002m408osgwwrrca	Sunderpur	sunderpur-union	786	2026-05-10 16:52:45.855	2026-05-10 16:52:45.855	t	সুনদরপুর	Sunderpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h38o00hwdk8oz8vap9lu	cmozwcw1t002m408osgwwrrca	Suabil	suabil-union	787	2026-05-10 16:52:45.864	2026-05-10 16:52:45.864	t	সুয়াবিল	Suabil	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h38y00hxdk8o0n5i5kga	cmozwcw1t002m408osgwwrrca	Abdullapur	abdullapur-union-1	788	2026-05-10 16:52:45.874	2026-05-10 16:52:45.874	t	আবদুল্লাপুর	Abdullapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h39700hydk8ooycmt395	cmozwcw1t002m408osgwwrrca	Samitirhat	samitirhat-union	789	2026-05-10 16:52:45.883	2026-05-10 16:52:45.883	t	সমিতির হাট	Samitirhat	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h39g00hzdk8o9vt4mf2n	cmozwcw1t002m408osgwwrrca	Jafathagar	jafathagar-union	790	2026-05-10 16:52:45.892	2026-05-10 16:52:45.892	t	জাফতনগর	Jafathagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h39p00i0dk8o8x0hue92	cmozwcw1t002m408osgwwrrca	Bokhtapur	bokhtapur-union	791	2026-05-10 16:52:45.901	2026-05-10 16:52:45.901	t	বক্তপুর	Bokhtapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h39y00i1dk8oe45abzkz	cmozwcw1t002m408osgwwrrca	Roshangiri	roshangiri-union	792	2026-05-10 16:52:45.91	2026-05-10 16:52:45.91	t	রোসাংগিরী	Roshangiri	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3a600i2dk8ow6nduv4l	cmozwcw1t002m408osgwwrrca	Nanupur	nanupur-union	793	2026-05-10 16:52:45.918	2026-05-10 16:52:45.918	t	নানুপুর	Nanupur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3af00i3dk8otv18z09v	cmozwcw1t002m408osgwwrrca	Lelang	lelang-union	794	2026-05-10 16:52:45.927	2026-05-10 16:52:45.927	t	লেলাং	Lelang	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3aw00i4dk8oykj9701m	cmozwcw1t002m408osgwwrrca	Daulatpur	daulatpur-union-6	795	2026-05-10 16:52:45.944	2026-05-10 16:52:45.944	t	দৌলতপুর	Daulatpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3b500i5dk8odc07hfj5	cmozwcw3e002t408o6bwy3vif	Raozan	raozan-union	796	2026-05-10 16:52:45.953	2026-05-10 16:52:45.953	t	রাউজান	Raozan	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3be00i6dk8owreenx4b	cmozwcw3e002t408o6bwy3vif	Bagoan	bagoan-union	797	2026-05-10 16:52:45.962	2026-05-10 16:52:45.962	t	বাগোয়ান	Bagoan	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3bn00i7dk8o6tm913ls	cmozwcw3e002t408o6bwy3vif	Binajuri	binajuri-union	798	2026-05-10 16:52:45.971	2026-05-10 16:52:45.971	t	বিনাজুরী	Binajuri	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3bw00i8dk8oxy763ki5	cmozwcw3e002t408o6bwy3vif	Chikdair	chikdair-union	799	2026-05-10 16:52:45.98	2026-05-10 16:52:45.98	t	চিকদাইর	Chikdair	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3c500i9dk8op6xgxim5	cmozwcw3e002t408o6bwy3vif	Dabua	dabua-union	800	2026-05-10 16:52:45.989	2026-05-10 16:52:45.989	t	ডাবুয়া	Dabua	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3ce00iadk8o794snxot	cmozwcw3e002t408o6bwy3vif	Purbagujra	purbagujra-union	801	2026-05-10 16:52:45.998	2026-05-10 16:52:45.998	t	পূর্ব গুজরা	Purbagujra	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3cn00ibdk8ocuvv3q5w	cmozwcw3e002t408o6bwy3vif	Paschim Gujra	paschim-gujra-union	802	2026-05-10 16:52:46.007	2026-05-10 16:52:46.007	t	পশ্চিম গুজরা	Paschim Gujra	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3cx00icdk8oyr2k0txy	cmozwcw3e002t408o6bwy3vif	Gohira	gohira-union	803	2026-05-10 16:52:46.017	2026-05-10 16:52:46.017	t	গহিরা	Gohira	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3d700iddk8ol3i7r4p6	cmozwcw3e002t408o6bwy3vif	Holdia	holdia-union-1	804	2026-05-10 16:52:46.027	2026-05-10 16:52:46.027	t	হলদিয়া	Holdia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3dg00iedk8oq0ypvy2u	cmozwcw3e002t408o6bwy3vif	Kodolpur	kodolpur-union	805	2026-05-10 16:52:46.036	2026-05-10 16:52:46.036	t	কদলপূর	Kodolpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3dr00ifdk8och4tnxbw	cmozwcw3e002t408o6bwy3vif	Noapara	noapara-union-2	806	2026-05-10 16:52:46.047	2026-05-10 16:52:46.047	t	নোয়াপাড়া	Noapara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3e100igdk8ojfcmu6wt	cmozwcw3e002t408o6bwy3vif	Pahartali	pahartali-union	807	2026-05-10 16:52:46.057	2026-05-10 16:52:46.057	t	পাহাড়তলী	Pahartali	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3ea00ihdk8o5rlqx8wq	cmozwcw3e002t408o6bwy3vif	Urkirchar	urkirchar-union	808	2026-05-10 16:52:46.066	2026-05-10 16:52:46.066	t	উড়কিরচর	Urkirchar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3ej00iidk8o27ckcl4v	cmozwcw3e002t408o6bwy3vif	Nowajushpur	nowajushpur-union	809	2026-05-10 16:52:46.075	2026-05-10 16:52:46.075	t	নওয়াজিশপুর	Nowajushpur	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3es00ijdk8o64gw85lv	cmozwcwan003v408ou68tt60j	Khagrachhari Sadar	khagrachhari-sadar-union	884	2026-05-10 16:52:46.084	2026-05-10 16:52:46.084	t	খাগরাছড়ি সদর	Khagrachhari Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3f200ikdk8o8367f4yd	cmozwcwan003v408ou68tt60j	Golabari	golabari-union-1	885	2026-05-10 16:52:46.094	2026-05-10 16:52:46.094	t	গোলাবাড়ী	Golabari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3fb00ildk8ooz98rxgw	cmozwcwan003v408ou68tt60j	Parachara	parachara-union	886	2026-05-10 16:52:46.103	2026-05-10 16:52:46.103	t	পেরাছড়া	Parachara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3fk00imdk8ow0wb9xto	cmozwcwan003v408ou68tt60j	Kamalchari	kamalchari-union	887	2026-05-10 16:52:46.112	2026-05-10 16:52:46.112	t	কমলছড়ি	Kamalchari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3fs00indk8oizsmj3p9	cmozwcwa9003t408oajfpkl70	Merung	merung-union	888	2026-05-10 16:52:46.12	2026-05-10 16:52:46.12	t	মেরুং	Merung	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3g200iodk8owmic0osl	cmozwcwa9003t408oajfpkl70	Boalkhali	boalkhali-union	889	2026-05-10 16:52:46.13	2026-05-10 16:52:46.13	t	বোয়ালখালী	Boalkhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3gb00ipdk8oewvn1wgv	cmozwcwa9003t408oajfpkl70	Kabakhali	kabakhali-union	890	2026-05-10 16:52:46.139	2026-05-10 16:52:46.139	t	কবাখালী	Kabakhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3gk00iqdk8o1a6uyghm	cmozwcwa9003t408oajfpkl70	Dighinala	dighinala-union	891	2026-05-10 16:52:46.148	2026-05-10 16:52:46.148	t	দিঘীনালা	Dighinala	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3gt00irdk8odjdzrdch	cmozwcwa9003t408oajfpkl70	Babuchara	babuchara-union	892	2026-05-10 16:52:46.157	2026-05-10 16:52:46.157	t	বাবুছড়া	Babuchara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3h200isdk8oy6qs8l9p	cmozwcwbt0041408ofx46vq81	Ramgarh	ramgarh-union	909	2026-05-10 16:52:46.166	2026-05-10 16:52:46.166	t	রামগড়	Ramgarh	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3hc00itdk8oijvz30vo	cmozwcwbt0041408ofx46vq81	Patachara	patachara-union	910	2026-05-10 16:52:46.176	2026-05-10 16:52:46.176	t	পাতাছড়া	Patachara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3hm00iudk8osr2jf9u3	cmozwcwbt0041408ofx46vq81	Hafchari	hafchari-union	911	2026-05-10 16:52:46.186	2026-05-10 16:52:46.186	t	হাফছড়ি	Hafchari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3hw00ivdk8owzpp426j	cmozwcwbf003z408oxwwq4sle	Taindong	taindong-union	912	2026-05-10 16:52:46.196	2026-05-10 16:52:46.196	t	তাইন্দং	Taindong	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3i500iwdk8odct2vsjn	cmozwcwbf003z408oxwwq4sle	Tabalchari	tabalchari-union	913	2026-05-10 16:52:46.205	2026-05-10 16:52:46.205	t	তবলছড়ি	Tabalchari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3if00ixdk8ole2my0p9	cmozwcwbf003z408oxwwq4sle	Barnal	barnal-union	914	2026-05-10 16:52:46.215	2026-05-10 16:52:46.215	t	বর্ণাল	Barnal	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3io00iydk8ozip16l7z	cmozwcwbf003z408oxwwq4sle	Gomti	gomti-union	915	2026-05-10 16:52:46.224	2026-05-10 16:52:46.224	t	গোমতি	Gomti	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3iy00izdk8oyidbflou	cmozwcwbf003z408oxwwq4sle	Balchari	balchari-union	916	2026-05-10 16:52:46.234	2026-05-10 16:52:46.234	t	বেলছড়ি	Balchari	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3j700j0dk8ohbuzgwoc	cmozwcwbf003z408oxwwq4sle	Matiranga	matiranga-union	917	2026-05-10 16:52:46.243	2026-05-10 16:52:46.243	t	মাটিরাঙ্গা	Matiranga	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3jg00j1dk8opnhjuimi	cmozwcwbf003z408oxwwq4sle	Guimara	guimara-union	918	2026-05-10 16:52:46.252	2026-05-10 16:52:46.252	t	গুইমারা	Guimara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3jp00j2dk8oqf9on3x4	cmozwcwbf003z408oxwwq4sle	Amtali	amtali-union-1	919	2026-05-10 16:52:46.261	2026-05-10 16:52:46.261	t	আমতলি	Amtali	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3jy00j3dk8o449cm0zs	cmozwcvvw001v408olw6mck9t	Rajbila	rajbila-union	920	2026-05-10 16:52:46.27	2026-05-10 16:52:46.27	t	রাজবিলা	Rajbila	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3k700j4dk8ozdq9tkeq	cmozwcvvw001v408olw6mck9t	Tongkaboty	tongkaboty-union	921	2026-05-10 16:52:46.279	2026-05-10 16:52:46.279	t	টংকাবতী	Tongkaboty	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3kf00j5dk8o9ze4lxal	cmozwcvvw001v408olw6mck9t	Suwalok	suwalok-union	922	2026-05-10 16:52:46.287	2026-05-10 16:52:46.287	t	সুয়ালক	Suwalok	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3ko00j6dk8ob8qlnl5t	cmozwcvvw001v408olw6mck9t	Bandarban Sadar	bandarban-sadar-union	923	2026-05-10 16:52:46.296	2026-05-10 16:52:46.296	t	বান্দরবান সদর	Bandarban Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3ky00j7dk8ouha3nhoj	cmozwcvvw001v408olw6mck9t	Kuhalong	kuhalong-union	924	2026-05-10 16:52:46.306	2026-05-10 16:52:46.306	t	কুহালং	Kuhalong	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3l700j8dk8oguq1mtag	cmozwcvvl001u408os3zr05jr	Alikadam Sadar	alikadam-sadar-union	925	2026-05-10 16:52:46.315	2026-05-10 16:52:46.315	t	আলীকদম সদর	Alikadam Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3lg00j9dk8ov9v5ckqa	cmozwcvvl001u408os3zr05jr	Chwekhyong	chwekhyong-union	926	2026-05-10 16:52:46.324	2026-05-10 16:52:46.324	t	চৈক্ষ্যং	Chwekhyong	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3lo00jadk8omok1obr3	cmozwcvwm001y408oz2yk5hzo	Rowangchari Sadar	rowangchari-sadar-union	932	2026-05-10 16:52:46.332	2026-05-10 16:52:46.332	t	রোয়াংছড়ি সদর	Rowangchari Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3lx00jbdk8oyr3upy1q	cmozwcvwm001y408oz2yk5hzo	Taracha	taracha-union	933	2026-05-10 16:52:46.341	2026-05-10 16:52:46.341	t	তারাছা	Taracha	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3m600jcdk8o3g69ynz5	cmozwcvwm001y408oz2yk5hzo	Alekyong	alekyong-union	934	2026-05-10 16:52:46.35	2026-05-10 16:52:46.35	t	আলেক্ষ্যং	Alekyong	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3me00jddk8op6n0u40s	cmozwcvwm001y408oz2yk5hzo	Nawapotong	nawapotong-union	935	2026-05-10 16:52:46.358	2026-05-10 16:52:46.358	t	নোয়াপতং	Nawapotong	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3mo00jedk8oyfebl8cu	cmozwcvw4001w408oggsqudh4	Gajalia	gajalia-union	936	2026-05-10 16:52:46.368	2026-05-10 16:52:46.368	t	গজালিয়া	Gajalia	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3mx00jfdk8o0sp64ok8	cmozwcvw4001w408oggsqudh4	Lama Sadar	lama-sadar-union	937	2026-05-10 16:52:46.377	2026-05-10 16:52:46.377	t	লামা সদর	Lama Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3n600jgdk8o0y9r0zkz	cmozwcvw4001w408oggsqudh4	Fasiakhali	fasiakhali-union	938	2026-05-10 16:52:46.386	2026-05-10 16:52:46.386	t	ফাসিয়াখালী	Fasiakhali	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3nf00jhdk8oxhc609w7	cmozwcvw4001w408oggsqudh4	Fythong	fythong-union	939	2026-05-10 16:52:46.395	2026-05-10 16:52:46.395	t	ফাইতং	Fythong	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3no00jidk8o74hla20l	cmozwcvw4001w408oggsqudh4	Rupushipara	rupushipara-union	940	2026-05-10 16:52:46.404	2026-05-10 16:52:46.404	t	রূপসীপাড়া	Rupushipara	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3ny00jjdk8o99d1fzki	cmozwcvw4001w408oggsqudh4	Sarai	sarai-union-1	941	2026-05-10 16:52:46.414	2026-05-10 16:52:46.414	t	সরই	Sarai	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3o700jkdk8o7gz6x4ky	cmozwcvw4001w408oggsqudh4	Aziznagar	aziznagar-union	942	2026-05-10 16:52:46.423	2026-05-10 16:52:46.423	t	আজিজনগর	Aziznagar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3og00jldk8o0mpa3j6n	cmozwcvwv001z408og5wm9n80	Paind	paind-union	943	2026-05-10 16:52:46.432	2026-05-10 16:52:46.432	t	পাইন্দু	Paind	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3op00jmdk8o4laa1s0u	cmozwcvwv001z408og5wm9n80	Ruma Sadar	ruma-sadar-union	944	2026-05-10 16:52:46.441	2026-05-10 16:52:46.441	t	রুমা সদর	Ruma Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3oy00jndk8oz0pwfjo3	cmozwcvwv001z408og5wm9n80	Ramakreprangsa	ramakreprangsa-union	945	2026-05-10 16:52:46.45	2026-05-10 16:52:46.45	t	রেমাক্রীপ্রাংসা	Ramakreprangsa	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3p600jodk8om06zhgnw	cmozwcvwv001z408og5wm9n80	Galanggya	galanggya-union	946	2026-05-10 16:52:46.458	2026-05-10 16:52:46.458	t	গ্যালেংগ্যা	Galanggya	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3pf00jpdk8o8lya9jq3	cmozwcvx30020408o1i4n4r7e	Remakre	remakre-union	947	2026-05-10 16:52:46.467	2026-05-10 16:52:46.467	t	রেমাক্রী	Remakre	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3pp00jqdk8ozr7hfe4j	cmozwcvx30020408o1i4n4r7e	Tind	tind-union	948	2026-05-10 16:52:46.477	2026-05-10 16:52:46.477	t	তিন্দু	Tind	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3py00jrdk8onxsn7pvw	cmozwcvx30020408o1i4n4r7e	Thanchi Sadar	thanchi-sadar-union	949	2026-05-10 16:52:46.486	2026-05-10 16:52:46.486	t	থানচি সদর	Thanchi Sadar	0	f	\N	\N	nuhil/bangladesh-geocode
cmp00h3q800jsdk8ozkvwwr4z	cmozwcvx30020408o1i4n4r7e	Balipara	balipara-union-1	950	2026-05-10 16:52:46.496	2026-05-10 16:52:46.496	t	বলিপাড়া	Balipara	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfmps0000w88oyyt7h4ve	cmozwcxkp00ad408o3y2tabls	Rajapur	rajapur-union	951	2026-05-10 15:55:38.56	2026-05-10 16:52:46.503	t	রাজাপুর	Rajapur	0	f	\N	\N	nuhil/bangladesh-geocode
cmozyfnh6002fw88ovhk8k2rk	cmozwcxh2009w408on3od5itm	Haturia Nakalia	haturia-nakalia-union	1065	2026-05-10 15:55:39.546	2026-05-10 16:52:47.086	t	হাটুরিয়া নাকালিয়া	Haturia Nakalia	0	f	\N	\N	nuhil/bangladesh-geocode
\.


--
-- Data for Name: Upazila; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Upazila" (id, "districtId", name, slug, code, "createdAt", "updatedAt", "isActive", "nameBn", "nameEn", "sortOrder", "isVerified", latitude, longitude, source) FROM stdin;
cmozwcvwv001z408og5wm9n80	cmozwcvj4000d408or3dz7jdo	Ruma	ruma-upazila	20030091	2026-05-10 14:57:31.279	2026-05-10 16:52:37.356	t	\N	Ruma	0	t	22.0077783	92.4485518	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvx30020408o1i4n4r7e	cmozwcvj4000d408or3dz7jdo	Thanchi	thanchi-upazila	20030095	2026-05-10 14:57:31.287	2026-05-10 16:52:37.36	t	\N	Thanchi	0	t	21.6426173	92.5332619	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvxc0021408or7329h6u	cmozwcvjk000e408o5c0ntuyt	Akhaura	akhaura-upazila	20120002	2026-05-10 14:57:31.296	2026-05-10 16:52:37.363	t	\N	Akhaura	0	t	23.8406693	91.1901894	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmoxc1cdi000aig8olmayuzcb	cmoxc1cd90009ig8ona9jnhsx	Placeholder Upazila	dhanmondi-model-upazila-placeholder	\N	2026-05-08 19:53:08.07	2026-05-08 19:53:08.07	t	\N	Placeholder Upazila	0	f	\N	\N	\N
cmoxc48j7000eac8o89tszysp	cmoxc1cd90009ig8ona9jnhsx	Dhanmondi (sample upazila)	sample-dhanmondi-upazila	999901	2026-05-08 19:55:23.059	2026-05-08 19:55:40.75	t	\N	Dhanmondi (sample upazila)	0	f	\N	\N	\N
cmozwcvxk0022408o31m692rt	cmozwcvjk000e408o5c0ntuyt	Ashuganj	ashuganj-upazila	20120033	2026-05-10 14:57:31.304	2026-05-10 16:52:37.367	t	\N	Ashuganj	0	t	24.0181416	91.0183375	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvxs0023408oc009lq41	cmozwcvjk000e408o5c0ntuyt	Banchharampur	banchharampur-upazila	20120004	2026-05-10 14:57:31.312	2026-05-10 16:52:37.37	t	\N	Banchharampur	0	t	23.7805341	90.8073225	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmoxcg57o000lmg8o2oars5m7	cmoxc1cd90009ig8ona9jnhsx	Savar Upazila	savar-upazila	302633	2026-05-08 20:04:38.628	2026-05-10 12:25:35.19	t	\N	Savar Upazila	0	f	\N	\N	\N
cmoxcg57u000mmg8osw89z83y	cmoxcg57g000kmg8oujmjoxaq	Gazipur Sadar Upazila	gazipur-sadar-upazila	303318	2026-05-08 20:04:38.634	2026-05-10 12:25:35.197	t	\N	Gazipur Sadar Upazila	0	f	\N	\N	\N
cmozwcvy00024408okchdszxm	cmozwcvjk000e408o5c0ntuyt	Bijoynagar	bijoynagar-upazila	20120007	2026-05-10 14:57:31.32	2026-05-10 16:52:37.374	t	\N	Bijoynagar	0	t	23.9915301	91.2273684	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvya0025408oji6l0509	cmozwcvjk000e408o5c0ntuyt	Brahmanbaria Sadar	brahmanbaria-sadar-upazila	20120013	2026-05-10 14:57:31.33	2026-05-10 16:52:37.377	t	\N	Brahmanbaria Sadar	0	t	23.9499312	91.1159454	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvyi0026408o2h70teia	cmozwcvjk000e408o5c0ntuyt	Kasba	kasba-upazila	20120063	2026-05-10 14:57:31.338	2026-05-10 16:52:37.381	t	\N	Kasba	0	t	23.7608680	91.1313241	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvyp0027408ohnhab8j7	cmozwcvjk000e408o5c0ntuyt	Nabinagar	nabinagar-upazila	20120085	2026-05-10 14:57:31.345	2026-05-10 16:52:37.384	t	\N	Nabinagar	0	t	23.8632701	90.9796730	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvyw0028408ot9a6vljz	cmozwcvjk000e408o5c0ntuyt	Nasirnagar	nasirnagar-upazila	20120090	2026-05-10 14:57:31.352	2026-05-10 16:52:37.388	t	\N	Nasirnagar	0	t	24.1822601	91.1871252	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvz30029408orlsll997	cmozwcvjk000e408o5c0ntuyt	Sarail	sarail-upazila	20120094	2026-05-10 14:57:31.36	2026-05-10 16:52:37.391	t	\N	Sarail	0	t	24.1025087	91.1132375	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvza002a408oia2tb8kg	cmozwcvju000f408oucpwdysr	Chandpur Sadar	chandpur-sadar-upazila	20130022	2026-05-10 14:57:31.366	2026-05-10 16:52:37.395	t	\N	Chandpur Sadar	0	t	23.2317516	90.6513703	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvzi002b408oghnhx3ud	cmozwcvju000f408oucpwdysr	Faridganj	faridganj-upazila	20130045	2026-05-10 14:57:31.374	2026-05-10 16:52:37.399	t	\N	Faridganj	0	t	23.1441551	90.7619040	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvzq002c408owvuircb3	cmozwcvju000f408oucpwdysr	Haimchar	haimchar-upazila	20130047	2026-05-10 14:57:31.382	2026-05-10 16:52:37.404	t	\N	Haimchar	0	t	23.0766090	90.6171665	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvzy002d408on6z9a3kv	cmozwcvju000f408oucpwdysr	Hajiganj	hajiganj-upazila	20130049	2026-05-10 14:57:31.39	2026-05-10 16:52:37.408	t	\N	Hajiganj	0	t	23.2577961	90.8374784	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw05002e408ov15e2wti	cmozwcvju000f408oucpwdysr	Kachua	kachua-upazila	20130058	2026-05-10 14:57:31.397	2026-05-10 16:52:37.411	t	\N	Kachua	0	t	23.3592655	90.8828927	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw0d002f408oh4zrqgkh	cmozwcvju000f408oucpwdysr	Matlab Dakkhin	matlab-dakkhin-upazila	20130076	2026-05-10 14:57:31.405	2026-05-10 16:52:37.415	t	\N	Matlab Dakkhin	0	t	23.3481506	90.7473094	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw0k002g408o1gv4xsps	cmozwcvju000f408oucpwdysr	Matlab Uttar	matlab-uttar-upazila	20130079	2026-05-10 14:57:31.412	2026-05-10 16:52:37.419	t	\N	Matlab Uttar	0	t	23.4101348	90.6410634	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw0r002h408o0fampbrj	cmozwcvju000f408oucpwdysr	Shahrasti	shahrasti-upazila	20130095	2026-05-10 14:57:31.419	2026-05-10 16:52:37.423	t	\N	Shahrasti	0	t	23.2058786	90.9569172	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw0y002i408ojo194erb	cmozwcvk3000g408ocignwjl4	Anwara	anwara-upazila	20150004	2026-05-10 14:57:31.426	2026-05-10 16:52:37.426	t	\N	Anwara	0	t	22.1975739	91.8786927	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw18002j408ooiydjja6	cmozwcvk3000g408ocignwjl4	Banshkhali	banshkhali-upazila	20150008	2026-05-10 14:57:31.436	2026-05-10 16:52:37.43	t	\N	Banshkhali	0	t	22.0172708	91.9380992	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozqxhyn0011zo8oeum3cm8h	cmozqxhy2000yzo8oqgylx1er	Gopalganj Sadar	gopalganj-sadar-upazila	30350032	2026-05-10 12:25:35.279	2026-05-10 16:52:37.806	t	\N	Gopalganj Sadar	10	t	23.0605618	89.8476736	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvvl001u408os3zr05jr	cmozwcvj4000d408or3dz7jdo	Alikadam	alikadam-upazila	20030004	2026-05-10 14:57:31.233	2026-05-10 16:52:37.336	t	\N	Alikadam	0	t	21.5961858	92.4033711	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvvw001v408olw6mck9t	cmozwcvj4000d408or3dz7jdo	Bandarban Sadar	bandarban-sadar-upazila	20030014	2026-05-10 14:57:31.244	2026-05-10 16:52:37.341	t	\N	Bandarban Sadar	0	t	22.0654553	92.2326660	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvw4001w408oggsqudh4	cmozwcvj4000d408or3dz7jdo	Lama	lama-upazila	20030051	2026-05-10 14:57:31.252	2026-05-10 16:52:37.345	t	\N	Lama	0	t	21.8102883	92.2115619	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvwd001x408oim342olw	cmozwcvj4000d408or3dz7jdo	Naikkhongchhari	naikkhongchhari-upazila	20030073	2026-05-10 14:57:31.261	2026-05-10 16:52:37.348	t	\N	Naikkhongchhari	0	t	21.4713962	92.2429766	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcvwm001y408oz2yk5hzo	cmozwcvj4000d408or3dz7jdo	Rowangchhari	rowangchhari-upazila	20030089	2026-05-10 14:57:31.27	2026-05-10 16:52:37.352	t	\N	Rowangchhari	0	t	22.1994028	92.3519102	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw2v002r408orzg66oom	cmozwcvk3000g408ocignwjl4	Patiya	patiya-upazila	20150061	2026-05-10 14:57:31.495	2026-05-10 16:52:37.461	t	\N	Patiya	0	t	22.2931417	91.9874206	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw35002s408ou637b00w	cmozwcvk3000g408ocignwjl4	Rangunia	rangunia-upazila	20150070	2026-05-10 14:57:31.505	2026-05-10 16:52:37.465	t	\N	Rangunia	0	t	22.4661776	92.0683468	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw3e002t408o6bwy3vif	cmozwcvk3000g408ocignwjl4	Raozan	raozan-upazila	20150074	2026-05-10 14:57:31.514	2026-05-10 16:52:37.469	t	\N	Raozan	0	t	22.5196513	91.9172793	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw3l002u408ok63hc0m1	cmozwcvk3000g408ocignwjl4	Sandwip	sandwip-upazila	20150078	2026-05-10 14:57:31.521	2026-05-10 16:52:37.472	t	\N	Sandwip	0	t	22.5106171	91.4578793	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw3s002v408oq6583vlw	cmozwcvk3000g408ocignwjl4	Satkania	satkania-upazila	20150082	2026-05-10 14:57:31.528	2026-05-10 16:52:37.476	t	\N	Satkania	0	t	22.1059259	92.0595088	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw3z002w408odgkeg23g	cmozwcvk3000g408ocignwjl4	Sitakunda	sitakunda-upazila	20150086	2026-05-10 14:57:31.535	2026-05-10 16:52:37.48	t	\N	Sitakunda	0	t	22.5430323	91.6569015	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw46002x408otjdqioqz	cmozwcvkj000i408os1f32ab8	Chakaria	chakaria-upazila	20220016	2026-05-10 14:57:31.542	2026-05-10 16:52:37.484	t	\N	Chakaria	0	t	21.7411092	92.0517345	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw4k002z408o4y6ory9l	cmozwcvkj000i408os1f32ab8	Eidgaon	eidgaon-upazila	20220032	2026-05-10 14:57:31.556	2026-05-10 16:52:37.491	t	\N	Eidgaon	0	t	21.5558208	92.0591578	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw4r0030408oqx3aw7f4	cmozwcvkj000i408os1f32ab8	Kutubdia	kutubdia-upazila	20220045	2026-05-10 14:57:31.563	2026-05-10 16:52:37.495	t	\N	Kutubdia	0	t	21.8380068	91.8625446	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw4y0031408o42ml8d8j	cmozwcvkj000i408os1f32ab8	Maheshkhali	maheshkhali-upazila	20220049	2026-05-10 14:57:31.57	2026-05-10 16:52:37.499	t	\N	Maheshkhali	0	t	21.6071892	91.9195588	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw540032408oe9gia2ls	cmozwcvkj000i408os1f32ab8	Pekua	pekua-upazila	20220056	2026-05-10 14:57:31.576	2026-05-10 16:52:37.502	t	\N	Pekua	0	t	21.8159394	91.9447448	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw5b0033408o5dj59lvn	cmozwcvkj000i408os1f32ab8	Ramu	ramu-upazila	20220066	2026-05-10 14:57:31.583	2026-05-10 16:52:37.506	t	\N	Ramu	0	t	21.4387877	92.1203641	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw5i0034408ou93vjvk7	cmozwcvkj000i408os1f32ab8	Teknaf	teknaf-upazila	20220090	2026-05-10 14:57:31.59	2026-05-10 16:52:37.51	t	\N	Teknaf	0	t	20.9692511	92.2370677	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw5o0035408ocn0knbs2	cmozwcvkj000i408os1f32ab8	Ukhia	ukhia-upazila	20220094	2026-05-10 14:57:31.596	2026-05-10 16:52:37.514	t	\N	Ukhia	0	t	21.2280628	92.1153365	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw5u0036408oc42ym1u1	cmozwcvkb000h408opkb53bfd	Adarsha Sadar	adarsha-sadar-upazila	20190067	2026-05-10 14:57:31.602	2026-05-10 16:52:37.518	t	\N	Adarsha Sadar	0	t	23.4797753	91.1567451	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw610037408opisugy0z	cmozwcvkb000h408opkb53bfd	Barura	barura-upazila	20190009	2026-05-10 14:57:31.609	2026-05-10 16:52:37.521	t	\N	Barura	0	t	23.3568851	91.0400261	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw680038408o52a2au1n	cmozwcvkb000h408opkb53bfd	Brahmanpara	brahmanpara-upazila	20190015	2026-05-10 14:57:31.616	2026-05-10 16:52:37.526	t	\N	Brahmanpara	0	t	23.6470110	91.0959584	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw6e0039408ok3svi20z	cmozwcvkb000h408opkb53bfd	Burichang	burichang-upazila	20190018	2026-05-10 14:57:31.622	2026-05-10 16:52:37.529	t	\N	Burichang	0	t	23.5351826	91.1168725	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw6l003a408okeo8t987	cmozwcvkb000h408opkb53bfd	Chandina	chandina-upazila	20190027	2026-05-10 14:57:31.629	2026-05-10 16:52:37.533	t	\N	Chandina	0	t	23.4462793	90.9448151	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw6s003b408ohv2cjmbb	cmozwcvkb000h408opkb53bfd	Chauddagram	chauddagram-upazila	20190031	2026-05-10 14:57:31.636	2026-05-10 16:52:37.537	t	\N	Chauddagram	0	t	23.2218368	91.2796943	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw6y003c408o8auj2i65	cmozwcvkb000h408opkb53bfd	Daudkandi	daudkandi-upazila	20190036	2026-05-10 14:57:31.642	2026-05-10 16:52:37.541	t	\N	Daudkandi	0	t	23.5029379	90.7731024	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw75003d408o33qfovr4	cmozwcvkb000h408opkb53bfd	Debidwar	debidwar-upazila	20190040	2026-05-10 14:57:31.649	2026-05-10 16:52:37.545	t	\N	Debidwar	0	t	23.5797482	90.9980865	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw7c003e408opcyxhdx0	cmozwcvkb000h408opkb53bfd	Homna	homna-upazila	20190054	2026-05-10 14:57:31.656	2026-05-10 16:52:37.548	t	\N	Homna	0	t	23.6800024	90.8114988	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw7j003f408oh55uaz0l	cmozwcvkb000h408opkb53bfd	Laksam	laksam-upazila	20190072	2026-05-10 14:57:31.663	2026-05-10 16:52:37.552	t	\N	Laksam	0	t	23.2314436	91.1048765	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw1m002l408oyx6au1sc	cmozwcvk3000g408ocignwjl4	Chandanaish	chandanaish-upazila	20150018	2026-05-10 14:57:31.45	2026-05-10 16:52:37.438	t	\N	Chandanaish	0	t	22.2123993	92.0645401	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw1t002m408osgwwrrca	cmozwcvk3000g408ocignwjl4	Fatikchhari	fatikchhari-upazila	20150033	2026-05-10 14:57:31.457	2026-05-10 16:52:37.442	t	\N	Fatikchhari	0	t	22.7554582	91.7488675	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw20002n408ozre0lgrx	cmozwcvk3000g408ocignwjl4	Hathazari	hathazari-upazila	20150037	2026-05-10 14:57:31.464	2026-05-10 16:52:37.446	t	\N	Hathazari	0	t	22.5261990	91.7978504	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw27002o408o2srljs57	cmozwcvk3000g408ocignwjl4	Karnaphuli	karnaphuli-upazila	20150039	2026-05-10 14:57:31.471	2026-05-10 16:52:37.449	t	\N	Karnaphuli	0	t	22.2871959	91.8460119	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw2e002p408obeo976wt	cmozwcvk3000g408ocignwjl4	Lohagara	lohagara-upazila	20150047	2026-05-10 14:57:31.478	2026-05-10 16:52:37.453	t	\N	Lohagara	0	t	21.9860743	92.1120488	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw2m002q408o9sgp3i9f	cmozwcvk3000g408ocignwjl4	Mirsarai	mirsarai-upazila	20150053	2026-05-10 14:57:31.486	2026-05-10 16:52:37.457	t	\N	Mirsarai	0	t	22.8038503	91.5475608	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw93003n408o766xb4rx	cmozwcvkr000j408o0ep4ncfj	Chhagalnaiya	chhagalnaiya-upazila	20300014	2026-05-10 14:57:31.719	2026-05-10 16:52:37.582	t	\N	Chhagalnaiya	0	t	23.0201693	91.5065111	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw9a003o408otrfpgryz	cmozwcvkr000j408o0ep4ncfj	Daganbhuiyan	daganbhuiyan-upazila	20300025	2026-05-10 14:57:31.726	2026-05-10 16:52:37.586	t	\N	Daganbhuiyan	0	t	22.9720260	91.2999712	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw9h003p408o93ypjeny	cmozwcvkr000j408o0ep4ncfj	Feni Sadar	feni-sadar-upazila	20300029	2026-05-10 14:57:31.733	2026-05-10 16:52:37.59	t	\N	Feni Sadar	0	t	22.9907131	91.4158572	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw9o003q408o0cu2w7rb	cmozwcvkr000j408o0ep4ncfj	Fulgazi	fulgazi-upazila	20300041	2026-05-10 14:57:31.74	2026-05-10 16:52:37.593	t	\N	Fulgazi	0	t	23.1184647	91.4416440	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw9v003r408o6oxpk6uo	cmozwcvkr000j408o0ep4ncfj	Parashuram	parashuram-upazila	20300051	2026-05-10 14:57:31.747	2026-05-10 16:52:37.597	t	\N	Parashuram	0	t	23.2024419	91.4384919	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwa2003s408or2b6xcjo	cmozwcvkr000j408o0ep4ncfj	Sonagazi	sonagazi-upazila	20300094	2026-05-10 14:57:31.754	2026-05-10 16:52:37.6	t	\N	Sonagazi	0	t	22.8537502	91.3968780	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwa9003t408oajfpkl70	cmozwcvkz000k408ogx482m5w	Dighinala	dighinala-upazila	20460043	2026-05-10 14:57:31.761	2026-05-10 16:52:37.604	t	\N	Dighinala	0	t	23.4157964	92.0590041	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwag003u408oidocz6l0	cmozwcvkz000k408ogx482m5w	Guimara	guimara-upazila	20460047	2026-05-10 14:57:31.768	2026-05-10 16:52:37.607	t	\N	Guimara	0	t	22.9581606	91.9226413	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwan003v408ou68tt60j	cmozwcvkz000k408ogx482m5w	Khagrachhari Sadar	khagrachhari-sadar-upazila	20460049	2026-05-10 14:57:31.775	2026-05-10 16:52:37.611	t	\N	Khagrachhari Sadar	0	t	23.1584027	91.9983411	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwau003w408opo47as2l	cmozwcvkz000k408ogx482m5w	Lakkhichhari	lakkhichhari-upazila	20460061	2026-05-10 14:57:31.782	2026-05-10 16:52:37.614	t	\N	Lakkhichhari	0	t	22.7836165	91.9310794	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwb1003x408olv3zkxw0	cmozwcvkz000k408ogx482m5w	Mahalchhari	mahalchhari-upazila	20460065	2026-05-10 14:57:31.789	2026-05-10 16:52:37.618	t	\N	Mahalchhari	0	t	22.9835062	92.0494555	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwb8003y408op6ly159q	cmozwcvkz000k408ogx482m5w	Manikchhari	manikchhari-upazila	20460067	2026-05-10 14:57:31.796	2026-05-10 16:52:37.622	t	\N	Manikchhari	0	t	22.8518691	91.8267801	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwbf003z408oxwwq4sle	cmozwcvkz000k408ogx482m5w	Matiranga	matiranga-upazila	20460070	2026-05-10 14:57:31.803	2026-05-10 16:52:37.626	t	\N	Matiranga	0	t	23.1626845	91.8549113	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwbl0040408oajddjuu7	cmozwcvkz000k408ogx482m5w	Panchhari	panchhari-upazila	20460077	2026-05-10 14:57:31.81	2026-05-10 16:52:37.629	t	\N	Panchhari	0	t	23.3421868	91.9245874	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwbt0041408ofx46vq81	cmozwcvkz000k408ogx482m5w	Ramgarh	ramgarh-upazila	20460080	2026-05-10 14:57:31.817	2026-05-10 16:52:37.633	t	\N	Ramgarh	0	t	22.9540374	91.7761299	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwc00042408of07ukkcu	cmozwcvl7000l408o3cevck6l	Kamalnagar	kamalnagar-upazila	20510033	2026-05-10 14:57:31.824	2026-05-10 16:52:37.637	t	\N	Kamalnagar	0	t	22.7574362	90.8537509	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwc70043408ohap9tq2x	cmozwcvl7000l408o3cevck6l	Lakshmipur Sadar	lakshmipur-sadar-upazila	20510043	2026-05-10 14:57:31.831	2026-05-10 16:52:37.641	t	\N	Lakshmipur Sadar	0	t	22.9112737	90.8438975	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwce0044408ort3fd7ux	cmozwcvl7000l408o3cevck6l	Raipur	raipur-upazila	20510058	2026-05-10 14:57:31.838	2026-05-10 16:52:37.644	t	\N	Raipur	0	t	23.0046942	90.7315260	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwcl0045408os4f46oas	cmozwcvl7000l408o3cevck6l	Ramganj	ramganj-upazila	20510065	2026-05-10 14:57:31.845	2026-05-10 16:52:37.648	t	\N	Ramganj	0	t	23.0967535	90.8727255	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwcr0046408o8p0sl2i2	cmozwcvl7000l408o3cevck6l	Ramgati	ramgati-upazila	20510073	2026-05-10 14:57:31.851	2026-05-10 16:52:37.652	t	\N	Ramgati	0	t	22.6249040	90.9222375	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwcy0047408oocoy54zz	cmozwcvlf000m408odvf1wds4	Begumganj	begumganj-upazila	20750007	2026-05-10 14:57:31.858	2026-05-10 16:52:37.656	t	\N	Begumganj	0	t	22.9309103	91.0942585	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwd50048408ozyeyytv2	cmozwcvlf000m408odvf1wds4	Chatkhil	chatkhil-upazila	20750010	2026-05-10 14:57:31.865	2026-05-10 16:52:37.66	t	\N	Chatkhil	0	t	23.0533338	90.9637230	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwdc0049408o03ow1sf8	cmozwcvlf000m408odvf1wds4	Companiganj	companiganj-upazila	20750021	2026-05-10 14:57:31.872	2026-05-10 16:52:37.663	t	\N	Companiganj	0	t	22.7586597	91.3007588	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwdj004a408o9ur1ph2z	cmozwcvlf000m408odvf1wds4	Hatiya	hatiya-upazila	20750036	2026-05-10 14:57:31.879	2026-05-10 16:52:37.667	t	\N	Hatiya	0	t	22.3481622	91.0914047	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw7y003h408omkazlmzw	cmozwcvkb000h408opkb53bfd	Manoharganj	manoharganj-upazila	20190074	2026-05-10 14:57:31.678	2026-05-10 16:52:37.559	t	\N	Manoharganj	0	t	23.1384696	91.0667073	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw85003i408ohfwmeiff	cmozwcvkb000h408opkb53bfd	Meghna	meghna-upazila	20190075	2026-05-10 14:57:31.685	2026-05-10 16:52:37.563	t	\N	Meghna	0	t	23.6258400	90.6902118	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw8c003j408o8j960nep	cmozwcvkb000h408opkb53bfd	Muradnagar	muradnagar-upazila	20190081	2026-05-10 14:57:31.692	2026-05-10 16:52:37.567	t	\N	Muradnagar	0	t	23.6780963	90.9428117	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw8i003k408oiozneei1	cmozwcvkb000h408opkb53bfd	Nangalkot	nangalkot-upazila	20190087	2026-05-10 14:57:31.698	2026-05-10 16:52:37.57	t	\N	Nangalkot	0	t	23.1402523	91.2090993	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw8q003l408o6benq029	cmozwcvkb000h408opkb53bfd	Sadar Dakkhin	sadar-dakkhin-upazila	20190033	2026-05-10 14:57:31.706	2026-05-10 16:52:37.574	t	\N	Sadar Dakkhin	0	t	23.3883352	91.2022115	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw8w003m408oz7jw2bm6	cmozwcvkb000h408opkb53bfd	Titas	titas-upazila	20190094	2026-05-10 14:57:31.712	2026-05-10 16:52:37.578	t	\N	Titas	0	t	23.5909055	90.7955103	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwf4004i408on9wb2n39	cmozwcvlm000n408o7mwgw1ga	Belaichhari	belaichhari-upazila	20840029	2026-05-10 14:57:31.936	2026-05-10 16:52:37.704	t	\N	Belaichhari	0	t	22.2574125	92.4831397	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwfb004j408o3u27bv3p	cmozwcvlm000n408o7mwgw1ga	Jurachhari	jurachhari-upazila	20840047	2026-05-10 14:57:31.943	2026-05-10 16:52:37.708	t	\N	Jurachhari	0	t	22.5593090	92.4554963	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwfi004k408oxmnj068b	cmozwcvlm000n408o7mwgw1ga	Kaptai	kaptai-upazila	20840036	2026-05-10 14:57:31.95	2026-05-10 16:52:37.711	t	\N	Kaptai	0	t	22.4623668	92.2016633	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwfp004l408oval4p47c	cmozwcvlm000n408o7mwgw1ga	Kawkhali	kawkhali-upazila	20840025	2026-05-10 14:57:31.957	2026-05-10 16:52:37.716	t	\N	Kawkhali	0	t	22.6234892	92.0122707	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwfv004m408oukoiryq5	cmozwcvlm000n408o7mwgw1ga	Langadu	langadu-upazila	20840058	2026-05-10 14:57:31.963	2026-05-10 16:52:37.72	t	\N	Langadu	0	t	22.9700899	92.2166550	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwg1004n408os46jw63e	cmozwcvlm000n408o7mwgw1ga	Naniarchar	naniarchar-upazila	20840075	2026-05-10 14:57:31.969	2026-05-10 16:52:37.724	t	\N	Naniarchar	0	t	22.8336554	92.0726349	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwg8004o408ocp4toe3j	cmozwcvlm000n408o7mwgw1ga	Rajasthali	rajasthali-upazila	20840078	2026-05-10 14:57:31.976	2026-05-10 16:52:37.729	t	\N	Rajasthali	0	t	22.3715840	92.2445794	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwge004p408o9dgcv92o	cmozwcvlm000n408o7mwgw1ga	Rangamati Sadar	rangamati-sadar-upazila	20840087	2026-05-10 14:57:31.982	2026-05-10 16:52:37.733	t	\N	Rangamati Sadar	0	t	22.6451223	92.2013639	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwgl004q408o0mdrfb9l	cmoxc1cd90009ig8ona9jnhsx	Dhamrai	dhamrai-upazila	30260014	2026-05-10 14:57:31.989	2026-05-10 16:52:37.736	t	\N	Dhamrai	0	t	23.9389783	90.1408035	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwgr004r408od4cx7vnr	cmoxc1cd90009ig8ona9jnhsx	Dohar	dohar-upazila	30260018	2026-05-10 14:57:31.995	2026-05-10 16:52:37.74	t	\N	Dohar	0	t	23.6015796	90.1084063	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwgx004s408owcn9irxo	cmoxc1cd90009ig8ona9jnhsx	Keraniganj	keraniganj-upazila	30260038	2026-05-10 14:57:32.001	2026-05-10 16:52:37.744	t	\N	Keraniganj	0	t	23.6943306	90.3436578	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwh3004t408ohe7hj3xu	cmoxc1cd90009ig8ona9jnhsx	Nawabganj	nawabganj-upazila	30260062	2026-05-10 14:57:32.007	2026-05-10 16:52:37.748	t	\N	Nawabganj	0	t	23.6724259	90.1608013	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwha004u408ojw3mld1b	cmoxc1cd90009ig8ona9jnhsx	Savar	savar-upazila-1	30260072	2026-05-10 14:57:32.014	2026-05-10 16:52:37.751	t	\N	Savar	0	t	23.8799512	90.2805712	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwhh004v408oj79uw3k8	cmozqxhyg0010zo8oxnb8hecl	Alfadanga	alfadanga-upazila	30290003	2026-05-10 14:57:32.021	2026-05-10 16:52:37.755	t	\N	Alfadanga	0	t	23.2951349	89.6703301	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwhn004w408oals5wrmf	cmozqxhyg0010zo8oxnb8hecl	Bhanga	bhanga-upazila	30290010	2026-05-10 14:57:32.027	2026-05-10 16:52:37.759	t	\N	Bhanga	0	t	23.3891005	90.0100025	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwht004x408ov978wc6m	cmozqxhyg0010zo8oxnb8hecl	Boalmari	boalmari-upazila	30290018	2026-05-10 14:57:32.033	2026-05-10 16:52:37.763	t	\N	Boalmari	0	t	23.3986763	89.6924221	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwi0004y408ox8dzjj2n	cmozqxhyg0010zo8oxnb8hecl	Char Bhadrasan	char-bhadrasan-upazila	30290021	2026-05-10 14:57:32.04	2026-05-10 16:52:37.766	t	\N	Char Bhadrasan	0	t	23.5900505	89.9801270	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozqxhyy0013zo8o01av8gas	cmozqxhyg0010zo8oxnb8hecl	Faridpur Sadar	faridpur-sadar-upazila	30290047	2026-05-10 12:25:35.29	2026-05-10 16:52:37.77	t	\N	Faridpur Sadar	10	t	23.5974305	89.8127244	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwie004z408o5m7cfj5c	cmozqxhyg0010zo8oxnb8hecl	Madhukhali	madhukhali-upazila	30290056	2026-05-10 14:57:32.054	2026-05-10 16:52:37.774	t	\N	Madhukhali	0	t	23.5411001	89.6111276	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwil0050408o35vzjv1l	cmozqxhyg0010zo8oxnb8hecl	Nagarkanda	nagarkanda-upazila	30290062	2026-05-10 14:57:32.061	2026-05-10 16:52:37.778	t	\N	Nagarkanda	0	t	23.4343325	89.8956224	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwir0051408op6w94njt	cmozqxhyg0010zo8oxnb8hecl	Sadarpur	sadarpur-upazila	30290084	2026-05-10 14:57:32.067	2026-05-10 16:52:37.781	t	\N	Sadarpur	0	t	23.4984125	90.0509252	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwiy0052408ognfm7rb7	cmozqxhyg0010zo8oxnb8hecl	Saltha	saltha-upazila	30290090	2026-05-10 14:57:32.074	2026-05-10 16:52:37.785	t	\N	Saltha	0	t	23.4180452	89.8007856	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwj50053408olm5kfuzk	cmoxcg57g000kmg8oujmjoxaq	Gazipur Sadar	gazipur-sadar-upazila-1	30330030	2026-05-10 14:57:32.081	2026-05-10 16:52:37.788	t	\N	Gazipur Sadar	0	t	24.0848611	90.4247559	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwjc0054408ogkx0pf73	cmoxcg57g000kmg8oujmjoxaq	Kaliakair	kaliakair-upazila	30330032	2026-05-10 14:57:32.088	2026-05-10 16:52:37.792	t	\N	Kaliakair	0	t	24.1022140	90.2655522	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwdx004c408oqvkph7pk	cmozwcvlf000m408odvf1wds4	Noakhali Sadar	noakhali-sadar-upazila	20750087	2026-05-10 14:57:31.893	2026-05-10 16:52:37.676	t	\N	Noakhali Sadar	0	t	22.8083273	91.0487086	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwe4004d408o5rncxi46	cmozwcvlf000m408odvf1wds4	Senbag	senbag-upazila	20750080	2026-05-10 14:57:31.9	2026-05-10 16:52:37.681	t	\N	Senbag	0	t	22.9906388	91.2126741	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwed004e408oac8n4exg	cmozwcvlf000m408odvf1wds4	Sonaimuri	sonaimuri-upazila	20750083	2026-05-10 14:57:31.909	2026-05-10 16:52:37.685	t	\N	Sonaimuri	0	t	23.0262944	91.0778317	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwek004f408ov4r0o6e1	cmozwcvlf000m408odvf1wds4	Subarnachar	subarnachar-upazila	20750085	2026-05-10 14:57:31.916	2026-05-10 16:52:37.691	t	\N	Subarnachar	0	t	22.6192346	91.1564017	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwer004g408oo8lx17ft	cmozwcvlm000n408o7mwgw1ga	Baghaichhari	baghaichhari-upazila	20840007	2026-05-10 14:57:31.923	2026-05-10 16:52:37.695	t	\N	Baghaichhari	0	t	23.3828072	92.2371430	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwey004h408ow9o35up2	cmozwcvlm000n408o7mwgw1ga	Barkal	barkal-upazila	20840021	2026-05-10 14:57:31.93	2026-05-10 16:52:37.699	t	\N	Barkal	0	t	22.8309591	92.3461332	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwl4005d408oucxsbeun	cmozwcvmi000o408o1nqt69m0	Bajitpur	bajitpur-upazila	30480006	2026-05-10 14:57:32.152	2026-05-10 16:52:37.828	t	\N	Bajitpur	0	t	24.2266224	90.9484636	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwla005e408opz9mju4e	cmozwcvmi000o408o1nqt69m0	Bhairab	bhairab-upazila	30480011	2026-05-10 14:57:32.158	2026-05-10 16:52:37.831	t	\N	Bhairab	0	t	24.1022111	90.9812041	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwlh005f408o1wzruflg	cmozwcvmi000o408o1nqt69m0	Hossainpur	hossainpur-upazila	30480027	2026-05-10 14:57:32.165	2026-05-10 16:52:37.834	t	\N	Hossainpur	0	t	24.4483277	90.6633544	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwlo005g408o0nexocqx	cmozwcvmi000o408o1nqt69m0	Itna	itna-upazila	30480033	2026-05-10 14:57:32.172	2026-05-10 16:52:37.838	t	\N	Itna	0	t	24.5509333	91.0840497	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwlv005h408o82tuf6ky	cmozwcvmi000o408o1nqt69m0	Karimganj	karimganj-upazila	30480042	2026-05-10 14:57:32.179	2026-05-10 16:52:37.842	t	\N	Karimganj	0	t	24.4543404	90.8963534	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwm1005i408okvy3qxz7	cmozwcvmi000o408o1nqt69m0	Katiadi	katiadi-upazila	30480045	2026-05-10 14:57:32.185	2026-05-10 16:52:37.845	t	\N	Katiadi	0	t	24.2952187	90.8208467	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwm7005j408oyox6ex8s	cmozwcvmi000o408o1nqt69m0	Kishoreganj Sadar	kishoreganj-sadar-upazila	30480049	2026-05-10 14:57:32.191	2026-05-10 16:52:37.849	t	\N	Kishoreganj Sadar	0	t	24.4259499	90.7832559	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwme005k408oygvx3ebd	cmozwcvmi000o408o1nqt69m0	Kuliarchar	kuliarchar-upazila	30480054	2026-05-10 14:57:32.198	2026-05-10 16:52:37.852	t	\N	Kuliarchar	0	t	24.1531106	90.8866131	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwml005l408ocxxmac0q	cmozwcvmi000o408o1nqt69m0	Mithamain	mithamain-upazila	30480059	2026-05-10 14:57:32.205	2026-05-10 16:52:37.856	t	\N	Mithamain	0	t	24.4331486	91.1109007	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwmr005m408o2z8ydedn	cmozwcvmi000o408o1nqt69m0	Nikli	nikli-upazila	30480076	2026-05-10 14:57:32.211	2026-05-10 16:52:37.859	t	\N	Nikli	0	t	24.3382807	90.9609384	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwmx005n408og7ts9g6t	cmozwcvmi000o408o1nqt69m0	Pakundia	pakundia-upazila	30480079	2026-05-10 14:57:32.217	2026-05-10 16:52:37.863	t	\N	Pakundia	0	t	24.3214890	90.6936613	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwn4005o408o2engn65t	cmozwcvmi000o408o1nqt69m0	Tarail	tarail-upazila	30480092	2026-05-10 14:57:32.224	2026-05-10 16:52:37.866	t	\N	Tarail	0	t	24.5508708	90.8905390	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwna005p408ovwyy246t	cmozwcvmq000p408o7vpvisde	Dasar	dasar-upazila	30540018	2026-05-10 14:57:32.23	2026-05-10 16:52:37.87	t	\N	Dasar	0	t	23.0920378	90.1606843	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwng005q408oqq038cjg	cmozwcvmq000p408o7vpvisde	Kalkini	kalkini-upazila	30540040	2026-05-10 14:57:32.236	2026-05-10 16:52:37.874	t	\N	Kalkini	0	t	23.0670211	90.2806802	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwnm005r408ol87f12dp	cmozwcvmq000p408o7vpvisde	Madaripur Sadar	madaripur-sadar-upazila	30540054	2026-05-10 14:57:32.242	2026-05-10 16:52:37.878	t	\N	Madaripur Sadar	0	t	23.1912201	90.1783970	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwnt005s408ow5msdrav	cmozwcvmq000p408o7vpvisde	Rajoir	rajoir-upazila	30540080	2026-05-10 14:57:32.249	2026-05-10 16:52:37.881	t	\N	Rajoir	0	t	23.2020804	90.0385699	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwnz005t408o375riw7g	cmozwcvmq000p408o7vpvisde	Shibchar	shibchar-upazila	30540087	2026-05-10 14:57:32.255	2026-05-10 16:52:37.886	t	\N	Shibchar	0	t	23.3731997	90.1759497	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwo5005u408ouo5up83x	cmozwcvmy000q408ouxd62bmm	Daulatpur	daulatpur-upazila	30560010	2026-05-10 14:57:32.261	2026-05-10 16:52:37.89	t	\N	Daulatpur	0	t	23.9561941	89.7986383	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwob005v408o4fqnebtv	cmozwcvmy000q408ouxd62bmm	Ghior	ghior-upazila	30560022	2026-05-10 14:57:32.267	2026-05-10 16:52:37.897	t	\N	Ghior	0	t	23.8744137	89.9038819	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwoi005w408obhoh7xmb	cmozwcvmy000q408ouxd62bmm	Harirampur	harirampur-upazila	30560028	2026-05-10 14:57:32.274	2026-05-10 16:52:37.902	t	\N	Harirampur	0	t	23.7206671	89.9458776	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwoo005x408opthked81	cmozwcvmy000q408ouxd62bmm	Manikganj Sadar	manikganj-sadar-upazila	30560046	2026-05-10 14:57:32.28	2026-05-10 16:52:37.907	t	\N	Manikganj Sadar	0	t	23.8366552	90.0299534	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwou005y408o46q3ue0n	cmozwcvmy000q408ouxd62bmm	Saturia	saturia-upazila	30560070	2026-05-10 14:57:32.286	2026-05-10 16:52:37.912	t	\N	Saturia	0	t	23.9584792	90.0010421	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwp0005z408ovpoetkz0	cmozwcvmy000q408ouxd62bmm	Shibalay	shibalay-upazila	30560078	2026-05-10 14:57:32.292	2026-05-10 16:52:37.916	t	\N	Shibalay	0	t	23.8383742	89.8108287	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwp70060408omp4qjj2m	cmozwcvmy000q408ouxd62bmm	Singair	singair-upazila	30560082	2026-05-10 14:57:32.299	2026-05-10 16:52:37.92	t	\N	Singair	0	t	23.7833626	90.1540412	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwjv0057408oet213wos	cmoxcg57g000kmg8oujmjoxaq	Sreepur	sreepur-upazila	30330086	2026-05-10 14:57:32.108	2026-05-10 16:52:37.803	t	\N	Sreepur	0	t	24.2058090	90.4436298	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwk80058408okkhdz8pw	cmozqxhy2000yzo8oqgylx1er	Kashiani	kashiani-upazila	30350043	2026-05-10 14:57:32.12	2026-05-10 16:52:37.81	t	\N	Kashiani	0	t	23.1913134	89.7951900	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwke0059408oehx8kn8q	cmozqxhy2000yzo8oqgylx1er	Kotalipara	kotalipara-upazila	30350051	2026-05-10 14:57:32.126	2026-05-10 16:52:37.814	t	\N	Kotalipara	0	t	23.0105194	90.0201994	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwkl005a408oavtk0k3g	cmozqxhy2000yzo8oqgylx1er	Muksudpur	muksudpur-upazila	30350058	2026-05-10 14:57:32.133	2026-05-10 16:52:37.817	t	\N	Muksudpur	0	t	23.2661495	89.9157569	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwkr005b408oj0swwomg	cmozqxhy2000yzo8oqgylx1er	Tungipara	tungipara-upazila	30350091	2026-05-10 14:57:32.139	2026-05-10 16:52:37.821	t	\N	Tungipara	0	t	22.9235952	89.9022355	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwkx005c408oxuzbfz5w	cmozwcvmi000o408o1nqt69m0	Austagram	austagram-upazila	30480002	2026-05-10 14:57:32.145	2026-05-10 16:52:37.824	t	\N	Austagram	0	t	24.3235869	91.1224956	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwql0068408ogbgyptxy	cmozwcvng000s408o1xij4fx0	Bandar	bandar-upazila	30670006	2026-05-10 14:57:32.35	2026-05-10 16:52:37.952	t	\N	Bandar	0	t	23.6409424	90.5455060	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwqs0069408o37vu3e7y	cmozwcvng000s408o1xij4fx0	Narayanganj Sadar	narayanganj-sadar-upazila	30670058	2026-05-10 14:57:32.356	2026-05-10 16:52:37.956	t	\N	Narayanganj Sadar	0	t	23.6127029	90.4696718	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwr0006a408o926j820b	cmozwcvng000s408o1xij4fx0	Rupganj	rupganj-upazila	30670068	2026-05-10 14:57:32.364	2026-05-10 16:52:37.96	t	\N	Rupganj	0	t	23.8124255	90.5400293	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwr7006b408o4eypid5n	cmozwcvng000s408o1xij4fx0	Sonargaon	sonargaon-upazila	30670004	2026-05-10 14:57:32.371	2026-05-10 16:52:37.964	t	\N	Sonargaon	0	t	23.6746542	90.5943013	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwre006c408o859nqsq7	cmozwcvno000t408o3nbdl5xg	Belabo	belabo-upazila	30680007	2026-05-10 14:57:32.378	2026-05-10 16:52:37.968	t	\N	Belabo	0	t	24.1014574	90.8487322	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwrk006d408oj8ixumll	cmozwcvno000t408o3nbdl5xg	Manohardi	manohardi-upazila	30680052	2026-05-10 14:57:32.384	2026-05-10 16:52:37.972	t	\N	Manohardi	0	t	24.1607995	90.7307626	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwrr006e408os1tiwl4c	cmozwcvno000t408o3nbdl5xg	Narsingdi Sadar	narsingdi-sadar-upazila	30680060	2026-05-10 14:57:32.391	2026-05-10 16:52:37.978	t	\N	Narsingdi Sadar	0	t	23.8691189	90.7080225	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwrx006f408ozvsqcpbi	cmozwcvno000t408o3nbdl5xg	Palash	palash-upazila	30680063	2026-05-10 14:57:32.397	2026-05-10 16:52:37.984	t	\N	Palash	0	t	23.9563703	90.6499083	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcws4006g408orhfhyx1h	cmozwcvno000t408o3nbdl5xg	Raipura	raipura-upazila	30680064	2026-05-10 14:57:32.404	2026-05-10 16:52:37.988	t	\N	Raipura	0	t	23.9619464	90.8720913	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwse006h408oeflpt6d1	cmozwcvno000t408o3nbdl5xg	Shibpur	shibpur-upazila	30680076	2026-05-10 14:57:32.414	2026-05-10 16:52:37.992	t	\N	Shibpur	0	t	24.0276477	90.7470128	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwsn006i408os20ys3zw	cmozwcvnw000u408o2fe6jdy2	Baliakandi	baliakandi-upazila	30820007	2026-05-10 14:57:32.423	2026-05-10 16:52:37.997	t	\N	Baliakandi	0	t	23.6506378	89.5517023	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwsu006j408oj0mcml75	cmozwcvnw000u408o2fe6jdy2	Goalanda	goalanda-upazila	30820029	2026-05-10 14:57:32.43	2026-05-10 16:52:38.002	t	\N	Goalanda	0	t	23.7557557	89.7651848	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwt1006k408occwoej2r	cmozwcvnw000u408o2fe6jdy2	Kalukhali	kalukhali-upazila	30820047	2026-05-10 14:57:32.437	2026-05-10 16:52:38.006	t	\N	Kalukhali	0	t	23.7418852	89.4752782	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwt9006l408o2sf1oanm	cmozwcvnw000u408o2fe6jdy2	Pangsha	pangsha-upazila	30820073	2026-05-10 14:57:32.445	2026-05-10 16:52:38.011	t	\N	Pangsha	0	t	23.7889919	89.3877756	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwth006m408onye78hwm	cmozwcvnw000u408o2fe6jdy2	Rajbari Sadar	rajbari-sadar-upazila	30820076	2026-05-10 14:57:32.453	2026-05-10 16:52:38.017	t	\N	Rajbari Sadar	0	t	23.7171842	89.6560642	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwtn006n408o4i674wgx	cmozwcvo4000v408owlccy5yf	Bhedarganj	bhedarganj-upazila	30860014	2026-05-10 14:57:32.459	2026-05-10 16:52:38.021	t	\N	Bhedarganj	0	t	23.2477391	90.5135668	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwtu006o408ow5s6rbbv	cmozwcvo4000v408owlccy5yf	Damudya	damudya-upazila	30860025	2026-05-10 14:57:32.466	2026-05-10 16:52:38.026	t	\N	Damudya	0	t	23.1398997	90.4226411	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwu2006p408o7jmzxyd4	cmozwcvo4000v408owlccy5yf	Gosairhat	gosairhat-upazila	30860036	2026-05-10 14:57:32.474	2026-05-10 16:52:38.031	t	\N	Gosairhat	0	t	23.0816779	90.4569483	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwuc006q408ohnhi9bwl	cmozwcvo4000v408owlccy5yf	Naria	naria-upazila	30860065	2026-05-10 14:57:32.484	2026-05-10 16:52:38.036	t	\N	Naria	0	t	23.3057561	90.4276623	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwuj006r408onw56n2uh	cmozwcvo4000v408owlccy5yf	Shariatpur Sadar	shariatpur-sadar-upazila	30860069	2026-05-10 14:57:32.491	2026-05-10 16:52:38.04	t	\N	Shariatpur Sadar	0	t	23.2188424	90.3167013	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwuq006s408odew5xcj1	cmozwcvo4000v408owlccy5yf	Zajira	zajira-upazila	30860094	2026-05-10 14:57:32.498	2026-05-10 16:52:38.044	t	\N	Zajira	0	t	23.3655839	90.3236872	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwuw006t408oupq979fg	cmozqxhya000zzo8o6lsl370o	Basail	basail-upazila	30930009	2026-05-10 14:57:32.504	2026-05-10 16:52:38.05	t	\N	Basail	0	t	24.2338401	90.0402419	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwv3006u408os1vcykzc	cmozqxhya000zzo8o6lsl370o	Bhuanpur	bhuanpur-upazila	30930019	2026-05-10 14:57:32.511	2026-05-10 16:52:38.055	t	\N	Bhuanpur	0	t	24.4772007	89.8158891	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwv9006v408ohkxcnvaf	cmozqxhya000zzo8o6lsl370o	Delduar	delduar-upazila	30930023	2026-05-10 14:57:32.517	2026-05-10 16:52:38.061	t	\N	Delduar	0	t	24.1475094	89.9389570	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwpj0062408oo7qnx9s7	cmozwcvn9000r408od9gt62pq	Louhajang	louhajang-upazila	30590044	2026-05-10 14:57:32.311	2026-05-10 16:52:37.927	t	\N	Louhajang	0	t	23.4691598	90.3435319	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwpq0063408ofl7p0f6j	cmozwcvn9000r408od9gt62pq	Munshiganj Sadar	munshiganj-sadar-upazila	30590056	2026-05-10 14:57:32.318	2026-05-10 16:52:37.931	t	\N	Munshiganj Sadar	0	t	23.4874675	90.5260722	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwpw0064408oomorbsj3	cmozwcvn9000r408od9gt62pq	Sirajdikhan	sirajdikhan-upazila	30590074	2026-05-10 14:57:32.324	2026-05-10 16:52:37.935	t	\N	Sirajdikhan	0	t	23.5976452	90.3580248	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwq20065408opkldguln	cmozwcvn9000r408od9gt62pq	Sreenagar	sreenagar-upazila	30590084	2026-05-10 14:57:32.33	2026-05-10 16:52:37.94	t	\N	Sreenagar	0	t	23.5463733	90.2635823	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwq90066408ohus1loq9	cmozwcvn9000r408od9gt62pq	Tongibari	tongibari-upazila	30590094	2026-05-10 14:57:32.337	2026-05-10 16:52:37.944	t	\N	Tongibari	0	t	23.4747910	90.4527551	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwqf0067408o019ziqr8	cmozwcvng000s408o1xij4fx0	Araihazar	araihazar-upazila	30670002	2026-05-10 14:57:32.343	2026-05-10 16:52:37.948	t	\N	Araihazar	0	t	23.7643235	90.6693621	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwwq0073408ogwl4o7nk	cmozqxhya000zzo8o6lsl370o	Sakhipur	sakhipur-upazila	30930085	2026-05-10 14:57:32.57	2026-05-10 16:52:38.101	t	\N	Sakhipur	0	t	24.3062616	90.1748612	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozqxhyt0012zo8o5vb4ut4c	cmozqxhya000zzo8o6lsl370o	Tangail Sadar	tangail-sadar-upazila	30930095	2026-05-10 12:25:35.285	2026-05-10 16:52:38.105	t	\N	Tangail Sadar	10	t	24.2596230	89.8670512	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwx50074408omx9nat8j	cmozwcvoh000w408ovws6f26b	Bagerhat Sadar	bagerhat-sadar-upazila	40010008	2026-05-10 14:57:32.585	2026-05-10 16:52:38.11	t	\N	Bagerhat Sadar	0	t	22.6761286	89.7626748	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwxe0075408o6db22h6d	cmozwcvoh000w408ovws6f26b	Chitalmari	chitalmari-upazila	40010014	2026-05-10 14:57:32.594	2026-05-10 16:52:38.117	t	\N	Chitalmari	0	t	22.8111398	89.8652539	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwxl0076408o889cro0b	cmozwcvoh000w408ovws6f26b	Fakirhat	fakirhat-upazila	40010034	2026-05-10 14:57:32.601	2026-05-10 16:52:38.123	t	\N	Fakirhat	0	t	22.7426193	89.6661028	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwxt0077408oif6la2gd	cmozwcvoh000w408ovws6f26b	Kachua	kachua-upazila-1	40010038	2026-05-10 14:57:32.609	2026-05-10 16:52:38.131	t	\N	Kachua	0	t	22.6521382	89.8739452	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwy00078408ooorl1n5e	cmozwcvoh000w408ovws6f26b	Mollahat	mollahat-upazila	40010056	2026-05-10 14:57:32.616	2026-05-10 16:52:38.135	t	\N	Mollahat	0	t	22.8841779	89.7729886	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwy60079408onuzco7xt	cmozwcvoh000w408ovws6f26b	Mongla	mongla-upazila	40010058	2026-05-10 14:57:32.622	2026-05-10 16:52:38.139	t	\N	Mongla	0	t	22.1165374	89.6596649	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwyd007a408orzwpf41z	cmozwcvoh000w408ovws6f26b	Morelganj	morelganj-upazila	40010060	2026-05-10 14:57:32.629	2026-05-10 16:52:38.143	t	\N	Morelganj	0	t	22.4833212	89.8342248	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwyj007b408oaoabpqif	cmozwcvoh000w408ovws6f26b	Rampal	rampal-upazila	40010073	2026-05-10 14:57:32.635	2026-05-10 16:52:38.149	t	\N	Rampal	0	t	22.5903134	89.6513582	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwyq007c408oqofbz071	cmozwcvoh000w408ovws6f26b	Sharankhola	sharankhola-upazila	40010077	2026-05-10 14:57:32.642	2026-05-10 16:52:38.153	t	\N	Sharankhola	0	t	22.0630853	89.8217203	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwyw007d408oyaojkvau	cmozwcvoo000x408o44db4aa5	Alamdanga	alamdanga-upazila	40180007	2026-05-10 14:57:32.648	2026-05-10 16:52:38.157	t	\N	Alamdanga	0	t	23.7295231	88.9082458	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwz2007e408of5ylwar6	cmozwcvoo000x408o44db4aa5	Chuadanga Sadar	chuadanga-sadar-upazila	40180023	2026-05-10 14:57:32.654	2026-05-10 16:52:38.164	t	\N	Chuadanga Sadar	0	t	23.5894572	88.8854483	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwza007f408o69mh5qz5	cmozwcvoo000x408o44db4aa5	Damurhuda	damurhuda-upazila	40180031	2026-05-10 14:57:32.662	2026-05-10 16:52:38.168	t	\N	Damurhuda	0	t	23.5920162	88.7397817	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwzi007g408o9wieeikm	cmozwcvoo000x408o44db4aa5	Jibannagar	jibannagar-upazila	40180055	2026-05-10 14:57:32.67	2026-05-10 16:52:38.172	t	\N	Jibannagar	0	t	23.4429758	88.8502648	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwzr007h408ov1ixcvmg	cmozwcvov000y408owxzvitzg	Abhaynagar	abhaynagar-upazila	40410004	2026-05-10 14:57:32.679	2026-05-10 16:52:38.176	t	\N	Abhaynagar	0	t	23.0177039	89.4196822	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx00007i408osdfkez43	cmozwcvov000y408owxzvitzg	Bagharpara	bagharpara-upazila	40410009	2026-05-10 14:57:32.688	2026-05-10 16:52:38.182	t	\N	Bagharpara	0	t	23.2425305	89.3353901	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx08007j408oznal097k	cmozwcvov000y408owxzvitzg	Chaugachha	chaugachha-upazila	40410011	2026-05-10 14:57:32.696	2026-05-10 16:52:38.188	t	\N	Chaugachha	0	t	23.2632526	89.0232865	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx0g007k408o8z0qagcj	cmozwcvov000y408owxzvitzg	Jashore Sadar	jashore-sadar-upazila	40410047	2026-05-10 14:57:32.704	2026-05-10 16:52:38.195	t	\N	Jashore Sadar	0	t	23.1824784	89.2188564	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx0o007l408ow6inz835	cmozwcvov000y408owxzvitzg	Jhikargachha	jhikargachha-upazila	40410023	2026-05-10 14:57:32.712	2026-05-10 16:52:38.199	t	\N	Jhikargachha	0	t	23.0687307	89.0542848	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx0v007m408osy4w6ofc	cmozwcvov000y408owxzvitzg	Keshabpur	keshabpur-upazila	40410038	2026-05-10 14:57:32.719	2026-05-10 16:52:38.203	t	\N	Keshabpur	0	t	22.8803740	89.2315262	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx13007n408ow6aqaayh	cmozwcvov000y408owxzvitzg	Manirampur	manirampur-upazila	40410061	2026-05-10 14:57:32.727	2026-05-10 16:52:38.207	t	\N	Manirampur	0	t	23.0064561	89.2198615	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx1b007o408ov3gyf6k8	cmozwcvov000y408owxzvitzg	Sharsha	sharsha-upazila	40410090	2026-05-10 14:57:32.735	2026-05-10 16:52:38.212	t	\N	Sharsha	0	t	23.0447921	88.9410970	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx1i007p408ofpt2dfi0	cmozwcvp2000z408oce8lth12	Harinakundu	harinakundu-upazila	40440014	2026-05-10 14:57:32.742	2026-05-10 16:52:38.216	t	\N	Harinakundu	0	t	23.6435087	89.0768697	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwvm006x408olvnsw3wm	cmozqxhya000zzo8o6lsl370o	Ghatail	ghatail-upazila	30930028	2026-05-10 14:57:32.53	2026-05-10 16:52:38.072	t	\N	Ghatail	0	t	24.4737005	90.0530459	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwvs006y408oqcxlozud	cmozqxhya000zzo8o6lsl370o	Gopalpur	gopalpur-upazila	30930038	2026-05-10 14:57:32.536	2026-05-10 16:52:38.077	t	\N	Gopalpur	0	t	24.5724162	89.9018162	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwvz006z408o9kvczxku	cmozqxhya000zzo8o6lsl370o	Kalihati	kalihati-upazila	30930047	2026-05-10 14:57:32.543	2026-05-10 16:52:38.082	t	\N	Kalihati	0	t	24.3596877	89.9467360	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcww50070408o0kao16s8	cmozqxhya000zzo8o6lsl370o	Madhupur	madhupur-upazila	30930057	2026-05-10 14:57:32.549	2026-05-10 16:52:38.087	t	\N	Madhupur	0	t	24.6501290	90.0622812	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwwc0071408o1bgccsuy	cmozqxhya000zzo8o6lsl370o	Mirzapur	mirzapur-upazila	30930066	2026-05-10 14:57:32.556	2026-05-10 16:52:38.09	t	\N	Mirzapur	0	t	24.1180587	90.1072009	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwwj0072408o27zha7cz	cmozqxhya000zzo8o6lsl370o	Nagarpur	nagarpur-upazila	30930076	2026-05-10 14:57:32.563	2026-05-10 16:52:38.095	t	\N	Nagarpur	0	t	24.0506267	89.8754706	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx33007x408ofwfkszyl	cmozwcvp90010408oakyw8ixx	Dighalia	dighalia-upazila	40470040	2026-05-10 14:57:32.799	2026-05-10 16:52:38.25	t	\N	Dighalia	0	t	22.9215145	89.5537785	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx3a007y408oubu2mrlk	cmozwcvp90010408oakyw8ixx	Dumuria	dumuria-upazila	40470030	2026-05-10 14:57:32.806	2026-05-10 16:52:38.254	t	\N	Dumuria	0	t	22.8057634	89.3980270	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx3h007z408ouiolmz1w	cmozwcvp90010408oakyw8ixx	Koyra	koyra-upazila	40470053	2026-05-10 14:57:32.813	2026-05-10 16:52:38.258	t	\N	Koyra	0	t	22.0778830	89.3950567	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx3n0080408osafp3m99	cmozwcvp90010408oakyw8ixx	Paikgachha	paikgachha-upazila	40470064	2026-05-10 14:57:32.819	2026-05-10 16:52:38.263	t	\N	Paikgachha	0	t	22.5900675	89.3402016	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx3t0081408osqyzqdn3	cmozwcvp90010408oakyw8ixx	Phultala	phultala-upazila	40470069	2026-05-10 14:57:32.825	2026-05-10 16:52:38.267	t	\N	Phultala	0	t	22.9483090	89.4541681	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx3z0082408ovz4xpywf	cmozwcvp90010408oakyw8ixx	Rupsa	rupsa-upazila	40470075	2026-05-10 14:57:32.831	2026-05-10 16:52:38.271	t	\N	Rupsa	0	t	22.8192275	89.6362339	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx450083408o1wb41wgp	cmozwcvp90010408oakyw8ixx	Terokhada	terokhada-upazila	40470094	2026-05-10 14:57:32.837	2026-05-10 16:52:38.275	t	\N	Terokhada	0	t	22.9139744	89.6551232	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx4c0084408ojzknlt9l	cmozwcvpf0011408oz8xl4vhp	Bheramara	bheramara-upazila	40500015	2026-05-10 14:57:32.844	2026-05-10 16:52:38.281	t	\N	Bheramara	0	t	24.0562809	88.9811554	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx4j0085408octg40c7w	cmozwcvpf0011408oz8xl4vhp	Daulatpur	daulatpur-upazila-1	40500039	2026-05-10 14:57:32.851	2026-05-10 16:52:38.285	t	\N	Daulatpur	0	t	24.0342597	88.8355397	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx4q0086408onw98pmcu	cmozwcvpf0011408oz8xl4vhp	Khoksa	khoksa-upazila	40500063	2026-05-10 14:57:32.858	2026-05-10 16:52:38.289	t	\N	Khoksa	0	t	23.8108428	89.3004042	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx4w0087408otkmghm54	cmozwcvpf0011408oz8xl4vhp	Kumarkhali	kumarkhali-upazila	40500071	2026-05-10 14:57:32.864	2026-05-10 16:52:38.293	t	\N	Kumarkhali	0	t	23.8581758	89.2103377	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx540088408oklsr3z9e	cmozwcvpf0011408oz8xl4vhp	Kushtia Sadar	kushtia-sadar-upazila	40500079	2026-05-10 14:57:32.872	2026-05-10 16:52:38.298	t	\N	Kushtia Sadar	0	t	23.8244773	89.0897851	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx5c0089408oxmmj21o9	cmozwcvpf0011408oz8xl4vhp	Mirpur	mirpur-upazila	40500094	2026-05-10 14:57:32.88	2026-05-10 16:52:38.302	t	\N	Mirpur	0	t	23.8971585	88.9861720	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx5j008a408o5ylku40j	cmozwcvpn0012408oq7xmqarc	Magura Sadar	magura-sadar-upazila	40550057	2026-05-10 14:57:32.887	2026-05-10 16:52:38.306	t	\N	Magura Sadar	0	t	23.4518832	89.4124272	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx5q008b408ow83o3cpt	cmozwcvpn0012408oq7xmqarc	Mohammadpur	mohammadpur-upazila	40550066	2026-05-10 14:57:32.894	2026-05-10 16:52:38.31	t	\N	Mohammadpur	0	t	23.4000935	89.5506907	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx5x008c408omwtmxgud	cmozwcvpn0012408oq7xmqarc	Shalikha	shalikha-upazila	40550085	2026-05-10 14:57:32.901	2026-05-10 16:52:38.315	t	\N	Shalikha	0	t	23.3476922	89.3592681	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx65008d408ob8uarr42	cmozwcvpn0012408oq7xmqarc	Sreepur	sreepur-upazila-1	40550095	2026-05-10 14:57:32.909	2026-05-10 16:52:38.319	t	\N	Sreepur	0	t	23.5976620	89.4241216	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx6c008e408ogow87i2v	cmozwcvpu0013408oow75njez	Gangni	gangni-upazila	40570047	2026-05-10 14:57:32.916	2026-05-10 16:52:38.323	t	\N	Gangni	0	t	23.8574240	88.7706956	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx6i008f408ofekxxh2t	cmozwcvpu0013408oow75njez	Meherpur Sadar	meherpur-sadar-upazila	40570087	2026-05-10 14:57:32.922	2026-05-10 16:52:38.327	t	\N	Meherpur Sadar	0	t	23.7652793	88.6614059	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx6p008g408o2bcdfh7v	cmozwcvpu0013408oow75njez	Mujibnagar	mujibnagar-upazila	40570060	2026-05-10 14:57:32.929	2026-05-10 16:52:38.331	t	\N	Mujibnagar	0	t	23.6680417	88.6206686	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx6w008h408oo8tga1s8	cmozwcvq10014408onbsxonxb	Kalia	kalia-upazila	40650028	2026-05-10 14:57:32.936	2026-05-10 16:52:38.335	t	\N	Kalia	0	t	23.0292485	89.6416308	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx74008i408oa0ssrxpt	cmozwcvq10014408onbsxonxb	Lohagara	lohagara-upazila-1	40650052	2026-05-10 14:57:32.944	2026-05-10 16:52:38.339	t	\N	Lohagara	0	t	23.2042490	89.6241797	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx7b008j408ou5nga1vb	cmozwcvq10014408onbsxonxb	Narail Sadar	narail-sadar-upazila	40650076	2026-05-10 14:57:32.951	2026-05-10 16:52:38.343	t	\N	Narail Sadar	0	t	23.1549394	89.4950963	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx7i008k408oz4fx0j0s	cmozwcvq80015408o1vyf5cze	Ashashuni	ashashuni-upazila	40870004	2026-05-10 14:57:32.958	2026-05-10 16:52:38.348	t	\N	Ashashuni	0	t	22.5192473	89.1874322	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx1z007r408oo64odo1n	cmozwcvp2000z408oce8lth12	Kaliganj	kaliganj-upazila-1	40440033	2026-05-10 14:57:32.759	2026-05-10 16:52:38.224	t	\N	Kaliganj	0	t	23.3695947	89.1523351	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx25007s408ovgcxbugi	cmozwcvp2000z408oce8lth12	Kotchandpur	kotchandpur-upazila	40440042	2026-05-10 14:57:32.765	2026-05-10 16:52:38.229	t	\N	Kotchandpur	0	t	23.4449701	89.0014170	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx2c007t408ol6mfpmr4	cmozwcvp2000z408oce8lth12	Maheshpur	maheshpur-upazila	40440071	2026-05-10 14:57:32.772	2026-05-10 16:52:38.233	t	\N	Maheshpur	0	t	23.3201716	88.8597001	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx2k007u408ou4o48wbm	cmozwcvp2000z408oce8lth12	Shailkupa	shailkupa-upazila	40440080	2026-05-10 14:57:32.78	2026-05-10 16:52:38.237	t	\N	Shailkupa	0	t	23.6636214	89.2426193	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx2r007v408ozjtmos9f	cmozwcvp90010408oakyw8ixx	Batiaghata	batiaghata-upazila	40470012	2026-05-10 14:57:32.787	2026-05-10 16:52:38.24	t	\N	Batiaghata	0	t	22.7133399	89.5149153	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx2y007w408ovkry6pvx	cmozwcvp90010408oakyw8ixx	Dacope	dacope-upazila	40470017	2026-05-10 14:57:32.794	2026-05-10 16:52:38.246	t	\N	Dacope	0	t	22.2420311	89.5263764	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx90008s408otoxsuo9m	cmozwcvr8001a408oisf7cqkc	Bogura Sadar	bogura-sadar-upazila	50100020	2026-05-10 14:57:33.012	2026-05-10 16:52:38.38	t	\N	Bogura Sadar	0	t	24.8953992	89.3560555	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx97008t408ous9mcgvx	cmozwcvr8001a408oisf7cqkc	Dhunat	dhunat-upazila	50100027	2026-05-10 14:57:33.019	2026-05-10 16:52:38.384	t	\N	Dhunat	0	t	24.6826030	89.5501567	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx9d008u408ohanl7y9b	cmozwcvr8001a408oisf7cqkc	Dupchachia	dupchachia-upazila	50100033	2026-05-10 14:57:33.025	2026-05-10 16:52:38.388	t	\N	Dupchachia	0	t	24.8823661	89.1398404	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx9j008v408o2rzwzrht	cmozwcvr8001a408oisf7cqkc	Gabtali	gabtali-upazila	50100040	2026-05-10 14:57:33.031	2026-05-10 16:52:38.392	t	\N	Gabtali	0	t	24.8872405	89.4648296	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx9q008w408oy0bmfleb	cmozwcvr8001a408oisf7cqkc	Kahaloo	kahaloo-upazila	50100054	2026-05-10 14:57:33.039	2026-05-10 16:52:38.397	t	\N	Kahaloo	0	t	24.8325086	89.2514235	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx9y008x408o0g5n5aas	cmozwcvr8001a408oisf7cqkc	Nandigram	nandigram-upazila	50100067	2026-05-10 14:57:33.046	2026-05-10 16:52:38.4	t	\N	Nandigram	0	t	24.6811849	89.2271570	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxa4008y408ox67rdizs	cmozwcvr8001a408oisf7cqkc	Sariakandi	sariakandi-upazila	50100081	2026-05-10 14:57:33.052	2026-05-10 16:52:38.404	t	\N	Sariakandi	0	t	24.8789082	89.6165633	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxab008z408oaowek4rq	cmozwcvr8001a408oisf7cqkc	Shajahanpur	shajahanpur-upazila	50100085	2026-05-10 14:57:33.059	2026-05-10 16:52:38.408	t	\N	Shajahanpur	0	t	24.7602169	89.3755597	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxai0090408o0tdcqyzx	cmozwcvr8001a408oisf7cqkc	Sherpur	sherpur-upazila	50100088	2026-05-10 14:57:33.066	2026-05-10 16:52:38.413	t	\N	Sherpur	0	t	24.6286757	89.4225713	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxao0091408orwzt76s2	cmozwcvr8001a408oisf7cqkc	Shibganj	shibganj-upazila	50100094	2026-05-10 14:57:33.072	2026-05-10 16:52:38.417	t	\N	Shibganj	0	t	25.0168346	89.3064935	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxav0092408owxek8btf	cmozwcvr8001a408oisf7cqkc	Sonatala	sonatala-upazila	50100095	2026-05-10 14:57:33.079	2026-05-10 16:52:38.421	t	\N	Sonatala	0	t	24.9973650	89.5141797	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxb20093408ohap94kb1	cmozwcvs2001e408omulxtkun	Bholahat	bholahat-upazila	50700018	2026-05-10 14:57:33.086	2026-05-10 16:52:38.425	t	\N	Bholahat	0	t	24.8972166	88.2094930	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxba0094408o4v72vfqh	cmozwcvs2001e408omulxtkun	Chapainawabganj Sadar	chapainawabganj-sadar-upazila	50700066	2026-05-10 14:57:33.094	2026-05-10 16:52:38.43	t	\N	Chapainawabganj Sadar	0	t	24.5653424	88.2580650	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxbh0095408oj9yrw93x	cmozwcvs2001e408omulxtkun	Gomastapur	gomastapur-upazila	50700037	2026-05-10 14:57:33.101	2026-05-10 16:52:38.434	t	\N	Gomastapur	0	t	24.8585733	88.3554473	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxbp0096408oa4fx9edx	cmozwcvs2001e408omulxtkun	Nachole	nachole-upazila	50700056	2026-05-10 14:57:33.109	2026-05-10 16:52:38.438	t	\N	Nachole	0	t	24.7270630	88.3963179	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxbw0097408op829kx3t	cmozwcvs2001e408omulxtkun	Shibganj	shibganj-upazila-1	50700088	2026-05-10 14:57:33.116	2026-05-10 16:52:38.442	t	\N	Shibganj	0	t	24.7050164	88.1548792	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxc20098408okl4e6zzn	cmozwcvrf001b408o2uhqama5	Akkelpur	akkelpur-upazila	50380013	2026-05-10 14:57:33.122	2026-05-10 16:52:38.446	t	\N	Akkelpur	0	t	24.9334853	89.0420268	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxc90099408oe54dqhx1	cmozwcvrf001b408o2uhqama5	Joypurhat Sadar	joypurhat-sadar-upazila	50380047	2026-05-10 14:57:33.129	2026-05-10 16:52:38.45	t	\N	Joypurhat Sadar	0	t	25.1076549	89.0214539	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxcg009a408oadc1vfjf	cmozwcvrf001b408o2uhqama5	Kalai	kalai-upazila	50380058	2026-05-10 14:57:33.136	2026-05-10 16:52:38.454	t	\N	Kalai	0	t	25.0780810	89.1988399	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxcn009b408ojfun9jg2	cmozwcvrf001b408o2uhqama5	Khetlal	khetlal-upazila	50380061	2026-05-10 14:57:33.143	2026-05-10 16:52:38.458	t	\N	Khetlal	0	t	25.0233900	89.1176688	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxct009c408o7xsgts24	cmozwcvrf001b408o2uhqama5	Panchbibi	panchbibi-upazila	50380074	2026-05-10 14:57:33.149	2026-05-10 16:52:38.463	t	\N	Panchbibi	0	t	25.2049836	89.0718649	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxd0009d408osa00v73d	cmozwcvro001c408otpcx72zj	Atrai	atrai-upazila	50640003	2026-05-10 14:57:33.156	2026-05-10 16:52:38.467	t	\N	Atrai	0	t	24.6247830	88.9890749	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxd7009e408o1ebccta1	cmozwcvro001c408otpcx72zj	Badalgachhi	badalgachhi-upazila	50640006	2026-05-10 14:57:33.163	2026-05-10 16:52:38.471	t	\N	Badalgachhi	0	t	24.9674518	88.9425376	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxde009f408o1yf3jm1j	cmozwcvro001c408otpcx72zj	Dhamoirhat	dhamoirhat-upazila	50640028	2026-05-10 14:57:33.17	2026-05-10 16:52:38.475	t	\N	Dhamoirhat	0	t	25.1305134	88.8241579	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx7v008m408orfby4a4u	cmozwcvq80015408o1vyf5cze	Kalaroa	kalaroa-upazila	40870043	2026-05-10 14:57:32.971	2026-05-10 16:52:38.355	t	\N	Kalaroa	0	t	22.8803405	89.0301910	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx84008n408oivdj2m5q	cmozwcvq80015408o1vyf5cze	Kaliganj	kaliganj-upazila-2	40870047	2026-05-10 14:57:32.98	2026-05-10 16:52:38.359	t	\N	Kaliganj	0	t	22.4474361	89.0623806	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx8a008o408ov5ffgn40	cmozwcvq80015408o1vyf5cze	Satkhira Sadar	satkhira-sadar-upazila	40870082	2026-05-10 14:57:32.986	2026-05-10 16:52:38.364	t	\N	Satkhira Sadar	0	t	22.7202895	89.0382694	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx8h008p408oberwvm8b	cmozwcvq80015408o1vyf5cze	Shyamnagar	shyamnagar-upazila	40870086	2026-05-10 14:57:32.993	2026-05-10 16:52:38.368	t	\N	Shyamnagar	0	t	22.0121771	89.1806019	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx8n008q408ocnynb1n8	cmozwcvq80015408o1vyf5cze	Tala	tala-upazila	40870090	2026-05-10 14:57:32.999	2026-05-10 16:52:38.371	t	\N	Tala	0	t	22.7398964	89.2105910	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx8t008r408oy65saoot	cmozwcvr8001a408oisf7cqkc	Adamdighi	adamdighi-upazila	50100006	2026-05-10 14:57:33.005	2026-05-10 16:52:38.375	t	\N	Adamdighi	0	t	24.8000898	89.0596814	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxf5009n408o1aheizmv	cmozwcvro001c408otpcx72zj	Sapahar	sapahar-upazila	50640086	2026-05-10 14:57:33.234	2026-05-10 16:52:38.51	t	\N	Sapahar	0	t	25.1193587	88.5307165	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxfe009o408ozv5bc08o	cmozwcvrv001d408og278t396	Bagatipara	bagatipara-upazila	50690009	2026-05-10 14:57:33.242	2026-05-10 16:52:38.515	t	\N	Bagatipara	0	t	24.3132499	88.9479018	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxfl009p408ory4x20pl	cmozwcvrv001d408og278t396	Baraigram	baraigram-upazila	50690015	2026-05-10 14:57:33.249	2026-05-10 16:52:38.519	t	\N	Baraigram	0	t	24.2732369	89.1499734	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxfs009q408ozhqmun9w	cmozwcvrv001d408og278t396	Gurudaspur	gurudaspur-upazila	50690041	2026-05-10 14:57:33.256	2026-05-10 16:52:38.523	t	\N	Gurudaspur	0	t	24.3737270	89.2053877	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxg1009r408oce1wumco	cmozwcvrv001d408og278t396	Lalpur	lalpur-upazila	50690044	2026-05-10 14:57:33.265	2026-05-10 16:52:38.528	t	\N	Lalpur	0	t	24.1997875	88.9857194	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxg8009s408o0qws59gl	cmozwcvrv001d408og278t396	Naldanga	naldanga-upazila	50690055	2026-05-10 14:57:33.272	2026-05-10 16:52:38.532	t	\N	Naldanga	0	t	24.5060016	88.9756076	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxgg009t408ow27e6tvj	cmozwcvrv001d408og278t396	Natore Sadar	natore-sadar-upazila	50690063	2026-05-10 14:57:33.281	2026-05-10 16:52:38.536	t	\N	Natore Sadar	0	t	24.3970979	88.9899642	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxgn009u408o7nw8zkws	cmozwcvrv001d408og278t396	Singra	singra-upazila	50690091	2026-05-10 14:57:33.287	2026-05-10 16:52:38.54	t	\N	Singra	0	t	24.5244083	89.1843074	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxgw009v408o98dw6s8u	cmozwcvs9001f408o1dqychow	Atgharia	atgharia-upazila	50760005	2026-05-10 14:57:33.296	2026-05-10 16:52:38.544	t	\N	Atgharia	0	t	24.1074161	89.2827457	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxh2009w408on3od5itm	cmozwcvs9001f408o1dqychow	Bera	bera-upazila	50760016	2026-05-10 14:57:33.302	2026-05-10 16:52:38.549	t	\N	Bera	0	t	23.9425189	89.6571847	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxhb009x408o6vs6dkx9	cmozwcvs9001f408o1dqychow	Bhangura	bhangura-upazila	50760019	2026-05-10 14:57:33.311	2026-05-10 16:52:38.552	t	\N	Bhangura	0	t	24.2389274	89.3963874	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxhj009y408oh5jkmiq9	cmozwcvs9001f408o1dqychow	Chatmohar	chatmohar-upazila	50760022	2026-05-10 14:57:33.319	2026-05-10 16:52:38.556	t	\N	Chatmohar	0	t	24.2241024	89.3032187	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxie00a2408ovyrhxtwe	cmozwcvs9001f408o1dqychow	Santhia	santhia-upazila	50760072	2026-05-10 14:57:33.35	2026-05-10 16:52:38.572	t	\N	Santhia	0	t	24.0434276	89.5158996	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxil00a3408oybnoekt8	cmozwcvs9001f408o1dqychow	Sujanagar	sujanagar-upazila	50760083	2026-05-10 14:57:33.357	2026-05-10 16:52:38.577	t	\N	Sujanagar	0	t	23.8978295	89.5140138	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxis00a4408o31ib855y	cmozwcvsg001g408o89fvkvu3	Bagha	bagha-upazila	50810010	2026-05-10 14:57:33.364	2026-05-10 16:52:38.581	t	\N	Bagha	0	t	24.2059453	88.8339990	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxiz00a5408oizsnm102	cmozwcvsg001g408o89fvkvu3	Bagmara	bagmara-upazila	50810012	2026-05-10 14:57:33.371	2026-05-10 16:52:38.585	t	\N	Bagmara	0	t	24.5936410	88.8092313	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxj700a6408oxlz33nek	cmozwcvsg001g408o89fvkvu3	Charghat	charghat-upazila	50810025	2026-05-10 14:57:33.379	2026-05-10 16:52:38.589	t	\N	Charghat	0	t	24.3011925	88.7751072	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxjg00a7408obq7k8u2l	cmozwcvsg001g408o89fvkvu3	Durgapur	durgapur-upazila	50810031	2026-05-10 14:57:33.388	2026-05-10 16:52:38.594	t	\N	Durgapur	0	t	24.4682774	88.7608952	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxjo00a8408ollakdh5a	cmozwcvsg001g408o89fvkvu3	Godagari	godagari-upazila	50810034	2026-05-10 14:57:33.396	2026-05-10 16:52:38.598	t	\N	Godagari	0	t	24.4831495	88.4149242	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxjv00a9408oqbutix1e	cmozwcvsg001g408o89fvkvu3	Mohanpur	mohanpur-upazila	50810053	2026-05-10 14:57:33.403	2026-05-10 16:52:38.602	t	\N	Mohanpur	0	t	24.5547505	88.6407861	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxk300aa408o5gqyvu0m	cmozwcvsg001g408o89fvkvu3	Paba	paba-upazila	50810072	2026-05-10 14:57:33.411	2026-05-10 16:52:38.606	t	\N	Paba	0	t	24.3381337	88.5907440	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxka00ab408ohptvptsw	cmozwcvsg001g408o89fvkvu3	Puthia	puthia-upazila	50810082	2026-05-10 14:57:33.418	2026-05-10 16:52:38.61	t	\N	Puthia	0	t	24.4114873	88.8273574	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxdt009h408ohv7ce1j1	cmozwcvro001c408otpcx72zj	Manda	manda-upazila	50640047	2026-05-10 14:57:33.185	2026-05-10 16:52:38.484	t	\N	Manda	0	t	24.7463048	88.7119870	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxe0009i408o5rlp94do	cmozwcvro001c408otpcx72zj	Naogaon Sadar	naogaon-sadar-upazila	50640060	2026-05-10 14:57:33.192	2026-05-10 16:52:38.488	t	\N	Naogaon Sadar	0	t	24.8120141	88.8980336	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxe8009j408ocreq5rof	cmozwcvro001c408otpcx72zj	Niamatpur	niamatpur-upazila	50640069	2026-05-10 14:57:33.2	2026-05-10 16:52:38.492	t	\N	Niamatpur	0	t	24.8304548	88.5502102	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxei009k408o8sts6w1w	cmozwcvro001c408otpcx72zj	Patnitala	patnitala-upazila	50640075	2026-05-10 14:57:33.21	2026-05-10 16:52:38.498	t	\N	Patnitala	0	t	25.0775326	88.7145930	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxeq009l408oub57vtzq	cmozwcvro001c408otpcx72zj	Porsha	porsha-upazila	50640079	2026-05-10 14:57:33.218	2026-05-10 16:52:38.502	t	\N	Porsha	0	t	24.9949758	88.5173657	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxey009m408ojtafbrff	cmozwcvro001c408otpcx72zj	Raninagar	raninagar-upazila	50640085	2026-05-10 14:57:33.226	2026-05-10 16:52:38.506	t	\N	Raninagar	0	t	24.7117260	89.0201486	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxly00aj408o22d0mujs	cmozwcvsm001h408o1eieu8ec	Sirajganj Sadar	sirajganj-sadar-upazila	50880078	2026-05-10 14:57:33.478	2026-05-10 16:52:38.643	t	\N	Sirajganj Sadar	0	t	24.4942697	89.6896100	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxm700ak408orwf035qf	cmozwcvsm001h408o1eieu8ec	Tarash	tarash-upazila	50880089	2026-05-10 14:57:33.487	2026-05-10 16:52:38.648	t	\N	Tarash	0	t	24.4453746	89.3578027	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxmg00al408oisxpz9o4	cmozwcvsm001h408o1eieu8ec	Ullapara	ullapara-upazila	50880094	2026-05-10 14:57:33.496	2026-05-10 16:52:38.652	t	\N	Ullapara	0	t	24.3278490	89.5182333	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxmp00am408o5dlqrv95	cmozwcvhk0007408onlqca354	Amtali	amtali-upazila	10040009	2026-05-10 14:57:33.505	2026-05-10 16:52:38.656	t	\N	Amtali	0	t	22.1465033	90.2700368	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxmz00an408of3otchn5	cmozwcvhk0007408onlqca354	Bamna	bamna-upazila	10040019	2026-05-10 14:57:33.515	2026-05-10 16:52:38.66	t	\N	Bamna	0	t	22.2723297	90.0572958	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxn600ao408ohvjcna4y	cmozwcvhk0007408onlqca354	Barguna Sadar	barguna-sadar-upazila	10040028	2026-05-10 14:57:33.522	2026-05-10 16:52:38.664	t	\N	Barguna Sadar	0	t	22.1268497	90.1016962	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxnf00ap408oovrfw9ux	cmozwcvhk0007408onlqca354	Betagi	betagi-upazila	10040047	2026-05-10 14:57:33.531	2026-05-10 16:52:38.668	t	\N	Betagi	0	t	22.3481852	90.1493595	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxnl00aq408odxd1glxi	cmozwcvhk0007408onlqca354	Patharghata	patharghata-upazila	10040085	2026-05-10 14:57:33.537	2026-05-10 16:52:38.672	t	\N	Patharghata	0	t	22.0896796	89.9594289	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxnt00ar408oca0qnugr	cmozwcvhk0007408onlqca354	Taltali	taltali-upazila	10040090	2026-05-10 14:57:33.545	2026-05-10 16:52:38.676	t	\N	Taltali	0	t	21.9675953	90.1005879	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxo000as408omwbyz6ox	cmozwcvhw0008408oy62xrhuk	Agailjhara	agailjhara-upazila	10060002	2026-05-10 14:57:33.552	2026-05-10 16:52:38.681	t	\N	Agailjhara	0	t	22.9676431	90.1404723	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxo800at408o8m1e5q7w	cmozwcvhw0008408oy62xrhuk	Babuganj	babuganj-upazila	10060003	2026-05-10 14:57:33.56	2026-05-10 16:52:38.685	t	\N	Babuganj	0	t	22.8246162	90.3127262	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxoe00au408owvgj2wp2	cmozwcvhw0008408oy62xrhuk	Bakerganj	bakerganj-upazila	10060007	2026-05-10 14:57:33.566	2026-05-10 16:52:38.688	t	\N	Bakerganj	0	t	22.5547816	90.3900746	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxom00av408oyzdkq0ri	cmozwcvhw0008408oy62xrhuk	Banaripara	banaripara-upazila	10060010	2026-05-10 14:57:33.574	2026-05-10 16:52:38.692	t	\N	Banaripara	0	t	22.8111872	90.1291671	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxou00aw408oat463p8q	cmozwcvhw0008408oy62xrhuk	Barishal Sadar (Kotwali)	barishal-sadar-kotwali-upazila	10060051	2026-05-10 14:57:33.582	2026-05-10 16:52:38.696	t	\N	Barishal Sadar (Kotwali)	0	t	22.7148111	90.4096004	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxp100ax408o1ps5exck	cmozwcvhw0008408oy62xrhuk	Gaurnadi	gaurnadi-upazila	10060032	2026-05-10 14:57:33.589	2026-05-10 16:52:38.7	t	\N	Gaurnadi	0	t	22.9698146	90.2428525	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxp900ay408onbl8zwi9	cmozwcvhw0008408oy62xrhuk	Hijla	hijla-upazila	10060036	2026-05-10 14:57:33.597	2026-05-10 16:52:38.704	t	\N	Hijla	0	t	22.9628024	90.5518241	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxpg00az408ouibbirb2	cmozwcvhw0008408oy62xrhuk	Mehendiganj	mehendiganj-upazila	10060062	2026-05-10 14:57:33.604	2026-05-10 16:52:38.707	t	\N	Mehendiganj	0	t	22.8159715	90.5190149	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxpn00b0408oeo3r6s2s	cmozwcvhw0008408oy62xrhuk	Muladi	muladi-upazila	10060069	2026-05-10 14:57:33.611	2026-05-10 16:52:38.712	t	\N	Muladi	0	t	22.9551491	90.3759997	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxpu00b1408o796siaqv	cmozwcvhw0008408oy62xrhuk	Ujirpur	ujirpur-upazila	10060094	2026-05-10 14:57:33.618	2026-05-10 16:52:38.716	t	\N	Ujirpur	0	t	22.8657488	90.1649733	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxq100b2408o6e336ubm	cmozwcvi40009408ojea9pyf8	Bhola Sadar	bhola-sadar-upazila	10090018	2026-05-10 14:57:33.626	2026-05-10 16:52:38.72	t	\N	Bhola Sadar	0	t	22.7072351	90.6305403	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxq800b3408ovr264ez4	cmozwcvi40009408ojea9pyf8	Borhanuddin	borhanuddin-upazila	10090021	2026-05-10 14:57:33.632	2026-05-10 16:52:38.723	t	\N	Borhanuddin	0	t	22.4854088	90.7153800	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxqg00b4408ooqkee935	cmozwcvi40009408ojea9pyf8	Charfasson	charfasson-upazila	10090025	2026-05-10 14:57:33.64	2026-05-10 16:52:38.727	t	\N	Charfasson	0	t	22.0448619	90.7245988	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxqn00b5408oyd5cnrmi	cmozwcvi40009408ojea9pyf8	Daulatkhan	daulatkhan-upazila	10090029	2026-05-10 14:57:33.647	2026-05-10 16:52:38.732	t	\N	Daulatkhan	0	t	22.6420874	90.7454789	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxqu00b6408oko63iffp	cmozwcvi40009408ojea9pyf8	Lalmohan	lalmohan-upazila	10090054	2026-05-10 14:57:33.654	2026-05-10 16:52:38.736	t	\N	Lalmohan	0	t	22.3023435	90.7713696	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxkp00ad408o3y2tabls	cmozwcvsm001h408o1eieu8ec	Belkuchi	belkuchi-upazila	50880011	2026-05-10 14:57:33.433	2026-05-10 16:52:38.619	t	\N	Belkuchi	0	t	24.2979300	89.7014790	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxkv00ae408oy5wa7cne	cmozwcvsm001h408o1eieu8ec	Chouhali	chouhali-upazila	50880027	2026-05-10 14:57:33.439	2026-05-10 16:52:38.623	t	\N	Chouhali	0	t	24.1394464	89.7574394	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxl300af408okacc1070	cmozwcvsm001h408o1eieu8ec	Kamarkhanda	kamarkhanda-upazila	50880044	2026-05-10 14:57:33.447	2026-05-10 16:52:38.627	t	\N	Kamarkhanda	0	t	24.3775082	89.6422602	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxla00ag408o4uzk1kxv	cmozwcvsm001h408o1eieu8ec	Kazipur	kazipur-upazila	50880050	2026-05-10 14:57:33.454	2026-05-10 16:52:38.632	t	\N	Kazipur	0	t	24.6715895	89.6889072	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxlj00ah408ohp0ivl4w	cmozwcvsm001h408o1eieu8ec	Rayganj	rayganj-upazila	50880061	2026-05-10 14:57:33.463	2026-05-10 16:52:38.635	t	\N	Rayganj	0	t	24.4922106	89.5152638	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxlp00ai408olh0ph8t7	cmozwcvsm001h408o1eieu8ec	Shahjadpur	shahjadpur-upazila	50880067	2026-05-10 14:57:33.469	2026-05-10 16:52:38.639	t	\N	Shahjadpur	0	t	24.1629722	89.6307208	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxsm00be408o4rl6ghwa	cmozwcvin000b408o1y285fhq	Dashmina	dashmina-upazila	10780052	2026-05-10 14:57:33.718	2026-05-10 16:52:38.769	t	\N	Dashmina	0	t	22.2507607	90.5542862	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxsu00bf408otpg10t2n	cmozwcvin000b408o1y285fhq	Dumki	dumki-upazila	10780055	2026-05-10 14:57:33.726	2026-05-10 16:52:38.772	t	\N	Dumki	0	t	22.4482546	90.3730502	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxt100bg408o0r8e3yp9	cmozwcvin000b408o1y285fhq	Galachipa	galachipa-upazila	10780057	2026-05-10 14:57:33.733	2026-05-10 16:52:38.776	t	\N	Galachipa	0	t	22.1478051	90.4605183	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxt700bh408ouiij1sjo	cmozwcvin000b408o1y285fhq	Kalapara	kalapara-upazila	10780066	2026-05-10 14:57:33.739	2026-05-10 16:52:38.781	t	\N	Kalapara	0	t	21.9337091	90.2216867	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxtf00bi408ouk26dsm6	cmozwcvin000b408o1y285fhq	Mirzaganj	mirzaganj-upazila	10780076	2026-05-10 14:57:33.747	2026-05-10 16:52:38.785	t	\N	Mirzaganj	0	t	22.3555094	90.2174056	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxtl00bj408o13q3cqv7	cmozwcvin000b408o1y285fhq	Patuakhali Sadar	patuakhali-sadar-upazila	10780095	2026-05-10 14:57:33.753	2026-05-10 16:52:38.789	t	\N	Patuakhali Sadar	0	t	22.3345325	90.3293151	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxtu00bk408o2t614z1n	cmozwcvin000b408o1y285fhq	Rangabali	rangabali-upazila	10780097	2026-05-10 14:57:33.762	2026-05-10 16:52:38.793	t	\N	Rangabali	0	t	21.9316197	90.4304608	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxu000bl408oy5sx5op3	cmozwcviw000c408o8g1nlapz	Bhandaria	bhandaria-upazila	10790014	2026-05-10 14:57:33.768	2026-05-10 16:52:38.798	t	\N	Bhandaria	0	t	22.4518238	90.0197475	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxu900bm408o3vht1ge7	cmozwcviw000c408o8g1nlapz	Indurkani	indurkani-upazila	10790090	2026-05-10 14:57:33.777	2026-05-10 16:52:38.802	t	\N	Indurkani	0	t	22.4662100	89.9652489	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxug00bn408o8lhe11ag	cmozwcviw000c408o8g1nlapz	Kawkhali	kawkhali-upazila-1	10790047	2026-05-10 14:57:33.784	2026-05-10 16:52:38.806	t	\N	Kawkhali	0	t	22.6062511	90.0572604	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxuo00bo408oymr0g0bx	cmozwcviw000c408o8g1nlapz	Mathbaria	mathbaria-upazila	10790058	2026-05-10 14:57:33.792	2026-05-10 16:52:38.81	t	\N	Mathbaria	0	t	22.2829089	89.9492797	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxuu00bp408ooq4fkkek	cmozwcviw000c408o8g1nlapz	Nazirpur	nazirpur-upazila	10790076	2026-05-10 14:57:33.798	2026-05-10 16:52:38.814	t	\N	Nazirpur	0	t	22.7699365	89.9748247	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxv900br408ojcmf7p30	cmozwcviw000c408o8g1nlapz	Pirojpur Sadar	pirojpur-sadar-upazila	10790080	2026-05-10 14:57:33.813	2026-05-10 16:52:38.822	t	\N	Pirojpur Sadar	0	t	22.6092020	89.9793467	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxvg00bs408ogg8hljt5	cmozwcvqf0016408odosit018	Bakshiganj	bakshiganj-upazila	45390007	2026-05-10 14:57:33.82	2026-05-10 16:52:38.825	t	\N	Bakshiganj	0	t	25.2144324	89.8521664	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxvo00bt408omsiqs6d3	cmozwcvqf0016408odosit018	Dewanganj	dewanganj-upazila	45390015	2026-05-10 14:57:33.828	2026-05-10 16:52:38.83	t	\N	Dewanganj	0	t	25.2679709	89.7663095	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxvw00bu408oeltkh90m	cmozwcvqf0016408odosit018	Islampur	islampur-upazila	45390029	2026-05-10 14:57:33.836	2026-05-10 16:52:38.834	t	\N	Islampur	0	t	25.0756444	89.7630635	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxw400bv408o9a2wheb3	cmozwcvqf0016408odosit018	Jamalpur Sadar	jamalpur-sadar-upazila	45390036	2026-05-10 14:57:33.844	2026-05-10 16:52:38.838	t	\N	Jamalpur Sadar	0	t	24.8427589	90.0152409	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxwc00bw408ot5uss2tc	cmozwcvqf0016408odosit018	Madarganj	madarganj-upazila	45390058	2026-05-10 14:57:33.852	2026-05-10 16:52:38.841	t	\N	Madarganj	0	t	24.8851091	89.7417890	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxwk00bx408owlet7rw4	cmozwcvqf0016408odosit018	Melandaha	melandaha-upazila	45390061	2026-05-10 14:57:33.86	2026-05-10 16:52:38.846	t	\N	Melandaha	0	t	24.9559930	89.8279869	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxwr00by408omr41knee	cmozwcvqf0016408odosit018	Sarishabari	sarishabari-upazila	45390085	2026-05-10 14:57:33.867	2026-05-10 16:52:38.85	t	\N	Sarishabari	0	t	24.7215544	89.8306141	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxwz00bz408otrbwjyrb	cmozwcvqm0017408oqj9w95zy	Bhaluka	bhaluka-upazila	45610013	2026-05-10 14:57:33.875	2026-05-10 16:52:38.854	t	\N	Bhaluka	0	t	24.3816166	90.3539016	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxx600c0408ozewfhwlf	cmozwcvqm0017408oqj9w95zy	Dhobaura	dhobaura-upazila	45610016	2026-05-10 14:57:33.882	2026-05-10 16:52:38.858	t	\N	Dhobaura	0	t	25.1012235	90.5255803	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxxc00c1408obvzm6eke	cmozwcvqm0017408oqj9w95zy	Fulbaria	fulbaria-upazila	45610020	2026-05-10 14:57:33.888	2026-05-10 16:52:38.863	t	\N	Fulbaria	0	t	24.5868447	90.2561576	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxr900b8408o6nkiifty	cmozwcvi40009408ojea9pyf8	Tazumuddin	tazumuddin-upazila	10090091	2026-05-10 14:57:33.67	2026-05-10 16:52:38.744	t	\N	Tazumuddin	0	t	22.4525484	90.8598181	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxrj00b9408obgbhd3uf	cmozwcvie000a408ooobbc0j0	Jhalokathi Sadar	jhalokathi-sadar-upazila	10420040	2026-05-10 14:57:33.679	2026-05-10 16:52:38.749	t	\N	Jhalokathi Sadar	0	t	22.6797794	90.1927533	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxrq00ba408opf1poq3b	cmozwcvie000a408ooobbc0j0	Kanthalia	kanthalia-upazila	10420043	2026-05-10 14:57:33.686	2026-05-10 16:52:38.752	t	\N	Kanthalia	0	t	22.4194126	90.1020612	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxrz00bb408oc2pvb1j0	cmozwcvie000a408ooobbc0j0	Nalchhity	nalchhity-upazila	10420073	2026-05-10 14:57:33.695	2026-05-10 16:52:38.756	t	\N	Nalchhity	0	t	22.6010276	90.2714905	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxs600bc408o3ghg18qt	cmozwcvie000a408ooobbc0j0	Rajapur	rajapur-upazila	10420084	2026-05-10 14:57:33.702	2026-05-10 16:52:38.76	t	\N	Rajapur	0	t	22.5496580	90.1309441	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxsf00bd408o8xnyovpk	cmozwcvin000b408o1y285fhq	Bauphal	bauphal-upazila	10780038	2026-05-10 14:57:33.711	2026-05-10 16:52:38.765	t	\N	Bauphal	0	t	22.4373466	90.5464846	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxz000c9408oo7ayufgk	cmozwcvqm0017408oqj9w95zy	Nandail	nandail-upazila	45610072	2026-05-10 14:57:33.948	2026-05-10 16:52:38.896	t	\N	Nandail	0	t	24.5494740	90.6767778	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxza00ca408o4yty6a02	cmozwcvqm0017408oqj9w95zy	Tarakanda	tarakanda-upazila	45610088	2026-05-10 14:57:33.958	2026-05-10 16:52:38.9	t	\N	Tarakanda	0	t	24.8641314	90.4633974	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxzk00cb408ontv4r3zp	cmozwcvqm0017408oqj9w95zy	Trishal	trishal-upazila	45610094	2026-05-10 14:57:33.968	2026-05-10 16:52:38.904	t	\N	Trishal	0	t	24.5637042	90.4104407	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxzt00cc408oo8ljdwka	cmozwcvqu0018408obh4jtvly	Atpara	atpara-upazila	45720004	2026-05-10 14:57:33.977	2026-05-10 16:52:38.907	t	\N	Atpara	0	t	24.7939595	90.8770689	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy0000cd408omwa0ut4x	cmozwcvqu0018408obh4jtvly	Barhatta	barhatta-upazila	45720009	2026-05-10 14:57:33.984	2026-05-10 16:52:38.912	t	\N	Barhatta	0	t	24.9223407	90.8850644	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy0a00ce408opjy7k08g	cmozwcvqu0018408obh4jtvly	Durgapur	durgapur-upazila-1	45720018	2026-05-10 14:57:33.994	2026-05-10 16:52:38.917	t	\N	Durgapur	0	t	25.0890702	90.6833433	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy0h00cf408oxq7q7hrs	cmozwcvqu0018408obh4jtvly	Kalmakanda	kalmakanda-upazila	45720040	2026-05-10 14:57:34.001	2026-05-10 16:52:38.921	t	\N	Kalmakanda	0	t	25.0775905	90.8576115	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy0o00cg408ok7n71nm8	cmozwcvqu0018408obh4jtvly	Kendua	kendua-upazila	45720047	2026-05-10 14:57:34.008	2026-05-10 16:52:38.925	t	\N	Kendua	0	t	24.6780430	90.8021692	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy0u00ch408oqubz4iie	cmozwcvqu0018408obh4jtvly	Khaliajuri	khaliajuri-upazila	45720038	2026-05-10 14:57:34.014	2026-05-10 16:52:38.929	t	\N	Khaliajuri	0	t	24.7049778	91.1218166	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy1000ci408oa2e56q53	cmozwcvqu0018408obh4jtvly	Madan	madan-upazila	45720056	2026-05-10 14:57:34.02	2026-05-10 16:52:38.932	t	\N	Madan	0	t	24.6782912	90.9669873	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy1700cj408ote4a3xys	cmozwcvqu0018408obh4jtvly	Mohanganj	mohanganj-upazila	45720063	2026-05-10 14:57:34.027	2026-05-10 16:52:38.936	t	\N	Mohanganj	0	t	24.8279110	91.0233606	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy1d00ck408o20614bfw	cmozwcvqu0018408obh4jtvly	Netrakona Sadar	netrakona-sadar-upazila	45720074	2026-05-10 14:57:34.033	2026-05-10 16:52:38.94	t	\N	Netrakona Sadar	0	t	24.8871866	90.7381123	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy1j00cl408oi5q0zi6g	cmozwcvqu0018408obh4jtvly	Purbadhala	purbadhala-upazila	45720083	2026-05-10 14:57:34.039	2026-05-10 16:52:38.943	t	\N	Purbadhala	0	t	24.9340204	90.6029418	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy1p00cm408o6b1gou6z	cmozwcvr10019408o7g8ca1xa	Jhenaigati	jhenaigati-upazila	45890037	2026-05-10 14:57:34.045	2026-05-10 16:52:38.947	t	\N	Jhenaigati	0	t	25.1824114	90.0541433	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy1u00cn408of5bw5r09	cmozwcvr10019408o7g8ca1xa	Nakla	nakla-upazila	45890067	2026-05-10 14:57:34.05	2026-05-10 16:52:38.951	t	\N	Nakla	0	t	24.9579813	90.1847848	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy2000co408odws6k3gl	cmozwcvr10019408o7g8ca1xa	Nalitabari	nalitabari-upazila	45890070	2026-05-10 14:57:34.056	2026-05-10 16:52:38.954	t	\N	Nalitabari	0	t	25.1172988	90.1844004	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy2600cp408owudjab3v	cmozwcvr10019408o7g8ca1xa	Sherpur Sadar	sherpur-sadar-upazila	45890088	2026-05-10 14:57:34.062	2026-05-10 16:52:38.958	t	\N	Sherpur Sadar	0	t	24.9908402	90.0216353	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy2d00cq408olfp5255l	cmozwcvr10019408o7g8ca1xa	Sreebardi	sreebardi-upazila	45890090	2026-05-10 14:57:34.069	2026-05-10 16:52:38.961	t	\N	Sreebardi	0	t	25.1648494	89.9571344	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy2j00cr408odifl8irz	cmozwcvsu001i408orduboc2n	Birampur	birampur-upazila	55270010	2026-05-10 14:57:34.075	2026-05-10 16:52:38.965	t	\N	Birampur	0	t	25.3799376	88.9634020	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy2p00cs408o3axv0vza	cmozwcvsu001i408orduboc2n	Birganj	birganj-upazila	55270012	2026-05-10 14:57:34.081	2026-05-10 16:52:38.968	t	\N	Birganj	0	t	25.9294218	88.6257822	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy2v00ct408ospodesr3	cmozwcvsu001i408orduboc2n	Birol	birol-upazila	55270017	2026-05-10 14:57:34.087	2026-05-10 16:52:38.972	t	\N	Birol	0	t	25.6468912	88.5472262	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy3100cu408ox4zjayq4	cmozwcvsu001i408orduboc2n	Bochaganj	bochaganj-upazila	55270021	2026-05-10 14:57:34.093	2026-05-10 16:52:38.975	t	\N	Bochaganj	0	t	25.7862150	88.4533244	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy3700cv408oijj6w4s3	cmozwcvsu001i408orduboc2n	Chirirbandar	chirirbandar-upazila	55270030	2026-05-10 14:57:34.099	2026-05-10 16:52:38.979	t	\N	Chirirbandar	0	t	25.6667320	88.7832568	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy3e00cw408oshexlyku	cmozwcvsu001i408orduboc2n	Dinajpur Sadar	dinajpur-sadar-upazila	55270064	2026-05-10 14:57:34.106	2026-05-10 16:52:38.982	t	\N	Dinajpur Sadar	0	t	25.6082091	88.6757176	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxxr00c3408ol13hhxla	cmozwcvqm0017408oqj9w95zy	Gafargaon	gafargaon-upazila	45610022	2026-05-10 14:57:33.903	2026-05-10 16:52:38.871	t	\N	Gafargaon	0	t	24.3936563	90.5499273	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxxy00c4408oxtzd0ifa	cmozwcvqm0017408oqj9w95zy	Gouripur	gouripur-upazila	45610023	2026-05-10 14:57:33.91	2026-05-10 16:52:38.874	t	\N	Gouripur	0	t	24.7565385	90.5861490	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxy500c5408ov7d7ah6w	cmozwcvqm0017408oqj9w95zy	Haluaghat	haluaghat-upazila	45610024	2026-05-10 14:57:33.917	2026-05-10 16:52:38.88	t	\N	Haluaghat	0	t	25.0841363	90.3520829	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxyb00c6408ot6738f7f	cmozwcvqm0017408oqj9w95zy	Ishwarganj	ishwarganj-upazila	45610031	2026-05-10 14:57:33.924	2026-05-10 16:52:38.884	t	\N	Ishwarganj	0	t	24.6447538	90.5995092	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxyj00c7408od3owbktz	cmozwcvqm0017408oqj9w95zy	Muktagachha	muktagachha-upazila	45610065	2026-05-10 14:57:33.931	2026-05-10 16:52:38.888	t	\N	Muktagachha	0	t	24.7442656	90.2055441	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxys00c8408ooyjlk05f	cmozwcvqm0017408oqj9w95zy	Mymensingh Sadar	mymensingh-sadar-upazila	45610052	2026-05-10 14:57:33.94	2026-05-10 16:52:38.892	t	\N	Mymensingh Sadar	0	t	24.8461370	90.2641542	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy4s00d4408oiahwzbo9	cmozwcvt1001j408ox7x3lmrd	Fulchhari	fulchhari-upazila	55320021	2026-05-10 14:57:34.156	2026-05-10 16:52:39.009	t	\N	Fulchhari	0	t	25.2537855	89.6532586	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy4z00d5408osamppnlr	cmozwcvt1001j408ox7x3lmrd	Gaibandha Sadar	gaibandha-sadar-upazila	55320024	2026-05-10 14:57:34.163	2026-05-10 16:52:39.013	t	\N	Gaibandha Sadar	0	t	25.3500158	89.5656150	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy5500d6408o58onciv1	cmozwcvt1001j408ox7x3lmrd	Gobindaganj	gobindaganj-upazila	55320030	2026-05-10 14:57:34.169	2026-05-10 16:52:39.016	t	\N	Gobindaganj	0	t	25.1577322	89.3697274	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy5c00d7408odmld0wci	cmozwcvt1001j408ox7x3lmrd	Palashbari	palashbari-upazila	55320067	2026-05-10 14:57:34.176	2026-05-10 16:52:39.019	t	\N	Palashbari	0	t	25.2650647	89.3917513	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy5j00d8408o8qosz68l	cmozwcvt1001j408ox7x3lmrd	Sadullapur	sadullapur-upazila	55320082	2026-05-10 14:57:34.183	2026-05-10 16:52:39.022	t	\N	Sadullapur	0	t	25.3948547	89.4256900	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy5p00d9408ob3gu4i1x	cmozwcvt1001j408ox7x3lmrd	Saghata	saghata-upazila	55320088	2026-05-10 14:57:34.189	2026-05-10 16:52:39.026	t	\N	Saghata	0	t	25.1251917	89.5634506	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy5w00da408oxde9xr83	cmozwcvt1001j408ox7x3lmrd	Sundarganj	sundarganj-upazila	55320091	2026-05-10 14:57:34.196	2026-05-10 16:52:39.029	t	\N	Sundarganj	0	t	25.5101634	89.5618256	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy6300db408or1oyvxch	cmozwcvt8001k408od0vs3d2n	Bhurungamari	bhurungamari-upazila	55490006	2026-05-10 14:57:34.203	2026-05-10 16:52:39.033	t	\N	Bhurungamari	0	t	26.1155258	89.6934089	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy6900dc408oa6won1pj	cmozwcvt8001k408od0vs3d2n	Chilmari	chilmari-upazila	55490009	2026-05-10 14:57:34.209	2026-05-10 16:52:39.036	t	\N	Chilmari	0	t	25.5639379	89.7182096	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy6g00dd408oak91urht	cmozwcvt8001k408od0vs3d2n	Kurigram Sadar	kurigram-sadar-upazila	55490052	2026-05-10 14:57:34.216	2026-05-10 16:52:39.04	t	\N	Kurigram Sadar	0	t	25.8272583	89.6914639	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy6n00de408oim2h0f7l	cmozwcvt8001k408od0vs3d2n	Nageshwari	nageshwari-upazila	55490061	2026-05-10 14:57:34.223	2026-05-10 16:52:39.043	t	\N	Nageshwari	0	t	25.9599222	89.7395444	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy6u00df408onhofo16u	cmozwcvt8001k408od0vs3d2n	Phulbari	phulbari-upazila	55490018	2026-05-10 14:57:34.23	2026-05-10 16:52:39.047	t	\N	Phulbari	0	t	25.9476900	89.5717240	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy7100dg408ohilocqc2	cmozwcvt8001k408od0vs3d2n	Rajarhat	rajarhat-upazila	55490077	2026-05-10 14:57:34.237	2026-05-10 16:52:39.051	t	\N	Rajarhat	0	t	25.7874137	89.5415975	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy7800dh408oqgnp3r63	cmozwcvt8001k408od0vs3d2n	Rajibpur	rajibpur-upazila	55490008	2026-05-10 14:57:34.244	2026-05-10 16:52:39.055	t	\N	Rajibpur	0	t	25.4442920	89.7642081	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy7e00di408ozm5t6diq	cmozwcvt8001k408od0vs3d2n	Roumari	roumari-upazila	55490079	2026-05-10 14:57:34.25	2026-05-10 16:52:39.059	t	\N	Roumari	0	t	25.5930671	89.8280812	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy7l00dj408op8usqk94	cmozwcvt8001k408od0vs3d2n	Ulipur	ulipur-upazila	55490094	2026-05-10 14:57:34.257	2026-05-10 16:52:39.064	t	\N	Ulipur	0	t	25.6897082	89.6687344	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy7s00dk408ol6s6sryx	cmozwcvtf001l408ot6ncop8s	Aditmari	aditmari-upazila	55520002	2026-05-10 14:57:34.264	2026-05-10 16:52:39.069	t	\N	Aditmari	0	t	25.9429591	89.3681932	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy7y00dl408ot3kb5afz	cmozwcvtf001l408ot6ncop8s	Hatibandha	hatibandha-upazila	55520033	2026-05-10 14:57:34.27	2026-05-10 16:52:39.073	t	\N	Hatibandha	0	t	26.1202672	89.1436277	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy8b00dm408o6wq1n0nv	cmozwcvtf001l408ot6ncop8s	Kaliganj	kaliganj-upazila-3	55520039	2026-05-10 14:57:34.283	2026-05-10 16:52:39.078	t	\N	Kaliganj	0	t	25.9856127	89.2417056	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy8j00dn408oqcyqccdh	cmozwcvtf001l408ot6ncop8s	Lalmonirhat Sadar	lalmonirhat-sadar-upazila	55520055	2026-05-10 14:57:34.291	2026-05-10 16:52:39.082	t	\N	Lalmonirhat Sadar	0	t	25.8787019	89.4533625	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy8s00do408o2vmm0nf1	cmozwcvtf001l408ot6ncop8s	Patgram	patgram-upazila	55520070	2026-05-10 14:57:34.3	2026-05-10 16:52:39.086	t	\N	Patgram	0	t	26.3434251	89.0195196	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy9000dp408ogs5j27h4	cmozwcvtn001m408ohn0zaih9	Dimla	dimla-upazila	55730012	2026-05-10 14:57:34.308	2026-05-10 16:52:39.089	t	\N	Dimla	0	t	26.1731095	88.9738563	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy9800dq408o1aej365k	cmozwcvtn001m408ohn0zaih9	Domar	domar-upazila	55730015	2026-05-10 14:57:34.316	2026-05-10 16:52:39.093	t	\N	Domar	0	t	26.1595863	88.8254315	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy9f00dr408o4j6krrwl	cmozwcvtn001m408ohn0zaih9	Jaldhaka	jaldhaka-upazila	55730036	2026-05-10 14:57:34.323	2026-05-10 16:52:39.097	t	\N	Jaldhaka	0	t	26.0311921	88.9936218	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy3q00cy408oq0v07k8m	cmozwcvsu001i408orduboc2n	Ghoraghat	ghoraghat-upazila	55270043	2026-05-10 14:57:34.118	2026-05-10 16:52:38.989	t	\N	Ghoraghat	0	t	25.2873331	89.2147513	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy3w00cz408o87kpbjb4	cmozwcvsu001i408orduboc2n	Hakimpur	hakimpur-upazila	55270047	2026-05-10 14:57:34.124	2026-05-10 16:52:38.993	t	\N	Hakimpur	0	t	25.2927670	89.0612043	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy4200d0408o26yiendc	cmozwcvsu001i408orduboc2n	Kaharole	kaharole-upazila	55270056	2026-05-10 14:57:34.13	2026-05-10 16:52:38.996	t	\N	Kaharole	0	t	25.8024575	88.5985003	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy4800d1408o7tl4ahhw	cmozwcvsu001i408orduboc2n	Khansama	khansama-upazila	55270060	2026-05-10 14:57:34.136	2026-05-10 16:52:38.999	t	\N	Khansama	0	t	25.8717011	88.7646000	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy4f00d2408owj28ygos	cmozwcvsu001i408orduboc2n	Nababganj	nababganj-upazila	55270069	2026-05-10 14:57:34.143	2026-05-10 16:52:39.002	t	\N	Nababganj	0	t	25.4208896	89.0905567	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy4l00d3408ot4der4hh	cmozwcvsu001i408orduboc2n	Parbatipur	parbatipur-upazila	55270077	2026-05-10 14:57:34.149	2026-05-10 16:52:39.005	t	\N	Parbatipur	0	t	25.6197684	88.9229693	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcybb00dz408odi5oqmi4	cmozwcvtv001n408ou4h7txxq	Tentulia	tentulia-upazila	55770090	2026-05-10 14:57:34.391	2026-05-10 16:52:39.127	t	\N	Tentulia	0	t	26.5125107	88.4305772	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcybk00e0408oco04w3z5	cmozwcvu3001o408of3yn25mo	Badarganj	badarganj-upazila	55850003	2026-05-10 14:57:34.4	2026-05-10 16:52:39.132	t	\N	Badarganj	0	t	25.6677688	89.0549239	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcybr00e1408oy4ssf19h	cmozwcvu3001o408of3yn25mo	Gangachara	gangachara-upazila	55850027	2026-05-10 14:57:34.407	2026-05-10 16:52:39.135	t	\N	Gangachara	0	t	25.8801507	89.2009603	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyby00e2408og8iuvobw	cmozwcvu3001o408of3yn25mo	Kaunia	kaunia-upazila	55850042	2026-05-10 14:57:34.414	2026-05-10 16:52:39.139	t	\N	Kaunia	0	t	25.7663806	89.3937160	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyc400e3408onye97q76	cmozwcvu3001o408of3yn25mo	Mithapukur	mithapukur-upazila	55850058	2026-05-10 14:57:34.42	2026-05-10 16:52:39.142	t	\N	Mithapukur	0	t	25.5721202	89.2609192	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcycb00e4408ozqetbg94	cmozwcvu3001o408of3yn25mo	Pirgachha	pirgachha-upazila	55850073	2026-05-10 14:57:34.427	2026-05-10 16:52:39.146	t	\N	Pirgachha	0	t	25.6650223	89.4222710	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyci00e5408o6r5qo24u	cmozwcvu3001o408of3yn25mo	Pirganj	pirganj-upazila	55850076	2026-05-10 14:57:34.434	2026-05-10 16:52:39.15	t	\N	Pirganj	0	t	25.4257989	89.2747020	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcycp00e6408ovp874z6d	cmozwcvu3001o408of3yn25mo	Rangpur Sadar	rangpur-sadar-upazila	55850049	2026-05-10 14:57:34.441	2026-05-10 16:52:39.154	t	\N	Rangpur Sadar	0	t	25.7512197	89.1506077	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcycx00e7408ou1i0qqci	cmozwcvu3001o408of3yn25mo	Taraganj	taraganj-upazila	55850092	2026-05-10 14:57:34.449	2026-05-10 16:52:39.157	t	\N	Taraganj	0	t	25.7833656	89.0333123	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyd300e8408oz1dhqtgl	cmozwcvua001p408od3c9lkhx	Baliadangi	baliadangi-upazila	55940008	2026-05-10 14:57:34.455	2026-05-10 16:52:39.161	t	\N	Baliadangi	0	t	26.1081967	88.2634769	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcydc00e9408oj1cjz7my	cmozwcvua001p408od3c9lkhx	Haripur	haripur-upazila	55940051	2026-05-10 14:57:34.464	2026-05-10 16:52:39.164	t	\N	Haripur	0	t	25.8788187	88.1545221	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcydj00ea408oa4nx8e44	cmozwcvua001p408od3c9lkhx	Pirganj	pirganj-upazila-1	55940082	2026-05-10 14:57:34.471	2026-05-10 16:52:39.168	t	\N	Pirganj	0	t	25.8424530	88.3679019	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcydq00eb408omanwyrmw	cmozwcvua001p408od3c9lkhx	Ranishankail	ranishankail-upazila	55940086	2026-05-10 14:57:34.478	2026-05-10 16:52:39.172	t	\N	Ranishankail	0	t	25.9407675	88.2458729	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcydx00ec408olmpdm0zf	cmozwcvua001p408od3c9lkhx	Thakurgaon Sadar	thakurgaon-sadar-upazila	55940094	2026-05-10 14:57:34.485	2026-05-10 16:52:39.175	t	\N	Thakurgaon Sadar	0	t	26.0717322	88.4637541	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcye400ed408o5zw3ugas	cmozwcvui001q408o8jp1kzcf	Ajmiriganj	ajmiriganj-upazila	60360002	2026-05-10 14:57:34.492	2026-05-10 16:52:39.179	t	\N	Ajmiriganj	0	t	24.5535114	91.2813936	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyea00ee408o6rb6rcii	cmozwcvui001q408o8jp1kzcf	Bahubal	bahubal-upazila	60360005	2026-05-10 14:57:34.498	2026-05-10 16:52:39.183	t	\N	Bahubal	0	t	24.3613885	91.5446399	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyeg00ef408o2ajd392c	cmozwcvui001q408o8jp1kzcf	Baniachong	baniachong-upazila	60360011	2026-05-10 14:57:34.504	2026-05-10 16:52:39.187	t	\N	Baniachong	0	t	24.4988303	91.3668563	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyen00eg408od66bk894	cmozwcvui001q408o8jp1kzcf	Chunarughat	chunarughat-upazila	60360026	2026-05-10 14:57:34.511	2026-05-10 16:52:39.194	t	\N	Chunarughat	0	t	24.1800039	91.5158216	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyet00eh408ocx2nzwim	cmozwcvui001q408o8jp1kzcf	Habiganj Sadar	habiganj-sadar-upazila	60360044	2026-05-10 14:57:34.517	2026-05-10 16:52:39.201	t	\N	Habiganj Sadar	0	t	24.3509306	91.4157802	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyez00ei408osy7j5xv5	cmozwcvui001q408o8jp1kzcf	Lakhai	lakhai-upazila	60360068	2026-05-10 14:57:34.523	2026-05-10 16:52:39.209	t	\N	Lakhai	0	t	24.2985149	91.2608923	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyf600ej408oddqxc0m2	cmozwcvui001q408o8jp1kzcf	Madhabpur	madhabpur-upazila	60360071	2026-05-10 14:57:34.53	2026-05-10 16:52:39.22	t	\N	Madhabpur	0	t	24.1203577	91.3373944	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyfc00ek408o40you9d6	cmozwcvui001q408o8jp1kzcf	Nabiganj	nabiganj-upazila	60360077	2026-05-10 14:57:34.536	2026-05-10 16:52:39.228	t	\N	Nabiganj	0	t	24.5707194	91.5481850	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyfi00el408ohknyvuoc	cmozwcvui001q408o8jp1kzcf	Shayestaganj	shayestaganj-upazila	60360087	2026-05-10 14:57:34.542	2026-05-10 16:52:39.233	t	\N	Shayestaganj	0	t	24.2749772	91.4068188	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyfo00em408ooutstt73	cmozwcvuq001r408o9ft0opwd	Baralekha	baralekha-upazila	60580014	2026-05-10 14:57:34.548	2026-05-10 16:52:39.238	t	\N	Baralekha	0	t	24.7085458	92.1763521	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcya100dt408o2pjzjf2u	cmozwcvtn001m408ohn0zaih9	Nilphamari Sadar	nilphamari-sadar-upazila	55730064	2026-05-10 14:57:34.345	2026-05-10 16:52:39.105	t	\N	Nilphamari Sadar	0	t	25.9420461	88.8547414	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcya800du408o9gudj43p	cmozwcvtn001m408ohn0zaih9	Saidpur	saidpur-upazila	55730085	2026-05-10 14:57:34.352	2026-05-10 16:52:39.108	t	\N	Saidpur	0	t	25.8036711	88.9205050	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyag00dv408oqvhnrzhn	cmozwcvtv001n408ou4h7txxq	Atowari	atowari-upazila	55770004	2026-05-10 14:57:34.36	2026-05-10 16:52:39.112	t	\N	Atowari	0	t	26.2508173	88.4245987	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyan00dw408o1wyo02oa	cmozwcvtv001n408ou4h7txxq	Boda	boda-upazila	55770025	2026-05-10 14:57:34.367	2026-05-10 16:52:39.116	t	\N	Boda	0	t	26.2350255	88.6188193	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyaw00dx408ok3y5d60i	cmozwcvtv001n408ou4h7txxq	Debiganj	debiganj-upazila	55770034	2026-05-10 14:57:34.376	2026-05-10 16:52:39.12	t	\N	Debiganj	0	t	26.1269523	88.7173732	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyb400dy408oa2mrqqs6	cmozwcvtv001n408ou4h7txxq	Panchagarh Sadar	panchagarh-sadar-upazila	55770073	2026-05-10 14:57:34.384	2026-05-10 16:52:39.124	t	\N	Panchagarh Sadar	0	t	26.3647803	88.5910950	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyhb00ev408o6ma5qv34	cmozwcvuy001s408oljusb73n	Derai	derai-upazila	60900029	2026-05-10 14:57:34.607	2026-05-10 16:52:39.289	t	\N	Derai	0	t	24.7874225	91.3360814	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyhh00ew408o7g6pow05	cmozwcvuy001s408oljusb73n	Dharmapasha	dharmapasha-upazila	60900032	2026-05-10 14:57:34.613	2026-05-10 16:52:39.294	t	\N	Dharmapasha	0	t	24.9442515	91.0637998	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyhn00ex408olcflnbjf	cmozwcvuy001s408oljusb73n	Dowarabazar	dowarabazar-upazila	60900033	2026-05-10 14:57:34.619	2026-05-10 16:52:39.3	t	\N	Dowarabazar	0	t	25.0716473	91.5611949	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyht00ey408oda7s6w2k	cmozwcvuy001s408oljusb73n	Jagannathpur	jagannathpur-upazila	60900047	2026-05-10 14:57:34.625	2026-05-10 16:52:39.305	t	\N	Jagannathpur	0	t	24.7501680	91.5567230	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyhz00ez408ov0vtsmf2	cmozwcvuy001s408oljusb73n	Jamalganj	jamalganj-upazila	60900050	2026-05-10 14:57:34.631	2026-05-10 16:52:39.31	t	\N	Jamalganj	0	t	24.9558937	91.2032571	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyi600f0408o9ho81id2	cmozwcvuy001s408oljusb73n	Madhyanagar	madhyanagar-upazila	60900063	2026-05-10 14:57:34.638	2026-05-10 16:52:39.315	t	\N	Madhyanagar	0	t	25.0902021	91.0132659	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyic00f1408oogkynfyt	cmozwcvuy001s408oljusb73n	Shalla	shalla-upazila	60900086	2026-05-10 14:57:34.645	2026-05-10 16:52:39.319	t	\N	Shalla	0	t	24.6874714	91.2588628	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyij00f2408odcdjdoh3	cmozwcvuy001s408oljusb73n	Shantiganj	shantiganj-upazila	60900087	2026-05-10 14:57:34.651	2026-05-10 16:52:39.324	t	\N	Shantiganj	0	t	24.9123799	91.4077762	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyiq00f3408o3pe9hgg9	cmozwcvuy001s408oljusb73n	Sunamganj Sadar	sunamganj-sadar-upazila	60900089	2026-05-10 14:57:34.658	2026-05-10 16:52:39.329	t	\N	Sunamganj Sadar	0	t	25.0538758	91.3999819	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyiw00f4408oq3ubrum1	cmozwcvuy001s408oljusb73n	Tahirpur	tahirpur-upazila	60900092	2026-05-10 14:57:34.664	2026-05-10 16:52:39.333	t	\N	Tahirpur	0	t	25.1290136	91.1636963	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyj200f5408o06qc3l84	cmozwcvv5001t408ohgnteynx	Balaganj	balaganj-upazila	60910008	2026-05-10 14:57:34.67	2026-05-10 16:52:39.337	t	\N	Balaganj	0	t	24.6886506	91.8299208	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyj900f6408oatdv2o0z	cmozwcvv5001t408ohgnteynx	Beanibazar	beanibazar-upazila	60910017	2026-05-10 14:57:34.677	2026-05-10 16:52:39.341	t	\N	Beanibazar	0	t	24.8493484	92.1595709	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyjf00f7408ou814mfry	cmozwcvv5001t408ohgnteynx	Bishwanath	bishwanath-upazila	60910020	2026-05-10 14:57:34.683	2026-05-10 16:52:39.345	t	\N	Bishwanath	0	t	24.8347076	91.7281405	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyjn00f8408oxayrlu2s	cmozwcvv5001t408ohgnteynx	Companiganj	companiganj-upazila-1	60910027	2026-05-10 14:57:34.691	2026-05-10 16:52:39.349	t	\N	Companiganj	0	t	25.0799183	91.7730991	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyjt00f9408ogofacnxa	cmozwcvv5001t408ohgnteynx	Dakkhin Surma	dakkhin-surma-upazila	60910031	2026-05-10 14:57:34.697	2026-05-10 16:52:39.353	t	\N	Dakkhin Surma	0	t	24.8171199	91.8771289	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyjz00fa408o6mhaumom	cmozwcvv5001t408ohgnteynx	Fenchuganj	fenchuganj-upazila	60910035	2026-05-10 14:57:34.703	2026-05-10 16:52:39.356	t	\N	Fenchuganj	0	t	24.6935823	91.9630402	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyk500fb408o4q9ag2f5	cmozwcvv5001t408ohgnteynx	Golapganj	golapganj-upazila	60910038	2026-05-10 14:57:34.709	2026-05-10 16:52:39.359	t	\N	Golapganj	0	t	24.8104747	92.0183846	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcykb00fc408ocihx3b9x	cmozwcvv5001t408ohgnteynx	Gowainghat	gowainghat-upazila	60910041	2026-05-10 14:57:34.715	2026-05-10 16:52:39.364	t	\N	Gowainghat	0	t	25.0814552	91.9589582	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyki00fd408okjq0qwqu	cmozwcvv5001t408ohgnteynx	Jaintapur	jaintapur-upazila	60910053	2026-05-10 14:57:34.722	2026-05-10 16:52:39.367	t	\N	Jaintapur	0	t	25.0579954	92.1045136	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyko00fe408o8vak29ng	cmozwcvv5001t408ohgnteynx	Kanaighat	kanaighat-upazila	60910059	2026-05-10 14:57:34.728	2026-05-10 16:52:39.371	t	\N	Kanaighat	0	t	24.9932219	92.2191151	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcykt00ff408oz13ijdd8	cmozwcvv5001t408ohgnteynx	Osmaninagar	osmaninagar-upazila	60910060	2026-05-10 14:57:34.733	2026-05-10 16:52:39.374	t	\N	Osmaninagar	0	t	24.7033621	91.7319461	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyl000fg408otzq62etd	cmozwcvv5001t408ohgnteynx	Sylhet Sadar	sylhet-sadar-upazila	60910062	2026-05-10 14:57:34.74	2026-05-10 16:52:39.378	t	\N	Sylhet Sadar	0	t	24.9443395	91.8458620	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyl600fh408oeuxdwdyb	cmozwcvv5001t408ohgnteynx	Zakiganj	zakiganj-upazila	60910094	2026-05-10 14:57:34.746	2026-05-10 16:52:39.382	t	\N	Zakiganj	0	t	24.9253169	92.3678601	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyg100eo408o3v4pg80t	cmozwcvuq001r408o9ft0opwd	Kamalganj	kamalganj-upazila	60580056	2026-05-10 14:57:34.561	2026-05-10 16:52:39.251	t	\N	Kamalganj	0	t	24.3168517	91.8601520	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyg700ep408ooht80ys4	cmozwcvuq001r408o9ft0opwd	Kulaura	kulaura-upazila	60580065	2026-05-10 14:57:34.567	2026-05-10 16:52:39.258	t	\N	Kulaura	0	t	24.4899652	92.0151130	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcygj00er408ogkx5dat9	cmozwcvuq001r408o9ft0opwd	Rajnagar	rajnagar-upazila	60580080	2026-05-10 14:57:34.579	2026-05-10 16:52:39.268	t	\N	Rajnagar	0	t	24.5652266	91.8635233	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcygq00es408ogzzknshx	cmozwcvuq001r408o9ft0opwd	Sreemangal	sreemangal-upazila	60580083	2026-05-10 14:57:34.586	2026-05-10 16:52:39.272	t	\N	Sreemangal	0	t	24.3022052	91.6990168	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcygx00et408owg2yagm1	cmozwcvuy001s408oljusb73n	Bishwambharpur	bishwambharpur-upazila	60900018	2026-05-10 14:57:34.593	2026-05-10 16:52:39.278	t	\N	Bishwambharpur	0	t	25.1088842	91.3152383	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyh400eu408o1h19r7js	cmozwcvuy001s408oljusb73n	Chhatak	chhatak-upazila	60900023	2026-05-10 14:57:34.6	2026-05-10 16:52:39.284	t	\N	Chhatak	0	t	24.9489215	91.6145416	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcymy00fp408o3de0ixh8	cmozwcvsg001g408o89fvkvu3	Rajshahi City Corporation	rajshahi-city-corporation-upazila	50816600	2026-05-10 14:57:34.81	2026-05-10 16:52:39.413	t	\N	Rajshahi City Corporation	0	t	24.3807732	88.6087476	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyn500fq408oh91acr1v	cmozwcvhw0008408oy62xrhuk	Barishal City Corporation	barishal-city-corporation-upazila	10065000	2026-05-10 14:57:34.817	2026-05-10 16:52:39.417	t	\N	Barishal City Corporation	0	t	22.7020696	90.3423363	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcync00fr408otwk9ydlk	cmozwcvqm0017408oqj9w95zy	Mymensingh City Corporation	mymensingh-city-corporation-upazila	45614000	2026-05-10 14:57:34.824	2026-05-10 16:52:39.421	t	\N	Mymensingh City Corporation	0	t	24.7498108	90.4058076	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcynj00fs408oj514e30r	cmozwcvu3001o408of3yn25mo	Rangpur City Corporation	rangpur-city-corporation-upazila	55857500	2026-05-10 14:57:34.831	2026-05-10 16:52:39.424	t	\N	Rangpur City Corporation	0	t	25.7532263	89.2442341	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcynq00ft408o8qda3ag0	cmozwcvv5001t408ohgnteynx	Sylhet City Corporation	sylhet-city-corporation-upazila	60915000	2026-05-10 14:57:34.838	2026-05-10 16:52:39.429	t	\N	Sylhet City Corporation	0	t	24.8949318	91.8717948	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw1f002k408orhs51235	cmozwcvk3000g408ocignwjl4	Boalkhali	boalkhali-upazila	20150012	2026-05-10 14:57:31.443	2026-05-10 16:52:37.434	t	\N	Boalkhali	0	t	22.3772949	91.9662211	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw4d002y408o7p39jwus	cmozwcvkj000i408os1f32ab8	Coxs Bazar Sadar	coxs-bazar-sadar-upazila	20220024	2026-05-10 14:57:31.549	2026-05-10 16:52:37.487	t	\N	Coxs Bazar Sadar	0	t	21.4661155	92.0156425	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcw7q003g408oa9tb8gzb	cmozwcvkb000h408opkb53bfd	Lalmai	lalmai-upazila	20190073	2026-05-10 14:57:31.67	2026-05-10 16:52:37.556	t	\N	Lalmai	0	t	23.2976656	91.1594408	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwdq004b408ojkxdy4ma	cmozwcvlf000m408odvf1wds4	Kabirhat	kabirhat-upazila	20750047	2026-05-10 14:57:31.886	2026-05-10 16:52:37.672	t	\N	Kabirhat	0	t	22.8108761	91.1993324	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwji0055408oskyiwncv	cmoxcg57g000kmg8oujmjoxaq	Kaliganj	kaliganj-upazila	30330034	2026-05-10 14:57:32.094	2026-05-10 16:52:37.796	t	\N	Kaliganj	0	t	23.9648177	90.5552282	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwjp0056408oguguulla	cmoxcg57g000kmg8oujmjoxaq	Kapasia	kapasia-upazila	30330036	2026-05-10 14:57:32.101	2026-05-10 16:52:37.799	t	\N	Kapasia	0	t	24.1477954	90.6004601	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwpd0061408o54937aov	cmozwcvn9000r408od9gt62pq	Gazaria	gazaria-upazila	30590024	2026-05-10 14:57:32.305	2026-05-10 16:52:37.923	t	\N	Gazaria	0	t	23.5472257	90.6290194	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcwvf006w408o1w4vd82p	cmozqxhya000zzo8o6lsl370o	Dhanbari	dhanbari-upazila	30930025	2026-05-10 14:57:32.524	2026-05-10 16:52:38.068	t	\N	Dhanbari	0	t	24.6875343	89.9335016	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx1p007q408odnkojaod	cmozwcvp2000z408oce8lth12	Jhenaidah Sadar	jhenaidah-sadar-upazila	40440019	2026-05-10 14:57:32.749	2026-05-10 16:52:38.22	t	\N	Jhenaidah Sadar	0	t	23.5163868	89.1575352	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcx7p008l408ocnz677hc	cmozwcvq80015408o1vyf5cze	Debhata	debhata-upazila	40870025	2026-05-10 14:57:32.965	2026-05-10 16:52:38.352	t	\N	Debhata	0	t	22.5965225	89.0134631	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxdm009g408okhjmhq8t	cmozwcvro001c408otpcx72zj	Mahadebpur	mahadebpur-upazila	50640050	2026-05-10 14:57:33.178	2026-05-10 16:52:38.48	t	\N	Mahadebpur	0	t	24.9218421	88.7636599	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxi700a1408oumj6q1el	cmozwcvs9001f408o1dqychow	Pabna Sadar	pabna-sadar-upazila	50760055	2026-05-10 14:57:33.343	2026-05-10 16:52:38.568	t	\N	Pabna Sadar	0	t	23.9948944	89.2811225	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxkh00ac408ojhp5p223	cmozwcvsg001g408o89fvkvu3	Tanore	tanore-upazila	50810094	2026-05-10 14:57:33.425	2026-05-10 16:52:38.615	t	\N	Tanore	0	t	24.6198587	88.5309075	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxr300b7408oagxg7ogh	cmozwcvi40009408ojea9pyf8	Monpura	monpura-upazila	10090065	2026-05-10 14:57:33.663	2026-05-10 16:52:38.74	t	\N	Monpura	0	t	22.2221648	90.9430810	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxv100bq408omdnu7nue	cmozwcviw000c408o8g1nlapz	Nesarabad (Swarupkathi)	nesarabad-swarupkathi-upazila	10790087	2026-05-10 14:57:33.805	2026-05-10 16:52:38.818	t	\N	Nesarabad (Swarupkathi)	0	t	22.7214251	90.0856436	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxxk00c2408opx98v7gw	cmozwcvqm0017408oqj9w95zy	Fulpur	fulpur-upazila	45610081	2026-05-10 14:57:33.896	2026-05-10 16:52:38.867	t	\N	Fulpur	0	t	24.9529388	90.3529437	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy3k00cx408ojdl8um18	cmozwcvsu001i408orduboc2n	Fulbari	fulbari-upazila	55270038	2026-05-10 14:57:34.112	2026-05-10 16:52:38.986	t	\N	Fulbari	0	t	25.4713788	88.9007365	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcylp00fj408oja2ivzo3	cmozwcvkb000h408opkb53bfd	Cumilla City Corporation	cumilla-city-corporation-upazila	20195000	2026-05-10 14:57:34.765	2026-05-10 16:52:39.389	t	\N	Cumilla City Corporation	0	t	23.4337505	91.1833508	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyly00fk408o52s4lmi2	cmoxc1cd90009ig8ona9jnhsx	Dhaka North City Corporation	dhaka-north-city-corporation-upazila	30262500	2026-05-10 14:57:34.774	2026-05-10 16:52:39.393	t	\N	Dhaka North City Corporation	0	t	23.8207780	90.4061912	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcym700fl408oms8yydnh	cmoxc1cd90009ig8ona9jnhsx	Dhaka South City Corporation	dhaka-south-city-corporation-upazila	30262000	2026-05-10 14:57:34.783	2026-05-10 16:52:39.398	t	\N	Dhaka South City Corporation	0	t	23.7267547	90.4374244	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyme00fm408ost1rjtlm	cmoxcg57g000kmg8oujmjoxaq	Gazipur City Corporation	gazipur-city-corporation-upazila	30333300	2026-05-10 14:57:34.79	2026-05-10 16:52:39.401	t	\N	Gazipur City Corporation	0	t	23.9831906	90.3847399	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcymk00fn408ozuhrbkua	cmozwcvng000s408o1xij4fx0	Narayanganj City Corporation	narayanganj-city-corporation-upazila	30674400	2026-05-10 14:57:34.796	2026-05-10 16:52:39.405	t	\N	Narayanganj City Corporation	0	t	23.6527145	90.5103621	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcymr00fo408ocrj77zyu	cmozwcvp90010408oakyw8ixx	Khulna City Corporation	khulna-city-corporation-upazila	40473300	2026-05-10 14:57:34.803	2026-05-10 16:52:39.409	t	\N	Khulna City Corporation	0	t	22.8373185	89.5411441	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxhr009z408oofl5p309	cmozwcvs9001f408o1dqychow	Faridpur	faridpur-upazila	50760033	2026-05-10 14:57:33.327	2026-05-10 16:52:38.56	t	\N	Faridpur	0	t	24.1581300	89.4494778	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcxhy00a0408olhbzdzru	cmozwcvs9001f408o1dqychow	Ishwardi	ishwardi-upazila	50760039	2026-05-10 14:57:33.334	2026-05-10 16:52:38.565	t	\N	Ishwardi	0	t	24.0801714	89.0943376	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcy9q00ds408o8zcqbadg	cmozwcvtn001m408ohn0zaih9	Kishoreganj	kishoreganj-upazila	55730045	2026-05-10 14:57:34.334	2026-05-10 16:52:39.101	t	\N	Kishoreganj	0	t	25.8979992	89.0331409	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcyfu00en408ogh771qqb	cmozwcvuq001r408o9ft0opwd	Juri	juri-upazila	60580035	2026-05-10 14:57:34.554	2026-05-10 16:52:39.245	t	\N	Juri	0	t	24.5539219	92.1451756	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcygd00eq408oqtxzaqts	cmozwcvuq001r408o9ft0opwd	Moulvibazar Sadar	moulvibazar-sadar-upazila	60580074	2026-05-10 14:57:34.573	2026-05-10 16:52:39.263	t	\N	Moulvibazar Sadar	0	t	24.4993968	91.7131681	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
cmozwcylj00fi408o7kjktdm4	cmozwcvk3000g408ocignwjl4	Chattogram City Corporation	chattogram-city-corporation-upazila	20151600	2026-05-10 14:57:34.759	2026-05-10 16:52:39.386	t	\N	Chattogram City Corporation	0	t	22.3455209	91.8089727	HDX cod-ab-bgd v03 (OCHA admin boundaries; adm1/2/3 centroid lat/lon)
\.


--
-- Data for Name: UploadedFile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UploadedFile" (id, "ownerUserId", bucket, "storageKey", "originalName", "mimeType", "sizeBytes", "fileCategory", "publicUrl", checksum, width, height, status, "createdAt", "updatedAt") FROM stdin;
cmozsm4120001yo8o3ek9j1zc	demo-seed-user-customer	pranidoctor-uploads	uploads/v1/demo-seed-user-customer/AI_TECHNICIAN_NID_FRONT/844ee83e-0d0b-4cb6-8d85-c28553780cbe-Screenshot_2026-05-09-16-31-58-018_com.facebook.katana.jpg.webp	Screenshot_2026-05-09-16-31-58-018_com.facebook.katana.jpg	image/webp	78548	AI_TECHNICIAN_NID_FRONT	\N	167a69058157d4ec5da45ff3540cb7c1953dfd74c42dae6bee349b4be618fead	720	1600	ACTIVE	2026-05-10 13:12:43.238	2026-05-10 13:12:43.238
cmozsmtpx0003yo8oazrb3zw8	demo-seed-user-customer	pranidoctor-uploads	uploads/v1/demo-seed-user-customer/AI_TECHNICIAN_NID_BACK/bca0a7e5-44bf-4657-8898-b11e982ddca7-Screenshot_2026-05-10-18-09-42-386_com.example.pranidoctor_mobile.jpg.webp	Screenshot_2026-05-10-18-09-42-386_com.example.pranidoctor_mobile.jpg	image/webp	41192	AI_TECHNICIAN_NID_BACK	\N	9864e73b5985a99ca48b388711d5f41c2668cd534b75d04fca34524fbf315a7b	720	1600	ACTIVE	2026-05-10 13:13:16.533	2026-05-10 13:13:16.533
cmozswj130005yo8oyxu2ge82	demo-seed-user-customer	pranidoctor-uploads	uploads/v1/demo-seed-user-customer/AI_TECHNICIAN_TRAINING_CERTIFICATE/b7a63a0e-456f-43c7-932a-edb166f6a179-IMG_20251202_004233.jpg.webp	IMG_20251202_004233.jpg	image/webp	134600	AI_TECHNICIAN_TRAINING_CERTIFICATE	\N	5dc9a581c055a189023b9805de35783adb6e6f35218ca0ff930bb032bc570b8f	830	1023	ACTIVE	2026-05-10 13:20:49.239	2026-05-10 13:20:49.239
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, phone, "passwordHash", role, status, "createdAt", "updatedAt") FROM stdin;
cmox9kcky0000nk8oz9yu2h9w	admin@pranidoctor.local	\N	$2b$12$/6bA3spTe4zrc8ZaH/lSlOKB7ZqJuV7H3BihZDyNm4ha/wbDr0O8S	ADMIN	ACTIVE	2026-05-08 18:43:55.955	2026-05-08 20:14:56.268
cmoyuggw5000hz88o8vdjwemj	demo-doctor-1@pranidoctor.test	01800000001	$2b$12$nFJvZ3g1jQPxMiJGthELP.MLphXfO6ugRsPl.dJry5oVj60cSrxTi	DOCTOR	ACTIVE	2026-05-09 21:16:33.029	2026-05-10 05:59:50.483
cmoyuggy9000oz88oi0msc5um	demo-doctor-2@pranidoctor.test	01800000002	$2b$12$nFJvZ3g1jQPxMiJGthELP.MLphXfO6ugRsPl.dJry5oVj60cSrxTi	DOCTOR	ACTIVE	2026-05-09 21:16:33.105	2026-05-10 05:59:50.539
cmoyuggzp000uz88o9nb1b7g1	demo-doctor-3@pranidoctor.test	01800000003	$2b$12$nFJvZ3g1jQPxMiJGthELP.MLphXfO6ugRsPl.dJry5oVj60cSrxTi	DOCTOR	ACTIVE	2026-05-09 21:16:33.157	2026-05-10 05:59:50.563
cmoyugh0t0010z88oac7dw94o	demo-doctor-4@pranidoctor.test	01800000004	$2b$12$nFJvZ3g1jQPxMiJGthELP.MLphXfO6ugRsPl.dJry5oVj60cSrxTi	DOCTOR	ACTIVE	2026-05-09 21:16:33.197	2026-05-10 05:59:50.586
cmoyugh1j0015z88otmgjn54s	demo-doctor-5@pranidoctor.test	01800000005	$2b$12$nFJvZ3g1jQPxMiJGthELP.MLphXfO6ugRsPl.dJry5oVj60cSrxTi	DOCTOR	ACTIVE	2026-05-09 21:16:33.223	2026-05-10 05:59:50.602
cmoyugh2z001cz88o0ciz9ort	demo-ai-1@pranidoctor.test	01900000001	$2b$12$nFJvZ3g1jQPxMiJGthELP.MLphXfO6ugRsPl.dJry5oVj60cSrxTi	AI_TECHNICIAN	ACTIVE	2026-05-09 21:16:33.275	2026-05-10 05:59:50.633
cmoyugh40001hz88ojc4pa6x3	demo-ai-2@pranidoctor.test	01900000002	$2b$12$nFJvZ3g1jQPxMiJGthELP.MLphXfO6ugRsPl.dJry5oVj60cSrxTi	AI_TECHNICIAN	ACTIVE	2026-05-09 21:16:33.312	2026-05-10 05:59:50.666
cmoyugh5t001rz88olvc3ik06	demo-support@pranidoctor.test	01800900909	$2b$12$nFJvZ3g1jQPxMiJGthELP.MLphXfO6ugRsPl.dJry5oVj60cSrxTi	SUPPORT	ACTIVE	2026-05-09 21:16:33.377	2026-05-10 05:59:50.706
cmoy32w8y0000508o4ngdc3pv	admin@pranidoctor.com	01777889994	$2b$12$yh8UGScwoNX97ZAlE.vhbedfCP9PZjPF1.iw.C/6uoDl8xPvQYMxa	ADMIN	ACTIVE	2026-05-09 08:30:10.116	2026-05-10 12:25:35.015
demo-seed-user-customer	balag.bd@gmail.com	8801701022274	$2b$12$6KQfVBZPIa4ey1JMOvBzL.Theg2/cFK1tIAWvjnmyx9xy/zteDbTC	AI_TECHNICIAN	ACTIVE	2026-05-09 21:16:32.958	2026-05-10 13:21:47.205
cmoyugh54001mz88od13nhoyd	demo-ai-3@pranidoctor.test	01900000003	$2b$12$nFJvZ3g1jQPxMiJGthELP.MLphXfO6ugRsPl.dJry5oVj60cSrxTi	AI_TECHNICIAN	ACTIVE	2026-05-09 21:16:33.352	2026-05-10 13:27:32.387
\.


--
-- Data for Name: Village; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Village" (id, "unionId", name, slug, code, "createdAt", "updatedAt", "isActive", "isVerified", latitude, longitude, "nameBn", "nameEn", source) FROM stdin;
cmoxc1cdy000cig8obmj9xvf0	cmoxc1cdq000big8ozb9s936u	Placeholder Village	placeholder-village-001	\N	2026-05-08 19:53:08.086	2026-05-08 19:53:08.086	t	f	\N	\N	\N	\N	\N
cmoxc48jj000gac8ojoogi46b	cmoxcg583000nmg8ofy12uz4w	Ashulia (demo service village)	sample-service-village-001	3026334701	2026-05-08 19:55:23.071	2026-05-10 12:25:35.219	t	f	\N	\N	\N	\N	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
5b17a6b8-68f3-4b4b-a707-3a64e7168466	baf519f837681e46aac5ba436ad2ff5b3e79b777e05a567bac888945576b81ed	2026-05-08 18:43:22.827922+00	20260208120000_init_mvp	\N	\N	2026-05-08 18:43:22.179858+00	1
9b2e6933-c83d-4c26-bd15-55b9fee93541	acc52888bdf0c4dc5e5dbf2c4107db01de288510c3841ed279657ea5c4d47ae4	2026-05-10 12:24:47.942518+00	20260510210000_ai_technician_quality_tables	\N	\N	2026-05-10 12:24:47.825337+00	1
03bbc5c0-86ad-4c44-b99f-338c808cc03e	51c39a10fca0009ec6a81990b1715d03117aec58ccbe6ed4d4dc558611f0f5c1	2026-05-08 19:52:20.808969+00	20260508195220_prani_doctor_mvp_schema	\N	\N	2026-05-08 19:52:20.232723+00	1
488e01d6-31d3-442d-8740-5d6556ce4eda	6e8442c22fe83f98848668d9f89f1da2a5f960c6f4ad5e59a0d3e46e8067ffd6	2026-05-08 20:04:01.364835+00	20260508200401_area_hierarchy	\N	\N	2026-05-08 20:04:01.328693+00	1
bd0e1bdb-5ac6-4449-aa0d-80bb25901b92	d1481a57a35100b8fa24a59c4f96296c20da6f8d3d26d21402d037602131c3af	2026-05-08 20:40:07.72513+00	20260508204007_doctor_management_fields	\N	\N	2026-05-08 20:40:07.644347+00	1
c28f706f-9648-4c56-b265-e21f9d70cef8	cce95bca92d12305eb6938191960023aa04b9206ab0c16006c55f7b23755b8ab	2026-05-10 12:25:16.754532+00	20260510122449_bd_locations_foundation	\N	\N	2026-05-10 12:25:16.615939+00	1
fc5a152a-6118-461c-9256-422d279507a2	a90d389109968e261c8481201d63eeabfcc8c85a30b6869f4a75826662d4c709	2026-05-08 20:55:22.678535+00	20260508205522_ai_technician_foundation	\N	\N	2026-05-08 20:55:22.60639+00	1
87e76596-8427-4304-ae18-d0904875ecc4	8ebbad0fa6f44ba7dfa1e3ae995a657037dc7bb39d369658fa379a98e2fe45b3	2026-05-08 21:24:31.03291+00	20260508212430_animal_photo_pregnancy_status	\N	\N	2026-05-08 21:24:31.018747+00	1
f70947b2-ad91-4bb4-b875-1217f522d906	9eda15219c6245dcde0ffafac9546efd4e29af7c36ce9b70ee5a0109baddc578	2026-05-09 05:58:21.024246+00	20260509120000_service_request_booking_enums_fields	\N	\N	2026-05-09 05:58:20.941526+00	1
08362149-9bb6-498f-af61-03eb154facd5	66386b41e90a7cbfe59631f1ae12f635dc9b14047b811ba95bdd6bc8da59e3b4	2026-05-10 12:31:05.009815+00	20260510140000_universal_uploads_foundation	\N	\N	2026-05-10 12:31:04.941609+00	1
d28118a8-d887-4ecd-8ad0-ac58f139becb	67791fe126d193c3dd70bae1ef2545522519721a4b699b0d047811439fbac4bc	2026-05-09 05:58:22.55488+00	20260509055822_billing_payment_fields_and_enums	\N	\N	2026-05-09 05:58:22.528269+00	1
1ac1235a-91c8-4bee-b8c8-eb32550a34c2	7b494b9b9a7a84c8071518be6a58601599637517148ca1508cc1543d4e9af1ab	2026-05-09 06:34:47.320015+00	20260509120000_knowledge_hub_content	\N	\N	2026-05-09 06:34:47.209444+00	1
db0dbb43-82e2-4940-bbe6-0dec286f4b98	6640d57edadc0dea9f109371a1d1f23f5e05d68b1da947b942307b6493781e8b	2026-05-09 17:36:09.101144+00	20260509080348_mobile_otp_challenge	\N	\N	2026-05-09 17:36:09.055056+00	1
17b7484e-6ce7-42d7-a594-c18b67e76394	6fbef0520b86c5b7454493bd30eaee206fd7e26c749e5e8ff3cb806cc3094294	\N	20260510145715_add_location_master_fields	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260510145715_add_location_master_fields\n\nDatabase error code: 23505\n\nDatabase error:\nERROR: could not create unique index "District_divisionId_code_key"\nDETAIL: Key ("divisionId", code)=(cmoxc1cd10008ig8o7buvk5hz, 3033) is duplicated.\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E23505), message: "could not create unique index \\"District_divisionId_code_key\\"", detail: Some("Key (\\"divisionId\\", code)=(cmoxc1cd10008ig8o7buvk5hz, 3033) is duplicated."), hint: None, position: None, where_: None, schema: Some("public"), table: Some("District"), column: None, datatype: None, constraint: Some("District_divisionId_code_key"), file: Some("tuplesortvariants.c"), line: Some(1361), routine: Some("comparetup_index_btree") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260510145715_add_location_master_fields"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20260510145715_add_location_master_fields"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:255	2026-05-10 15:07:38.491499+00	2026-05-10 14:57:15.145514+00	0
bbc51f2c-a445-4007-b3f5-c6d10f9ee7d6	f94bc861a93d2e8f65a997e3c41811287f508f3adc04140fe380d79181c1507d	2026-05-09 17:36:09.113527+00	20260509180000_mobile_otp_last_sent	\N	\N	2026-05-09 17:36:09.104175+00	1
7c87e6ef-1d4d-4782-b010-a2e4a42e136e	3b8dfc5b6f298e0696ad12b9c9024a7f55e06ad616111ced5d0736d75e5662f2	2026-05-10 09:28:31.159944+00	20260510092800_ai_technician_foundation	\N	\N	2026-05-10 09:28:30.885703+00	1
4720c100-c95e-4e07-9885-84f039d7887a	198f5a2b663d72c35a97d997619093902bd6d46762992ee9801dada0df6a1f1d	2026-05-10 12:24:47.822718+00	20260510183000_ai_service_request_decline_reason	\N	\N	2026-05-10 12:24:47.814+00	1
\.


--
-- Name: AdminProfile AdminProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminProfile"
    ADD CONSTRAINT "AdminProfile_pkey" PRIMARY KEY (id);


--
-- Name: AiServiceRecord AiServiceRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiServiceRecord"
    ADD CONSTRAINT "AiServiceRecord_pkey" PRIMARY KEY (id);


--
-- Name: AiServiceRequest AiServiceRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiServiceRequest"
    ADD CONSTRAINT "AiServiceRequest_pkey" PRIMARY KEY (id);


--
-- Name: AiTechnicianComplaint AiTechnicianComplaint_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianComplaint"
    ADD CONSTRAINT "AiTechnicianComplaint_pkey" PRIMARY KEY (id);


--
-- Name: AiTechnicianDivisionServiceArea AiTechnicianDivisionServiceArea_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianDivisionServiceArea"
    ADD CONSTRAINT "AiTechnicianDivisionServiceArea_pkey" PRIMARY KEY (id);


--
-- Name: AiTechnicianDocument AiTechnicianDocument_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianDocument"
    ADD CONSTRAINT "AiTechnicianDocument_pkey" PRIMARY KEY (id);


--
-- Name: AiTechnicianProfileArea AiTechnicianProfileArea_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianProfileArea"
    ADD CONSTRAINT "AiTechnicianProfileArea_pkey" PRIMARY KEY (id);


--
-- Name: AiTechnicianProfileServiceCategory AiTechnicianProfileServiceCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianProfileServiceCategory"
    ADD CONSTRAINT "AiTechnicianProfileServiceCategory_pkey" PRIMARY KEY (id);


--
-- Name: AiTechnicianProfile AiTechnicianProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianProfile"
    ADD CONSTRAINT "AiTechnicianProfile_pkey" PRIMARY KEY (id);


--
-- Name: AiTechnicianReview AiTechnicianReview_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianReview"
    ADD CONSTRAINT "AiTechnicianReview_pkey" PRIMARY KEY (id);


--
-- Name: AiTechnicianServiceArea AiTechnicianServiceArea_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianServiceArea"
    ADD CONSTRAINT "AiTechnicianServiceArea_pkey" PRIMARY KEY (id);


--
-- Name: AiTechnicianService AiTechnicianService_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianService"
    ADD CONSTRAINT "AiTechnicianService_pkey" PRIMARY KEY (id);


--
-- Name: AnimalProfile AnimalProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AnimalProfile"
    ADD CONSTRAINT "AnimalProfile_pkey" PRIMARY KEY (id);


--
-- Name: Area Area_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Area"
    ADD CONSTRAINT "Area_pkey" PRIMARY KEY (id);


--
-- Name: BillingRecord BillingRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BillingRecord"
    ADD CONSTRAINT "BillingRecord_pkey" PRIMARY KEY (id);


--
-- Name: Complaint Complaint_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Complaint"
    ADD CONSTRAINT "Complaint_pkey" PRIMARY KEY (id);


--
-- Name: ContentCategory ContentCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContentCategory"
    ADD CONSTRAINT "ContentCategory_pkey" PRIMARY KEY (id);


--
-- Name: ContentPost ContentPost_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContentPost"
    ADD CONSTRAINT "ContentPost_pkey" PRIMARY KEY (id);


--
-- Name: CustomerProfile CustomerProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CustomerProfile"
    ADD CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY (id);


--
-- Name: District District_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."District"
    ADD CONSTRAINT "District_pkey" PRIMARY KEY (id);


--
-- Name: Division Division_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Division"
    ADD CONSTRAINT "Division_pkey" PRIMARY KEY (id);


--
-- Name: DoctorProfileArea DoctorProfileArea_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DoctorProfileArea"
    ADD CONSTRAINT "DoctorProfileArea_pkey" PRIMARY KEY (id);


--
-- Name: DoctorProfileServiceCategory DoctorProfileServiceCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DoctorProfileServiceCategory"
    ADD CONSTRAINT "DoctorProfileServiceCategory_pkey" PRIMARY KEY (id);


--
-- Name: DoctorProfile DoctorProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DoctorProfile"
    ADD CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY (id);


--
-- Name: DoctorServiceArea DoctorServiceArea_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DoctorServiceArea"
    ADD CONSTRAINT "DoctorServiceArea_pkey" PRIMARY KEY (id);


--
-- Name: MobileOtpChallenge MobileOtpChallenge_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MobileOtpChallenge"
    ADD CONSTRAINT "MobileOtpChallenge_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: PaymentRecord PaymentRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentRecord"
    ADD CONSTRAINT "PaymentRecord_pkey" PRIMARY KEY (id);


--
-- Name: PrescriptionItem PrescriptionItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrescriptionItem"
    ADD CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY (id);


--
-- Name: Prescription Prescription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: ServiceCategory ServiceCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceCategory"
    ADD CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY (id);


--
-- Name: ServiceRequest ServiceRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceRequest"
    ADD CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY (id);


--
-- Name: Setting Setting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Setting"
    ADD CONSTRAINT "Setting_pkey" PRIMARY KEY (id);


--
-- Name: TreatmentRecord TreatmentRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TreatmentRecord"
    ADD CONSTRAINT "TreatmentRecord_pkey" PRIMARY KEY (id);


--
-- Name: Union Union_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Union"
    ADD CONSTRAINT "Union_pkey" PRIMARY KEY (id);


--
-- Name: Upazila Upazila_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Upazila"
    ADD CONSTRAINT "Upazila_pkey" PRIMARY KEY (id);


--
-- Name: UploadedFile UploadedFile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UploadedFile"
    ADD CONSTRAINT "UploadedFile_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Village Village_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Village"
    ADD CONSTRAINT "Village_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AdminProfile_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AdminProfile_userId_key" ON public."AdminProfile" USING btree ("userId");


--
-- Name: AiServiceRecord_aiServiceRequestId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AiServiceRecord_aiServiceRequestId_key" ON public."AiServiceRecord" USING btree ("aiServiceRequestId");


--
-- Name: AiServiceRecord_customerUserId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiServiceRecord_customerUserId_idx" ON public."AiServiceRecord" USING btree ("customerUserId");


--
-- Name: AiServiceRecord_serviceDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiServiceRecord_serviceDate_idx" ON public."AiServiceRecord" USING btree ("serviceDate");


--
-- Name: AiServiceRecord_technicianProfileId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiServiceRecord_technicianProfileId_idx" ON public."AiServiceRecord" USING btree ("technicianProfileId");


--
-- Name: AiServiceRequest_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiServiceRequest_createdAt_idx" ON public."AiServiceRequest" USING btree ("createdAt");


--
-- Name: AiServiceRequest_customerUserId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiServiceRequest_customerUserId_idx" ON public."AiServiceRequest" USING btree ("customerUserId");


--
-- Name: AiServiceRequest_linkedServiceRequestId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AiServiceRequest_linkedServiceRequestId_key" ON public."AiServiceRequest" USING btree ("linkedServiceRequestId");


--
-- Name: AiServiceRequest_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiServiceRequest_status_idx" ON public."AiServiceRequest" USING btree (status);


--
-- Name: AiServiceRequest_technicianProfileId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiServiceRequest_technicianProfileId_idx" ON public."AiServiceRequest" USING btree ("technicianProfileId");


--
-- Name: AiTechnicianComplaint_aiServiceRequestId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianComplaint_aiServiceRequestId_idx" ON public."AiTechnicianComplaint" USING btree ("aiServiceRequestId");


--
-- Name: AiTechnicianComplaint_customerUserId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianComplaint_customerUserId_idx" ON public."AiTechnicianComplaint" USING btree ("customerUserId");


--
-- Name: AiTechnicianComplaint_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianComplaint_status_idx" ON public."AiTechnicianComplaint" USING btree (status);


--
-- Name: AiTechnicianComplaint_technicianProfileId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianComplaint_technicianProfileId_idx" ON public."AiTechnicianComplaint" USING btree ("technicianProfileId");


--
-- Name: AiTechnicianDivisionServiceArea_aiTechnicianId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianDivisionServiceArea_aiTechnicianId_idx" ON public."AiTechnicianDivisionServiceArea" USING btree ("aiTechnicianId");


--
-- Name: AiTechnicianDivisionServiceArea_districtId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianDivisionServiceArea_districtId_idx" ON public."AiTechnicianDivisionServiceArea" USING btree ("districtId");


--
-- Name: AiTechnicianDivisionServiceArea_district_upazila_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianDivisionServiceArea_district_upazila_idx" ON public."AiTechnicianDivisionServiceArea" USING btree (district, upazila);


--
-- Name: AiTechnicianDivisionServiceArea_unionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianDivisionServiceArea_unionId_idx" ON public."AiTechnicianDivisionServiceArea" USING btree ("unionId");


--
-- Name: AiTechnicianDivisionServiceArea_upazilaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianDivisionServiceArea_upazilaId_idx" ON public."AiTechnicianDivisionServiceArea" USING btree ("upazilaId");


--
-- Name: AiTechnicianDocument_aiTechnicianId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianDocument_aiTechnicianId_idx" ON public."AiTechnicianDocument" USING btree ("aiTechnicianId");


--
-- Name: AiTechnicianDocument_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianDocument_type_idx" ON public."AiTechnicianDocument" USING btree (type);


--
-- Name: AiTechnicianDocument_uploadedFileId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AiTechnicianDocument_uploadedFileId_key" ON public."AiTechnicianDocument" USING btree ("uploadedFileId");


--
-- Name: AiTechnicianProfileArea_aiTechnicianId_areaId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AiTechnicianProfileArea_aiTechnicianId_areaId_key" ON public."AiTechnicianProfileArea" USING btree ("aiTechnicianId", "areaId");


--
-- Name: AiTechnicianProfileArea_areaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianProfileArea_areaId_idx" ON public."AiTechnicianProfileArea" USING btree ("areaId");


--
-- Name: AiTechnicianProfileServiceCategory_aiTechnicianId_serviceCa_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AiTechnicianProfileServiceCategory_aiTechnicianId_serviceCa_key" ON public."AiTechnicianProfileServiceCategory" USING btree ("aiTechnicianId", "serviceCategoryId");


--
-- Name: AiTechnicianProfileServiceCategory_serviceCategoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianProfileServiceCategory_serviceCategoryId_idx" ON public."AiTechnicianProfileServiceCategory" USING btree ("serviceCategoryId");


--
-- Name: AiTechnicianProfile_districtId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianProfile_districtId_idx" ON public."AiTechnicianProfile" USING btree ("districtId");


--
-- Name: AiTechnicianProfile_providerStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianProfile_providerStatus_idx" ON public."AiTechnicianProfile" USING btree ("providerStatus");


--
-- Name: AiTechnicianProfile_reviewedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianProfile_reviewedById_idx" ON public."AiTechnicianProfile" USING btree ("reviewedById");


--
-- Name: AiTechnicianProfile_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianProfile_status_idx" ON public."AiTechnicianProfile" USING btree (status);


--
-- Name: AiTechnicianProfile_unionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianProfile_unionId_idx" ON public."AiTechnicianProfile" USING btree ("unionId");


--
-- Name: AiTechnicianProfile_upazilaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianProfile_upazilaId_idx" ON public."AiTechnicianProfile" USING btree ("upazilaId");


--
-- Name: AiTechnicianProfile_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AiTechnicianProfile_userId_key" ON public."AiTechnicianProfile" USING btree ("userId");


--
-- Name: AiTechnicianReview_aiServiceRequestId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AiTechnicianReview_aiServiceRequestId_key" ON public."AiTechnicianReview" USING btree ("aiServiceRequestId");


--
-- Name: AiTechnicianReview_customerUserId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianReview_customerUserId_idx" ON public."AiTechnicianReview" USING btree ("customerUserId");


--
-- Name: AiTechnicianReview_technicianProfileId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianReview_technicianProfileId_idx" ON public."AiTechnicianReview" USING btree ("technicianProfileId");


--
-- Name: AiTechnicianReview_visibility_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianReview_visibility_idx" ON public."AiTechnicianReview" USING btree (visibility);


--
-- Name: AiTechnicianServiceArea_aiTechnicianId_villageId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AiTechnicianServiceArea_aiTechnicianId_villageId_key" ON public."AiTechnicianServiceArea" USING btree ("aiTechnicianId", "villageId");


--
-- Name: AiTechnicianServiceArea_villageId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianServiceArea_villageId_idx" ON public."AiTechnicianServiceArea" USING btree ("villageId");


--
-- Name: AiTechnicianService_aiTechnicianId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianService_aiTechnicianId_idx" ON public."AiTechnicianService" USING btree ("aiTechnicianId");


--
-- Name: AiTechnicianService_animalType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianService_animalType_idx" ON public."AiTechnicianService" USING btree ("animalType");


--
-- Name: AiTechnicianService_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AiTechnicianService_status_idx" ON public."AiTechnicianService" USING btree (status);


--
-- Name: AnimalProfile_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AnimalProfile_customerId_idx" ON public."AnimalProfile" USING btree ("customerId");


--
-- Name: Area_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Area_isActive_idx" ON public."Area" USING btree ("isActive");


--
-- Name: Area_parentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Area_parentId_idx" ON public."Area" USING btree ("parentId");


--
-- Name: Area_parentId_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Area_parentId_type_idx" ON public."Area" USING btree ("parentId", type);


--
-- Name: Area_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Area_slug_key" ON public."Area" USING btree (slug);


--
-- Name: Area_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Area_type_idx" ON public."Area" USING btree (type);


--
-- Name: BillingRecord_aiTechnicianId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BillingRecord_aiTechnicianId_idx" ON public."BillingRecord" USING btree ("aiTechnicianId");


--
-- Name: BillingRecord_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BillingRecord_customerId_idx" ON public."BillingRecord" USING btree ("customerId");


--
-- Name: BillingRecord_doctorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BillingRecord_doctorId_idx" ON public."BillingRecord" USING btree ("doctorId");


--
-- Name: BillingRecord_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BillingRecord_status_idx" ON public."BillingRecord" USING btree (status);


--
-- Name: Complaint_adminAssigneeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Complaint_adminAssigneeId_idx" ON public."Complaint" USING btree ("adminAssigneeId");


--
-- Name: Complaint_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Complaint_customerId_idx" ON public."Complaint" USING btree ("customerId");


--
-- Name: Complaint_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Complaint_status_idx" ON public."Complaint" USING btree (status);


--
-- Name: ContentCategory_isActive_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContentCategory_isActive_sortOrder_idx" ON public."ContentCategory" USING btree ("isActive", "sortOrder");


--
-- Name: ContentCategory_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ContentCategory_slug_key" ON public."ContentCategory" USING btree (slug);


--
-- Name: ContentPost_approvalStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContentPost_approvalStatus_idx" ON public."ContentPost" USING btree ("approvalStatus");


--
-- Name: ContentPost_authorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContentPost_authorId_idx" ON public."ContentPost" USING btree ("authorId");


--
-- Name: ContentPost_categoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContentPost_categoryId_idx" ON public."ContentPost" USING btree ("categoryId");


--
-- Name: ContentPost_isPublished_publishedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ContentPost_isPublished_publishedAt_idx" ON public."ContentPost" USING btree ("isPublished", "publishedAt");


--
-- Name: ContentPost_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ContentPost_slug_key" ON public."ContentPost" USING btree (slug);


--
-- Name: CustomerProfile_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CustomerProfile_userId_key" ON public."CustomerProfile" USING btree ("userId");


--
-- Name: District_divisionId_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "District_divisionId_code_idx" ON public."District" USING btree ("divisionId", code);


--
-- Name: District_divisionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "District_divisionId_idx" ON public."District" USING btree ("divisionId");


--
-- Name: District_divisionId_nameBn_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "District_divisionId_nameBn_idx" ON public."District" USING btree ("divisionId", "nameBn");


--
-- Name: District_divisionId_nameEn_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "District_divisionId_nameEn_idx" ON public."District" USING btree ("divisionId", "nameEn");


--
-- Name: District_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "District_isActive_idx" ON public."District" USING btree ("isActive");


--
-- Name: District_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "District_slug_key" ON public."District" USING btree (slug);


--
-- Name: Division_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Division_isActive_idx" ON public."Division" USING btree ("isActive");


--
-- Name: Division_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Division_slug_key" ON public."Division" USING btree (slug);


--
-- Name: DoctorProfileArea_areaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DoctorProfileArea_areaId_idx" ON public."DoctorProfileArea" USING btree ("areaId");


--
-- Name: DoctorProfileArea_doctorId_areaId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "DoctorProfileArea_doctorId_areaId_key" ON public."DoctorProfileArea" USING btree ("doctorId", "areaId");


--
-- Name: DoctorProfileServiceCategory_doctorId_serviceCategoryId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "DoctorProfileServiceCategory_doctorId_serviceCategoryId_key" ON public."DoctorProfileServiceCategory" USING btree ("doctorId", "serviceCategoryId");


--
-- Name: DoctorProfileServiceCategory_serviceCategoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DoctorProfileServiceCategory_serviceCategoryId_idx" ON public."DoctorProfileServiceCategory" USING btree ("serviceCategoryId");


--
-- Name: DoctorProfile_providerStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DoctorProfile_providerStatus_idx" ON public."DoctorProfile" USING btree ("providerStatus");


--
-- Name: DoctorProfile_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "DoctorProfile_userId_key" ON public."DoctorProfile" USING btree ("userId");


--
-- Name: DoctorServiceArea_doctorId_villageId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "DoctorServiceArea_doctorId_villageId_key" ON public."DoctorServiceArea" USING btree ("doctorId", "villageId");


--
-- Name: DoctorServiceArea_villageId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DoctorServiceArea_villageId_idx" ON public."DoctorServiceArea" USING btree ("villageId");


--
-- Name: MobileOtpChallenge_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MobileOtpChallenge_expiresAt_idx" ON public."MobileOtpChallenge" USING btree ("expiresAt");


--
-- Name: MobileOtpChallenge_normalizedPhone_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "MobileOtpChallenge_normalizedPhone_key" ON public."MobileOtpChallenge" USING btree ("normalizedPhone");


--
-- Name: Notification_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_type_idx" ON public."Notification" USING btree (type);


--
-- Name: Notification_userId_readAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_userId_readAt_idx" ON public."Notification" USING btree ("userId", "readAt");


--
-- Name: PaymentRecord_billingRecordId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PaymentRecord_billingRecordId_idx" ON public."PaymentRecord" USING btree ("billingRecordId");


--
-- Name: PaymentRecord_externalId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PaymentRecord_externalId_idx" ON public."PaymentRecord" USING btree ("externalId");


--
-- Name: PaymentRecord_serviceRequestId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PaymentRecord_serviceRequestId_idx" ON public."PaymentRecord" USING btree ("serviceRequestId");


--
-- Name: PaymentRecord_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PaymentRecord_status_idx" ON public."PaymentRecord" USING btree (status);


--
-- Name: PrescriptionItem_prescriptionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PrescriptionItem_prescriptionId_idx" ON public."PrescriptionItem" USING btree ("prescriptionId");


--
-- Name: Prescription_aiTechnicianId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Prescription_aiTechnicianId_idx" ON public."Prescription" USING btree ("aiTechnicianId");


--
-- Name: Prescription_doctorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Prescription_doctorId_idx" ON public."Prescription" USING btree ("doctorId");


--
-- Name: Prescription_serviceRequestId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Prescription_serviceRequestId_idx" ON public."Prescription" USING btree ("serviceRequestId");


--
-- Name: Review_aiTechnicianId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Review_aiTechnicianId_idx" ON public."Review" USING btree ("aiTechnicianId");


--
-- Name: Review_customerId_serviceRequestId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Review_customerId_serviceRequestId_idx" ON public."Review" USING btree ("customerId", "serviceRequestId");


--
-- Name: Review_doctorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Review_doctorId_idx" ON public."Review" USING btree ("doctorId");


--
-- Name: Review_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Review_status_idx" ON public."Review" USING btree (status);


--
-- Name: ServiceCategory_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ServiceCategory_slug_key" ON public."ServiceCategory" USING btree (slug);


--
-- Name: ServiceRequest_animalId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceRequest_animalId_idx" ON public."ServiceRequest" USING btree ("animalId");


--
-- Name: ServiceRequest_areaId_serviceCategoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceRequest_areaId_serviceCategoryId_idx" ON public."ServiceRequest" USING btree ("areaId", "serviceCategoryId");


--
-- Name: ServiceRequest_assignedAiTechnicianId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceRequest_assignedAiTechnicianId_status_idx" ON public."ServiceRequest" USING btree ("assignedAiTechnicianId", status);


--
-- Name: ServiceRequest_assignedDoctorId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceRequest_assignedDoctorId_status_idx" ON public."ServiceRequest" USING btree ("assignedDoctorId", status);


--
-- Name: ServiceRequest_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceRequest_customerId_idx" ON public."ServiceRequest" USING btree ("customerId");


--
-- Name: ServiceRequest_requestType_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceRequest_requestType_status_idx" ON public."ServiceRequest" USING btree ("requestType", status);


--
-- Name: ServiceRequest_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceRequest_status_idx" ON public."ServiceRequest" USING btree (status);


--
-- Name: ServiceRequest_villageId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ServiceRequest_villageId_idx" ON public."ServiceRequest" USING btree ("villageId");


--
-- Name: Setting_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Setting_key_key" ON public."Setting" USING btree (key);


--
-- Name: TreatmentRecord_aiTechnicianId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TreatmentRecord_aiTechnicianId_idx" ON public."TreatmentRecord" USING btree ("aiTechnicianId");


--
-- Name: TreatmentRecord_doctorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TreatmentRecord_doctorId_idx" ON public."TreatmentRecord" USING btree ("doctorId");


--
-- Name: TreatmentRecord_serviceRequestId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TreatmentRecord_serviceRequestId_idx" ON public."TreatmentRecord" USING btree ("serviceRequestId");


--
-- Name: TreatmentRecord_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TreatmentRecord_status_idx" ON public."TreatmentRecord" USING btree (status);


--
-- Name: Union_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Union_isActive_idx" ON public."Union" USING btree ("isActive");


--
-- Name: Union_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Union_slug_key" ON public."Union" USING btree (slug);


--
-- Name: Union_upazilaId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Union_upazilaId_idx" ON public."Union" USING btree ("upazilaId");


--
-- Name: Upazila_districtId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Upazila_districtId_idx" ON public."Upazila" USING btree ("districtId");


--
-- Name: Upazila_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Upazila_isActive_idx" ON public."Upazila" USING btree ("isActive");


--
-- Name: Upazila_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Upazila_slug_key" ON public."Upazila" USING btree (slug);


--
-- Name: UploadedFile_fileCategory_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UploadedFile_fileCategory_idx" ON public."UploadedFile" USING btree ("fileCategory");


--
-- Name: UploadedFile_ownerUserId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UploadedFile_ownerUserId_idx" ON public."UploadedFile" USING btree ("ownerUserId");


--
-- Name: UploadedFile_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UploadedFile_status_idx" ON public."UploadedFile" USING btree (status);


--
-- Name: UploadedFile_storageKey_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UploadedFile_storageKey_key" ON public."UploadedFile" USING btree ("storageKey");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_phone_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_phone_key" ON public."User" USING btree (phone);


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: User_role_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_role_status_idx" ON public."User" USING btree (role, status);


--
-- Name: User_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_status_idx" ON public."User" USING btree (status);


--
-- Name: Village_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Village_slug_key" ON public."Village" USING btree (slug);


--
-- Name: Village_unionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Village_unionId_idx" ON public."Village" USING btree ("unionId");


--
-- Name: AdminProfile AdminProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminProfile"
    ADD CONSTRAINT "AdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AiServiceRecord AiServiceRecord_aiServiceRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiServiceRecord"
    ADD CONSTRAINT "AiServiceRecord_aiServiceRequestId_fkey" FOREIGN KEY ("aiServiceRequestId") REFERENCES public."AiServiceRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AiServiceRecord AiServiceRecord_customerUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiServiceRecord"
    ADD CONSTRAINT "AiServiceRecord_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AiServiceRecord AiServiceRecord_technicianProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiServiceRecord"
    ADD CONSTRAINT "AiServiceRecord_technicianProfileId_fkey" FOREIGN KEY ("technicianProfileId") REFERENCES public."AiTechnicianProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AiServiceRequest AiServiceRequest_customerUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiServiceRequest"
    ADD CONSTRAINT "AiServiceRequest_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AiServiceRequest AiServiceRequest_linkedServiceRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiServiceRequest"
    ADD CONSTRAINT "AiServiceRequest_linkedServiceRequestId_fkey" FOREIGN KEY ("linkedServiceRequestId") REFERENCES public."ServiceRequest"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AiServiceRequest AiServiceRequest_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiServiceRequest"
    ADD CONSTRAINT "AiServiceRequest_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."AiTechnicianService"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AiServiceRequest AiServiceRequest_technicianProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiServiceRequest"
    ADD CONSTRAINT "AiServiceRequest_technicianProfileId_fkey" FOREIGN KEY ("technicianProfileId") REFERENCES public."AiTechnicianProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AiTechnicianComplaint AiTechnicianComplaint_aiServiceRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianComplaint"
    ADD CONSTRAINT "AiTechnicianComplaint_aiServiceRequestId_fkey" FOREIGN KEY ("aiServiceRequestId") REFERENCES public."AiServiceRequest"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AiTechnicianComplaint AiTechnicianComplaint_customerUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianComplaint"
    ADD CONSTRAINT "AiTechnicianComplaint_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AiTechnicianComplaint AiTechnicianComplaint_technicianProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianComplaint"
    ADD CONSTRAINT "AiTechnicianComplaint_technicianProfileId_fkey" FOREIGN KEY ("technicianProfileId") REFERENCES public."AiTechnicianProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AiTechnicianDivisionServiceArea AiTechnicianDivisionServiceArea_aiTechnicianId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianDivisionServiceArea"
    ADD CONSTRAINT "AiTechnicianDivisionServiceArea_aiTechnicianId_fkey" FOREIGN KEY ("aiTechnicianId") REFERENCES public."AiTechnicianProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AiTechnicianDivisionServiceArea AiTechnicianDivisionServiceArea_districtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianDivisionServiceArea"
    ADD CONSTRAINT "AiTechnicianDivisionServiceArea_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES public."District"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AiTechnicianDivisionServiceArea AiTechnicianDivisionServiceArea_unionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianDivisionServiceArea"
    ADD CONSTRAINT "AiTechnicianDivisionServiceArea_unionId_fkey" FOREIGN KEY ("unionId") REFERENCES public."Union"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AiTechnicianDivisionServiceArea AiTechnicianDivisionServiceArea_upazilaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianDivisionServiceArea"
    ADD CONSTRAINT "AiTechnicianDivisionServiceArea_upazilaId_fkey" FOREIGN KEY ("upazilaId") REFERENCES public."Upazila"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AiTechnicianDocument AiTechnicianDocument_aiTechnicianId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianDocument"
    ADD CONSTRAINT "AiTechnicianDocument_aiTechnicianId_fkey" FOREIGN KEY ("aiTechnicianId") REFERENCES public."AiTechnicianProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AiTechnicianDocument AiTechnicianDocument_uploadedFileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianDocument"
    ADD CONSTRAINT "AiTechnicianDocument_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES public."UploadedFile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AiTechnicianProfileArea AiTechnicianProfileArea_aiTechnicianId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianProfileArea"
    ADD CONSTRAINT "AiTechnicianProfileArea_aiTechnicianId_fkey" FOREIGN KEY ("aiTechnicianId") REFERENCES public."AiTechnicianProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AiTechnicianProfileArea AiTechnicianProfileArea_areaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianProfileArea"
    ADD CONSTRAINT "AiTechnicianProfileArea_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES public."Area"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AiTechnicianProfileServiceCategory AiTechnicianProfileServiceCategory_aiTechnicianId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianProfileServiceCategory"
    ADD CONSTRAINT "AiTechnicianProfileServiceCategory_aiTechnicianId_fkey" FOREIGN KEY ("aiTechnicianId") REFERENCES public."AiTechnicianProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AiTechnicianProfileServiceCategory AiTechnicianProfileServiceCategory_serviceCategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianProfileServiceCategory"
    ADD CONSTRAINT "AiTechnicianProfileServiceCategory_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES public."ServiceCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AiTechnicianProfile AiTechnicianProfile_districtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianProfile"
    ADD CONSTRAINT "AiTechnicianProfile_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES public."District"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AiTechnicianProfile AiTechnicianProfile_reviewedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianProfile"
    ADD CONSTRAINT "AiTechnicianProfile_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AiTechnicianProfile AiTechnicianProfile_unionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianProfile"
    ADD CONSTRAINT "AiTechnicianProfile_unionId_fkey" FOREIGN KEY ("unionId") REFERENCES public."Union"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AiTechnicianProfile AiTechnicianProfile_upazilaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianProfile"
    ADD CONSTRAINT "AiTechnicianProfile_upazilaId_fkey" FOREIGN KEY ("upazilaId") REFERENCES public."Upazila"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AiTechnicianProfile AiTechnicianProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianProfile"
    ADD CONSTRAINT "AiTechnicianProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AiTechnicianReview AiTechnicianReview_aiServiceRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianReview"
    ADD CONSTRAINT "AiTechnicianReview_aiServiceRequestId_fkey" FOREIGN KEY ("aiServiceRequestId") REFERENCES public."AiServiceRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AiTechnicianReview AiTechnicianReview_customerUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianReview"
    ADD CONSTRAINT "AiTechnicianReview_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AiTechnicianReview AiTechnicianReview_technicianProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianReview"
    ADD CONSTRAINT "AiTechnicianReview_technicianProfileId_fkey" FOREIGN KEY ("technicianProfileId") REFERENCES public."AiTechnicianProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AiTechnicianServiceArea AiTechnicianServiceArea_aiTechnicianId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianServiceArea"
    ADD CONSTRAINT "AiTechnicianServiceArea_aiTechnicianId_fkey" FOREIGN KEY ("aiTechnicianId") REFERENCES public."AiTechnicianProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AiTechnicianServiceArea AiTechnicianServiceArea_villageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianServiceArea"
    ADD CONSTRAINT "AiTechnicianServiceArea_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES public."Village"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AiTechnicianService AiTechnicianService_aiTechnicianId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AiTechnicianService"
    ADD CONSTRAINT "AiTechnicianService_aiTechnicianId_fkey" FOREIGN KEY ("aiTechnicianId") REFERENCES public."AiTechnicianProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AnimalProfile AnimalProfile_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AnimalProfile"
    ADD CONSTRAINT "AnimalProfile_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."CustomerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Area Area_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Area"
    ADD CONSTRAINT "Area_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Area"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BillingRecord BillingRecord_aiTechnicianId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BillingRecord"
    ADD CONSTRAINT "BillingRecord_aiTechnicianId_fkey" FOREIGN KEY ("aiTechnicianId") REFERENCES public."AiTechnicianProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: BillingRecord BillingRecord_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BillingRecord"
    ADD CONSTRAINT "BillingRecord_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."CustomerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BillingRecord BillingRecord_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BillingRecord"
    ADD CONSTRAINT "BillingRecord_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."DoctorProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: BillingRecord BillingRecord_serviceRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BillingRecord"
    ADD CONSTRAINT "BillingRecord_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES public."ServiceRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BillingRecord BillingRecord_treatmentCaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BillingRecord"
    ADD CONSTRAINT "BillingRecord_treatmentCaseId_fkey" FOREIGN KEY ("treatmentCaseId") REFERENCES public."TreatmentRecord"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Complaint Complaint_adminAssigneeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Complaint"
    ADD CONSTRAINT "Complaint_adminAssigneeId_fkey" FOREIGN KEY ("adminAssigneeId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Complaint Complaint_aiTechnicianId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Complaint"
    ADD CONSTRAINT "Complaint_aiTechnicianId_fkey" FOREIGN KEY ("aiTechnicianId") REFERENCES public."AiTechnicianProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Complaint Complaint_billingRecordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Complaint"
    ADD CONSTRAINT "Complaint_billingRecordId_fkey" FOREIGN KEY ("billingRecordId") REFERENCES public."BillingRecord"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Complaint Complaint_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Complaint"
    ADD CONSTRAINT "Complaint_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."CustomerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Complaint Complaint_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Complaint"
    ADD CONSTRAINT "Complaint_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."DoctorProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Complaint Complaint_serviceRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Complaint"
    ADD CONSTRAINT "Complaint_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES public."ServiceRequest"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ContentPost ContentPost_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContentPost"
    ADD CONSTRAINT "ContentPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ContentPost ContentPost_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContentPost"
    ADD CONSTRAINT "ContentPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."ContentCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CustomerProfile CustomerProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CustomerProfile"
    ADD CONSTRAINT "CustomerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: District District_divisionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."District"
    ADD CONSTRAINT "District_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES public."Division"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DoctorProfileArea DoctorProfileArea_areaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DoctorProfileArea"
    ADD CONSTRAINT "DoctorProfileArea_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES public."Area"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DoctorProfileArea DoctorProfileArea_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DoctorProfileArea"
    ADD CONSTRAINT "DoctorProfileArea_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."DoctorProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DoctorProfileServiceCategory DoctorProfileServiceCategory_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DoctorProfileServiceCategory"
    ADD CONSTRAINT "DoctorProfileServiceCategory_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."DoctorProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DoctorProfileServiceCategory DoctorProfileServiceCategory_serviceCategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DoctorProfileServiceCategory"
    ADD CONSTRAINT "DoctorProfileServiceCategory_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES public."ServiceCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DoctorProfile DoctorProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DoctorProfile"
    ADD CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DoctorServiceArea DoctorServiceArea_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DoctorServiceArea"
    ADD CONSTRAINT "DoctorServiceArea_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."DoctorProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DoctorServiceArea DoctorServiceArea_villageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DoctorServiceArea"
    ADD CONSTRAINT "DoctorServiceArea_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES public."Village"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PaymentRecord PaymentRecord_billingRecordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentRecord"
    ADD CONSTRAINT "PaymentRecord_billingRecordId_fkey" FOREIGN KEY ("billingRecordId") REFERENCES public."BillingRecord"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PaymentRecord PaymentRecord_serviceRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentRecord"
    ADD CONSTRAINT "PaymentRecord_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES public."ServiceRequest"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PrescriptionItem PrescriptionItem_prescriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PrescriptionItem"
    ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES public."Prescription"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Prescription Prescription_aiTechnicianId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_aiTechnicianId_fkey" FOREIGN KEY ("aiTechnicianId") REFERENCES public."AiTechnicianProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Prescription Prescription_animalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES public."AnimalProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Prescription Prescription_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."DoctorProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Prescription Prescription_serviceRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES public."ServiceRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_aiTechnicianId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_aiTechnicianId_fkey" FOREIGN KEY ("aiTechnicianId") REFERENCES public."AiTechnicianProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Review Review_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."CustomerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."DoctorProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Review Review_serviceRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES public."ServiceRequest"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ServiceRequest ServiceRequest_animalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceRequest"
    ADD CONSTRAINT "ServiceRequest_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES public."AnimalProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ServiceRequest ServiceRequest_areaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceRequest"
    ADD CONSTRAINT "ServiceRequest_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES public."Area"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ServiceRequest ServiceRequest_assignedAiTechnicianId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceRequest"
    ADD CONSTRAINT "ServiceRequest_assignedAiTechnicianId_fkey" FOREIGN KEY ("assignedAiTechnicianId") REFERENCES public."AiTechnicianProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ServiceRequest ServiceRequest_assignedDoctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceRequest"
    ADD CONSTRAINT "ServiceRequest_assignedDoctorId_fkey" FOREIGN KEY ("assignedDoctorId") REFERENCES public."DoctorProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ServiceRequest ServiceRequest_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceRequest"
    ADD CONSTRAINT "ServiceRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."CustomerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ServiceRequest ServiceRequest_serviceCategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceRequest"
    ADD CONSTRAINT "ServiceRequest_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES public."ServiceCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ServiceRequest ServiceRequest_villageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ServiceRequest"
    ADD CONSTRAINT "ServiceRequest_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES public."Village"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TreatmentRecord TreatmentRecord_aiTechnicianId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TreatmentRecord"
    ADD CONSTRAINT "TreatmentRecord_aiTechnicianId_fkey" FOREIGN KEY ("aiTechnicianId") REFERENCES public."AiTechnicianProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TreatmentRecord TreatmentRecord_animalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TreatmentRecord"
    ADD CONSTRAINT "TreatmentRecord_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES public."AnimalProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TreatmentRecord TreatmentRecord_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TreatmentRecord"
    ADD CONSTRAINT "TreatmentRecord_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."DoctorProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TreatmentRecord TreatmentRecord_serviceRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TreatmentRecord"
    ADD CONSTRAINT "TreatmentRecord_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES public."ServiceRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Union Union_upazilaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Union"
    ADD CONSTRAINT "Union_upazilaId_fkey" FOREIGN KEY ("upazilaId") REFERENCES public."Upazila"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Upazila Upazila_districtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Upazila"
    ADD CONSTRAINT "Upazila_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES public."District"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UploadedFile UploadedFile_ownerUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UploadedFile"
    ADD CONSTRAINT "UploadedFile_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Village Village_unionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Village"
    ADD CONSTRAINT "Village_unionId_fkey" FOREIGN KEY ("unionId") REFERENCES public."Union"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict ZwLk74JSJykHovdBAiRIcOGkaOyHVyHTfrixLsrkz6sTkTEtpp5tctJ6ZTVSo3R

