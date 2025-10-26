import { useApi, apiCall } from '@/lib/api';
import { CreateExpenseEntryInput, UpdateExpenseEntryInput } from '@/lib/validations/expense';

interface UseExpenseEntriesParams {
  page?: number;
  limit?: number;
  bookId?: string;
  type?: 'credit' | 'debit';
  category?: string;
  search?: string;
}

// Hook to get all expense entries
export const useExpenseEntries = (params?: UseExpenseEntriesParams) => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.bookId) queryParams.append('bookId', params.bookId);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.search) queryParams.append('search', params.search);

  const url = `/api/expense-entries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApi(url);
};

// Hook to get single expense entry
export const useExpenseEntry = (id: string | null) => {
  const url = id ? `/api/expense-entries/${id}` : null;
  return useApi(url as any);
};

// Create expense entry
export const createExpenseEntry = async (data: CreateExpenseEntryInput) => {
  return apiCall('/api/expense-entries', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Update expense entry
export const updateExpenseEntry = async (id: string, data: UpdateExpenseEntryInput) => {
  return apiCall(`/api/expense-entries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Delete expense entry
export const deleteExpenseEntry = async (id: string) => {
  return apiCall(`/api/expense-entries/${id}`, {
    method: 'DELETE',
  });
};
