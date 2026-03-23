export interface GuaranteeData {
  contractNo: string;
  effectiveDate: string;

  // Party 1 (Lender)
  lenderCompany: string; // บริษัท อาไจล์ แอสเซ็ทส์ จำกัด
  lenderDirectors: string; // นายพรรษา เริงพิทยา และ นายกอบพงษ์ ตรีสุขี
  lenderAddress: string; // ที่ตั้ง ...
  lenderTaxId: string; // 0115558012195
  lenderPhone: string;

  // Party 2 (Borrower)
  borrowerCompany: string; // บริษัท ฐิติกร จำกัด (มหาชน)
  borrowerDirectors: string; // นางสาวปฐมา พรประภา และนายประพล พรประภา
  borrowerAddress: string;
  borrowerTaxId: string;
  borrowerPhone: string;

  // Party 3 (Guarantor)
  guarantorName: string; // นายวชิระ ตาแหวน
  guarantorIdCard: string; // 3 4004 00412 18 8
  guarantorAddress: string;
  guarantorPhone: string;

  // Marital Status
  isMarried: boolean;
  spouseName: string;
  spouseIdCard: string;
  spouseAddress: string;

  // Reference Contract Details
  refContractCompany: string; // บริษัท น้ำดื่มขอนแก่น จำกัด
  refContracts: {
    no: string;
    date: string;
    amount: number;
  }[];
  guaranteeAmountText: string;
  guaranteeAmountNumber: string;
}

export const initialGuaranteeData: GuaranteeData = {
  contractNo: 'AGA/66-SUR082025',
  effectiveDate: '20 สิงหาคม 2568',

  lenderCompany: 'บริษัท อาไจล์ แอสเซ็ทส์ จำกัด',
  lenderDirectors: 'นายพรรษา เริงพิทยา และ นายกอบพงษ์ ตรีสุขี',
  lenderAddress: 'เลขที่ 20 หมู่ 1 ถนนสุขุมวิท ตำบลบางเมืองใหม่ อำเภอเมืองสมุทรปราการ จังหวัดสมุทรปราการ',
  lenderTaxId: '0115558012195',
  lenderPhone: '098-283-7700',

  borrowerCompany: 'บริษัท ฐิติกร จำกัด (มหาชน)',
  borrowerDirectors: 'นางสาวปฐมา พรประภา และนายประพล พรประภา',
  borrowerAddress: 'เลขที่ 69 ถนนรามคำแหง แขวงหัวหมาก เขตบางกะปิ กรุงเทพมหานคร',
  borrowerTaxId: '0107546000130',
  borrowerPhone: '02-310-7000',

  guarantorName: 'นายวชิระ ตาแหวน',
  guarantorIdCard: '3 4004 00412 18 8',
  guarantorAddress: 'เลขที่ 98/109 หมู่ที่ 6 ตำบลคลองสาม อำเภอคลองหลวง จังหวัดปทุมธานี',
  guarantorPhone: '',

  isMarried: false,
  spouseName: 'นางสาวนงคราญ สายโอราช',
  spouseIdCard: '1 2345 67890 12 3',
  spouseAddress: 'เลขที่ 18/40 หมู่ที่ 5 ตำบลคลองสาม อำเภอคลองหลวง จังหวัดปทุมธานี',

  refContractCompany: 'บริษัท น้ำดื่มขอนแก่น จำกัด',
  refContracts: [
    { no: 'AGA/73-LA2025', date: '20 สิงหาคม 2568', amount: 22620656 }
  ],
  guaranteeAmountText: 'ยี่สิบสองล้านหกแสนสองหมื่นหกร้อยห้าสิบหกบาทถ้วน',
  guaranteeAmountNumber: '22,620,656',
};
