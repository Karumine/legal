import { useEffect, useRef, useState } from 'react';
import { Copy, Plus, Search, Trash2, UserPlus, Loader2 } from 'lucide-react';
import type { GuarantorData, Agreement, CompanyInfo } from '../types/app';
import { CONTRACT_TYPE_LABELS } from '../types/app';
import { formatThaiId, formatPhoneNumber } from '../utils/formatters';
import { searchCompanyByTaxId } from '../services/dbdService';
import ThaiAddressInput from './ThaiAddressInput';

interface Props {
  data: GuarantorData[];
  onChange: (data: GuarantorData[]) => void;
  agreements: Agreement[];
  customerInfo: CompanyInfo;
}

export default function GuarantorForm({ data, onChange, agreements, customerInfo }: Props) {
  const prevAgreementsRef = useRef<string[]>([]);
  const mainAgreements = agreements; // Show all main contracts as requested
  const [searchingId, setSearchingId] = useState<string | null>(null);

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

  const updateGuarantor = (id: string, field: keyof GuarantorData, value: any) => {
    onChange(
      data.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const addGuarantor = () => {
    const newGuarantor: GuarantorData = {
      id: Date.now().toString(),
      contractNo: `AGA/XX-SUR`,
      contractDate: mainAgreements[0]?.data.contractDate || '',
      guarantorName: '',
      guarantorIdCard: '',
      guarantorAddress: '',
      isMarried: false,
      spouseName: '',
      spouseIdCard: '',
      spouseAddress: '',
      selectedAgreementIds: mainAgreements.map(a => a.id), // Default to all
    };
    onChange([...data, newGuarantor]);
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

    updateGuarantor(guarantorId, 'selectedAgreementIds', newIds);
  };

  const handleDBDSearch = async (guarantorId: string, taxId: string) => {
    const cleanTaxId = taxId.replace(/-/g, '').trim();
    if (cleanTaxId.length !== 13) {
      alert('กรุณากรอกเลขทะเบียนนิติบุคคลให้ครบ 13 หลัก');
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
                isMarried: false // Corporate guarantors aren't "married"
              }
              : g
          )
        );
      } else {
        alert('ไม่พบข้อมูลนิติบุคคลนี้ในระบบ DBD');
      }
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการดึงข้อมูลจาก DBD');
    } finally {
      setSearchingId(null);
    }
  };

  return (
    <section className="bg-white p-4 rounded-lg shadow-sm border border-emerald-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <h3 className="font-semibold text-lg text-emerald-700">สัญญาค้ำประกัน (ผู้ค้ำ)</h3>
        </div>
        <button
          onClick={addGuarantor}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium hover:bg-emerald-100 border border-emerald-200 transition-colors"
        >
          <UserPlus size={14} /> เพิ่มผู้ค้ำประกัน
        </button>
      </div>

      <div className="space-y-6">
        {data.map((guarantor, index) => (
          <div key={guarantor.id} className="relative p-4 border border-emerald-100 rounded-lg bg-emerald-50/30">
            {data.length > 1 && (
              <button
                onClick={() => removeGuarantor(guarantor.id)}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1"
                title="ลบผู้ค้ำคนนี้"
              >
                <Trash2 size={16} />
              </button>
            )}

            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                {index + 1}
              </span>
              <h4 className="font-medium text-emerald-800 text-sm">ผู้ค้ำประกันคนที่ {index + 1}</h4>
            </div>

            <div className="space-y-4">
              {/* Contract Selection */}
              <div className="pb-4 border-b border-emerald-100/50">
                <label className="block text-xs font-medium text-gray-600 mb-2">เลือกสัญญาหลักที่ค้ำประกัน</label>
                <div className="space-y-1 border border-gray-300 rounded-md p-2 bg-slate-50/50 mt-1.5">
                  {mainAgreements.map(agreement => {
                    const hp = agreement.data as any; // Can be any main contract data
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

              {/* Internal Guarantee Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">เลขที่สัญญาค้ำ</label>
                  <input
                    type="text"
                    value={guarantor.contractNo}
                    onChange={(e) => updateGuarantor(guarantor.id, 'contractNo', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2 border"
                    placeholder="AGA/XX-SUR"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">วันที่ทำสัญญาค้ำ</label>
                  <input
                    type="date"
                    value={guarantor.contractDate}
                    onChange={(e) => updateGuarantor(guarantor.id, 'contractDate', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2 border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อผู้ค้ำประกัน</label>
                <input
                  type="text"
                  value={guarantor.guarantorName}
                  onChange={(e) => updateGuarantor(guarantor.id, 'guarantorName', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2 border"
                  placeholder="นาย/นาง/นางสาว ..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">เลขบัตรประจำตัวประชาชน</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={guarantor.guarantorIdCard}
                      onChange={(e) => updateGuarantor(guarantor.id, 'guarantorIdCard', formatThaiId(e.target.value))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 pr-10 border"
                      placeholder="X-XXXX-XXXXX-XX-X"
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
                    onChange={(e) => updateGuarantor(guarantor.id, 'phone', formatPhoneNumber(e.target.value))}
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
                    onClick={() => updateGuarantor(guarantor.id, 'guarantorAddress', customerInfo.address)}
                    className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 text-[10px] font-medium hover:bg-emerald-100 active:scale-95 transition-all shadow-sm"
                  >
                    <Copy size={12} />
                    ใช้ที่อยู่เดียวกับลูกค้า (ฝ่ายที่ 3)
                  </button>
                </div>
                <ThaiAddressInput
                  value={guarantor.guarantorAddress}
                  onChange={(address) => updateGuarantor(guarantor.id, 'guarantorAddress', address)}
                />
              </div>

              {/* Marital Status */}
              <div className="pt-3 border-t border-emerald-100">
                <label className="block text-xs font-medium text-gray-600 mb-2">สถานภาพสมรส</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={!guarantor.isMarried}
                      onChange={() => updateGuarantor(guarantor.id, 'isMarried', false)}
                      className="text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">โสด / ไม่ได้จดทะเบียนสมรส</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={guarantor.isMarried}
                      onChange={() => updateGuarantor(guarantor.id, 'isMarried', true)}
                      className="text-emerald-600 border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">สมรสจดทะเบียน</span>
                  </label>
                </div>
              </div>

              {guarantor.isMarried && (
                <div className="space-y-3 pt-3 border-t border-emerald-100 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อคู่สมรส</label>
                    <input
                      type="text"
                      value={guarantor.spouseName}
                      onChange={(e) => updateGuarantor(guarantor.id, 'spouseName', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2 border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">เลขบัตรปชช. คู่สมรส</label>
                      <input
                        type="text"
                        value={guarantor.spouseIdCard}
                        onChange={(e) => updateGuarantor(guarantor.id, 'spouseIdCard', formatThaiId(e.target.value))}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2 border"
                        placeholder="X-XXXX-XXXXX-XX-X"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-gray-600">ที่อยู่คู่สมรส</label>
                      <button
                        type="button"
                        onClick={() => updateGuarantor(guarantor.id, 'spouseAddress', guarantor.guarantorAddress)}
                        className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 text-[10px] font-medium hover:bg-emerald-100 active:scale-95 transition-all shadow-sm"
                      >
                        <Copy size={12} />
                        ใช้ที่อยู่เดียวกับผู้ค้ำประกัน
                      </button>
                    </div>
                    <ThaiAddressInput
                      value={guarantor.spouseAddress}
                      onChange={(address) => updateGuarantor(guarantor.id, 'spouseAddress', address)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.length > 2 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={addGuarantor}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-bold hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <Plus size={18} /> เพิ่มผู้ค้ำประกันอีกคน
          </button>
        </div>
      )}
    </section>
  );
}

