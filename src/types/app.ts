export type CompanyMode = 'agileOnly' | 'agileTK';
export type ContractType = 'hirePurchase' | 'hirePurchaseBack' | 'loan' | 'od';
import type { ContractItem } from './contract';

export interface CompanyInfo {
  companyName: string;
  directors: string;
  address: string;
  taxId: string;
  phone: string;
}

export interface HirePurchaseData {
  contractNo: string;
  contractDate: string;
  assetDescription: string;
  totalAmount: string;
  downPayment: string;
  remainingAmount: string;
  installments: string;
  installmentAmount: string;
  interestRate: string;
  penaltyRate: string;
}

export interface BuybackData {
  contractNo: string;
  contractDate: string;
  buybackPrice: string;
  buybackDate: string;
  conditions: string;
}

export interface JointVentureData {
  contractNo: string;
  contractDate: string;
}

export interface ServiceAgreementData {
  contractNo: string;
  contractDate: string;
}

export interface FeePaymentData {
  contractNo: string;
  effectiveDate: string;
  items: ContractItem[];
}

export interface GuarantorData {
  id: string;
  guarantorName: string;
  guarantorIdCard: string;
  guarantorAddress: string;
  isMarried: boolean;
  spouseName: string;
  spouseIdCard: string;
  spouseAddress: string;
}

export interface AppData {
  companyMode: CompanyMode;
  
  // Company Info
  agileInfo: CompanyInfo;
  customerInfo: CompanyInfo;

  // Main Contract
  contractType: ContractType;
  hirePurchaseData: HirePurchaseData;

  // Buyback
  hasBuyback: boolean;
  buybackData: BuybackData;

  // Guarantors
  guarantors: GuarantorData[];

  // Additional Contracts (after guarantor)
  jointVentureData: JointVentureData;
  serviceAgreementData: ServiceAgreementData;
  feePaymentData: FeePaymentData;
}

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  hirePurchase: 'สัญญาเช่าซื้อ',
  hirePurchaseBack: 'สัญญาเช่าซื้อกลับ',
  loan: 'สัญญากู้ยืม',
  od: 'OD',
};

export const initialAppData: AppData = {
  companyMode: 'agileTK',

  agileInfo: {
    companyName: 'บริษัท อาไจล์ แอสเซ็ทส์ จำกัด',
    directors: 'นายพรรษา เริงพิทยา และ นายกอบพงษ์ ตรีสุขี',
    address: 'เลขที่ 20 หมู่ 1 ถนนสุขุมวิท ตำบลบางเมืองใหม่ อำเภอเมืองสมุทรปราการ จังหวัดสมุทรปราการ',
    taxId: '0115558012195',
    phone: '098-283-7700',
  },

  customerInfo: {
    companyName: '',
    directors: '',
    address: '',
    taxId: '',
    phone: '',
  },

  contractType: 'hirePurchase',

  hirePurchaseData: {
    contractNo: '',
    contractDate: '',
    assetDescription: '',
    totalAmount: '',
    downPayment: '',
    remainingAmount: '',
    installments: '',
    installmentAmount: '',
    interestRate: '',
    penaltyRate: '',
  },

  hasBuyback: false,
  buybackData: {
    contractNo: '',
    contractDate: '',
    buybackPrice: '',
    buybackDate: '',
    conditions: '',
  },

  guarantors: [
    {
      id: '1',
      guarantorName: '',
      guarantorIdCard: '',
      guarantorAddress: '',
      isMarried: false,
      spouseName: '',
      spouseIdCard: '',
      spouseAddress: '',
    },
  ],

  // Additional contracts (after guarantor)
  jointVentureData: {
    contractNo: '',
    contractDate: '',
  },

  serviceAgreementData: {
    contractNo: '',
    contractDate: '',
  },

  feePaymentData: {
    contractNo: '',
    effectiveDate: '',
    items: [],
  },
};

