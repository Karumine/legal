import { Phone, FileText, Globe, MapPin } from 'lucide-react';

export default function PageHeader() {
  return (
    <div className="flex justify-between items-start border-b-2 border-slate-200 pb-4 mb-6 print:invisible">
      <div className="flex gap-4 items-center">
        {/* Mock Logo Space */}
        <div className="w-16 h-16 bg-slate-800 text-white flex items-center justify-center font-bold text-2xl rotate-45 transform origin-center">
          <div className="-rotate-45">AA</div>
        </div>
        <div className="ml-4">
          <h1 className="text-3xl font-serif text-slate-800 tracking-wider">AGILE ASSETS</h1>
          <p className="text-gray-500 text-sm tracking-widest uppercase">Company Limited</p>
        </div>
      </div>

      <div className="text-right text-xs text-gray-700 flex flex-col gap-1 items-end">
        <div className="flex items-center gap-2">
          <span>0 2000 9392</span>
          <div className="bg-slate-700 text-white p-1 rounded-sm"><Phone size={12} /></div>
        </div>
        <div className="flex items-center gap-2">
          <span>0115558012195</span>
          <div className="bg-slate-700 text-white p-1 rounded-sm"><FileText size={12} /></div>
        </div>
        <div className="flex items-center gap-2">
          <span>www.agileassets.co.th</span>
          <div className="bg-slate-700 text-white p-1 rounded-sm"><Globe size={12} /></div>
        </div>
        <div className="flex items-start gap-2 max-w-[200px] text-right">
          <span>20 Moo1 Sukhumvit Road<br/>Bangmuangmai, Muang<br/>Samut Prakan 10270</span>
          <div className="bg-slate-700 text-white p-1 rounded-sm mt-1 flex-shrink-0"><MapPin size={12} /></div>
        </div>
      </div>
    </div>
  );
}
