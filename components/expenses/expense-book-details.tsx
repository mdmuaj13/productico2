'use client';

import { useState } from 'react';
import { useExpenseBook, useExpenseBookStats } from '@/hooks/expense-books';
import { useExpenseEntries, deleteExpenseEntry } from '@/hooks/expense-entries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Wallet, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import ExpenseEntryForm from './expense-entry-form';
import { format } from 'date-fns';

interface ExpenseBookDetailsProps {
  bookId: string;
}

export default function ExpenseBookDetails({ bookId }: ExpenseBookDetailsProps) {
  const router = useRouter();
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [defaultEntryType, setDefaultEntryType] = useState<'credit' | 'debit'>('debit');

  const { data: book } = useExpenseBook(bookId);
  const { data: stats, mutate: mutateStats } = useExpenseBookStats(bookId);
  const { data: entriesData, mutate: mutateEntries } = useExpenseEntries({
    bookId,
    page: 1,
    limit: 100,
  });

  const entries = entriesData?.data || [];

  const handleCreateSuccess = () => {
    setCreateSheetOpen(false);
    mutateEntries();
    mutateStats();
    toast.success('Entry created successfully');
  };

  const handleEditSuccess = () => {
    setEditSheetOpen(false);
    setSelectedEntry(null);
    mutateEntries();
    mutateStats();
    toast.success('Entry updated successfully');
  };

  const handleEdit = (entry: any) => {
    setSelectedEntry(entry);
    setEditSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      await deleteExpenseEntry(id);
      mutateEntries();
      mutateStats();
      toast.success('Entry deleted successfully');
    } catch (error) {
      toast.error('Failed to delete entry');
      console.error('Error deleting entry:', error);
    }
  };

  const openCreateSheet = (type: 'credit' | 'debit') => {
    setDefaultEntryType(type);
    setCreateSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/app/expenses')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">{book?.name}</h2>
          {book?.description && (
            <p className="text-muted-foreground">{book.description}</p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats?.creditTotal?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debit</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${stats?.debitTotal?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (stats?.netBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${stats?.netBalance?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={() => openCreateSheet('credit')} className="flex-1">
          <Plus className="mr-2 h-4 w-4" />
          Add Credit
        </Button>
        <Button onClick={() => openCreateSheet('debit')} variant="outline" className="flex-1">
          <Plus className="mr-2 h-4 w-4" />
          Add Debit
        </Button>
      </div>

      {/* Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entries.map((entry: any) => (
              <div
                key={entry._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={entry.type === 'credit' ? 'default' : 'destructive'}>
                      {entry.type}
                    </Badge>
                    <span className="font-semibold text-lg">
                      ${entry.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {format(new Date(entry.date), 'PPP')}
                    {entry.time && ` at ${entry.time}`}
                  </div>
                  {entry.category && (
                    <div className="mt-1">
                      <Badge variant="outline">{entry.category}</Badge>
                    </div>
                  )}
                  {entry.remark && (
                    <p className="mt-2 text-sm">{entry.remark}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(entry)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(entry._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {entries.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No entries yet</p>
                <p className="text-sm text-muted-foreground">Add your first entry to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Entry Sheet */}
      <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create Entry</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
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
          <SheetHeader>
            <SheetTitle>Edit Entry</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
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
    </div>
  );
}
