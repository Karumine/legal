import React from 'react';
import type { CreditFacilityData, LessorInfo } from '../types/app';
import { thaiBahtText } from '../utils/thaiBahtText';

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
  const p1 = parseFloat(data.lender1.proportion) || 0;
  const p2 = parseFloat(data.lender2.proportion) || 0;

  const limit1 = Math.floor(loanAmt * (p1 / 100));
  const limit2 = Math.floor(loanAmt * (p2 / 100));

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
                  const val = e.target.value.replace(/,/g, '');
                  if (!isNaN(Number(val)) || val === '') {
                    const formatted = val ? Number(val).toLocaleString('en-US') : '';
                    onChange({ ...data, loanAmount: formatted });
                  }
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
                  const val = e.target.value.replace(/,/g, '');
                  if (!isNaN(Number(val)) || val === '') {
                    const formatted = val ? Number(val).toLocaleString('en-US') : '';
                    onChange({ ...data, stampDuty: formatted });
                  }
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
                <label className="block text-xs font-medium text-gray-600 mb-1">อัตราดอกเบี้ยร้อยละต่อปี (4.2)</label>
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
                <label className="block text-xs font-medium text-gray-600 mb-1">จำนวนงวด (4.3 ข)</label>
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
                <label className="block text-xs font-medium text-gray-600 mb-1">จำนวนเงินต่องวด (5.1) (บาท)</label>
                <input
                  type="text"
                  name="installmentAmount"
                  value={data.installmentAmount || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/,/g, '');
                    if (!isNaN(Number(val)) || val === '') {
                      const formatted = val ? Number(val).toLocaleString('en-US') : '';
                      onChange({ ...data, installmentAmount: formatted });
                    }
                  }}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
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
                const val = e.target.value.replace(/,/g, '');
                if (!isNaN(Number(val)) || val === '') {
                  const formatted = val ? Number(val).toLocaleString('en-US') : '';
                  onChange({ ...data, collateralValue: formatted });
                }
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
                          onChange({ ...data, collateralAssets: newAssets });
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm text-xs p-1 border"
                      >
                        <option value="land">จำนองที่ดิน</option>
                        <option value="cash">เงินสด</option>
                        <option value="machinery">จำนองเครื่องจักร</option>
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
                        { label: 'ตำบล', key: 'subDistrict' },
                        { label: 'อำเภอ', key: 'district' },
                        { label: 'จังหวัด', key: 'province' },
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
                    </div>
                  )}

                  {asset.type === 'cash' && (
                    <div className="mt-3 bg-white p-4 rounded-md border border-gray-100 shadow-sm">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">จำนวนเงิน (บาท)</label>
                      <input
                        type="text"
                        value={asset.cashAmount || ''}
                        onChange={(e) => {
                          const newAssets = [...data.collateralAssets];
                          newAssets[idx].cashAmount = e.target.value;
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
                          <label className="block text-xs font-semibold text-gray-500 mb-1">รายละเอียดเครื่องจักร</label>
                          <input
                            type="text"
                            value={asset.machineName || ''}
                            onChange={(e) => {
                              const newAssets = [...data.collateralAssets];
                              newAssets[idx] = { ...newAssets[idx], machineName: e.target.value };
                              onChange({ ...data, collateralAssets: newAssets });
                            }}
                            className="block w-full rounded border-gray-300 text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                            placeholder="เช่น เครื่องเป่าขวดพลาสติก PET กึ่งอัตโนมัติ"
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
                            className="block w-full rounded border-gray-300 text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all text-center"
                            placeholder="1"
                          />
                        </div>
                        <div className="col-span-8">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">ราคา (บาท)</label>
                          <input
                            type="text"
                            value={asset.machinePrice || ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/,/g, '');
                              if (!isNaN(Number(val)) || val === '') {
                                const formatted = val ? Number(val).toLocaleString('en-US') : '';
                                const newAssets = [...data.collateralAssets];
                                newAssets[idx] = { ...newAssets[idx], machinePrice: formatted };
                                onChange({ ...data, collateralAssets: newAssets });
                              }
                            }}
                            className="block w-full rounded border-gray-300 text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all text-right font-medium"
                            placeholder="0"
                          />
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
