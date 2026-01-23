'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Eye, Pencil, Plus, Search, SlidersHorizontal, Package, Calendar, ChevronRight } from 'lucide-react';
import { OrderForm } from './create';
import { OrderView } from './view';
import { OrderEditForm } from './edit-form';
import { SimpleTable } from '@/components/simple-table';
import { Badge } from '@/components/ui/badge';
import { useOrders, Order as OrderType } from '@/hooks/orders';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { ServerPagination } from '@/components/server-pagination';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function titleCase(s: unknown) {
  const str = String(s || '');
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '—';
}

// Mobile helpers
const shortCode = (code?: string) => {
  const s = String(code || '');
  if (!s) return '—';
  return s.length > 10 ? `…${s.slice(-8)}` : s;
};

const shortPhone = (phone?: string) => {
  const s = String(phone || '');
  if (!s) return '';
  return s.length > 6 ? `…${s.slice(-6)}` : s;
};

const shortName = (full?: string) => {
  const s = String(full || '').trim();
  if (!s) return '—';
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1]?.[0]?.toUpperCase();
  return lastInitial ? `${first} ${lastInitial}.` : first;
};

const shortDate = (value: unknown) => {
  try {
    const d = new Date(String(value));
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
  } catch {
    return '—';
  }
};

const moneyNoDecimals = (n: unknown) => `৳${Math.round(Number(n || 0))}`;

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

export function OrdersList() {
  // Server pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filters
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [statusFilter, setStatusFilter] = useState<'all' | OrderType['status']>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | OrderType['paymentStatus']>('all');

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // reset to page 1 on any filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, paymentFilter, limit]);

  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [viewSheetOpen, setViewSheetOpen] = useState(false);

  const [editingOrder, setEditingOrder] = useState<OrderType | null>(null);
  const [viewingOrder, setViewingOrder] = useState<OrderType | null>(null);

  // Check for mid-size devices (tablet range) and mobile
  const isMidSize = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
  const isMobile = useMediaQuery('(max-width: 639px)');
  const sheetSide = isMobile || isMidSize ? 'bottom' : 'right';

  const { data: ordersData, error, mutate: mutateOrders } = useOrders({
    page,
    limit,
    search: debouncedSearch,
    status: statusFilter === 'all' ? '' : statusFilter,
    paymentStatus: paymentFilter === 'all' ? '' : paymentFilter,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const orders = ordersData?.data || [];
  const meta = ordersData?.meta;

  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  const handleViewOrder = (order: OrderType) => {
    setViewingOrder(order);
    setViewSheetOpen(true);
  };

  const handleEditOrder = (order: OrderType) => {
    setEditingOrder(order);
    setEditSheetOpen(true);
  };

  const handleViewToEdit = () => {
    if (!viewingOrder) return;
    setViewSheetOpen(false);
    setEditingOrder(viewingOrder);
    setEditSheetOpen(true);
  };

  const handleCreateSuccess = () => {
    setCreateSheetOpen(false);
    mutateOrders();
  };

  const handleEditSuccess = () => {
    setEditSheetOpen(false);
    setEditingOrder(null);
    mutateOrders();
  };

  const handleViewSuccess = () => {
    setViewSheetOpen(false);
    setViewingOrder(null);
    mutateOrders();
  };

  const getStatusBadgeVariant = (status: OrderType['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getPaymentStatusBadgeVariant = (status: OrderType['paymentStatus']) => {
    switch (status) {
      case 'unpaid':
        return 'destructive';
      case 'partial':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'code',
        header: 'Order Code',
        render: (value: unknown) => (
          <code className="text-sm font-medium bg-muted px-1.5 py-0.5 rounded">{String(value)}</code>
        ),
      },
      {
        key: 'customerName',
        header: 'Customer',
        render: (value: unknown) => <span className="text-sm">{String(value)}</span>,
      },
      {
        key: 'customerDistrict',
        header: 'District',
        render: (value: unknown) => <span className="text-sm text-muted-foreground">{String(value || '—')}</span>,
      },
      {
        key: 'total',
        header: 'Total',
        render: (value: unknown) => (
          <span className="text-sm text-right font-medium tabular-nums block">৳{Number(value || 0).toFixed(2)}</span>
        ),
      },
      {
        key: 'paid_due',
        header: 'Paid / Due',
        render: (_: unknown, row: OrderType) => (
          <div className="text-right">
            <div className="text-sm font-medium text-green-600 tabular-nums">৳{Number(row.paid || 0).toFixed(2)}</div>
            <div className="text-xs text-red-600 tabular-nums">৳{Number(row.due || 0).toFixed(2)}</div>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (value: unknown, row: OrderType) => (
          <div className="flex justify-center">
            <Badge variant={getStatusBadgeVariant(row.status)} className="text-xs">
              {titleCase(value)}
            </Badge>
          </div>
        ),
      },
      {
        key: 'paymentStatus',
        header: 'Payment',
        render: (value: unknown, row: OrderType) => (
          <div className="flex justify-center">
            <Badge variant={getPaymentStatusBadgeVariant(row.paymentStatus)} className="text-xs">
              {titleCase(value)}
            </Badge>
          </div>
        ),
      },
      {
        key: 'createdAt',
        header: 'Date',
        render: (value: unknown) => {
          const date = new Date(String(value));
          return (
            <span className="text-sm text-muted-foreground">
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          );
        },
      },
    ],
    []
  );

  const actions = useMemo(
    () => [
      { label: <Eye className="h-4 w-4" />, onClick: (o: OrderType) => handleViewOrder(o), variant: 'ghost' as const, size: 'icon' as const },
      { label: <Pencil className="h-4 w-4" />, onClick: (o: OrderType) => handleEditOrder(o), variant: 'outline' as const, size: 'icon' as const },
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
          <p className="text-muted-foreground">Failed to load orders</p>
        </CardContent>
      </Card>
    );
  }

  const hasActiveFilters = searchInput || statusFilter !== 'all' || paymentFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} {total === 1 ? 'order' : 'orders'} total
          </p>
        </div>

        <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Order
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-4xl w-full">
            <div className="h-full px-4 py-4">
              <OrderForm onSuccess={handleCreateSuccess} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Filters Bar */}
      <div className="rounded-lg border bg-card p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search orders..."
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as any)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payment</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex justify-end">
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput('');
                  setStatusFilter('all');
                  setPaymentFilter('all');
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

      {/* Body */}
      {!ordersData && !error ? (
        <div className="flex items-center justify-center py-20">
          <Spinner variant="pinwheel" />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {hasActiveFilters ? 'No orders match your filters.' : 'No orders yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {orders.map((o: OrderType, idx: number) => (
              <button
                key={String((o as any)._id || o.code)}
                onClick={() => handleViewOrder(o)}
                className="text-left rounded-lg border bg-card p-4 transition-all hover:bg-muted/30 hover:shadow-md active:scale-[0.98]"
                style={{ animation: 'fadeInUp 0.4s ease-out backwards', animationDelay: `${idx * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <code className="text-xs font-medium bg-muted px-1.5 py-0.5 rounded">{shortCode(o.code)}</code>
                    <div className="mt-2 text-sm font-medium">{shortName(o.customerName)}</div>
                    {o.customerDistrict && (
                      <div className="text-xs text-muted-foreground">{o.customerDistrict}</div>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-sm font-bold tabular-nums">{moneyNoDecimals(o.total)}</div>
                    <div className="flex items-center justify-end gap-1 text-xs mt-1">
                      <span className="text-green-600 tabular-nums">{moneyNoDecimals(o.paid)}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-red-600 tabular-nums">{moneyNoDecimals(o.due)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(o.status)} className="text-[10px] px-2 py-0.5">
                      {titleCase(o.status)}
                    </Badge>
                    <Badge variant={getPaymentStatusBadgeVariant(o.paymentStatus)} className="text-[10px] px-2 py-0.5">
                      {titleCase(o.paymentStatus)}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {shortDate(o.createdAt)}
                    </span>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            ))}

            <ServerPagination
              page={meta?.page ?? page}
              totalPages={totalPages}
              total={total}
              limit={meta?.limit ?? limit}
              showingCount={orders.length}
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
            <SimpleTable data={orders} columns={columns} actions={actions} showPagination={false} />

            <div className="border-t p-4">
              <ServerPagination
                page={meta?.page ?? page}
                totalPages={totalPages}
                total={total}
                limit={meta?.limit ?? limit}
                showingCount={orders.length}
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

      {/* View Sheet - responsive side */}
      <Sheet
        open={viewSheetOpen}
        onOpenChange={(open) => {
          setViewSheetOpen(open);
          if (!open) setViewingOrder(null);
        }}
      >
        <SheetContent
          side={sheetSide}
          className={isMobile ? 'w-full h-[85vh]' : isMidSize ? 'sm:max-w-[600px] h-[85vh]' : 'sm:max-w-[600px] w-full'}
        >
          <div className="h-full">
            {viewingOrder && <OrderView order={viewingOrder} onEdit={handleViewToEdit} onSuccess={handleViewSuccess} />}
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet
        open={editSheetOpen}
        onOpenChange={(open) => {
          setEditSheetOpen(open);
          if (!open) setEditingOrder(null);
        }}
      >
        <SheetContent
          side={sheetSide}
          className={isMobile ? 'w-full h-[90vh]' : 'sm:max-w-4xl w-full'}
        >
          <div className="h-full">
            {editingOrder && <OrderEditForm order={editingOrder} onSuccess={handleEditSuccess} />}
          </div>
        </SheetContent>
      </Sheet>

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
