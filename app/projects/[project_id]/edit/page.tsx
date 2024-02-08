'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FaArrowLeft ,FaSpinner, FaSave, FaPlus, FaMinus } from 'react-icons/fa';
import LoadingComponent from '@/app/component/loading';
import {v4 as uuidv4} from 'uuid'
import { useRouter } from 'next/navigation';
// Supabase Client
const supabase = createClient();

// Interfaces
interface Project {
    project_id: string;
    client_id?: string;
    company_id?: string;
    description?: string;
    end_date?: string;
    name: string;
    start_date?: string;
    status?: string;
    updated_at?: string;
}

interface BudgetDetail {
    allocated_amount?: number|null;
    budget_id?: string;
    change_order_impact?: string;
    description?: string;
    detail_id: string;
    project_id?: string;
    section_name?: string;
}

interface BudgetSection {
    section_name: string;
    details: BudgetDetail[];
}

// ProjectEditPage Component
const ProjectEditPage = ({ params }: { params: { project_id: string } }) => {
    const [project, setProject] = useState<Project | null>(null);
    const [budgetSections, setBudgetSections] = useState<BudgetSection[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter()

    const fetchProjectDetails = async () => {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('project_id', params.project_id)
            .single();
        
        if (error) {
            console.error('Error fetching project details:', error.message || error);
            setError(error.message || String(error));
            return null;
        }
    
        return data;
    };

    const fetchBudgetIdsForProject = async (projectId: any) => {
        const { data, error } = await supabase
            .from('budgets')
            .select('budget_id')
            .eq('project_id', projectId);
    
        if (error) {
            console.error('Error fetching budgets:', error.message || error);
            setError(error.message || String(error));
            return [];
        }
    
        return data.map(budget => budget.budget_id);
    };
    
    const fetchBudgetDetails = async (budgetIds: string[]): Promise<BudgetDetail[]> => {
        if (budgetIds.length === 0) return [];
    
        const { data, error } = await supabase
            .from('budget_details')
            .select('*')
            .in('budget_id', budgetIds); // Corrected to use `.in`
    
        if (error) {
            console.error('Error fetching budget details:', error.message || error);
            setError(error.message || String(error));
            return [];
        }
    
        return data;
    };
    

    const groupBudgetDetailsBySection = (budgetDetails: any[]) => {
        return budgetDetails.reduce((acc, detail) => {
            if (!acc[detail.section_name]) {
                acc[detail.section_name] = {
                    section_name: detail.section_name,
                    details: []
                };
            }
            acc[detail.section_name].details.push(detail);
            return acc;
        }, {});
    };

    useEffect(() => {
        const fetchProjectAndBudgetDetails = async () => {
            setLoading(true);
            try {
                const projectData = await fetchProjectDetails();
                if (projectData) {
                    setProject(projectData);
                }
    
                const budgetIds = await fetchBudgetIdsForProject(params.project_id);
                if (budgetIds.length > 0) {
                    const budgetDetailsData = await fetchBudgetDetails(budgetIds);
                    const groupedBySection = groupBudgetDetailsBySection(budgetDetailsData);
                    setBudgetSections(Object.values(groupedBySection));
                }
            } catch (error) {
                console.error('Error in fetching data:', error);
                setError(error instanceof Error ? error.message : String(error));
            } finally {
                setLoading(false);
            }
        };
    
        fetchProjectAndBudgetDetails();
    }, [params.project_id]);
    
    
    
    

    const handleProjectUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('projects')
                .update(project)
                .eq('project_id', project.project_id);

            if (error){
                console.log(error) 
                throw error;
            }
            
        } catch (error: any) {
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            setLoading(false);
        }
    };

    const handleBudgetUpdate = async (e: React.MouseEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            for (const section of budgetSections) {
                for (const detail of section.details) {
                    const { error } = await supabase
                        .from('budget_details')
                        .upsert(detail)
                        .eq('detail_id', detail.detail_id);

                    if (error) throw error;
                }
            }
            alert('Budget details updated successfully.');
        } catch (error: any) {
            console.log(error)
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, sectionIndex?: number, detailIndex?: number, field?: keyof BudgetDetail) => {
        const { name, value } = e.target;
    
        // If the change is for project details
        if (project && !name.startsWith('section_') && sectionIndex === undefined && detailIndex === undefined) {
            setProject({ ...project, [name]: value });
        } 
        // If the change is for budget details
        else if (sectionIndex !== undefined && detailIndex !== undefined && field) {
            const updatedSections = [...budgetSections];
            updatedSections[sectionIndex].details[detailIndex] = {
                ...updatedSections[sectionIndex].details[detailIndex],
                [field]: value
            };
            setBudgetSections(updatedSections);
        }
    };
    

    const addNewSection = () => {
        const newSection: BudgetSection = {
            section_name: '',
            details: [{ allocated_amount: null, description: '', detail_id: uuidv4(), change_order_impact: '' }]
        };
        setBudgetSections([...budgetSections, newSection]);
    };

    const removeSection = (sectionIndex: number) => {
        const updatedSections = budgetSections.filter((_, index) => index !== sectionIndex);
        setBudgetSections(updatedSections);
    };

    // Function to add a new detail to a specific section
    const addDetailToSection = (sectionIndex: number) => {
        const newDetail: BudgetDetail = {
            allocated_amount: null,
            description: '',
            detail_id: uuidv4(),
            change_order_impact: ''
        };
        const updatedSections = budgetSections.map((section, index) =>
            index === sectionIndex ? { ...section, details: [...section.details, newDetail] } : section
        );
        setBudgetSections(updatedSections);
    };

    // Function to remove a detail from a specific section
    const removeDetailFromSection = (sectionIndex: number, detailIndex: number) => {
        const updatedSections = budgetSections.map((section, index) => {
            if (index === sectionIndex) {
                const newDetails = section.details.filter((_, idx) => idx !== detailIndex);
                return { ...section, details: newDetails };
            }
            return section;
        });
        setBudgetSections(updatedSections);
    };
    
    if (loading) return <LoadingComponent />;
   
    if (!project || !budgetSections) return <div>No data found</div>;

return (
<div className="max-w-5xl mx-auto p-8 space-y-10 bg-gray-50">
<button
      onClick={router.back}
      className="flex items-center justify-center text-gray-600 hover:text-gray-800 focus:outline-none"
    >
      <FaArrowLeft size={20} />
      <span className="ml-2">Back</span>
    </button>
    <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Edit Project Details</h2>
        <form onSubmit={handleProjectUpdate} className="grid grid-cols-1 gap-y-6">
            <label htmlFor="project_name" className="block text-sm font-medium text-gray-700">Project Name</label>
            <input 
                type="text" 
                id="project_name" 
                name="name" 
                value={project.name || ''} 
                onChange={handleInputChange} 
                className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
            />

            <label htmlFor="project_description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea 
                id="project_description" 
                name="description" 
                value={project.description || ''} 
                onChange={handleInputChange} 
                rows={3}
                className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />

            <label htmlFor="project_start_date" className="block text-sm font-medium text-gray-700">Start Date</label>
            <input 
                type="date" 
                id="project_start_date" 
                name="start_date" 
                value={project.start_date || ''} 
                onChange={handleInputChange} 
                className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />

            <label htmlFor="project_end_date" className="block text-sm font-medium text-gray-700">End Date</label>
            <input 
                type="date" 
                id="project_end_date" 
                name="end_date" 
                value={project.end_date || ''} 
                onChange={handleInputChange} 
                className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />

            <label htmlFor="project_status" className="block text-sm font-medium text-gray-700">Status</label>
            <select 
                id="project_status" 
                name="status" 
                value={project.status || ''} 
                onChange={handleInputChange} 
                className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="">Select Status</option>
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
            </select>

            <button type="submit" className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Save Project Details
            </button>
        </form>
    </section>

    <section className="bg-white p-6 rounded-lg shadow-md">
  <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Budget Details</h2>
  {budgetSections.map((section, sectionIndex) => (
    <div key={section.section_name} className="mb-8 p-4 bg-gray-50 rounded-md">
      <div className="flex items-center justify-between mb-4">
        <input 
          type="text" 
          id={`section_name_${sectionIndex}`} 
          name="section_name" 
          value={section.section_name} 
          onChange={(e) => handleInputChange(e, sectionIndex)} 
          placeholder="Section Name"
          className="mt-1 flex-1 block w-full px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:outline-none" 
          required
        />
        <button 
          type="button"
          onClick={() => removeSection(sectionIndex)} 
          className="ml-4 text-red-500 hover:text-red-600 focus:outline-none">
          <FaMinus size={16} />
        </button>
      </div>

      {section.details.map((detail, detailIndex) => (
        <div key={detail.detail_id} className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <input 
            type="number" 
            id={`detail_amount_${detailIndex}`} 
            name="allocated_amount" 
            value={detail.allocated_amount || ''} 
            onChange={(e) => handleInputChange(e, sectionIndex, detailIndex, 'allocated_amount')} 
            className="mt-1 block w-full px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:outline-none" 
            placeholder="Amount"
          />
          <input 
            type="text" 
            id={`detail_description_${detailIndex}`} 
            name="description" 
            value={detail.description || ''} 
            onChange={(e) => handleInputChange(e, sectionIndex, detailIndex, 'description')} 
            className="mt-1 block w-full px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:outline-none" 
            placeholder="Description"
          />
          <button 
            type="button"
            onClick={() => removeDetailFromSection(sectionIndex, detailIndex)} 
            className="text-red-500 hover:text-red-600 focus:outline-none">
            <FaMinus size={16} />
          </button>
        </div>
      ))}

      <button 
        type="button"
        onClick={() => addDetailToSection(sectionIndex)} 
        className="text-green-500 hover:text-green-600 focus:outline-none">
        <FaPlus size={20} />
      </button>
    </div>
  ))}

  <div className="flex justify-between items-center mt-8">
    <button 
      type="button"
      onClick={addNewSection} 
      className="text-green-500 hover:text-green-600 focus:outline-none">
      <FaPlus size={20} />
    </button>

    <button 
      type="button"
      onClick={handleBudgetUpdate} 
      className="text-blue-600 hover:text-blue-700 focus:outline-none">
      <FaSave size={20} />
    </button>
  </div>
</section>


</div>
);

    
};

export default ProjectEditPage;


