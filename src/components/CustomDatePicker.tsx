import { useState, useEffect, useRef } from 'react';
import { formatThaiDate } from '../utils/thaiDate';
import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  label: string;
  readOnly?: boolean;
}

type ViewMode = 'day' | 'month' | 'year';

export const CustomDatePicker = ({ value, onChange, label, readOnly = false }: CustomDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(value || new Date()));
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const containerRef = useRef<HTMLDivElement>(null);
  const yearScrollRef = useRef<HTMLDivElement>(null);

  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const monthsShort = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  const weekdays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setViewMode('day');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Scroll to current year when year picker opens
  useEffect(() => {
    if (viewMode === 'year' && yearScrollRef.current) {
      const currentYear = viewDate.getFullYear();
      const element = yearScrollRef.current.querySelector(`[data-year="${currentYear}"]`);
      if (element) {
        element.scrollIntoView({ block: 'center' });
      }
    }
  }, [viewMode, viewDate]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  // Navigation handlers for prev/next based on viewMode
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === 'day') {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    } else if (viewMode === 'month') {
      setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
    } else if (viewMode === 'year') {
      // Jump back 30 years in year view
      setViewDate(new Date(viewDate.getFullYear() - 30, viewDate.getMonth(), 1));
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === 'day') {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    } else if (viewMode === 'month') {
      setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
    } else if (viewMode === 'year') {
      // Jump forward 30 years in year view
      setViewDate(new Date(viewDate.getFullYear() + 30, viewDate.getMonth(), 1));
    }
  };

  // Header click: drill up (day → month → year)
  const handleHeaderClick = () => {
    if (viewMode === 'day') {
      setViewMode('month');
    } else if (viewMode === 'month') {
      setViewMode('year');
    }
    // Already at year level, do nothing
  };

  const handleSelectDay = (day: number) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Adjust for timezone offset to ensure ISO string date part is correct
    const offset = selectedDate.getTimezoneOffset();
    const adjustedDate = new Date(selectedDate.getTime() - (offset * 60 * 1000));
    const isoString = adjustedDate.toISOString().split('T')[0];
    onChange(isoString);
    setIsOpen(false);
    setViewMode('day');
  };

  const handleToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const adjustedDate = new Date(today.getTime() - (offset * 60 * 1000));
    const isoString = adjustedDate.toISOString().split('T')[0];
    onChange(isoString);
    setViewDate(new Date());
    setIsOpen(false);
    setViewMode('day');
  };

  // Select year → go back to month view
  const handleSelectYear = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setViewMode('month');
  };

  // Select month → go back to day view
  const handleSelectMonth = (month: number) => {
    setViewDate(new Date(viewDate.getFullYear(), month, 1));
    setViewMode('day');
  };

  // Get header label based on view mode
  const getHeaderLabel = () => {
    if (viewMode === 'day') {
      return `${months[viewDate.getMonth()]} ${viewDate.getFullYear() + 543}`;
    } else if (viewMode === 'month') {
      return `${viewDate.getFullYear() + 543}`;
    } else {
      // year mode: show range
      const currentYear = viewDate.getFullYear();
      const startYear = currentYear - 20;
      const endYear = currentYear + 10;
      return `${startYear + 543} - ${endYear + 543}`;
    }
  };

  const renderDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const days = [];
    // Padding for start day
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`pad-start-${i}`} className="h-9 w-9"></div>);
    }

    const currentSelected = value ? new Date(value) : null;
    const today = new Date();

    for (let d = 1; d <= totalDays; d++) {
      const isSelected = currentSelected && 
                        currentSelected.getFullYear() === year && 
                        currentSelected.getMonth() === month && 
                        currentSelected.getDate() === d;
      
      const isToday = today.getFullYear() === year && 
                      today.getMonth() === month && 
                      today.getDate() === d;

      days.push(
        <button
          key={d}
          type="button"
          onClick={() => handleSelectDay(d)}
          className={`h-9 w-9 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center
            ${isSelected 
              ? 'bg-blue-600 text-white shadow-md transform scale-110' 
              : isToday 
                ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
        >
          {d}
        </button>
      );
    }

    return days;
  };

  const renderMonthPicker = () => {
    const currentMonth = viewDate.getMonth();
    const today = new Date();
    const isCurrentYear = viewDate.getFullYear() === today.getFullYear();

    return (
      <div className="grid grid-cols-3 gap-2 p-1">
        {months.map((m, idx) => {
          const isSelected = currentMonth === idx;
          const isCurrentMonth = isCurrentYear && today.getMonth() === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectMonth(idx)}
              className={`py-3 px-2 rounded-lg text-sm transition-all duration-200 ${
                isSelected 
                  ? 'bg-blue-600 text-white font-bold shadow-md' 
                  : isCurrentMonth
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {monthsShort[idx]}
            </button>
          );
        })}
      </div>
    );
  };

  const renderYearPicker = () => {
    const currentYear = viewDate.getFullYear();
    const thisYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear - 20; y <= currentYear + 10; y++) {
      years.push(y);
    }

    return (
      <div 
        ref={yearScrollRef}
        className="grid grid-cols-3 gap-1.5 p-1 max-h-[260px] overflow-y-auto"
      >
        {years.map(y => (
          <button
            key={y}
            data-year={y}
            type="button"
            onClick={() => handleSelectYear(y)}
            className={`py-2.5 px-1 rounded-lg text-sm transition-all duration-200 ${
              currentYear === y 
                ? 'bg-blue-600 text-white font-bold shadow-md' 
                : y === thisYear
                  ? 'bg-blue-50 text-blue-600 border border-blue-200 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {y + 543}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => { if (!readOnly) { setIsOpen(!isOpen); setViewMode('day'); } }}
        className={`w-full flex items-center justify-between p-2 text-sm bg-white border rounded-md shadow-sm transition-all text-left ${readOnly ? 'bg-gray-50 cursor-not-allowed opacity-75 border-gray-200' : isOpen ? 'border-blue-500 ring-2 ring-blue-100 ring-offset-0' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <span className={`truncate ${!value ? 'text-gray-400' : 'text-slate-700 font-medium'}`}>
          {value ? formatThaiDate(value) : 'เลือกวันที่...'}
        </span>
        <Calendar size={16} className={isOpen ? 'text-blue-500' : 'text-gray-400'} />
      </button>

      {isOpen && (
        <div 
          className="absolute z-[100] w-[300px] bg-white rounded-xl shadow-2xl border border-slate-200 p-4 transition-all duration-200 animate-in fade-in zoom-in-95 origin-top-left top-full mt-2"
          style={{ left: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            
            <button
              type="button"
              onClick={handleHeaderClick}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg hover:bg-blue-50 text-slate-800 font-bold transition-colors ${viewMode === 'year' ? 'cursor-default hover:bg-transparent' : ''}`}
            >
              <span className="text-sm">
                {getHeaderLabel()}
              </span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Content based on viewMode */}
          {viewMode === 'day' && (
            <>
              {/* Weekdays */}
              <div className="grid grid-cols-7 mb-2">
                {weekdays.map(day => (
                  <div key={day} className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-tighter">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {renderDays()}
              </div>
            </>
          )}

          {viewMode === 'month' && renderMonthPicker()}
          {viewMode === 'year' && renderYearPicker()}

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleToday}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <RotateCcw size={12} />
              วันนี้
            </button>
            <button
              type="button"
              onClick={() => { setIsOpen(false); setViewMode('day'); }}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors px-2 py-1"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
