'use client';

import { useApi, apiCall } from '@/lib/api';

/** ===== Types ===== */

export interface InvoiceItem {
	_id: string;
	slug?: string;
	title: string;
	description?: string;
	shortDetail?: string;
	thumbnail?: string;

	basePrice: number;
	price: number;
	quantity: number;

	variantName: string | null;
	variantPrice: number | null;
	variantSalePrice: number | null;

	warehouseId: string | null;
	lineTotal: number;
}

export interface Invoice {
	_id: string;

	// Client info
	clientName: string;
	clientMobile: string;
	clientEmail?: string;
	clientAddress: string;
	clientCity?: string;
	clientDistrict?: string;

	// Identifiers
	invoiceNo: string;
	referenceNo?: string;

	// Dates
	invoiceDate: string;
	dueDate: string;

	// Items
	items: InvoiceItem[];

	// Pricing
	subTotal: number;
	discount: number;
	tax: number;
	total: number;

	// Payment
	paid: number;
	due: number;
	paymentStatus: 'unpaid' | 'partial' | 'paid';
	paymentType: 'cash' | 'card' | 'bkash' | 'nagad' | 'rocket' | 'bank';

	// Invoice status
	status: 'draft' | 'sent' | 'paid' | 'overdue';

	// Notes/Terms
	notes?: string;
	terms?: string;

	// Soft delete
	isDeleted?: boolean;
	deletedAt?: string | null;

	// Metadata
	createdById?: string;
	createdAt: string;
	updatedAt: string;
}

interface invoiceResponse {
	data: Invoice[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export type InvoiceQuery = {
	page?: number;
	limit?: number;
	search?: string;
	status?: string; // "all" | "draft" | "sent" | "paid" | "overdue"
	paymentStatus?: string; // "all" | "unpaid" | "partial" | "paid"
	sortBy?: string;
	sortOrder?: "asc" | "desc";
  };

/** ===== Hooks ===== */

/**
 * List invoices with pagination + filtering
 * Mirrors your useOrders pattern
 */
export const useInvoices = (params?: {
	page?: number;
	limit?: number;
	search?: string; // search by invoiceNo or clientName (depends on backend)
	status?: string; // draft/sent/paid/overdue
	paymentStatus?: string; // unpaid/partial/paid
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	includeDeleted?: boolean;
}) => {
	const queryParams = new URLSearchParams();

	if (params?.page) queryParams.set('page', params.page.toString());
	if (params?.limit) queryParams.set('limit', params.limit.toString());

	if (params?.search) queryParams.set('search', params.search);
	if (params?.status) queryParams.set('status', params.status);
	if (params?.paymentStatus) queryParams.set('paymentStatus', params.paymentStatus);

	if (params?.sortBy) queryParams.set("sortBy", params.sortBy);
  	if (params?.sortOrder) queryParams.set("sortOrder", params.sortOrder);

	if (params?.includeDeleted) queryParams.set('includeDeleted', 'true');

	const url = `/api/invoice${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

	// If your useApi supports generics, you can do: useApi<InvoicesResponse>(url)
	return useApi(url);
};

/**
 * Fetch single invoice
 */
export const useInvoice = (id: string) => {
	return useApi(`/api/invoice/${id}`);
};

/** ===== Mutations ===== */

export const createInvoice = async (data: any) => {
	return apiCall('/api/invoice', {
		method: 'POST',
		body: JSON.stringify(data),
	});
};

// Optional if you add PUT/PATCH endpoint later
export const updateInvoice = async (id: string, data: any) => {
	return apiCall(`/api/invoice/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data),
	});
};

/**
 * Soft delete (preferred)
 * Backend should set isDeleted/deletedAt rather than physical deletion
 */
export const deleteInvoice = async (id: string) => {
	return apiCall(`/api/invoice/${id}`, {
		method: 'DELETE',
	});
};

/**
 * Optional: PDF export endpoint (download link / blob in UI)
 * Assumes backend route: GET /api/invoice/:id/pdf
 */
export const getInvoicePdf = async (id: string) => {
	// If your apiCall returns JSON only, don’t use it here.
	// This returns the Response so the UI can handle blob().
	return fetch(`/api/invoice/${id}/pdf`, {
		method: 'GET',
	});
};
