import { FileText, RefreshCw, Landmark, CreditCard } from 'lucide-react';
import type { ContractType } from '../types/app';

interface Props {
  value: ContractType;
  onChange: (type: ContractType) => void;
}

const contractTypes: { key: ContractType; label: string; icon: React.ReactNode; color: string; activeColor: string }[] = [
  {
    key: 'hirePurchase',
    label: 'สัญญาเช่าซื้อ',
    icon: <FileText size={20} />,
    color: 'border-slate-200 hover:border-blue-300',
    activeColor: 'border-blue-500 bg-blue-50',
  },
  {
    key: 'hirePurchaseBack',
    label: 'สัญญาเช่าซื้อกลับ',
    icon: <RefreshCw size={20} />,
    color: 'border-slate-200 hover:border-green-300',
    activeColor: 'border-green-500 bg-green-50',
  },
  {
    key: 'loan',
    label: 'สัญญากู้ยืม',
    icon: <Landmark size={20} />,
    color: 'border-slate-200 hover:border-purple-300',
    activeColor: 'border-purple-500 bg-purple-50',
  },
  {
    key: 'od',
    label: 'OD',
    icon: <CreditCard size={20} />,
    color: 'border-slate-200 hover:border-amber-300',
    activeColor: 'border-amber-500 bg-amber-50',
  },
];

export default function ContractTypeSelector({ value, onChange }: Props) {
  return (
    <section className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
      <h3 className="font-semibold text-lg mb-3 text-slate-700">ประเภทสัญญา</h3>
      <div className="grid grid-cols-4 gap-3">
        {contractTypes.map((ct) => (
          <button
            key={ct.key}
            onClick={() => onChange(ct.key)}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
              value === ct.key ? ct.activeColor + ' shadow-sm' : ct.color + ' bg-white'
            }`}
          >
            <div className={value === ct.key ? 'text-slate-700' : 'text-slate-400'}>
              {ct.icon}
            </div>
            <div className={`font-medium text-xs text-center ${value === ct.key ? 'text-slate-800' : 'text-slate-600'}`}>
              {ct.label}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

