'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createExpenseEntrySchema, CreateExpenseEntryInput } from '@/lib/validations/expense';
import { createExpenseEntry, updateExpenseEntry } from '@/hooks/expense-entries';
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
import { format } from 'date-fns';
import { useState } from 'react';
import { IExpenseEntry } from '@/models/ExpenseEntry';

interface ExpenseEntryFormProps {
  bookId: string;
  entry?: IExpenseEntry;
  defaultType?: 'credit' | 'debit';
  onSuccess: () => void;
}

export default function ExpenseEntryForm({
  bookId,
  entry,
  defaultType = 'debit',
  onSuccess,
}: ExpenseEntryFormProps) {
  const [selectedType, setSelectedType] = useState<'credit' | 'debit'>(
    entry?.type || defaultType
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateExpenseEntryInput>({
    resolver: zodResolver(createExpenseEntrySchema),
    defaultValues: entry
      ? {
          bookId: entry.bookId.toString(),
          type: entry.type,
          amount: entry.amount,
          date: format(new Date(entry.date), 'yyyy-MM-dd'),
          time: entry.time || '',
          remark: entry.remark || '',
          category: entry.category || '',
        }
      : {
          bookId,
          type: defaultType,
          amount: 0,
          date: format(new Date(), 'yyyy-MM-dd'),
          time: format(new Date(), 'HH:mm'),
          remark: '',
          category: '',
        },
  });

  const handleTypeChange = (type: 'credit' | 'debit') => {
    setSelectedType(type);
    setValue('type', type);
  };

  const onSubmit = async (data: CreateExpenseEntryInput) => {
    try {
      // Ensure type is set correctly
      const submitData = { ...data, type: selectedType };

      if (entry) {
        await updateExpenseEntry(entry._id.toString(), submitData);
      } else {
        await createExpenseEntry(submitData);
      }
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save entry');
      console.error('Error saving entry:', error);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 p-4 py-8">
      <SheetHeader className="px-0">
        <SheetTitle>{entry ? 'Edit Entry' : 'Create Entry'}</SheetTitle>
        <SheetDescription>
          {entry ? 'Update the expense entry details.' : 'Add a new expense entry to your book.'}
        </SheetDescription>
      </SheetHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-4 py-4">
        {/* Type Toggle */}
        <div className="space-y-2">
          <Label>Entry Type *</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={selectedType === 'credit' ? 'default' : 'outline'}
              onClick={() => handleTypeChange('credit')}
              className="w-full"
            >
              Credit
            </Button>
            <Button
              type="button"
              variant={selectedType === 'debit' ? 'default' : 'outline'}
              onClick={() => handleTypeChange('debit')}
              className="w-full"
            >
              Debit
            </Button>
          </div>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            {...register('date')}
          />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        {/* Time */}
        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            {...register('time')}
          />
          {errors.time && (
            <p className="text-sm text-destructive">{errors.time.message}</p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            {...register('category')}
            placeholder="e.g., Food, Transport, Salary"
          />
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>

        {/* Remark */}
        <div className="space-y-2">
          <Label htmlFor="remark">Remark</Label>
          <Textarea
            id="remark"
            {...register('remark')}
            placeholder="Optional notes about this entry"
            rows={3}
            className="resize-none"
          />
          {errors.remark && (
            <p className="text-sm text-destructive">{errors.remark.message}</p>
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
          {isSubmitting ? 'Saving...' : entry ? 'Update Entry' : 'Create Entry'}
        </Button>
      </SheetFooter>
    </div>
  );
}
