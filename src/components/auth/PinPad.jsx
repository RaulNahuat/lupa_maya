import { Delete } from 'lucide-react';

const PinPad = ({ onNumberPress, onDelete }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="w-full max-w-[230px] mx-auto">
      <div className="grid grid-cols-3 gap-3">
        {numbers.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onNumberPress(num.toString())}
            className="w-15 h-12 rounded-2xl bg-white border border-gray-400 text-2xl font-black text-maya-dark hover:border-maya-gold hover:bg-maya-orange-light transition-all active:scale-90 flex items-center justify-center shadow-[0_3px_0_#9CA3AF]"
          >
            {num}
          </button>
        ))}

        {/* Vacío */}
        <div className="invisible" aria-hidden="true" />

        {/* 0 */}
        <button
          type="button"
          onClick={() => onNumberPress('0')}
          className="w-15 h-12 rounded-2xl bg-white border border-gray-400 text-2xl font-black text-maya-dark hover:border-maya-gold hover:bg-maya-orange-light transition-all active:scale-90 flex items-center justify-center shadow-[0_3px_0_#9CA3AF]"
        >
          0
        </button>

        {/* Borrar */}
        <button
          type="button"
          onClick={onDelete}
          className="w-15 h-12 rounded-2xl bg-maya-orange-light border border-maya-gold text-maya-gold hover:bg-maya-gold hover:text-white transition-all active:scale-90 flex items-center justify-center shadow-[0_3px_0_#D4951E]"
        >
          <Delete size={22} />
        </button>
      </div>
    </div>
  );
};

export default PinPad;
