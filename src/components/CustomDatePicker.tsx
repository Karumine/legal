import { useState, useEffect, useRef } from 'react';
import { formatThaiDate } from '../utils/thaiDate';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, RotateCcw } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  label: string;
  readOnly?: boolean;
}

export const CustomDatePicker = ({ value, onChange, label, readOnly = false }: CustomDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(value || new Date()));
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const yearScrollRef = useRef<HTMLDivElement>(null);

  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const weekdays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsYearPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Scroll to current year when year picker opens
  useEffect(() => {
    if (isYearPickerOpen && yearScrollRef.current) {
      const currentYear = viewDate.getFullYear();
      const element = yearScrollRef.current.querySelector(`[data-year="${currentYear}"]`);
      if (element) {
        element.scrollIntoView({ block: 'center' });
      }
    }
  }, [isYearPickerOpen, viewDate]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Adjust for timezone offset to ensure ISO string date part is correct
    const offset = selectedDate.getTimezoneOffset();
    const adjustedDate = new Date(selectedDate.getTime() - (offset * 60 * 1000));
    const isoString = adjustedDate.toISOString().split('T')[0];
    onChange(isoString);
    setIsOpen(false);
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
  };

  const handleSelectYear = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setIsYearPickerOpen(false);
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

  const renderYearPicker = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear - 20; y <= currentYear + 10; y++) {
      years.push(y);
    }

    return (
      <div 
        ref={yearScrollRef}
        className="absolute inset-0 bg-white z-20 flex flex-col p-2 animate-in fade-in duration-200"
      >
        <div className="flex items-center justify-between px-2 py-1 mb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">เลือกปี พ.ศ.</span>
          <button 
            onClick={() => setIsYearPickerOpen(false)}
            className="text-xs text-blue-600 font-bold hover:underline"
          >
            ยกเลิก
          </button>
        </div>
        <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-1">
          {years.map(y => (
            <button
              key={y}
              data-year={y}
              onClick={() => handleSelectYear(y)}
              className={`py-2 px-1 rounded text-sm transition-colors ${
                viewDate.getFullYear() === y 
                  ? 'bg-blue-600 text-white font-bold' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {y + 543}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => !readOnly && setIsOpen(!isOpen)}
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
              onClick={handlePrevMonth}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            
            <button
              type="button"
              onClick={() => setIsYearPickerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg hover:bg-blue-50 text-slate-800 font-bold transition-colors group"
            >
              <span className="text-sm">
                {months[viewDate.getMonth()]} {viewDate.getFullYear() + 543}
              </span>
              <ChevronDown size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
            </button>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

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
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors px-2 py-1"
            >
              ปิด
            </button>
          </div>

          {/* Year Picker Overlay */}
          {isYearPickerOpen && renderYearPicker()}
        </div>
      )}
    </div>
  );
};
