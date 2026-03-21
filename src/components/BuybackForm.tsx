import { Plus, Trash2, FilePlus } from 'lucide-react';
import DirectorInput from './DirectorInput';
import type { BuybackData } from '../types/app';

interface Props {
  data: BuybackData[];
  onChange: (data: BuybackData[]) => void;
  hpDate: string;
}

export default function BuybackForm({ data, onChange, hpDate }: Props) {
  const updateBuyback = (index: number, field: keyof BuybackData, value: string) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const updateTable = (index: number, rowIdx: number, field: 'newRate' | 'usedRate', value: string) => {
    const newData = [...data];
    const newTable = [...newData[index].buybackTable];
    newTable[rowIdx] = { ...newTable[rowIdx], [field]: value };
    newData[index] = { ...newData[index], buybackTable: newTable };
    onChange(newData);
  };

  const addBuyback = () => {
    onChange([
      ...(data || []),
      {
        contractNo: '',
        contractDate: hpDate,
        buybackPrice: '',
        buybackDate: '',
        conditions: '',
        vendorName: '',
        vendorDirectors: '',
        vendorAddress: '',
        vendorTaxId: '',
        buybackTable: [
          { year: 1, newRate: '50%', usedRate: '50%' },
          { year: 2, newRate: '45%', usedRate: '40%' },
          { year: 3, newRate: '40%', usedRate: '30%' },
          { year: 4, newRate: '30%', usedRate: '20%' },
          { year: 5, newRate: '20%', usedRate: 'น้อยกว่า 20%' },
        ]
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

              <div className="pt-4 border-t border-orange-100">
                <h5 className="text-xs font-bold text-orange-700 mb-3">เกณฑ์ราคาการรับซื้อคืน (ตามปี)</h5>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-[11px] text-left border-collapse">
                    <thead>
                      <tr className="border-b border-orange-200 bg-orange-100/50">
                        <th className="py-1.5 px-2 font-bold text-orange-800">ปีที่</th>
                        <th className="py-1.5 px-2 font-bold text-orange-800">มือ 1 (%)</th>
                        <th className="py-1.5 px-2 font-bold text-orange-800">มือ 2 (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(buyback.buybackTable || []).map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-orange-100/50 hover:bg-white/50">
                          <td className="py-1.5 px-2 font-medium text-gray-700">ปีที่ {row.year}</td>
                          <td className="py-1 px-2">
                            <input
                              type="text"
                              value={row.newRate}
                              onChange={(e) => updateTable(index, rowIdx, 'newRate', e.target.value)}
                              className="w-full p-1 border border-orange-200 rounded text-[11px] focus:ring-1 focus:ring-orange-500 outline-none"
                            />
                          </td>
                          <td className="py-1 px-2">
                            <input
                              type="text"
                              value={row.usedRate}
                              onChange={(e) => updateTable(index, rowIdx, 'usedRate', e.target.value)}
                              className="w-full p-1 border border-orange-200 rounded text-[11px] focus:ring-1 focus:ring-orange-500 outline-none"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-4 border-t border-orange-100">
                <h5 className="text-xs font-bold text-orange-700 mb-3">ข้อมูลผู้ขาย / ตัวแทนจำหน่าย (คู่สัญญาฝ่ายที่ 3)</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อบริษัทผู้ขาย / ตัวแทนจำหน่าย</label>
                    <input
                      type="text"
                      value={buyback.vendorName}
                      onChange={(e) => updateBuyback(index, 'vendorName', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border"
                      placeholder="เช่น ห้างหุ้นส่วนจำกัด ท่าพระจันทร์ 2007"
                    />
                  </div>
                  <div>
                    <DirectorInput
                      label="กรรมการผู้มีอำนาจ"
                      value={buyback.vendorDirectors}
                      onChange={(val) => updateBuyback(index, 'vendorDirectors', val)}
                      placeholder="เช่น นายดุษฎี จันทร์สคราญ"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">เลขประจำตัวผู้เสียภาษี</label>
                    <input
                      type="text"
                      value={buyback.vendorTaxId}
                      onChange={(e) => updateBuyback(index, 'vendorTaxId', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border"
                      placeholder="0723550000557"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">ที่อยู่จดทะเบียน</label>
                    <textarea
                      value={buyback.vendorAddress}
                      onChange={(e) => updateBuyback(index, 'vendorAddress', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border h-16"
                      placeholder="เช่น 555 หมู่ 10 ตำบลอู่ทอง อำเภออู่ทอง จังหวัดสุพรรณบุรี"
                    />
                  </div>
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
