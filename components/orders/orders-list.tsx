'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Eye, Pencil, Plus } from 'lucide-react';
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

export function OrdersList() {
  // ✅ Server pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // ✅ Filters (like invoice)
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

  // pass filters to hook (must update hook/backend to accept these)
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
      { key: 'code', header: 'Order Code' },
      {
        key: 'customerName',
        header: 'Customer',
        render: (value: unknown, row: OrderType) => (
          <div>
            <div className="font-medium">{String(value)}</div>
            {row.customerMobile && <div className="text-xs text-muted-foreground">{row.customerMobile}</div>}
          </div>
        ),
      },
      {
        key: 'total',
        header: 'Amount',
        render: (value: unknown, row: OrderType) => (
          <div>
            <div className="font-semibold">৳{Number(value).toFixed(2)}</div>
            {row.due > 0 && <div className="text-xs text-red-600">Due: ৳{row.due.toFixed(2)}</div>}
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (value: unknown, row: OrderType) => (
          <div className="space-y-1">
            <Badge variant={getStatusBadgeVariant(row.status)}>{titleCase(value)}</Badge>
            <div>
              <Badge variant={getPaymentStatusBadgeVariant(row.paymentStatus)} className="text-xs">
                {titleCase(row.paymentStatus)}
              </Badge>
            </div>
          </div>
        ),
      },
      {
        key: 'createdAt',
        header: 'Date',
        render: (value: unknown) => {
          const date = new Date(String(value));
          return (
            <div>
              <div className="text-sm">{date.toLocaleDateString()}</div>
              <div className="text-xs text-muted-foreground">
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        },
      },
    ],
    []
  );

  const actions = useMemo(
    () => [
      { label: <Eye />, onClick: (o: OrderType) => handleViewOrder(o), variant: 'secondary' as const },
      { label: <Pencil />, onClick: (o: OrderType) => handleEditOrder(o), variant: 'outline' as const },
    ],
    []
  );

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-500">Failed to load orders</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders ({total})</h1>

        <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
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

      {/* ✅ Filters (same pattern as invoice) */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-6">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search order code / customer / phone..."
          className=" sm:col-span-3"
        />

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="h-10 w-full">
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
          <SelectTrigger className="h-10 w-full">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payment</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex justify-end sm:col-span-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchInput('');
              setStatusFilter('all');
              setPaymentFilter('all');
              setLimit(10);
              setPage(1);
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Body */}
      {!ordersData && !error ? (
        <div className="flex items-center justify-center py-8">
          <Spinner variant="pinwheel" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p>No orders found.</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {orders.map((o: OrderType) => (
              <div key={String((o as any)._id || o.code)} className="rounded-2xl border bg-card px-2 py-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{shortCode(o.code)}</span>
                      <span className="text-xs text-muted-foreground">{shortDate(o.createdAt)}</span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <span className="font-medium truncate">{shortName(o.customerName)}</span>
                      {o.customerMobile ? (
                        <span className="text-xs text-muted-foreground">{shortPhone(o.customerMobile)}</span>
                      ) : null}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(o.status)} className="text-[11px] px-2 py-0.5">
                        {titleCase(o.status)}
                      </Badge>
                      <Badge variant={getPaymentStatusBadgeVariant(o.paymentStatus)} className="text-[11px] px-2 py-0.5">
                        {titleCase(o.paymentStatus)}
                      </Badge>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold">{moneyNoDecimals(o.total)}</div>
                    {Number(o.due || 0) > 0 ? (
                      <div className="text-xs text-red-600">Due {moneyNoDecimals(o.due)}</div>
                    ) : (
                      <div className="text-xs text-emerald-600">No due</div>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-end gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleViewOrder(o)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEditOrder(o)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
              className="pt-1"
            />
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block">
            <SimpleTable data={orders} columns={columns} actions={actions} showPagination={false} />

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
              className="pt-4"
            />
          </div>
        </>
      )}

      {/* View Sheet */}
      <Sheet
        open={viewSheetOpen}
        onOpenChange={(open) => {
          setViewSheetOpen(open);
          if (!open) setViewingOrder(null);
        }}
      >
        <SheetContent className="sm:max-w-[600px] w-full">
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
        <SheetContent className="sm:max-w-4xl w-full">
          <div className="h-full">
            {editingOrder && <OrderEditForm order={editingOrder} onSuccess={handleEditSuccess} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
