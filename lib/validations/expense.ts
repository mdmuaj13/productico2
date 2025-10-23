import { z } from 'zod';

// Expense Book Schemas
export const createExpenseBookSchema = z.object({
  name: z.string().min(1, 'Book name is required').max(100, 'Book name cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional()
});

export const updateExpenseBookSchema = z.object({
  name: z.string().min(1, 'Book name is required').max(100, 'Book name cannot exceed 100 characters').optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional()
});

// Expense Entry Schemas
export const createExpenseEntrySchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  type: z.enum(['credit', 'debit'], {
    message: 'Type must be either credit or debit'
  }),
  amount: z.number().positive('Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'), // Will be converted to Date in API
  time: z.string().optional(),
  remark: z.string().max(500, 'Remark cannot exceed 500 characters').optional(),
  category: z.string().max(100, 'Category cannot exceed 100 characters').optional()
});

export const updateExpenseEntrySchema = z.object({
  type: z.enum(['credit', 'debit']).optional(),
  amount: z.number().positive('Amount must be greater than 0').optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  remark: z.string().max(500, 'Remark cannot exceed 500 characters').optional(),
  category: z.string().max(100, 'Category cannot exceed 100 characters').optional()
});

export type CreateExpenseBookInput = z.infer<typeof createExpenseBookSchema>;
export type UpdateExpenseBookInput = z.infer<typeof updateExpenseBookSchema>;
export type CreateExpenseEntryInput = z.infer<typeof createExpenseEntrySchema>;
export type UpdateExpenseEntryInput = z.infer<typeof updateExpenseEntrySchema>;
