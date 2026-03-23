import { useEffect, useRef } from 'react';
import type { ServiceAgreementData, AppData } from '../types/app';
import { CONTRACT_TYPE_LABELS } from '../types/app';

interface Props {
  data: ServiceAgreementData;
  appData: AppData;
  onChange: (data: ServiceAgreementData) => void;
}

export default function ServiceAgreementForm({ data, appData, onChange }: Props) {
  const prevAgreementsRef = useRef<string[]>([]);

  // Auto-select ONLY newly added agreements from appData
  useEffect(() => {
    const currentIds = appData.agreements.map(a => a.id);
    const newIds = currentIds.filter(id => !prevAgreementsRef.current.includes(id));

    if (newIds.length > 0) {
      // Find IDs that are totally new to the system (not just unselected)
      const toSelect = newIds.filter(id => !data.selectedAgreementIds.includes(id));
      if (toSelect.length > 0) {
        onChange({
          ...data,
          selectedAgreementIds: [...data.selectedAgreementIds, ...toSelect]
        });
      }
    }
    prevAgreementsRef.current = currentIds;
  }, [appData.agreements, data.selectedAgreementIds, onChange, data]);

  const handleChange = (field: keyof ServiceAgreementData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const calculateFees = (totalStr: string) => {
    const total = parseFloat(totalStr.replace(/,/g, '')) || 0;
    const price = total / 1.07;
    const vat = total - price;
    return {
      price: price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      vat: vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    };
  };

  const originationFees = calculateFees(data.originationFeeTotal);
  const serviceFees = calculateFees(data.serviceFeeTotal);

  const toggleAgreement = (id: string) => {
    const newSelected = data.selectedAgreementIds.includes(id)
      ? data.selectedAgreementIds.filter(i => i !== id)
      : [...data.selectedAgreementIds, id];
    handleChange('selectedAgreementIds', newSelected);
  };

  return (
    <section className="bg-white p-4 rounded-lg shadow-sm border border-teal-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-teal-500"></div>
        <h3 className="font-semibold text-lg text-teal-700">สัญญาจ้างบริการ</h3>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">เลขที่สัญญา</label>
            <input
              type="text"
              value={data.contractNo}
              onChange={(e) => handleChange('contractNo', e.target.value)}
              className="block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm p-2 border"
              placeholder="AGA/XX-SVC2025"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">วันที่ทำสัญญา</label>
            <input
              type="date"
              value={data.contractDate}
              onChange={(e) => handleChange('contractDate', e.target.value)}
              className="block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm p-2 border"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">เลือกสัญญาที่เกี่ยวข้อง และระบุวันชำระงวดแรก</label>
          <div className="space-y-3 border border-gray-400 rounded-md p-3 bg-gray-50 font-sans">
            {appData.agreements.map((agreement) => {
              const isSelected = data.selectedAgreementIds.includes(agreement.id);
              return (
                <div key={agreement.id} className="space-y-2 pb-2 border-b border-gray-200 last:border-0">
                  <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white p-1 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleAgreement(agreement.id)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="font-medium">{CONTRACT_TYPE_LABELS[agreement.type]}</span>
                    <span className="text-gray-500">({agreement.data.contractNo})</span>
                  </label>

                  {isSelected && (
                    <div className="pl-6 grid grid-cols-2 gap-x-8 gap-y-4 pt-1">
                      {/* Column 1: Origination Fee */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-sm">1. Origination Fee</div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-500 whitespace-nowrap w-24">วันที่งวดแรก:</label>
                          <input
                            type="date"
                            value={data.agreementFirstDates?.[agreement.id] || ''}
                            onChange={(e) => {
                              const newDates = { ...data.agreementFirstDates, [agreement.id]: e.target.value };
                              handleChange('agreementFirstDates', newDates);
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-xs p-1 border border-gray-200"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-500 whitespace-nowrap w-24">ชำระงวดละ:</label>
                          <input
                            type="text"
                            value={data.agreementInstallmentAmounts?.[agreement.id] || ''}
                            onChange={(e) => {
                              const newAmounts = { ...data.agreementInstallmentAmounts, [agreement.id]: e.target.value };
                              handleChange('agreementInstallmentAmounts', newAmounts);
                            }}
                            placeholder="0.00"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-xs p-1 border border-gray-200"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-500 whitespace-nowrap w-24">จำนวนงวด:</label>
                          <input
                            type="number"
                            value={data.agreementOriginationFeePeriods?.[agreement.id] || ''}
                            onChange={(e) => {
                              const newPeriods = { ...data.agreementOriginationFeePeriods, [agreement.id]: parseInt(e.target.value) || 0 };
                              handleChange('agreementOriginationFeePeriods', newPeriods);
                            }}
                            placeholder="0"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-xs p-1 border border-gray-200"
                          />
                        </div>
                      </div>

                      {/* Column 2: Service Fee */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm">2. Service Fee</div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-500 whitespace-nowrap w-24">วันที่งวดแรก:</label>
                          <input
                            type="date"
                            value={data.agreementServiceFeeFirstDates?.[agreement.id] || ''}
                            onChange={(e) => {
                              const newDates = { ...data.agreementServiceFeeFirstDates, [agreement.id]: e.target.value };
                              handleChange('agreementServiceFeeFirstDates', newDates);
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-xs p-1 border border-gray-200"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-500 whitespace-nowrap w-24">ค่างวด:</label>
                          <input
                            type="text"
                            value={data.agreementServiceFeeAmounts?.[agreement.id] || ''}
                            onChange={(e) => {
                              const newAmounts = { ...data.agreementServiceFeeAmounts, [agreement.id]: e.target.value };
                              handleChange('agreementServiceFeeAmounts', newAmounts);
                            }}
                            placeholder="0.00"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-xs p-1 border border-gray-200"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-500 whitespace-nowrap w-24">จำนวนงวด:</label>
                          <input
                            type="number"
                            value={data.agreementServiceFeePeriods?.[agreement.id] || ''}
                            onChange={(e) => {
                              const newPeriods = { ...data.agreementServiceFeePeriods, [agreement.id]: parseInt(e.target.value) || 0 };
                              handleChange('agreementServiceFeePeriods', newPeriods);
                            }}
                            placeholder="0"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-xs p-1 border border-gray-200"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-100">
          {/* 2.1 Origination Fee */}
          <div className="space-y-3 p-3 bg-teal-50/50 rounded-lg border border-teal-100">
            <h4 className="text-sm font-bold text-teal-800">2.1 ค่า Origination Fee</h4>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ราคารวมทั้งหมด (รวม VAT)</label>
              <input
                type="text"
                value={data.originationFeeTotal}
                onChange={(e) => handleChange('originationFeeTotal', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm p-2 border border-gray-200"
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-500 block">ราคาบริการ:</span>
                <span className="font-bold">{originationFees.price}</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-500 block">ภาษีมูลค่าเพิ่ม:</span>
                <span className="font-bold">{originationFees.vat}</span>
              </div>
            </div>
          </div>

          {/* 2.2 Service Fee */}
          <div className="space-y-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <h4 className="text-sm font-bold text-blue-800">2.2 ค่า Service Fee</h4>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ราคารวมทั้งหมด (รวม VAT)</label>
              <input
                type="text"
                value={data.serviceFeeTotal}
                onChange={(e) => handleChange('serviceFeeTotal', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border border-gray-200"
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-500 block">ราคาบริการ:</span>
                <span className="font-bold">{serviceFees.price}</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-500 block">ภาษีมูลค่าเพิ่ม:</span>
                <span className="font-bold">{serviceFees.vat}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2.4 รายละเอียดการชำระเงิน */}
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-bold text-gray-700 mb-3">2.4 รายละเอียดการชำระเงิน</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">งวดแรก</label>
              <input
                type="date"
                value={data.firstInstallmentDate}
                onChange={(e) => handleChange('firstInstallmentDate', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm p-2 border border-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">งวดสุดท้าย</label>
              <input
                type="date"
                value={data.lastInstallmentDate}
                onChange={(e) => handleChange('lastInstallmentDate', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm p-2 border border-gray-200"
              />
            </div>
          </div>
        </div>

        {/* 2.3 อัตราค่าตอบแทน */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">อัตราค่าตอบแทนการจัดหาลูกค้า (Origination Fee Rate) %</label>
            <input
              type="text"
              value={data.originationFeeRate}
              onChange={(e) => handleChange('originationFeeRate', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm p-2 border border-gray-200"
              placeholder="2.25"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">อัตราค่าตอบแทนการบริหารจัดการ (Service Fee Rate) %</label>
            <input
              type="text"
              value={data.serviceFeeRate}
              onChange={(e) => handleChange('serviceFeeRate', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm p-2 border border-gray-200"
              placeholder="0.90"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

