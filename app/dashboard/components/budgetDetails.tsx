import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';



interface BudgetDetail {
  allocated_amount?: number | null
  budget_id?: string | null
  change_order_impact?: string | null
  description?: string | null
  detail_id?: string
  project_id?: string | null
  section_name?: string | null
}

interface BudgetSection {
  section_name: string;
  details: BudgetDetail[];
}

interface BudgetDetailsProps {
  onBudgetDetailsSubmit: (sections: BudgetSection[]) => void;
}

const BudgetDetails: React.FC<BudgetDetailsProps> = ({ onBudgetDetailsSubmit }) => {
  const [sections, setSections] = useState<BudgetSection[]>([{
    section_name: '',
    details: [{ allocated_amount: null, description: '', detail_id: uuidv4() }]
  }]);

  const handleSectionNameChange = (sectionIndex: number, name: string) => {
    const updatedSections = sections.map((section, index) =>
      index === sectionIndex ? { ...section, section_name: name } : section
    );
    setSections(updatedSections);
  };

  const handleDetailChange = (
    sectionIndex: number, 
    detailIndex: number, 
    field: keyof BudgetDetail, 
    value: string | number | null) => {
     const updatedSections = sections.map((section, sIndex) => {
    if (sIndex === sectionIndex) {
      const updatedDetails = section.details.map((detail, dIndex) => {
        if (dIndex === detailIndex) {
          return { 
            ...detail, 
            [field]: field === 'allocated_amount' ? (value === '' ? null : Number(value)) : value 
          };
        }
        return detail;
      });
      return { ...section, details: updatedDetails };
    }
    return section;
  });
  setSections(updatedSections);
  };

  const addDetailToSection = (sectionIndex: number) => {
    const updatedSections = sections.map((section, index) =>
      index === sectionIndex ? { ...section, details: [...section.details, { allocated_amount: null, description: '', detail_id: uuidv4() }] } : section
    );
    setSections(updatedSections);
  };

  const removeDetailFromSection = (sectionIndex: number, detailIndex: number) => {
    const updatedSections = sections.map((section, index) => {
      if (index === sectionIndex) {
        const newDetails = section.details.filter((_, idx) => idx !== detailIndex);
        return { ...section, details: newDetails };
      }
      return section;
    });
    setSections(updatedSections);
  };

  const addNewSection = () => {
    setSections([...sections, { section_name: '', details: [{ allocated_amount: null, description: '', detail_id: uuidv4() }] }]);
  };

  const removeSection = (sectionIndex: number) => {
    const updatedSections = sections.filter((_, index) => index !== sectionIndex);
    setSections(updatedSections);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBudgetDetailsSubmit(sections);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-4 p-4 border border-gray-300 rounded-md">
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Section Name"
              value={section.section_name}
              onChange={(e) => handleSectionNameChange(sectionIndex, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <button onClick={() => removeSection(sectionIndex)} className="ml-2 text-red-500 hover:text-red-700">
              <FaTrash />
            </button>
          </div>
          {section.details.map((detail, detailIndex) => (
            <div key={detail.detail_id} className="flex items-center space-x-4">
          <input
            type="number"
            placeholder="Allocated Amount"
            value={detail.allocated_amount != null ? detail.allocated_amount.toString() : ''}
            onChange={(e) => handleDetailChange(sectionIndex, detailIndex, 'allocated_amount', e.target.value === '' ? null : Number(e.target.value))}
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md"
          />

          <input
            type="text"
            placeholder="Description"
            value={detail.description ?? ''}  // Providing a fallback value
            onChange={(e) => handleDetailChange(sectionIndex, detailIndex, 'description', e.target.value)}
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md"
          />
              <button onClick={() => removeDetailFromSection(sectionIndex, detailIndex)} className="text-red-500 hover:text-red-700">
                <FaMinus />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addDetailToSection(sectionIndex)}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Detail
          </button>
        </div>
      ))}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={addNewSection}
          className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center"
        >
          <FaPlus className="mr-2" />
          Add Section
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center"
        >
          Submit Budget Details
        </button>
      </div>
    </form>
  );
};

export default BudgetDetails;
