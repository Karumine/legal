import { useState } from 'react';
import { initialContractData } from './types/contract';
import { initialGuaranteeData } from './types/guarantee';
import ContractForm from './components/ContractForm';
import ContractPreview from './components/ContractPreview';
import GuaranteeForm from './components/GuaranteeForm';
import GuaranteePreview from './components/GuaranteePreview';
import { Printer, FileText, ShieldCheck } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'fee' | 'guarantee'>('fee');
  const [feeData, setFeeData] = useState(initialContractData);
  const [guaranteeData, setGuaranteeData] = useState(initialGuaranteeData);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 print:bg-white print:h-auto print:overflow-visible">
      {/* Left Panel: Form */}
      <div className="w-[450px] flex-shrink-0 border-r border-gray-300 print:hidden overflow-y-auto bg-white shadow-lg z-10 flex flex-col h-full">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-20 shadow-sm">
           <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold tracking-tight text-slate-800">Control Panel</h1>
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm"
              >
                <Printer size={16} /> Print
              </button>
           </div>
           
           {/* Tab Navigation */}
           <div className="flex space-x-1 p-1 bg-slate-100 rounded-lg">
             <button
               onClick={() => setActiveTab('fee')}
               className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                 activeTab === 'fee' 
                   ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200' 
                   : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
               }`}
             >
               <FileText size={16} />
               สัญญาค่าธรรมเนียม
             </button>
             <button
               onClick={() => setActiveTab('guarantee')}
               className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                 activeTab === 'guarantee' 
                   ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200' 
                   : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
               }`}
             >
               <ShieldCheck size={16} />
               สัญญาค้ำประกัน
             </button>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'fee' ? (
            <ContractForm data={feeData} onChange={setFeeData} />
          ) : (
            <GuaranteeForm data={guaranteeData} onChange={setGuaranteeData} />
          )}
        </div>
      </div>

      {/* Right Panel: Preview */}
      <div className="flex-1 overflow-y-auto bg-slate-200 p-8 print:p-0 print:bg-white print:overflow-visible flex flex-col items-center">
        <div className="w-[210mm] print:w-[210mm] print:h-[297mm] print:max-w-none">
           {activeTab === 'fee' ? (
             <ContractPreview data={feeData} />
           ) : (
             <GuaranteePreview data={guaranteeData} />
           )}
        </div>
      </div>
    </div>
  );
}

export default App;
