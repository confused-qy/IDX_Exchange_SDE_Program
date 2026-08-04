import "./Pagination.css";

export function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 0) return [];

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "end-ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "start-ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "start-ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "end-ellipsis",
    totalPages,
  ];
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const items = getPaginationItems(currentPage, totalPages);

  return (
    <nav className="pagination" aria-label="Property listings pagination">
      <button
        type="button"
        className="pagination__direction"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>

      <div className="pagination__pages">
        {items.map((item) =>
          typeof item === "number" ? (
            <button
              type="button"
              className="pagination__page"
              aria-label={`Go to page ${item}`}
              aria-current={item === currentPage ? "page" : undefined}
              key={item}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ) : (
            <span className="pagination__ellipsis" aria-hidden="true" key={item}>
              …
            </span>
          )
        )}
      </div>

      <button
        type="button"
        className="pagination__direction"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </nav>
  );
}

export default Pagination;
