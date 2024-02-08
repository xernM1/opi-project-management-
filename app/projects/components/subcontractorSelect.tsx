import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Subcontractor {
  name: string;
  details?: string | null;
  subcontractor_id: string;
}

interface SubcontractorSelectProps {
  onChange: (subcontractorId: string, isNew: boolean, newName?: string, newDetails?: string) => void;
}

const SubcontractorSelect: React.FC<SubcontractorSelectProps> = ({ onChange }) => {
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [isNewSubcontractor, setIsNewSubcontractor] = useState(false);
  const [newSubcontractorName, setNewSubcontractorName] = useState('');
  const [newSubcontractorDetails, setNewSubcontractorDetails] = useState('');
  const supabase= createClient()
  useEffect(() => {
    fetchSubcontractors();
  }, []);

  const fetchSubcontractors = async () => {
    try {
      const { data, error } = await supabase.from('subcontractors').select('*');
      if (error) throw error;
      setSubcontractors(data || []);
    } catch (error) {
      console.error('Error fetching subcontractors:', error);
      // Additional UI error handling can be implemented here
    }
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    const isAddingNew = selectedValue === 'new';
    setIsNewSubcontractor(isAddingNew);
    if (!isAddingNew) {
      onChange(selectedValue, false);
    }
  };

  const handleNewSubcontractorInput = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value, name } = event.target;
    if (name === 'name') {
      setNewSubcontractorName(value);
    } else {
      setNewSubcontractorDetails(value);
    }
    if (isNewSubcontractor) {
      onChange('', true, newSubcontractorName, newSubcontractorDetails);
    }
  };

  return (
    <div>
      {/* Subcontractor selection dropdown */}
      <label htmlFor="subcontractorSelect" className="block text-sm font-medium text-gray-700">
        Subcontractor
      </label>
      <select
        id="subcontractorSelect"
        name="subcontractorSelect"
        onChange={handleSelectChange}
        className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        defaultValue=""
      >
        <option value="">Select a subcontractor</option>
        {subcontractors.map((subcontractor) => (
          <option key={subcontractor.subcontractor_id} value={subcontractor.subcontractor_id}>
            {subcontractor.name}
          </option>
        ))}
        <option value="new">Add New Subcontractor</option>
      </select>

      {/* New subcontractor input fields */}
      {isNewSubcontractor && (
        <div className="mt-3">
          <input
            name="name"
            type="text"
            value={newSubcontractorName}
            onChange={handleNewSubcontractorInput}
            placeholder="Enter New Subcontractor Name"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <textarea
            name="details"
            value={newSubcontractorDetails}
            onChange={handleNewSubcontractorInput}
            placeholder="Enter New Subcontractor Details"
            className="mt-3 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
          />
        </div>
      )}
    </div>
  );
};

export default SubcontractorSelect;
