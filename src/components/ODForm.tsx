import React, { useEffect, useState, useRef } from 'react';
import { Copy, ChevronDown } from 'lucide-react';
import type { ODData, LessorInfo, Agreement } from '../types/app';
import { CONTRACT_TYPE_LABELS } from '../types/app';
import { thaiBahtText } from '../utils/thaiBahtText';
import { formatCurrency } from '../utils/formatters';


interface Props {
  data: ODData;

  agreements?: Agreement[];
  currentAgreementId?: string;
  onChange: (data: ODData) => void;
  onFocusSection?: (sectionId: string) => void;
}

export default function ODForm({ data, onChange, agreements = [], currentAgreementId, onFocusSection }: Props) {



  const [showCopyLocationMenu, setShowCopyLocationMenu] = useState(false);
  const copyLocationMenuRef = useRef<HTMLDivElement>(null);

  // Close copy menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
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



  // Calculated Credit Limits
  const loanAmt = parseFloat(data.loanAmount?.replace(/,/g, '') || '0') || 0;
  const p1 = parseFloat(data.lender1?.proportion || '0') || 0;
  const p2 = parseFloat(data.lender2?.proportion || '0') || 0;

  const limit1 = Math.floor(loanAmt * (p1 / 100));
  const limit2 = Math.floor(loanAmt * (p2 / 100));

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
      {/* Annex 4 Details */}
      <section className="bg-white p-4 rounded-lg shadow-sm border border-blue-200" onFocusCapture={() => onFocusSection?.('od-annex4')}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <h3 className="font-semibold text-lg text-blue-700">เอกสารแนบท้าย 4 (แจ้งเปลี่ยนช่องทางรับเงิน)</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">เลขที่ใบสั่งซื้อ (PO No.)</label>
              <input
                type="text"
                name="annex4PONo"
                value={data.annex4PONo || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white"
                placeholder="ระบุเลขที่ใบสั่งซื้อ"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ลงวันที่ใบสั่งซื้อ</label>
              <input
                type="date"
                name="annex4PODate"
                value={data.annex4PODate || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">เลขที่ใบวางบิล (Bill No.)</label>
              <input
                type="text"
                name="annex4BillNo"
                value={data.annex4BillNo || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white"
                placeholder="ระบุเลขที่ใบวางบิล"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ลงวันที่ใบวางบิล</label>
              <input
                type="date"
                name="annex4BillDate"
                value={data.annex4BillDate || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">กำหนดส่งคืนเอกสาร (ภายในวันที่)</label>
            <input
              type="date"
              name="annex4ReturnDate"
              value={data.annex4ReturnDate || ''}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
