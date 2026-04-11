import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="text-emerald-500" size={20} />,
  error: <XCircle className="text-rose-500" size={20} />,
  warning: <AlertCircle className="text-amber-500" size={20} />,
  info: <Info className="text-blue-500" size={20} />,
};

const bgColors = {
  success: 'bg-emerald-50 border-emerald-100',
  error: 'bg-rose-50 border-rose-100',
  warning: 'bg-amber-50 border-amber-100',
  info: 'bg-blue-50 border-blue-100',
};

const ToastItem = ({ toast, onRemove }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`flex items-start gap-3 p-4 rounded-3xl border shadow-lg min-w-[300px] max-w-md ${bgColors[toast.type]}`}
    >
      <div className="shrink-0 mt-0.5">
        {icons[toast.type]}
      </div>
      
      <div className="flex-1">
        <h4 className="font-bold text-maya-dark text-sm lowercase first-letter:uppercase">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-maya-gray text-xs mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>

      <button 
        onClick={() => onRemove(toast.id)}
        className="shrink-0 text-gray-400 hover:text-maya-dark transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export default ToastItem;
