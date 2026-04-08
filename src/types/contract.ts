export type ContractItemType = 'hirePurchase' | 'hirePurchaseBack' | 'loanCredit';

export interface ContractItem {
  id: string;
  agreementId?: string;
  type: ContractItemType;
  contractNo: string;
  amount: string;
  rate: string;
}

export interface ContractData {
  contractNo: string;
  effectiveDate: string;

  // Party 1
  companyName: string;
  companyAddress: string;
  companyPostalCode?: string;
  companyTaxId: string;
  companyDirectors: string;

  // Party 2 (Customer)
  customerCompany: string;
  customerDirector: string;
  customerAddress: string;
  customerPostalCode?: string;
  customerTaxId: string;
  entityType?: 'company' | 'partnership';

  // Dynamic contract items
  items: ContractItem[];
}

export const CONTRACT_TYPE_LABELS: Record<ContractItemType, { name: string; prefix: string; vatLabel: string }> = {
  hirePurchase: {
    name: 'Hire Purchase',
    prefix: 'สัญญาเช่าซื้อ Hire Purchase เลขที่',
    vatLabel: '(รวมภาษีมูลค่าเพิ่ม)',
  },
  hirePurchaseBack: {
    name: 'Hire Purchase Back',
    prefix: 'สัญญาเช่าซื้อ Hire Purchase Back เลขที่',
    vatLabel: '(รวมภาษีมูลค่าเพิ่ม)',
  },
  loanCredit: {
    name: 'Loan Credit',
    prefix: 'สัญญาให้สินเชื่อเลขที่',
    vatLabel: '(ไม่รวมภาษีมูลค่าเพิ่ม)',
  },
};

export const initialContractData: ContractData = {
  contractNo: 'AGA/11-FEE032026',
  effectiveDate: '24 มีนาคม 2569',
  companyName: 'บริษัท อาไจล์ แอสเซ็ทส์ จำกัด',
  companyAddress: 'เลขที่ 20 หมู่ที่ 1 ถนนสุขุมวิท ตำบลบางเมืองใหม่ อำเภอเมืองสมุทรปราการ จังหวัดสมุทรปราการ',
  companyTaxId: '0115558012195',
  companyDirectors: 'นายพรรษา เริงพิทยา, นายกอบพงษ์ ตรีสุขี',
  customerCompany: 'บริษัท นันทวรรณ กรีนดริ้งค์ จำกัด',
  customerDirector: 'นางสาวรัตนา หมู่ทอง',
  customerAddress: 'เลขที่ 39 หมู่ 4 ตำบลวังจุฬา อำเภอวังน้อย จังหวัดพระนครศรีอยุธยา',
  customerTaxId: '0145554003035',
  entityType: 'company',
  items: [],
};
