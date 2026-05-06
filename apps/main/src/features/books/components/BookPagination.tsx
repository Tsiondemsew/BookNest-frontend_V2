'use client';

interface BookPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function BookPagination({ currentPage, totalPages, onPageChange }: BookPaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg border border-[#E8E2D9] text-sm font-medium text-[#4A5568] hover:bg-[#FDFBF7] hover:border-[#8E735B]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all ${
            page === currentPage
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
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg border border-[#E8E2D9] text-sm font-medium text-[#4A5568] hover:bg-[#FDFBF7] hover:border-[#8E735B]/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}