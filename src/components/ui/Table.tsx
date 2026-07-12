import React, { ReactNode } from "react";
import { States } from "./States.js";
import { cn } from "../../lib/utils.js";

interface TableProps {
  headers: string[];
  children: ReactNode;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  searchPlaceholder?: string;
  responsiveCards?: ReactNode; // Optional layout to display on mobile instead of table
  isLoading?: boolean; // If true, render progressive skeleton
}

export const Table = ({
  headers,
  children,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search records...",
  responsiveCards,
  isLoading = false,
}: TableProps) => {
  const hasSearch = onSearchChange !== undefined || searchTerm !== undefined;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden flex flex-col">
      {/* Table Header Action Bar */}
      {hasSearch && (
        <div className="p-4 border-b border-border bg-sand/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <input
              type="text"
              value={searchTerm || ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-white border border-border rounded py-2 pl-9 pr-8 text-xs font-body focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent transition-all"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.603 10.603Z"
                />
              </svg>
            </span>
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange?.("")}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-navy p-1 rounded-full hover:bg-sand transition"
                title="Clear Search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-4">
          <States.TableSkeleton columns={headers.length} rows={5} />
        </div>
      ) : (
        <>
          {/* Mobile responsive cards container (if defined, hide table on mobile) */}
          {responsiveCards ? (
            <div className="block md:hidden p-4 space-y-4">
              {responsiveCards}
            </div>
          ) : null}

          {/* Table container (on mobile: either hidden if cards are active, or standard scroll) */}
          <div className={cn("overflow-x-auto w-full", responsiveCards ? "hidden md:block" : "block")}>
            <div className="max-h-[500px] overflow-y-auto">
              <table className="min-w-full divide-y divide-border text-left relative">
                <thead className="bg-sand text-navy font-semibold uppercase tracking-wider text-[11px] sticky top-0 z-10 shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]">
                  <tr>
                    {headers.map((header, idx) => (
                      <th
                        key={idx}
                        scope="col"
                        className="px-6 py-3.5 font-semibold bg-sand/90 backdrop-blur-sm"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs font-body text-gray-700 bg-white">
                  {children}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Pagination Footer */}
      {!isLoading && totalPages > 1 && onPageChange && (
        <div className="px-6 py-4 border-t border-border bg-sand/30 flex items-center justify-between">
          <div className="text-xs text-gray-500 font-body">
            Page <span className="font-semibold text-navy">{currentPage}</span> of{" "}
            <span className="font-semibold text-navy">{totalPages}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="inline-flex items-center justify-center p-1.5 rounded border border-border bg-white text-gray-600 hover:bg-sand disabled:opacity-40 disabled:pointer-events-none transition focus:outline-none focus:ring-2 focus:ring-burgundy"
              title="Previous Page"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>

            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages)
              .map((page, idx, arr) => {
                const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && <span className="px-2 text-gray-400 text-xs">...</span>}
                    <button
                      onClick={() => onPageChange(page)}
                      className={`inline-flex items-center justify-center min-w-[28px] h-7 text-xs font-semibold rounded transition px-1.5 focus:outline-none focus:ring-2 focus:ring-burgundy ${
                        currentPage === page
                          ? "bg-burgundy text-white font-bold shadow-sm"
                          : "bg-white border border-border text-gray-600 hover:bg-sand"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="inline-flex items-center justify-center p-1.5 rounded border border-border bg-white text-gray-600 hover:bg-sand disabled:opacity-40 disabled:pointer-events-none transition focus:outline-none focus:ring-2 focus:ring-burgundy"
              title="Next Page"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
