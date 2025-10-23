'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createExpenseBookSchema, CreateExpenseBookInput } from '@/lib/validations/expense';
import { createExpenseBook, updateExpenseBook } from '@/hooks/expense-books';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { toast } from 'sonner';

interface ExpenseBookFormProps {
  book?: any;
  onSuccess: () => void;
}

export default function ExpenseBookForm({ book, onSuccess }: ExpenseBookFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateExpenseBookInput>({
    resolver: zodResolver(createExpenseBookSchema),
    defaultValues: book
      ? {
          name: book.name,
          description: book.description || '',
        }
      : {
          name: '',
          description: '',
        },
  });

  const onSubmit = async (data: CreateExpenseBookInput) => {
    try {
      if (book) {
        await updateExpenseBook(book._id, data);
      } else {
        await createExpenseBook(data);
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save expense book');
      console.error('Error saving expense book:', error);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 p-4 py-8">
      <SheetHeader className="px-0">
        <SheetTitle>{book ? 'Edit Expense Book' : 'Create Expense Book'}</SheetTitle>
        <SheetDescription>
          {book ? 'Update the expense book details.' : 'Add a new expense book to organize your finances.'}
        </SheetDescription>
      </SheetHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Book Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="e.g., Personal Expenses, Business Expenses"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Optional description for this book"
            rows={3}
            className="resize-none"
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>
      </form>

      <SheetFooter className="gap-2 px-0 mt-auto">
        <SheetClose asChild>
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
        </SheetClose>
        <Button type="submit" disabled={isSubmitting} onClick={handleSubmit(onSubmit)}>
          {isSubmitting ? 'Saving...' : book ? 'Update Book' : 'Create Book'}
        </Button>
      </SheetFooter>
    </div>
  );
}
