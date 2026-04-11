import { Delete } from 'lucide-react';

const PinPad = ({ onNumberPress, onDelete }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="w-full max-w-[200px] mx-auto mt-2">
      <div className="grid grid-cols-3 gap-2">
        {numbers.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onNumberPress(num.toString())}
            className="w-12 h-12 rounded-xl bg-white border border-gray-100 text-xl font-black text-maya-dark hover:border-maya-gold hover:bg-maya-orange-light transition-all active:scale-90 shadow-sm flex items-center justify-center"
          >
            {num}
          </button>
        ))}
        <div className="invisible" aria-hidden="true"></div>
        <button
          type="button"
          onClick={() => onNumberPress('0')}
          className="w-12 h-12 rounded-xl bg-white border border-gray-100 text-xl font-black text-maya-dark hover:border-maya-gold hover:bg-maya-orange-light transition-all active:scale-90 shadow-sm flex items-center justify-center"
        >
          0
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="w-12 h-12 rounded-xl bg-maya-orange-light border border-maya-gold/20 text-maya-gold hover:bg-maya-gold hover:text-white transition-all active:scale-90 shadow-sm flex items-center justify-center"
        >
          <Delete size={20} />
        </button>
      </div>
    </div>
  );
};

export default PinPad;
