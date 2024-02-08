import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import BudgetOverview from './BudgetOverview';
import ExpenseTracker from './ExpenseTracker';
import BalanceAndCashFlow from './BalanceAndCashFlow';

interface FinancialDashboardProps {
  projectId: string;
}

interface BudgetDetail {
  allocated_amount: number | null;
  budget_id: string | null;
  change_order_impact: string | null;
  description: string | null;
  detail_id: string;
  project_id: string | null;
  section_name: string | null;
}
interface BudgetRow {
  budget_id: string;
  date_of_revision: string | null;
  initial_budget: number | null;
  project_id: string | null;
  revised_budget: number | null;
}

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

interface FinancialData {
  budget: BudgetRow | null;
  budgetDetails: BudgetDetail[];
  transactions: TransactionData[] | null;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ projectId }) => {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase= createClient()
  useEffect(() => {
    const fetchFinancialData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetching the overall budget to get the budget_id
        const { data: BudgetRow, error: budgetError } = await supabase
          .from('budgets')
          .select('*')
          .eq('project_id', projectId);
      
        if (budgetError) throw new Error(budgetError.message);
      
        const budgetId = BudgetRow && BudgetRow.length > 0 ? BudgetRow[0].budget_id : null;
      
        if (!budgetId) {
          throw new Error("No budget found for the given project ID.");
        }
      
        // Fetching transaction data
        const { data: transactionData, error: transactionError } = await supabase
          .from('transactions')
          .select('*')
          .eq('project_id', projectId);
      
        // Fetching budget details with the obtained budget_id
        const { data: budgetDetailsData, error: budgetDetailsError } = await supabase
          .from('budget_details')
          .select('*')
          .eq('budget_id', budgetId);
      
        if (transactionError || budgetDetailsError) {
          throw new Error(transactionError?.message || budgetDetailsError?.message);
        }
      
        setFinancialData({
          budget: BudgetRow && BudgetRow.length > 0 ? BudgetRow[0] : null,
          transactions: transactionData,
          budgetDetails: budgetDetailsData
        });
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
      
    };

    fetchFinancialData();
  }, [projectId]);

  if (loading) return <div>Loading financial data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!financialData) return <div>No financial data available.</div>;

  return (

      <div className="p-4 bg-white rounded-lg shadow-md space-y-6">
        {financialData.budget && financialData.budgetDetails && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <BudgetOverview 
              budgetDetails={financialData.budgetDetails} 
              overallBudget={financialData.budget} 
            />
          </div>
        )}
  
        {financialData.transactions && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <ExpenseTracker transactions={financialData.transactions} />
          </div>
        )}
  
        {financialData.transactions && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <BalanceAndCashFlow transactions={financialData.transactions} />
          </div>
        )}
      </div>
    );
  };
  
  export default FinancialDashboard;