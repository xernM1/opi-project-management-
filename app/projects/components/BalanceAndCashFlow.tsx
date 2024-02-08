import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

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

interface BalanceAndCashFlowProps {
  transactions: TransactionData[] | null;
}

interface AggregatedDataItem {
  period: string;
  income: number;
  expenses: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

interface ChartDataItem {
  date: string;
  amount: number;
  income: number;
  expenses: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataItem;
    return (
      <div className="custom-tooltip bg-white shadow-lg p-2 rounded">
        <p className="label">{`Date: ${data.date}`}</p>
        <p className="intro">{`Balance: $${data.amount.toFixed(2)}`}</p>
        <p className="desc">{`Income: $${data.income.toFixed(2)}`}</p>
        <p className="desc">{`Expenses: $${data.expenses.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

const BalanceAndCashFlow: React.FC<BalanceAndCashFlowProps> = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <div className="text-center text-gray-600">No transaction data available.</div>;
  }


  const aggregateDataByPeriod = (transactions: TransactionData[]): AggregatedDataItem[] => {
    const aggregatedData: { [key: string]: AggregatedDataItem } = {};
  
    transactions.forEach((transaction) => {
      if (
        typeof transaction.date !== 'string' ||
        typeof transaction.amount !== 'number' ||
        typeof transaction.transaction_type !== 'string'
      ) {
        return;
      }
  
      const date = new Date(transaction.date);
      if (isNaN(date.getTime())) {
        console.error('Invalid date format');
        return;
      }
  
      // Format the date as YYYY-MM-DD
      const period = date.toISOString().split('T')[0];
  
      if (!aggregatedData[period]) {
        aggregatedData[period] = { period, income: 0, expenses: 0 };
      }
  
      switch (transaction.transaction_type) {
        case 'Revenue':
          aggregatedData[period].income += transaction.amount;
          break;
        case 'Expense':
          aggregatedData[period].expenses += transaction.amount;
          break;
        default:
          console.warn(`Unknown transaction type: ${transaction.transaction_type}`);
      }
    });
  
    return Object.values(aggregatedData);
  };
  

  const aggregatedData = aggregateDataByPeriod(transactions);
  let balance = 0;

  // Sort the aggregated data by period (date)
  const sortedAggregatedData = aggregatedData.sort((a, b) => (a.period > b.period ? 1 : -1));

  const chartData: ChartDataItem[] = sortedAggregatedData.map((item) => {
    balance += item.income - item.expenses;
    return {
      date: item.period,
      amount: balance,
      income: item.income,
      expenses: item.expenses,
    };
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Balance and Cash Flow</h3>
      <div className="mb-4">Current Balance: <span className="font-bold">${balance.toFixed(2)}</span></div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="amount" fill="#8884d8">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.amount >= 0 ? '#4caf50' : '#f44336'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BalanceAndCashFlow;
