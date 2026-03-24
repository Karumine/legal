import { useState, useRef } from 'react';
import { Printer, FileText, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { initialAppData, CONTRACT_TYPE_LABELS } from './types/app';
import type { AppData, CompanyInfo, HirePurchaseData, BuybackData, GuarantorData, CompanyMode, ContractType, JointVentureData, ServiceAgreementData, FeePaymentData, Agreement } from './types/app';
import CompanyModeSelector from './components/CompanyModeSelector';
import CompanyInfoForm from './components/CompanyInfoForm';
import HirePurchaseForm from './components/HirePurchaseForm';
import HirePurchasePreview from './components/HirePurchasePreview';
import BuybackForm from './components/BuybackForm';
import BuybackPreview from './components/BuybackPreview';
import GuarantorForm from './components/GuarantorForm';
import GuaranteePreview from './components/GuaranteePreview';
import JointVentureForm from './components/JointVentureForm';
import JointVenturePreview from './components/JointVenturePreview';
import ServiceAgreementForm from './components/ServiceAgreementForm';
import ServiceAgreementPreview from './components/ServiceAgreementPreview';
import FeePaymentForm from './components/FeePaymentForm';
import ContractPreview from './components/ContractPreview';
import type { GuaranteeData } from './types/guarantee';
import type { ContractData } from './types/contract';
import { thaiBahtText } from './utils/thaiBahtText';

type PreviewTab = string;

function App() {
  const [data, setData] = useState<AppData>(initialAppData);
  const [activePreview, setActivePreview] = useState<PreviewTab>('agreement-initial-hp');
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

  const updateAgreementData = (id: string, newData: any) => {
    setData(prev => ({
      ...prev,
      agreements: prev.agreements.map(a => a.id === id ? { ...a, data: newData } : a)
    }));
  };

  const addAgreement = (type: ContractType) => {
    const id = Date.now().toString();
    const newAgreement: Agreement = {
      id,
      type,
      data: (type === 'hirePurchase' || type === 'hirePurchaseBack') ? { ...initialAppData.agreements[0].data, contractNo: '' } : {}
    };
    setData(prev => ({
      ...prev,
      agreements: [...prev.agreements, newAgreement],
      activeAgreementId: id
    }));
    setActivePreview(`agreement-${id}`);
  };

  const removeAgreement = (id: string) => {
    const newAgreements = data.agreements.filter(a => a.id !== id);
    const nextId = newAgreements[0]?.id || null;

    if (activePreview === `agreement-${id}`) {
      setActivePreview(nextId ? `agreement-${nextId}` : 'agreement-initial-hp');
    }

    setData(prev => ({
      ...prev,
      agreements: newAgreements,
      activeAgreementId: prev.activeAgreementId === id ? nextId : prev.activeAgreementId
    }));
  };

  const updateAgileInfo = (info: CompanyInfo) => {
    setData(prev => ({
      ...prev,
      agileInfo: info,
      agreements: prev.agreements.map(a =>
        a.type === 'hirePurchase' || a.type === 'hirePurchaseBack'
          ? { ...a, data: { ...a.data, lessor1: { ...a.data.lessor1, name: info.companyName, taxId: info.taxId, address: info.address }, lessor1Signatories: info.directors } }
          : a
      )
    }));
  };

  const updateTkInfo = (info: CompanyInfo) => {
    setData(prev => ({
      ...prev,
      tkInfo: info,
      agreements: prev.agreements.map(a =>
        a.type === 'hirePurchase' || a.type === 'hirePurchaseBack'
          ? { ...a, data: { ...a.data, lessor2: { ...a.data.lessor2, name: info.companyName, taxId: info.taxId, address: info.address }, lessor2Signatories: info.directors } }
          : a
      )
    }));
  };

  const activeAgreement = data.agreements.find(a => a.id === data.activeAgreementId) || data.agreements[0];
  const hpData = (activeAgreement?.type === 'hirePurchase' || activeAgreement?.type === 'hirePurchaseBack') ? activeAgreement.data : data.agreements.find(a => a.type === 'hirePurchase' || a.type === 'hirePurchaseBack')?.data;

  // Build GuaranteeData from AppData and multiple GuarantorData
  const buildGuaranteeData = (guarantors: GuarantorData[]): GuaranteeData => {
    // Get all unique selected agreements across all guarantors
    const allSelectedIds = Array.from(new Set(guarantors.flatMap(g => g.selectedAgreementIds || [])));
    const selectedAgreements = allSelectedIds
      .map(id => data.agreements.find(a => a.id === id))
      .filter((a): a is Agreement => !!a);

    const totalAmount = selectedAgreements.reduce((sum, a) => {
      const amountStr = (a.data as any).totalAmount?.toString() || '0';
      return sum + (parseFloat(amountStr.replace(/,/g, '')) || 0);
    }, 0);

    return {
      contractNo: guarantors[0]?.contractNo || (hpData?.contractNo ? `AGA/XX-SUR` : ''),
      effectiveDate: guarantors[0]?.contractDate || hpData?.contractDate || '',
      lenderCompany: data.agileInfo.companyName,
      lenderDirectors: data.agileInfo.directors,
      lenderAddress: data.agileInfo.address,
      lenderTaxId: data.agileInfo.taxId,
      lenderPhone: data.agileInfo.phone,

      // Party 2 (Borrower)
      borrowerCompany: data.companyMode === 'agileTK' ? data.tkInfo.companyName : '',
      borrowerDirectors: data.companyMode === 'agileTK' ? data.tkInfo.directors : '',
      borrowerAddress: data.companyMode === 'agileTK' ? data.tkInfo.address : '',
      borrowerTaxId: data.companyMode === 'agileTK' ? data.tkInfo.taxId : '',
      borrowerPhone: data.companyMode === 'agileTK' ? data.tkInfo.phone : '',

      // Party 3 (Guarantors)
      guarantors: guarantors.map(g => ({
        name: g.guarantorName,
        idCard: g.guarantorIdCard,
        address: g.guarantorAddress,
        phone: g.phone || '',
        isMarried: g.isMarried,
        spouseName: g.spouseName,
        spouseIdCard: g.spouseIdCard,
        spouseAddress: g.spouseAddress,
      })),

      refContractCompany: data.customerInfo.companyName,
      refContracts: selectedAgreements.map(a => ({
        type: a.type,
        no: (a.data as any).contractNo || '',
        date: (a.data as any).contractDate || '',
        amount: parseFloat(((a.data as any).totalAmount || '0').toString().replace(/,/g, '')) || 0
      })),
      guaranteeAmountText: thaiBahtText(totalAmount.toString()),
      guaranteeAmountNumber: totalAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
    };
  };

  // Build preview tabs: agreements → buyback → guarantee → additional contracts
  const previewTabs: { key: PreviewTab; label: string }[] = [];

  data.agreements.forEach((agreement, idx) => {
    previewTabs.push({
      key: `agreement-${agreement.id}`,
      label: `${CONTRACT_TYPE_LABELS[agreement.type]} ${data.agreements.filter(a => a.type === agreement.type).length > 1 ? `(${idx + 1})` : ''}`.trim()
    });
  });

  if (data.hasBuyback) {
    (data.buybackData || []).forEach((_, idx) => {
      previewTabs.push({ key: `buyback-${idx}`, label: `สัญญารับซื้อคืน (${idx + 1})` });
    });
  }
  if (data.guarantors && data.guarantors.length > 0) {
    previewTabs.push({ key: 'guarantee', label: 'สัญญาค้ำประกัน' });
  }
  previewTabs.push({ key: 'jointVenture', label: 'สัญญาค้าร่วม' });
  previewTabs.push({ key: 'serviceAgreement', label: 'สัญญาจ้างบริการ' });
  previewTabs.push({ key: 'feePayment', label: 'สัญญาชำระค่าธรรมเนียม' });

  const renderContractPreview = (agreement: Agreement) => {
    if (agreement.type === 'hirePurchase' || agreement.type === 'hirePurchaseBack') {
      return (
        <HirePurchasePreview
          data={agreement.data}
          customerInfo={data.customerInfo}
          guarantors={data.guarantors}
          type={agreement.type}
        />
      );
    }
    // Placeholder for other main contract types
    return (
      <div className="print-page relative flex items-center justify-center">
        <div className="text-center text-slate-400">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">{CONTRACT_TYPE_LABELS[agreement.type]}</h3>
          <p className="text-sm mt-2">Preview จะเพิ่มในภายหลัง</p>
        </div>
      </div>
    );
  };


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

          {/* Step 3: Agreement Manager */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">สัญญาในเคสนี้</h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {data.agreements.map((agreement, idx) => (
                  <div
                    key={agreement.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all cursor-pointer ${data.activeAgreementId === agreement.id
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                    onClick={() => updateField('activeAgreementId', agreement.id)}
                  >
                    <FileText size={14} />
                    <span className="text-sm font-medium">
                      {CONTRACT_TYPE_LABELS[agreement.type]} {data.agreements.filter(a => a.type === agreement.type).length > 1 ? `(${idx + 1})` : ''}
                    </span>
                    {data.agreements.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeAgreement(agreement.id); }}
                        className="ml-1 hover:text-red-400 transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">เพิ่มสัญญาใหม่</p>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(CONTRACT_TYPE_LABELS) as ContractType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => addAgreement(type)}
                      className="px-2 py-2 rounded border border-dashed border-slate-300 hover:border-slate-800 hover:bg-slate-50 text-[11px] font-medium text-slate-600 transition-all"
                    >
                      + {CONTRACT_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Active Agreement Form */}
          {activeAgreement && (
            <div className="space-y-5">
              {(activeAgreement.type === 'hirePurchase' || activeAgreement.type === 'hirePurchaseBack') && (
                <HirePurchaseForm
                  data={activeAgreement.data}
                  onChange={(hp: HirePurchaseData) => updateAgreementData(activeAgreement.id, hp)}
                />
              )}
              {activeAgreement.type !== 'hirePurchase' && activeAgreement.type !== 'hirePurchaseBack' && (
                <section className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <div className="text-center py-8 text-slate-400">
                    <FileText size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">{CONTRACT_TYPE_LABELS[activeAgreement.type]}</p>
                    <p className="text-xs mt-1">ฟอร์มสำหรับ {CONTRACT_TYPE_LABELS[activeAgreement.type]} จะเพิ่มในภายหลัง</p>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Step 5: Global Layout (Guarantors, Buyback, etc.) */}
          <div className="space-y-5 border-t-2 border-slate-100 pt-5 mt-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">ข้อมูลประกอบและสัญญาพ่วง</h3>

            <GuarantorForm
              data={data.guarantors}
              onChange={(g: GuarantorData[]) => updateField('guarantors', g)}
              agreements={data.agreements}
            />

            <section className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.hasBuyback}
                  onChange={(e) => updateField('hasBuyback', e.target.checked)}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <div>
                  <span className="font-semibold text-slate-700">รับซื้อคืน</span>
                  <p className="text-xs text-slate-500">สำหรับเคสที่มีเงื่อนไขการรับซื้อคืน</p>
                </div>
              </label>
            </section>
          </div>

          {/* Step 5.1: Buyback Form (conditional) */}
          {data.hasBuyback && (
            <BuybackForm
              data={data.buybackData || []}
              onChange={(bb: BuybackData[]) => updateField('buybackData', bb)}
              hpDate={hpData?.contractDate || ''}
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
                appData={data}
                onChange={(sa: ServiceAgreementData) => updateField('serviceAgreementData', sa)}
              />

              {/* Contract 6: สัญญาชำระค่าธรรมเนียม */}
              <FeePaymentForm
                data={data.feePaymentData}
                agreements={data.agreements}
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
            {activePreview.startsWith('agreement-') && (
              data.agreements.find(a => `agreement-${a.id}` === activePreview) &&
              renderContractPreview(data.agreements.find(a => `agreement-${a.id}` === activePreview)!)
            )}

            {activePreview.startsWith('buyback-') && data.hasBuyback && (
              <BuybackPreview
                data={data.buybackData[parseInt(activePreview.split('-')[1]) || 0]}
                agileInfo={data.agileInfo}
                tkInfo={data.tkInfo}
                hpData={hpData}
                customerInfo={data.customerInfo}
              />
            )}
            {activePreview === 'guarantee' && data.guarantors.length > 0 && (
              <GuaranteePreview data={buildGuaranteeData(data.guarantors)} />
            )}
            {activePreview === 'jointVenture' && (
              <JointVenturePreview
                data={data.jointVentureData}
                agileInfo={data.agileInfo}
                tkInfo={data.tkInfo}
                agreements={data.agreements}
                appData={data}
              />
            )}
            {activePreview === 'serviceAgreement' && (
              <ServiceAgreementPreview
                data={data.serviceAgreementData}
                appData={data}
              />
            )}
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
