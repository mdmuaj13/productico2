import { useApi, apiCall } from '@/lib/api';
import { CreateExpenseBookInput, UpdateExpenseBookInput } from '@/lib/validations/expense';

interface UseExpenseBooksParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Hook to get all expense books
export const useExpenseBooks = (params?: UseExpenseBooksParams) => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);

  const url = `/api/expense-books${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApi(url);
};

// Hook to get single expense book
export const useExpenseBook = (id: string | null) => {
  const url = id ? `/api/expense-books/${id}` : null;
  return useApi(url as any);
};

// Hook to get expense book stats
export const useExpenseBookStats = (id: string | null) => {
  const url = id ? `/api/expense-books/${id}/stats` : null;
  return useApi(url as any);
};

// Create expense book
export const createExpenseBook = async (data: CreateExpenseBookInput) => {
  return apiCall('/api/expense-books', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Update expense book
export const updateExpenseBook = async (id: string, data: UpdateExpenseBookInput) => {
  return apiCall(`/api/expense-books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Delete expense book
export const deleteExpenseBook = async (id: string) => {
  return apiCall(`/api/expense-books/${id}`, {
    method: 'DELETE',
  });
};
