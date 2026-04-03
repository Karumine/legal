import { useEffect, useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, FileText, Plus, Trash2 } from 'lucide-react';

import ThaiAddressInput from './ThaiAddressInput';
import { TODAY } from '../types/app';
import type { HirePurchaseData, LessorInfo, AssetDetail, ContractType, CompanyInfo, BuybackData } from '../types/app';
import { thaiBahtText } from '../utils/thaiBahtText';
import { formatCurrency } from '../utils/formatters';
import BuybackForm from './BuybackForm';
import ThaiLocationSelector from './ThaiLocationSelector';

interface Props {
  data: HirePurchaseData;
  onChange: (data: HirePurchaseData) => void;
  type?: ContractType;
  customerInfo?: CompanyInfo;
  onFocusSection?: (sectionId: string, containerId?: string) => void;
  onBuybackToggled?: (buybackId: string) => void;
}

export default function HirePurchaseForm({ data, onChange, customerInfo, type = 'hirePurchase', onFocusSection, onBuybackToggled }: Props) {
  const [showBuyback, setShowBuyback] = useState(true);

  const handleChange = (field: keyof HirePurchaseData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  // Auto-sync contract number and date to buyback if enabled
  useEffect(() => {
    if (data.hasBuyback && data.buybacks) {
      const updatedBuybacks = data.buybacks.map(bb => ({
        ...bb,
        contractNo: `${data.contractNo || ''}-BB`,
        contractDate: data.contractDate || TODAY
      }));

      const hasChanged = JSON.stringify(updatedBuybacks) !== JSON.stringify(data.buybacks);
      if (hasChanged) {
        handleChange('buybacks', updatedBuybacks);
      }
    }
  }, [data.contractNo, data.contractDate, data.hasBuyback]);

  const addBuyback = () => {
    const newId = `bb-${Date.now()}`;
    const newBuyback: BuybackData = {
      id: newId,
      contractNo: `${data.contractNo}-BB`,
      contractDate: TODAY,
      conditions: '',
      vendorName: '',
      vendorDirectors: '',
      vendorAddress: '',
      vendorTaxId: '',
      selectedAssetIds: [],
      downPercentage: '20',
      buybackMode: 'all',
      buybackTable: [
        { year: 1, newRate: '50', usedRate: '50' },
        { year: 2, newRate: '45', usedRate: '40' },
        { year: 3, newRate: '40', usedRate: '30' },
        { year: 4, newRate: '30', usedRate: '20' },
        { year: 5, newRate: '20', usedRate: 'น้อยกว่า 20' },
      ]
    };
    handleChange('buybacks', [...(data.buybacks || []), newBuyback]);
    if (!data.hasBuyback) handleChange('hasBuyback', true);
    if (onBuybackToggled) {
      onBuybackToggled(newBuyback.id);
    }
  };

  const toggleBuyback = (enabled: boolean) => {
    if (enabled) {
      if (!data.buybacks || data.buybacks.length === 0) {
        addBuyback();
      } else if (onBuybackToggled) {
        onBuybackToggled(data.buybacks[0].id);
      }
    }
    handleChange('hasBuyback', enabled);
  };

  // Auto-calculations
  useEffect(() => {
    const totalPrice = data.assets?.reduce((sum, asset) => {
      const amt = parseFloat(asset.totalAmount.replace(/,/g, '')) || 0;
      return sum + amt;
    }, 0) || 0;

    const percentage = parseFloat(data.downPaymentPercentage) || 0;
    const calculatedDownPayment = Math.floor(totalPrice * (percentage / 100));
    const calculatedRemaining = totalPrice - calculatedDownPayment;

    const formattedDownPayment = calculatedDownPayment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const formattedRemaining = calculatedRemaining.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const formattedTotal = totalPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    let updates: Partial<HirePurchaseData> = {};

    if (totalPrice > 0) {
      if (formattedTotal !== data.totalAmount) {
        updates.totalAmount = formattedTotal;
      }
      if (formattedDownPayment !== data.downPayment) {
        updates.downPayment = formattedDownPayment;
      }
      if (formattedRemaining !== data.remainingAmount) {
        updates.remainingAmount = formattedRemaining;
      }

      // Calculate Installment Amount (ค่างวด) based on new requirements
      // Step 1: Principal after down payment (remainingAmount) -> Remove VAT 7%
      const pExVat = calculatedRemaining / 1.07;

      // Step 2: Principal per Installment
      const numInstallments = parseInt(data.installments) || 48;
      const principalPerMonth = pExVat / numInstallments;

      // Step 3: Interest per Installment
      const interestRate = parseFloat(data.interestRate) || 0;
      const interestPerMonth = (pExVat * (interestRate / 100)) / 12;

      // Step 4: Final Installment (Include VAT 7%)
      const monthlyExVat = principalPerMonth + interestPerMonth;
      const finalMonthlyAmount = monthlyExVat * 1.07;

      const formattedInstallment = finalMonthlyAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      if (formattedInstallment !== data.installmentAmount) {
        updates.installmentAmount = formattedInstallment;
      }
    }


    // Date calculations
    if (data.firstInstallmentDate && data.installments) {
      let firstDate = new Date(data.firstInstallmentDate);
      if (data.firstInstallmentDate.includes('/')) {
        const parts = data.firstInstallmentDate.split('/');
        if (parts.length === 3) {
          let year = parseInt(parts[2]);
          if (year > 2500) year -= 543;
          firstDate = new Date(year, parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
      }

      if (!isNaN(firstDate.getTime())) {
        // Update payment day if not set or different
        const day = firstDate.getDate().toString();
        if (data.paymentDay !== day) {
          updates.paymentDay = day;
        }

        // Calculate last installment date
        const numMonths = parseInt(data.installments) || 0;
        if (numMonths > 0) {
          const lastDate = new Date(firstDate);
          lastDate.setMonth(lastDate.getMonth() + (numMonths - 1));

          let lastFormattedStr = '';
          if (data.firstInstallmentDate.includes('/')) {
            const y = lastDate.getFullYear() + 543;
            const m = String(lastDate.getMonth() + 1).padStart(2, '0');
            const d = String(lastDate.getDate()).padStart(2, '0');
            lastFormattedStr = `${d}/${m}/${y}`;
          } else {
            lastFormattedStr = lastDate.toISOString().split('T')[0];
          }

          if (data.lastInstallmentDate !== lastFormattedStr) {
            updates.lastInstallmentDate = lastFormattedStr;
          }
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      onChange({ ...data, ...updates });
    }
  }, [
    data.assets,
    data.downPaymentPercentage,
    data.firstInstallmentDate,
    data.installments,
    data.interestRate,
  ]);

  // Auto-fill installation location from customer address if empty
  useEffect(() => {
    if (customerInfo?.address && !data.installationLocation) {
      handleChange('installationLocation', customerInfo.address);
    }
  }, [customerInfo?.address, data.installationLocation]);

  const handleLessorChange = (lessor: 'lessor1' | 'lessor2', field: keyof LessorInfo, value: string) => {
    onChange({
      ...data,
      [lessor]: { ...data[lessor], [field]: value }
    });
  };

  const updateAsset = (index: number, field: keyof AssetDetail, value: string) => {
    const newAssets = [...data.assets];
    newAssets[index] = { ...newAssets[index], [field]: value };
    handleChange('assets', newAssets);
  };

  const addAsset = () => {
    handleChange('assets', [...data.assets, { id: crypto.randomUUID(), name: '', description: '', quantity: '1', unit: '', unitPrice: '', totalAmount: '' }]);
  };

  const removeAsset = (index: number) => {
    handleChange('assets', data.assets.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 pb-20">
      {/* General Info */}
      <section className="bg-white p-4 rounded-lg shadow-sm border border-blue-200" onFocusCapture={() => onFocusSection?.('hp-general')}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <h3 className="font-semibold text-lg text-blue-700">ข้อมูลทั่วไป</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">เลขที่สัญญา</label>
            <input
              type="text"
              value={data.contractNo}
              onChange={(e) => handleChange('contractNo', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
              placeholder="AGA/81-LA2026"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">วันที่ทำสัญญา</label>
            <input
              type="date"
              value={data.contractDate}
              onChange={(e) => handleChange('contractDate', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
            />
          </div>

        </div>
      </section>


      {/* Lessors */}
      <div className="grid grid-cols-1 gap-4">
        {[
          { key: 'lessor1', label: 'ผู้ให้เช่าซื้อ ฝ่ายที่ 1' },
          { key: 'lessor2', label: 'ผู้ให้เช่าซื้อ ฝ่ายที่ 2' }
        ].map(l => (
          <section key={l.key} className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
            <h3 className="font-semibold text-md text-blue-700 mb-3">{l.label}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อบริษัท (ดึงข้อมูลอัตโนมัติ)</label>
                <input
                  type="text"
                  value={(data as any)[l.key].name}
                  readOnly
                  className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">เลขทะเบียน (ดึงอัตโนมัติ)</label>
                  <input
                    type="text"
                    value={(data as any)[l.key].taxId}
                    readOnly
                    className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-600 mb-1 font-bold">สัดส่วน (%) *แก้ไขได้*</label>
                  <input
                    type="text"
                    value={(data as any)[l.key].proportion}
                    onChange={(e) => handleLessorChange(l.key as any, 'proportion', e.target.value)}
                    className="block w-full rounded-md border-blue-300 shadow-sm text-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ที่อยู่จดทะเบียน (ดึงอัตโนมัติ)</label>
                <textarea
                  value={(data as any)[l.key].address}
                  readOnly
                  className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border bg-gray-50 text-gray-500 cursor-not-allowed h-16"
                />
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Assets */}
      <section className="bg-white p-4 rounded-lg shadow-sm border border-blue-200" onFocusCapture={() => onFocusSection?.('hp-assets')}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg text-blue-700">รายการทรัพย์สิน</h3>
          <button onClick={addAsset} className="bg-blue-600 text-white px-3 py-1 rounded text-xs">+ เพิ่มรายการ</button>
        </div>
        <div className="space-y-4">
          {data.assets.map((asset, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded relative space-y-4 bg-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-blue-600 font-bold">รายการที่ {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeAsset(index)}
                  className="text-red-500 hover:text-red-700 text-sm font-bold bg-red-50 px-2 py-1 rounded"
                >
                  ลบรายการนี้
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อทรัพย์สิน</label>
                  <input
                    type="text"
                    placeholder="เช่น เครื่องเป่าขวดพลาสติก"
                    value={asset.name}
                    onChange={(e) => updateAsset(index, 'name', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">รายละเอียด/รุ่น</label>
                  <textarea
                    placeholder="คำบรรยายทรัพย์สิน (แสดงในสัญญา)"
                    value={asset.description}
                    onChange={(e) => updateAsset(index, 'description', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded min-h-[80px] bg-white shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">จำนวน</label>
                  <input
                    type="text"
                    placeholder="เช่น 1"
                    value={asset.quantity}
                    onChange={(e) => updateAsset(index, 'quantity', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">หน่วย</label>
                  <input
                    type="text"
                    placeholder="เช่น ชุด, เครื่อง"
                    value={asset.unit}
                    onChange={(e) => updateAsset(index, 'unit', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ราคารวม (บาท)</label>
                  <input
                    type="text"
                    placeholder="ใส่ตัวเลขเท่านั้น"
                    value={asset.totalAmount}
                    onChange={(e) => {
                      const formatted = formatCurrency(e.target.value);
                      updateAsset(index, 'totalAmount', formatted);
                    }}
                    className="w-full p-2 border border-gray-300 rounded bg-white shadow-sm font-semibold text-blue-700"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Purpose and Location */}
      <section className="bg-white p-4 rounded-lg shadow-sm border border-blue-200" onFocusCapture={() => onFocusSection?.('hp-purpose')}>
        <h3 className="font-semibold text-lg text-blue-700 mb-3">วัตถุประสงค์และสถานที่ตั้ง</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">วัตถุประสงค์ในการเช่าซื้อ (ข้อ 2.2)</label>
            <textarea
              value={data.businessPurpose}
              onChange={(e) => handleChange('businessPurpose', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border h-20"
              placeholder="โรงงานผลิตและจำหน่ายน้ำดื่ม..."
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-gray-600">สถานที่ตั้งทรัพย์สิน (ข้อ 2.2)</label>
              {customerInfo?.address && data.installationLocation !== customerInfo.address && (
                <button
                  type="button"
                  onClick={() => handleChange('installationLocation', customerInfo.address)}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-100 transition-colors"
                >
                  ดึงจากที่อยู่ฝ่าย 3
                </button>
              )}
            </div>
            <ThaiAddressInput
              value={data.installationLocation}
              onChange={(val) => handleChange('installationLocation', val)}
            />
          </div>
        </div>
      </section>

      {/* Financials & Clauses (Sections 3.2 - 4.4) */}
      <section className="bg-white p-4 rounded-lg shadow-sm border border-blue-200" onFocusCapture={() => onFocusSection?.('hp-financials')}>
        <h3 className="font-semibold text-lg text-blue-700 mb-3">เงื่อนไขการเงินและข้อสัญญา (ข้อ 3.2 - 4.4)</h3>

        <div className="space-y-6">
          <div className="p-4 border border-blue-100 rounded-md bg-blue-50/20 space-y-6">
            {/* 3.1 ราคาทรัพย์สิน */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-600 mb-1">ราคารวม (บาท) [คำนวณจากรายการทรัพย์สินรวมกัน]</label>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={data.totalAmount}
                    readOnly
                    className="block w-48 rounded-md border-gray-300 shadow-sm text-sm p-2 border bg-gray-100 text-gray-400 font-bold cursor-not-allowed"
                  />
                  <div className="text-blue-600 text-xs font-medium">({thaiBahtText(data.totalAmount)})</div>
                </div>
              </div>
            </div>

            {/* 3.2 (ก) เงินดาวน์ */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-100">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {type === 'hirePurchaseBack' ? 'เงินดาวน์ (%) ที่หักจากยอดจัดเช่าซื้อ' : 'เงินดาวน์ (%)'}
                </label>
                <input
                  type="text"
                  value={data.downPaymentPercentage || ''}
                  onChange={(e) => handleChange('downPaymentPercentage', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border"
                />
              </div>
              {type !== 'hirePurchaseBack' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">เงินดาวน์ (บาท) [คำนวณจากยอดรวม x %]</label>
                  <input
                    type="text"
                    value={data.downPayment}
                    readOnly
                    className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border bg-gray-100 text-gray-400 cursor-not-allowed"
                  />
                </div>
              )}
            </div>

            {/* 3.2 (ข) & (ค) ยอดจัด ดอกเบี้ย และงวด */}
            <div className="space-y-4 pt-2 border-t border-blue-100">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ยอดจัดสะสม/เงินต้น (บาท)</label>
                  <input type="text" value={data.remainingAmount} readOnly className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border bg-gray-100 text-gray-400 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ประเภทดอกเบี้ย</label>
                  <select
                    value={data.interestType}
                    onChange={(e) => handleChange('interestType', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border"
                  >
                    <option value="แบบคงที่">แบบคงที่ (Flat Rate)</option>
                    <option value="แบบลดต้นลดดอก">แบบลดต้นลดดอก (Effective Rate)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">อัตราดอกเบี้ย (%)</label>
                  <input type="text" value={data.interestRate} onChange={(e) => handleChange('interestRate', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border" />
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">เริ่มชำระงวดแรก</label>
                  <input type="date" value={data.firstInstallmentDate || ''} onChange={(e) => handleChange('firstInstallmentDate', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ชำระทุกวันที่ [ดึงจากงวดแรก]</label>
                  <input type="text" value={data.paymentDay || ''} onChange={(e) => handleChange('paymentDay', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">สิ้นสุดงวดสุดท้าย [คำนวณอัตโนมัติ]</label>
                  <input type="date" value={data.lastInstallmentDate || ''} onChange={(e) => handleChange('lastInstallmentDate', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border" />
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">จำนวนงวด (เดือน)</label>
                  <input
                    type="text"
                    value={data.installments}
                    onChange={(e) => handleChange('installments', e.target.value.replace(/\D/g, ''))}
                    className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ค่างวด/เดือน (บาท)</label>
                  <input
                    type="text"
                    value={data.installmentAmount}
                    readOnly
                    className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border bg-gray-100 text-gray-400 font-bold cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Other Financial Info */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-blue-100">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ค่าอากรแสตมป์ (บาท)</label>
                <input
                  type="text"
                  value={data.stampDuty || ''}
                  onChange={(e) => handleChange('stampDuty', formatCurrency(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ค่าเบี้ยประกันภัย (บาท)</label>
                <input
                  type="text"
                  value={data.insurancePremium || ''}
                  onChange={(e) => handleChange('insurancePremium', formatCurrency(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border"
                />
              </div>
              <div className="col-span-2 lg:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">เช็คต่อค่างวด (ขัอ 4.1)</label>
                <input type="text" value={data.chequesPerInstallment || ''} onChange={(e) => handleChange('chequesPerInstallment', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border" />
              </div>
            </div>
          </div>

          {type !== 'hirePurchaseBack' && (
            <div className="space-y-3 mt-4 border-t pt-4">
              <div className="flex items-center gap-4 mb-2">
                <h4 className="font-semibold text-sm text-gray-700">ข้อความไฮไลท์เขียว</h4>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1 text-sm font-medium">
                    <input
                      type="radio"
                      name="hasCustomGreenText"
                      checked={data.hasCustomGreenText !== false}
                      onChange={() => handleChange('hasCustomGreenText', true)}
                    />
                    มี
                  </label>
                  <label className="flex items-center gap-1 text-sm font-medium">
                    <input
                      type="radio"
                      name="hasCustomGreenText"
                      checked={data.hasCustomGreenText === false}
                      onChange={() => {
                        handleChange('hasCustomGreenText', false);
                      }}
                    />
                    ไม่มี
                  </label>
                </div>
              </div>
              {data.hasCustomGreenText !== false && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ข้อความเพิ่มเติมการจ่ายเงิน (ไฮไลท์สีเขียว)</label>
                  <textarea value={data.customGreenText || ''} onChange={(e) => handleChange('customGreenText', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border h-20" />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Collateral Section */}
      <section className="bg-white p-4 rounded-lg shadow-sm border border-blue-200" onFocusCapture={() => onFocusSection?.('hp-collateral')}>
        <h3 className="font-semibold text-lg text-blue-700 mb-3">6. หลักประกัน</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">มูลค่ารวมหลักประกัน (6.1) (บาท)</label>
            <input
              type="text"
              value={data.collateralValue || ''}
              onChange={(e) => handleChange('collateralValue', formatCurrency(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border"
            />
          </div>



          <div className="border-t pt-4">
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600">ทรัพย์สินหลักประกัน (6.3)</label>
            </div>
            <div className="space-y-4">
              {(data.collateralAssets || []).map((asset, idx) => (
                <div key={idx} className="p-3 border rounded-md bg-gray-50 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => {
                      const newAssets = data.collateralAssets.filter((_, i) => i !== idx);
                      handleChange('collateralAssets', newAssets);
                    }}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                  <div className="grid grid-cols-2 gap-4 mr-6">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">ประเภท</label>
                      <select
                        value={asset.type}
                        onChange={(e) => {
                          const newType = e.target.value as any;
                          const newAssets = [...data.collateralAssets];
                          newAssets[idx] = { ...newAssets[idx], type: newType };
                           if (newType === 'land' && !newAssets[idx].landDetails) {
                             newAssets[idx].landDetails = { deedNo: '', volume: '', page: '', mapSheet: '', landNo: '', surveyNo: '', subDistrict: '', district: '', province: '', owner: customerInfo?.companyName || '' };
                           }
                           if (newType === 'carPledge' && !newAssets[idx].carPledgeDetails) {
                             newAssets[idx].carPledgeDetails = { brand: '', model: '', plateNo: '', province: '', chassisNo: '', engineNo: '', color: '', owner: customerInfo?.companyName || '' };
                           }
                           if (newType === 'stockPledge' && !newAssets[idx].stockPledgeDetails) {
                             newAssets[idx].stockPledgeDetails = { companyName: '', certificateNo: '', quantity: '', parValue: '', totalValue: '', owner: customerInfo?.companyName || '' };
                           }
                           if (newType === 'machinery' && !newAssets[idx].machineName) {
                             newAssets[idx] = { ...newAssets[idx], machineName: '', machineModel: '', machineQuantity: '1', machineUnit: 'ชุด', machinePrice: '0', machineOwner: customerInfo?.companyName || '' };
                           }
                          handleChange('collateralAssets', newAssets);
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm text-xs p-1 border"
                      >
                        <option value="land">จำนองที่ดิน</option>
                        <option value="cash">เงินสด</option>
                        <option value="machinery">เครื่องจักร</option>
                        <option value="carPledge">จำนำรถ</option>
                        <option value="stockPledge">จำนำหุ้น</option>
                      </select>
                    </div>
                  </div>

                  {asset.type === 'land' && asset.landDetails && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-3 bg-white p-4 rounded-md border border-gray-100 shadow-sm">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 caps">โฉนดเลขที่</label>
                        <input type="text" value={asset.landDetails.deedNo} onChange={(e) => {
                          const newAssets = [...data.collateralAssets];
                          newAssets[idx].landDetails = { ...newAssets[idx].landDetails!, deedNo: e.target.value };
                          handleChange('collateralAssets', newAssets);
                        }} className="block w-full rounded border-gray-300 text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">เล่ม</label>
                        <input type="text" value={asset.landDetails.volume} onChange={(e) => {
                          const newAssets = [...data.collateralAssets];
                          newAssets[idx].landDetails = { ...newAssets[idx].landDetails!, volume: e.target.value };
                          handleChange('collateralAssets', newAssets);
                        }} className="block w-full rounded border-gray-300 text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">หน้า</label>
                        <input type="text" value={asset.landDetails.page} onChange={(e) => {
                          const newAssets = [...data.collateralAssets];
                          newAssets[idx].landDetails = { ...newAssets[idx].landDetails!, page: e.target.value };
                          handleChange('collateralAssets', newAssets);
                        }} className="block w-full rounded border-gray-300 text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">ระวาง</label>
                        <input type="text" value={asset.landDetails.mapSheet} onChange={(e) => {
                          const newAssets = [...data.collateralAssets];
                          newAssets[idx].landDetails = { ...newAssets[idx].landDetails!, mapSheet: e.target.value };
                          handleChange('collateralAssets', newAssets);
                        }} className="block w-full rounded border-gray-300 text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">เลขที่ดิน</label>
                        <input type="text" value={asset.landDetails.landNo} onChange={(e) => {
                          const newAssets = [...data.collateralAssets];
                          newAssets[idx].landDetails = { ...newAssets[idx].landDetails!, landNo: e.target.value };
                          handleChange('collateralAssets', newAssets);
                        }} className="block w-full rounded border-gray-300 text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">หน้าสำรวจ</label>
                        <input type="text" value={asset.landDetails.surveyNo} onChange={(e) => {
                          const newAssets = [...data.collateralAssets];
                          newAssets[idx].landDetails = { ...newAssets[idx].landDetails!, surveyNo: e.target.value };
                          handleChange('collateralAssets', newAssets);
                        }} className="block w-full rounded border-gray-300 text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all" />
                      </div>
                      <div className="col-span-2 mt-2 pt-2 border-t border-gray-100">
                        <ThaiLocationSelector
                          province={asset.landDetails.province}
                          district={asset.landDetails.district}
                          subDistrict={asset.landDetails.subDistrict}
                          onChange={(updates) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].landDetails = {
                              ...newAssets[idx].landDetails!,
                              ...updates as any
                            };
                            handleChange('collateralAssets', newAssets);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">ชื่อเจ้าของ</label>
                        <input type="text" value={asset.landDetails.owner} onChange={(e) => {
                          const newAssets = [...data.collateralAssets];
                          newAssets[idx].landDetails = { ...newAssets[idx].landDetails!, owner: e.target.value };
                          handleChange('collateralAssets', newAssets);
                        }} className="block w-full rounded border-gray-300 text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all" />
                      </div>
                    </div>
                  )}

                  {asset.type === 'machinery' && (
                    <div className="mt-3 bg-white p-4 rounded-md border border-gray-100 shadow-sm space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">ชื่อเจ้าของเครื่องจักร (Owner)</label>
                        <input
                          type="text"
                          value={asset.machineOwner || ''}
                          onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx] = { ...newAssets[idx], machineOwner: e.target.value };
                            handleChange('collateralAssets', newAssets);
                          }}
                          className="block w-full rounded border-gray-300 text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                          placeholder="เช่น ห้างหุ้นส่วนจำกัด พี.เอ็น.พี.เมดิซัพพลาย"
                        />
                      </div>

                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">ชื่อเครื่องจักร (Asset Name)</label>
                          <input
                            type="text"
                            value={asset.machineName || ''}
                            onChange={(e) => {
                              const newAssets = [...data.collateralAssets];
                              newAssets[idx] = { ...newAssets[idx], machineName: e.target.value };
                              handleChange('collateralAssets', newAssets);
                            }}
                            className="block w-full rounded border-gray-300 text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                            placeholder="เช่น เครื่องเป่าขวดพลาสติก PET"
                          />
                        </div>

                        <div className="col-span-12">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">รายละเอียด/รุ่น (Description/Model)</label>
                          <textarea
                            value={asset.machineModel || ''}
                            onChange={(e) => {
                              const newAssets = [...data.collateralAssets];
                              newAssets[idx] = { ...newAssets[idx], machineModel: e.target.value };
                              handleChange('collateralAssets', newAssets);
                            }}
                            className="block w-full rounded border-gray-300 text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all min-h-[80px]"
                            placeholder="ระบุรุ่น สเปค หรือรายละเอียดเพิ่มเติมเพื่อให้ตรงกับสัญญา"
                          />
                        </div>

                        <div className="col-span-4">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">จำนวน</label>
                          <input
                            type="text"
                            value={asset.machineQuantity || ''}
                            onChange={(e) => {
                              const newAssets = [...data.collateralAssets];
                              newAssets[idx] = { ...newAssets[idx], machineQuantity: e.target.value };
                              handleChange('collateralAssets', newAssets);
                            }}
                            className="block w-full rounded border-gray-300 text-md p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all text-left"
                            placeholder="1"
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">หน่วย</label>
                          <input
                            type="text"
                            value={asset.machineUnit || ''}
                            onChange={(e) => {
                              const newAssets = [...data.collateralAssets];
                              newAssets[idx] = { ...newAssets[idx], machineUnit: e.target.value };
                              handleChange('collateralAssets', newAssets);
                            }}
                            className="block w-full rounded border-gray-300 text-md p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all text-left"
                            placeholder="เช่น ชุด"
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">ราคารวม (บาท)</label>
                          <input
                            type="text"
                            value={asset.machinePrice || ''}
                            onChange={(e) => {
                              const formatted = formatCurrency(e.target.value);
                              const newAssets = [...data.collateralAssets];
                              newAssets[idx] = { ...newAssets[idx], machinePrice: formatted };
                              handleChange('collateralAssets', newAssets);
                            }}
                            className="block w-full rounded border-gray-300 text-md p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all text-left font-bold text-blue-600"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {asset.type === 'cash' && (
                    <div>
                      <label className="block text-[10px] text-gray-500">จำนวนเงิน (บาท)</label>
                      <input
                        type="text"
                        value={asset.cashAmount || ''}
                        onChange={(e) => {
                          const formatted = formatCurrency(e.target.value);
                          const newAssets = [...data.collateralAssets];
                          newAssets[idx].cashAmount = formatted;
                          handleChange('collateralAssets', newAssets);
                        }}
                        className="block w-full rounded border-gray-300 text-xs p-1 border"
                      />
                    </div>
                  )}

                  {asset.type === 'carPledge' && (
                    <div className="mt-3 bg-white p-4 rounded-md border border-gray-100 shadow-sm space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">ยี่ห้อ</label>
                          <input type="text" value={asset.carPledgeDetails?.brand || ''} onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].carPledgeDetails = { ...(newAssets[idx].carPledgeDetails || { brand: '', model: '', plateNo: '', province: '', chassisNo: '', engineNo: '', color: '', owner: '' }), brand: e.target.value };
                            handleChange('collateralAssets', newAssets);
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">รุ่น</label>
                          <input type="text" value={asset.carPledgeDetails?.model || ''} onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].carPledgeDetails = { ...(newAssets[idx].carPledgeDetails || { brand: '', model: '', plateNo: '', province: '', chassisNo: '', engineNo: '', color: '', owner: '' }), model: e.target.value };
                            handleChange('collateralAssets', newAssets);
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">ทะเบียนเลขที่</label>
                          <input type="text" value={asset.carPledgeDetails?.plateNo || ''} onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].carPledgeDetails = { ...(newAssets[idx].carPledgeDetails || { brand: '', model: '', plateNo: '', province: '', chassisNo: '', engineNo: '', color: '', owner: '' }), plateNo: e.target.value };
                            handleChange('collateralAssets', newAssets);
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">จังหวัด</label>
                          <input type="text" value={asset.carPledgeDetails?.province || ''} onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].carPledgeDetails = { ...(newAssets[idx].carPledgeDetails || { brand: '', model: '', plateNo: '', province: '', chassisNo: '', engineNo: '', color: '', owner: '' }), province: e.target.value };
                            handleChange('collateralAssets', newAssets);
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">เลขตัวถัง</label>
                          <input type="text" value={asset.carPledgeDetails?.chassisNo || ''} onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].carPledgeDetails = { ...(newAssets[idx].carPledgeDetails || { brand: '', model: '', plateNo: '', province: '', chassisNo: '', engineNo: '', color: '', owner: '' }), chassisNo: e.target.value };
                            handleChange('collateralAssets', newAssets);
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">เลขเครื่องยนต์</label>
                          <input type="text" value={asset.carPledgeDetails?.engineNo || ''} onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].carPledgeDetails = { ...(newAssets[idx].carPledgeDetails || { brand: '', model: '', plateNo: '', province: '', chassisNo: '', engineNo: '', color: '', owner: '' }), engineNo: e.target.value };
                            handleChange('collateralAssets', newAssets);
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">สี</label>
                          <input type="text" value={asset.carPledgeDetails?.color || ''} onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].carPledgeDetails = { ...(newAssets[idx].carPledgeDetails || { brand: '', model: '', plateNo: '', province: '', chassisNo: '', engineNo: '', color: '', owner: '' }), color: e.target.value };
                            handleChange('collateralAssets', newAssets);
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">ชื่อผู้ถือกรรมสิทธิ์</label>
                          <input type="text" value={asset.carPledgeDetails?.owner || ''} onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].carPledgeDetails = { ...(newAssets[idx].carPledgeDetails || { brand: '', model: '', plateNo: '', province: '', chassisNo: '', engineNo: '', color: '', owner: '' }), owner: e.target.value };
                            handleChange('collateralAssets', newAssets);
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {asset.type === 'stockPledge' && (
                    <div className="mt-3 bg-white p-4 rounded-md border border-gray-100 shadow-sm space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">ชื่อบริษัท</label>
                          <input type="text" value={asset.stockPledgeDetails?.companyName || ''} onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].stockPledgeDetails = { ...(newAssets[idx].stockPledgeDetails || { companyName: '', certificateNo: '', quantity: '', parValue: '', totalValue: '', owner: '' }), companyName: e.target.value };
                            handleChange('collateralAssets', newAssets);
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">เลขที่ใบหุ้น</label>
                          <input type="text" value={asset.stockPledgeDetails?.certificateNo || ''} onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].stockPledgeDetails = { ...(newAssets[idx].stockPledgeDetails || { companyName: '', certificateNo: '', quantity: '', parValue: '', totalValue: '', owner: '' }), certificateNo: e.target.value };
                            handleChange('collateralAssets', newAssets);
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">จำนวนหุ้น</label>
                          <input type="text" value={asset.stockPledgeDetails?.quantity || ''} onChange={(e) => {
                            const formatted = formatCurrency(e.target.value);
                            const newAssets = [...data.collateralAssets];
                            const stock = { ...(newAssets[idx].stockPledgeDetails || { companyName: '', certificateNo: '', quantity: '', parValue: '', totalValue: '', owner: '' }), quantity: formatted };
                            const qty = parseFloat(stock.quantity.replace(/,/g, '')) || 0;
                            const par = parseFloat(stock.parValue.replace(/,/g, '')) || 0;
                            stock.totalValue = (qty * par).toLocaleString('en-US');
                            newAssets[idx].stockPledgeDetails = stock;
                            handleChange('collateralAssets', newAssets);
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">มูลค่าหุ้นละ (บาท)</label>
                          <input type="text" value={asset.stockPledgeDetails?.parValue || ''} onChange={(e) => {
                            const formatted = formatCurrency(e.target.value);
                            const newAssets = [...data.collateralAssets];
                            const stock = { ...(newAssets[idx].stockPledgeDetails || { companyName: '', certificateNo: '', quantity: '', parValue: '', totalValue: '', owner: '' }), parValue: formatted };
                            const qty = parseFloat(stock.quantity.replace(/,/g, '')) || 0;
                            const par = parseFloat(stock.parValue.replace(/,/g, '')) || 0;
                            stock.totalValue = (qty * par).toLocaleString('en-US');
                            newAssets[idx].stockPledgeDetails = stock;
                            handleChange('collateralAssets', newAssets);
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">รวมมูลค่า (บาท)</label>
                          <input type="text" value={asset.stockPledgeDetails?.totalValue || ''} readOnly className="block w-full rounded border-gray-300 text-sm p-2 border bg-gray-50 text-gray-500 cursor-not-allowed shadow-sm" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">ชื่อผู้ถือหุ้น</label>
                          <input type="text" value={asset.stockPledgeDetails?.owner || ''} onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].stockPledgeDetails = { ...(newAssets[idx].stockPledgeDetails || { companyName: '', certificateNo: '', quantity: '', parValue: '', totalValue: '', owner: '' }), owner: e.target.value };
                            handleChange('collateralAssets', newAssets);
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => handleChange('collateralAssets', [...(data.collateralAssets || []), { type: 'land', landDetails: { deedNo: '', volume: '', page: '', mapSheet: '', landNo: '', surveyNo: '', subDistrict: '', district: '', province: '', owner: customerInfo?.companyName || '' } }])}
                className="w-full py-6 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-2 group bg-blue-50/10"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold">เพิ่มทรัพย์สินหลักประกัน</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">เลือกประเภทหลักประกัน เช่น ที่ดิน, เครื่องจักร, เงินสด ฯลฯ</p>
                </div>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* สัญญารับซื้อคืน Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors bg-orange-50/30"
          onClick={() => setShowBuyback(!showBuyback)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">สัญญารับซื้อคืน</h3>
              <p className="text-[10px] text-gray-500">จัดการข้อมูลการรับซื้อเครื่องจักรคืนจากตัวแทนจำหน่าย</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-4" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                id={`hasBuyback-${data.contractNo}`}
                checked={data.hasBuyback || false}
                onChange={(e) => toggleBuyback(e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor={`hasBuyback-${data.contractNo}`} className="text-xs font-medium text-orange-700 select-none">
                เปิดใช้งาน
              </label>
            </div>
            {showBuyback ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
          </div>
        </div>

        {showBuyback && data.hasBuyback && (
          <div className="bg-gray-50/50">
            {(data.buybacks || []).map((bb, idx) => (
              <div key={bb.id} className="p-6 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-gray-700">สัญญารับซื้อคืน ชุดที่ {idx + 1}</h4>
                  <div className="flex items-center gap-4 text-[10px] text-orange-600 italic">
                    <ShieldCheck size={12} className="inline mr-1" />
                    เชื่อมโยงข้อมูลจาก {data.contractNo} ({data.contractDate})
                    <button
                      onClick={() => {
                        const newBuybacks = data.buybacks?.filter(b => b.id !== bb.id);
                        handleChange('buybacks', newBuybacks);
                        if (!newBuybacks || newBuybacks.length === 0) {
                          handleChange('hasBuyback', false);
                        }
                      }}
                      className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                      title="ลบสัญญานี้"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <BuybackForm
                  data={bb}
                  parentAssets={data.assets}
                  otherBuybacksSelectedAssetIds={data.buybacks?.filter(b => b.id !== bb.id).flatMap(b => b.selectedAssetIds) || []}
                  onChange={(val) => {
                    const newBuybacks = [...(data.buybacks || [])];
                    newBuybacks[idx] = val;
                    handleChange('buybacks', newBuybacks);
                  }}
                  onFocusSection={(sectionId: string) => {
                    if (onFocusSection) {
                      onFocusSection(sectionId, 'preview-panel');
                    }
                  }}
                />
              </div>
            ))}

            <div className="p-4 border-t border-gray-100 flex justify-center bg-white">
              <button
                onClick={addBuyback}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 px-4 py-2 rounded-lg transition-all"
              >
                <Plus size={16} /> เพิ่มสัญญารับซื้อคืน
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}


