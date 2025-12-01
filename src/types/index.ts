export type UserRole = "supervisor" | "admin" | "trader" | "client";

export interface UserProfile {
    uid: string;
    email: string;
    role: UserRole;
    createdAt: any; // Firestore Timestamp
}

export type ProductType = "BASE" | "PEAK";
export type VolumeUnit = "MW" | "%";
export type MandateStatus = "PENDING" | "REALIZED" | "FAILED";

export interface Mandate {
    id: string;
    clientId: string;
    clientEmail: string;
    product: ProductType;
    price: number;
    volume: number;
    volumeUnit: VolumeUnit;
    duration: string;
    status: MandateStatus;
    createdAt: any; // Firestore Timestamp
}
