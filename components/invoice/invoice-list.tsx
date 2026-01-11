"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { InvoiceForm } from "./create";
import { InvoiceView } from "./view";
import { InvoiceEditForm } from "./edit-form";

import { SimpleTable } from "@/components/simple-table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

import { useInvoices, Invoice as InvoiceType } from "@/hooks/invoice";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import { ServerPagination } from "@/components/server-pagination";

function titleCase(s: unknown) {
  const str = String(s || "");
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "—";
}

export function InvoiceList() {
  // Server pagination state
  const [page, setPage] = useState(1);   // 1-based (API)
  const [limit, setLimit] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"all" | InvoiceType["status"]>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | InvoiceType["paymentStatus"]>("all");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // When filters/search change, reset to page 1 (very important)
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, paymentFilter, limit]);

  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [viewSheetOpen, setViewSheetOpen] = useState(false);

  const [editingInvoice, setEditingInvoice] = useState<InvoiceType | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceType | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState<InvoiceType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: invoiceData, error, mutate: mutateInvoices } = useInvoices({
    page,
    limit,
    search: debouncedSearch,
    status: statusFilter === "all" ? "" : statusFilter,
    paymentStatus: paymentFilter === "all" ? "" : paymentFilter,
    sortBy: "invoiceDate",
    sortOrder: "desc",
  });

  const invoices = invoiceData?.data || [];
  const meta = invoiceData?.meta;

  // guard meta values
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  const handleViewInvoice = (invoice: InvoiceType) => {
    setViewingInvoice(invoice);
    setViewSheetOpen(true);
  };

  const handleEditInvoice = (invoice: InvoiceType) => {
    setEditingInvoice(invoice);
    setEditSheetOpen(true);
  };

  const handleViewToEdit = () => {
    if (viewingInvoice) {
      setViewSheetOpen(false);
      setEditingInvoice(viewingInvoice);
      setEditSheetOpen(true);
    }
  };

  const handleCreateSuccess = () => {
    setCreateSheetOpen(false);
    mutateInvoices();
  };

  const handleEditSuccess = () => {
    setEditSheetOpen(false);
    setEditingInvoice(null);
    mutateInvoices();
  };

  const handleViewSuccess = () => {
    setViewSheetOpen(false);
    setViewingInvoice(null);
    mutateInvoices();
  };

  const getStatusBadgeVariant = (status: InvoiceType["status"]) => {
    switch (status) {
      case "draft":
        return "secondary";
      default:
        return "default";
    }
  };

  const getPaymentStatusBadgeVariant = (status: InvoiceType["paymentStatus"]) => {
    switch (status) {
      case "unpaid":
        return "destructive";
      case "partial":
        return "secondary";
      default:
        return "default";
    }
  };

  async function deleteInvoice(invoiceId: string) {
    const res = await fetch(`/api/invoice/${invoiceId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = result?.error || result?.message || "Failed to delete invoice. Please try again.";
      throw new Error(message);
    }

    return result;
  }

  const handleDeleteClick = (invoice: InvoiceType) => {
    setDeletingInvoice(invoice);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingInvoice) return;

    const id = String((deletingInvoice as any)._id || "");
    if (!id) {
      toast.error("Invalid invoice id");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteInvoice(id);
      toast.success("Invoice deleted");

      if (viewingInvoice && String((viewingInvoice as any)._id) === id) {
        setViewSheetOpen(false);
        setViewingInvoice(null);
      }
      if (editingInvoice && String((editingInvoice as any)._id) === id) {
        setEditSheetOpen(false);
        setEditingInvoice(null);
      }

      setDeleteDialogOpen(false);
      setDeletingInvoice(null);

      // If last item deleted on current page, go back a page (optional but nice)
      if (invoices.length === 1 && page > 1) setPage(page - 1);

      mutateInvoices();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete invoice";
      toast.error(msg);
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  // Mobile formatting helpers
  const shortInvoiceNo = (no?: string) => {
    const s = String(no || "");
    if (!s) return "—";
    return s.length > 8 ? `…${s.slice(-6)}` : s;
  };

  const shortPhone = (phone?: string) => {
    const s = String(phone || "");
    if (!s) return "";
    return s.length > 6 ? `…${s.slice(-6)}` : s;
  };

  const shortName = (full?: string) => {
    const s = String(full || "").trim();
    if (!s) return "—";
    const parts = s.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0];
    const first = parts[0];
    const lastInitial = parts[parts.length - 1]?.[0]?.toUpperCase();
    return lastInitial ? `${first} ${lastInitial}.` : first;
  };

  const shortDate = (value: unknown) => {
    try {
      const d = new Date(String(value));
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
    } catch {
      return "—";
    }
  };

  const moneyNoDecimals = (n: unknown) => `৳${Math.round(Number(n || 0))}`;

  // Desktop table columns (unchanged)
  const columns = useMemo(
    () => [
      { key: "invoiceNo", header: "Invoice Code" },
      {
        key: "clientName",
        header: "Customer",
        render: (value: unknown, row: InvoiceType) => (
          <div>
            <div className="font-medium">{String(value)}</div>
            {row.clientMobile && <div className="text-xs text-muted-foreground">{row.clientMobile}</div>}
          </div>
        ),
      },
      {
        key: "total",
        header: "Amount",
        render: (value: unknown, row: InvoiceType) => (
          <div>
            <div className="font-semibold">৳{Number(value).toFixed(2)}</div>
            {row.due > 0 && <div className="text-xs text-red-600">Due: ৳{row.due.toFixed(2)}</div>}
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (value: unknown, row: InvoiceType) => (
          <div className="space-y-1">
            <Badge variant={getStatusBadgeVariant(row.status)}>
              {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
            </Badge>
            <div>
              <Badge variant={getPaymentStatusBadgeVariant(row.paymentStatus)} className="text-xs">
                {titleCase(row.paymentStatus)}
              </Badge>
            </div>
          </div>
        ),
      },
      {
        key: "invoiceDate",
        header: "Date",
        render: (value: unknown) => {
          const date = new Date(String(value));
          return (
            <div>
              <div className="text-sm">{date.toLocaleDateString()}</div>
              <div className="text-xs text-muted-foreground">
                {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
      { label: <Eye />, onClick: (inv: InvoiceType) => handleViewInvoice(inv), variant: "secondary" as const },
      { label: <Pencil />, onClick: (inv: InvoiceType) => handleEditInvoice(inv), variant: "outline" as const },
      { label: <Trash2 />, onClick: (inv: InvoiceType) => handleDeleteClick(inv), variant: "destructive" as const },
    ],
    []
  );

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-500">Failed to load invoices</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoice ({total})</h1>

        <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-6xl w-full">
            <div className="h-full px-4 py-4">
              <InvoiceForm onSuccess={handleCreateSuccess} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-6">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search invoice no / client / phone..."
          className="h-10 sm:col-span-3"
        />

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="h-10 w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
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

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchInput("");
              setStatusFilter("all");
              setPaymentFilter("all");
              setLimit(10);
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        </div>
      </div>

      {/* Body */}
      {!invoiceData && !error ? (
        <div className="flex items-center justify-center py-8">
          <Spinner variant="pinwheel" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p>No invoices found.</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {invoices.map((inv: InvoiceType) => (
              <div
                key={String((inv as any)._id || inv.invoiceNo)}
                className="rounded-2xl border bg-card px-2 py-1.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{shortInvoiceNo(inv.invoiceNo)}</span>
                      <span className="text-xs text-muted-foreground">{shortDate(inv.invoiceDate)}</span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <span className="font-medium truncate">{shortName(inv.clientName)}</span>
                      {inv.clientMobile ? (
                        <span className="text-xs text-muted-foreground">{shortPhone(inv.clientMobile)}</span>
                      ) : null}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(inv.status)} className="text-[11px] px-2 py-0.5">
                        {titleCase(inv.status)}
                      </Badge>
                      <Badge
                        variant={getPaymentStatusBadgeVariant(inv.paymentStatus)}
                        className="text-[11px] px-2 py-0.5"
                      >
                        {titleCase(inv.paymentStatus)}
                      </Badge>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold">{moneyNoDecimals(inv.total)}</div>
                    {Number(inv.due || 0) > 0 ? (
                      <div className="text-xs text-red-600">Due {moneyNoDecimals(inv.due)}</div>
                    ) : (
                      <div className="text-xs text-emerald-600">No due</div>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-end gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleViewInvoice(inv)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEditInvoice(inv)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(inv)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Mobile pagination */}
            <ServerPagination
              page={meta?.page ?? page}
              totalPages={totalPages}
              total={total}
              limit={meta?.limit ?? limit}
              showingCount={invoices.length}
              onPageChange={(next) => setPage(next)}
              onLimitChange={(nextLimit) => {
                setLimit(nextLimit);
                setPage(1);
              }}
              className="pt-1"
            />
          </div>

          {/* Desktop: table + server pagination (recommended) */}
          <div className="hidden sm:block">
            <SimpleTable data={invoices} columns={columns} actions={actions} showPagination={false} />
            <ServerPagination
              page={meta?.page ?? page}
              totalPages={totalPages}
              total={total}
              limit={meta?.limit ?? limit}
              showingCount={invoices.length}
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
      <Sheet open={viewSheetOpen} onOpenChange={setViewSheetOpen}>
        <SheetContent className="sm:max-w-150 w-full">
          <div className="h-full">
            {viewingInvoice && (
              <InvoiceView invoice={viewingInvoice} onEdit={handleViewToEdit} onSuccess={handleViewSuccess} />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent className="sm:max-w-6xl w-full">
          <div className="h-full">
            {editingInvoice && <InvoiceEditForm invoice={editingInvoice} onSuccess={handleEditSuccess} />}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeletingInvoice(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Invoice"
        description={`Are you sure you want to delete "${deletingInvoice?.invoiceNo ?? ""}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
