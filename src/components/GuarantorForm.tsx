import { useEffect, useRef, useState } from 'react';
import { Copy, Search, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import type { GuarantorData, Agreement, CompanyInfo } from '../types/app';
import { CONTRACT_TYPE_LABELS } from '../types/app';
import { formatThaiId, formatPhoneNumber } from '../utils/formatters';
import { searchCompanyByTaxId } from '../services/dbdService';
import ThaiAddressInput from './ThaiAddressInput';
import { useNotification } from '../contexts/NotificationContext';

interface Props {
  title?: string;
  data: GuarantorData[];
  onChange: (data: GuarantorData[]) => void;
  agreements: Agreement[];
  customerInfo: CompanyInfo;
  onFocusSection?: (sectionId: string) => void;
}

export default function GuarantorForm({ title = 'สัญญาค้ำประกัน (ผู้ค้ำ)', data, onChange, agreements, customerInfo, onFocusSection }: Props) {
  const { notify } = useNotification();
  const prevAgreementsRef = useRef<string[]>([]);
  const mainAgreements = agreements; // Show all main contracts as requested
  const [searchingId, setSearchingId] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);

  // Auto-select ONLY newly added agreements for ALL guarantors
  useEffect(() => {
    const currentIds = mainAgreements.map(a => a.id);
    const newIds = currentIds.filter(id => !prevAgreementsRef.current.includes(id));

    if (newIds.length > 0) {
      const newData = data.map(guarantor => {
        const toSelect = newIds.filter(id => !(guarantor.selectedAgreementIds || []).includes(id));
        if (toSelect.length > 0) {
          return {
            ...guarantor,
            selectedAgreementIds: [...(guarantor.selectedAgreementIds || []), ...toSelect]
          };
        }
        return guarantor;
      });

      const hasChanged = newData.some((g, i) => g !== data[i]);
      if (hasChanged) {
        onChange(newData);
      }
    }
    prevAgreementsRef.current = currentIds;
  }, [mainAgreements, data, onChange]);

  const updateGuarantor = (id: string, updates: Partial<GuarantorData>) => {
    onChange(
      data.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const removeGuarantor = (id: string) => {
    if (data.length > 1) {
      onChange(data.filter((g) => g.id !== id));
    }
  };

  const toggleAgreement = (guarantorId: string, agreementId: string) => {
    const guarantor = data.find(g => g.id === guarantorId);
    if (!guarantor) return;

    const currentIds = guarantor.selectedAgreementIds || [];
    const newIds = currentIds.includes(agreementId)
      ? currentIds.filter(id => id !== agreementId)
      : [...currentIds, agreementId];

    updateGuarantor(guarantorId, { selectedAgreementIds: newIds });
  };

  const handleDBDSearch = async (guarantorId: string, taxId: string) => {
    const cleanTaxId = taxId.replace(/-/g, '').trim();
    if (cleanTaxId.length !== 13) {
      notify('กรุณากรอกเลขทะเบียนนิติบุคคลให้ครบ 13 หลัก', 'error');
      return;
    }

    setSearchingId(guarantorId);
    try {
      const result = await searchCompanyByTaxId(cleanTaxId);
      if (result) {
        onChange(
          data.map((g) =>
            g.id === guarantorId
              ? {
                ...g,
                guarantorName: result.companyName,
                guarantorAddress: result.address,
                directors: result.directors?.join(', '),
                guarantorType: 'company',
                isMarried: false // Corporate guarantors aren't "married"
              }
              : g
          )
        );
      } else {
        notify('ไม่พบข้อมูลนิติบุคคลนี้ในระบบ DBD', 'error');
      }
    } catch (error) {
      console.error(error);
      notify('เกิดข้อผิดพลาดในการดึงข้อมูลจาก DBD', 'error');
    } finally {
      setSearchingId(null);
    }
  };

  const toggleCollapse = (id: string) => {
    setCollapsedIds(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  return (
    <section className="bg-white p-4 rounded-lg shadow-sm border border-emerald-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
        <h3 className="font-semibold text-lg text-emerald-700">{title}</h3>
      </div>

      <div className="space-y-6">
        {data.map((guarantor, index) => (
          <div key={guarantor.id} className="relative p-4 border border-emerald-100 rounded-lg bg-emerald-50/30">
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer hover:bg-emerald-100/50 p-2 -m-2 rounded-lg transition-colors group"
              onClick={() => toggleCollapse(guarantor.id)}
              onFocusCapture={() => onFocusSection?.(`guarantor-${index + 1}`)}
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-sm">
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-bold text-emerald-800 text-sm">ผู้ค้ำประกันคนที่ {index + 1}</h4>
                  {collapsedIds.includes(guarantor.id) && guarantor.guarantorName && (
                    <p className="text-[10px] text-emerald-600 font-medium truncate max-w-[200px] animate-in fade-in duration-300">
                      {guarantor.guarantorName}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {data.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGuarantor(guarantor.id);
                    }}
                    className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-md transition-colors mr-1"
                    title="ลบผู้ค้ำคนนี้"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <div className="text-emerald-500 group-hover:text-emerald-700 transition-colors">
                  {collapsedIds.includes(guarantor.id) ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </div>
              </div>
            </div>

            {!collapsedIds.includes(guarantor.id) && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200 origin-top">
              {/* Contract Selection */}
              <div className="pb-4 border-b border-emerald-100/50">
                <label className="block text-xs font-medium text-gray-600 mb-2">เลือกสัญญาหลักที่ค้ำประกัน</label>
                <div className="space-y-1 border border-gray-300 rounded-md p-2 bg-slate-50/50 mt-1.5">
                  {mainAgreements.map(agreement => {
                    const hp = agreement.data as any;
                    const isSelected = (guarantor.selectedAgreementIds || []).includes(agreement.id);
                    return (
                      <div key={agreement.id} className="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-white transition-colors">
                        <label className="flex items-center gap-2 text-sm cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleAgreement(guarantor.id, agreement.id)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          />
                          <div className="flex items-center gap-1.5 leading-none">
                            <span className="font-medium text-gray-700">{CONTRACT_TYPE_LABELS[agreement.type]}</span>
                            <span className="text-gray-400 text-xs">({hp.contractNo || 'ยังไม่มีเลขที่'})</span>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Guarantor Type Selection */}
              <div className="pb-4 border-b border-emerald-100/50">
                <label className="block text-xs font-medium text-gray-600 mb-2">ประเภทผู้ค้ำประกัน</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={guarantor.guarantorType === 'person' || !guarantor.guarantorType}
                      onChange={() => updateGuarantor(guarantor.id, { guarantorType: 'person' })}
                      className="text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">บุคคลธรรมดา</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={guarantor.guarantorType === 'company'}
                      onChange={() => updateGuarantor(guarantor.id, { guarantorType: 'company' })}
                      className="text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">บริษัทจำกัด</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={guarantor.guarantorType === 'partnership'}
                      onChange={() => updateGuarantor(guarantor.id, { guarantorType: 'partnership' })}
                      className="text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">ห้างหุ้นส่วน</span>
                  </label>
                </div>
              </div>

              {/* Guarantor Nationality (Only for person) */}
              {(!guarantor.guarantorType || guarantor.guarantorType === 'person') && (
                <div className="pb-4 border-b border-emerald-100/50 animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="block text-xs font-medium text-gray-600 mb-2">สัญชาติ</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={!guarantor.nationality || guarantor.nationality === 'thai'}
                        onChange={() => updateGuarantor(guarantor.id, { nationality: 'thai', guarantorIdCard: '' })}
                        className="text-emerald-600 border-gray-300 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">คนไทย (บัตรประชาชน)</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={guarantor.nationality === 'foreigner'}
                        onChange={() => updateGuarantor(guarantor.id, { nationality: 'foreigner', guarantorIdCard: '' })}
                        className="text-emerald-600 border-gray-300 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">ชาวต่างชาติ (พาสปอร์ต)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Internal Guarantee Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">เลขที่สัญญาค้ำ</label>
                  <input
                    type="text"
                    value={guarantor.contractNo}
                    onChange={(e) => updateGuarantor(guarantor.id, { contractNo: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2 border"
                    placeholder="AGA/XX-SUR"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">วันที่ทำสัญญาค้ำ</label>
                  <input
                    type="date"
                    value={guarantor.contractDate}
                    onChange={(e) => updateGuarantor(guarantor.id, { contractDate: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2 border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {guarantor.guarantorType === 'person' || !guarantor.guarantorType ? 'ชื่อผู้ค้ำประกัน' : 'ชื่อจดทะเบียน (บริษัท/ห้างหุ้นส่วน)'}
                </label>
                <input
                  type="text"
                  value={guarantor.guarantorName}
                  onChange={(e) => updateGuarantor(guarantor.id, { guarantorName: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2 border"
                  placeholder={guarantor.guarantorType === 'person' || !guarantor.guarantorType ? 'นาย/นาง/นางสาว ...' : 'ระบุชื่อนิติบุคคล ...'}
                />
              </div>

              {(guarantor.guarantorType === 'company' || guarantor.guarantorType === 'partnership') && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="block text-xs font-medium text-gray-600 mb-1">กรรมการผู้มีอำนาจ / หุ้นส่วนผู้จัดการ</label>
                  <textarea
                    value={guarantor.directors || ''}
                    onChange={(e) => updateGuarantor(guarantor.id, { directors: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2 border h-16"
                    placeholder="ระบุชื่อกรรมการผู้มีอำนาจลงนาม ..."
                  />
                  <p className="text-[10px] text-gray-500 mt-1 italic">หากมีหลายคนให้เว้นวรรคด้วย "และ" หรือ ","</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {guarantor.guarantorType === 'company' || guarantor.guarantorType === 'partnership' 
                      ? 'เลขทะเบียนนิติบุคคล' 
                      : (guarantor.nationality === 'foreigner' ? 'เลขพาสปอร์ต / Passport No.' : 'เลขบัตรประจำตัวประชาชน')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={guarantor.guarantorIdCard}
                      onChange={(e) => {
                         const isForeigner = guarantor.nationality === 'foreigner';
                         const isCorporate = guarantor.guarantorType === 'company' || guarantor.guarantorType === 'partnership';
                         let val = e.target.value;
                         if (!isForeigner) {
                           val = isCorporate ? val.replace(/\D/g, '').slice(0, 13) : formatThaiId(val);
                         }
                         updateGuarantor(guarantor.id, { guarantorIdCard: val });
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 pr-10 border"
                      placeholder={guarantor.guarantorType === 'company' || guarantor.guarantorType === 'partnership' ? '0XXXXXXXXXXXX' : (guarantor.nationality === 'foreigner' ? 'Passport No.' : 'X-XXXX-XXXXX-XX-X')}
                    />
                    <button
                      type="button"
                      onClick={() => handleDBDSearch(guarantor.id, guarantor.guarantorIdCard)}
                      disabled={searchingId === guarantor.id}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-emerald-600 hover:text-emerald-700 disabled:text-gray-400 transition-colors"
                      title="ค้นหาข้อมูลจาก DBD"
                    >
                      {searchingId === guarantor.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Search size={16} />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={guarantor.phone || ''}
                    onChange={(e) => updateGuarantor(guarantor.id, { phone: formatPhoneNumber(e.target.value) })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
                    placeholder="08X-XXX-XXXX"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-gray-600">ที่อยู่ผู้ค้ำประกัน</label>
                  <button
                    type="button"
                    onClick={() => {
                      updateGuarantor(guarantor.id, { 
                        guarantorAddress: customerInfo.address,
                        guarantorPostalCode: customerInfo.postalCode || ''
                      });
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 text-[10px] font-medium hover:bg-emerald-100 active:scale-95 transition-all shadow-sm"
                  >
                    <Copy size={12} />
                    ใช้ที่อยู่เดียวกับลูกค้า (ฝ่ายที่ 3)
                  </button>
                </div>
                <ThaiAddressInput
                  value={guarantor.guarantorAddress}
                  onAddressChange={(address, code) => updateGuarantor(guarantor.id, { guarantorAddress: address, guarantorPostalCode: code })}
                />
              </div>

              {/* Marital Status (Only for Individuals) */}
              {(guarantor.guarantorType === 'person' || !guarantor.guarantorType) && (
                <div className="pt-3 border-t border-emerald-100 animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="block text-xs font-medium text-gray-600 mb-2">สถานภาพสมรส</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={!guarantor.isMarried}
                        onChange={() => updateGuarantor(guarantor.id, { isMarried: false })}
                        className="text-emerald-600 border-gray-300 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">โสด / ไม่ได้จดทะเบียนสมรส</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={guarantor.isMarried}
                        onChange={() => updateGuarantor(guarantor.id, { isMarried: true })}
                        className="text-emerald-600 border-gray-300 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">สมรสจดทะเบียน</span>
                    </label>
                  </div>
                </div>
              )}

              {guarantor.isMarried && (
                <div 
                  className="space-y-3 pt-3 border-t border-emerald-100 animate-in fade-in slide-in-from-top-1 duration-200"
                  onFocusCapture={(e) => {
                    e.stopPropagation();
                    onFocusSection?.(`guarantor-${index + 1}-spouse`);
                  }}
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อคู่สมรส</label>
                    <input
                      type="text"
                      value={guarantor.spouseName}
                      onChange={(e) => updateGuarantor(guarantor.id, { spouseName: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2 border"
                    />
                  </div>
                  <div className="pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="block text-xs font-medium text-gray-600 mb-2">สัญชาติคู่สมรส</label>
                    <div className="flex gap-4">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          checked={!guarantor.spouseNationality || guarantor.spouseNationality === 'thai'}
                          onChange={() => updateGuarantor(guarantor.id, { spouseNationality: 'thai', spouseIdCard: '' })}
                          className="text-emerald-600 border-gray-300 focus:ring-emerald-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">คนไทย (บัตรประชาชน)</span>
                      </label>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          checked={guarantor.spouseNationality === 'foreigner'}
                          onChange={() => updateGuarantor(guarantor.id, { spouseNationality: 'foreigner', spouseIdCard: '' })}
                          className="text-emerald-600 border-gray-300 focus:ring-emerald-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">ชาวต่างชาติ (พาสปอร์ต)</span>
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {guarantor.spouseNationality === 'foreigner' ? 'เลขพาสปอร์ต คู่สมรส / Passport No.' : 'เลขบัตรปชช. คู่สมรส'}
                      </label>
                      <input
                        type="text"
                        value={guarantor.spouseIdCard}
                        onChange={(e) => {
                          const isForeigner = guarantor.spouseNationality === 'foreigner';
                          const val = isForeigner ? e.target.value : formatThaiId(e.target.value);
                          updateGuarantor(guarantor.id, { spouseIdCard: val });
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2 border"
                        placeholder={guarantor.spouseNationality === 'foreigner' ? 'Passport No.' : 'X-XXXX-XXXXX-XX-X'}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-gray-600">ที่อยู่คู่สมรส</label>
                      <button
                        type="button"
                        onClick={() => {
                          updateGuarantor(guarantor.id, { 
                            spouseAddress: guarantor.guarantorAddress,
                            spousePostalCode: guarantor.guarantorPostalCode || ''
                          });
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 text-[10px] font-medium hover:bg-emerald-100 active:scale-95 transition-all shadow-sm"
                      >
                        <Copy size={12} />
                        ใช้ที่อยู่เดียวกับผู้ค้ำประกัน
                      </button>
                    </div>
                    <ThaiAddressInput
                      value={guarantor.spouseAddress}
                      onAddressChange={(address, code) => updateGuarantor(guarantor.id, { spouseAddress: address, spousePostalCode: code })}
                    />
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        ))}
      </div>

      {/* 
      <button
        onClick={addGuarantor}
        className="mt-6 w-full py-10 border-2 border-dashed border-emerald-200 rounded-xl bg-emerald-50/30 hover:bg-emerald-50 hover:border-emerald-400 transition-all group flex flex-col items-center justify-center gap-3"
      >
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
          <Plus size={28} strokeWidth={2.5} />
        </div>
        <div className="text-center">
          <p className="text-emerald-700 font-bold text-base">เพิ่มผู้ค้ำประกัน</p>
          <p className="text-xs text-emerald-600/70 mt-1">ระบุข้อมูลบุคคลหรือนิติบุคคลเพิ่มเติมเพื่อร่วมค้ำประกันสัญญาหลัก</p>
        </div>
      </button>
      */}
    </section>
  );
}

