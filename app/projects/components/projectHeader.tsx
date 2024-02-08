import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';// Update the path accordingly

interface ProjectHeaderProps {
  projectId: string;
}

interface Project {
  name: string;
  description: string | null;
  status: string | null;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ projectId }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase= createClient()
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError('Project ID is missing');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('name, description, status')
          .eq('project_id', projectId)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) return <div className="text-center">Loading project details...</div>;
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;
  if (!project) return <div className="text-center">No project data found.</div>;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h1 className="text-3xl font-semibold mb-4">{project.name}</h1>
      <p className="text-gray-600 text-sm mb-3">
        {project.description || 'No description available'}
      </p>
      <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${getStatusClass(project.status)}`}>
        {project.status || 'Status Unavailable'}
      </span>
    </div>
  );
  
};

const getStatusClass = (status: string | null) => {
  switch (status) {
    case 'in_progress':
      return 'bg-green-500 text-white';
    case 'Completed':
      return 'bg-blue-500 text-white';
    case 'planning':
      return 'bg-yellow-500 text-black';
    default:
      return 'bg-gray-300 text-black';
  }
};

export default ProjectHeader;
