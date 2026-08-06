import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, pages, total, limit, onPageChange, onLimitChange }) {
  if (!pages || pages <= 1) {
    return total > 0 ? (
      <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-400">
        <span>Showing {total} record{total === 1 ? "" : "s"}</span>
        {onLimitChange && (
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="bg-[#050810] border border-blue-500/10 rounded-lg px-2 py-1 text-slate-300 focus:border-blue-500 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        )}
      </div>
    ) : null;
  }

  const goTo = (p) => {
    const next = Math.min(Math.max(1, p), pages);
    if (next !== page) onPageChange(next);
  };

  const pageNumbers = [];
  const maxButtons = 5;
  let start = Math.max(1, page - Math.floor(maxButtons / 2));
  let end = Math.min(pages, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);
  for (let i = start; i <= end; i++) pageNumbers.push(i);

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-blue-500/10">
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span>
          {total === 0 ? "No records" : `Showing ${from}-${to} of ${total}`}
        </span>
        {onLimitChange && (
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="bg-[#050810] border border-blue-500/10 rounded-lg px-2 py-1 text-slate-300 focus:border-blue-500 focus:outline-none"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Previous"
        >
          <ChevronLeft size={16} />
        </button>
        {start > 1 && (
          <>
            <button onClick={() => goTo(1)} className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">1</button>
            {start > 2 && <span className="px-1 text-slate-600">…</span>}
          </>
        )}
        {pageNumbers.map((p) => (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              p === page
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
            }`}
          >
            {p}
          </button>
        ))}
        {end < pages && (
          <>
            {end < pages - 1 && <span className="px-1 text-slate-600">…</span>}
            <button onClick={() => goTo(pages)} className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">{pages}</button>
          </>
        )}
        <button
          onClick={() => goTo(page + 1)}
          disabled={page >= pages}
          className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Next"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
