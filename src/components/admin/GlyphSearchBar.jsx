import { Search, Filter } from 'lucide-react';

const GlyphSearchBar = ({ onSearch, onFilterClick }) => {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="relative grow">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="BUSCAR"
          className="block w-full pl-11 pr-4 py-3 bg-white border-2 border-maya-dark/10 rounded-full text-sm font-bold placeholder:text-gray-400 focus:outline-none focus:border-maya-gold transition-colors shadow-inner"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      <button 
        onClick={onFilterClick}
        className="p-3 bg-white border-2 border-maya-dark/10 rounded-2xl flex items-center justify-center hover:bg-maya-orange-light transition-colors shadow-sm"
      >
        <Filter className="w-6 h-6 text-maya-dark/40" />
      </button>
    </div>
  );
};

export default GlyphSearchBar;
