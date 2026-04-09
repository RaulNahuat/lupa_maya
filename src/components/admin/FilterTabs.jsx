const FilterTabs = ({ filters = ['TODOS', 'BÁSICO', 'INTERMEDIO', 'AVANZADO'], activeFilter = 'TODOS', onFilterChange }) => {

  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 no-scrollbar">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange?.(filter)}
          className={`shrink-0 px-6 py-3 rounded-2xl text-[12px] font-black tracking-widest transition-all ${
            activeFilter === filter
              ? 'bg-maya-dark text-white shadow-lg shadow-maya-dark/20 scale-105'
              : 'bg-white border-2 border-gray-50 text-gray-400 hover:border-maya-dark/20 hover:text-maya-dark'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
