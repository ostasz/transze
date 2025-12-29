export type UserRole = "supervisor" | "admin" | "trader" | "client";

export interface ClientConfig {
    allowedProducts: ProductType[];
    allowedVolumeUnits: VolumeUnit[];
    minVolume: number;
    maxVolume: number;
    allowedDurations: DurationType[];
    validityStart: string; // ISO date string or Firestore Timestamp
    validityEnd: string; // ISO date string or Firestore Timestamp
}

export interface CompanyDetails {
    companyName: string;
    contractNumber: string;
    nip: string;
    address: string;
    postalCode: string;
    city: string;
    phoneNumber?: string;
}

export interface UserProfile {
    uid: string;
    email: string;
    role: UserRole;
    name?: string;
    companyDetails?: CompanyDetails;
    clientConfig?: ClientConfig;
    createdAt: any; // Firestore Timestamp
}

export type ProductType = "BASE" | "PEAK";
export type VolumeUnit = "MW" | "%";
export type DurationType = "MONTHLY" | "QUARTERLY" | "YEARLY";
export type MandateStatus = "NEW" | "PENDING" | "REALIZED" | "FAILED";

export interface Mandate {
    id: string;
    clientId: string;
    clientEmail: string;
    product: ProductType;
    price: number;
    volume: number;
    volumeUnit: VolumeUnit;
    duration: string;
    validUntil: string; // ISO date string
    status: MandateStatus;
    createdAt: any; // Firestore Timestamp
}
