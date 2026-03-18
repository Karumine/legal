import type { JointVentureData } from '../types/app';

interface Props {
  data: JointVentureData;
  onChange: (data: JointVentureData) => void;
}

export default function JointVentureForm({ data, onChange }: Props) {
  const handleChange = (field: keyof JointVentureData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <section className="bg-white p-4 rounded-lg shadow-sm border border-amber-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
        <h3 className="font-semibold text-lg text-amber-700">สัญญาค้าร่วม</h3>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">เลขที่สัญญา</label>
            <input
              type="text"
              value={data.contractNo}
              onChange={(e) => handleChange('contractNo', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2 border"
              placeholder="AGA/XX-JV2025"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">วันที่ทำสัญญา</label>
            <input
              type="text"
              value={data.contractDate}
              onChange={(e) => handleChange('contractDate', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2 border"
              placeholder="1 มกราคม 2569"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
