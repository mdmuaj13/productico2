"use client"

import * as React from "react"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Action<T = unknown> {
  label: React.ReactElement | string
  onClick: (row: T) => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: (row: T) => boolean
}

interface Column<T = unknown> {
  key: string
  header: string
  sortable?: boolean
  render?: (value: unknown, row: T) => React.ReactNode
  mobileMaxChars?: number
}

interface SimpleTableProps<T = unknown> {
  data: T[]
  columns: Column<T>[]
  mobileColumns?: Column<T>[]
  actions?: Action<T>[]
  showPagination?: boolean
  pageSize?: number
  mobileDefaultMaxChars?: number
}

/** Client-only media query hook */
function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)

    onChange()

    if (media.addEventListener) media.addEventListener("change", onChange)
    else media.addListener(onChange)

    return () => {
      if (media.removeEventListener) media.removeEventListener("change", onChange)
      else media.removeListener(onChange)
    }
  }, [query])

  return matches
}

/** ✅ Utility: mobile substring truncation */
function truncateText(input: unknown, maxChars: number) {
  if (input === null || input === undefined) return ""
  const text = typeof input === "string" ? input : String(input)
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars).trimEnd() + "…"
}

export function SimpleTable<T = unknown>({
  data,
  columns,
  mobileColumns,
  actions,
  showPagination = true,
  pageSize = 10,
  mobileDefaultMaxChars = 10,
}: SimpleTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  })

  const isMobile = useMediaQuery("(max-width: 639px)")

  const activeColumns = React.useMemo(() => {
    if (isMobile && mobileColumns?.length) return mobileColumns
    return columns
  }, [isMobile, columns, mobileColumns])

  const tableColumns: ColumnDef<T>[] = React.useMemo(() => {
    const cols: ColumnDef<T>[] = activeColumns.map((col) => ({
      accessorKey: col.key,
      header: col.header,
      cell: ({
        row,
        getValue,
      }: {
        row: { original: T }
        getValue: () => unknown
      }) => {
        const value = getValue()

        // If you have a custom render, keep it (but you can still choose to truncate if it returns string)
        const rendered = col.render ? col.render(value, row.original) : value

        // ✅ Only substring-limit on mobile
        if (isMobile) {
          const maxChars = col.mobileMaxChars ?? mobileDefaultMaxChars

          // If render returns a string or number, truncate it.
          // If it's a React element/node, we can't safely truncate it -> return as-is.
          if (typeof rendered === "string" || typeof rendered === "number") {
            return truncateText(rendered, maxChars)
          }

          // If render not provided, it's likely primitive -> truncate stringified
          if (!col.render) {
            return truncateText(value, maxChars)
          }

          return rendered
        }

        // Desktop: normal behavior
        if (col.render) return rendered
        return String(value ?? "")
      },
      enableSorting: col.sortable ?? true,
    }))

    if (actions && actions.length > 0) {
      cols.push({
        id: "actions",
        header: "Actions",
        cell: ({ row }: { row: { original: T } }) => (
          <div className="flex items-center gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size={action.size || "sm"}
                onClick={() => action.onClick(row.original)}
                disabled={action.disabled ? action.disabled(row.original) : false}
              >
                {action.label}
              </Button>
            ))}
          </div>
        ),
        enableSorting: false,
      })
    }

    return cols
  }, [activeColumns, actions, isMobile, mobileDefaultMaxChars])

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full overflow-x-auto rounded-lg border">
        <div className={isMobile ? "min-w-full" : "min-w-[800px]"}>
          <Table>
            <TableHeader className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow key={row.id || index}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="align-top py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {showPagination && table.getPageCount() > 1 && (
        <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground text-sm">
            Showing {table.getRowModel().rows.length} of {data.length} results
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="hidden items-center gap-2 sm:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 sm:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>

              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>

              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>

              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 sm:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
