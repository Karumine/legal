import { Plus, Trash2, FilePlus } from 'lucide-react';
import type { BuybackData } from '../types/app';

interface Props {
  data: BuybackData[];
  onChange: (data: BuybackData[]) => void;
}

export default function BuybackForm({ data, onChange }: Props) {
  const updateBuyback = (index: number, field: keyof BuybackData, value: string) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const addBuyback = () => {
    onChange([
      ...(data || []),
      {
        contractNo: '',
        contractDate: '',
        buybackPrice: '',
        buybackDate: '',
        conditions: '',
      }
    ]);
  };

  const removeBuyback = (index: number) => {
    if ((data || []).length > 1) {
      onChange((data || []).filter((_, i) => i !== index));
    }
  };

  return (
    <section className="bg-white p-4 rounded-lg shadow-sm border border-orange-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          <h3 className="font-semibold text-lg text-orange-700">สัญญารับซื้อคืน</h3>
        </div>
        <button
          onClick={addBuyback}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-md text-xs font-medium hover:bg-orange-100 border border-orange-200 transition-colors"
        >
          <FilePlus size={14} /> เพิ่มสัญญารับซื้อคืน
        </button>
      </div>

      <div className="space-y-6">
        {(data || []).map((buyback, index) => (
          <div key={index} className="relative p-4 border border-orange-100 rounded-lg bg-orange-50/30">
            {(data || []).length > 1 && (
              <button
                onClick={() => removeBuyback(index)}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1"
                title="ลบสัญญานี้"
              >
                <Trash2 size={16} />
              </button>
            )}

            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white text-[10px] font-bold">
                {index + 1}
              </span>
              <h4 className="font-medium text-orange-800 text-sm">สัญญารับซื้อคืนฉบับที่ {index + 1}</h4>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">เลขที่สัญญา</label>
                  <input
                    type="text"
                    value={buyback.contractNo}
                    onChange={(e) => updateBuyback(index, 'contractNo', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border"
                    placeholder="AGA/XX-BB2025"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">วันที่ทำสัญญา</label>
                  <input
                    type="text"
                    value={buyback.contractDate}
                    onChange={(e) => updateBuyback(index, 'contractDate', e.target.value)}
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
                    value={buyback.buybackPrice}
                    onChange={(e) => updateBuyback(index, 'buybackPrice', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border"
                    placeholder="500,000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">วันที่รับซื้อคืน</label>
                  <input
                    type="text"
                    value={buyback.buybackDate}
                    onChange={(e) => updateBuyback(index, 'buybackDate', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border"
                    placeholder="1 มกราคม 2572"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">เงื่อนไขเพิ่มเติม</label>
                <input
                  type="text"
                  value={buyback.conditions}
                  onChange={(e) => updateBuyback(index, 'conditions', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border"
                  placeholder="เงื่อนไขเพิ่มเติม (ถ้ามี)"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {(data || []).length > 2 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={addBuyback}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-bold hover:bg-orange-700 shadow-sm transition-colors"
          >
            <Plus size={18} /> เพิ่มสัญญารับซื้อคืนอีกฉบับ
          </button>
        </div>
      )}
    </section>
  );
}
