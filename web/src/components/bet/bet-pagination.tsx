import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface BetPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export function BetPagination({ pagination, onPageChange }: BetPaginationProps) {
  const { page, totalPages } = pagination;
  
  if (totalPages <= 1) {
    return null; // Don't render pagination if there's only 1 page
  }
  
  // Calculate page numbers to show (show up to 5 pages)
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      // If 5 or fewer pages, show all
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // If more than 5 pages, show current page and surrounding pages
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust if we're near the end
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="flex justify-center items-center gap-1 mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {pageNumbers.map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(p)}
          className={p === page ? "bg-primary-gradient text-text-plum" : ""}
        >
          {p}
        </Button>
      ))}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
