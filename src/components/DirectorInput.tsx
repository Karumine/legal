import { Plus, Trash2 } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
}

export default function DirectorInput({ label, value, onChange, placeholder }: Props) {
  const directorNames = value ? value.split(/\s*และ\s*/) : [''];

  const handleDirectorChange = (index: number, newName: string) => {
    const newNames = [...directorNames];
    newNames[index] = newName;
    onChange(newNames.join(' และ '));
  };

  const addDirector = () => {
    onChange([...directorNames, ''].join(' และ '));
  };

  const removeDirector = (index: number) => {
    if (directorNames.length > 1) {
      onChange(directorNames.filter((_, i) => i !== index).join(' และ '));
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="space-y-2">
        {directorNames.map((name, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              type="text"
              value={name}
              onChange={(e) => handleDirectorChange(idx, e.target.value)}
              className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border bg-white"
              placeholder={placeholder || (directorNames.length > 1 ? `คนที่ ${idx + 1}` : 'ชื่อ-นามสกุล')}
            />
            {directorNames.length > 1 && (
              <button
                type="button"
                onClick={() => removeDirector(idx)}
                className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 rounded border border-red-100 transition-colors"
                title="ลบ"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addDirector}
          className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
        >
          <Plus size={12} /> เพิ่มรายชื่อ
        </button>
      </div>
    </div>
  );
}
