import type { HirePurchaseData } from '../types/app';

interface Props {
  data: HirePurchaseData;
  onChange: (data: HirePurchaseData) => void;
}

export default function HirePurchaseForm({ data, onChange }: Props) {
  const handleChange = (field: keyof HirePurchaseData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <section className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
        <h3 className="font-semibold text-lg text-blue-700">สัญญาเช่าซื้อ (Hire Purchase)</h3>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">เลขที่สัญญา</label>
            <input
              type="text"
              value={data.contractNo}
              onChange={(e) => handleChange('contractNo', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
              placeholder="AGA/XX-HP2025"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">วันที่ทำสัญญา</label>
            <input
              type="text"
              value={data.contractDate}
              onChange={(e) => handleChange('contractDate', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
              placeholder="1 มกราคม 2569"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">รายละเอียดทรัพย์สิน</label>
          <input
            type="text"
            value={data.assetDescription}
            onChange={(e) => handleChange('assetDescription', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
            placeholder="เครื่องจักร / อุปกรณ์ / ฯลฯ"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">มูลค่ารวม (บาท)</label>
            <input
              type="text"
              value={data.totalAmount}
              onChange={(e) => handleChange('totalAmount', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
              placeholder="1,000,000"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">เงินดาวน์ (บาท)</label>
            <input
              type="text"
              value={data.downPayment}
              onChange={(e) => handleChange('downPayment', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
              placeholder="200,000"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ยอมคงเหลือ (บาท)</label>
            <input
              type="text"
              value={data.remainingAmount}
              onChange={(e) => handleChange('remainingAmount', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
              placeholder="800,000"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">จำนวนงวด</label>
            <input
              type="text"
              value={data.installments}
              onChange={(e) => handleChange('installments', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
              placeholder="36"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ค่างวด/เดือน (บาท)</label>
            <input
              type="text"
              value={data.installmentAmount}
              onChange={(e) => handleChange('installmentAmount', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
              placeholder="25,000"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">อัตราดอกเบี้ย (%)</label>
            <input
              type="text"
              value={data.interestRate}
              onChange={(e) => handleChange('interestRate', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
              placeholder="15"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">อัตราเบี้ยปรับ (%)</label>
            <input
              type="text"
              value={data.penaltyRate}
              onChange={(e) => handleChange('penaltyRate', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
              placeholder="18"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
