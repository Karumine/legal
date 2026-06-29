import { useEffect, useRef } from 'react';
import { Trash2, FileText } from 'lucide-react';
import { CustomDatePicker } from './CustomDatePicker';
import { PercentageInput } from './PercentageInput';
import type { FeePaymentData, Agreement } from '../types/app';
import { CONTRACT_TYPE_LABELS } from '../types/app';
import type { ContractItem, ContractItemType } from '../types/contract';

interface Props {
  data: FeePaymentData;
  onChange: (data: FeePaymentData) => void;
  agreements: Agreement[];
  onFocusSection?: (sectionId: string) => void;
}

export default function FeePaymentForm({ data, onChange, agreements, onFocusSection }: Props) {
  const prevAgreementsRef = useRef<string[]>([]);

  // Synchronize items with main agreements in real-time
  useEffect(() => {
    const agreementMap = new Map(agreements.map(a => [a.id, a]));
    const agreementIds = agreements.map(a => a.id);

    // Track new agreements to auto-select them once
    const newIds = agreementIds.filter(id => !prevAgreementsRef.current.includes(id));
    prevAgreementsRef.current = agreementIds;

    let hasChanges = false;

    // 1. Remove orphaned items (where agreementId exists but is no longer in agreements)
    let updatedItems = data.items.filter(item => {
      if (!item.agreementId) return true; // Keep manually added items
      if (agreementIds.includes(item.agreementId)) return true;
      hasChanges = true;
      return false;
    });

    // 2. Add ONLY newly created agreements (not manual unchecks)
    newIds.forEach(id => {
      const agreement = agreementMap.get(id);
      if (agreement && !updatedItems.some(i => i.agreementId === id)) {
        const agreementData = agreement.data as any;
        const typeMap: Record<string, ContractItemType> = {
          'hirePurchase': 'hirePurchase',
          'hirePurchaseBack': 'hirePurchaseBack',
          'loan': 'loanCredit',
          'od': 'loanCredit'
        };

        const netAmount = (agreement.type === 'hirePurchase' || agreement.type === 'hirePurchaseBack')
          ? parseFloat(agreementData.remainingAmount?.toString().replace(/,/g, '') || '0')
          : parseFloat((agreementData.loanAmount || agreementData.totalAmount || '0').toString().replace(/,/g, ''));

        const rate = 3.0; // Default 3%
        const calculatedAmount = (netAmount * rate / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        updatedItems.push({
          id: agreement.id,
          agreementId: agreement.id,
          type: typeMap[agreement.type] || 'hirePurchase',
          contractNo: agreementData.contractNo || '',
          amount: calculatedAmount,
          rate: rate.toFixed(2),
        });
        hasChanges = true;
      }
    });

    // 3. Sync metadata for ALREADY selected items
    updatedItems = updatedItems.map(item => {
      if (!item.agreementId) return item;
      const agreement = agreementMap.get(item.agreementId);
      if (!agreement) return item;

      const agreementData = agreement.data as any;
      const targetContractNo = agreementData.contractNo || '';

      const netAmount = (agreement.type === 'hirePurchase' || agreement.type === 'hirePurchaseBack')
        ? parseFloat(agreementData.remainingAmount?.toString().replace(/,/g, '') || '0')
        : parseFloat((agreementData.loanAmount || agreementData.totalAmount || '0').toString().replace(/,/g, ''));

      const rateNum = parseFloat(item.rate) || 0;
      const targetAmount = (netAmount * rateNum / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      if (item.contractNo !== targetContractNo || Math.abs(parseFloat(item.amount.replace(/,/g, '')) - parseFloat(targetAmount.replace(/,/g, ''))) > 0.01) {
        hasChanges = true;
        return { ...item, contractNo: targetContractNo, amount: targetAmount };
      }
      return item;
    });

    if (hasChanges) {
      onChange({ ...data, items: updatedItems });
    }
  }, [agreements, data.items.length]); // Trigger on system-wide agreement changes or manual list removals

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

      const agreementData = agreement.data as any;
      const netAmount = (agreement.type === 'hirePurchase' || agreement.type === 'hirePurchaseBack')
        ? parseFloat(agreementData.remainingAmount?.toString().replace(/,/g, '') || '0')
        : parseFloat((agreementData.loanAmount || agreementData.totalAmount || '0').toString().replace(/,/g, ''));

      const rate = 3.0; // Default 3%
      const calculatedAmount = (netAmount * rate / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const newItem: ContractItem = {
        id: agreement.id,
        agreementId: agreement.id,
        type: typeMap[agreement.type] || 'hirePurchase',
        contractNo: agreementData.contractNo || '',
        amount: calculatedAmount,
        rate: rate.toFixed(2),
      };
      onChange({ ...data, items: [...data.items, newItem] });
    }
  };

  const handleItemChange = (id: string, field: keyof ContractItem, value: string) => {
    const updatedItems = data.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        // Recalculate amount if rate changes
        if (field === 'rate' && item.agreementId) {
          const agreement = agreements.find(a => a.id === item.agreementId);
          if (agreement) {
            const agreementData = agreement.data as any;
            const netAmount = (agreement.type === 'hirePurchase' || agreement.type === 'hirePurchaseBack')
              ? parseFloat(agreementData.remainingAmount?.toString().replace(/,/g, '') || '0')
              : parseFloat((agreementData.loanAmount || agreementData.totalAmount || '0').toString().replace(/,/g, ''));

            const rateNum = parseFloat(value) || 0;
            updatedItem.amount = (netAmount * rateNum / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          }
        }
        return updatedItem;
      }
      return item;
    });

    onChange({ ...data, items: updatedItems });
  };

  const removeItem = (id: string) => {
    onChange({ ...data, items: data.items.filter(item => item.id !== id) });
  };

  return (
    <section className="bg-white p-4 rounded-lg shadow-sm border border-rose-200" onFocusCapture={() => onFocusSection?.('fp-general')}>
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
            <CustomDatePicker
              label="วันที่มีผลใช้บังคับ"
              value={data.effectiveDate}
              onChange={(val) => handleChange('effectiveDate', val)}
            />
        </div>

        {/* Contract Items */}
        {/* Contract Selection Area */}
        <div className="pt-2">
          <label className="block text-xs font-medium text-gray-600 mb-2">เลือกสัญญาหลักอ้างอิง</label>
          <div className="space-y-1 border border-gray-300 rounded-md p-2 bg-slate-50/50">
            {agreements.length === 0 ? (
              <div className="py-4 text-center text-gray-400 text-xs italic">
                ยังไม่มีการสร้างสัญญาหลักในระบบ
              </div>
            ) : (
              agreements.map((agreement: Agreement) => {
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
                        <span className="font-semibold text-rose-800">{CONTRACT_TYPE_LABELS[agreement.type as keyof typeof CONTRACT_TYPE_LABELS]}</span>
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
                    <label className="block text-xs font-medium text-gray-600 mb-1">เลขที่สัญญาอ้างอิง</label>
                    <input
                      type="text"
                      value={item.contractNo}
                      onChange={(e) => handleItemChange(item.id, 'contractNo', e.target.value)}
                      className="block w-full rounded-md border-gray-200 shadow-sm p-2 border text-sm focus:border-rose-400 focus:ring-rose-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-rose-600 mb-1">ร้อยละ (%)</label>
                      <PercentageInput
                        value={item.rate}
                        onChange={(val) => handleItemChange(item.id, 'rate', val)}
                        className="block w-full rounded-md border-gray-200 shadow-sm p-2 border text-sm focus:border-rose-400 focus:ring-rose-400 font-medium"
                        placeholder="3.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">ค่าธรรมเนียม (บาท)</label>
                      <input
                        type="text"
                        value={item.amount}
                        readOnly
                        className="block w-full rounded-md border-gray-200 shadow-sm p-2 border text-sm font-bold bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>
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

