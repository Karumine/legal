import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import provincesData from '../data-location/provinces.json';
import districtsData from '../data-location/districts.json';
import subdistrictsData from '../data-location/subdistricts.json';

// --- Types ---
interface Province {
  id: number;
  provinceCode: number;
  provinceNameEn: string;
  provinceNameTh: string;
}
interface District {
  id: number;
  provinceCode: number;
  districtCode: number;
  districtNameEn: string;
  districtNameTh: string;
  postalCode: number;
}
interface Subdistrict {
  id: number;
  provinceCode: number;
  districtCode: number;
  subdistrictCode: number;
  subdistrictNameEn: string;
  subdistrictNameTh: string;
  postalCode: number;
}

const provinces = provincesData as Province[];
const districts = districtsData as District[];
const subdistricts = subdistrictsData as Subdistrict[];

// --- Searchable Select Component (Shared Internal) ---
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    if (!search) return options;
    const s = search.toLowerCase();
    return options.filter(o => o.label.toLowerCase().includes(s));
  }, [options, search]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div ref={ref} className="relative">
      <div
        className={`flex items-center border rounded-md shadow-sm text-sm p-2 cursor-pointer transition-colors ${
          disabled ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' : 
          isOpen ? 'border-blue-500 ring-1 ring-blue-500 bg-white' : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
      >
        <span className={`flex-1 truncate ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
          {value || placeholder}
        </span>
        <div className="flex items-center gap-0.5 ml-1">
          {value && !disabled && (
            <button type="button" onClick={handleClear} className="p-0.5 hover:text-red-500 text-gray-400 transition-colors">
              <X size={12} />
            </button>
          )}
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-52 overflow-hidden">
          <div className="p-1.5 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="พิมพ์ค้นหา..."
              className="w-full text-sm p-1.5 border border-gray-200 rounded focus:outline-none focus:border-blue-400"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto max-h-40">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-400 text-center">ไม่พบผลลัพธ์</div>
            ) : (
              filtered.map((opt) => (
                <div
                  key={opt.value}
                  className={`px-3 py-1.5 text-sm cursor-pointer transition-colors ${
                    opt.value === value
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Component ---
interface ThaiLocationSelectorProps {
  province: string;
  district: string;
  subDistrict: string;
  onChange: (updates: { province?: string; district?: string; subDistrict?: string }) => void;
  labelPrefix?: string;
}

export default function ThaiLocationSelector({
  province,
  district,
  subDistrict,
  onChange,
  labelPrefix = ''
}: ThaiLocationSelectorProps) {
  
  // Helpers to get codes
  const getProvinceCode = (name: string) => provinces.find(p => p.provinceNameTh === name)?.provinceCode ?? -1;
  const getDistrictCode = (name: string, pCode: number) => districts.find(d => d.districtNameTh === name && d.provinceCode === pCode)?.districtCode ?? -1;

  // Options
  const provinceOptions = useMemo(() => provinces.map(p => ({ label: p.provinceNameTh, value: p.provinceNameTh })), []);
  
  const districtOptions = useMemo(() => {
    const pCode = getProvinceCode(province);
    if (pCode === -1) return [];
    return districts
      .filter(d => d.provinceCode === pCode)
      .map(d => ({ label: d.districtNameTh, value: d.districtNameTh }));
  }, [province]);

  const subDistrictOptions = useMemo(() => {
    const pCode = getProvinceCode(province);
    const dCode = getDistrictCode(district, pCode);
    if (dCode === -1) return [];
    return subdistricts
      .filter(s => s.districtCode === dCode)
      .map(s => ({ label: s.subdistrictNameTh, value: s.subdistrictNameTh }));
  }, [province, district]);

  const isBangkok = province === 'กรุงเทพมหานคร';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-gray-500">{labelPrefix}จังหวัด</label>
        <SearchableSelect
          options={provinceOptions}
          value={province}
          onChange={(val) => {
            onChange({ province: val, district: '', subDistrict: '' });
          }}
          placeholder="เลือกจังหวัด"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-semibold text-gray-500">{labelPrefix}{isBangkok ? 'เขต' : 'อำเภอ'}</label>
        <SearchableSelect
          options={districtOptions}
          value={district}
          onChange={(val) => {
            onChange({ district: val, subDistrict: '' });
          }}
          placeholder={province ? `เลือก${isBangkok ? 'เขต' : 'อำเภอ'}` : 'กรุณาเลือกจังหวัดก่อน'}
          disabled={!province}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-semibold text-gray-500">{labelPrefix}{isBangkok ? 'แขวง' : 'ตำบล'}</label>
        <SearchableSelect
          options={subDistrictOptions}
          value={subDistrict}
          onChange={(val) => {
            onChange({ subDistrict: val });
          }}
          placeholder={district ? `เลือก${isBangkok ? 'แขวง' : 'ตำบล'}` : 'กรุณาเลือกอำเภอก่อน'}
          disabled={!district}
        />
      </div>
    </div>
  );
}
