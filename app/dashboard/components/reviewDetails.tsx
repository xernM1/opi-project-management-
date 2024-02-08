import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FaUser, FaProjectDiagram, FaWallet, FaDatabase } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

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

interface ReviewDetailsProps {
  project: Project;
  client: Client;
  companyId: string | null;
  budgetSections: BudgetSection[];
  onSubmitError: (error: string) => void;
}

const ReviewDetails: React.FC<ReviewDetailsProps> = ({
  project,
  client,
  companyId,
  budgetSections,
  onSubmitError
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State to control success modal visibility
  useEffect(() => {
    return () => {
      setIsCancelled(true);
    };
  }, []);

  const supabase = createClient()
  const router= useRouter()

  const submitClientDetails = async (client: Client, companyId: string | null) => {
    try {
      const clientId = uuidv4();
      const clientWithIdAndCompanyId = { ...client, client_id: clientId, company_id: companyId };
  
      const response = await supabase.from('clients').insert([clientWithIdAndCompanyId]);
    
      console.log('Supabase response for client submission:', response);
  
      if (response.error) {
        console.error('Supabase error response:', response.error);
        throw new Error('Error submitting client data: ' + response.error.message);
      }
      
      // Optionally, you can also log the successful response for debugging
      console.log('Successful response:', response.data);
      
      return clientId;  // or appropriate success return
      
  

    } catch (error) {
      console.error('Error in submitClientDetails:', error);
      throw error; // This gets executed even when client data is added
    }
  };
  
  
  
  
  const submitProjectDetails = async (clientId: string, project: Project, companyId: string | null) => {
    try {
      const projectId = uuidv4();
      const projectWithIdsAndCompanyId = { ...project, client_id: clientId, project_id: projectId, company_id: companyId };
  
      const projectResponse = await supabase.from('projects').insert([projectWithIdsAndCompanyId]);
        if (projectResponse.error) {
            console.error('Supabase error response:', projectResponse.error);
            throw new Error('Error submitting project data: ' + projectResponse.error.message);
        }
        console.log('Project details submitted:', projectResponse.data);
        return projectId;  // Return the generated project_id
    } catch (error) {
        console.error('Error in submitProjectDetails:', error);
        throw error;
    }
};

  
  
const submitBudgetDetails = async (projectId: string, budgetSections: BudgetSection[]) => {
  try {
    console.log('Submitting budget details...');
    const commonBudgetId = uuidv4();
    let totalAllocatedAmount = 0;

    // Calculate total allocated amount
    budgetSections.forEach(section => {
      section.details.forEach(detail => {
        totalAllocatedAmount += detail.allocated_amount || 0;
      });
    });

    // Create budget record first
    const budgetInsertResponse = await supabase.from('budgets').insert({
      budget_id: commonBudgetId,
      project_id: projectId,
      initial_budget: totalAllocatedAmount,
      revised_budget: null,
      date_of_revision: null
    });

    if (budgetInsertResponse.error) {
      throw new Error('Error creating budget record: ' + budgetInsertResponse.error.message);
    }

    // Then insert budget details
    for (const section of budgetSections) {
      const budgetDetails = section.details.map(detail => ({
        ...detail,
        detail_id: detail.detail_id || uuidv4(),
        section_name: section.section_name,
        budget_id: commonBudgetId
      }));

      const detailsInsertResponse = await supabase.from('budget_details').insert(budgetDetails);
      if (detailsInsertResponse.error) {
        throw new Error('Error submitting budget details: ' + detailsInsertResponse.error.message);
      }
    }

    console.log('Budget details submitted successfully.');
  } catch (error) {
    console.error('Error in submitBudgetDetails:', error);
    throw error;
  }
};



  
  const validateData = () => {
    // Add validation logic here
    if (!project.name || !project.description || !project.start_date || !project.status) {
      toast.warn('Project details are incomplete.');
      return false;
    }

    if (!client.name) {
      toast.warn('Client name is required.');
      return false;
    }

    for (const section of budgetSections) {
      if (!section.section_name || section.details.some(detail => detail.allocated_amount === null || !detail.description)) {
        toast.warn('Budget details are incomplete.');
        return false;
      }
    }

    return true;
  };

  const onSubmitSuccess = () => {
    // Notify the user about the successful submission
    toast.success('Data submitted successfully. Thank you!');
  
    // Refresh the page after showing the success message
    router.refresh();
  };

  const handleSubmit = async () => {
    if (!validateData()) {
      toast.error("Please fill in all required fields.");
      return;
    }
  
    try {
      setIsSubmitting(true);
      const clientId = await submitClientDetails(client, companyId);
      const projectId = await submitProjectDetails(clientId, project, companyId);
      await submitBudgetDetails(projectId, budgetSections);
      onSubmitSuccess();
      toast.success('Data submitted successfully. Thank you!');
      
    } catch (error) {
      if (!isCancelled) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        onSubmitError(errorMessage);
        toast.error(`Error: ${errorMessage}. Please try again or contact support.`);
      }
    } finally {
      if (!isCancelled) setIsSubmitting(false);
    }
  };
  

  return (
    <div className="space-y-4 p-4 bg-white rounded-md shadow">
      <ToastContainer />
      <h2 className="text-xl font-semibold text-gray-800 flex items-center">
        <FaDatabase className="mr-2" />Review and Submit
      </h2>

      <section aria-labelledby="project-details" className="border p-4 rounded-lg shadow-sm">
        <h3 id="project-details" className="text-lg font-semibold text-gray-700 flex items-center">
          <FaProjectDiagram className="mr-2" />Project Details
        </h3>
        <div className="space-y-2">
          <p><strong>Name:</strong> {project.name}</p>
          <p><strong>Description:</strong> {project.description}</p>
          <p><strong>Start Date:</strong> {project.start_date}</p>
          <p><strong>End Date:</strong> {project.end_date || 'N/A'}</p>
          <p><strong>Status:</strong> {project.status}</p>
        </div>
      </section>

      <section aria-labelledby="client-details" className="border p-4 rounded-lg shadow-sm">
        <h3 id="client-details" className="text-lg font-semibold text-gray-700 flex items-center">
          <FaUser className="mr-2" />Client Details
        </h3>
        <div className="space-y-2">
          <p><strong>Name:</strong> {client.name}</p>
          <p><strong>Address:</strong> {client.address || 'N/A'}</p>
          <p><strong>Contact Info:</strong> {client.contact_info || 'N/A'}</p>
        </div>
      </section>

      <section aria-labelledby="budget-details" className="border p-4 rounded-lg shadow-sm">
        <h3 id="budget-details" className="text-lg font-semibold text-gray-700 flex items-center">
          <FaWallet className="mr-2" />Budget Details
        </h3>
        {budgetSections.map((section, index) => (
          <div key={index} className="mt-2">
            <h4 className="text-md font-semibold">{section.section_name}</h4>
            {section.details.map((detail, detailIndex) => (
              <div key={detailIndex} className="space-y-1">
                <p>Amount: {detail.allocated_amount?.toFixed(2) || 'Not Specified'}</p>
                <p>Description: {detail.description || 'No Description'}</p>
              </div>
            ))}
          </div>
        ))}
      </section>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center ${isSubmitting ? 'cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? (
          <>
            <FaDatabase className="animate-spin mr-2" />
            Submitting...
          </>
        ) : (
          'Submit '
        )}
      </button>
    </div>
  );
};

export default ReviewDetails;