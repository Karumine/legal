import { useEffect } from 'react';
import DirectorInput from './DirectorInput';
import type { HirePurchaseData, LessorInfo, AssetDetail } from '../types/app';
import { thaiBahtText } from '../utils/thaiBahtText';

interface Props {
  data: HirePurchaseData;
  onChange: (data: HirePurchaseData) => void;
}

export default function HirePurchaseForm({ data, onChange }: Props) {
  const handleChange = (field: keyof HirePurchaseData, value: any) => {
    onChange({ ...data, [field]: value });
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
    // dependencies to prevent infinite loops but respond to key inputs
  ]);

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
    handleChange('assets', [...data.assets, { description: '', quantity: '1', unitPrice: '', totalAmount: '' }]);
  };

  const removeAsset = (index: number) => {
    handleChange('assets', data.assets.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 pb-20">
      {/* General Info */}
      <section className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
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
          <div className="col-span-2">
            <DirectorInput
              label="กรรมการผู้มีอำนาจ (ผู้เช่าซื้อ)"
              value={data.lesseeSignatories}
              onChange={(val) => handleChange('lesseeSignatories', val)}
              placeholder="ชื่อ-นามสกุล กรรมการ"
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
      <section className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
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
                      const val = e.target.value.replace(/,/g, '');
                      if (!isNaN(Number(val)) || val === '') {
                        const formatted = val ? Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '';
                        updateAsset(index, 'totalAmount', formatted);
                      }
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
      <section className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
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
            <label className="block text-xs font-medium text-gray-600 mb-1">สถานที่ตั้งทรัพย์สิน (ข้อ 2.2)</label>
            <textarea
              value={data.installationLocation}
              onChange={(e) => handleChange('installationLocation', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border h-20"
              placeholder="สำนักงานใหญ่เลขที่..."
            />
          </div>
        </div>
      </section>

      {/* Financials & Clauses (Sections 3.2 - 4.4) */}
      <section className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
        <h3 className="font-semibold text-lg text-blue-700 mb-3">เงื่อนไขการเงินและข้อสัญญา (ข้อ 3.2 - 4.4)</h3>

        <div className="space-y-6">
          {/* Section 3.1 */}
          <div className="p-3 border border-blue-100 rounded-md bg-blue-50/30">
            <h4 className="text-sm font-bold text-blue-800 mb-2">3.1 ราคาทรัพย์สินที่เช่าซื้อ (ราคารวม)</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ราคารวม (บาท) [คำนวณจากรายการทรัพย์สินรวมกัน]</label>
                <div className="flex gap-4 items-center">
                  <input type="text" value={data.totalAmount} readOnly className="block w-48 rounded-md border-gray-300 shadow-sm text-sm p-2 border bg-gray-50 text-blue-700 font-bold" />
                  <div className="text-blue-600 text-xs font-medium">({thaiBahtText(data.totalAmount)})</div>
                </div>
              </div>
            </div>
          </div>
          {/* Section 3.2 (ก) */}
          <div className="p-3 border border-blue-100 rounded-md bg-blue-50/30">
            <h4 className="text-sm font-bold text-blue-800 mb-2">3.2 (ก) เงินดาวน์</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">เงินดาวน์ (%)</label>
                <input type="text" value={data.downPaymentPercentage || ''} onChange={(e) => handleChange('downPaymentPercentage', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">เงินดาวน์ (บาท) [คำนวณจาก 3.1 x %]</label>
                <input type="text" value={data.downPayment} readOnly className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border bg-gray-50 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Section 3.2 (ข) */}
          <div className="p-3 border border-blue-100 rounded-md bg-blue-50/30">
            <h4 className="text-sm font-bold text-blue-800 mb-2">3.2 (ข) ยอดจัดและดอกเบี้ย</h4>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ยอดจัดสะสม/เงินต้น (บาท)</label>
                <input type="text" value={data.remainingAmount} readOnly className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border bg-gray-50 text-gray-500" />
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
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ค่างวด/เดือน (บาท)</label>
                <input type="text" value={data.installmentAmount} onChange={(e) => handleChange('installmentAmount', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border" />
              </div>
            </div>
          </div>

          {/* Section 3.2 (ค) */}
          <div className="p-3 border border-blue-100 rounded-md bg-blue-50/30">
            <h4 className="text-sm font-bold text-blue-800 mb-2">3.2 (ค) ระยะเวลาการผ่อนชำระ</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">เริ่มชำระงวดแรก</label>
                <input type="date" value={data.firstInstallmentDate || ''} onChange={(e) => handleChange('firstInstallmentDate', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ชำระทุกวันที่ [ดึงจากงวดแรก]</label>
                <input type="text" value={data.paymentDay || ''} onChange={(e) => handleChange('paymentDay', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">จำนวนงวด (เดือน)</label>
                <input type="text" value={data.installments} onChange={(e) => handleChange('installments', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">สิ้นสุดงวดสุดท้าย [คำนวณอัตโนมัติ]</label>
                <input type="date" value={data.lastInstallmentDate || ''} onChange={(e) => handleChange('lastInstallmentDate', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border" />
              </div>
            </div>
          </div>

          {/* Other Financial Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ค่าอากรแสตมป์ (บาท)</label>
              <input type="text" value={data.stampDuty || ''} onChange={(e) => handleChange('stampDuty', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ค่าเบี้ยประกันภัย (บาท)</label>
              <input type="text" value={data.insurancePremium || ''} onChange={(e) => handleChange('insurancePremium', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">เช็คต่อค่างวด (ขัอ 4.1)</label>
              <input type="text" value={data.chequesPerInstallment || ''} onChange={(e) => handleChange('chequesPerInstallment', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border" />
            </div>
          </div>

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
        </div>
      </section>

      {/* Collateral Section */}
      <section className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
        <h3 className="font-semibold text-lg text-blue-700 mb-3">6. หลักประกัน</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">มูลค่ารวมหลักประกัน (6.1) (บาท)</label>
            <input type="text" value={data.collateralValue || ''} onChange={(e) => handleChange('collateralValue', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border" />
          </div>



          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-medium text-gray-600">ทรัพย์สินหลักประกัน (6.3)</label>
              <button
                type="button"
                onClick={() => handleChange('collateralAssets', [...(data.collateralAssets || []), { type: 'land', landDetails: { deedNo: '', volume: '', page: '', mapSheet: '', landNo: '', surveyNo: '', subDistrict: '', district: '', province: '', owner: '' } }])}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100"
              >
                + เพิ่มทรัพย์สิน
              </button>
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
                            newAssets[idx].landDetails = { deedNo: '', volume: '', page: '', mapSheet: '', landNo: '', surveyNo: '', subDistrict: '', district: '', province: '', owner: '' };
                          }
                          handleChange('collateralAssets', newAssets);
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm text-xs p-1 border"
                      >
                        <option value="land">จำนองที่ดิน</option>
                        <option value="cash">เงินสด</option>
                        <option value="machinery">เครื่องจักร</option>
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
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">ตำบล</label>
                        <input type="text" value={asset.landDetails.subDistrict} onChange={(e) => {
                          const newAssets = [...data.collateralAssets];
                          newAssets[idx].landDetails = { ...newAssets[idx].landDetails!, subDistrict: e.target.value };
                          handleChange('collateralAssets', newAssets);
                        }} className="block w-full rounded border-gray-300 text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">อำเภอ</label>
                        <input type="text" value={asset.landDetails.district} onChange={(e) => {
                          const newAssets = [...data.collateralAssets];
                          newAssets[idx].landDetails = { ...newAssets[idx].landDetails!, district: e.target.value };
                          handleChange('collateralAssets', newAssets);
                        }} className="block w-full rounded border-gray-300 text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">จังหวัด</label>
                        <input type="text" value={asset.landDetails.province} onChange={(e) => {
                          const newAssets = [...data.collateralAssets];
                          newAssets[idx].landDetails = { ...newAssets[idx].landDetails!, province: e.target.value };
                          handleChange('collateralAssets', newAssets);
                        }} className="block w-full rounded border-gray-300 text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all" />
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

                  {asset.type === 'cash' && (
                    <div>
                      <label className="block text-[10px] text-gray-500">จำนวนเงิน (บาท)</label>
                      <input type="text" value={asset.cashAmount || ''} onChange={(e) => {
                        const newAssets = [...data.collateralAssets];
                        newAssets[idx].cashAmount = e.target.value;
                        handleChange('collateralAssets', newAssets);
                      }} className="block w-full rounded border-gray-300 text-xs p-1 border" />
                    </div>
                  )}

                  {asset.type === 'machinery' && (
                    <div>
                      <label className="block text-[10px] text-gray-500">รายละเอียดเครื่องจักร</label>
                      <textarea value={asset.machineryDetails || ''} onChange={(e) => {
                        const newAssets = [...data.collateralAssets];
                        newAssets[idx].machineryDetails = e.target.value;
                        handleChange('collateralAssets', newAssets);
                      }} className="block w-full rounded border-gray-300 text-xs p-1 border h-16" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}

