'use client';

import { useState } from 'react';
import { useExpenseBook } from '@/hooks/expense-books';
import { useExpenseEntries, deleteExpenseEntry } from '@/hooks/expense-entries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pencil, Plus, Search, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import ExpenseEntryForm from './expense-entry-form';
import { format } from 'date-fns';
import { SimpleTable } from '@/components/simple-table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Spinner } from '../ui/shadcn-io/spinner';
import { IExpenseEntry } from '@/models/ExpenseEntry';

interface ExpenseBookDetailsProps {
  bookId: string;
}

export default function ExpenseBookDetails({ bookId }: ExpenseBookDetailsProps) {
  const router = useRouter();
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<IExpenseEntry | null>(null);
  const [defaultEntryType, setDefaultEntryType] = useState<'credit' | 'debit'>('debit');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<IExpenseEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: book, mutate: mutateBook } = useExpenseBook(bookId);
  const { data: entriesData, error, mutate: mutateEntries } = useExpenseEntries({
    bookId,
    page: 1,
    limit: 100,
    search,
  });

  const entries = entriesData?.data || [];

  const handleCreateSuccess = () => {
    setCreateSheetOpen(false);
    mutateEntries();
    mutateBook();
    toast.success('Entry created successfully');
  };

  const handleEditSuccess = () => {
    setEditSheetOpen(false);
    setSelectedEntry(null);
    mutateEntries();
    mutateBook();
    toast.success('Entry updated successfully');
  };

  const handleEdit = (entry: IExpenseEntry) => {
    setSelectedEntry(entry);
    setEditSheetOpen(true);
  };

  const handleDeleteClick = (entry: IExpenseEntry) => {
    setDeletingEntry(entry);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEntry) return;

    setIsDeleting(true);
    try {
      await deleteExpenseEntry(deletingEntry._id.toString());
      mutateEntries();
      mutateBook();
      toast.success('Entry deleted successfully');
    } catch {
      toast.error('Failed to delete entry');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingEntry(null);
    }
  };

  const handleSearch = () => {
    setSearch(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const columns = [
    {
      key: 'type',
      header: 'Type',
      render: (value: unknown) => (
        <Badge variant={value === 'credit' ? 'default' : 'destructive'}>
          {String(value).toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (value: unknown) => `$${Number(value).toFixed(2)}`,
    },
    {
      key: 'date',
      header: 'Date',
      render: (value: unknown, row: IExpenseEntry) => (
        <div>
          <div>{format(new Date(String(value)), 'PPP')}</div>
          {row.time && (
            <div className="text-xs text-muted-foreground">{row.time}</div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (value: unknown) => (
        value ? (
          <Badge variant="outline">{String(value)}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: 'remark',
      header: 'Remark',
      render: (value: unknown) =>
        value ? String(value) : '-'
      ,
    },
  ];

  const actions = [
    {
      label: <Pencil/>,
      onClick: (entry: IExpenseEntry) => handleEdit(entry),
      variant: 'outline' as const,
    },
    {
      label: <Trash/>,
      onClick: (entry: IExpenseEntry) => handleDeleteClick(entry),
      variant: 'destructive' as const,
    },
  ];

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-500">Failed to load entries</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/app/expenses')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{book?.name}</h1>
          {book?.description && (
            <p className="text-muted-foreground">{book.description}</p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Credit
              </span>
              <span className="text-2xl font-semibold">
                ${book?.creditTotal?.toFixed(2) || '0.00'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Debit
              </span>
              <span className="text-2xl font-semibold">
                ${book?.debitTotal?.toFixed(2) || '0.00'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${
          (book?.netBalance || 0) >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'
        }`}>
          <CardContent className="p-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Net Balance
              </span>
              <span className={`text-2xl font-semibold ${
                (book?.netBalance || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`}>
                ${book?.netBalance?.toFixed(2) || '0.00'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Input
              placeholder="Search by amount or remark..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-10"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
            <SheetTrigger asChild>
              <Button onClick={() => setDefaultEntryType('credit')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Credit
              </Button>
            </SheetTrigger>
          </Sheet>
          <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" onClick={() => setDefaultEntryType('debit')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Debit
              </Button>
            </SheetTrigger>
          </Sheet>
        </div>
      </div>

      {/* Entries Table */}
      <Card>
        <CardContent className="pt-6">
          {!entriesData && !error ? (
            <div className="flex items-center justify-center py-8">
              <Spinner variant="pinwheel" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No entries yet. Add your first entry to get started.</p>
            </div>
          ) : (
            <SimpleTable
              data={entries}
              columns={columns}
              actions={actions}
              showPagination={false}
            />
          )}
        </CardContent>
      </Card>

      {/* Create Entry Sheet */}
      <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
        <SheetContent>
          <div className="h-full">
            <ExpenseEntryForm
              bookId={bookId}
              defaultType={defaultEntryType}
              onSuccess={handleCreateSuccess}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Entry Sheet */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent>
          <div className="h-full">
            {selectedEntry && (
              <ExpenseEntryForm
                bookId={bookId}
                entry={selectedEntry}
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
        title="Delete Entry"
        description="Are you sure you want to delete this entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
