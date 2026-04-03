// --- Types & Interfaces ---

export type CompanyMode = 'agileOnly' | 'agileTK';
export type ContractType = 'hirePurchase' | 'hirePurchaseBack' | 'loan' | 'od';

import type { ContractItem } from './contract';


export interface CompanyInfo {
  companyName: string;
  directors: string;
  address: string;
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
  vendorTaxId: string;
  selectedAssetIds: string[];
  downPercentage: string;
  buybackTable: BuybackTableEntry[];
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
  isMarried: boolean;
  spouseName: string;
  spouseIdCard: string;
  spouseAddress: string;
  phone?: string;
  directors?: string;
  selectedAgreementIds?: string[];
}

export interface Agreement {
  id: string;
  type: ContractType;
  data: HirePurchaseData | any;
}

export interface AppData {
  companyMode: CompanyMode;
  agileInfo: CompanyInfo;
  tkInfo: CompanyInfo;
  customerInfo: CompanyInfo;
  agreements: Agreement[];
  activeAgreementId: string | null;
  guarantors: GuarantorData[];
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
  od: 'OD',
};

export const initialAppData: AppData = {
  companyMode: 'agileTK',

  agileInfo: {
    companyName: 'บริษัท อาไจล์ แอสเซ็ทส์ จำกัด',
    directors: 'นายพรรษา เริงพิทยา และ นายกอบพงษ์ ตรีสุขี',
    address: 'เลขที่ 20 หมู่ 1 ถนนสุขุมวิท ตำบลบางเมืองใหม่ อำเภอเมืองสมุทรปราการ จังหวัดสมุทรปราการ',
    taxId: '0115558012195',
    phone: '02-xxx-xxxx',
    entityType: 'company',
  },

  tkInfo: {
    companyName: 'บริษัท ฐิติกร จำกัด (มหาชน)',
    directors: 'นางสาวปัทมา พรประภา และ นายประพล พรประภา',
    address: '69 ถนนรามคำแหง แขวงหัวหมาก เขตบางกะปิ กรุงเทพมหานคร',
    taxId: '0107546000130',
    phone: '02-310-7000',
    entityType: 'company',
  },

  customerInfo: {
    companyName: 'บริษัท นันทวรรณ กรีนดริ้งค์ จำกัด',
    directors: 'นางสาวรัตนา หมู่ทอง',
    address: 'เลขที่ 39 หมู่ที่ 4 ตำบลวังจุฬา อำเภอวังน้อย จังหวัดพระนครศรีอยุธยา',
    taxId: '0145561001530',
    phone: '',
    entityType: 'company',
  },

  agreements: [
    {
      id: 'initial-hp',
      type: 'hirePurchase',
      data: {
        contractNo: 'AGA/81-LA2026',
        contractDate: TODAY,
        madeAt: 'บริษัท อาไจล์ แอสเซ็ทส์ จำกัด',
        lessor1: {
          name: 'บริษัท อาไจล์ แอสเซ็ทส์ จำกัด',
          taxId: '0115558012195',
          address: '20 หมู่ 1 ถนนสุขุมวิท ตำบลบางเมืองใหม่ อำเภอเมืองสมุทรปราการ จังหวัดสมุทรปราการ',
          proportion: '20',
        },
        lessor2: {
          name: 'บริษัท ฐิติกร จำกัด (มหาชน)',
          taxId: '0107546000130',
          address: '69 ถนนรามคำแหง แขวงหัวหมาก เขตบางกะปิ กรุงเทพมหานคร',
          proportion: '80',
        },
        assets: [
          { id: 'asset-1', name: 'เครื่องเป่าขวดพลาสติก PET Auto 6 cav.', description: '"F6MV" พร้อมแม่พิมพ์ 1 ชุด', quantity: '1', unit: 'ชุด', unitPrice: '4,119,500', totalAmount: '4,119,500' },
          { id: 'asset-2', name: 'เครื่องบรรจุน้ำ XGF 40-40-12', description: '(Air conveyor, Outlet conveyor, Online cap sterilization, Lamp Checker, Cap loader) พร้อมอุปกรณ์ครบชุด', quantity: '1', unit: 'ชุด', unitPrice: '3,905,500', totalAmount: '3,905,500' }
        ],
        totalAmount: '8,025,000',
        downPaymentPercentage: '20',
        downPayment: '1,605,000', // แก้ไขให้สัมพันธ์กับ 20% ของ 8,025,000
        customGreenText: 'ทั้งนี้ ผู้ให้เช่าซื้อทุกฝ่ายจะชำระเงินค่าเครื่องจักรส่วนที่เหลือ (ที่หักด้วยเงินดาวน์) ให้แก่ผู้ค้าโดยตรงตามสัดส่วนในข้อ 1 โดยตกลงให้ชำระงวดแรกภายในเดือนมิถุนายน 2569 และจะชำระงวดต่อไปตามเงื่อนไขที่ผู้ค้าได้ตกลงไว้กับผู้ให้เช่าซื้อ และตกลงจะชำระค่าเครื่องจักรที่เหลือทั้งหมดต่อเมื่อผู้เช่าซื้อได้รับเครื่องจักร ติดตั้ง ทดสอบ ใช้งานได้โดยสมบูรณ์แล้วเท่านั้น',
        hasCustomGreenText: true,
        remainingAmount: '6,420,000', // ยอดจัดคงเหลือหลังหักดาวน์
        installments: '48',
        installmentAmount: '166,660.00', // ตัวอย่างยอดผ่อนต่อเดือน
        interestType: 'แบบคงที่',
        interestRate: '9',
        firstInstallmentDate: '2026-07-25',
        paymentDay: '25',
        lastInstallmentDate: '2030-06-25',
        stampDuty: '3,210',
        insurancePremium: '93,040.47',
        chequesPerInstallment: '2',
        clause4_2Text: 'ในกรณีที่คู่สัญญาฝ่ายใดฝ่ายหนึ่งมีความประสงค์จะเปลี่ยนแปลงวิธีการชำระตามที่ระบุในข้อ 4.1 ของสัญญาฉบับนี้เป็นรูปแบบอื่น คู่สัญญาทั้งสามฝ่ายจะต้องตกลงกันเป็นลายลักษณ์อักษร',
        lessor1Signatories: 'นายพรรษา เริงพิทยา และ นายกอบพงษ์ ตรีสุขี',
        lessor2Signatories: 'นางสาวปัทมา พรประภา และ นายประพล พรประภา',
        lesseeSignatories: 'นางสาวรัตนา หมู่ทอง',
        witnesses: '',
        businessPurpose: 'โรงงานผลิตและจำหน่ายน้ำดื่มและรับจ้างผลิตน้ำดื่มในแบรนด์ของลูกค้าของผู้เช่าซื้อ',
        installationLocation: '39 หมู่ 4 ตำบลวังจุฬา อำเภอวังน้อย จังหวัดพระนครศรีอยุธยา',
        collateralValue: '19,641,298',
        hpGuarantors: ['นางสาวรัตนา หมู่ทอง', 'นายทวีป คล้ายสุบรรณ์'],
        collateralAssets: [
          {
            type: 'land',
            landDetails: {
              deedNo: '4541', volume: '46', page: '41', mapSheet: '5142 III 7230',
              landNo: '261', surveyNo: '1878', subDistrict: 'บ้านน้อยซุ้มขี้เหล็ก',
              district: 'เนินมะปราง', province: 'พิษณุโลก', owner: 'นายทวีป คล้ายสุบรรณ์'
            }
          },
          {
            type: 'land',
            landDetails: {
              deedNo: '6054', volume: '61', page: '54', mapSheet: '5142 III 7230',
              landNo: '264', surveyNo: '1427', subDistrict: 'บ้านน้อยซุ้มขี้เหล็ก',
              district: 'เนินมะปราง', province: 'พิษณุโลก', owner: 'นายทวีป คล้ายสุบรรณ์'
            }
          }
        ]
      }
    }
  ],
  activeAgreementId: 'initial-hp',

  guarantors: [
    {
      id: '1',
      contractNo: 'AGA/81-LA2026-G1',
      contractDate: TODAY,
      guarantorName: 'นายทวีป คล้ายสุบรรณ์',
      guarantorIdCard: 'x-xxxx-xxxxx-xx-x',
      guarantorAddress: '...',
      isMarried: false,
      spouseName: '',
      spouseIdCard: '',
      spouseAddress: '',
      phone: '',
      selectedAgreementIds: ['initial-hp'],
    },
  ],

  jointVentureData: {
    contractNo: 'AGA/08-CON032026',
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