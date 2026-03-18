import { Plus, Trash2 } from 'lucide-react';
import type { FeePaymentData } from '../types/app';
import type { ContractItem, ContractItemType } from '../types/contract';

interface Props {
  data: FeePaymentData;
  onChange: (data: FeePaymentData) => void;
}

const typeLabels: Record<ContractItemType, string> = {
  hirePurchase: 'Hire Purchase',
  hirePurchaseBack: 'Hire Purchase Back',
  loanCredit: 'Loan Credit',
};

export default function FeePaymentForm({ data, onChange }: Props) {
  const handleChange = (field: keyof FeePaymentData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleItemChange = (id: string, field: keyof ContractItem, value: string) => {
    onChange({
      ...data,
      items: data.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const addItem = (type: ContractItemType) => {
    const newItem: ContractItem = {
      id: Date.now().toString(),
      type,
      contractNo: '',
      amount: '',
    };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (id: string) => {
    onChange({ ...data, items: data.items.filter(item => item.id !== id) });
  };

  return (
    <section className="bg-white p-4 rounded-lg shadow-sm border border-rose-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
        <h3 className="font-semibold text-lg text-rose-700">สัญญาชำระค่าธรรมเนียม</h3>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">เลขที่สัญญา</label>
            <input
              type="text"
              value={data.contractNo}
              onChange={(e) => handleChange('contractNo', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm p-2 border"
              placeholder="AGA/XX-FEE2025"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">วันที่มีผลใช้บังคับ</label>
            <input
              type="text"
              value={data.effectiveDate}
              onChange={(e) => handleChange('effectiveDate', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm p-2 border"
              placeholder="1 มกราคม 2569"
            />
          </div>
        </div>

        {/* Contract Items */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">รายการสัญญาอ้างอิง</label>
          <div className="space-y-3">
            {data.items.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-rose-200 rounded-lg">
                <p className="text-gray-400 text-xs mb-1">ยังไม่มีรายการสัญญา</p>
                <p className="text-gray-400 text-xs">กดปุ่มด้านล่างเพื่อเพิ่มรายการ</p>
              </div>
            )}
            {data.items.map((item, index) => (
              <div key={item.id} className="border border-rose-100 rounded-lg p-3 relative bg-rose-50/30">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-xs text-rose-700">
                    {index + 1}. {typeLabels[item.type]}
                  </h4>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500">เลขที่สัญญา</label>
                    <input
                      type="text"
                      value={item.contractNo}
                      onChange={(e) => handleItemChange(item.id, 'contractNo', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">จำนวนเงิน (บาท)</label>
                    <input
                      type="text"
                      value={item.amount}
                      onChange={(e) => handleItemChange(item.id, 'amount', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2 flex-wrap">
            <button
              onClick={() => addItem('hirePurchase')}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-xs hover:bg-blue-100 border border-blue-200"
            >
              <Plus size={12} /> Hire Purchase
            </button>
            <button
              onClick={() => addItem('hirePurchaseBack')}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-xs hover:bg-green-100 border border-green-200"
            >
              <Plus size={12} /> HP Back
            </button>
            <button
              onClick={() => addItem('loanCredit')}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-md text-xs hover:bg-purple-100 border border-purple-200"
            >
              <Plus size={12} /> Loan Credit
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
