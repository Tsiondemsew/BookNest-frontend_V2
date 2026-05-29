'use client';

interface BookPaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage?: boolean;
  onPageChange: (page: number) => void;
}

export function BookPagination({
  currentPage,
  totalPages,
  hasNextPage = false,
  onPageChange,
}: BookPaginationProps) {
  const safePage =
    totalPages <= 0 ? Math.max(1, currentPage) : Math.min(Math.max(1, currentPage), totalPages);

  const canGoNext = hasNextPage || (totalPages > 0 && safePage < totalPages);
  const canGoPrev = safePage > 1;

  if (totalPages <= 1 && !canGoNext && !canGoPrev) return null;

  const goToPage = (page: number) => {
    if (page < 1 || page === safePage) return;
    if (totalPages > 0 && page > totalPages) return;
    onPageChange(page);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    const effectiveTotal = Math.max(totalPages, safePage);

    if (effectiveTotal <= maxVisible) {
      for (let i = 1; i <= effectiveTotal; i++) pages.push(i);
    } else if (safePage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push('...');
      pages.push(effectiveTotal);
    } else if (safePage >= effectiveTotal - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = effectiveTotal - 3; i <= effectiveTotal; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = safePage - 1; i <= safePage + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(effectiveTotal);
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        type="button"
        onClick={() => goToPage(safePage - 1)}
        disabled={!canGoPrev}
        className="px-4 py-2 rounded-lg border border-[#E8E2D9] text-sm font-medium text-[#4A5568] hover:bg-[#FDFBF7] hover:border-[#8E735B]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          type="button"
          onClick={() => typeof page === 'number' && goToPage(page)}
          className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all ${
            page === safePage
              ? 'bg-[#2C3E50] text-white shadow-sm'
              : page === '...'
                ? 'cursor-default text-[#4A5568]'
                : 'border border-[#E8E2D9] text-[#1A2A3A] hover:bg-[#FDFBF7] hover:border-[#8E735B]/30'
          }`}
          disabled={page === '...'}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        onClick={() => goToPage(safePage + 1)}
        disabled={!canGoNext}
        className="px-4 py-2 rounded-lg border border-[#E8E2D9] text-sm font-medium text-[#4A5568] hover:bg-[#FDFBF7] hover:border-[#8E735B]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}
