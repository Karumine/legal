import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import DirectorInput from './DirectorInput';
import ThaiAddressInput from './ThaiAddressInput';
import type { CompanyInfo } from '../types/app';
import { searchCompanyByTaxId } from '../services/dbdService';
import { formatThaiId, formatPhoneNumber } from '../utils/formatters';

interface Props {
  agileInfo: CompanyInfo;
  tkInfo: CompanyInfo;
  customerInfo: CompanyInfo;
  onAgileChange: (info: CompanyInfo) => void;
  onTkChange: (info: CompanyInfo) => void;
  onCustomerChange: (info: CompanyInfo) => void;
}

function InfoFields({ label, info, onChange, showSearch, showEntityType }: {
  label: string;
  info: CompanyInfo;
  onChange: (info: CompanyInfo) => void;
  showSearch?: boolean;
  showEntityType?: boolean;
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleChange = (field: keyof CompanyInfo, value: string) => {
    onChange({ ...info, [field]: value });
  };



  const handleSearch = async () => {
    const cleanTaxId = info.taxId.replace(/-/g, '').trim();
    if (cleanTaxId.length !== 13) {
      setSearchError('กรุณากรอกเลขทะเบียนนิติบุคคลให้ครบ 13 หลัก');
      return;
    }
    setIsSearching(true);
    setSearchError('');
    try {
      const result = await searchCompanyByTaxId(cleanTaxId);
      if (result) {
        onChange({
          ...info,
          companyName: result.companyName,
          address: result.address,
          taxId: formatThaiId(cleanTaxId),
          directors: (result.directors || []).join('\n'),
        });
      } else {
        setSearchError('ไม่พบข้อมูลบริษัท');
      }
    } catch {
      setSearchError('เกิดข้อผิดพลาด');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
      <h4 className="font-bold text-sm text-blue-800 border-b border-blue-100 pb-2">{label}</h4>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">เลข Tax ID</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={info.taxId}
            onChange={(e) => handleChange('taxId', formatThaiId(e.target.value))}
            className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
            placeholder="X-XXXX-XXXXX-XX-X"
          />
          {showSearch && (
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
            >
              {isSearching ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
              {isSearching ? 'ค้นหา...' : 'ค้นหา'}
            </button>
          )}
        </div>
        {searchError && <p className="mt-1 text-xs text-red-500">{searchError}</p>}
      </div>
      {showEntityType && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">ประเภทนิติบุคคล</label>
          <div className="flex gap-4">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                checked={info.entityType === 'company' || !info.entityType}
                onChange={() => handleChange('entityType', 'company')}
                className="text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 font-medium">บริษัท</span>
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                checked={info.entityType === 'partnership'}
                onChange={() => handleChange('entityType', 'partnership')}
                className="text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 font-medium">หอหจก. / ห้างหุ้นส่วนจำกัด</span>
            </label>
          </div>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อบริษัท</label>
        <input
          type="text"
          value={info.companyName}
          onChange={(e) => handleChange('companyName', e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white"
        />
      </div>
      <div>
        <DirectorInput
          label="ชื่อกรรมการ"
          value={info.directors}
          onChange={(val) => handleChange('directors', val)}
          placeholder="นาย/นาง/นางสาว..."
        />
      </div>
      <div>
        <ThaiAddressInput
          value={info.address}
          onChange={(address) => handleChange('address', address)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">เบอร์โทรศัพท์</label>
          <input
            type="text"
            value={info.phone}
            onChange={(e) => handleChange('phone', formatPhoneNumber(e.target.value))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white"
            placeholder="0X-XXX-XXXX"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">จดหมายอิเล็กทรอนิกส์ (E-mail)</label>
          <input
            type="text"
            value={info.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">ผู้ติดต่อ</label>
        <input
          type="text"
          value={info.contactPerson || ''}
          onChange={(e) => handleChange('contactPerson', e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white"
        />
      </div>
    </div>
  );
}

export default function CompanyInfoForm({ 
  agileInfo, 
  tkInfo, 
  customerInfo, 
  onAgileChange, 
  onTkChange, 
  onCustomerChange 
}: Props) {
  return (
    <section className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
        <h3 className="font-bold text-xl text-slate-800">ข้อมูลบริษัท (3 ฝ่าย)</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <InfoFields label="🏢 Agile (ฝ่ายที่ 1)" info={agileInfo} onChange={onAgileChange} showSearch />
          <InfoFields label="👤 ลูกค้า (ฝ่ายที่ 3)" info={customerInfo} onChange={onCustomerChange} showSearch showEntityType />
        </div>
        <div className="space-y-6">
          <InfoFields label="🏢 TK (ฝ่ายที่ 2)" info={tkInfo} onChange={onTkChange} showSearch />
        </div>
      </div>
    </section>
  );
}

