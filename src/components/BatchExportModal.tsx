import { useState, useEffect } from 'react';
import { X, Printer, CheckSquare, Square, Loader2 } from 'lucide-react';
import { useHighlight } from '../contexts/HighlightContext';

export interface ExportItem {
  id: string;
  label: string;
  type: 'main' | 'buyback' | 'supplementary';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: ExportItem[];
  onSelectPreview: (id: string) => void;
}

export default function BatchExportModal({ isOpen, onClose, items, onSelectPreview }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const { setPrintMode } = useHighlight();

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(items.map(i => i.id)));
      setIsExporting(false);
      setCurrentIndex(-1);
    }
  }, [isOpen, items]);

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === items.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map(i => i.id)));
  };

  const handleStartExport = async (mode: 'review' | 'final') => {
    const itemsToExport = items.filter(i => selectedIds.has(i.id));
    if (itemsToExport.length === 0) return;

    setIsExporting(true);
    setPrintMode(mode);

    for (let i = 0; i < itemsToExport.length; i++) {
      setCurrentIndex(i);
      const item = itemsToExport[i];
      
      // 1. Switch to the tab
      onSelectPreview(item.id);
      
      // 2. Wait for React to render the new tab
      // Increased delay to ensure all heavy DOM elements (like 80 pages) are fully rendered
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 3. Trigger print. Browser will pause JS here until dialog closes.
      window.print();
      
      // 4. Wait briefly after dialog closes before moving to next
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Done
    setIsExporting(false);
    setCurrentIndex(-1);
    onClose();
  };

  const itemsToExport = items.filter(i => selectedIds.has(i.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print:hidden">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Printer size={20} className="text-blue-600" />
            ดาวน์โหลดหลายสัญญา (Batch Export)
          </h2>
          {!isExporting && (
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-50">
          {isExporting ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 size={40} className="animate-spin text-blue-500" />
              <div>
                <div className="text-lg font-bold text-slate-700">กำลังเตรียมหน้าพิมพ์...</div>
                <div className="text-sm text-slate-500 mt-1">
                  เอกสารที่ {currentIndex + 1} จาก {itemsToExport.length}
                </div>
                <div className="text-sm font-medium text-blue-600 mt-2">
                  {itemsToExport[currentIndex]?.label}
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4 max-w-[250px]">
                กรุณากด Save/Print ในหน้าต่างที่เด้งขึ้นมา ระบบจะไปยังเอกสารต่อไปอัตโนมัติ
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                เลือกสัญญาที่ต้องการดาวน์โหลด/พิมพ์ต่อเนื่อง ระบบจะทำการสลับหน้าและเปิดหน้าต่าง Print ทีละรายการให้เอง
              </p>
              
              <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
                <div className="flex items-center gap-2 p-3 bg-slate-100 border-b border-slate-200 font-medium text-sm text-slate-700">
                  <button onClick={toggleAll} className="hover:text-blue-600">
                    {selectedIds.size === items.length ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} />}
                  </button>
                  <span onClick={toggleAll} className="cursor-pointer select-none">เลือกทั้งหมด ({selectedIds.size}/{items.length})</span>
                </div>
                <div className="max-h-[40vh] overflow-y-auto">
                  {items.map(item => (
                    <div 
                      key={item.id} 
                      className="flex items-center gap-3 p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer"
                      onClick={() => toggleItem(item.id)}
                    >
                      <button>
                        {selectedIds.has(item.id) ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} className="text-slate-300" />}
                      </button>
                      <span className={`text-sm ${
                        item.type === 'main' ? 'font-bold text-slate-700' : 
                        item.type === 'buyback' ? 'text-slate-600 ml-4' : 
                        'text-slate-600'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isExporting && (
          <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-white">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md font-medium text-sm text-slate-600 hover:bg-slate-100"
            >
              ยกเลิก
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleStartExport('review')}
                disabled={selectedIds.size === 0}
                className="px-4 py-2 rounded-md font-medium text-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-50 flex items-center gap-2"
              >
                <Printer size={16} />
                แบบตรวจทาน
              </button>
              <button
                onClick={() => handleStartExport('final')}
                disabled={selectedIds.size === 0}
                className="px-4 py-2 rounded-md font-medium text-sm bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Printer size={16} />
                แบบทำสัญญา
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
