const SecondaryButton = ({ children, type = "button", onClick, className = "", ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full bg-[#02845E] hover:bg-[#026D4D] text-white font-black py-4 rounded-2xl shadow-lg shadow-green-900/10 transition-all active:scale-95 uppercase tracking-wider text-sm ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
