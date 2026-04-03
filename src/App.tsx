import { useState, useRef, useCallback, useEffect } from 'react';
import { Printer, FileText, Eye, EyeOff, ChevronDown, GripVertical, Shield, Handshake, Wrench, Receipt, ChevronRight } from 'lucide-react';
import { initialAppData, CONTRACT_TYPE_LABELS, TODAY } from './types/app';
import type { AppData, CompanyInfo, HirePurchaseData, GuarantorData, CompanyMode, ContractType, JointVentureData, ServiceAgreementData, FeePaymentData, Agreement } from './types/app';
import CompanyModeSelector from './components/CompanyModeSelector';
import CompanyInfoForm from './components/CompanyInfoForm';
import HirePurchaseForm from './components/HirePurchaseForm';
import HirePurchasePreview from './components/HirePurchasePreview';
import BuybackPreview from './components/BuybackPreview';
import GuarantorForm from './components/GuarantorForm';
import GuaranteePreview from './components/GuaranteePreview';
import JointVentureForm from './components/JointVentureForm';
import JointVenturePreview from './components/JointVenturePreview';
import ServiceAgreementForm from './components/ServiceAgreementForm';
import ServiceAgreementPreview from './components/ServiceAgreementPreview';
import FeePaymentForm from './components/FeePaymentForm';
import ContractPreview from './components/ContractPreview';
import CreditFacilityForm from './components/CreditFacilityForm';
import CreditFacilityPreview from './components/CreditFacilityPreview';
import type { GuaranteeData } from './types/guarantee';
import type { ContractData } from './types/contract';
import { thaiBahtText } from './utils/thaiBahtText';

type PreviewTab = string;

function App() {
  const [data, setData] = useState<AppData>(initialAppData);
  const [activePreview, setActivePreview] = useState<PreviewTab>('agreement-initial-hp');

  // Panel resize & toggle
  const [previewVisible, setPreviewVisible] = useState(true);
  const [formWidth, setFormWidth] = useState(900);
  const isResizingRef = useRef(false);
  const resizeStartXRef = useRef(0);
  const resizeStartWidthRef = useRef(900);

  // Dropdown menu for main contracts
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Preview scroll sync: switches to the correct preview tab and scrolls to the matching section
  const lastFocusSectionRef = useRef<string>('');
  const scrollToPreviewSection = useCallback((sectionId: string, previewTabKey?: string) => {
    const key = `${previewTabKey || ''}::${sectionId}`;
    if (key === lastFocusSectionRef.current) return; // Skip if already on this section
    lastFocusSectionRef.current = key;

    // Switch to the correct preview tab if provided
    if (previewTabKey) {
      setActivePreview(previewTabKey);
    }

    // If no sectionId, just switch the tab (for supplementary contracts)
    if (!sectionId) return;

    // Wait for render to complete, then scroll to the section
    requestAnimationFrame(() => {
      setTimeout(() => {
        const previewPanel = document.getElementById('preview-panel');
        const target = previewPanel?.querySelector(`[data-section-id="${sectionId}"]`);
        if (target && previewPanel) {
          const panelRect = previewPanel.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const scrollOffset = targetRect.top - panelRect.top + previewPanel.scrollTop - 80;
          previewPanel.scrollTo({ top: scrollOffset, behavior: 'smooth' });

          // Brief highlight flash on the target element
          target.classList.add('preview-highlight-flash');
          setTimeout(() => target.classList.remove('preview-highlight-flash'), 1500);
        }
      }, 50);
    });
  }, []);

  // ── Resize handle logic ──
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    resizeStartXRef.current = e.clientX;
    resizeStartWidthRef.current = formWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [formWidth]);

  useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const delta = e.clientX - resizeStartXRef.current;
      const newWidth = Math.min(1400, Math.max(450, resizeStartWidthRef.current + delta));
      setFormWidth(newWidth);
    };
    const handleResizeEnd = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      data: (type === 'hirePurchase' || type === 'hirePurchaseBack')
        ? { ...initialAppData.agreements[0].data, contractNo: '' }
        : (type === 'loan')
          ? {
            contractNo: '',
            contractDate: TODAY,
            madeAt: data.agileInfo.companyName,
            effectiveDate: TODAY,
            lender1: { name: data.agileInfo.companyName, taxId: data.agileInfo.taxId, address: data.agileInfo.address, proportion: '20' },
            lender2: { name: data.tkInfo.companyName, taxId: data.tkInfo.taxId, address: data.tkInfo.address, proportion: '80' },
            loanAmount: '0',
            installments: '48',
            interestRate: '9',
            interestType: 'แบบลดต้นลดดอก',
            businessPurpose: '',
            collateralValue: '0',
            collateralAssets: [],
            lender1Signatories: data.agileInfo.directors,
            lender2Signatories: data.tkInfo.directors,
            borrowerSignatories: data.customerInfo.directors
          }
          : {}
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
      agreements: prev.agreements.map(a => {
        if (a.type === 'hirePurchase' || a.type === 'hirePurchaseBack') {
          return { ...a, data: { ...a.data, lessor1: { ...a.data.lessor1, name: info.companyName, taxId: info.taxId, address: info.address }, lessor1Signatories: info.directors } };
        }
        if (a.type === 'loan') {
          return { ...a, data: { ...a.data, lender1: { ...a.data.lender1, name: info.companyName, taxId: info.taxId, address: info.address }, lender1Signatories: info.directors } };
        }
        return a;
      })
    }));
  };

  const updateTkInfo = (info: CompanyInfo) => {
    setData(prev => ({
      ...prev,
      tkInfo: info,
      agreements: prev.agreements.map(a => {
        if (a.type === 'hirePurchase' || a.type === 'hirePurchaseBack') {
          return { ...a, data: { ...a.data, lessor2: { ...a.data.lessor2, name: info.companyName, taxId: info.taxId, address: info.address }, lessor2Signatories: info.directors } };
        }
        if (a.type === 'loan') {
          return { ...a, data: { ...a.data, lender2: { ...a.data.lender2, name: info.companyName, taxId: info.taxId, address: info.address }, lender2Signatories: info.directors } };
        }
        return a;
      })
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

  // ── Build grouped preview tabs ──
  // Main contracts: each agreement + its buybacks as sub-items
  const mainContractGroups = data.agreements.map((agreement, idx) => {
    const buybacks: { key: string; label: string }[] = [];
    if ((agreement.type === 'hirePurchase' || agreement.type === 'hirePurchaseBack')) {
      const hp = agreement.data as HirePurchaseData;
      if (hp.hasBuyback && hp.buybacks) {
        hp.buybacks.forEach((bb, bbIdx) => {
          buybacks.push({
            key: `buyback:${agreement.id}:${bb.id}`,
            label: `สัญญารับซื้อคืน (${bbIdx + 1})`
          });
        });
      }
    }
    return {
      id: agreement.id,
      key: `agreement-${agreement.id}`,
      type: agreement.type,
      label: `${CONTRACT_TYPE_LABELS[agreement.type]}${data.agreements.filter(a => a.type === agreement.type).length > 1 ? ` (${idx + 1})` : ''}`,
      contractNo: (agreement.data as any).contractNo || '',
      buybacks
    };
  });

  // Supplementary tabs
  const supplementaryTabs: { key: string; label: string; icon: 'shield' | 'handshake' | 'wrench' | 'receipt' }[] = [];
  if (data.guarantors && data.guarantors.length > 0) {
    supplementaryTabs.push({ key: 'guarantee', label: 'ค้ำประกัน', icon: 'shield' });
  }
  supplementaryTabs.push({ key: 'jointVenture', label: 'ค้าร่วม', icon: 'handshake' });
  supplementaryTabs.push({ key: 'serviceAgreement', label: 'จ้างบริการ', icon: 'wrench' });
  supplementaryTabs.push({ key: 'feePayment', label: 'ค่าธรรมเนียม', icon: 'receipt' });

  const suppIcon = (icon: string) => {
    switch (icon) {
      case 'shield': return <Shield size={13} />;
      case 'handshake': return <Handshake size={13} />;
      case 'wrench': return <Wrench size={13} />;
      case 'receipt': return <Receipt size={13} />;
      default: return <FileText size={13} />;
    }
  };



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
    if (agreement.type === 'loan') {
      return (
        <CreditFacilityPreview
          data={agreement.data}
          customerInfo={data.customerInfo}
          agileInfo={data.agileInfo}
          tkInfo={data.tkInfo}
          guarantors={data.guarantors}
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
    entityType: data.customerInfo.entityType,
    items: data.feePaymentData.items,
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 print:bg-white print:h-auto print:overflow-visible">
      {/* Left Panel: Form */}
      <div
        style={{ width: previewVisible ? `${formWidth}px` : '100%' }}
        className="flex-shrink-0 border-r border-gray-300 print:hidden overflow-y-auto bg-white shadow-lg z-10 flex flex-col h-full transition-[width] duration-200"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-3 z-20 shadow-sm">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Control Panel</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewVisible(!previewVisible)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-all text-sm border ${
                  previewVisible
                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                }`}
                title={previewVisible ? 'ซ่อน Preview' : 'แสดง Preview'}
              >
                {previewVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                {previewVisible ? 'ซ่อน' : 'แสดง Preview'}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm"
              >
                <Printer size={16} /> Print
              </button>
            </div>
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
                  type={activeAgreement.type}
                  customerInfo={data.customerInfo}
                  onChange={(hp: HirePurchaseData) => updateAgreementData(activeAgreement.id, hp)}
                  onFocusSection={(sectionId: string) => scrollToPreviewSection(sectionId, `agreement-${activeAgreement.id}`)}
                />
              )}
              {activeAgreement.type === 'loan' && (
                <CreditFacilityForm
                  data={activeAgreement.data}
                  onChange={(cf: any) => updateAgreementData(activeAgreement.id, cf)}
                  onFocusSection={(sectionId: string) => scrollToPreviewSection(sectionId, `agreement-${activeAgreement.id}`)}
                />
              )}
              {activeAgreement.type !== 'hirePurchase' && activeAgreement.type !== 'hirePurchaseBack' && activeAgreement.type !== 'loan' && (
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
          {/* Step 5: Global Layout (Guarantors, etc.) */}
          <div className="space-y-5 border-t-2 border-slate-100 pt-5 mt-5" onFocusCapture={() => scrollToPreviewSection('', 'guarantee')}>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">ข้อมูลประกอบและสัญญาพ่วง</h3>

            <GuarantorForm
              data={data.guarantors}
              onChange={(g: GuarantorData[]) => updateField('guarantors', g)}
              agreements={data.agreements}
              customerInfo={data.customerInfo}
            />
          </div>


          {/* ── Additional Contracts (after guarantor) ── */}
          <div className="border-t-2 border-slate-300 pt-5 mt-2">
            <h3 className="font-bold text-slate-600 text-sm mb-4 uppercase tracking-wider">สัญญาเพิ่มเติม</h3>

            {/* Contract 4: สัญญาค้าร่วม */}
            <div className="space-y-5">
              <div onFocusCapture={() => scrollToPreviewSection('', 'jointVenture')}>
                <JointVentureForm
                  data={data.jointVentureData}
                  onChange={(jv: JointVentureData) => updateField('jointVentureData', jv)}
                />
              </div>

              {/* Contract 5: สัญญาจ้างบริการ */}
              <div onFocusCapture={() => scrollToPreviewSection('', 'serviceAgreement')}>
                <ServiceAgreementForm
                  data={data.serviceAgreementData}
                  appData={data}
                  onChange={(sa: ServiceAgreementData) => updateField('serviceAgreementData', sa)}
                />
              </div>

              {/* Contract 6: สัญญาชำระค่าธรรมเนียม */}
              <div onFocusCapture={() => scrollToPreviewSection('', 'feePayment')}>
                <FeePaymentForm
                  data={data.feePaymentData}
                  agreements={data.agreements}
                  onChange={(fp: FeePaymentData) => updateField('feePaymentData', fp)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Resize Handle ── */}
      {previewVisible && (
        <div
          onMouseDown={handleResizeStart}
          className="resize-handle w-[6px] flex-shrink-0 bg-slate-200 hover:bg-blue-400 active:bg-blue-500 cursor-col-resize print:hidden flex items-center justify-center transition-colors group relative z-20"
          title="ลากเพื่อปรับขนาด"
        >
          <GripVertical size={14} className="text-slate-400 group-hover:text-white transition-colors" />
        </div>
      )}

      {/* Right Panel: Preview */}
      {previewVisible && (
      <div id="preview-panel" className="flex-1 overflow-y-auto bg-slate-200 print:p-0 print:bg-white print:overflow-visible flex flex-col transform-gpu">
        <div className="sticky top-0 z-10 bg-slate-200 px-4 pt-3 pb-2 print:hidden flex justify-center">
          <div className="w-[210mm] max-w-full">
          <div className="bg-white rounded-t-lg border border-b-0 border-slate-200 px-3 py-2 flex items-center gap-2" ref={dropdownRef}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">สัญญาหลัก</span>
            <div className="flex gap-1.5 flex-wrap">
              {mainContractGroups.map((group) => {
                const isActive = activePreview === group.key || group.buybacks.some(b => b.key === activePreview);
                const hasBuybacks = group.buybacks.length > 0;
                return (
                  <div key={group.id} className="relative">
                    <button
                      onClick={() => {
                        if (hasBuybacks) {
                          setOpenDropdownId(openDropdownId === group.id ? null : group.id);
                        }
                        setActivePreview(group.key);
                      }}
                      className={`flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-slate-800 text-white shadow-md'
                          : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <FileText size={13} className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span>{group.label}</span>
                      {group.contractNo && <span className={`text-[10px] ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>({group.contractNo})</span>}
                      {hasBuybacks && <ChevronDown size={12} className={`ml-0.5 transition-transform ${openDropdownId === group.id ? 'rotate-180' : ''}`} />}
                    </button>
                    {/* Dropdown for buybacks */}
                    {hasBuybacks && openDropdownId === group.id && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 min-w-[200px] animate-in fade-in slide-in-from-top-1 duration-150">
                        <button
                          onClick={() => { setActivePreview(group.key); setOpenDropdownId(null); }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                            activePreview === group.key ? 'bg-slate-100 font-bold text-slate-800' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <FileText size={12} /> {group.label}
                        </button>
                        <div className="border-t border-slate-100 my-1" />
                        {group.buybacks.map(bb => (
                          <button
                            key={bb.key}
                            onClick={() => { setActivePreview(bb.key); setOpenDropdownId(null); }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                              activePreview === bb.key ? 'bg-orange-50 font-bold text-orange-700' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <ChevronRight size={12} className="text-orange-400" /> {bb.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Row 2: Supplementary Tabs ── */}
          <div className="bg-white rounded-b-lg border border-t-0 border-slate-200 shadow-sm px-3 py-2 flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">สัญญาเสริม</span>
            <div className="flex gap-1 flex-wrap">
              {supplementaryTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActivePreview(tab.key)}
                  className={`flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                    activePreview === tab.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {suppIcon(tab.icon)}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 p-6 print:p-0 flex flex-col items-center">
          <div className="w-[210mm] print:w-[210mm] print:h-auto print:max-w-none space-y-8 print:space-y-0">
            {activePreview.startsWith('agreement-') && (
              data.agreements.find(a => `agreement-${a.id}` === activePreview) &&
              renderContractPreview(data.agreements.find(a => `agreement-${a.id}` === activePreview)!)
            )}

            {activePreview.startsWith('buyback:') && (
              (() => {
                const parts = activePreview.split(':');
                const agreementId = parts[1];
                const buybackId = parts[2];
                const agreement = data.agreements.find(a => a.id === agreementId);
                if (agreement && (agreement.type === 'hirePurchase' || agreement.type === 'hirePurchaseBack')) {
                  const hp = agreement.data as HirePurchaseData;
                  const buyback = hp.buybacks?.find(b => b.id === buybackId);
                  if (hp.hasBuyback && buyback) {
                    return (
                      <BuybackPreview
                        data={buyback}
                        agileInfo={data.agileInfo}
                        tkInfo={data.tkInfo}
                        hpData={hp}
                        customerInfo={data.customerInfo}
                        mainContractType={agreement.type}
                      />
                    );
                  }
                }
                return null;
              })()
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
      )}
    </div>
  );
}

export default App;
