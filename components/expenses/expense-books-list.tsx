'use client';

import { useState } from 'react';
import { useExpenseBooks, deleteExpenseBook } from '@/hooks/expense-books';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Edit, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import ExpenseBookForm from './expense-book-form';

export default function ExpenseBooksList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const { data: booksData, mutate: mutateBooks } = useExpenseBooks({
    page: 1,
    limit: 100,
    search,
  });

  const books = booksData?.data || [];

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

  const handleEdit = (book: any) => {
    setSelectedBook(book);
    setEditSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense book?')) {
      return;
    }

    try {
      await deleteExpenseBook(id);
      mutateBooks();
      toast.success('Expense book deleted successfully');
    } catch (error) {
      toast.error('Failed to delete expense book');
      console.error('Error deleting expense book:', error);
    }
  };

  const handleViewDetails = (bookId: string) => {
    router.push(`/app/expenses/${bookId}`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expense Books</h2>
          <p className="text-muted-foreground">Manage your expense books and track finances</p>
        </div>
        <Button onClick={() => setCreateSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Book
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {books.map((book: any) => (
          <Card key={book._id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{book.name}</CardTitle>
                </div>
              </div>
              {book.description && (
                <CardDescription className="line-clamp-2">{book.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleViewDetails(book._id)}
                  className="flex-1"
                >
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(book)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(book._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {books.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No expense books found</h3>
          <p className="text-muted-foreground">
            {search ? 'Try a different search term' : 'Create your first expense book to get started'}
          </p>
          {!search && (
            <Button onClick={() => setCreateSheetOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Book
            </Button>
          )}
        </div>
      )}

      {/* Create Sheet */}
      <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create Expense Book</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ExpenseBookForm onSuccess={handleCreateSuccess} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Expense Book</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {selectedBook && (
              <ExpenseBookForm
                book={selectedBook}
                onSuccess={handleEditSuccess}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
