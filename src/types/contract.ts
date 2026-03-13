export type ContractItemType = 'hirePurchase' | 'hirePurchaseBack' | 'loanCredit';

export interface ContractItem {
  id: string;
  type: ContractItemType;
  contractNo: string;
  amount: string;
}

export interface ContractData {
  contractNo: string;
  effectiveDate: string;

  // Party 2 (Customer)
  customerCompany: string;
  customerDirector: string;
  customerAddress: string;
  customerTaxId: string;

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
  customerCompany: 'บริษัท นันทวรรณ กรีนดริ้งค์ จำกัด',
  customerDirector: 'นางสาวรัตนา หมู่ทอง',
  customerAddress: 'เลขที่ 39 หมู่ 4 ตำบลวังจุฬา อำเภอวังน้อย จังหวัดพระนครศรีอยุธยา',
  customerTaxId: '0145554003035',
  items: [],
};
