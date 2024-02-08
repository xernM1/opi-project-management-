import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client'; // Adjust the path as necessary
import ProjectCard from './projectCard';
import Section from '@/app/component/section';
// Define the Project type based on your data structure
interface Project {
  project_id: string;
  name: string;
  updated_at:string| null;
  // Add other project fields here
}

interface ProjectSectionProps {
  companyId: string| null;
}

const ProjectSection: React.FC<ProjectSectionProps> = ({ companyId }) => {

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  useEffect(() => {
    const fetchProjects = async () => {
      if (!companyId) {
        setError('Company ID is not available');
        setLoading(false);
        return;
      }
      try {
        let { data, error } = await supabase.
        from('projects').
        select('project_id, name, updated_at')
        .eq('company_id', companyId);
        
        if (error) {
          throw error;
        }

        setProjects(data || []);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  },  [companyId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <Section title="Projects"><p>{error}</p></Section>;
  }

  if (projects.length === 0) {
    return <Section title="Projects"><p>No projects available.</p></Section>;
  }

  return (
    <Section title="Projects">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.project_id} project={project} />
        ))}
      </div>
    </Section>
  );
};

export default ProjectSection;
