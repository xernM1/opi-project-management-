import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createClient } from '@/utils/supabase/client';
import SubcontractorSelect from './subcontractorSelect';

// Interfaces for type definitions
interface NewSubcontractor {
  name: string;
  details?: string | null;
  isNew: boolean;
}

interface PaymentForm {
  amount: number | null;
  dateString: string | null;
  transactionType: string | null;
  subcontractorId: string | null;
  clientId: string | null;
  description: string | null;
  categories: string | null;
  invoice_number: string | null;
  newSubcontractor?: NewSubcontractor;
}

interface PaymentRecordingProps {
  projectId: string;
  onClose: () => void;
}

// The PaymentRecording functional component
const PaymentRecording: React.FC<PaymentRecordingProps> = ({ projectId, onClose }) => {
  // State for the payment form data
  const [payment, setPayment] = useState<PaymentForm>({
    amount: null,
    dateString: new Date().toISOString().split('T')[0], // Default to today's date
    transactionType: null,
    subcontractorId: null,
    clientId: null,
    description: null,
    categories: null,
    invoice_number: null
  });

  // State for submission status and error/success messages
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const supabase =createClient()
  // Ref for the modal div to handle outside clicks
  const modalRef = useRef<HTMLDivElement>(null);

  // Effect for handling clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose(); // Close the modal if clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Effect for fetching client ID based on the project ID
  useEffect(() => {
    const fetchClientId = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('client_id')
        .eq('project_id', projectId)
        .single();

      if (error) {
        setError(error.message);
        return;
      }

      setPayment(prevState => ({ ...prevState, clientId: data?.client_id }));
    };

    fetchClientId();
  }, [projectId]);

  // Handler for date change in the DatePicker
  const handleDateChange = (date: Date | null) => {
    setPayment({ ...payment, dateString: date ? date.toISOString().split('T')[0] : null });
  };

  // Handler for form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    // Validate required fields
    if (!payment.amount || !payment.dateString || !payment.transactionType) {
      setError("Please fill in all required fields.");
      setSubmitting(false);
      return;
    }

    try {
      let subcontractorId = payment.subcontractorId;

      // Handling new subcontractor case
      if (payment.newSubcontractor && payment.newSubcontractor.isNew) {
        if (!payment.newSubcontractor.name) {
          setError("Subcontractor name is required for a new subcontractor.");
          setSubmitting(false);
          return;
        }

        // Inserting new subcontractor to the database
        const { data: newSubcontractorData, error: insertError } = await supabase
          .from('subcontractors')
          .insert([{ name: payment.newSubcontractor.name, details: payment.newSubcontractor.details || '' }]);

          if (!newSubcontractorData) {
            console.error('Failed to retrieve subcontractor ID from inserted data.');
          }
          
      }

      // Preparing transaction data for submission
      const transactionData = {
        project_id: projectId,
        amount: payment.amount,
        date: payment.dateString,
        transaction_type: payment.transactionType,
        subcontractor_id: subcontractorId,
        client_id: payment.clientId,
        description: payment.description,
        categories: payment.categories,
        invoice_number: payment.invoice_number
      };

      // Inserting transaction data into the database
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([transactionData]);

      if (transactionError) throw transactionError;

      setSuccessMessage('Payment recorded successfully.');
      // Resetting the form state after successful submission
      setPayment({
        amount: null,
        dateString: new Date().toISOString().split('T')[0],
        transactionType: null,
        subcontractorId: null,
        clientId: null,
        description: null,
        categories: null,
        invoice_number: null
      });
    } catch (err) {
      // Log the entire error for debugging
      console.error(err);  // Log the entire error
      // Set a user-friendly error message
      setError(`Error: ${err instanceof Error ? err.message : 'An unexpected error occurred.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handling changes from the SubcontractorSelect component
  const handleSubcontractorChange = (subcontractorId: string, isNew: boolean, newName?: string, newDetails?: string) => {
    if (isNew) {
      // Update payment state with new subcontractor information
      setPayment({
        ...payment,
        newSubcontractor: { name: newName || '', details: newDetails || '', isNew }
      });
    } else {
      // Update payment state with selected existing subcontractor
      setPayment({
        ...payment,
        subcontractorId,
        newSubcontractor: undefined // Clearing new subcontractor info if existing one is selected
      });
    }
  };

  // Render the component
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div ref={modalRef} className="bg-white shadow-md rounded-lg max-w-lg mx-auto p-6" style={{ top: '10%' }}>

        <h3 className="text-xl font-semibold mb-6 text-gray-800">Record a Payment</h3>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Amount Field */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={payment.amount || ''}
              onChange={(e) => setPayment({ ...payment, amount: parseFloat(e.target.value) || null })}
              placeholder="Enter amount"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Date Picker Field */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <DatePicker 
              selected={payment.dateString ? new Date(payment.dateString) : null}
              onChange={handleDateChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          {/* Transaction Type Dropdown */}
          <div>
            <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700">Transaction Type</label>
            <select
              id="transactionType"
              name="transactionType"
              value={payment.transactionType || ''}
              onChange={(e) => setPayment({ ...payment, transactionType: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a type</option>
              <option value="Revenue">Revenue</option>
              <option value="Expense">Expense</option>
            </select>
          </div>

          {/* Subcontractor Select Component */}
          {payment.transactionType === 'Expense' && (
            <SubcontractorSelect onChange={handleSubcontractorChange} />
          )}

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={payment.description || ''}
              onChange={(e) => setPayment({ ...payment, description: e.target.value })}
              placeholder="Enter description"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
            ></textarea>
          </div>

         {/* Category Dropdown for Construction Projects */}
<div>
  <label htmlFor="categories" className="block text-sm font-medium text-gray-700">Category</label>
  <select
    id="categories"
    name="categories"
    value={payment.categories || ''}
    onChange={(e) => setPayment({ ...payment, categories: e.target.value })}
    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
  >
    <option value="">Select a category</option>
    <option value="Labor Costs">Labor Costs</option>
    <option value="Material Costs">Material Costs</option>
    <option value="Equipment Rental">Equipment Rental</option>
    <option value="Tools and Supplies">Tools and Supplies</option>
    <option value="Site Preparation">Site Preparation</option>
    <option value="Architectural and Design Fees">Architectural and Design Fees</option>
    <option value="Permits and Licensing">Permits and Licensing</option>
    <option value="Safety and Compliance">Safety and Compliance</option>
    <option value="Subcontractor Fees">Subcontractor Fees</option>
    <option value="Transport and Logistics">Transport and Logistics</option>
    <option value="Utilities Installation">Utilities Installation</option>
    <option value="Landscaping and Finishing">Landscaping and Finishing</option>
    <option value="Insurance">Insurance</option>
    <option value="Contingency">Contingency</option>
    <option value="Client Payments">Client Payments</option>
    <option value="Maintenance and Warranty">Maintenance and Warranty</option>
  </select>
</div>


          {/* Invoice Number Field */}
          <div>
            <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700">Invoice Number</label>
            <input
              type="text"
              id="invoiceNumber"
              name="invoiceNumber"
              value={payment.invoice_number || ''}
              onChange={(e) => setPayment({ ...payment, invoice_number: e.target.value })}
              placeholder="Enter invoice number"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              Submit
            </button>
          </div>
        </form>
        {error && <div className="text-sm text-red-500 text-center mt-4">{error}</div>}
        {successMessage && <div className="text-sm text-green-500 text-center mt-4">{successMessage}</div>}
      </div>
    </div>
  );
};

export default PaymentRecording;