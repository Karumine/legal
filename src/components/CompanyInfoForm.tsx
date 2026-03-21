import { useState } from 'react';
import { Search, Loader2, Plus, Trash2 } from 'lucide-react';
import type { CompanyInfo } from '../types/app';
import { searchCompanyByTaxId } from '../services/dbdService';

interface Props {
  agileInfo: CompanyInfo;
  tkInfo: CompanyInfo;
  customerInfo: CompanyInfo;
  onAgileChange: (info: CompanyInfo) => void;
  onTkChange: (info: CompanyInfo) => void;
  onCustomerChange: (info: CompanyInfo) => void;
}

function InfoFields({ label, info, onChange, showSearch }: {
  label: string;
  info: CompanyInfo;
  onChange: (info: CompanyInfo) => void;
  showSearch?: boolean;
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleChange = (field: keyof CompanyInfo, value: string) => {
    onChange({ ...info, [field]: value });
  };

  const directorNames = info.directors ? info.directors.split(/\s*และ\s*/) : [''];
  
  const handleDirectorChange = (index: number, newName: string) => {
    const newNames = [...directorNames];
    newNames[index] = newName;
    handleChange('directors', newNames.join(' และ '));
  };
  
  const addDirector = () => {
    handleChange('directors', [...directorNames, ''].join(' และ '));
  };
  
  const removeDirector = (index: number) => {
    if (directorNames.length > 1) {
      handleChange('directors', directorNames.filter((_, i) => i !== index).join(' และ '));
    }
  };

  const handleSearch = async () => {
    if (!info.taxId.trim()) {
      setSearchError('กรุณาใส่เลข Tax ID ก่อน');
      return;
    }
    setIsSearching(true);
    setSearchError('');
    try {
      const result = await searchCompanyByTaxId(info.taxId.trim());
      if (result) {
        onChange({
          ...info,
          companyName: result.companyName,
          address: result.address,
          taxId: result.taxId,
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
            onChange={(e) => handleChange('taxId', e.target.value)}
            className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
            placeholder="011XXXXXXXXXX"
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
        <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อกรรมการ</label>
        <div className="space-y-2">
          {directorNames.map((name, idx) => (
            <div key={idx} className="flex gap-2 relative">
              <input
                type="text"
                value={name}
                onChange={(e) => handleDirectorChange(idx, e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white"
                placeholder={directorNames.length > 1 ? `กรรมการคนที่ ${idx + 1}` : 'นาย/นาง/นางสาว...'}
              />
              {directorNames.length > 1 && (
                <button
                  onClick={() => removeDirector(idx)}
                  className="px-2 py-1 text-red-500 hover:text-red-700 bg-red-50 rounded border border-red-200 transition-colors"
                  title="ลบกรรมการ"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <div className="flex justify-end">
            <button
              onClick={addDirector}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors border border-transparent"
            >
              <Plus size={14} /> เพิ่มกรรมการอีกท่าน
            </button>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">ที่อยู่</label>
        <textarea
          value={info.address}
          onChange={(e) => handleChange('address', e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white h-20"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">เบอร์โทรศัพท์</label>
        <input
          type="text"
          value={info.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
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
          <InfoFields label="🏢 Agile (ฝ่ายที่ 1)" info={agileInfo} onChange={onAgileChange} />
          <InfoFields label="👤 ลูกค้า (ฝ่ายที่ 3)" info={customerInfo} onChange={onCustomerChange} showSearch />
        </div>
        <div className="space-y-6">
          <InfoFields label="🏢 TK (ฝ่ายที่ 2)" info={tkInfo} onChange={onTkChange} />
        </div>
      </div>
    </section>
  );
}

