import { useEffect, useRef } from 'react';
import { Trash2, FileText } from 'lucide-react';
import type { FeePaymentData, Agreement } from '../types/app';
import { CONTRACT_TYPE_LABELS } from '../types/app';
import type { ContractItem, ContractItemType } from '../types/contract';

interface Props {
  data: FeePaymentData;
  onChange: (data: FeePaymentData) => void;
  agreements: Agreement[];
}



export default function FeePaymentForm({ data, onChange, agreements }: Props) {
  const prevAgreementsRef = useRef<string[]>([]);
  const mainAgreements = agreements;

  // Auto-select ONLY newly added agreements
  useEffect(() => {
    const currentIds = mainAgreements.map(a => a.id);
    const newIds = currentIds.filter(id => !prevAgreementsRef.current.includes(id));

    if (newIds.length > 0) {
      const existingAgreementIds = data.items.map(i => i.agreementId).filter(Boolean);
      const newItems: ContractItem[] = [];

      newIds.forEach(id => {
        const agreement = mainAgreements.find(a => a.id === id);
        if (agreement && !existingAgreementIds.includes(agreement.id)) {
          const typeMap: Record<string, ContractItemType> = {
            'hirePurchase': 'hirePurchase',
            'hirePurchaseBack': 'hirePurchaseBack',
            'loan': 'loanCredit',
            'od': 'loanCredit'
          };

          newItems.push({
            id: Date.now().toString() + id,
            agreementId: agreement.id,
            type: typeMap[agreement.type] || 'hirePurchase',
            contractNo: (agreement.data as any).contractNo || '',
            amount: ((agreement.data as any).totalAmount || '').toString().replace(/,/g, ''),
          });
        }
      });

      if (newItems.length > 0) {
        onChange({
          ...data,
          items: [...data.items, ...newItems]
        });
      }
    }
    prevAgreementsRef.current = currentIds;
  }, [mainAgreements, data, onChange]);

  const handleChange = (field: keyof FeePaymentData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const toggleAgreement = (agreement: Agreement) => {
    const exists = data.items.some(item => item.agreementId === agreement.id);

    if (exists) {
      onChange({
        ...data,
        items: data.items.filter(item => item.agreementId !== agreement.id)
      });
    } else {
      const typeMap: Record<string, ContractItemType> = {
        'hirePurchase': 'hirePurchase',
        'hirePurchaseBack': 'hirePurchaseBack',
        'loan': 'loanCredit',
        'od': 'loanCredit'
      };

      const newItem: ContractItem = {
        id: Date.now().toString(),
        agreementId: agreement.id,
        type: typeMap[agreement.type] || 'hirePurchase',
        contractNo: (agreement.data as any).contractNo || '',
        amount: ((agreement.data as any).totalAmount || '').toString().replace(/,/g, ''),
      };
      onChange({ ...data, items: [...data.items, newItem] });
    }
  };

  const handleItemChange = (id: string, field: keyof ContractItem, value: string) => {
    onChange({
      ...data,
      items: data.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
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
              type="date"
              value={data.effectiveDate}
              onChange={(e) => handleChange('effectiveDate', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm p-2 border"
            />
          </div>
        </div>

        {/* Contract Items */}
        {/* Contract Selection Area */}
        <div className="pt-2">
          <label className="block text-xs font-medium text-gray-600 mb-2">เลือกสัญญาหลักอ้างอิง</label>
          <div className="space-y-1 border border-gray-300 rounded-md p-2 bg-slate-50/50">
            {mainAgreements.length === 0 ? (
              <div className="py-4 text-center text-gray-400 text-xs italic">
                ยังไม่มีการสร้างสัญญาหลักในระบบ
              </div>
            ) : (
              mainAgreements.map(agreement => {
                const isSelected = data.items.some(item => item.agreementId === agreement.id);
                return (
                  <div key={agreement.id} className="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-white transition-colors">
                    <label className="flex items-center gap-2 text-sm cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleAgreement(agreement)}
                        className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 shadow-sm"
                      />
                      <div className="flex items-center gap-1.5 leading-none">
                        <span className="font-semibold text-rose-800">{CONTRACT_TYPE_LABELS[agreement.type]}</span>
                        <span className="text-gray-400 text-xs">({(agreement.data as any).contractNo || 'ยังไม่มีเลขที่'})</span>
                      </div>
                    </label>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Items Detail List */}
        <div className="pt-2 mt-4">
          <label className="block text-xs font-medium text-gray-600 mb-2">รายละเอียดรายการ (แก้ไขได้)</label>
          <div className="space-y-3">
            {data.items.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-rose-100 rounded-lg bg-rose-50/20">
                <FileText className="mx-auto h-8 w-8 text-rose-200 mb-2" />
                <p className="text-gray-400 text-xs">เลือกสัญญาหลักด้านบนเพื่อเพิ่มรายการ</p>
              </div>
            )}
            {data.items.map((item, index) => (
              <div key={item.id} className="border border-rose-200/60 rounded-lg p-3 relative bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                      {index + 1}
                    </span>
                    <h4 className="font-bold text-xs text-rose-900">
                      {item.type === 'hirePurchase' ? 'Hire Purchase' : item.type === 'hirePurchaseBack' ? 'HP Back' : 'Loan Credit'}
                    </h4>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                    title="ลบรายการนี้"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">เลขที่สัญญา</label>
                    <input
                      type="text"
                      value={item.contractNo}
                      onChange={(e) => handleItemChange(item.id, 'contractNo', e.target.value)}
                      className="block w-full rounded-md border-gray-200 shadow-sm p-2 border text-sm focus:border-rose-400 focus:ring-rose-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">ยอดจัดค้ำประกัน (บาท)</label>
                    <input
                      type="text"
                      value={item.amount}
                      onChange={(e) => handleItemChange(item.id, 'amount', e.target.value)}
                      className="block w-full rounded-md border-gray-200 shadow-sm p-2 border text-sm focus:border-rose-400 focus:ring-rose-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

