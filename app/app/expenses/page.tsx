import ExpenseBooksList from '@/components/expenses/expense-books-list';

export default function ExpensesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 lg:p-6">
      <ExpenseBooksList />
    </div>
  );
}
