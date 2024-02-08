import React, { useState } from 'react';
import IndexPage from './dataImport/dataImportFlow';
import PaymentRecording from './PaymentRecording';

interface PaymentProcessProps {
  isVisible: boolean;
  onClose: () => void;
  projectId: string;
  clientId: string;
  companyId: string;
}

const PaymentProcess: React.FC<PaymentProcessProps> = ({ isVisible, onClose, projectId, clientId, companyId }) => {
  const [modalContent, setModalContent] = useState<'options' | 'import' | 'manual'>('options');

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
         <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-5xl">
    {/* If the table is still too wide, allow horizontal scrolling within the modal */}
    <div className="overflow-x-auto">
        {modalContent === 'options' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Choose an Option</h2>
            <button onClick={() => setModalContent('import')} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded block w-full mb-2">
              Import Data
            </button>
            <button onClick={() => setModalContent('manual')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded block w-full">
              Manually Record Payment
            </button>
          </div>
        )}

        {modalContent === 'import' && (
          <div>
            <IndexPage clientId={clientId} projectId={projectId} companyId={companyId}/>
            <button onClick={onClose} className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Close
            </button>
          </div>
        )}

        {modalContent === 'manual' && (
          <div>
            <PaymentRecording projectId={projectId} onClose={onClose} />
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default PaymentProcess;
