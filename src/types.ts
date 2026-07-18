export type UserRole = 'creator' | 'admin';

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  socials?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
}

export interface Link {
  id: string;
  userId: string;
  originalUrl: string;
  trackedUrl: string;
  shortCode: string;
  shortUrl: string;
  customAlias?: string;
  title: string;
  createdAt: string;
  isPasswordProtected: boolean;
  password?: string;
  expiresAt?: string; // ISO String
  totalClicks: number;
}

export interface Click {
  id: string;
  linkId: string;
  shortCode: string;
  timestamp: string;
  ip: string;
  geo: {
    country: string;
    region: string;
    city: string;
  };
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  referrer: string;
}

export type CommissionStatus = 'pending' | 'confirmed' | 'paid';

export interface Order {
  id: string;
  orderId: string;
  originalUrl: string;
  shortCode: string;
  affiliateTrackingId: string;
  subtotal: number;
  commissionAmount: number;
  status: CommissionStatus;
  createdAt: string;
  userId: string;
  confirmedAt?: string;
  paidAt?: string;
}

export type PayoutMethod = 'easypaisa' | 'jazzcash' | 'bank';
export type PayoutStatus = 'pending' | 'approved' | 'rejected';

export interface PayoutRequest {
  id: string;
  userId: string;
  method: PayoutMethod;
  details: {
    accountName: string;
    accountNumber: string;
    bankName?: string;
  };
  amount: number;
  status: PayoutStatus;
  createdAt: string;
  processedAt?: string;
  notes?: string;
}

export interface Wallet {
  userId: string;
  availableBalance: number; // approved/confirmed and ready but not withdrawn yet
  pendingBalance: number; // pending commissions
  withdrawableBalance: number; // ready to withdraw (confirmed commissions)
  lifetimeEarnings: number; // total confirmed + paid commissions ever
}

export type NotificationType =
  | 'click'
  | 'order'
  | 'commission_confirmed'
  | 'commission_paid'
  | 'payout_approved'
  | 'payout_rejected'
  | 'announcement';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface AffiliateSettings {
  trackingId: string;
  defaultCommissionRate: number; // e.g. 0.10
  confirmedCommissionRate: number; // e.g. 0.15
}

export interface AffiliateProgram {
  programId: string;
  programName: string;
  marketplace: string;
  affiliateNetwork: string;
  logo: string;
  status: 'active' | 'inactive';
  platformSharePercentage: number;
  creatorSharePercentage: number;
  commissionType: 'category based' | 'dynamic' | 'fixed';
  createdAt: string;
  updatedAt: string;
}

export interface CommissionRule {
  id: string;
  programId: string;
  categoryName: string;
  commissionRate: number; // in percentage, e.g., 10 for 10%
  platformShare: number; // in percentage, e.g., 60 for 60% of affiliate commission
  creatorShare: number;  // in percentage, e.g., 40 for 40% of affiliate commission
  status: 'active' | 'inactive';
}

export interface EarningsLedger {
  id: string;
  userId: string;
  programId: string;
  marketplace: string;
  orderId: string;
  productName: string;
  saleAmount: number;
  affiliateCommission: number;
  ipflackEarning: number;
  creatorEarning: number;
  status: 'Pending' | 'Confirmed' | 'Paid' | 'Reversed';
  createdAt: string;
}

