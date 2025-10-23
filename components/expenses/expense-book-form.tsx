'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createExpenseBookSchema, CreateExpenseBookInput } from '@/lib/validations/expense';
import { createExpenseBook, updateExpenseBook } from '@/hooks/expense-books';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : book ? 'Update Book' : 'Create Book'}
      </Button>
    </form>
  );
}
