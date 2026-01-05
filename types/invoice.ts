/** =========================
 * Invoice Item
 * ========================= */
export interface InvoiceItem {
	id: string; // product or service id
	title: string;
	slug?: string;

	price: number;
	salePrice?: number;
	quantity: number;

	lineTotal: number;
}

/** =========================
 * Invoice
 * ========================= */
export interface Invoice {
	_id?: string;

	/* =========================
	   Client Information
	========================= */
	clientName: string;
	clientAddress: string;
	clientCity?: string;
	clientMobile: string;
	clientEmail?: string;

	/* =========================
	   Invoice Details
	========================= */
	invoiceNo: string;
    referenceNo: string;
	invoiceDate: Date | string;
	dueDate: Date | string;

	items: InvoiceItem[];

	/* =========================
	   Financial Details
	========================= */
	subTotal: number;

	discountCode?: string;
	discount: number;

	tax: number;
	total: number;

	paid: number;
	due: number;

	/* =========================
	   Status
	========================= */
	status: 'draft' | 'sent' | 'paid' | 'overdue';
	paymentStatus: 'unpaid' | 'partial' | 'paid';

	/* =========================
	   Additional
	========================= */
	notes?: string;
	terms?: string;

	/* =========================
	   Metadata
	========================= */
	createdAt?: string;
	updatedAt?: string;
    deletedAt?: string;
}

/** =========================
 * Invoice Form Data
 * (used for create/update forms)
 * ========================= */
export interface InvoiceFormData
	extends Omit<Invoice, '_id' | 'createdAt' | 'updatedAt'> {}
