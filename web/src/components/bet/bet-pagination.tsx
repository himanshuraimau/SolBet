import { Button } from "@/components/ui/button"
import { PaginationInfo } from "@/types/bet"

interface BetPaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
}

export function BetPagination({ pagination, onPageChange }: BetPaginationProps) {
  if (pagination.totalPages <= 1) {
    return null
  }

  return (
    <div className="mt-12 flex justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(pagination.page - 1)}
        disabled={pagination.page === 1}
      >
        Previous
      </Button>
      
      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
        // Show up to 5 pages. If we have more, show the first, last, and pages around the current one
        let pageToShow = i + 1
        
        if (pagination.totalPages > 5) {
          if (pagination.page <= 3) {
            // First 5 pages
            pageToShow = i + 1
          } else if (pagination.page >= pagination.totalPages - 2) {
            // Last 5 pages
            pageToShow = pagination.totalPages - 4 + i
          } else {
            // Current page with 2 before and 2 after
            pageToShow = pagination.page - 2 + i
          }
        }
        
        return (
          <Button
            key={pageToShow}
            variant={pagination.page === pageToShow ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(pageToShow)}
            className={pagination.page === pageToShow ? "bg-primary-gradient text-text-plum" : ""}
          >
            {pageToShow}
          </Button>
        )
      })}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(pagination.page + 1)}
        disabled={pagination.page === pagination.totalPages}
      >
        Next
      </Button>
    </div>
  )
}
