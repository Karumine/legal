import type { JointVentureData } from '../types/app';
import { CustomDatePicker } from './CustomDatePicker';

interface Props {
  data: JointVentureData;
  onChange: (data: JointVentureData) => void;
  onFocusSection?: (sectionId: string) => void;
}

export default function JointVentureForm({ data, onChange, onFocusSection }: Props) {
  const handleChange = (field: keyof JointVentureData, value: any) => {
    onChange({ ...data, [field]: value });
  };


  return (
    <section className="bg-white p-4 rounded-lg shadow-sm border border-amber-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
        <h3 className="font-semibold text-lg text-amber-700">สัญญาค้าร่วม</h3>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4" onFocusCapture={() => onFocusSection?.('jv-general')}>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">เลขที่สัญญา</label>
            <input
              type="text"
              value={data.contractNo}
              onChange={(e) => handleChange('contractNo', e.target.value)}
              className="block w-full rounded-md border-gray-200 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2 border"
              placeholder="AGA/XX-JV2025"
            />
          </div>
          <div>
            <CustomDatePicker
              label="วันที่ทำสัญญา"
              value={data.contractDate}
              onChange={(val) => handleChange('contractDate', val)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4" onFocusCapture={() => onFocusSection?.('jv-proportions')}>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">สัดส่วน คู่สัญญาฝ่ายที่ 1 (%)</label>
            <input
              type="number"
              value={data.proportion1}
              onChange={(e) => handleChange('proportion1', parseInt(e.target.value) || 0)}
              className="block w-full rounded-md border-gray-200 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2 border"
              placeholder="20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">สัดส่วน คู่สัญญาฝ่ายที่ 2 (%)</label>
            <input
              type="number"
              value={data.proportion2}
              onChange={(e) => handleChange('proportion2', parseInt(e.target.value) || 0)}
              className="block w-full rounded-md border-gray-200 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2 border"
              placeholder="80"
            />
          </div>
        </div>

        </div>
      </section>
  );
}

