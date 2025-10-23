'use client';

import { useState } from 'react';
import { useExpenseBooks, deleteExpenseBook } from '@/hooks/expense-books';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import ExpenseBookForm from './expense-book-form';
import { SimpleTable } from '@/components/simple-table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Spinner } from '../ui/shadcn-io/spinner';

interface ExpenseBook {
  _id: string;
  name: string;
  description?: string;
  creditTotal: number;
  debitTotal: number;
  netBalance: number;
  createdAt: string;
  updatedAt: string;
}

export default function ExpenseBooksList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<ExpenseBook | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBook, setDeletingBook] = useState<ExpenseBook | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: booksData, error, mutate: mutateBooks } = useExpenseBooks({
    page: 1,
    limit: 100,
    search,
  });

  const books = booksData?.data || [];
  const meta = booksData?.meta;

  const handleCreateSuccess = () => {
    setCreateSheetOpen(false);
    mutateBooks();
    toast.success('Expense book created successfully');
  };

  const handleEditSuccess = () => {
    setEditSheetOpen(false);
    setSelectedBook(null);
    mutateBooks();
    toast.success('Expense book updated successfully');
  };

  const handleEdit = (book: ExpenseBook) => {
    setSelectedBook(book);
    setEditSheetOpen(true);
  };

  const handleDeleteClick = (book: ExpenseBook) => {
    setDeletingBook(book);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBook) return;

    setIsDeleting(true);
    try {
      await deleteExpenseBook(deletingBook._id);
      toast.success('Expense book deleted successfully');
      mutateBooks();
    } catch {
      toast.error('Failed to delete expense book');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingBook(null);
    }
  };

  const handleViewDetails = (book: ExpenseBook) => {
    router.push(`/app/expenses/${book._id}`);
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
      key: 'name',
      header: 'Book Name',
    },
    {
      key: 'description',
      header: 'Description',
      render: (value: unknown) =>
        value ? String(value) : 'No description'
      ,
    },
    {
      key: 'creditTotal',
      header: 'Total Credit',
      render: (value: unknown) => `$${Number(value).toFixed(2)}`,
    },
    {
      key: 'debitTotal',
      header: 'Total Debit',
      render: (value: unknown) => `$${Number(value).toFixed(2)}`,
    },
    {
      key: 'netBalance',
      header: 'Net Balance',
      render: (value: unknown) => {
        const balance = Number(value);
        const className = balance >= 0 ? 'text-green-600' : 'text-red-600';
        return <span className={className}>${balance.toFixed(2)}</span>;
      },
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value: unknown) => new Date(String(value)).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      label: 'View',
      onClick: (book: ExpenseBook) => handleViewDetails(book),
      variant: 'outline' as const,
      icon: Eye,
    },
    {
      label: 'Edit',
      onClick: (book: ExpenseBook) => handleEdit(book),
      variant: 'outline' as const,
    },
    {
      label: 'Delete',
      onClick: (book: ExpenseBook) => handleDeleteClick(book),
      variant: 'destructive' as const,
    },
  ];

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-500">Failed to load expense books</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expense Books ({meta?.total || 0})</h1>
        <div className="flex items-center gap-2">
          <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense Book
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="h-full">
                <ExpenseBookForm onSuccess={handleCreateSuccess} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Expense Books Table */}
      <Card>
        <CardHeader>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Input
                  placeholder="Search expense books..."
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
          </div>
        </CardHeader>
        <CardContent>
          {!booksData && !error ? (
            <div className="flex items-center justify-center py-8">
              <Spinner variant="pinwheel" />
            </div>
          ) : books.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p>No expense books found</p>
            </div>
          ) : (
            <SimpleTable
              data={books}
              columns={columns}
              actions={actions}
              showPagination={false}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Sheet */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent>
          <div className="h-full">
            {selectedBook && (
              <ExpenseBookForm
                book={selectedBook}
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
        title="Delete Expense Book"
        description={`Are you sure you want to delete "${deletingBook?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
