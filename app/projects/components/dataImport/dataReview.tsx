import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FaTrash } from 'react-icons/fa';
import DeleteConfirmationModal from '@/app/component/deleteConfirmationModal';
import Fuse from 'fuse.js';
import { v4 as uuidv4 } from 'uuid';
import Modal from './modal';

interface PaymentForm {
  amount: number | null;
  dateString: string | null;
  transactionType: string | null;
  client: string | null;
  description: string | null;
  categories: string | null;
  invoice_number: string | null;
  subcontractor: string | null;
}

interface DataReviewProps {
  clientId: string;
  paymentForms: PaymentForm[];
  projectId: string;
  companyId: string;
}

interface Subcontractor {
  subcontractor_id: string;
  name: string;
 
}

const DataReview: React.FC<DataReviewProps> = ({ paymentForms, clientId, projectId, companyId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [forms, setForms] = useState(paymentForms);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubcontractorModalOpen, setIsSubcontractorModalOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [subcontractorsToAdd, setSubcontractorsToAdd] = useState<(string | null)[]>([]);
  const [currentSubcontractorToAdd, setCurrentSubcontractorToAdd] = useState<(string | null)>(null);
  
  const handleFieldChange = (index: number, field: keyof PaymentForm, value: any) => {
    const updatedForms = forms.map((form, idx) =>
      idx === index ? { ...form, [field]: value } : form
    );
    setForms(updatedForms);
  };

  const handleOpenModal = (index: number) => {
    setDeleteIndex(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDeleteIndex(null);
  };

  const handleConfirmDelete = () => {
    if (deleteIndex !== null) {
      const updatedForms = forms.filter((_, idx) => idx !== deleteIndex);
      setForms(updatedForms);
    }
    handleCloseModal();
  };

  const uploadDataToSupabase = async () => {
    setIsUploading(true);
    setUploadError(null);
    const supabaseClient = createClient();
  
    // Map forms to the structure expected by your 'transactions' table
    const transactionsData = forms.map(form => ({
      project_id: projectId, // Assuming projectId is available in the component
      amount: form.amount,
      date: form.dateString,
      transaction_type: form.transactionType,
      client_id: clientId, // Use the clientId passed to the component
      description: form.description,
      categories: form.categories,
      invoice_number: form.invoice_number,
      subcontractor_id: form.subcontractor, // Make sure this is the ID, not the name
    }));
  
    try {
      const { error } = await supabaseClient
        .from('transactions') // The actual table name
        .insert(transactionsData); // Insert the array of transaction data
  
      if (error) {
        throw new Error(error.message);
      }
  
      // Replace with a more sophisticated method
      alert('Data uploaded successfully');
    } catch (error: any) {
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

// Optimized rendering of table rows
const tableRows = useMemo(() => forms.map((form, index) => (
  <tr key={index} className="hover:bg-gray-100">
    <td className="p-2 border">{form.amount}</td>
    <td className="p-2 border">{form.dateString}</td>
    {/* Transaction Type Dropdown */}
    <td className="p-2 border">
      <select
        value={form.transactionType || ''}
        onChange={(e) => handleFieldChange(index, 'transactionType', e.target.value)}
        className="p-1"
      >
        <option value="">Select Type</option>
        <option value="Revenue">Revenue</option>
        <option value="Expense">Expense</option>
      </select>
    </td>
    <td className="p-2 border">{clientId}</td>
    {/* Client ID is set for all records, no need to display it */}
    <td className="p-2 border">{form.description}</td>
    {/* Categories Dropdown */}
    <td className="p-2 border">
      <select
        value={form.categories || ''}
        onChange={(e) => handleFieldChange(index, 'categories', e.target.value)}
        className="p-1"
      >
        <option value="">Select Category</option>
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
        {/* Add more categories as needed */}
      </select>
    </td>
    <td className="p-2 border">{form.invoice_number}</td>
    <td className="p-2 border">{form.subcontractor}</td>
    <td className="p-2 border">
      <button
        aria-label="Delete record"
        onClick={() => handleOpenModal(index)}
        className="text-red-500 hover:text-red-700"
      >
        <FaTrash />
      </button>
    </td>
  </tr>
)), [forms]);

const addNewSubcontractor = async (name: string, details: string | undefined): Promise<string | null> => {
  const supabaseClient = createClient();
  const subcontractorId = uuidv4();
  const response = await supabaseClient
    .from('subcontractors')
    .insert([{ name: name, company_id: companyId, details: details, subcontractor_id: subcontractorId }]);

  if (response.error) {
    console.error('Error adding new subcontractor:', response.error);
    return null;
  }

  return subcontractorId;
};

useEffect(() => {
  fetchSubcontractors();
}, []);

// Fetch subcontractors from the database
const fetchSubcontractors = async () => {
  setIsUploading(true);
  const supabaseClient = createClient();
  const { data, error } = await supabaseClient
    .from('subcontractors')
    .select('subcontractor_id, name');

  setIsUploading(false);
  if (error) {
    console.error('Error fetching subcontractors:', error);
    setUploadError(error.message);
  } else {
    setSubcontractors(data || []);
  }
};

const handleSubcontractorData = async () => {
  setIsUploading(true);
  const newSubcontractorsToAdd: React.SetStateAction<(string | null)[]> = [];

  const fuse = new Fuse(subcontractors, { keys: ['name'], threshold: 0.3 });

  for (const form of forms) {
    if (form.transactionType === 'Revenue' || !form.subcontractor) continue;

    const exactMatch = subcontractors.find(sub => sub.name === form.subcontractor);
    if (exactMatch) {
      form.subcontractor = exactMatch.subcontractor_id;
      continue;
    }

    const fuzzyMatch = fuse.search(form.subcontractor);
    if (fuzzyMatch.length > 0 && fuzzyMatch[0].item?.subcontractor_id) {
      form.subcontractor = fuzzyMatch[0].item.subcontractor_id;
      continue;
    }

    if (!newSubcontractorsToAdd.includes(form.subcontractor)) {
      newSubcontractorsToAdd.push(form.subcontractor);
    }
  }

  setSubcontractorsToAdd(newSubcontractorsToAdd);
};

useEffect(() => {
  if (subcontractorsToAdd.length > 0) {
    setCurrentSubcontractorToAdd(subcontractorsToAdd[0]);
    setIsSubcontractorModalOpen(true);
  } else if (isUploading) {
    // Only proceed with uploading if isUploading is true indicating handleSubcontractorData has been called
    uploadDataToSupabase();
    setIsUploading(false);
  }
}, [subcontractorsToAdd]);

const SubcontractorDetailModal: React.FC<{isOpen: boolean, onClose: () => void, onSave: (name: string, details: string) => void, subcontractorName: string;}> = ({
  isOpen,
  onClose,
  onSave,
  subcontractorName,
}) => {
  const [details, setDetails] = useState('');

 

  const handleSave = () => {
    onSave(subcontractorName, details);
    setDetails('');
    onClose();
  };

  return (
    <Modal
      title={`Adding Details for: ${subcontractorName}`}
      onClose={onClose}
      onSave={handleSave}
    >
      <div>
        <input
          type="text"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Enter details"
          className="p-1"
        />
        <div className="flex justify-end space-x-2 mt-4">
          <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Save
          </button>
          <button onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

const saveSubcontractorDetails = async (name: string, details: string) => {
  const subcontractor_id = await addNewSubcontractor(name, details);
  if (subcontractor_id) {
    const newSubcontractorsToAdd = subcontractorsToAdd.filter(sub => sub !== name);
    setSubcontractorsToAdd(newSubcontractorsToAdd); // Trigger useEffect to process next or upload

    // Temporarily store the new subcontractor ID
    const newSubcontractorData = { subcontractor_id,name  };
    updateFormsSubcontractorId(newSubcontractorData); // Update forms with the new subcontractor ID
  }
};
const updateFormsSubcontractorId = ({ subcontractor_id,name  }: Subcontractor) => {
  const updatedForms = forms.map((form) => {
    if (form.subcontractor === name) {
      return { ...form, subcontractor: subcontractor_id }; // Update subcontractor field with the new ID
    }
    return form;
  });
  setForms(updatedForms); // Update state to reflect the changes
};



return (
  <div className="container mx-auto p-4">
    <h2 className="text-2xl font-bold mb-4">Data Review</h2>
    {uploadError && <p className="text-red-500">{uploadError}</p>}
    {forms.length === 0 && <p>No records to display.</p>}
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        {/* ... Table header */}
        <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Date String</th>
              <th className="p-2 border">Transaction Type</th>
              <th className="p-2 border">Client</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Categories</th>
              <th className="p-2 border">Invoice Number</th>
              <th className="p-2 border">Subcontractor</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
        <tbody>{tableRows}</tbody>
      </table>
    </div>
    <button
  onClick={handleSubcontractorData}
  disabled={isUploading}
  className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
>
  {isUploading ? 'Processing...' : 'Confirm and Process'}
</button>


{isSubcontractorModalOpen && currentSubcontractorToAdd && (
      <SubcontractorDetailModal
        isOpen={isSubcontractorModalOpen}
        onClose={() => setIsSubcontractorModalOpen(false)}
        onSave={saveSubcontractorDetails}
        subcontractorName={currentSubcontractorToAdd}
      />
    )}

    {/* Modal for delete confirmation */}
    <DeleteConfirmationModal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      onConfirm={handleConfirmDelete}
    />
  </div>
);
}
export default DataReview;
