import type { BuybackData } from '../types/app';

interface Props {
  data: BuybackData;
  onChange: (data: BuybackData) => void;
}

export default function BuybackForm({ data, onChange }: Props) {
  const handleChange = (field: keyof BuybackData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <section className="bg-white p-4 rounded-lg shadow-sm border border-orange-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
        <h3 className="font-semibold text-lg text-orange-700">สัญญารับซื้อคืน</h3>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">เลขที่สัญญา</label>
            <input
              type="text"
              value={data.contractNo}
              onChange={(e) => handleChange('contractNo', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border"
              placeholder="AGA/XX-BB2025"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">วันที่ทำสัญญา</label>
            <input
              type="text"
              value={data.contractDate}
              onChange={(e) => handleChange('contractDate', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border"
              placeholder="1 มกราคม 2569"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ราคารับซื้อคืน (บาท)</label>
            <input
              type="text"
              value={data.buybackPrice}
              onChange={(e) => handleChange('buybackPrice', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border"
              placeholder="500,000"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">วันที่รับซื้อคืน</label>
            <input
              type="text"
              value={data.buybackDate}
              onChange={(e) => handleChange('buybackDate', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border"
              placeholder="1 มกราคม 2572"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">เงื่อนไขเพิ่มเติม</label>
          <input
            type="text"
            value={data.conditions}
            onChange={(e) => handleChange('conditions', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border"
            placeholder="เงื่อนไขเพิ่มเติม (ถ้ามี)"
          />
        </div>
      </div>
    </section>
  );
}
