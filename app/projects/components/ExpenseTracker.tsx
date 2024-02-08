import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector, Label } from 'recharts';

interface TransactionData {
  amount: number | null;
  categories: string | null;
  client_id: string | null;
  date: string | null;
  description: string | null;
  project_id: string | null;
  status: string | null;
  subcontractor_id: string | null;
  transaction_id: number;
  transaction_type: string | null;
}

interface ExpenseTrackerProps {
  transactions: TransactionData[] | null;
}

interface ExpenseAccumulator {
  [category: string]: number;
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}


const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', // existing colors
  '#A569BD', '#5DADE2', '#48C9B0', '#58D68D',
  '#F7DC6F', '#F0B27A', '#A3E4D7', '#EDBB99',
  '#AEB6BF', '#AED6F1', '#D7BDE2', '#D2B4DE'
];

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <div className="text-center text-gray-600">No expense data available.</div>;
  }

  const expensesByCategory = transactions.reduce<ExpenseAccumulator>((acc, transaction) => {
    if (transaction.transaction_type === 'Expense' && transaction.amount) {
      const category = transaction.categories?.trim() || 'Other';
      acc[category] = (acc[category] || 0) + transaction.amount;
    }
    return acc;
  }, {});

  const chartData: ChartDataItem[] = Object.keys(expensesByCategory).map((key, index) => ({
    name: key,
    value: expensesByCategory[key],
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Expense Tracker</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            dataKey="value"
            isAnimationActive={false}
            data={chartData}
            outerRadius={80}
            fill="#8884d8"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseTracker;
