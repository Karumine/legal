import React, { useEffect, useState, useRef } from 'react';
import { Plus, Copy, ChevronDown } from 'lucide-react';
import type { ODData, LessorInfo, CompanyInfo, Agreement, CollateralAsset } from '../types/app';
import { CONTRACT_TYPE_LABELS } from '../types/app';
import { thaiBahtText } from '../utils/thaiBahtText';
import { formatCurrency } from '../utils/formatters';
import ThaiLocationSelector from './ThaiLocationSelector';

interface Props {
  data: ODData;
  customerInfo?: CompanyInfo;
  agreements?: Agreement[];
  currentAgreementId?: string;
  onChange: (data: ODData) => void;
  onFocusSection?: (sectionId: string) => void;
}

export default function ODForm({ data, onChange, customerInfo, agreements = [], currentAgreementId, onFocusSection }: Props) {
  const [showCopyCollateralMenu, setShowCopyCollateralMenu] = useState(false);
  const copyMenuRef = useRef<HTMLDivElement>(null);

  const [showCopyLocationMenu, setShowCopyLocationMenu] = useState(false);
  const copyLocationMenuRef = useRef<HTMLDivElement>(null);

  // Close copy menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (copyMenuRef.current && !copyMenuRef.current.contains(e.target as Node)) {
        setShowCopyCollateralMenu(false);
      }
      if (copyLocationMenuRef.current && !copyLocationMenuRef.current.contains(e.target as Node)) {
        setShowCopyLocationMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine if this is the first agreement (index 0 = no copy button)
  const currentAgreementIndex = agreements.findIndex(a => a.id === currentAgreementId);
  const isFirstAgreement = currentAgreementIndex <= 0;

  // Get other agreements that have collateral assets to copy from
  const otherAgreementsWithCollateral = isFirstAgreement ? [] : agreements.filter(a => {
    if (a.id === currentAgreementId) return false;
    const d = a.data as any;
    return d?.collateralAssets && d.collateralAssets.length > 0;
  });

  const otherAgreementsWithLocation = isFirstAgreement ? [] : agreements.filter(a => {
    if (a.id === currentAgreementId) return false;
    const d = a.data as any;
    return d?.businessPurpose;
  });

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

  const addCollateralAsset = () => {
    const lastLandAsset = [...(data.collateralAssets || [])].reverse().find(a => a.type === 'land' && a.landDetails);

    const newLandDetails = {
      deedNo: '',
      volume: '',
      page: '',
      mapSheet: lastLandAsset?.landDetails?.mapSheet || '',
      landNo: '',
      surveyNo: '',
      subDistrict: lastLandAsset?.landDetails?.subDistrict || '',
      district: lastLandAsset?.landDetails?.district || '',
      province: lastLandAsset?.landDetails?.province || '',
      owner: lastLandAsset?.landDetails?.owner || customerInfo?.companyName || ''
    };

    onChange({
      ...data,
      collateralAssets: [...(data.collateralAssets || []), {
        type: 'land',
        landDetails: newLandDetails
      }]
    });
  };

  // Calculated Credit Limits
  const loanAmt = parseFloat(data.loanAmount?.replace(/,/g, '') || '0') || 0;
  const p1 = parseFloat(data.lender1?.proportion || '0') || 0;
  const p2 = parseFloat(data.lender2?.proportion || '0') || 0;

  const limit1 = Math.floor(loanAmt * (p1 / 100));
  const limit2 = Math.floor(loanAmt * (p2 / 100));

  // Auto-calculations (Same as CF)
  useEffect(() => {
    const loanAmountRaw = parseFloat(data.loanAmount?.replace(/,/g, '') || '0') || 0;
    const numInstallments = parseInt(data.installments || '0') || 0;
    const interestRateRaw = parseFloat(data.interestRate || '0') || 0;

    let updates: Partial<ODData> = {};

    if (loanAmountRaw > 0) {
      let monthlyAmount = 0;

      if (data.interestType === 'แบบลดต้นลดดอก' && interestRateRaw > 0) {
        const monthlyRate = (interestRateRaw / 100) / 12;
        const n = numInstallments || 1;
        monthlyAmount = (loanAmountRaw * monthlyRate * Math.pow(1 + monthlyRate, n)) /
          (Math.pow(1 + monthlyRate, n) - 1);
      } else {
        const principalPerMonth = numInstallments > 0 ? loanAmountRaw / numInstallments : 0;
        const interestPerMonth = (loanAmountRaw * (interestRateRaw / 100)) / 12;
        monthlyAmount = principalPerMonth + interestPerMonth;
      }

      const formattedInstallment = monthlyAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      if (formattedInstallment !== data.installmentAmount) {
        updates.installmentAmount = formattedInstallment;
      }
    }

    // Date calculations
    if (data.firstInstallmentDate && numInstallments > 0) {
      let firstDate = new Date(data.firstInstallmentDate);
      if (typeof data.firstInstallmentDate === 'string' && data.firstInstallmentDate.includes('/')) {
        const parts = data.firstInstallmentDate.split('/');
        if (parts.length === 3) {
          let year = parseInt(parts[2]);
          if (year > 2500) year -= 543;
          firstDate = new Date(year, parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
      }

      if (!isNaN(firstDate.getTime())) {
        const day = firstDate.getDate().toString();
        if (data.paymentDay !== day) {
          updates.paymentDay = day;
        }

        const lastDate = new Date(firstDate);
        lastDate.setMonth(lastDate.getMonth() + (numInstallments - 1));

        let lastFormattedStr = '';
        if (typeof data.firstInstallmentDate === 'string' && data.firstInstallmentDate.includes('/')) {
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

    if (Object.keys(updates).length > 0) {
      onChange({ ...data, ...updates });
    }
  }, [
    data.loanAmount,
    data.installments,
    data.interestRate,
    data.interestType,
    data.firstInstallmentDate
  ]);

  // Auto-resize textareas
  useEffect(() => {
    const textareas = document.querySelectorAll('.auto-resize-textarea');
    textareas.forEach(ta => {
      const textarea = ta as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  }, [data.conditions32, data.businessPurpose]);

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <section className="bg-white p-4 rounded-lg shadow-sm border border-blue-200" onFocusCapture={() => onFocusSection?.('od-general')}>
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
              placeholder="เช่น AGA/17-PL112025"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">วันที่ทำสัญญา</label>
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
      <section className="bg-white p-4 rounded-lg shadow-sm border border-blue-200" onFocusCapture={() => onFocusSection?.('od-financials')}>
        <h3 className="font-semibold text-md text-blue-700 mb-3 text-lg">ข้อมูลทางการเงิน</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">วงเงินสินเชื่อรวม (บาท)</label>
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
                      value={(data as any)[l.key]?.proportion || ''}
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

          <div className="pt-2 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-gray-600">วัตถุประสงค์ (ข้อ ก.)</label>
                {otherAgreementsWithLocation.length > 0 && (
                  <div className="relative" ref={copyLocationMenuRef}>
                    <button
                      type="button"
                      onClick={() => setShowCopyLocationMenu(!showCopyLocationMenu)}
                      className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded flex-shrink-0 text-[10px] font-bold hover:bg-blue-100 hover:border-blue-300 transition-all shadow-sm"
                    >
                      <Copy size={11} />
                      คัดลอกจากสัญญาอื่น
                      <ChevronDown size={10} className={`transition-transform ${showCopyLocationMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showCopyLocationMenu && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 min-w-[260px] animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          เลือกสัญญาต้นทาง
                        </div>
                        {otherAgreementsWithLocation.map((agreement) => {
                          const aData = agreement.data as any;
                          const sourceIndex = agreements.indexOf(agreement) + 1;
                          const label = `${CONTRACT_TYPE_LABELS[agreement.type]} (${sourceIndex})`;
                          return (
                            <button
                              key={agreement.id}
                              onClick={() => {
                                onChange({
                                  ...data,
                                  businessPurpose: aData.businessPurpose || data.businessPurpose || ''
                                });
                                setShowCopyLocationMenu(false);
                              }}
                              className="w-full text-left px-3 py-2.5 text-xs flex items-center gap-2 transition-colors hover:bg-blue-50 text-slate-700"
                            >
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <Copy size={11} className="text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate">{label}</div>
                                <div className="text-[10px] text-slate-400">
                                  {aData.contractNo || 'ไม่มีเลขสัญญา'}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <textarea
                name="businessPurpose"
                value={data.businessPurpose || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white auto-resize-textarea resize-none overflow-hidden min-h-[80px]"
                placeholder="ระบุวัตถุประสงค์การกู้..."
              />
            </div>

            {/* Same layout for Interest and Installments as CF */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ประเภทดอกเบี้ย</label>
                <select
                  name="interestType"
                  value={data.interestType}
                  onChange={(e) => onChange({ ...data, interestType: e.target.value as any })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white"
                >
                  <option value="แบบลดต้นลดดอก">แบบลดต้นลดดอก (Effective Rate)</option>
                  <option value="แบบคงที่">แบบคงที่ (Flat Rate)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">อัตราดอกเบี้ย (%) ต่อปี</label>
                <input
                  type="text"
                  name="interestRate"
                  value={data.interestRate || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
                  placeholder="เช่น 15"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
               <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">จำนวนงวด (เดือน) (ถ้ามี)</label>
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
                <label className="block text-xs font-medium text-gray-600 mb-1">ค่างวด/เดือน (บาท)</label>
                <input
                  type="text"
                  name="installmentAmount"
                  value={data.installmentAmount || ''}
                  readOnly
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-gray-100 text-gray-400 font-bold cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">งวดแรก วันที่</label>
                <input
                  type="date"
                  name="firstInstallmentDate"
                  value={data.firstInstallmentDate || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ชำระทุกวันที่</label>
                <input
                  type="text"
                  name="paymentDay"
                  value={data.paymentDay || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
                  placeholder="เช่น 25"
                />
              </div>
            </div>

             <div className="pt-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">ค่าอากรแสตมป์ (บาท)</label>
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
                  placeholder="0"
                />
                <div className="text-blue-600 text-xs font-medium">
                  {data.stampDuty ? `(${thaiBahtText(data.stampDuty)})` : '(ศูนย์บาทถ้วน)'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collateral Section */}
      <section className="bg-white p-4 rounded-lg shadow-sm border border-blue-200" onFocusCapture={() => onFocusSection?.('od-collateral')}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg text-blue-700">หลักประกัน</h3>
          {otherAgreementsWithCollateral.length > 0 && (
            <div className="relative" ref={copyMenuRef}>
              <button
                type="button"
                onClick={() => setShowCopyCollateralMenu(!showCopyCollateralMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 hover:border-blue-300 transition-all shadow-sm"
              >
                <Copy size={13} />
                คัดลอกจากสัญญาอื่น
                <ChevronDown size={12} className={`transition-transform ${showCopyCollateralMenu ? 'rotate-180' : ''}`} />
              </button>
              {showCopyCollateralMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 min-w-[260px] animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    เลือกสัญญาต้นทาง
                  </div>
                  {otherAgreementsWithCollateral.map((agreement) => {
                    const aData = agreement.data as any;
                    const sourceIndex = agreements.indexOf(agreement) + 1;
                    const label = `${CONTRACT_TYPE_LABELS[agreement.type]} (${sourceIndex})`;
                    const assetCount = aData.collateralAssets?.length || 0;
                    return (
                      <button
                        key={agreement.id}
                        onClick={() => {
                          const copied: CollateralAsset[] = JSON.parse(JSON.stringify(aData.collateralAssets));
                          onChange({
                            ...data,
                            collateralAssets: copied,
                            collateralValue: aData.collateralValue || data.collateralValue || ''
                          });
                          setShowCopyCollateralMenu(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-xs flex items-center gap-2 transition-colors hover:bg-blue-50 text-slate-700"
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <Copy size={11} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{label}</div>
                          <div className="text-[10px] text-slate-400">
                            {aData.contractNo || 'ไม่มีเลขสัญญา'} • {assetCount} รายการ
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">มูลค่ารวมหลักประกัน (บาท)</label>
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

          <div className="border-t border-blue-200 pt-4">
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600">ทรัพย์สินหลักประกัน</label>
            </div>
            <div className="space-y-4">
              {(data.collateralAssets || []).map((asset, idx) => (
                <div key={idx} className="p-3 border rounded-md bg-gray-50 space-y-3 relative border-blue-200">
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
                          onChange({ ...data, collateralAssets: newAssets });
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm text-xs p-1 border focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-blue-700"
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
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-3 bg-white p-4 rounded-md border border-gray-100 shadow-sm transition-all">
                      <div className="col-span-2 mb-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center justify-between">
                        <label className="text-xs font-bold text-blue-800 uppercase tracking-tight">ประเภทการจำนอง:</label>
                        <div className="flex gap-6">
                          <label className="inline-flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              checked={!asset.landDetails.landType || asset.landDetails.landType === 'empty'}
                              onChange={() => {
                                const newAssets = [...data.collateralAssets];
                                newAssets[idx] = {
                                  ...newAssets[idx],
                                  landDetails: { ...newAssets[idx].landDetails!, landType: 'empty' }
                                };
                                onChange({ ...data, collateralAssets: newAssets });
                              }}
                              className="w-4 h-4 text-blue-600 border-blue-300 focus:ring-blue-500 transition-all cursor-pointer"
                            />
                            <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">ที่ดินเปล่า</span>
                          </label>
                          <label className="inline-flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              checked={asset.landDetails.landType === 'building'}
                              onChange={() => {
                                const newAssets = [...data.collateralAssets];
                                newAssets[idx] = {
                                  ...newAssets[idx],
                                  landDetails: { ...newAssets[idx].landDetails!, landType: 'building' }
                                };
                                onChange({ ...data, collateralAssets: newAssets });
                              }}
                              className="w-4 h-4 text-blue-600 border-blue-300 focus:ring-blue-500 transition-all cursor-pointer"
                            />
                            <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">ที่ดินพร้อมสิ่งปลูกสร้าง</span>
                          </label>
                        </div>
                      </div>
                      {[
                        { label: 'โฉนดเลขที่', key: 'deedNo' },
                        { label: 'เล่ม', key: 'volume' },
                        { label: 'หน้า', key: 'page' },
                        { label: 'ระวาง', key: 'mapSheet' },
                        { label: 'เลขที่ดิน', key: 'landNo' },
                        { label: 'หน้าสำรวจ', key: 'surveyNo' }
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
                          />
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
                onClick={addCollateralAsset}
                className="w-full py-6 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-2 group bg-blue-50/10"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div className="center">
                  <p className="text-sm font-bold">เพิ่มทรัพย์สินหลักประกัน</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Signatories Section */}
      <section className="bg-white p-4 rounded-lg shadow-sm border border-blue-200" onFocusCapture={() => onFocusSection?.('od-signatories')}>
        <h3 className="font-semibold text-md text-blue-700 mb-3">ผู้ลงนาม</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ผู้ให้สินเชื่อฝ่ายที่ 1 (Agile)</label>
            <input
              type="text"
              name="lender1Signatories"
              value={data.lender1Signatories || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ผู้ให้สินเชื่อฝ่ายที่ 2 (TK)</label>
            <input
              type="text"
              name="lender2Signatories"
              value={data.lender2Signatories || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ผู้กู้ (ลูกค้า)</label>
            <input
              type="text"
              name="borrowerSignatories"
              value={data.borrowerSignatories || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
