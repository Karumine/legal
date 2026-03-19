import { Building2, Users } from 'lucide-react';
import type { CompanyMode } from '../types/app';

interface Props {
  value: CompanyMode;
  onChange: (mode: CompanyMode) => void;
}

export default function CompanyModeSelector({ value, onChange }: Props) {
  const modes: { key: CompanyMode; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: 'agileOnly',
      label: 'Agile อย่างเดียว',
      desc: 'สัญญาในนาม Agile Assets เท่านั้น',
      icon: <Building2 size={20} />,
    },
    {
      key: 'agileTK',
      label: 'Agile รวมกับ TK',
      desc: 'สัญญาร่วมระหว่าง Agile Assets และ ฐิติกร',
      icon: <Users size={20} />,
    },
  ];

  return (
    <section className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
      <h3 className="font-semibold text-lg mb-3 text-slate-700">รูปแบบบริษัท</h3>
      <div className="grid grid-cols-2 gap-3">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => onChange(m.key)}
            className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all ${
              value === m.key
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className={`mt-0.5 ${value === m.key ? 'text-blue-600' : 'text-slate-400'}`}>
              {m.icon}
            </div>
            <div>
              <div className={`font-semibold text-sm ${value === m.key ? 'text-blue-700' : 'text-slate-700'}`}>
                {m.label}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{m.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

