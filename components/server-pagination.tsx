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
    <div className={cn("flex flex-col gap-4 px-2 sm:px-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          Showing {typeof showingCount === "number" ? showingCount : "—"} of {total} results
        </div>

        {/* Page size (hide on mobile if you want) */}
        {onLimitChange ? (
          <div className="hidden sm:flex items-center gap-2">
            <Label className="text-sm font-medium">Rows</Label>
            <Select
              value={`${limit}`}
              onValueChange={(v) => {
                const next = Number(v);
                if (!Number.isFinite(next)) return;
                onLimitChange(next);
              }}
            >
              <SelectTrigger className="w-24 h-9">
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
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3">
        <div className="text-sm font-medium sm:mr-6">
          Page {safePage} of {safeTotalPages}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden sm:inline-flex h-9 w-9 p-0"
            onClick={() => onPageChange(1)}
            disabled={!canPrev}
            aria-label="First page"
          >
            <IconChevronsLeft />
          </Button>

          <Button
            variant="outline"
            className="h-9 w-9 p-0"
            onClick={() => onPageChange(safePage - 1)}
            disabled={!canPrev}
            aria-label="Previous page"
          >
            <IconChevronLeft />
          </Button>

          <Button
            variant="outline"
            className="h-9 w-9 p-0"
            onClick={() => onPageChange(safePage + 1)}
            disabled={!canNext}
            aria-label="Next page"
          >
            <IconChevronRight />
          </Button>

          <Button
            variant="outline"
            className="hidden sm:inline-flex h-9 w-9 p-0"
            onClick={() => onPageChange(safeTotalPages)}
            disabled={!canNext}
            aria-label="Last page"
          >
            <IconChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
