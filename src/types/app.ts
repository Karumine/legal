// --- Types & Interfaces ---

export type CompanyMode = 'agileOnly' | 'agileTK';
export type ContractType = 'hirePurchase' | 'hirePurchaseBack' | 'loan' | 'od';

import type { ContractItem } from './contract';


export interface CompanyInfo {
  companyName: string;
  directors: string;
  address: string;
  postalCode?: string;
  taxId: string;
  phone: string;
  email?: string;
  contactPerson?: string;
  entityType?: 'company' | 'partnership';
}

export interface AssetDetail {
  id: string;
  name: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  totalAmount: string;
}

export interface LessorInfo {
  name: string;
  taxId: string;
  address: string;
  postalCode?: string;
  proportion: string;
}

export interface LandCollateral {
  deedNo: string;
  volume: string;
  page: string;
  mapSheet: string;
  landNo: string;
  surveyNo: string;
  subDistrict: string;
  district: string;
  province: string;
  owner: string;
  landType?: 'empty' | 'building';
}

export interface MachineDetail {
  id: string;
  name: string;
  quantity: string;
  price: string;
}

export interface CollateralAsset {
  type: 'land' | 'cash' | 'machinery' | 'carPledge' | 'stockPledge';
  landDetails?: LandCollateral;
  cashAmount?: string;
  machineName?: string;
  machineModel?: string;
  machineQuantity?: string;
  machineUnit?: string;
  machinePrice?: string;
  machineOwner?: string;
  carPledgeDetails?: {
    brand: string;
    model: string;
    plateNo: string;
    province: string;
    chassisNo: string;
    engineNo: string;
    color: string;
    owner: string;
  };
  stockPledgeDetails?: {
    companyName: string;
    certificateNo: string;
    quantity: string;
    parValue: string;
    totalValue: string;
    owner: string;
  };
}

export interface HirePurchaseData {
  contractNo: string;
  contractDate: string;
  madeAt: string;

  // Parties
  lessor1: LessorInfo;
  lessor2: LessorInfo;

  assets: AssetDetail[];

  totalAmount: string;
  downPaymentPercentage: string;
  downPayment: string;
  customGreenText: string;
  hasCustomGreenText?: boolean;

  remainingAmount: string;
  installments: string;
  installmentAmount: string;
  interestType: 'แบบคงที่' | 'แบบลดต้นลดดอก';
  interestRate: string;

  firstInstallmentDate: string;
  paymentDay: string;
  lastInstallmentDate: string;
  stampDuty: string;

  insurancePremium: string;
  chequesPerInstallment: string;
  clause4_2Text: string;
  collateralValue: string;
  hpGuarantors: string[];
  collateralAssets: CollateralAsset[];

  // Signatories
  lessor1Signatories: string;
  lessor2Signatories: string;
  lesseeSignatories: string;
  witnesses: string;
  installationLocation: string;
  businessPurpose: string;
  hasBuyback?: boolean;
  buybacks?: BuybackData[];
}

export interface BuybackTableEntry {
  year: number;
  newRate: string;
  usedRate: string;
}

export interface BuybackData {
  id: string;
  contractNo: string;
  contractDate: string;
  conditions: string;
  vendorName: string;
  vendorDirectors: string;
  vendorAddress: string;
  vendorPostalCode?: string;
  vendorTaxId: string;
  selectedAssetIds: string[];
  downPercentage: string;
  buybackMode: 'newOnly' | 'usedOnly' | 'all';
  buybackTable: BuybackTableEntry[];
  vendorType?: 'person' | 'company' | 'partnership' | 'shop';
}

export interface JointVentureData {
  contractNo: string;
  contractDate: string;
  selectedAgreementIds: string[];
  proportion1: number;
  proportion2: number;
}

export interface CreditFacilityData {
  contractNo: string;
  contractDate: string;
  madeAt: string;
  effectiveDate: string;

  // Lenders (Credit Providers)
  lender1: LessorInfo;
  lender2: LessorInfo;

  // Borrower is customerInfo from AppData

  // Terms
  loanAmount: string;
  installments: string;
  installmentAmount: string;
  interestRate: string;
  interestType: 'แบบคงที่' | 'แบบลดต้นลดดอก';
  businessPurpose: string;
  firstInstallmentDate: string;
  paymentDay: string;
  lastInstallmentDate: string;

  // Collateral
  collateralAssets: CollateralAsset[];
  collateralValue: string;

  stampDuty: string;

  // Signatories
  lender1Signatories: string;
  lender2Signatories: string;
  borrowerSignatories: string;

  // Added dynamic conditions for 3.2
  conditions32?: string[];

  // Bank Account Info (for Annex 7)
  bankAccountName?: string;
  bankAccountType?: string;
  bankAccountBranch?: string;
  bankAccountNumber?: string;
  bankAccountChangeDate?: string;
  showAnnex7?: boolean;
}

export interface ODData {
  contractNo: string;
  contractDate: string;
  madeAt: string;
  effectiveDate: string;

  // Lenders
  lender1: LessorInfo;
  lender2: LessorInfo;

  // Borrower is customerInfo from AppData

  // Terms
  loanAmount: string;
  interestRate: string;
  interestType: 'แบบคงที่' | 'แบบลดต้นลดดอก';
  businessPurpose: string;

  // Add these for parity with CF form
  installments: string;
  installmentAmount: string;
  firstInstallmentDate: string;
  paymentDay: string;
  lastInstallmentDate: string;

  // Collateral
  collateralAssets: CollateralAsset[];
  collateralValue: string;

  stampDuty: string;

  // Signatories
  lender1Signatories: string;
  lender2Signatories: string;
  borrowerSignatories: string;

  // Dynamic conditions (same as CF for consistency)
  conditions32?: string[];
  // Dynamic conditions for section 3.3 (additional conditions before drawdown)
  conditions33?: string[];

  // Annex 4: Payment Change Letter details
  annex4PONo?: string;
  annex4PODate?: string;
  annex4BillNo?: string;
  annex4BillDate?: string;
  annex4ReturnDate?: string;

  // Bank Account Info (Clause 3.2 (ค) (1))
  bankAccountBank?: string;
  bankAccountName?: string;
  bankAccountType?: string;
  bankAccountBranch?: string;
  bankAccountNumber?: string;
  bankAccountRepresentative?: string;
}

export interface ServiceAgreementData {
  contractNo: string;
  contractDate: string;
  selectedAgreementIds: string[];
  originationFeeTotal: string;
  serviceFeeTotal: string;
  firstInstallmentDate: string;
  lastInstallmentDate: string;
  agreementFirstDates?: Record<string, string>;
  agreementInstallmentAmounts?: Record<string, string>;
  agreementOriginationFeePeriods?: Record<string, number>;
  agreementServiceFeeFirstDates?: Record<string, string>;
  agreementServiceFeeAmounts?: Record<string, string>;
  agreementServiceFeePeriods?: Record<string, number>;
  serviceFeeRate: string;
  originationFeeRate: string;
}

export interface FeePaymentData {
  contractNo: string;
  effectiveDate: string;
  items: ContractItem[];
}

export interface GuarantorData {
  id: string;
  contractNo: string;
  contractDate: string;
  guarantorName: string;
  guarantorIdCard: string;
  guarantorAddress: string;
  guarantorPostalCode?: string;
  isMarried: boolean;
  spouseName: string;
  spouseIdCard: string;
  spouseAddress: string;
  spousePostalCode?: string;
  phone?: string;
  directors?: string;
  selectedAgreementIds?: string[];
  guarantorType?: 'person' | 'company' | 'partnership';
  nationality?: 'thai' | 'foreigner';
  spouseNationality?: 'thai' | 'foreigner';
}

export interface Agreement {
  id: string;
  type: ContractType;
  data: HirePurchaseData | CreditFacilityData | ODData | any;
}

export interface GuaranteeAgreementData {
  id: string;
  guarantors: GuarantorData[];
}

export interface AppData {
  companyMode: CompanyMode;
  agileInfo: CompanyInfo;
  tkInfo: CompanyInfo;
  customerInfo: CompanyInfo;
  agreements: Agreement[];
  activeAgreementId: string | null;
  guarantors: GuarantorData[]; // legacy, keeping for backward compatibility
  guaranteeAgreements?: GuaranteeAgreementData[];
  jointVentureData: JointVentureData;
  serviceAgreementData: ServiceAgreementData;
  feePaymentData: FeePaymentData;
}

// --- Constants & Initial Data ---

export const TODAY = new Date().toISOString().split('T')[0];

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  hirePurchase: 'สัญญาเช่าซื้อ',
  hirePurchaseBack: 'สัญญาเช่าซื้อกลับ',
  loan: 'สัญญาให้สินเชื่อ',
  od: 'สัญญาให้สินเชื่อหมุนเวียน แบบมีเงื่อนไข',
};

export const initialAppData: AppData = {
  companyMode: 'agileTK',

  agileInfo: {
    companyName: 'บริษัท อาไจล์ แอสเซ็ทส์ จำกัด',
    directors: 'นายพรรษา เริงพิทยา และ นายกอบพงษ์ ตรีสุขี',
    address: 'เลขที่ 20 หมู่ 1 ถนนสุขุมวิท ตำบลบางเมืองใหม่ อำเภอเมืองสมุทรปราการ จังหวัดสมุทรปราการ 10270',
    postalCode: '10270',
    taxId: '0115558012195',
    phone: '02-000-9392',
    email: 'kiattikhun@agileassets.co.th',
    contactPerson: 'คุณเกียรติคุณ สนร้อย',
    entityType: 'company',
  },

  tkInfo: {
    companyName: 'บริษัท ฐิติกร จำกัด (มหาชน)',
    directors: 'นางสาวปฐมา พรประภา และ นายประพล พรประภา',
    address: '69 ถนนรามคำแหง แขวงหัวหมาก เขตบางกะปิ กรุงเทพมหานคร 10240',
    postalCode: '10240',
    taxId: '0107546000130',
    phone: '02-310-7000',
    email: 'prapol@tk.co.th',
    contactPerson: 'นายประพล พรประภา',
    entityType: 'company',
  },

  customerInfo: {
    companyName: 'บริษัท นันทวรรณ กรีนดริ้งค์ จำกัด',
    directors: 'นางสาวรัตนา หมู่ทอง',
    address: 'เลขที่ 39 หมู่ที่ 4 ตำบลวังจุฬา อำเภอวังน้อย จังหวัดพระนครศรีอยุธยา 13170',
    postalCode: '13170',
    taxId: '0145561001530',
    phone: '',
    entityType: 'company',
  },

  agreements: [
    {
      id: 'initial-hp',
      type: 'hirePurchase',
      data: {
        contractNo: '',
        contractDate: TODAY,
        madeAt: 'บริษัท อาไจล์ แอสเซ็ทส์ จำกัด',
        lessor1: {
          name: 'บริษัท อาไจล์ แอสเซ็ทส์ จำกัด',
          taxId: '0115558012195',
          address: '20 หมู่ 1 ถนนสุขุมวิท ตำบลบางเมืองใหม่ อำเภอเมืองสมุทรปราการ จังหวัดสมุทรปราการ 10270',
          postalCode: '10270',
          proportion: '20',
        },
        lessor2: {
          name: 'บริษัท ฐิติกร จำกัด (มหาชน)',
          taxId: '0107546000130',
          address: '69 ถนนรามคำแหง แขวงหัวหมาก เขตบางกะปิ กรุงเทพมหานคร 10240',
          postalCode: '10240',
          proportion: '80',
        },
        assets: [],
        totalAmount: '',
        downPaymentPercentage: '',
        downPayment: '',
        customGreenText: '',
        hasCustomGreenText: false,
        remainingAmount: '',
        installments: '',
        installmentAmount: '',
        interestType: 'แบบคงที่',
        interestRate: '',
        firstInstallmentDate: '',
        paymentDay: '',
        lastInstallmentDate: '',
        stampDuty: '',
        insurancePremium: '',
        chequesPerInstallment: '',
        clause4_2Text: 'ในกรณีที่คู่สัญญาฝ่ายใดฝ่ายหนึ่งมีความประสงค์จะเปลี่ยนแปลงวิธีการชำระตามที่ระบุในข้อ 4.1 ของสัญญาฉบับนี้เป็นรูปแบบอื่น คู่สัญญาทั้งสามฝ่ายจะต้องตกลงกันเป็นลายลักษณ์อักษร',
        lessor1Signatories: 'นายพรรษา เริงพิทยา และ นายกอบพงษ์ ตรีสุขี',
        lessor2Signatories: 'นางสาวปฐมา พรประภา และ นายประพล พรประภา',
        lesseeSignatories: 'นางสาวรัตนา หมู่ทอง',
        witnesses: '',
        businessPurpose: '',
        installationLocation: '',
        collateralValue: '',
        hpGuarantors: [],
        collateralAssets: []
      }
    }
  ],
  activeAgreementId: 'initial-hp',

  guarantors: [],
  guaranteeAgreements: [],

  jointVentureData: {
    contractNo: '',
    contractDate: '2026-03-20',
    selectedAgreementIds: ['initial-hp'],
    proportion1: 20,
    proportion2: 80,
  },
  serviceAgreementData: {
    contractNo: '',
    contractDate: TODAY,
    selectedAgreementIds: ['initial-hp'],
    originationFeeTotal: '0',
    serviceFeeTotal: '0',
    firstInstallmentDate: '2026-04-28',
    lastInstallmentDate: '2030-06-28',
    agreementFirstDates: { 'initial-hp': '2026-07-28' },
    agreementInstallmentAmounts: { 'initial-hp': '70,480.04' },
    agreementOriginationFeePeriods: { 'initial-hp': 0 },
    agreementServiceFeeFirstDates: { 'initial-hp': '2026-07-28' },
    agreementServiceFeeAmounts: { 'initial-hp': '14,096.01' },
    agreementServiceFeePeriods: { 'initial-hp': 0 },
    serviceFeeRate: '0.90',
    originationFeeRate: '2.25'
  },
  feePaymentData: { contractNo: '', effectiveDate: TODAY, items: [] },
};