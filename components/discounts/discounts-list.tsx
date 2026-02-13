'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, Plus, Trash, Search, SlidersHorizontal, Percent, Ticket, ChevronRight } from 'lucide-react';
import { useDiscounts, deleteDiscount, Discount } from '@/hooks/discounts';
import { DiscountForm } from './discount-form';
import { DiscountEditForm } from './edit-form';
import { DiscountView } from './view';
import { toast } from 'sonner';
import { SimpleTable } from '@/components/simple-table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { ServerPagination } from '@/components/server-pagination';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Responsive media query hook
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();

    if (media.addEventListener) media.addEventListener('change', onChange);
    else media.addListener(onChange);

    return () => {
      if (media.removeEventListener) media.removeEventListener('change', onChange);
      else media.removeListener(onChange);
    };
  }, [query]);

  return matches;
}

const formatValue = (discount: Discount) =>
  discount.type === 'percentage'
    ? `${Number(discount.value || 0).toFixed(2)}%`
    : `$${Number(discount.value || 0).toFixed(2)}`;

const formatDateShort = (value: string | null | undefined) => {
  if (!value) return 'No expiry';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No expiry';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const validityLabel = (discount: Discount) => {
  const start = discount.startDate ? formatDateShort(discount.startDate) : 'No start';
  const end = discount.endDate ? formatDateShort(discount.endDate) : 'No expiry';
  if (!discount.startDate && !discount.endDate) return 'No date limits';
  return `${start} → ${end}`;
};

export function DiscountsList() {
  // Server pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filters
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // reset to page 1 on any filter change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, limit]);

  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [viewingDiscount, setViewingDiscount] = useState<Discount | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDiscount, setDeletingDiscount] = useState<Discount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check for mid-size devices (tablet range) and mobile
  const isMidSize = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
  const isMobile = useMediaQuery('(max-width: 639px)');
  const sheetSide = isMobile || isMidSize ? 'bottom' : 'right';

  const {
    data: discountsData,
    error,
    mutate: mutateDiscounts,
  } = useDiscounts({
    page,
    limit,
    search,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
  });

  const discounts = discountsData?.data || [];
  const meta = discountsData?.meta;

  const handleDeleteClick = (discount: Discount) => {
    setDeletingDiscount(discount);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDiscount) return;

    setIsDeleting(true);
    try {
      await deleteDiscount(deletingDiscount._id);
      toast.success('Discount deleted successfully');
      mutateDiscounts();
    } catch {
      toast.error('Failed to delete discount');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingDiscount(null);
    }
  };

  const handleViewDiscount = (discount: Discount) => {
    setViewingDiscount(discount);
    setViewSheetOpen(true);
  };

  const handleEditDiscount = (discount: Discount) => {
    setEditingDiscount(discount);
    setEditSheetOpen(true);
  };

  const handleViewToEdit = () => {
    if (viewingDiscount) {
      setViewSheetOpen(false);
      setEditingDiscount(viewingDiscount);
      setEditSheetOpen(true);
    }
  };

  const handleCreateSuccess = () => {
    setCreateSheetOpen(false);
    mutateDiscounts();
  };

  const handleEditSuccess = () => {
    setEditSheetOpen(false);
    setEditingDiscount(null);
    mutateDiscounts();
  };

  const handleViewSuccess = () => {
    setViewSheetOpen(false);
    setViewingDiscount(null);
    mutateDiscounts();
  };

  const columns = useMemo(
    () => [
      {
        key: 'code',
        header: 'Code',
        render: (value: unknown) => (
          <code className="text-sm font-medium bg-muted px-1.5 py-0.5 rounded">{String(value || '—')}</code>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        render: (value: unknown) => (
          <Badge variant="secondary" className="text-xs capitalize">
            {String(value || '—')}
          </Badge>
        ),
      },
      {
        key: 'value',
        header: 'Value',
        render: (_: unknown, row: Discount) => (
          <span className="text-sm font-semibold tabular-nums">{formatValue(row)}</span>
        ),
      },
      {
        key: 'usedCount',
        header: 'Usage',
        render: (_: unknown, row: Discount) => (
          <span className="text-sm tabular-nums">
            {row.usedCount} / {row.maxUses == null ? '∞' : row.maxUses}
          </span>
        ),
      },
      {
        key: 'endDate',
        header: 'Ends',
        render: (_: unknown, row: Discount) => (
          <span className="text-sm text-muted-foreground">{formatDateShort(row.endDate ?? null)}</span>
        ),
      },
      {
        key: 'isActive',
        header: 'Status',
        render: (value: unknown) => (
          <Badge variant={value ? 'default' : 'secondary'} className="text-xs">
            {value ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
    ],
    []
  );

  const actions = useMemo(
    () => [
      { label: <Eye className="h-4 w-4" />, onClick: (d: Discount) => handleViewDiscount(d), variant: 'ghost' as const, size: 'icon' as const },
      { label: <Pencil className="h-4 w-4" />, onClick: (d: Discount) => handleEditDiscount(d), variant: 'outline' as const, size: 'icon' as const },
      { label: <Trash className="h-4 w-4" />, onClick: (d: Discount) => handleDeleteClick(d), variant: 'destructive' as const, size: 'icon' as const },
    ],
    []
  );

  if (error) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-4">
            <SlidersHorizontal className="h-5 w-5 text-destructive" />
          </div>
          <p className="text-muted-foreground">Failed to load discounts</p>
        </CardContent>
      </Card>
    );
  }

  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;
  const hasActiveFilters = search || statusFilter !== 'all';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif tracking-tight">
            Discounts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} {total === 1 ? 'discount' : 'discounts'} total
          </p>
        </div>

        <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Discount
            </Button>
          </SheetTrigger>
          <SheetContent side={sheetSide} className={isMobile ? 'w-full h-[90vh]' : 'sm:max-w-3xl w-full'}>
            <div className="h-full px-4 py-4">
              <DiscountForm onSuccess={handleCreateSuccess} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Filters Bar */}
      <div className="rounded-lg border bg-card p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-6 sm:items-center">
          <form onSubmit={handleSearchSubmit} className="sm:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by code..."
                className="pl-9 pr-10"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                aria-label="Search"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="sm:col-span-3 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="h-10 sm:w-56">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex justify-end sm:ml-2">
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchInput('');
                    setSearch('');
                    setStatusFilter('all');
                    setLimit(10);
                    setPage(1);
                  }}
                  className="text-muted-foreground"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      {!discountsData && !error ? (
        <div className="flex items-center justify-center py-20">
          <Spinner variant="pinwheel" />
        </div>
      ) : discounts.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Ticket className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {hasActiveFilters ? 'No discounts match your filters.' : 'No discounts yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {discounts.map((d, idx) => (
              <button
                key={d._id}
                onClick={() => handleViewDiscount(d)}
                className="text-left rounded-lg border bg-card p-4 transition-all hover:bg-muted/30 hover:shadow-md active:scale-[0.98]"
                style={{ animation: 'fadeInUp 0.4s ease-out backwards', animationDelay: `${idx * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <code className="text-sm font-medium bg-muted px-1.5 py-0.5 rounded">{d.code}</code>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary" className="text-[11px] capitalize">
                        {d.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatValue(d)}</span>
                    </div>
                  </div>
                  <Badge variant={d.isActive ? 'default' : 'secondary'} className="text-[11px]">
                    {d.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Percent className="h-3.5 w-3.5" />
                    <span className="tabular-nums">{d.usedCount} / {d.maxUses == null ? '∞' : d.maxUses}</span>
                  </div>
                  <div className="text-right">{formatDateShort(d.endDate ?? null)}</div>
                </div>

                <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                  {validityLabel(d)}
                </div>
              </button>
            ))}

            <ServerPagination
              page={meta?.page ?? page}
              totalPages={totalPages}
              total={total}
              limit={meta?.limit ?? limit}
              showingCount={discounts.length}
              onPageChange={(next) => setPage(next)}
              onLimitChange={(nextLimit) => {
                setLimit(nextLimit);
                setPage(1);
              }}
              className="pt-2"
            />
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block rounded-lg border bg-card overflow-hidden">
            <SimpleTable data={discounts} columns={columns} actions={actions} showPagination={false} />

            <div className="border-t p-4">
              <ServerPagination
                page={meta?.page ?? page}
                totalPages={totalPages}
                total={total}
                limit={meta?.limit ?? limit}
                showingCount={discounts.length}
                onPageChange={(next) => setPage(next)}
                onLimitChange={(nextLimit) => {
                  setLimit(nextLimit);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* View Sheet */}
      <Sheet
        open={viewSheetOpen}
        onOpenChange={(open) => {
          setViewSheetOpen(open);
          if (!open) setViewingDiscount(null);
        }}
      >
        <SheetContent
          side={sheetSide}
          className={isMobile ? 'w-full h-[85vh]' : isMidSize ? 'sm:max-w-[600px] h-[85vh]' : 'sm:max-w-[600px] w-full'}
        >
          <div className="h-full">
            {viewingDiscount && (
              <DiscountView
                discount={viewingDiscount}
                onEdit={handleViewToEdit}
                onSuccess={handleViewSuccess}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet
        open={editSheetOpen}
        onOpenChange={(open) => {
          setEditSheetOpen(open);
          if (!open) setEditingDiscount(null);
        }}
      >
        <SheetContent side={sheetSide} className={isMobile ? 'w-full h-[90vh]' : 'sm:max-w-3xl w-full'}>
          <div className="h-full">
            {editingDiscount && (
              <DiscountEditForm
                discount={editingDiscount}
                onSuccess={handleEditSuccess}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Discount"
        description={`Are you sure you want to delete "${deletingDiscount?.code}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
