import { InvoiceList } from '@/components/invoice/orders-list'

const InvoicePage = () => {
  return (
    <div>
			<div className="flex-1 space-y-4 p-4 pt-6 lg:p-6">
				<InvoiceList />
			</div>
		</div>
  )
}

export default InvoicePage