import type { JointVentureData, Agreement } from '../types/app';
import { CONTRACT_TYPE_LABELS } from '../types/app';

interface Props {
  data: JointVentureData;
  agreements: Agreement[];
  onChange: (data: JointVentureData) => void;
}

export default function JointVentureForm({ data, agreements, onChange }: Props) {
  const handleChange = (field: keyof JointVentureData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const toggleAgreement = (id: string) => {
    const selected = data.selectedAgreementIds || [];
    const nextSelected = selected.includes(id)
      ? selected.filter(sid => sid !== id)
      : [...selected, id];
    handleChange('selectedAgreementIds', nextSelected);
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
              className="block w-full rounded-md border-gray-200 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2 border"
              placeholder="AGA/XX-JV2025"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">วันที่ทำสัญญา</label>
            <input
              type="date"
              value={data.contractDate}
              onChange={(e) => handleChange('contractDate', e.target.value)}
              className="block w-full rounded-md border-gray-200 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2 border"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
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

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">เลือกสัญญาที่เกี่ยวข้อง</label>
          <div className="space-y-2 border border-gray-400 rounded-md p-3 bg-gray-50 max-h-48 overflow-y-auto">
            {agreements.map((agreement) => (
              <label key={agreement.id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={(data.selectedAgreementIds || []).includes(agreement.id)}
                  onChange={() => toggleAgreement(agreement.id)}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <div className="text-sm">
                  <span className="font-medium text-gray-700">{agreement.data.contractNo}</span>
                  <span className="text-gray-400 mx-2">|</span>
                  <span className="text-gray-500">{CONTRACT_TYPE_LABELS[agreement.type as keyof typeof CONTRACT_TYPE_LABELS] || agreement.type}</span>
                </div>
              </label>
            ))}
            {agreements.length === 0 && (
              <p className="text-xs text-gray-400 italic text-center py-2">ยังไม่มีรายการสัญญาในระบบ</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

