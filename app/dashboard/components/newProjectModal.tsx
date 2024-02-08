import React, { useState, useEffect, useRef } from 'react';
import ProjectDetails from './projectDetails';
import ClientDetails from './clientDetails';
import BudgetDetails from './budgetDetails';
import ReviewDetails from './reviewDetails';

// Define interfaces for the data structures
interface Client {
  client_id?: string; // made optional for insert
  name: string;
  address?: string | null;
  contact_info?: string | null;
  company_id?: string | null; // added as per schema
}

interface Project {
  project_id?: string; // made optional for insert
  client_id?: string | null; // made optional for insert
  company_id?: string | null; // added as per schema
  description?: string | null;
  end_date?: string | null;
  name: string;
  start_date?: string | null;
  status?: string | null;
  updated_at?: string | null; // added as per schema
}

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

interface NewProjectModalProps {
  onClose: () => void;
  companyId: string | null; // Add the companyId prop
}

const NewProjectModal = ({ onClose, companyId }: NewProjectModalProps) => {
  
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [clientData, setClientData] = useState<Client | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetSection[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleOutsideClick = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose(); // Call the passed onClose function to close the modal
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Handlers for each step
  const handleProjectDetailsSubmit = (data: Project) => {
    setProjectData(data);
    setCurrentStep(currentStep + 1);
  };

  const handleClientDetailsSubmit = (data: Client) => {
    setClientData(data);
    setCurrentStep(currentStep + 1);
  };

  const handleBudgetDetailsSubmit = (data: BudgetSection[]) => {
    setBudgetData(data);
    setCurrentStep(currentStep + 1);
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);


  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-10">
    <div
      ref={modalRef}
      className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg z-20 overflow-y-auto max-h-96"
    >
    {currentStep === 1 && (
          <ProjectDetails onDetailsChange={handleProjectDetailsSubmit} />
        )}
        {currentStep === 2 && (
          <ClientDetails onSaveClient={handleClientDetailsSubmit} />
        )}
        {currentStep === 3 && (
          <BudgetDetails onBudgetDetailsSubmit={handleBudgetDetailsSubmit} />
        )}
        {currentStep === 4 && projectData && clientData && (
          <ReviewDetails
            project={projectData}
            client={clientData}
            budgetSections={budgetData}
            companyId={companyId} 
            onSubmitError={(error: string) => console.error('Submit Error', error)}
          />
        )}
        <div className="mt-4">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
            >
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewProjectModal;
