const PrimaryButton = ({ children, type = "button", onClick, className = "", ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full bg-maya-gold hover:bg-maya-gold-hover text-white font-black py-4 rounded-2xl shadow-lg shadow-maya-gold/20 transition-all active:scale-95 uppercase tracking-wider text-sm ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
