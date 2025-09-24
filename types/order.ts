export interface OrderProduct {
	id: string;
	title: string;
	slug?: string;
	price: number;
	salePrice?: number;
	quantity: number;
	lineTotal: number;
}

export interface Order {
	_id?: string;
	// Customer Information
	name: string;
	address: string;
	city: string;
	contact_number: string;
	email?: string;

	// Order Details
	order_code: string;
	order_date: Date | string;
	products: OrderProduct[];

	// Financial Details
	order_amount: number;
	discount_code?: string;
	discount_amount: number;
	delivery_cost: number;
	paid_amount: number;
	due_amount: number;

	// Status
	order_status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
	order_payment_status: 'unpaid' | 'partial' | 'paid';

	// Additional
	remark?: string;

	// Timestamps
	createdAt?: string;
	updatedAt?: string;
}

export interface OrderFormData extends Omit<Order, '_id' | 'createdAt' | 'updatedAt'> {}
