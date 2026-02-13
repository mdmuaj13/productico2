"use client";

import * as React from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Props = {
  page: number; // 1-based
  totalPages: number;
  total: number;
  limit: number;
  pageSizeOptions?: number[];
  onPageChange: (nextPage: number) => void;
  onLimitChange?: (nextLimit: number) => void;

  /** Optional display */
  showingCount?: number; // items currently shown on this page
  className?: string;
};

export function ServerPagination({
  page,
  totalPages,
  total,
  limit,
  pageSizeOptions = [10, 20, 30, 40, 50],
  onPageChange,
  onLimitChange,
  showingCount,
  className,
}: Props) {
  const safeTotalPages = Math.max(1, Number(totalPages || 1));
  const safePage = Math.min(Math.max(1, Number(page || 1)), safeTotalPages);

  const canPrev = safePage > 1;
  const canNext = safePage < safeTotalPages;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-2 sm:px-4 overflow-x-auto whitespace-nowrap",
        className
      )}
    >
      <div className="text-xs sm:text-sm text-muted-foreground">
        <span className="hidden sm:inline">Showing </span>
        {typeof showingCount === "number" ? showingCount : "—"}
        <span className="hidden sm:inline"> of {total} results</span>
        <span className="sm:hidden"> / {total}</span>
      </div>

      {onLimitChange ? (
        <div className="flex items-center gap-2">
          <Label className="hidden sm:inline text-sm font-medium">Rows</Label>
          <Select
            value={`${limit}`}
            onValueChange={(v) => {
              const next = Number(v);
              if (!Number.isFinite(next)) return;
              onLimitChange(next);
            }}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="text-xs sm:text-sm font-medium sm:ml-auto">
        Page {safePage} of {safeTotalPages}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          className="hidden sm:inline-flex h-8 w-8 p-0"
          onClick={() => onPageChange(1)}
          disabled={!canPrev}
          aria-label="First page"
        >
          <IconChevronsLeft />
        </Button>

        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(safePage - 1)}
          disabled={!canPrev}
          aria-label="Previous page"
        >
          <IconChevronLeft />
        </Button>

        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(safePage + 1)}
          disabled={!canNext}
          aria-label="Next page"
        >
          <IconChevronRight />
        </Button>

        <Button
          variant="outline"
          className="hidden sm:inline-flex h-8 w-8 p-0"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={!canNext}
          aria-label="Last page"
        >
          <IconChevronsRight />
        </Button>
      </div>
    </div>
  );
}
