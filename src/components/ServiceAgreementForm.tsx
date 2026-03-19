import type { ServiceAgreementData } from '../types/app';

interface Props {
  data: ServiceAgreementData;
  onChange: (data: ServiceAgreementData) => void;
}

export default function ServiceAgreementForm({ data, onChange }: Props) {
  const handleChange = (field: keyof ServiceAgreementData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <section className="bg-white p-4 rounded-lg shadow-sm border border-teal-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-teal-500"></div>
        <h3 className="font-semibold text-lg text-teal-700">สัญญาจ้างบริการ</h3>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">เลขที่สัญญา</label>
            <input
              type="text"
              value={data.contractNo}
              onChange={(e) => handleChange('contractNo', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm p-2 border"
              placeholder="AGA/XX-SVC2025"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">วันที่ทำสัญญา</label>
            <input
              type="text"
              value={data.contractDate}
              onChange={(e) => handleChange('contractDate', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm p-2 border"
              placeholder="1 มกราคม 2569"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

