import React, { useMemo, useState } from 'react';
import { Chart } from 'react-google-charts';

// Interfaces
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

interface BudgetOverviewProps {
  budgetDetails: BudgetDetail[];
  overallBudget: BudgetRow;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budgetDetails, overallBudget }) => {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  // Predefined set of colors
  const colors = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
                  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
                  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
                  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
                  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
                  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
                  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
                  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
                  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
                  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

                  const aggregatedDetails = useMemo(() => {
                    const aggregationMap = new Map<string, number>();
                
                    budgetDetails.forEach((detail) => {
                      const amount = detail.allocated_amount || 0;
                      const sectionName = detail.section_name || 'Unknown';
                
                      if (aggregationMap.has(sectionName)) {
                        aggregationMap.set(sectionName, aggregationMap.get(sectionName)! + amount);
                      } else {
                        aggregationMap.set(sectionName, amount);
                      }
                    });
                
                    return Array.from(aggregationMap, ([sectionName, amount]) => ({
                      section_name: sectionName,
                      allocated_amount: amount,
                    }));
                  }, [budgetDetails]);
                
                  const chartData = useMemo(() => [
                    ['Category', 'Allocated Amount', { role: 'annotation' }, { role: 'style' }],
                    ...aggregatedDetails.map((detail, index) => [
                      detail.section_name,
                      detail.allocated_amount,
                      `$${detail.allocated_amount.toFixed(2)}`,
                      colors[index % colors.length]  // Cycle through colors
                    ])
                  ], [aggregatedDetails, colors]);
                
                  const barChartOptions = {
                    title: 'Budget Allocation by Section',
                    chartArea: { width: '50%' },
                    hAxis: {
                      title: 'Allocated Amount',
                      minValue: 0,
                    },
                    vAxis: {
                      title: 'Category',
                    },
                    legend: { position: 'none' },
                  };
                
                  return (
                    <div className="p-5">
                      <div className="mb-4">
                        <h2 className="text-xl font-semibold mb-2">Overall Estimated Budget</h2>
                        <p className="mb-1">Initial Budget: <span className="font-medium">${overallBudget.initial_budget?.toFixed(2) || '0.00'}</span></p>
                        <p className="mb-1">Revised Budget: <span className="font-medium">${overallBudget.revised_budget?.toFixed(2) || '0.00'}</span></p>
                        <p>Date of Revision: <span className="font-medium">{overallBudget.date_of_revision || 'N/A'}</span></p>
                      </div>
                      <div className="mb-4">
                        <button 
                          onClick={() => setView('chart')} 
                          className={`px-4 py-2 rounded ${view === 'chart' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        >
                          Pie Chart View
                        </button>
                        <button 
                          onClick={() => setView('table')} 
                          className={`ml-2 px-4 py-2 rounded ${view === 'table' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                        >
                          Table View
                        </button>
                      </div>
                
                      {view === 'chart' ? (
                        <Chart
                          chartType="BarChart"
                          width="100%"
                          height="400px"
                          data={chartData}
                          options={barChartOptions}
                        />
                      ) : (
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="border-b text-left px-2 py-1">Section Name</th>
                              <th className="border-b text-left px-2 py-1">Allocated Amount</th>
                              <th className="border-b text-left px-2 py-1">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {budgetDetails.map((detail, index) => (
                              <tr key={index}>
                                <td className="border-b px-2 py-1">{detail.section_name || 'N/A'}</td>
                                <td className="border-b px-2 py-1">${detail.allocated_amount?.toFixed(2) || '0.00'}</td>
                                <td className="border-b px-2 py-1">{detail.description || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  );
                };
                
                export default BudgetOverview;
