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

export interface AssetDetail {
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

export interface CollateralAsset {
  type: 'land' | 'cash' | 'machinery';
  landDetails?: LandCollateral;
  cashAmount?: string;
  machineryDetails?: string;
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
  businessPurpose: string;
  installationLocation: string;
}

export interface BuybackTableEntry {
  year: number;
  newRate: string;
  usedRate: string;
}

export interface BuybackData {
  contractNo: string;
  contractDate: string;
  buybackPrice: string;
  buybackDate: string;
  conditions: string;
  vendorName: string;
  vendorDirectors: string;
  vendorAddress: string;
  vendorTaxId: string;
  buybackTable: BuybackTableEntry[];
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
  tkInfo: CompanyInfo;
  customerInfo: CompanyInfo;

  // Main Contract
  contractType: ContractType;
  hirePurchaseData: HirePurchaseData;

  // Buyback
  hasBuyback: boolean;
  buybackData: BuybackData[];

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

  tkInfo: {
    companyName: 'บริษัท ฐิติกร จำกัด (มหาชน)',
    directors: 'นางสาวปฐมา พรประภา และ นายประพล พรประภา',
    address: 'เลขที่ 69 ถนนรามคำแหง แขวงหัวหมาก เขตบางกะปิ กรุงเทพมหานคร',
    taxId: '0107546000130',
    phone: '02-310-7000',
  },

  customerInfo: {
    companyName: 'บริษัท นันทะวรรณ กรีนดริ้งค์ จำกัด',
    directors: 'นางสาวรัตนา หมู่ทอง',
    address: 'เลขที่ 39 หมู่ที่ 4 ตำบลวังจุฬา อำเภอวังน้อย จังหวัดพระนครศรีอยุธยา',
    taxId: '0145561001530',
    phone: '',
  },

  contractType: 'hirePurchase',

  hirePurchaseData: {
    contractNo: 'AGA/81-LA2026',
    contractDate: '24 มีนาคม 2569',
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
      { name: 'เครื่องเป่าขวดพลาสติก PET Auto 6 cav.', description: '"F6MV" พร้อมแม่พิมพ์ 1 ชุด', quantity: '1', unit: 'ชุด', unitPrice: '4,119,500', totalAmount: '4,119,500' },
      { name: 'เครื่องบรรจุน้ำ XGF 40-40-12', description: '(Air conveyor, Outlet conveyor, Online cap sterilization, Lamp Checker, Cap loader) พร้อมอุปกรณ์ครบชุด', quantity: '1', unit: 'ชุด', unitPrice: '3,905,500', totalAmount: '3,905,500' }
    ],
    totalAmount: '8,025,000',
    downPaymentPercentage: '20',
    downPayment: '5,873,337',
    customGreenText: 'ทั้งนี้ ผู้ให้เช่าซื้อทุกฝ่ายจะชำระเงินค่าเครื่องจักรส่วนที่เหลือ (ที่หักด้วยเงินดาวน์) ให้แก่ผู้ค้าโดยตรงตามสัดส่วนในข้อ 1 โดยตกลงให้ชำระงวดแรกภายในเดือนมิถุนายน 2569 และจะชำระงวดต่อไปตามเงื่อนไขที่ผู้ค้าได้ตกลงไว้กับผู้ให้เช่าซื้อ และตกลงจะชำระค่าเครื่องจักรที่เหลือทั้งหมดต่อเมื่อผู้เช่าซื้อได้รับเครื่องจักร ติดตั้ง ทดสอบ ใช้งานได้โดยสมบูรณ์แล้วเท่านั้น',
    hasCustomGreenText: true,
    remainingAmount: '23,493,348',
    installments: '48',
    installmentAmount: '665,644.86',
    interestType: 'แบบคงที่',
    interestRate: '9',
    firstInstallmentDate: '2026-07-25',
    paymentDay: '25',
    lastInstallmentDate: '2030-06-25',
    stampDuty: '29,871',
    insurancePremium: '93,040.47',
    chequesPerInstallment: '2',
    clause4_2Text: 'ในกรณีที่คู่สัญญาฝ่ายใดฝ่ายหนึ่งมีความประสงค์จะเปลี่ยนแปลงวิธีการชำระตามที่ระบุในข้อ 4.1 ของสัญญาฉบับนี้เป็นรูปแบบอื่น คู่สัญญาทั้งสามฝ่ายจะต้องตกลงกันเป็นลายลักษณ์อักษร',

    lessor1Signatories: 'นายพรรษา เริงพิทยา และ นายกอบพงษ์ ศรีสุธี',
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
          deedNo: '4541',
          volume: '46',
          page: '41',
          mapSheet: '5142 III 7230',
          landNo: '261',
          surveyNo: '1878',
          subDistrict: 'บ้านน้อยซุ้มขี้เหล็ก',
          district: 'เนินมะปราง',
          province: 'พิษณุโลก',
          owner: 'นายทวีป คล้ายสุบรรณ์'
        }
      },
      {
        type: 'land',
        landDetails: {
          deedNo: '6054',
          volume: '61',
          page: '54',
          mapSheet: '5142 III 7230',
          landNo: '264',
          surveyNo: '1427',
          subDistrict: 'บ้านน้อยซุ้มขี้เหล็ก',
          district: 'เนินมะปราง',
          province: 'พิษณุโลก',
          owner: 'นายทวีป คล้ายสุบรรณ์'
        }
      }
    ]
  },

  hasBuyback: false,
  buybackData: [
    {
      contractNo: '',
      contractDate: '24 มีนาคม 2569',
      buybackPrice: '',
      buybackDate: '',
      conditions: '',
      vendorName: '',
      vendorDirectors: '',
      vendorAddress: '',
      vendorTaxId: '',
      buybackTable: [
        { year: 1, newRate: '50%', usedRate: '50%' },
        { year: 2, newRate: '45%', usedRate: '40%' },
        { year: 3, newRate: '40%', usedRate: '30%' },
        { year: 4, newRate: '30%', usedRate: '20%' },
        { year: 5, newRate: '20%', usedRate: 'น้อยกว่า 20%' },
      ]
    }
  ],

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

