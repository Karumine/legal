import { useState } from 'react';
import DirectorInput from './DirectorInput';
import ThaiAddressInput from './ThaiAddressInput';
import type { BuybackData, AssetDetail } from '../types/app';
import { ShieldAlert, CheckCircle2, Search, Loader2 } from 'lucide-react';
import { searchCompanyByTaxId } from '../services/dbdService';
import { formatThaiId } from '../utils/formatters';
import { CustomDatePicker } from './CustomDatePicker';

interface Props {
  data: BuybackData;
  parentAssets?: AssetDetail[];
  otherBuybacksSelectedAssetIds?: string[];
  onChange: (data: BuybackData) => void;
  onFocusSection?: (sectionId: string) => void;
}

export default function BuybackForm({ data, parentAssets = [], otherBuybacksSelectedAssetIds = [], onChange, onFocusSection }: Props) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const updateBuyback = (updates: Partial<BuybackData>) => {
    onChange({ ...data, ...updates });
  };

  const handleSearch = async () => {
    if (!data.vendorTaxId?.trim()) {
      setSearchError('กรุณาใส่เลข Tax ID ก่อน');
      return;
    }
    setIsSearching(true);
    setSearchError('');
    try {
      const result = await searchCompanyByTaxId(data.vendorTaxId.trim());
      if (result) {
        onChange({
          ...data,
          vendorName: result.companyName,
          vendorAddress: result.address,
          vendorPostalCode: result.address.match(/\b(\d{5})\b/)?.[1] || '',
          vendorTaxId: formatThaiId(result.taxId),
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

  const updateTable = (rowIdx: number, field: 'newRate' | 'usedRate', value: string) => {
    const newTable = [...data.buybackTable];
    newTable[rowIdx] = { ...newTable[rowIdx], [field]: value };
    onChange({ ...data, buybackTable: newTable });
  };

  const toggleAsset = (assetId: string) => {
    const current = data.selectedAssetIds || [];
    if (current.includes(assetId)) {
      updateBuyback({ selectedAssetIds: current.filter(id => id !== assetId) });
    } else {
      updateBuyback({ selectedAssetIds: [...current, assetId] });
    }
  };

  const selectedAssets = parentAssets.filter(a => data.selectedAssetIds?.includes(a.id));
  const subtotalSelected = selectedAssets.reduce((sum, a) => sum + (parseFloat(a.totalAmount.replace(/,/g, '')) || 0), 0);
  const downPercentageNum = parseFloat(data.downPercentage.replace(/,/g, '')) || 0;
  const downAmountNum = subtotalSelected * (downPercentageNum / 100);
  const netValue = subtotalSelected - downAmountNum;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4" onFocusCapture={() => onFocusSection?.('section-vendor')}>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">เลขที่สัญญารับซื้อคืน</label>
          <input
            type="text"
            value={data.contractNo}
            onChange={(e) => updateBuyback({ contractNo: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border bg-white"
            placeholder="AGA/XX-BB2025"
          />
        </div>
        <CustomDatePicker
          label="วันที่ทำสัญญา"
          value={data.contractDate}
          onChange={(val) => updateBuyback({ contractDate: val })}
        />
      </div>

      <div className="p-4 border border-blue-100 rounded-lg bg-blue-50/30" onFocusCapture={() => onFocusSection?.('section-buyback-assets')}>
        <h5 className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-2">
          <CheckCircle2 size={14} /> เลือกเครื่องจักรในสัญญานี้
        </h5>
        <div className="space-y-2">
          {parentAssets.map((asset) => {
            const isSelectedHere = data.selectedAssetIds?.includes(asset.id);
            const isSelectedElsewhere = otherBuybacksSelectedAssetIds.includes(asset.id);
            
            return (
              <div 
                key={asset.id} 
                className={`flex items-center justify-between p-2 rounded border transition-colors ${
                  isSelectedElsewhere ? 'bg-gray-100 border-gray-200 opacity-60' : 
                  isSelectedHere ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelectedHere}
                    disabled={isSelectedElsewhere}
                    onChange={() => toggleAsset(asset.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-800">{asset.name}</div>
                    <div className="text-[10px] text-gray-500">{asset.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-700">{asset.totalAmount} บาท</div>
                  {isSelectedElsewhere && (
                    <div className="text-[10px] text-orange-600 flex items-center gap-1">
                      <ShieldAlert size={10} /> เลือกไปแล้วในชุดอื่น
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-blue-100 pt-4">
          <div>
             <label className="block text-xs font-medium text-gray-600 mb-1">ราคารวมเครื่องจักรที่เลือก (บาท)</label>
             <div className="text-lg font-bold text-blue-700">{subtotalSelected.toLocaleString()} บาท</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">เงินดาวน์ในส่วนสัญญานี้ (%)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={data.downPercentage}
                onChange={(e) => updateBuyback({ downPercentage: e.target.value })}
                className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border bg-white font-bold text-orange-600 text-center"
                placeholder="20"
              />
              <span className="text-sm font-bold text-gray-500">%</span>
              <div className="text-xs text-orange-700 font-bold ml-auto">
                = {downAmountNum.toLocaleString()} บาท
              </div>
            </div>
          </div>
          <div className="col-span-2 bg-blue-600 text-white p-3 rounded-lg flex justify-between items-center shadow-sm mt-2">
            <span className="text-sm font-medium">มูลค่าหลังหักเงินดาวน์ สำหรับคำนวณรับซื้อคืน ({subtotalSelected.toLocaleString()} - {downAmountNum.toLocaleString()}):</span>
            <span className="text-xl font-black">{netValue.toLocaleString()} บาท</span>
          </div>
        </div>
      </div>
      
      <div className="pt-2" onFocusCapture={() => onFocusSection?.('section-vendor')}>
        <h5 className="text-xs font-bold text-orange-700 mb-3 uppercase tracking-wider">ข้อมูลผู้ขาย / ตัวแทนจำหน่าย (คู่สัญญาฝ่ายที่ 3)</h5>
        <div className="space-y-3 bg-orange-50/30 p-4 rounded-lg border border-orange-100">
          <div className="pb-2 border-b border-orange-100/50 mb-2">
            <label className="block text-xs font-medium text-gray-600 mb-2">ประเภทคู่สัญญาฝ่ายที่ 3</label>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={data.vendorType === 'person'}
                  onChange={() => updateBuyback({ vendorType: 'person' })}
                  className="text-orange-600 border-gray-300 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">บุคคลธรรมดา</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={data.vendorType === 'shop'}
                  onChange={() => updateBuyback({ vendorType: 'shop' })}
                  className="text-orange-600 border-gray-300 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">ร้านค้า (เจ้าของคนเดียว)</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={data.vendorType === 'company' || !data.vendorType}
                  onChange={() => updateBuyback({ vendorType: 'company' })}
                  className="text-orange-600 border-gray-300 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">บริษัทจำกัด</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={data.vendorType === 'partnership'}
                  onChange={() => updateBuyback({ vendorType: 'partnership' })}
                  className="text-orange-600 border-gray-300 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">ห้างหุ้นส่วน</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">เลข Tax ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={data.vendorTaxId}
                onChange={(e) => updateBuyback({ vendorTaxId: formatThaiId(e.target.value) })}
                className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border bg-white"
                placeholder="X-XXXX-XXXXX-XX-X"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              >
                {isSearching ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
                {isSearching ? 'ค้นหา...' : 'ค้นหา'}
              </button>
            </div>
            {searchError && <p className="mt-1 text-xs text-red-500">{searchError}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {data.vendorType === 'shop' ? 'ชื่อร้าน' : data.vendorType === 'person' ? 'ชื่อ-นามสกุล' : 'ชื่อบริษัท / ห้างหุ้นส่วน'}
            </label>
            <input
              type="text"
              value={data.vendorName}
              onChange={(e) => updateBuyback({ vendorName: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border bg-white"
              placeholder={data.vendorType === 'shop' ? 'ระบุชื่อร้านค้า ...' : data.vendorType === 'person' ? 'ระบุชื่อ-นามสกุล ...' : 'ระบุชื่อนิติบุคคล ...'}
            />
          </div>

          {data.vendorType !== 'person' && (
            <div>
              <DirectorInput
                label={data.vendorType === 'shop' ? 'ผู้ประกอบกิจการ' : data.vendorType === 'partnership' ? 'หุ้นส่วนผู้จัดการ' : 'ชื่อกรรมการ'}
                value={data.vendorDirectors}
                onChange={(val) => updateBuyback({ vendorDirectors: val })}
                placeholder="นาย/นาง/นางสาว..."
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ที่อยู่จดทะเบียน</label>
            <ThaiAddressInput
              value={data.vendorAddress}
              onAddressChange={(addr, code) => updateBuyback({ vendorAddress: addr, vendorPostalCode: code })}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-orange-100" onFocusCapture={() => onFocusSection?.('section-buyback-rate')}>
        <div className="flex justify-between items-center mb-3">
          <h5 className="text-xs font-bold text-orange-700 uppercase tracking-wider">เกณฑ์ราคาการรับซื้อคืน (ตามปี)</h5>
          <div className="flex bg-orange-100/50 p-1 rounded-lg border border-orange-200">
            {[
              { id: 'newOnly', label: 'มือ 1' },
              { id: 'usedOnly', label: 'มือ 2' },
              { id: 'all', label: 'ทั้งคู่' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => updateBuyback({ buybackMode: m.id as any })}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                  data.buybackMode === m.id 
                    ? 'bg-orange-500 text-white shadow-sm' 
                    : 'text-orange-700 hover:bg-orange-200/50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto bg-white rounded-md border border-orange-100">
          <table className="min-w-full text-[11px] text-left border-collapse">
            <thead>
              <tr className="border-b border-orange-200 bg-orange-50/50">
                <th className="py-2 px-3 font-bold text-orange-800">ปีที่</th>
                {(data.buybackMode === 'all' || data.buybackMode === 'newOnly') && (
                  <th className="py-2 px-3 font-bold text-orange-800 text-center">มือ 1 (%)</th>
                )}
                {(data.buybackMode === 'all' || data.buybackMode === 'usedOnly') && (
                  <th className="py-2 px-3 font-bold text-orange-800 text-center">มือ 2 (%)</th>
                )}
              </tr>
            </thead>
            <tbody>
              {(data.buybackTable || []).map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-orange-50/50 hover:bg-orange-50/20">
                  <td className="py-2 px-3 font-medium text-gray-700">ปีที่ {row.year}</td>
                  {(data.buybackMode === 'all' || data.buybackMode === 'newOnly') && (
                    <td className="py-1.5 px-3">
                      <input
                        type="text"
                        value={row.newRate}
                        onChange={(e) => updateTable(rowIdx, 'newRate', e.target.value)}
                        className="w-full p-1.5 border border-orange-200 rounded text-[11px] focus:ring-1 focus:ring-orange-500 outline-none text-center"
                      />
                    </td>
                  )}
                  {(data.buybackMode === 'all' || data.buybackMode === 'usedOnly') && (
                    <td className="py-1.5 px-3">
                      <input
                        type="text"
                        value={row.usedRate}
                        onChange={(e) => updateTable(rowIdx, 'usedRate', e.target.value)}
                        className="w-full p-1.5 border border-orange-200 rounded text-[11px] focus:ring-1 focus:ring-orange-500 outline-none text-center"
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">เงื่อนไขเพิ่มเติม</label>
        <input
          type="text"
          value={data.conditions}
          onChange={(e) => updateBuyback({ conditions: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm p-2 border bg-white"
          placeholder="เงื่อนไขเพิ่มเติม (ถ้ามี)"
        />
      </div>
    </div>
  );
}
