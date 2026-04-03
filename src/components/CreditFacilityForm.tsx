import React, { useEffect } from 'react';
import type { CreditFacilityData, LessorInfo } from '../types/app';
import { thaiBahtText } from '../utils/thaiBahtText';
import { formatCurrency } from '../utils/formatters';
import ThaiLocationSelector from './ThaiLocationSelector';

interface Props {
  data: CreditFacilityData;
  onChange: (data: CreditFacilityData) => void;
}

export default function CreditFacilityForm({ data, onChange }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const handleLenderChange = (lender: 'lender1' | 'lender2', field: keyof LessorInfo, value: string) => {
    onChange({
      ...data,
      [lender]: { ...data[lender], [field]: value }
    });
  };

  // Calculated Credit Limits
  const loanAmt = parseFloat(data.loanAmount.replace(/,/g, '')) || 0;
  const p1 = parseFloat(data.lender1.proportion || '0') || 0;
  const p2 = parseFloat(data.lender2.proportion || '0') || 0;

  const limit1 = Math.floor(loanAmt * (p1 / 100));
  const limit2 = Math.floor(loanAmt * (p2 / 100));

  // Auto-calculations
  useEffect(() => {
    const loanAmountRaw = parseFloat(data.loanAmount.replace(/,/g, '')) || 0;
    const numInstallments = parseInt(data.installments) || 1;
    const interestRateRaw = parseFloat(data.interestRate) || 0;

    if (loanAmountRaw > 0) {
      let monthlyAmount = 0;

      if (data.interestType === 'แบบลดต้นลดดอก' && interestRateRaw > 0) {
        // Effective Rate (Amortization) Formula: P * [ i(1+i)^n ] / [ (1+i)^n – 1 ]
        const monthlyRate = (interestRateRaw / 100) / 12;
        monthlyAmount = (loanAmountRaw * monthlyRate * Math.pow(1 + monthlyRate, numInstallments)) / 
                       (Math.pow(1 + monthlyRate, numInstallments) - 1);
      } else {
        // Flat Rate Formula: (Principal / n) + (Principal * annualRate / 12)
        const principalPerMonth = loanAmountRaw / numInstallments;
        const interestPerMonth = (loanAmountRaw * (interestRateRaw / 100)) / 12;
        monthlyAmount = principalPerMonth + interestPerMonth;
      }

      const formattedInstallment = monthlyAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      if (formattedInstallment !== data.installmentAmount) {
        onChange({ ...data, installmentAmount: formattedInstallment });
      }
    }
  }, [
    data.loanAmount,
    data.installments,
    data.interestRate,
    data.interestType
  ]);

  return (
    <div className="space-y-6">
      {/* Basic Info */}
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
              name="contractNo"
              value={data.contractNo || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white"
              placeholder="เช่น AGA/23-PL032026"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">วันที่เริ่มมีผลบังคับใช้</label>
            <input
              type="date"
              name="effectiveDate"
              value={data.effectiveDate || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white"
            />
          </div>
        </div>
      </section>

      {/* Financial Info */}
      <section className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
        <h3 className="font-semibold text-md text-blue-700 mb-3 text-lg">ข้อมูลทางการเงิน</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">วงเงินสินเชื่อรวม (ข้อ 1.1) (บาท)</label>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                name="loanAmount"
                value={data.loanAmount || ''}
                onChange={(e) => {
                  const formatted = formatCurrency(e.target.value);
                  onChange({ ...data, loanAmount: formatted });
                }}
                className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white font-bold text-blue-700"
                placeholder="0"
              />
              <div className="text-blue-600 text-xs font-medium">
                {data.loanAmount ? `(${thaiBahtText(data.loanAmount)})` : '(ศูนย์บาทถ้วน)'}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <label className="block text-xs font-medium text-gray-600 mb-1">ค่าอากรแสตมป์ (13.2) (บาท)</label>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                name="stampDuty"
                value={data.stampDuty || ''}
                onChange={(e) => {
                  const formatted = formatCurrency(e.target.value);
                  onChange({ ...data, stampDuty: formatted });
                }}
                className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white font-bold text-blue-700"
                placeholder="เช่น 767"
              />
              <div className="text-blue-600 text-xs font-medium">
                {data.stampDuty ? `(${thaiBahtText(data.stampDuty)})` : '(ศูนย์บาทถ้วน)'}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">วัตถุประสงค์ (ข้อ 2)</label>
              <textarea
                name="businessPurpose"
                value={data.businessPurpose || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border h-20"
                placeholder="ระบุวัตถุประสงค์การกู้..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ประเภทดอกเบี้ย</label>
                <select
                  name="interestType"
                  value={data.interestType}
                  onChange={(e) => onChange({ ...data, interestType: e.target.value as any })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white"
                >
                  <option value="แบบคงที่">แบบคงที่ (Flat Rate)</option>
                  <option value="แบบลดต้นลดดอก">แบบลดต้นลดดอก (Effective Rate)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">อัตราดอกเบี้ย (%) (4.2)</label>
                <input
                  type="text"
                  name="interestRate"
                  value={data.interestRate || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
                  placeholder="เช่น 15"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">จำนวนงวด (เดือน) (4.3 ข)</label>
                <input
                  type="text"
                  name="installments"
                  value={data.installments || ''}
                  onChange={(e) => onChange({ ...data, installments: e.target.value.replace(/\D/g, '') })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
                  placeholder="เช่น 24"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ค่างวด/เดือน (5.1) (บาท)</label>
                <input
                  type="text"
                  name="installmentAmount"
                  value={data.installmentAmount || ''}
                  readOnly
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-gray-100 text-gray-400 font-bold cursor-not-allowed"
                  placeholder="เช่น 63,032.64"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">งวดแรก วันที่ (5.1)</label>
                <input
                  type="date"
                  name="firstInstallmentDate"
                  value={data.firstInstallmentDate || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ชำระทุกวันที่ (5.1)</label>
                <input
                  type="text"
                  name="paymentDay"
                  value={data.paymentDay || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
                  placeholder="เช่น 25"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">งวดสุดท้าย วันที่ (5.1)</label>
                <input
                  type="date"
                  name="lastInstallmentDate"
                  value={data.lastInstallmentDate || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proportions */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'lender1', label: 'ผู้ให้สินเชื่อฝ่ายที่ 1', limit: limit1 },
          { key: 'lender2', label: 'ผู้ให้สินเชื่อฝ่ายที่ 2', limit: limit2 }
        ].map(l => (
          <section key={l.key} className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
            <h3 className="font-semibold text-md text-blue-700 mb-3">{l.label}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-blue-600 mb-1 font-bold italic">สัดส่วน (%) *คำนวณวงเงินอัตโนมัติ*</label>
                <input
                  type="text"
                  value={(data as any)[l.key].proportion}
                  onChange={(e) => handleLenderChange(l.key as any, 'proportion', e.target.value)}
                  className="block w-full rounded-md border-blue-300 shadow-sm text-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">วงเงินที่ได้รับ (บาท)</label>
                <input
                  type="text"
                  value={l.limit.toLocaleString('en-US')}
                  readOnly
                  className="block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border bg-gray-50 text-gray-500 cursor-not-allowed font-bold"
                />
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Collateral Section */}
      <section className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
        <h3 className="font-semibold text-lg text-blue-700 mb-3 underline decoration-blue-200">ข้อ 7. หลักประกัน</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">มูลค่ารวมหลักประกัน (7.1) (บาท)</label>
            <input
              type="text"
              name="collateralValue"
              value={data.collateralValue || ''}
              onChange={(e) => {
                const formatted = formatCurrency(e.target.value);
                onChange({ ...data, collateralValue: formatted });
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
              placeholder="0"
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-medium text-gray-600">ทรัพย์สินหลักประกัน (7.3)</label>
              <button
                type="button"
                onClick={() => onChange({
                  ...data,
                  collateralAssets: [...(data.collateralAssets || []), { type: 'land', landDetails: { deedNo: '', volume: '', page: '', mapSheet: '', landNo: '', surveyNo: '', subDistrict: '', district: '', province: '', owner: '' } }]
                })}
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
                      onChange({ ...data, collateralAssets: newAssets });
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
                          if (newType === 'carPledge' && !newAssets[idx].carPledgeDetails) {
                            newAssets[idx].carPledgeDetails = { brand: '', model: '', plateNo: '', province: '', chassisNo: '', engineNo: '', color: '', owner: '' };
                          }
                          if (newType === 'stockPledge' && !newAssets[idx].stockPledgeDetails) {
                            newAssets[idx].stockPledgeDetails = { companyName: '', certificateNo: '', quantity: '', parValue: '', totalValue: '', owner: '' };
                          }
                          if (newType === 'machinery' && !newAssets[idx].machineName) {
                            newAssets[idx] = { ...newAssets[idx], machineName: '', machineModel: '', machineQuantity: '1', machineUnit: 'ชุด', machinePrice: '0', machineOwner: '' };
                          }
                          onChange({ ...data, collateralAssets: newAssets });
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm text-xs p-1 border focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-blue-700 bg-blue-50/30"
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
                      {[
                        { label: 'โฉนดเลขที่', key: 'deedNo' },
                        { label: 'เล่ม', key: 'volume' },
                        { label: 'หน้า', key: 'page' },
                        { label: 'ระวาง', key: 'mapSheet' },
                        { label: 'เลขที่ดิน', key: 'landNo' },
                        { label: 'หน้าสำรวจ', key: 'surveyNo' },
                        { label: 'ชื่อเจ้าของ', key: 'owner' }
                      ].map(field => (
                        <div key={field.key}>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">{field.label}</label>
                          <input
                            type="text"
                            value={(asset.landDetails as any)[field.key]}
                            onChange={(e) => {
                              const newAssets = [...data.collateralAssets];
                              newAssets[idx].landDetails = { ...newAssets[idx].landDetails!, [field.key]: e.target.value };
                              onChange({ ...data, collateralAssets: newAssets });
                            }}
                            className="block w-full rounded border-gray-300 text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                          />
                        </div>
                      ))}
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
                            onChange({ ...data, collateralAssets: newAssets });
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {asset.type === 'cash' && (
                    <div className="mt-3 bg-white p-4 rounded-md border border-gray-100 shadow-sm">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">จำนวนเงิน (บาท)</label>
                      <input
                        type="text"
                        value={asset.cashAmount || ''}
                        onChange={(e) => {
                          const formatted = formatCurrency(e.target.value);
                          const newAssets = [...data.collateralAssets];
                          newAssets[idx].cashAmount = formatted;
                          onChange({ ...data, collateralAssets: newAssets });
                        }}
                        className="block w-full rounded border-gray-300 text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                      />
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
                            onChange({ ...data, collateralAssets: newAssets });
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
                              onChange({ ...data, collateralAssets: newAssets });
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
                              onChange({ ...data, collateralAssets: newAssets });
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
                              onChange({ ...data, collateralAssets: newAssets });
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
                              onChange({ ...data, collateralAssets: newAssets });
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
                              onChange({ ...data, collateralAssets: newAssets });
                            }}
                            className="block w-full rounded border-gray-300 text-md p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all text-left font-bold text-blue-600"
                            placeholder="0"
                          />
                        </div>
                      </div>
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
                            onChange({ ...data, collateralAssets: newAssets });
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">รุ่น</label>
                          <input type="text" value={asset.carPledgeDetails?.model || ''} onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].carPledgeDetails = { ...(newAssets[idx].carPledgeDetails || { brand: '', model: '', plateNo: '', province: '', chassisNo: '', engineNo: '', color: '', owner: '' }), model: e.target.value };
                            onChange({ ...data, collateralAssets: newAssets });
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">ทะเบียนเลขที่</label>
                          <input type="text" value={asset.carPledgeDetails?.plateNo || ''} onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].carPledgeDetails = { ...(newAssets[idx].carPledgeDetails || { brand: '', model: '', plateNo: '', province: '', chassisNo: '', engineNo: '', color: '', owner: '' }), plateNo: e.target.value };
                            onChange({ ...data, collateralAssets: newAssets });
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">จังหวัด</label>
                          <input type="text" value={asset.carPledgeDetails?.province || ''} onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].carPledgeDetails = { ...(newAssets[idx].carPledgeDetails || { brand: '', model: '', plateNo: '', province: '', chassisNo: '', engineNo: '', color: '', owner: '' }), province: e.target.value };
                            onChange({ ...data, collateralAssets: newAssets });
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">เลขตัวถัง</label>
                          <input type="text" value={asset.carPledgeDetails?.chassisNo || ''} onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].carPledgeDetails = { ...(newAssets[idx].carPledgeDetails || { brand: '', model: '', plateNo: '', province: '', chassisNo: '', engineNo: '', color: '', owner: '' }), chassisNo: e.target.value };
                            onChange({ ...data, collateralAssets: newAssets });
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">เลขเครื่องยนต์</label>
                          <input type="text" value={asset.carPledgeDetails?.engineNo || ''} onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].carPledgeDetails = { ...(newAssets[idx].carPledgeDetails || { brand: '', model: '', plateNo: '', province: '', chassisNo: '', engineNo: '', color: '', owner: '' }), engineNo: e.target.value };
                            onChange({ ...data, collateralAssets: newAssets });
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">สี</label>
                          <input type="text" value={asset.carPledgeDetails?.color || ''} onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].carPledgeDetails = { ...(newAssets[idx].carPledgeDetails || { brand: '', model: '', plateNo: '', province: '', chassisNo: '', engineNo: '', color: '', owner: '' }), color: e.target.value };
                            onChange({ ...data, collateralAssets: newAssets });
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">ชื่อผู้ถือกรรมสิทธิ์</label>
                          <input type="text" value={asset.carPledgeDetails?.owner || ''} onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].carPledgeDetails = { ...(newAssets[idx].carPledgeDetails || { brand: '', model: '', plateNo: '', province: '', chassisNo: '', engineNo: '', color: '', owner: '' }), owner: e.target.value };
                            onChange({ ...data, collateralAssets: newAssets });
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
                            onChange({ ...data, collateralAssets: newAssets });
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">เลขที่ใบหุ้น</label>
                          <input type="text" value={asset.stockPledgeDetails?.certificateNo || ''} onChange={(e) => {
                            const newAssets = [...data.collateralAssets];
                            newAssets[idx].stockPledgeDetails = { ...(newAssets[idx].stockPledgeDetails || { companyName: '', certificateNo: '', quantity: '', parValue: '', totalValue: '', owner: '' }), certificateNo: e.target.value };
                            onChange({ ...data, collateralAssets: newAssets });
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
                            onChange({ ...data, collateralAssets: newAssets });
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
                            onChange({ ...data, collateralAssets: newAssets });
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
                            onChange({ ...data, collateralAssets: newAssets });
                          }} className="block w-full rounded border-gray-300 text-sm p-2 border shadow-sm" />
                        </div>
                      </div>
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
