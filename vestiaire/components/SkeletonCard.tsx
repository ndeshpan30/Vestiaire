import React from "react";

export function SkeletonCard() {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className="flex flex-col rounded-lg border border-neutral-200 overflow-hidden bg-white shadow-xs"
    >
      {/* Exact Aspect 4/5 Container reserved to eliminate CLS */}
      <div className="aspect-[4/5] w-full bg-neutral-200 animate-pulse" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-3 w-1/4 rounded bg-neutral-200 animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-neutral-200 animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-neutral-200 animate-pulse" />
      </div>
    </div>
  );
}
