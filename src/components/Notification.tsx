import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useNotification, type NotificationType } from '../contexts/NotificationContext';

const NotificationItem: React.FC<{ id: string; message: string; type: NotificationType }> = ({ id, message, type }) => {
  const { removeNotification } = useNotification();

  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-rose-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
  };

  const colors = {
    success: 'border-emerald-100 bg-emerald-50/90 text-emerald-900',
    error: 'border-rose-100 bg-rose-50/90 text-rose-900',
    info: 'border-blue-100 bg-blue-50/90 text-blue-900',
  };

  return (
    <div 
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right-full fade-in ${colors[type]}`}
      role="alert"
    >
      <div className="shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <div className="flex-1 text-sm font-medium leading-relaxed">
        {message}
      </div>
      <button 
        onClick={() => removeNotification(id)}
        className="shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
      >
        <X size={16} className="opacity-50" />
      </button>
    </div>
  );
};

export const NotificationContainer: React.FC = () => {
  const { notifications } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {notifications.map((n) => (
        <div key={n.id} className="pointer-events-auto">
          <NotificationItem {...n} />
        </div>
      ))}
    </div>
  );
};
