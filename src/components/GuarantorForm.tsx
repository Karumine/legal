import { Plus, Trash2, UserPlus } from 'lucide-react';
import type { GuarantorData } from '../types/app';

interface Props {
  data: GuarantorData[];
  onChange: (data: GuarantorData[]) => void;
}

export default function GuarantorForm({ data, onChange }: Props) {
  const updateGuarantor = (id: string, field: keyof GuarantorData, value: string | boolean) => {
    onChange(
      data.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const addGuarantor = () => {
    const newGuarantor: GuarantorData = {
      id: Date.now().toString(),
      guarantorName: '',
      guarantorIdCard: '',
      guarantorAddress: '',
      isMarried: false,
      spouseName: '',
      spouseIdCard: '',
      spouseAddress: '',
    };
    onChange([...data, newGuarantor]);
  };

  const removeGuarantor = (id: string) => {
    if (data.length > 1) {
      onChange(data.filter((g) => g.id !== id));
    }
  };

  return (
    <section className="bg-white p-4 rounded-lg shadow-sm border border-emerald-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <h3 className="font-semibold text-lg text-emerald-700">สัญญาค้ำประกัน (ผู้ค้ำ)</h3>
        </div>
        <button
          onClick={addGuarantor}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium hover:bg-emerald-100 border border-emerald-200 transition-colors"
        >
          <UserPlus size={14} /> เพิ่มผู้ค้ำประกัน
        </button>
      </div>

      <div className="space-y-6">
        {data.map((guarantor, index) => (
          <div key={guarantor.id} className="relative p-4 border border-emerald-100 rounded-lg bg-emerald-50/30">
            {data.length > 1 && (
              <button
                onClick={() => removeGuarantor(guarantor.id)}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1"
                title="ลบผู้ค้ำคนนี้"
              >
                <Trash2 size={16} />
              </button>
            )}

            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                {index + 1}
              </span>
              <h4 className="font-medium text-emerald-800 text-sm">ผู้ค้ำประกันคนที่ {index + 1}</h4>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อผู้ค้ำประกัน</label>
                <input
                  type="text"
                  value={guarantor.guarantorName}
                  onChange={(e) => updateGuarantor(guarantor.id, 'guarantorName', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2 border"
                  placeholder="นาย/นาง/นางสาว ..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">เลขบัตรประชาชน</label>
                  <input
                    type="text"
                    value={guarantor.guarantorIdCard}
                    onChange={(e) => updateGuarantor(guarantor.id, 'guarantorIdCard', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2 border"
                    placeholder="X XXXX XXXXX XX X"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ที่อยู่</label>
                <input
                  type="text"
                  value={guarantor.guarantorAddress}
                  onChange={(e) => updateGuarantor(guarantor.id, 'guarantorAddress', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2 border"
                  placeholder="ที่อยู่ตามทะเบียนบ้าน"
                />
              </div>

              {/* Marital Status */}
              <div className="pt-3 border-t border-emerald-100">
                <label className="block text-xs font-medium text-gray-600 mb-2">สถานภาพสมรส</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={!guarantor.isMarried}
                      onChange={() => updateGuarantor(guarantor.id, 'isMarried', false)}
                      className="text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">โสด / ไม่ได้จดทะเบียนสมรส</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={guarantor.isMarried}
                      onChange={() => updateGuarantor(guarantor.id, 'isMarried', true)}
                      className="text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">สมรสจดทะเบียน</span>
                  </label>
                </div>
              </div>

              {guarantor.isMarried && (
                <div className="space-y-3 pt-3 border-t border-emerald-100 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อคู่สมรส</label>
                    <input
                      type="text"
                      value={guarantor.spouseName}
                      onChange={(e) => updateGuarantor(guarantor.id, 'spouseName', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2 border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">เลขบัตรปชช. คู่สมรส</label>
                      <input
                        type="text"
                        value={guarantor.spouseIdCard}
                        onChange={(e) => updateGuarantor(guarantor.id, 'spouseIdCard', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2 border"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">ที่อยู่คู่สมรส</label>
                    <input
                      type="text"
                      value={guarantor.spouseAddress}
                      onChange={(e) => updateGuarantor(guarantor.id, 'spouseAddress', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2 border"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {data.length > 2 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={addGuarantor}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-bold hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <Plus size={18} /> เพิ่มผู้ค้ำประกันอีกคน
          </button>
        </div>
      )}
    </section>
  );
}

