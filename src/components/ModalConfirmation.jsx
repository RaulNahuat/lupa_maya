const ModalConfirmation = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl flex flex-col items-center text-center transform transition-all zoom-in-95 duration-200">
        <h3 className="text-2xl font-extrabold text-maya-dark mb-2">
          {title}
        </h3>
        <p className="text-gray-500 mb-8 font-medium">
          {message}
        </p>

        <div className="flex gap-3 w-full">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          >
            {cancelText}
          </button>
          
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-md transition-all active:scale-95"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmation;
