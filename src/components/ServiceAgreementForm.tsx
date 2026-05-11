import { useEffect, useRef } from 'react';
import type { ServiceAgreementData, AppData } from '../types/app';
import { CONTRACT_TYPE_LABELS } from '../types/app';

interface Props {
  data: ServiceAgreementData;
  appData: AppData;
  onChange: (data: ServiceAgreementData) => void;
  onFocusSection?: (sectionId: string) => void;
}

export default function ServiceAgreementForm({ data, appData, onChange, onFocusSection }: Props) {
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

  // Reactive Calculation for Fees
  const proportion2 = appData.jointVentureData?.proportion2 || 0;
  const origRate = parseFloat(data.originationFeeRate) || 0;
  const svcRate = parseFloat(data.serviceFeeRate) || 0;

  useEffect(() => {
    let hasChanged = false;
    const newOrigAmounts = { ...data.agreementInstallmentAmounts };
    const newSvcAmounts = { ...data.agreementServiceFeeAmounts };

    // 1. Calculate Individual Installments
    data.selectedAgreementIds.forEach(id => {
      const agreement = appData.agreements.find(a => a.id === id);
      if (!agreement) return;

      let principal = 0;
      if (agreement.type === 'hirePurchase' || agreement.type === 'hirePurchaseBack') {
        principal = parseFloat(agreement.data.remainingAmount?.replace(/,/g, '')) || 0;
      } else if (agreement.type === 'loan' || agreement.type === 'od') {
        principal = (parseFloat(agreement.data.loanAmount?.replace(/,/g, '')) || 0) * 1.07;
      }

      const origPeriods = data.agreementOriginationFeePeriods?.[id] || 0;
      const svcPeriods = data.agreementServiceFeePeriods?.[id] || 0;

      const basetotalOrig = principal * (proportion2 / 100) * (origRate / 100);
      const exactTotalSvc = principal * (proportion2 / 100) * (svcRate / 100) * (svcPeriods / 12);

      const calculatedOrig = origPeriods > 0 ? (basetotalOrig / origPeriods).toFixed(2) : '0.00';
      const calculatedSvc = svcPeriods > 0 ? (exactTotalSvc / svcPeriods).toFixed(2) : '0.00';

      const currentOrig = parseFloat((newOrigAmounts[id] || '0').replace(/,/g, '')) || 0;
      const currentSvc = parseFloat((newSvcAmounts[id] || '0').replace(/,/g, '')) || 0;

      if (Math.abs(currentOrig - parseFloat(calculatedOrig)) > 0.001) {
        newOrigAmounts[id] = parseFloat(calculatedOrig).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        hasChanged = true;
      }
      if (Math.abs(currentSvc - parseFloat(calculatedSvc)) > 0.001) {
        newSvcAmounts[id] = parseFloat(calculatedSvc).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        hasChanged = true;
      }
    });

    // 2. Calculate Totals
    let origTotal = 0;
    let svcTotal = 0;
    data.selectedAgreementIds.forEach(id => {
      const agreement = appData.agreements.find(a => a.id === id);
      if (!agreement) return;

      let principal = 0;
      if (agreement.type === 'hirePurchase' || agreement.type === 'hirePurchaseBack') {
        principal = parseFloat(agreement.data.remainingAmount?.replace(/,/g, '')) || 0;
      } else if (agreement.type === 'loan' || agreement.type === 'od') {
        principal = (parseFloat(agreement.data.loanAmount?.replace(/,/g, '')) || 0) * 1.07;
      }

      const svcPeriods = data.agreementServiceFeePeriods?.[id] || 0;

      // Exact total for THIS agreement
      const basetotalOrig = principal * (proportion2 / 100) * (origRate / 100);
      const exactTotalSvc = principal * (proportion2 / 100) * (svcRate / 100) * (svcPeriods / 12);

      // Round to 2 decimal places (standard rounding)
      origTotal += Math.round(basetotalOrig * 100) / 100;
      svcTotal += Math.round(exactTotalSvc * 100) / 100;
    });

    const origTotalStr = origTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const svcTotalStr = svcTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const currentTotalOrig = parseFloat((data.originationFeeTotal || '0').replace(/,/g, '')) || 0;
    const currentTotalSvc = parseFloat((data.serviceFeeTotal || '0').replace(/,/g, '')) || 0;

    if (Math.abs(currentTotalOrig - origTotal) > 0.01 || Math.abs(currentTotalSvc - svcTotal) > 0.01) {
      hasChanged = true;
    }

    // 3. Calculate Global Dates
    const allFirstDates = [
      ...Object.values(data.agreementFirstDates || {}),
      ...Object.values(data.agreementServiceFeeFirstDates || {})
    ].filter(Boolean);

    let calculatedFirstDate = data.firstInstallmentDate;
    if (allFirstDates.length > 0) {
      calculatedFirstDate = allFirstDates.reduce((min, d) => d < min ? d : min);
    }

    const addMonths = (dateStr: string, months: number) => {
      if (!dateStr || months <= 0) return null;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      // If we want Last Date = First Date + (N-1) months, we use months-1
      // But user said "งวดแรก + จำนวนงวด", so we follow that literally or adjust if needed.
      // Usually, if there are 6 installments starting 2026-04-28:
      // 1: 04-28, 2: 05-28, 3: 06-28, 4: 07-28, 5: 08-28, 6: 09-28
      // That is First Date + 5 months.
      // Let's use months - 1 to be more standard for "Last Installment Date".
      date.setMonth(date.getMonth() + (months - 1));
      return date.toISOString().split('T')[0];
    };

    const allLastDates: string[] = [];
    data.selectedAgreementIds.forEach(id => {
      const oriDate = data.agreementFirstDates?.[id];
      const oriPeriods = data.agreementOriginationFeePeriods?.[id] || 0;
      if (oriDate && oriPeriods > 0) {
        const last = addMonths(oriDate, oriPeriods);
        if (last) allLastDates.push(last);
      }

      const svcDate = data.agreementServiceFeeFirstDates?.[id];
      const svcPeriods = data.agreementServiceFeePeriods?.[id] || 0;
      if (svcDate && svcPeriods > 0) {
        const last = addMonths(svcDate, svcPeriods);
        if (last) allLastDates.push(last);
      }
    });

    let calculatedLastDate = data.lastInstallmentDate;
    if (allLastDates.length > 0) {
      calculatedLastDate = allLastDates.reduce((max, d) => d > max ? d : max);
    }

    if (calculatedFirstDate !== data.firstInstallmentDate || calculatedLastDate !== data.lastInstallmentDate) {
      hasChanged = true;
    }

    if (hasChanged) {
      onChange({
        ...data,
        agreementInstallmentAmounts: newOrigAmounts,
        agreementServiceFeeAmounts: newSvcAmounts,
        originationFeeTotal: origTotalStr,
        serviceFeeTotal: svcTotalStr,
        firstInstallmentDate: calculatedFirstDate,
        lastInstallmentDate: calculatedLastDate
      });
    }
  }, [
    data.selectedAgreementIds,
    data.originationFeeRate,
    data.serviceFeeRate,
    data.agreementOriginationFeePeriods,
    data.agreementServiceFeePeriods,
    data.agreementFirstDates,
    data.agreementServiceFeeFirstDates,
    data.firstInstallmentDate,
    data.lastInstallmentDate,
    appData.agreements,
    proportion2,
    onChange
  ]);

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
        <div className="grid grid-cols-2 gap-4" onFocusCapture={() => onFocusSection?.('sa-general')}>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">เลขที่สัญญา</label>
            <input
              type="text"
              value={data.contractNo}
              onChange={(e) => handleChange('contractNo', e.target.value)}
              className="block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm p-2 border h-[38px]"
              placeholder="AGA/XX-SVC2025"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">วันที่ทำสัญญา</label>
            <input
              type="date"
              value={data.contractDate}
              onChange={(e) => handleChange('contractDate', e.target.value)}
              className="block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm p-2 border h-[38px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">เลือกสัญญาที่เกี่ยวข้อง และระบุวันชำระงวดแรก</label>
          <div className="space-y-4 border border-gray-200 rounded-lg p-6 bg-gray-50/50 font-sans">
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
                    <div className="pl-8 grid grid-cols-2 gap-x-12 gap-y-8 pt-4 pb-4">
                      {/* Column 1: Origination Fee */}
                      <div className="space-y-4" onFocusCapture={() => onFocusSection?.('sa-general')}>
                        <div className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-sm border border-teal-100">1. Origination Fee</div>

                        {/* Rate % */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">อัตราค่าตอบแทน (Rate) %</label>
                          <input
                            type="text"
                            value={data.originationFeeRate}
                            onChange={(e) => handleChange('originationFeeRate', e.target.value)}
                            className="block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm p-2 border bg-white h-[38px]"
                          />
                        </div>

                        {/* Periods */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">จำนวนงวด</label>
                          <input
                            type="text"
                            value={data.agreementOriginationFeePeriods?.[agreement.id] || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, ''); // Allow only digits
                              const newPeriods = { ...data.agreementOriginationFeePeriods, [agreement.id]: parseInt(value) || 0 };
                              handleChange('agreementOriginationFeePeriods', newPeriods);
                            }}
                            placeholder="0"
                            className="block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm p-2 border bg-white h-[38px]"
                          />
                        </div>

                        {/* First Date */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">วันที่งวดแรก</label>
                          <input
                            type="date"
                            value={data.agreementFirstDates?.[agreement.id] || ''}
                            onChange={(e) => {
                              const newDates = { ...data.agreementFirstDates, [agreement.id]: e.target.value };
                              handleChange('agreementFirstDates', newDates);
                            }}
                            className="block w-full rounded-md border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm p-2 border h-[38px]"
                          />
                        </div>

                        {/* Installment Amount Cal */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ชำระงวดละ (คำนวณ)</label>
                          <input
                            type="text"
                            value={data.agreementInstallmentAmounts?.[agreement.id] || ''}
                            readOnly
                            className="block w-full rounded-md border-gray-100 shadow-sm text-sm p-2 border bg-gray-100 text-gray-400 cursor-not-allowed h-[38px]"
                          />
                        </div>

                        {/* Sub-totals breakdown */}
                        <div className="mt-4 text-xs space-y-2 bg-white p-4 rounded-lg border border-teal-50 shadow-sm">
                          <div className="flex justify-between pb-1.5 font-bold text-teal-800">
                            <span>ราคารวมทั้งหมด (รวม VAT)</span>
                            <span>{(() => {
                              const principal = (agreement.type === 'hirePurchase' || agreement.type === 'hirePurchaseBack')
                                ? parseFloat(agreement.data.remainingAmount?.replace(/,/g, '')) || 0
                                : (parseFloat(agreement.data.loanAmount?.replace(/,/g, '')) || 0) * 1.07;
                              const total = principal * (proportion2 / 100) * (parseFloat(data.originationFeeRate) / 100);
                              return total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            })()}</span>
                          </div>
                          <div className="flex justify-between text-gray-400 text-[11px] pt-1 border-t border-teal-50">
                            <span>ราคาบริการ</span>
                            <span>{(() => {
                              const principal = (agreement.type === 'hirePurchase' || agreement.type === 'hirePurchaseBack')
                                ? parseFloat(agreement.data.remainingAmount?.replace(/,/g, '')) || 0
                                : (parseFloat(agreement.data.loanAmount?.replace(/,/g, '')) || 0) * 1.07;
                              const total = principal * (proportion2 / 100) * (parseFloat(data.originationFeeRate) / 100);
                              return (total / 1.07).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            })()}</span>
                          </div>
                          <div className="flex justify-between text-gray-400 text-[11px]">
                            <span>ภาษีมูลค่าเพิ่ม</span>
                            <span>{(() => {
                              const principal = (agreement.type === 'hirePurchase' || agreement.type === 'hirePurchaseBack')
                                ? parseFloat(agreement.data.remainingAmount?.replace(/,/g, '')) || 0
                                : (parseFloat(agreement.data.loanAmount?.replace(/,/g, '')) || 0) * 1.07;
                              const total = principal * (proportion2 / 100) * (parseFloat(data.originationFeeRate) / 100);
                              return (total - total / 1.07).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            })()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Service Fee */}
                      <div className="space-y-4" onFocusCapture={() => onFocusSection?.('sa-annex-2-service')}>
                        <div className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-sm border border-amber-100">2. Service Fee</div>

                        {/* Rate % */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">อัตราค่าตอบแทน (Rate) %</label>
                          <input
                            type="text"
                            value={data.serviceFeeRate}
                            onChange={(e) => handleChange('serviceFeeRate', e.target.value)}
                            className="block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white h-[38px]"
                          />
                        </div>

                        {/* Periods */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">จำนวนงวด</label>
                          <input
                            type="text"
                            value={data.agreementServiceFeePeriods?.[agreement.id] || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, ''); // Allow only digits
                              const newPeriods = { ...data.agreementServiceFeePeriods, [agreement.id]: parseInt(value) || 0 };
                              handleChange('agreementServiceFeePeriods', newPeriods);
                            }}
                            placeholder="0"
                            className="block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white h-[38px]"
                          />
                        </div>

                        {/* First Date */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">วันที่งวดแรก</label>
                          <input
                            type="date"
                            value={data.agreementServiceFeeFirstDates?.[agreement.id] || ''}
                            onChange={(e) => {
                              const newDates = { ...data.agreementServiceFeeFirstDates, [agreement.id]: e.target.value };
                              handleChange('agreementServiceFeeFirstDates', newDates);
                            }}
                            className="block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border h-[38px]"
                          />
                        </div>

                        {/* Installment Amount Cal */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ค่างวด (คำนวณ)</label>
                          <input
                            type="text"
                            value={data.agreementServiceFeeAmounts?.[agreement.id] || ''}
                            readOnly
                            className="block w-full rounded-md border-gray-100 shadow-sm text-sm p-2 border bg-gray-100 text-gray-400 cursor-not-allowed h-[38px]"
                          />
                        </div>

                        {/* Sub-totals breakdown */}
                        <div className="mt-4 text-xs space-y-2 bg-white p-4 rounded-lg border border-amber-50 shadow-sm">
                          <div className="flex justify-between pb-1.5 font-bold text-amber-800">
                            <span>ราคารวมทั้งหมด (รวม VAT)</span>
                            <span>{(() => {
                              const principal = (agreement.type === 'hirePurchase' || agreement.type === 'hirePurchaseBack')
                                ? parseFloat(agreement.data.remainingAmount?.replace(/,/g, '')) || 0
                                : (parseFloat(agreement.data.loanAmount?.replace(/,/g, '')) || 0) * 1.07;
                              const periods = data.agreementServiceFeePeriods?.[agreement.id] || 0;
                              const total = principal * (proportion2 / 100) * (parseFloat(data.serviceFeeRate) / 100) * (periods / 12);
                              return total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            })()}</span>
                          </div>
                          <div className="flex justify-between text-gray-400 text-[11px] pt-1 border-t border-amber-50">
                            <span>ราคาบริการ</span>
                            <span>{(() => {
                              const principal = (agreement.type === 'hirePurchase' || agreement.type === 'hirePurchaseBack')
                                ? parseFloat(agreement.data.remainingAmount?.replace(/,/g, '')) || 0
                                : (parseFloat(agreement.data.loanAmount?.replace(/,/g, '')) || 0) * 1.07;
                              const periods = data.agreementServiceFeePeriods?.[agreement.id] || 0;
                              const total = principal * (proportion2 / 100) * (parseFloat(data.serviceFeeRate) / 100) * (periods / 12);
                              return (total / 1.07).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            })()}</span>
                          </div>
                          <div className="flex justify-between text-gray-400 text-[11px]">
                            <span>ภาษีมูลค่าเพิ่ม</span>
                            <span>{(() => {
                              const principal = (agreement.type === 'hirePurchase' || agreement.type === 'hirePurchaseBack')
                                ? parseFloat(agreement.data.remainingAmount?.replace(/,/g, '')) || 0
                                : (parseFloat(agreement.data.loanAmount?.replace(/,/g, '')) || 0) * 1.07;
                              const periods = data.agreementServiceFeePeriods?.[agreement.id] || 0;
                              const total = principal * (proportion2 / 100) * (parseFloat(data.serviceFeeRate) / 100) * (periods / 12);
                              return (total - total / 1.07).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            })()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2.4 Grand Summary (Read Only) */}
        <div className="grid grid-cols-2 gap-6 pt-2 border-t border-gray-100">
          <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
            <span className="text-xs font-bold text-teal-800 uppercase block mb-2 underline">สรุปค่า Origination Fee รวม</span>
            <div className="flex justify-between text-sm font-bold">
              <span>ราคารวมทั้งหมด:</span>
              <span className="text-teal-700">{data.originationFeeTotal}</span>
            </div>
            <div className="flex justify-between text-[11px] text-gray-500 mt-1">
              <span>ราคาบริการ: {originationFees.price}</span>
              <span>VAT: {originationFees.vat}</span>
            </div>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
            <span className="text-xs font-bold text-amber-800 uppercase block mb-2 underline">สรุปค่า Service Fee รวม</span>
            <div className="flex justify-between text-sm font-bold">
              <span>ราคารวมทั้งหมด:</span>
              <span className="text-amber-700">{data.serviceFeeTotal}</span>
            </div>
            <div className="flex justify-between text-[11px] text-gray-500 mt-1">
              <span>ราคาบริการ: {serviceFees.price}</span>
              <span>VAT: {serviceFees.vat}</span>
            </div>
          </div>
        </div>

        {/* 2.4 รายละเอียดการชำระเงิน */}
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-bold text-gray-700 mb-3" onFocusCapture={() => onFocusSection?.('sa-clause-3')}>2.4 รายละเอียดการชำระเงิน</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">งวดแรก</label>
              <input
                type="date"
                value={data.firstInstallmentDate}
                readOnly
                className="block w-full rounded-md border-gray-100 shadow-sm text-sm p-2 border bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">งวดสุดท้าย</label>
              <input
                type="date"
                value={data.lastInstallmentDate}
                readOnly
                className="block w-full rounded-md border-gray-100 shadow-sm text-sm p-2 border bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

