import type { GuaranteeData } from '../types/guarantee';

interface Props {
  data: GuaranteeData;
  onChange: (data: GuaranteeData) => void;
}

export default function GuaranteeForm({ data, onChange }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Guarantee Details</h2>
      
      <div className="space-y-6">
        {/* Basic Info */}
        <section className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="font-semibold text-lg mb-4 text-slate-700">Contract Info</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contract No.</label>
              <input type="text" name="contractNo" value={data.contractNo} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Effective Date</label>
              <input type="text" name="effectiveDate" value={data.effectiveDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
            </div>
          </div>
        </section>

        {/* Lender (Party 1) */}
        <section className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="font-semibold text-lg mb-4 text-slate-700">Lender (ฝ่ายที่ 1)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <input type="text" name="lenderCompany" value={data.lenderCompany} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Directors</label>
              <input type="text" name="lenderDirectors" value={data.lenderDirectors} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input type="text" name="lenderAddress" value={data.lenderAddress} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tax ID</label>
              <input type="text" name="lenderTaxId" value={data.lenderTaxId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
            </div>
          </div>
        </section>

        {/* Borrower (Party 2) */}
        <section className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="font-semibold text-lg mb-4 text-slate-700">Borrower (ฝ่ายที่ 2)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <input type="text" name="borrowerCompany" value={data.borrowerCompany} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Directors</label>
              <input type="text" name="borrowerDirectors" value={data.borrowerDirectors} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input type="text" name="borrowerAddress" value={data.borrowerAddress} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tax ID</label>
              <input type="text" name="borrowerTaxId" value={data.borrowerTaxId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
            </div>
          </div>
        </section>

        {/* Guarantor (Party 3) */}
        <section className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="font-semibold text-lg mb-4 text-slate-700">Guarantor (ผู้ค้ำประกัน)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" name="guarantorName" value={data.guarantorName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ID Card No.</label>
              <input type="text" name="guarantorIdCard" value={data.guarantorIdCard} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input type="text" name="guarantorAddress" value={data.guarantorAddress} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
            </div>
          </div>
        </section>

        {/* Reference Contract Details */}
        <section className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="font-semibold text-lg mb-4 text-slate-700">Reference Contract (สัญญาหลัก)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name (ผู้เช่าซื้อ)</label>
              <input type="text" name="refContractCompany" value={data.refContractCompany} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
            </div>
            <div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ref Contract No.</label>
                    <input type="text" name="refContractNo" value={data.refContractNo} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ref Date</label>
                    <input type="text" name="refContractDate" value={data.refContractDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
                  </div>
               </div>
            </div>
            <div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount (Number)</label>
                    <input type="text" name="guaranteeAmountNumber" value={data.guaranteeAmountNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount (Text)</label>
                    <input type="text" name="guaranteeAmountText" value={data.guaranteeAmountText} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
                  </div>
               </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
