import { useState, useRef } from 'react';
import { Printer, FileText, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { initialAppData, CONTRACT_TYPE_LABELS } from './types/app';
import type { AppData, CompanyInfo, HirePurchaseData, BuybackData, GuarantorData, CompanyMode, ContractType, JointVentureData, ServiceAgreementData, FeePaymentData } from './types/app';
import CompanyModeSelector from './components/CompanyModeSelector';
import CompanyInfoForm from './components/CompanyInfoForm';
import ContractTypeSelector from './components/ContractTypeSelector';
import HirePurchaseForm from './components/HirePurchaseForm';
import HirePurchasePreview from './components/HirePurchasePreview';
import BuybackForm from './components/BuybackForm';
import BuybackPreview from './components/BuybackPreview';
import GuarantorForm from './components/GuarantorForm';
import GuaranteePreview from './components/GuaranteePreview';
import JointVentureForm from './components/JointVentureForm';
import ServiceAgreementForm from './components/ServiceAgreementForm';
import FeePaymentForm from './components/FeePaymentForm';
import ContractPreview from './components/ContractPreview';
import type { GuaranteeData } from './types/guarantee';
import type { ContractData } from './types/contract';

type PreviewTab = string;

function App() {
  const [data, setData] = useState<AppData>(initialAppData);
  const [activePreview, setActivePreview] = useState<PreviewTab>('contract');
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [hasMoved, setHasMoved] = useState(false);
  
  // Momentum refs
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tabsRef.current) return;
    
    // Stop any existing momentum animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setIsDragging(true);
    setHasMoved(false);
    startXRef.current = e.pageX - tabsRef.current.offsetLeft;
    scrollLeftRef.current = tabsRef.current.scrollLeft;
    
    lastXRef.current = e.pageX;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;
  };

  const applyMomentum = () => {
    if (!tabsRef.current || Math.abs(velocityRef.current) < 0.1) return;

    const step = () => {
      if (!tabsRef.current || isDragging) return;
      
      tabsRef.current.scrollLeft -= velocityRef.current * 10;
      velocityRef.current *= 0.95; // Decay factor

      if (Math.abs(velocityRef.current) > 0.1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      applyMomentum();
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      applyMomentum();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tabsRef.current) return;
    
    const currentTime = Date.now();
    const timeElapsed = currentTime - lastTimeRef.current;
    
    if (timeElapsed > 0) {
      const deltaX = e.pageX - lastXRef.current;
      velocityRef.current = deltaX / timeElapsed;
      lastXRef.current = e.pageX;
      lastTimeRef.current = currentTime;
    }

    const x = e.pageX - tabsRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    
    if (Math.abs(walk) > 5) {
      setHasMoved(true);
      tabsRef.current.scrollLeft = scrollLeftRef.current - walk;
    }
  };

  const handlePrint = () => {
    const rightPanel = document.getElementById('preview-panel');
    const scrollPos = rightPanel ? rightPanel.scrollTop : 0;
    
    window.print();

    // Force repaint after print dialog closes to fix browser bug where 
    // content disappears when scrolled down.
    setTimeout(() => {
      if (rightPanel) {
        rightPanel.style.display = 'none';
        rightPanel.offsetHeight; // trigger reflow
        rightPanel.style.display = '';
        rightPanel.scrollTop = scrollPos;
      }
    }, 100);
  };

  const updateField = <K extends keyof AppData>(field: K, value: AppData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateAgileInfo = (info: CompanyInfo) => {
    setData(prev => ({
      ...prev,
      agileInfo: info,
      hirePurchaseData: {
        ...prev.hirePurchaseData,
        lessor1: {
          ...prev.hirePurchaseData.lessor1,
          name: info.companyName,
          taxId: info.taxId,
          address: info.address,
        },
        lessor1Signatories: info.directors
      }
    }));
  };

  const updateTkInfo = (info: CompanyInfo) => {
    setData(prev => ({
      ...prev,
      tkInfo: info,
      hirePurchaseData: {
        ...prev.hirePurchaseData,
        lessor2: {
          ...prev.hirePurchaseData.lessor2,
          name: info.companyName,
          taxId: info.taxId,
          address: info.address,
        },
        lessor2Signatories: info.directors
      }
    }));
  };

  // Build GuaranteeData from AppData and a specific GuarantorData
  const buildGuaranteeData = (guarantor: GuarantorData): GuaranteeData => ({
    contractNo: data.hirePurchaseData.contractNo ? `AGA/XX-SUR` : '',
    effectiveDate: data.hirePurchaseData.contractDate,
    lenderCompany: data.agileInfo.companyName,
    lenderDirectors: data.agileInfo.directors,
    lenderAddress: data.agileInfo.address,
    lenderTaxId: data.agileInfo.taxId,
    borrowerCompany: data.companyMode === 'agileTK' ? data.tkInfo.companyName : '',
    borrowerDirectors: data.companyMode === 'agileTK' ? data.tkInfo.directors : '',
    borrowerAddress: data.companyMode === 'agileTK' ? data.tkInfo.address : '',
    borrowerTaxId: data.companyMode === 'agileTK' ? data.tkInfo.taxId : '',
    guarantorName: guarantor.guarantorName,
    guarantorIdCard: guarantor.guarantorIdCard,
    guarantorAddress: guarantor.guarantorAddress,
    isMarried: guarantor.isMarried,
    spouseName: guarantor.spouseName,
    spouseIdCard: guarantor.spouseIdCard,
    spouseAddress: guarantor.spouseAddress,
    refContractCompany: data.customerInfo.companyName,
    refContractNo: data.hirePurchaseData.contractNo,
    refContractDate: data.hirePurchaseData.contractDate,
    guaranteeAmountText: '',
    guaranteeAmountNumber: data.hirePurchaseData.totalAmount,
  });

  // Build preview tabs: main contract → buyback → guarantee → additional contracts
  const previewTabs: { key: PreviewTab; label: string }[] = [
    { key: 'contract', label: CONTRACT_TYPE_LABELS[data.contractType] },
  ];
  if (data.hasBuyback) {
    (data.buybackData || []).forEach((_, idx) => {
      previewTabs.push({ key: `buyback-${idx}`, label: `สัญญารับซื้อคืน (${idx + 1})` });
    });
  }
  (data.guarantors || []).forEach((_, idx) => {
    previewTabs.push({ key: `guarantee-${idx}`, label: `สัญญาค้ำประกัน (${idx + 1})` });
  });
  previewTabs.push({ key: 'jointVenture', label: 'สัญญาค้าร่วม' });
  previewTabs.push({ key: 'serviceAgreement', label: 'สัญญาจ้างบริการ' });
  previewTabs.push({ key: 'feePayment', label: 'สัญญาชำระค่าธรรมเนียม' });

  const renderContractPreview = () => {
    if (data.contractType === 'hirePurchase') {
      return (
        <HirePurchasePreview
          data={data.hirePurchaseData}
          customerInfo={data.customerInfo}
          guarantors={data.guarantors}
        />
      );
    }
    // Placeholder for other main contract types
    return (
      <div className="print-page relative flex items-center justify-center">
        <div className="text-center text-slate-400">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">{CONTRACT_TYPE_LABELS[data.contractType]}</h3>
          <p className="text-sm mt-2">Preview จะเพิ่มในภายหลัง</p>
        </div>
      </div>
    );
  };

  const renderPlaceholderPreview = (title: string) => (
    <div className="print-page relative flex items-center justify-center">
      <div className="text-center text-slate-400">
        <FileText size={48} className="mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm mt-2">Preview จะเพิ่มในภายหลัง</p>
      </div>
    </div>
  );

  // Build ContractData for the fee payment preview
  const buildFeeContractData = (): ContractData => ({
    contractNo: data.feePaymentData.contractNo,
    effectiveDate: data.feePaymentData.effectiveDate,
    customerCompany: data.customerInfo.companyName,
    customerDirector: data.customerInfo.directors,
    customerAddress: data.customerInfo.address,
    customerTaxId: data.customerInfo.taxId,
    items: data.feePaymentData.items,
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 print:bg-white print:h-auto print:overflow-visible">
      {/* Left Panel: Form */}
      <div className="w-[900px] flex-shrink-0 border-r border-gray-300 print:hidden overflow-y-auto bg-white shadow-lg z-10 flex flex-col h-full">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 z-20 shadow-sm">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Control Panel</h1>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm"
            >
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Step 1: Company Mode */}
          <CompanyModeSelector
            value={data.companyMode}
            onChange={(mode: CompanyMode) => updateField('companyMode', mode)}
          />

          {/* Step 2: Company Info */}
          <CompanyInfoForm
            agileInfo={data.agileInfo}
            tkInfo={data.tkInfo}
            customerInfo={data.customerInfo}
            onAgileChange={updateAgileInfo}
            onTkChange={updateTkInfo}
            onCustomerChange={(info: CompanyInfo) => updateField('customerInfo', info)}
          />

          {/* Step 3: Contract Type (4 main types) */}
          <ContractTypeSelector
            value={data.contractType}
            onChange={(type: ContractType) => updateField('contractType', type)}
          />

          {/* Step 4: Main Contract Form */}
          {data.contractType === 'hirePurchase' && (
            <>
              <HirePurchaseForm
                data={data.hirePurchaseData}
                onChange={(hp: HirePurchaseData) => {
                  setData(prev => {
                    const newData = { ...prev, hirePurchaseData: hp };
                    if (prev.hirePurchaseData.contractDate !== hp.contractDate && newData.buybackData.length > 0) {
                      const newBuyback = [...newData.buybackData];
                      newBuyback[0] = { ...newBuyback[0], contractDate: hp.contractDate };
                      newData.buybackData = newBuyback;
                    }
                    return newData;
                  });
                }}
              />
              <GuarantorForm
                data={data.guarantors}
                onChange={(g: GuarantorData[]) => updateField('guarantors', g)}
              />
            </>
          )}
          {data.contractType !== 'hirePurchase' && (
            <>
              <section className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="text-center py-8 text-slate-400">
                  <FileText size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">{CONTRACT_TYPE_LABELS[data.contractType]}</p>
                  <p className="text-xs mt-1">ฟอร์มจะเพิ่มในภายหลัง</p>
                </div>
              </section>
              <GuarantorForm
                data={data.guarantors}
                onChange={(g: GuarantorData[]) => updateField('guarantors', g)}
              />
            </>
          )}

          {/* Step 5: Buyback Toggle */}
          <section className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.hasBuyback}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setData(prev => {
                    const newData = { ...prev, hasBuyback: checked };
                    if (checked && newData.buybackData.length > 0 && !newData.buybackData[0].contractDate) {
                      const newBb = [...newData.buybackData];
                      newBb[0] = { ...newBb[0], contractDate: prev.hirePurchaseData.contractDate };
                      newData.buybackData = newBb;
                    }
                    return newData;
                  });
                }}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <div>
                <span className="font-semibold text-slate-700">รับซื้อคืน</span>
                <p className="text-xs text-slate-500">ติ๊กเลือกถ้าต้องการเพิ่มสัญญารับซื้อคืน</p>
              </div>
            </label>
          </section>

          {/* Step 5.1: Buyback Form (conditional) */}
          {data.hasBuyback && (
            <BuybackForm
              data={data.buybackData || []}
              onChange={(bb: BuybackData[]) => updateField('buybackData', bb)}
              hpDate={data.hirePurchaseData.contractDate}
            />
          )}

          {/* ── Additional Contracts (after guarantor) ── */}
          <div className="border-t-2 border-slate-300 pt-5 mt-2">
            <h3 className="font-bold text-slate-600 text-sm mb-4 uppercase tracking-wider">สัญญาเพิ่มเติม</h3>

            {/* Contract 4: สัญญาค้าร่วม */}
            <div className="space-y-5">
              <JointVentureForm
                data={data.jointVentureData}
                onChange={(jv: JointVentureData) => updateField('jointVentureData', jv)}
              />

              {/* Contract 5: สัญญาจ้างบริการ */}
              <ServiceAgreementForm
                data={data.serviceAgreementData}
                onChange={(sa: ServiceAgreementData) => updateField('serviceAgreementData', sa)}
              />

              {/* Contract 6: สัญญาชำระค่าธรรมเนียม */}
              <FeePaymentForm
                data={data.feePaymentData}
                onChange={(fp: FeePaymentData) => updateField('feePaymentData', fp)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Preview */}
      <div id="preview-panel" className="flex-1 overflow-y-auto bg-slate-200 print:p-0 print:bg-white print:overflow-visible flex flex-col transform-gpu">
        <div className="sticky top-0 z-10 bg-slate-200 px-6 pt-4 pb-2 print:hidden">
          <div className="relative flex items-center bg-white rounded-lg p-1.5 shadow-sm border border-slate-200">
            {/* Scroll Left Button */}
            <button
              onClick={(e) => {
                const container = e.currentTarget.nextElementSibling;
                if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
              }}
              className="p-1 px-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-md transition-all z-10 border-r border-slate-100 flex items-center justify-center shrink-0"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Tabs Container */}
            <div 
              ref={tabsRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`flex gap-1.5 overflow-x-auto no-scrollbar flex-1 items-center px-1 ${isDragging ? 'cursor-grabbing select-none scroll-auto' : 'cursor-grab scroll-smooth'}`}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
              {previewTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    if (!hasMoved) setActivePreview(tab.key);
                  }}
                  className={`flex-shrink-0 flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${activePreview === tab.key
                    ? 'bg-slate-800 text-white shadow-md ring-1 ring-slate-900 ring-offset-1 ring-offset-white'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <Eye size={13} className={activePreview === tab.key ? 'text-white' : 'text-slate-400'} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scroll Right Button */}
            <button
              onClick={(e) => {
                const container = e.currentTarget.previousElementSibling;
                if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
              }}
              className="p-1 px-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-md transition-all z-10 border-l border-slate-100 flex items-center justify-center shrink-0"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 p-6 print:p-0 flex flex-col items-center">
          <div className="w-[210mm] print:w-[210mm] print:h-auto print:max-w-none space-y-8 print:space-y-0">
            {activePreview === 'contract' && renderContractPreview()}
            {activePreview.startsWith('buyback-') && data.hasBuyback && (
              <BuybackPreview
                data={data.buybackData[parseInt(activePreview.split('-')[1]) || 0]}
                agileInfo={data.agileInfo}
                tkInfo={data.tkInfo}
                hpData={data.hirePurchaseData}
                customerInfo={data.customerInfo}
              />
            )}
            {activePreview.startsWith('guarantee-') && (
              <GuaranteePreview data={buildGuaranteeData(data.guarantors[parseInt(activePreview.split('-')[1]) || 0])} />
            )}
            {activePreview === 'jointVenture' && renderPlaceholderPreview('สัญญาค้าร่วม')}
            {activePreview === 'serviceAgreement' && renderPlaceholderPreview('สัญญาจ้างบริการ')}
            {activePreview === 'feePayment' && (
              <ContractPreview data={buildFeeContractData()} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
