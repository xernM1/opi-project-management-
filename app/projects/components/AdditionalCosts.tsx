import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client'; 
import { v4 as uuidv4 } from 'uuid';

interface AdditionalCostsProps {
  projectId: string;
  onClose: () => void;
}

interface ChangeOrderForm {
  additional_cost: number | null;
  description: string;
  date: string;
}

const AdditionalCosts: React.FC<AdditionalCostsProps> = ({ projectId, onClose }) => {
  const [changeOrder, setChangeOrder] = useState<ChangeOrderForm>({
    additional_cost: null,
    description: '',
    date: '',
  });
  const supabase= createClient()
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const generateChangeOrderId = () => {
    return uuidv4();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const changeOrderId = generateChangeOrderId();

    const { error } = await supabase
      .from('change_orders')
      .insert([{
        ...changeOrder,
        change_order_id: changeOrderId,
        project_id: projectId,
        status: 'pending',
      }]);

    setSubmitting(false);

    if (error) {
      setError('Failed to add additional cost: ' + error.message);
    } else {
      setSuccessMessage('Additional cost added successfully.');
      setChangeOrder({
        additional_cost: null,
        description: '',
        date: '',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setChangeOrder(prev => ({
      ...prev,
      [name]: name === 'additional_cost' ? parseFloat(value) || null : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div ref={modalRef} className="bg-white shadow-md rounded-lg max-w-lg mx-auto p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Add Additional Costs</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="additional_cost" className="block text-sm font-medium text-gray-700">Additional Cost</label>
            <input
              type="number"
              id="additional_cost"
              name="additional_cost"
              value={changeOrder.additional_cost || ''}
              onChange={handleChange}
              placeholder="Enter additional cost"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={changeOrder.description}
              onChange={handleChange}
              placeholder="Description of the cost"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={changeOrder.date}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              Submit
            </button>
          </div>

          {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
          {successMessage && <div className="mt-2 text-sm text-green-500">{successMessage}</div>}
        </form>
      </div>
    </div>
  );
};

export default AdditionalCosts;
