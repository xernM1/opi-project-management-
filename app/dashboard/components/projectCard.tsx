import React, { useState, useEffect, useRef, FC } from 'react';
import Link from 'next/link';
import Card from '@/app/component/card';
import { BsThreeDotsVertical } from 'react-icons/bs';
import ProjectOverviewModal from './projectOverviewModal';
import DeleteConfirmationModal from '@/app/component/deleteConfirmationModal';
import { createClient } from '@/utils/supabase/client';

interface Project {
  project_id: string;
  name: string;
  updated_at: string | null;
}

interface ProjectCardProps {
  project: Project;
  
}

const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase= createClient();  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onProjectDeleted = (projectId:any) => {
    console.log(`Project with ID ${projectId} deleted successfully.`);
    window.location.reload(); // Refresh the page
  };
  

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .match({ project_id: project.project_id });

      if (error) throw new Error(error.message);

      onProjectDeleted(project.project_id);
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      console.error('Error deleting project:', error.message);
      setDeleteError(error.message);
    }
  };

  const openDeleteModal = () => setIsDeleteModalOpen(true);

  const formatDate = (dateString: string | null) =>
    dateString ? new Date(dateString).toLocaleDateString() : 'Date not available';

  const getInitials = (name: string) =>
    name.split(' ').map(word => word[0]).join('').toUpperCase();

  return (
    <div className="relative block">
      <Card className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
        <div className="absolute top-2 right-2">
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} aria-label="Options" className="p-1 text-gray-600 hover:text-gray-800">
            <BsThreeDotsVertical />
          </button>
          {isDropdownOpen && (
            <div ref={dropdownRef} className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit Details</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Share</a>
              <button
                onClick={openDeleteModal}
                className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        <Link href={`/projects/${project.project_id}`} passHref>
          <div 
            className="flex flex-col h-full p-4 justify-between"
            onMouseEnter={() => setIsModalVisible(true)}
            onMouseLeave={() => setIsModalVisible(false)}
          >
            <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
              <span className="text-2xl font-bold text-gray-800">{getInitials(project.name)}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <p className="text-sm text-gray-500">Last updated: {formatDate(project.updated_at)}</p>
            </div>
            {isModalVisible && <ProjectOverviewModal project={project} />}
          </div>
        </Link>
      </Card>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        message={`Are you sure you want to delete the project '${project.name}'? This action cannot be undone.`}
      />
      {deleteError && <p className="text-red-500">{deleteError}</p>}
    </div>
  );
};

export default ProjectCard;
