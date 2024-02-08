// ProjectOverviewModal.tsx
import React from 'react';

interface ProjectOverviewModalProps {
  project: {
    name: string;
    // Add other project properties you want to display in the modal
  };
}

const ProjectOverviewModal: React.FC<ProjectOverviewModalProps> = ({ project }) => {
  return (
    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 p-4 bg-white rounded-lg shadow-md">
      <p className="font-semibold">{project.name}</p>
      {/* Add other project details here */}
    </div>
  );
};

export default ProjectOverviewModal;
