import React from 'react';
import { Button } from './button';

export interface PaginationMeta {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  itemName?: string;
}

export const Pagination = ({ meta, onPageChange, itemName = 'items' }: PaginationProps) => {
  const { page, totalPages, total } = meta;

  // Don't show pagination if there's only one page or no items
  if (totalPages <= 1 || total === 0) {
    return null;
  }

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Number of page buttons to show
    const sidePages = Math.floor(showPages / 2);

    if (totalPages <= showPages) {
      // Show all pages if total pages is less than showPages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      let startPage = Math.max(2, page - sidePages);
      let endPage = Math.min(totalPages - 1, page + sidePages);

      // Adjust range if we're near the beginning
      if (page <= sidePages + 1) {
        endPage = Math.min(totalPages - 1, showPages - 1);
      }

      // Adjust range if we're near the end
      if (page >= totalPages - sidePages) {
        startPage = Math.max(2, totalPages - showPages + 2);
      }

      // Add ellipsis if there's a gap after first page
      if (startPage > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if there's a gap before last page
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page if it's not already included
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing page {page} of {totalPages} ({total} total {itemName})
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          
          {/* Page numbers */}
          <div className="flex space-x-1">
            {pageNumbers.map((pageNum, index) => (
              <React.Fragment key={index}>
                {pageNum === '...' ? (
                  <span className="px-3 py-1 text-gray-500">...</span>
                ) : (
                  <Button
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum as number)}
                    className="min-w-[2.5rem]"
                  >
                    {pageNum}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
