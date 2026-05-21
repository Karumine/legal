import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { Printer, FileText, Eye, EyeOff, ChevronDown, GripVertical, Shield, Handshake, Wrench, Receipt, ChevronRight, RotateCcw, Save, Loader2, Share2, Plus, Trash2 } from 'lucide-react';
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
import ODForm from './components/ODForm';
import ODPreview from './components/ODPreview';
import type { GuaranteeData } from './types/guarantee';
import type { ContractData } from './types/contract';
import { thaiBahtText } from './utils/thaiBahtText';
import { useHighlight } from './contexts/HighlightContext';
import { useNotification } from './contexts/NotificationContext';
import { NotificationContainer } from './components/Notification';
import CountdownTimer from './components/CountdownTimer';
import BatchExportModal from './components/BatchExportModal';
import type { ExportItem } from './components/BatchExportModal';
import { saveDraft, getDraft } from './services/supabase';

type PreviewTab = string;

function App() {
  const { printMode, setPrintMode } = useHighlight();
  const { notify } = useNotification();
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('legalAppData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration for guaranteeAgreements
        if (!parsed.guaranteeAgreements) {
          if (parsed.guarantors && parsed.guarantors.length > 0) {
            parsed.guaranteeAgreements = [
              {
                id: 'ga-legacy-' + Date.now(),
                guarantors: parsed.guarantors
              }
            ];
          } else {
            parsed.guaranteeAgreements = [];
          }
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    return initialAppData;
  });

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('legalAppData', JSON.stringify(data));
  }, [data]);

  const [draftId, setDraftId] = useState<string | null>(null);
  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const [isBatchExportOpen, setIsBatchExportOpen] = useState(false);

  // Load draft from Supabase if draftId is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('draftId');
    if (id) {
      setDraftId(id);
      const loadDraft = async (dId: string) => {
        try {
          const draft = await getDraft(dId);
          if (draft && draft.data) {
            setData(draft.data);
          }
        } catch (e) {
          console.error('Failed to load cloud draft', e);
        }
      };
      loadDraft(id);
    }
  }, []);

  const handleSaveCloudDraft = async () => {
    setIsCloudSaving(true);
    try {
      const result = await saveDraft(data, draftId || undefined);
      if (result) {
        setDraftId(result.id);
        // Update URL without refreshing
        const newUrl = `${window.location.pathname}?draftId=${result.id}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        // Copy link to clipboard
        navigator.clipboard.writeText(window.location.href);
        notify('บันทึกร่างและคัดลอกลิงก์เรียบร้อยแล้ว!', 'success');
      }
    } catch (e) {
      console.error('Failed to save cloud draft', e);
      notify('เกิดข้อผิดพลาดในการบันทึกร่าง: กรุณาตรวจสอบการตั้งค่า Supabase', 'error');
    } finally {
      setIsCloudSaving(false);
    }
  };
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

  const scrollPositionsRef = useRef<Record<string, number>>({});
  const isInternalScrollRef = useRef(false);
  const isSectionScrollingRef = useRef(false);
  const previewPanelRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isInternalScrollRef.current || isSectionScrollingRef.current) return;
    scrollPositionsRef.current[activePreview] = e.currentTarget.scrollTop;
  };

  // ── Preview Scaling Logic ──
  const [previewScale, setPreviewScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);
  const previewContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = document.getElementById('preview-panel');
    if (!panel) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const padding = 48; // p-6 (24px * 2)
      const available = width - padding;
      const target = 820; // 210mm (~794px) + small buffer
      setPreviewScale(Math.min(1, available / target));
    });
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!previewContentRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setContentHeight(entries[0].contentRect.height);
    });
    observer.observe(previewContentRef.current);
    return () => observer.disconnect();
  }, []);

  // Preview scroll sync: switches to the correct preview tab and scrolls to the matching section
  const lastFocusSectionRef = useRef<string>('');
  const scrollToPreviewSection = useCallback((sectionId: string, previewTabKey?: string) => {
    const key = `${previewTabKey || ''}::${sectionId}`;
    const isNewSection = key !== lastFocusSectionRef.current;
    lastFocusSectionRef.current = key;

    // Switch to the correct preview tab if provided
    if (previewTabKey && previewTabKey !== activePreview) {
      // Only block restoration if we actually have a sectionId to scroll to.
      // If no sectionId, we want the standard restoration logic to run.
      if (sectionId) {
        isSectionScrollingRef.current = true;
      }
      setActivePreview(previewTabKey);
    }

    // If no sectionId, just switch the tab (for supplementary contracts)
    if (!sectionId) {
       return;
    }

    // Wait for render to complete, then scroll to the section
    requestAnimationFrame(() => {
      setTimeout(() => {
        const previewPanel = document.getElementById('preview-panel');
        const target = previewPanel?.querySelector(`[data-section-id="${sectionId}"]`);
        
        if (target && previewPanel) {
          isSectionScrollingRef.current = true;
          
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Brief highlight flash on the target element only if it's a new section or it was not previously flashing
          if (isNewSection) {
            target.classList.add('preview-highlight-flash');
            setTimeout(() => target.classList.remove('preview-highlight-flash'), 1500);
          }

          // Reset internal scroll flag after smooth animation finishes
          setTimeout(() => { isSectionScrollingRef.current = false; }, 1000);
        } else {
          isSectionScrollingRef.current = false;
        }
      }, 50);
    });
  }, [activePreview]); // Added activePreview to deps as we reference it

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

  // ── Scroll Management (Memory per tab) ──
  useLayoutEffect(() => {
    const panel = previewPanelRef.current;
    if (!panel) return;

    // 1. Immediately block saving for the new tab
    isInternalScrollRef.current = true;
    
    const targetPos = scrollPositionsRef.current[activePreview] || 0;
    
    // 2. Initial restoration attempt
    panel.scrollTop = targetPos;

    // 3. Keep blocking for a bit to swallow residual scroll events
    const timer = setTimeout(() => {
      isInternalScrollRef.current = false;
    }, 200);

    return () => {
      clearTimeout(timer);
      isInternalScrollRef.current = false;
    };
  }, [activePreview]);

  // Handle document growth (long docs) during a tab switch or while editing
  useEffect(() => {
    if (isInternalScrollRef.current) {
      const panel = previewPanelRef.current;
      if (panel) {
        const targetPos = scrollPositionsRef.current[activePreview] || 0;
        if (panel.scrollTop < targetPos) {
          panel.scrollTop = targetPos;
        }
      }
    }
  }, [contentHeight, activePreview]);

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
            borrowerSignatories: data.customerInfo.directors,
            conditions32: ['ผู้กู้ตกลงและยินยอมให้ผู้ให้สินเชื่อมีสิทธิในการหักเงินจากวงเงินกู้ที่จะได้รับตามสัญญาฉบับนี้ เพื่อการชำระค่าจดทะเบียนจำนองหลักประกัน ค่าอากรแสตมป์ ชำระค่าธรรมเนียมการทำสัญญา เงินดาวน์ ค่าประกันภัยเครื่องจักร ค่าจดทะเบียนกรรมสิทธิ์เครื่องจักร รวมถึงค่าใช้จ่ายอื่นๆ ทั้งตามสัญญาฉบับนี้ และสัญญาฉบับอื่นๆ ที่ผู้กู้มีหน้าที่ต้องชำระให้แก่ผู้ให้สินเชื่อ ก่อนการเบิกใช้เงินตามสัญญาฉบับนี้']
          }
          : (type === 'od')
            ? {
              contractNo: '',
              contractDate: TODAY,
              madeAt: data.agileInfo.companyName,
              effectiveDate: TODAY,
              lender1: { name: data.agileInfo.companyName, taxId: data.agileInfo.taxId, address: data.agileInfo.address, proportion: '20' },
              lender2: { name: data.tkInfo.companyName, taxId: data.tkInfo.taxId, address: data.tkInfo.address, proportion: '80' },
              loanAmount: '0',
              installments: '',
              installmentAmount: '',
              interestRate: '15',
              interestType: 'แบบลดต้นลดดอก',
              businessPurpose: '',
              firstInstallmentDate: '',
              paymentDay: '',
              lastInstallmentDate: '',
              collateralValue: '0',
              collateralAssets: [],
              stampDuty: '',
              lender1Signatories: data.agileInfo.directors,
              lender2Signatories: data.tkInfo.directors,
              borrowerSignatories: data.customerInfo.directors,
              conditions32: ['ผู้กู้ตกลงและยินยอมให้ผู้ให้สินเชื่อมีสิทธิในการหักเงินจากวงเงินกู้ที่จะได้รับตามสัญญาฉบับนี้ เพื่อการชำระค่าจดทะเบียนจำนองหลักประกัน ค่าอากรแสตมป์ ชำระค่าธรรมเนียมการทำสัญญา เงินดาวน์ ค่าประกันภัยเครื่องจักร ค่าจดทะเบียนกรรมสิทธิ์เครื่องจักร รวมถึงค่าใช้จ่ายอื่นๆ ทั้งตามสัญญาฉบับนี้ และสัญญาฉบับอื่นๆ ที่ผู้กู้มีหน้าที่ต้องชำระให้แก่ผู้ให้สินเชื่อ ก่อนการเบิกใช้เงินตามสัญญาฉบับนี้']
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
          return { ...a, data: { ...a.data, lessor1: { ...a.data.lessor1, name: info.companyName, taxId: info.taxId, address: info.address, postalCode: info.postalCode }, lessor1Signatories: info.directors } };
        }
        if (a.type === 'loan') {
          return { ...a, data: { ...a.data, lender1: { ...a.data.lender1, name: info.companyName, taxId: info.taxId, address: info.address, postalCode: info.postalCode }, lender1Signatories: info.directors } };
        }
        if (a.type === 'od') {
          return { ...a, data: { ...a.data, lender1: { ...a.data.lender1, name: info.companyName, taxId: info.taxId, address: info.address, postalCode: info.postalCode }, lender1Signatories: info.directors } };
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
          return { ...a, data: { ...a.data, lessor2: { ...a.data.lessor2, name: info.companyName, taxId: info.taxId, address: info.address, postalCode: info.postalCode }, lessor2Signatories: info.directors } };
        }
        if (a.type === 'loan') {
          return { ...a, data: { ...a.data, lender2: { ...a.data.lender2, name: info.companyName, taxId: info.taxId, address: info.address, postalCode: info.postalCode }, lender2Signatories: info.directors } };
        }
        if (a.type === 'od') {
          return { ...a, data: { ...a.data, lender2: { ...a.data.lender2, name: info.companyName, taxId: info.taxId, address: info.address, postalCode: info.postalCode }, lender2Signatories: info.directors } };
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
      if (a.type === 'hirePurchase' || a.type === 'hirePurchaseBack') {
        // HP: deduct down payment from total amount
        const total = parseFloat(((a.data as any).totalAmount || '0').toString().replace(/,/g, '')) || 0;
        const down = parseFloat(((a.data as any).downPayment || '0').toString().replace(/,/g, '')) || 0;
        return sum + (total - down);
      } else {
        // Loan / OD: use loanAmount directly (no down payment concept)
        const loanAmt = parseFloat(((a.data as any).loanAmount || (a.data as any).totalAmount || '0').toString().replace(/,/g, '')) || 0;
        return sum + loanAmt;
      }
    }, 0);

    return {
      contractNo: guarantors[0]?.contractNo || (hpData?.contractNo ? `AGA/XX-SUR` : ''),
      effectiveDate: guarantors[0]?.contractDate || hpData?.contractDate || '',
      // Party 1 (Lender)
      lenderCompany: data.agileInfo.companyName,
      lenderDirectors: data.agileInfo.directors,
      lenderAddress: data.agileInfo.address,
      lenderPostalCode: data.agileInfo.postalCode,
      lenderTaxId: data.agileInfo.taxId,
      lenderPhone: data.agileInfo.phone,

      // Party 2 (Borrower)
      borrowerCompany: data.companyMode === 'agileTK' ? data.tkInfo.companyName : '',
      borrowerDirectors: data.companyMode === 'agileTK' ? data.tkInfo.directors : '',
      borrowerAddress: data.companyMode === 'agileTK' ? data.tkInfo.address : '',
      borrowerPostalCode: data.companyMode === 'agileTK' ? data.tkInfo.postalCode : '',
      borrowerTaxId: data.companyMode === 'agileTK' ? data.tkInfo.taxId : '',
      borrowerPhone: data.companyMode === 'agileTK' ? data.tkInfo.phone : '',

      // Party 3 (Guarantors)
      guarantors: guarantors.map(g => ({
        name: g.guarantorName,
        idCard: g.guarantorIdCard,
        address: g.guarantorAddress,
        postalCode: g.guarantorPostalCode,
        phone: g.phone || '',
        isMarried: g.isMarried,
        spouseName: g.spouseName,
        spouseIdCard: g.spouseIdCard,
        spouseAddress: g.spouseAddress,
        spousePostalCode: g.spousePostalCode,
        type: g.guarantorType,
        directors: g.directors,
        nationality: g.nationality,
        spouseNationality: g.spouseNationality,
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
  if (data.guaranteeAgreements && data.guaranteeAgreements.length > 0) {
    data.guaranteeAgreements.forEach((ga, idx) => {
      if (ga.guarantors && ga.guarantors.length > 0) {
        supplementaryTabs.push({ 
          key: `guarantee-${ga.id}`, 
          label: `ค้ำประกัน${data.guaranteeAgreements!.length > 1 ? ` (${idx + 1})` : ''}`, 
          icon: 'shield' 
        });
      }
    });
  } else if (data.guarantors && data.guarantors.length > 0) { // Fallback for safety
    supplementaryTabs.push({ key: 'guarantee-legacy', label: 'ค้ำประกัน', icon: 'shield' });
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

  const customerName = data.customerInfo.companyName || 'Unknown_Customer';
  
  const exportItems: ExportItem[] = [
    ...mainContractGroups.flatMap(g => {
      const contractRef = g.contractNo ? `_${g.contractNo}` : '';
      return [
        { id: g.key, label: g.label, type: 'main' as const, fileName: `${g.label}_${customerName}${contractRef}` },
        ...g.buybacks.map((b, bIdx) => ({ 
          id: b.key, 
          label: b.label, 
          type: 'buyback' as const, 
          fileName: `สัญญารับซื้อคืน${bIdx > 0 ? `_${bIdx + 1}` : ''}_${customerName}${contractRef}` 
        }))
      ];
    }),
    ...supplementaryTabs.map(t => ({ 
      id: t.key, 
      label: t.label, 
      type: 'supplementary' as const, 
      fileName: `${t.label}_${customerName}` 
    }))
  ];

  const renderContractPreview = (agreement: Agreement) => {
    const allGuarantors = [
      ...data.guarantors,
      ...(data.guaranteeAgreements?.flatMap(ga => ga.guarantors) || [])
    ];
    const filteredGuarantors = allGuarantors.filter(g => g.selectedAgreementIds?.includes(agreement.id));

    if (agreement.type === 'hirePurchase' || agreement.type === 'hirePurchaseBack') {
      return (
        <HirePurchasePreview
          data={agreement.data}
          customerInfo={data.customerInfo}
          guarantors={filteredGuarantors}
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
          guarantors={filteredGuarantors}
        />
      );
    }
    if (agreement.type === 'od') {
      return (
        <ODPreview
          data={agreement.data}
          customerInfo={data.customerInfo}
          agileInfo={data.agileInfo}
          tkInfo={data.tkInfo}
          guarantors={filteredGuarantors}
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
    companyName: data.agileInfo.companyName,
    companyAddress: data.agileInfo.address,
    companyPostalCode: data.agileInfo.postalCode,
    companyTaxId: data.agileInfo.taxId,
    companyDirectors: data.agileInfo.directors,
    customerCompany: data.customerInfo.companyName,
    customerDirector: data.customerInfo.directors,
    customerAddress: data.customerInfo.address,
    customerPostalCode: data.customerInfo.postalCode,
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
            <div className="flex items-center gap-3">
              <CountdownTimer />
            </div>
            <div className="flex items-center gap-2">
              {/* Compact mode logic: hide text if form is too narrow */}
              {(() => {
                const showText = !previewVisible || formWidth > 750;
                return (
                  <>
                    <button
                      onClick={handleSaveCloudDraft}
                      disabled={isCloudSaving}
                      className={`flex items-center justify-center p-2 rounded-md font-bold transition-all border shadow-sm ${isCloudSaving
                        ? 'bg-gray-100 text-gray-400 border-gray-200'
                        : draftId
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                          : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                        }`}
                      title={draftId ? 'อัปเดตร่างบน Cloud' : 'บันทึกร่างลง Cloud'}
                    >
                      {isCloudSaving ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                    </button>

                    {draftId && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          notify('คัดลอกลิงก์เรียบร้อย! คุณสามารถส่งลิงก์นี้ให้เพื่อนร่วมงานทำต่อได้เลย', 'success');
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-md font-medium bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all text-sm shadow-sm"
                        title="คัดลอกลิงก์สำหรับส่งต่อ"
                      >
                        <Share2 size={16} />
                        {showText && <span>แชร์ลิงก์</span>}
                      </button>
                    )}

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    <button
                      onClick={() => setPreviewVisible(!previewVisible)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-all text-sm border ${previewVisible
                        ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                        }`}
                      title={previewVisible ? 'ซ่อน Preview' : 'แสดง Preview'}
                    >
                      {previewVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                      {showText && <span>{previewVisible ? 'ซ่อน' : 'แสดง Preview'}</span>}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่? ข้อมูลเก่าจะหายไปทั้งหมด')) {
                          localStorage.removeItem('legalAppData');
                          window.location.reload();
                        }
                      }}
                      className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-md font-medium transition-colors text-sm"
                      title="ล้างข้อมูลเริ่มต้นใหม่"
                    >
                      <RotateCcw size={15} />
                      {showText && <span>รีเซ็ต</span>}
                    </button>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200 h-10">
                      <button
                        onClick={() => { setPrintMode('review'); setTimeout(handlePrint, 100); }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-all text-sm h-full ${printMode === 'review'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-transparent text-slate-600 hover:bg-slate-200'
                          }`}
                        title="พิมพ์แบบมีไฮไลต์จาง สำหรับตรวจทาน"
                      >
                        <Printer size={14} />
                        {showText && <span>ตรวจ</span>}
                      </button>
                      <button
                        onClick={() => { setPrintMode('final'); setTimeout(handlePrint, 100); }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-all text-sm h-full ${printMode === 'final'
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'bg-transparent text-slate-600 hover:bg-slate-200'
                          }`}
                        title="พิมพ์แบบตัวอักษรธรรมดา สำหรับเอาไปทำสัญญา"
                      >
                        <Printer size={14} />
                        {showText && <span>ทำสัญญา</span>}
                      </button>
                      <div className="w-px h-4 bg-slate-300 mx-1" />
                      <button
                        onClick={() => setIsBatchExportOpen(true)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-bold transition-all text-sm h-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200`}
                        title="โหลดหลายสัญญาต่อเนื่อง"
                      >
                        <Printer size={14} />
                        {showText && <span>Print All</span>}
                      </button>
                    </div>
                  </>
                );
              })()}
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
                  agreementId={activeAgreement.id}
                  agreements={data.agreements}
                  onChange={(hp: HirePurchaseData) => updateAgreementData(activeAgreement.id, hp)}
                  onFocusSection={(sectionId: string, tabKey?: string) => scrollToPreviewSection(sectionId, tabKey || `agreement-${activeAgreement.id}`)}
                  onBuybackToggled={(buybackId: string) => setActivePreview(`buyback:${activeAgreement.id}:${buybackId}`)}
                />
              )}
              {activeAgreement.type === 'loan' && (
                <CreditFacilityForm
                  data={activeAgreement.data}
                  customerInfo={data.customerInfo}
                  agreements={data.agreements}
                  currentAgreementId={activeAgreement.id}
                  onChange={(cf: any) => updateAgreementData(activeAgreement.id, cf)}
                  onFocusSection={(sectionId: string, tabKey?: string) => scrollToPreviewSection(sectionId, tabKey || `agreement-${activeAgreement.id}`)}
                />
              )}
              {activeAgreement.type === 'od' && (
                <ODForm
                  data={activeAgreement.data}
                  agreements={data.agreements}
                  currentAgreementId={activeAgreement.id}
                  onChange={(od: any) => updateAgreementData(activeAgreement.id, od)}
                  onFocusSection={(sectionId: string, tabKey?: string) => scrollToPreviewSection(sectionId, tabKey || `agreement-${activeAgreement.id}`)}
                />
              )}
              {activeAgreement.type !== 'hirePurchase' && activeAgreement.type !== 'hirePurchaseBack' && activeAgreement.type !== 'loan' && activeAgreement.type !== 'od' && (
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
          <div className="space-y-5 border-t-2 border-slate-100 pt-5 mt-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">ข้อมูลประกอบและสัญญาพ่วง</h3>

            {data.guaranteeAgreements?.map((ga, idx) => (
              <div key={ga.id} className="relative group" onFocusCapture={() => scrollToPreviewSection('', `guarantee-${ga.id}`)}>
                {data.guaranteeAgreements!.length > 1 && (
                  <button
                    onClick={() => {
                      if (window.confirm('คุณต้องการลบสัญญาค้ำประกันฉบับนี้หรือไม่?')) {
                        updateField('guaranteeAgreements', data.guaranteeAgreements!.filter(g => g.id !== ga.id));
                      }
                    }}
                    className="absolute -right-3 -top-3 z-10 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="ลบสัญญาค้ำประกันฉบับนี้"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <GuarantorForm
                  title={`สัญญาค้ำประกัน (ผู้ค้ำ)${data.guaranteeAgreements!.length > 1 ? ` ฉบับที่ ${idx + 1}` : ''}`}
                  data={ga.guarantors}
                  onChange={(g) => {
                    const newGa = [...data.guaranteeAgreements!];
                    newGa[idx] = { ...newGa[idx], guarantors: g };
                    updateField('guaranteeAgreements', newGa);
                  }}
                  agreements={data.agreements}
                  customerInfo={data.customerInfo}
                  onFocusSection={(sectionId: string) => scrollToPreviewSection(sectionId, `guarantee-${ga.id}`)}
                />
              </div>
            ))}
            
            {/* Legacy fallback */}
            {(!data.guaranteeAgreements || data.guaranteeAgreements.length === 0) && data.guarantors && data.guarantors.length > 0 && (
               <div onFocusCapture={() => scrollToPreviewSection('', 'guarantee-legacy')}>
                  <GuarantorForm
                    title="สัญญาค้ำประกัน (ผู้ค้ำ)"
                    data={data.guarantors}
                    onChange={(g) => updateField('guarantors', g)}
                    agreements={data.agreements}
                    customerInfo={data.customerInfo}
                    onFocusSection={(sectionId: string) => scrollToPreviewSection(sectionId, 'guarantee-legacy')}
                  />
               </div>
            )}

            <button
              onClick={() => {
                const newId = 'ga-' + Date.now();
                const newGa = {
                  id: newId,
                  guarantors: [
                    {
                      id: Date.now().toString(),
                      contractNo: 'AGA/XX-SUR',
                      contractDate: TODAY,
                      guarantorName: '',
                      guarantorIdCard: '',
                      guarantorAddress: '',
                      isMarried: false,
                      spouseName: '',
                      spouseIdCard: '',
                      spouseAddress: '',
                      selectedAgreementIds: data.agreements.map(a => a.id),
                      guarantorType: 'person' as const,
                    }
                  ]
                };
                updateField('guaranteeAgreements', [...(data.guaranteeAgreements || []), newGa]);
              }}
              className="w-full py-3 border-2 border-dashed border-emerald-200 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-all font-bold flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              เพิ่มสัญญาค้ำประกันฉบับใหม่
            </button>
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
                  onFocusSection={(sectionId: string) => scrollToPreviewSection(sectionId, 'jointVenture')}
                />
              </div>

              {/* Contract 5: สัญญาจ้างบริการ */}
              <div onFocusCapture={() => scrollToPreviewSection('', 'serviceAgreement')}>
                <ServiceAgreementForm
                  data={data.serviceAgreementData}
                  appData={data}
                  onChange={(sa: ServiceAgreementData) => updateField('serviceAgreementData', sa)}
                  onFocusSection={(sectionId: string) => scrollToPreviewSection(sectionId, 'serviceAgreement')}
                />
              </div>

              {/* Contract 6: สัญญาชำระค่าธรรมเนียม */}
              <div onFocusCapture={() => scrollToPreviewSection('', 'feePayment')}>
                <FeePaymentForm
                  data={data.feePaymentData}
                  agreements={data.agreements}
                  onChange={(fp: FeePaymentData) => updateField('feePaymentData', fp)}
                  onFocusSection={(sectionId: string) => scrollToPreviewSection(sectionId, 'feePayment')}
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
        <div 
          id="preview-panel" 
          ref={previewPanelRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-slate-200 print:p-0 print:bg-white print:overflow-visible flex flex-col transform-gpu"
        >
          <div className="sticky top-0 z-10 bg-slate-200 px-4 pt-3 pb-2 print:hidden flex justify-center">
            <div className="w-[210mm] max-w-full">
              <div className="bg-white rounded-t-lg border border-b-0 border-slate-200 px-3 py-2 flex items-center gap-2" ref={dropdownRef}>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">สัญญาหลัก</span>
                <div className="flex gap-1.5 flex-wrap">
                  {mainContractGroups.map((group) => {
                    const activeBuyback = group.buybacks.find(b => b.key === activePreview);
                    const isActive = activePreview === group.key || !!activeBuyback;
                    const hasBuybacks = group.buybacks.length > 0;
                    return (
                      <div key={group.id} className="relative">
                        <button
                          onClick={() => {
                            if (hasBuybacks) {
                              setOpenDropdownId(openDropdownId === group.id ? null : group.id);
                            }
                            if (!hasBuybacks) {
                              setActivePreview(group.key);
                            }
                          }}
                          className={`flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${isActive
                            ? 'bg-slate-800 text-white shadow-md'
                            : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                          <FileText size={13} className={isActive ? 'text-white' : 'text-slate-400'} />
                          <span>{activeBuyback ? activeBuyback.label : group.label}</span>
                          {group.contractNo && <span className={`text-[10px] ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>({group.contractNo})</span>}
                          {hasBuybacks && <ChevronDown size={12} className={`ml-0.5 transition-transform ${openDropdownId === group.id ? 'rotate-180' : ''}`} />}
                        </button>
                        {/* Dropdown for buybacks */}
                        {hasBuybacks && openDropdownId === group.id && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 min-w-[200px] animate-in fade-in slide-in-from-top-1 duration-150">
                            <button
                              onClick={() => { setActivePreview(group.key); setOpenDropdownId(null); }}
                              className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${activePreview === group.key ? 'bg-slate-100 font-bold text-slate-800' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                              <FileText size={12} /> {group.label}
                            </button>
                            <div className="border-t border-slate-100 my-1" />
                            {group.buybacks.map(bb => (
                              <button
                                key={bb.key}
                                onClick={() => { setActivePreview(bb.key); setOpenDropdownId(null); }}
                                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${activePreview === bb.key ? 'bg-orange-50 font-bold text-orange-700' : 'text-slate-600 hover:bg-slate-50'
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
                      className={`flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-md transition-all whitespace-nowrap ${activePreview === tab.key
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

          <div className="flex-1 p-6 print:p-0 flex flex-col items-center overflow-x-hidden print:overflow-visible">
            <div
              id="preview-content-container"
              ref={previewContentRef}
              className="w-[210mm] print:w-[210mm] print:h-auto print:max-w-none space-y-8 print:space-y-0 origin-top transition-all duration-200"
              style={{
                transform: previewScale < 1 ? `scale(${previewScale})` : 'none',
                height: 'auto',
                marginBottom: previewScale < 1 ? `${(previewScale - 1) * contentHeight}px` : '0'
              }}
            >
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
              {activePreview.startsWith('guarantee-') && (
                (() => {
                  if (activePreview === 'guarantee-legacy' && data.guarantors && data.guarantors.length > 0) {
                    return <GuaranteePreview data={buildGuaranteeData(data.guarantors)} />;
                  }
                  const gaId = activePreview.replace('guarantee-', '');
                  const ga = data.guaranteeAgreements?.find(g => g.id === gaId);
                  if (ga && ga.guarantors && ga.guarantors.length > 0) {
                    return <GuaranteePreview data={buildGuaranteeData(ga.guarantors)} />;
                  }
                  return null;
                })()
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
      <NotificationContainer />
      {/* Batch Export Modal */}
      <BatchExportModal
        isOpen={isBatchExportOpen}
        onClose={() => setIsBatchExportOpen(false)}
        items={exportItems}
        onSelectPreview={setActivePreview}
      />
    </div>
  );
}

export default App;
