import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChevronDown, X, MapPin } from 'lucide-react';
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

interface AddressFields {
  houseNo: string;
  moo: string;
  soi: string;
  road: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

interface Props {
  value: string;
  onChange?: (address: string) => void;
  onPostalCodeChange?: (postalCode: string) => void;
  onAddressChange?: (address: string, postalCode: string) => void;
  className?: string;
}

// --- Helpers ---
const provinces = provincesData as Province[];
const districts = districtsData as District[];
const subdistricts = subdistrictsData as Subdistrict[];

function composeAddress(f: AddressFields): string {
  const parts: string[] = [];
  if (f.houseNo) parts.push(`เลขที่ ${f.houseNo}`);
  if (f.moo) parts.push(`หมู่ที่ ${f.moo}`);
  if (f.soi) parts.push(`ซอย${f.soi}`);
  if (f.road) parts.push(`ถนน${f.road}`);

  // Bangkok uses แขวง/เขต, other provinces use ตำบล/อำเภอ
  const isBangkok = f.province === 'กรุงเทพมหานคร';
  if (f.subdistrict) parts.push(`${isBangkok ? 'แขวง' : 'ตำบล'}${f.subdistrict}`);
  if (f.district) parts.push(`${isBangkok ? 'เขต' : 'อำเภอ'}${f.district}`);
  if (f.province) parts.push(`จังหวัด${f.province}`);
  if (f.postalCode) parts.push(f.postalCode);
  return parts.join(' ');
}

function parseAddress(address: string): AddressFields {
  const fields: AddressFields = {
    houseNo: '', moo: '', soi: '', road: '',
    subdistrict: '', district: '', province: '', postalCode: '',
  };
  if (!address) return fields;

  // Extract postal code first
  const postalCode = address.match(/\b(\d{5})\b/);
  if (postalCode) fields.postalCode = postalCode[1];

  // Try to extract house number with เลขที่ prefix
  const houseNo = address.match(/เลขที่\s*(\S+)/);
  if (houseNo) {
    fields.houseNo = houseNo[1];
  } else {
    // Fallback: number at the start of address (e.g., "69 ถนน...")
    const leadingNum = address.match(/^(\d+[\d/]*)\s/);
    if (leadingNum) fields.houseNo = leadingNum[1];
  }

  const moo = address.match(/หมู่(?:ที่)?\s*(\S+)/);
  if (moo) fields.moo = moo[1];

  const soi = address.match(/ซอย\s*(\S+)/);
  if (soi) fields.soi = soi[1];

  const road = address.match(/ถนน\s*(\S+)/);
  if (road) fields.road = road[1];

  // Extract subdistrict (with prefix)
  const subdistrictMatch = address.match(/(?:ตำบล|แขวง)\s*(\S+)/);
  if (subdistrictMatch) fields.subdistrict = subdistrictMatch[1];

  // Extract district (with prefix)
  const districtMatch = address.match(/(?:อำเภอ|เขต)\s*(\S+)/);
  if (districtMatch) fields.district = districtMatch[1];

  // Extract province — try จังหวัด prefix first
  const provinceMatch = address.match(/จังหวัด\s*(\S+)/);
  if (provinceMatch) {
    fields.province = provinceMatch[1];
  } else {
    // Fallback: match province name anywhere in the string (without จังหวัด prefix)
    // Check from longest to shortest to avoid partial matches
    const sortedProvinces = [...provinces].sort(
      (a, b) => b.provinceNameTh.length - a.provinceNameTh.length
    );
    for (const p of sortedProvinces) {
      if (address.includes(p.provinceNameTh)) {
        fields.province = p.provinceNameTh;
        break;
      }
    }
  }

  // --- Reverse lookup: find district/subdistrict by name from database ---
  // This handles DBD addresses that don't have Thai prefixes
  if (fields.province) {
    const pc = provinces.find(p => p.provinceNameTh === fields.province)?.provinceCode;
    if (pc) {
      // Find district by name in address if not already found
      if (!fields.district) {
        const provinceDists = districts
          .filter(d => d.provinceCode === pc)
          .sort((a, b) => b.districtNameTh.length - a.districtNameTh.length); // longest first
        for (const d of provinceDists) {
          if (address.includes(d.districtNameTh)) {
            fields.district = d.districtNameTh;
            break;
          }
        }
      }

      // Find subdistrict by name in address if not already found
      if (!fields.subdistrict) {
        const distCode = fields.district
          ? districts.find(d => d.districtNameTh === fields.district && d.provinceCode === pc)?.districtCode
          : undefined;
        const candidateSubs = subdistricts
          .filter(s => s.provinceCode === pc && (distCode ? s.districtCode === distCode : true))
          .sort((a, b) => b.subdistrictNameTh.length - a.subdistrictNameTh.length); // longest first
        for (const s of candidateSubs) {
          if (address.includes(s.subdistrictNameTh)) {
            fields.subdistrict = s.subdistrictNameTh;
            // Also fill district if still empty
            if (!fields.district) {
              const dist = districts.find(d => d.districtCode === s.districtCode);
              if (dist) fields.district = dist.districtNameTh;
            }
            break;
          }
        }
      }

      // Auto-fill postal code from subdistrict data if not already found
      if (!fields.postalCode && fields.subdistrict) {
        const distCode = fields.district
          ? districts.find(d => d.districtNameTh === fields.district && d.provinceCode === pc)?.districtCode
          : undefined;
        const sub = subdistricts.find(
          s => s.subdistrictNameTh === fields.subdistrict &&
               s.provinceCode === pc &&
               (distCode ? s.districtCode === distCode : true)
        );
        if (sub) {
          fields.postalCode = sub.postalCode.toString();
        }
      }
    }
  }

  return fields;
}

// --- Searchable Select Component ---
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
          disabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 
          isOpen ? 'border-blue-500 ring-1 ring-blue-500 bg-white' : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
      >
        <span className={`flex-1 truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>
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
              <div className="px-3 py-2 text-xs text-gray-400">ไม่พบผลลัพธ์</div>
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
export default function ThaiAddressInput({ value, onChange, onPostalCodeChange, onAddressChange, className = '' }: Props) {
  const [fields, setFields] = useState<AddressFields>(() => parseAddress(value));
  const isInitialMount = useRef(true);

  // Parse incoming value on initial mount or when value changes externally
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Only re-parse if the composed value differs from the current value
    const composed = composeAddress(fields);
    if (value !== composed) {
      setFields(parseAddress(value));
    }
  }, [value]);

  // Compose and emit on field change
  const updateField = useCallback((field: keyof AddressFields, val: string) => {
    setFields(prev => {
      const next = { ...prev, [field]: val };

      // Cascading resets
      if (field === 'province') {
        next.district = '';
        next.subdistrict = '';
        next.postalCode = '';
      } else if (field === 'district') {
        next.subdistrict = '';
        next.postalCode = '';
      } else if (field === 'subdistrict') {
        // Auto-fill postal code when subdistrict is selected
        if (val) {
          const found = subdistricts.find(
            s => s.subdistrictNameTh === val &&
                 s.districtCode === selectedDistrictCode(next) &&
                 s.provinceCode === selectedProvinceCode(next)
          );
          if (found) {
            next.postalCode = found.postalCode.toString();
          }
        }
      }

      // Emit the composed address
      const composed = composeAddress(next);
      // Use setTimeout to avoid calling onChange during render
      setTimeout(() => {
        if (onChange) {
          onChange(composed);
        }
        if (onPostalCodeChange) {
          onPostalCodeChange(next.postalCode);
        }
        if (onAddressChange) {
          onAddressChange(composed, next.postalCode);
        }
      }, 0);
      return next;
    });
  }, [onChange, onPostalCodeChange, onAddressChange]);

  // Get province code from name
  const selectedProvinceCode = (f: AddressFields): number => {
    const p = provinces.find(p => p.provinceNameTh === f.province);
    return p?.provinceCode ?? -1;
  };

  // Get district code from name + province
  const selectedDistrictCode = (f: AddressFields): number => {
    const pc = selectedProvinceCode(f);
    const d = districts.find(d => d.districtNameTh === f.district && d.provinceCode === pc);
    return d?.districtCode ?? -1;
  };

  // Filtered options
  const provinceOptions = useMemo(
    () => provinces.map(p => ({ label: p.provinceNameTh, value: p.provinceNameTh })),
    []
  );

  const districtOptions = useMemo(() => {
    const pc = selectedProvinceCode(fields);
    if (pc === -1) return [];
    return districts
      .filter(d => d.provinceCode === pc)
      .map(d => ({ label: d.districtNameTh, value: d.districtNameTh }));
  }, [fields.province]);

  const subdistrictOptions = useMemo(() => {
    const dc = selectedDistrictCode(fields);
    if (dc === -1) return [];
    return subdistricts
      .filter(s => s.districtCode === dc)
      .map(s => ({ label: s.subdistrictNameTh, value: s.subdistrictNameTh }));
  }, [fields.province, fields.district]);

  const isBangkok = fields.province === 'กรุงเทพมหานคร';

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <MapPin size={13} className="text-blue-500" />
        <span className="text-xs font-medium text-gray-500">ที่อยู่</span>
      </div>

      {/* Row 1: เลขที่ หมู่ ซอย ถนน */}
      <div className="grid grid-cols-4 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-gray-500 mb-0.5">เลขที่</label>
          <input
            type="text"
            value={fields.houseNo}
            onChange={(e) => updateField('houseNo', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
            placeholder="เลขที่"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-500 mb-0.5">หมู่</label>
          <input
            type="text"
            value={fields.moo}
            onChange={(e) => updateField('moo', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
            placeholder="หมู่"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-500 mb-0.5">ซอย</label>
          <input
            type="text"
            value={fields.soi}
            onChange={(e) => updateField('soi', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
            placeholder="ซอย"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-500 mb-0.5">ถนน</label>
          <input
            type="text"
            value={fields.road}
            onChange={(e) => updateField('road', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
            placeholder="ถนน"
          />
        </div>
      </div>

      {/* Row 2: จังหวัด อำเภอ */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-gray-500 mb-0.5">จังหวัด</label>
          <SearchableSelect
            options={provinceOptions}
            value={fields.province}
            onChange={(val) => updateField('province', val)}
            placeholder="เลือกจังหวัด"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-500 mb-0.5">{isBangkok ? 'เขต' : 'อำเภอ'}</label>
          <SearchableSelect
            options={districtOptions}
            value={fields.district}
            onChange={(val) => updateField('district', val)}
            placeholder={`เลือก${isBangkok ? 'เขต' : 'อำเภอ'}`}
            disabled={!fields.province}
          />
        </div>
      </div>

      {/* Row 3: ตำบล ไปรษณีย์ */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-gray-500 mb-0.5">{isBangkok ? 'แขวง' : 'ตำบล'}</label>
          <SearchableSelect
            options={subdistrictOptions}
            value={fields.subdistrict}
            onChange={(val) => updateField('subdistrict', val)}
            placeholder={`เลือก${isBangkok ? 'แขวง' : 'ตำบล'}`}
            disabled={!fields.district}
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-500 mb-0.5">รหัสไปรษณีย์</label>
          <input
            type="text"
            value={fields.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white"
            placeholder="รหัสไปรษณีย์"
          />
        </div>
      </div>
    </div>
  );
}
