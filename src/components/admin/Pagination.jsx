const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    onPageChange?.(nextPage);
  };

  const pages = [];

  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page += 1) {
      pages.push(page);
    }
  } else if (currentPage <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', totalPages);
  } else if (currentPage >= totalPages - 3) {
    pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
  }

  return (
    <div className="mt-6 flex items-center justify-between gap-3 px-1">
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-2xl bg-white border-2 border-maya-dark/10 text-xs font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Anterior
      </button>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        {pages.map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-400 font-black">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className={`min-w-10 px-3 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                page === currentPage
                  ? 'bg-maya-dark text-white shadow-lg shadow-maya-dark/20'
                  : 'bg-white border-2 border-maya-dark/10 text-gray-500 hover:border-maya-gold hover:text-maya-dark'
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-2xl bg-white border-2 border-maya-dark/10 text-xs font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Siguiente
      </button>
    </div>
  );
};

export default Pagination;