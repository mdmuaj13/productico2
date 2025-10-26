import ExpenseBookDetails from '@/components/expenses/expense-book-details';

interface ExpenseBookPageProps {
  params: Promise<{
    bookId: string;
  }>;
}

export default async function ExpenseBookPage({ params }: ExpenseBookPageProps) {
  const { bookId } = await params;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ExpenseBookDetails bookId={bookId} />
    </div>
  );
}
