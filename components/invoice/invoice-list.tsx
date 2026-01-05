"use client";

import { useState } from "react";
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

export function InvoiceList() {
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [viewSheetOpen, setViewSheetOpen] = useState(false);

  const [editingInvoice, setEditingInvoice] = useState<InvoiceType | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceType | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState<InvoiceType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: invoiceData,
    error,
    mutate: mutateInvoices,
  } = useInvoices({
    page: 1,
    limit: 100,
  });

  const invoices = invoiceData?.data || [];
  const meta = invoiceData?.meta;

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
      case "sent":
        return "default";
      case "paid":
        return "default";
      case "overdue":
        return "default";
      default:
        return "secondary";
    }
  };

  const getPaymentStatusBadgeVariant = (status: InvoiceType["paymentStatus"]) => {
    switch (status) {
      case "unpaid":
        return "destructive";
      case "partial":
        return "secondary";
      case "paid":
        return "default";
      default:
        return "secondary";
    }
  };

  // ✅ adjust endpoint if needed
  async function deleteInvoice(invoiceId: string) {
    const res = await fetch(`/api/invoice/${invoiceId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        result?.error || result?.message || "Failed to delete invoice. Please try again.";
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

      // close sheets if the same invoice is open
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

      mutateInvoices();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete invoice";
      toast.error(msg);
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { key: "invoiceNo", header: "Invoice Code" },
    {
      key: "clientName",
      header: "Customer",
      render: (value: unknown, row: InvoiceType) => (
        <div>
          <div className="font-medium">{String(value)}</div>
          {row.clientMobile && (
            <div className="text-xs text-muted-foreground">{row.clientMobile}</div>
          )}
        </div>
      ),
    },
    {
      key: "total",
      header: "Amount",
      render: (value: unknown, row: InvoiceType) => (
        <div>
          <div className="font-semibold">৳{Number(value).toFixed(2)}</div>
          {row.due > 0 && (
            <div className="text-xs text-red-600">Due: ৳{row.due.toFixed(2)}</div>
          )}
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
              {String(row.paymentStatus).charAt(0).toUpperCase() + String(row.paymentStatus).slice(1)}
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
  ];

  const actions = [
    {
      label: <Eye />,
      onClick: (invoice: InvoiceType) => handleViewInvoice(invoice),
      variant: "secondary" as const,
    },
    {
      label: <Pencil />,
      onClick: (invoice: InvoiceType) => handleEditInvoice(invoice),
      variant: "outline" as const,
    },
    {
      label: <Trash2 />,
      onClick: (invoice: InvoiceType) => handleDeleteClick(invoice),
      variant: "destructive" as const,
    },
  ];

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoice ({meta?.total || 0})</h1>

        <div className="flex items-center gap-2">
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
      </div>

      {/* Invoices Table */}
      {!invoiceData && !error ? (
        <div className="flex items-center justify-center py-8">
          <Spinner variant="pinwheel" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p>No invoices found. Create your first invoice to get started.</p>
        </div>
      ) : (
        <SimpleTable data={invoices} columns={columns} actions={actions} showPagination={false} />
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

      {/* ✅ Delete Confirmation Dialog */}
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
