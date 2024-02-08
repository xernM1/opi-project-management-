import React, { useState } from 'react';
import PaymentRecording from './PaymentRecording';
import AdditionalCosts from './AdditionalCosts';


interface TransactionManagementProps {
  projectId: string;
}

const TransactionManagement: React.FC<TransactionManagementProps> = ({ projectId }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAdditionalCostsModal, setShowAdditionalCostsModal] = useState(false);

  const togglePaymentModal = () => setShowPaymentModal(!showPaymentModal);
  const toggleAdditionalCostsModal = () => setShowAdditionalCostsModal(!showAdditionalCostsModal);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Transaction Management for Project ID: {projectId}</h2>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={togglePaymentModal}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Record Payment
        </button>
        <button
          onClick={toggleAdditionalCostsModal}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Additional Costs
        </button>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <PaymentRecording projectId={projectId} onClose={function (): void {
              throw new Error('Function not implemented.');
            } } />
            <button 
              onClick={togglePaymentModal}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded mt-3"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showAdditionalCostsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <AdditionalCosts projectId={projectId} onClose={function (): void {
              throw new Error('Function not implemented.');
            } } />
            <button 
              onClick={toggleAdditionalCostsModal}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded mt-3"
            >
              Close
            </button>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default TransactionManagement;
