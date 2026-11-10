import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Pagination controls (Prev / page numbers / Next).
 * @param {number} page        current page (1-based)
 * @param {number} totalPages  total number of pages
 * @param {Function} onPage    (nextPage) => void
 */
export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null

  // Build a compact page list: 1 ... 4 5 6 ... 20
  const pages = []
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" className="btn btn--outline btn--sm"
        disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
        <ChevronLeft size={14} /> Prev
      </button>

      <div className="pagination__pages">
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`dots-${i}`} className="pagination__dots">…</span>
          ) : (
            <button key={p} type="button"
              className={`pill${p === page ? ' pill--active' : ''}`}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onPage(p)}>
              {p}
            </button>
          ),
        )}
      </div>

      <button type="button" className="btn btn--outline btn--sm"
        disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Next page">
        Next <ChevronRight size={14} />
      </button>
    </nav>
  )
}
