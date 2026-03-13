import { useState } from 'react';
import { Plus, Trash2, Search, Loader2 } from 'lucide-react';
import type { ContractData, ContractItem, ContractItemType } from '../types/contract';
import { searchCompanyByTaxId } from '../services/dbdService';

interface Props {
  data: ContractData;
  onChange: (data: ContractData) => void;
}

export default function ContractForm({ data, onChange }: Props) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const handleItemChange = (id: string, field: keyof ContractItem, value: string) => {
    onChange({
      ...data,
      items: data.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const addItem = (type: ContractItemType) => {
    const newItem: ContractItem = {
      id: Date.now().toString(),
      type,
      contractNo: '',
      amount: '',
    };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (id: string) => {
    onChange({ ...data, items: data.items.filter(item => item.id !== id) });
  };

  const handleSearchByTaxId = async () => {
    if (!data.customerTaxId.trim()) {
      setSearchError('กรุณาใส่เลข Tax ID ก่อน');
      return;
    }

    setIsSearching(true);
    setSearchError('');

    try {
      const result = await searchCompanyByTaxId(data.customerTaxId.trim());
      if (result) {
        onChange({
          ...data,
          customerCompany: result.companyName,
          customerAddress: result.address,
          customerTaxId: result.taxId,
        });
        setSearchError('');
      } else {
        setSearchError('ไม่พบข้อมูลบริษัทจาก Tax ID นี้');
      }
    } catch {
      setSearchError('เกิดข้อผิดพลาดในการค้นหา');
    } finally {
      setIsSearching(false);
    }
  };

  const typeLabels: Record<ContractItemType, string> = {
    hirePurchase: 'Hire Purchase',
    hirePurchaseBack: 'Hire Purchase Back',
    loanCredit: 'Loan Credit',
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Contract Details</h2>
      
      <div className="space-y-6">
        {/* Basic Info */}
        <section className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="font-semibold text-lg mb-4 text-slate-700">Contract Info</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contract No.</label>
              <input type="text" name="contractNo" value={data.contractNo} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Effective Date</label>
              <input type="text" name="effectiveDate" value={data.effectiveDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
            </div>
          </div>
        </section>

        {/* Customer Info */}
        <section className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="font-semibold text-lg mb-4 text-slate-700">Customer (Party 2)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tax ID</label>
              <div className="flex gap-2 mt-1">
                <input type="text" name="customerTaxId" value={data.customerTaxId} onChange={handleChange} className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" placeholder="เช่น 0145554003035" />
                <button
                  onClick={handleSearchByTaxId}
                  disabled={isSearching}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  {isSearching ? 'กำลังค้นหา...' : 'ค้นหา'}
                </button>
              </div>
              {searchError && (
                <p className="mt-1 text-sm text-red-500">{searchError}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">กรอก Tax ID แล้วกด "ค้นหา" เพื่อดึงข้อมูลบริษัทอัตโนมัติ</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input type="text" name="customerCompany" value={data.customerCompany} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Authorized Director</label>
              <input type="text" name="customerDirector" value={data.customerDirector} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input type="text" name="customerAddress" value={data.customerAddress} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
            </div>
          </div>
        </section>

        {/* Dynamic Contract Items */}
        <section className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="font-semibold text-lg mb-4 text-slate-700">Contract Items</h3>
          
          <div className="space-y-4">
            {data.items.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">ยังไม่มีรายการสัญญา</p>
                <p className="text-gray-400 text-xs">กดปุ่มด้านล่างเพื่อเพิ่มรายการสัญญา</p>
              </div>
            )}
            {data.items.map((item, index) => (
              <div key={item.id} className="border border-slate-200 rounded-lg p-3 relative">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-sm text-blue-700">
                    {index + 1}. {typeLabels[item.type]}
                  </h4>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500">Contract No.</label>
                    <input
                      type="text"
                      value={item.contractNo}
                      onChange={(e) => handleItemChange(item.id, 'contractNo', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Amount</label>
                    <input
                      type="text"
                      value={item.amount}
                      onChange={(e) => handleItemChange(item.id, 'amount', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              onClick={() => addItem('hirePurchase')}
              className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md text-sm hover:bg-blue-100 border border-blue-200"
            >
              <Plus size={14} /> Hire Purchase
            </button>
            <button
              onClick={() => addItem('hirePurchaseBack')}
              className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded-md text-sm hover:bg-green-100 border border-green-200"
            >
              <Plus size={14} /> HP Back
            </button>
            <button
              onClick={() => addItem('loanCredit')}
              className="flex items-center gap-1 px-3 py-2 bg-purple-50 text-purple-700 rounded-md text-sm hover:bg-purple-100 border border-purple-200"
            >
              <Plus size={14} /> Loan Credit
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
