'use client';

import { createClient } from '@/utils/supabase/client'; // Adjust the import path as necessary
import { FaPlusCircle } from 'react-icons/fa';
import SideNavbar from '@/app/component/sideNavbar';
import ProjectSection from '../components/projectSection';
import NewProjectModal from '../components/newProjectModal';
import CompanyOverviewSection from '../components/companyOverviewSection'
import React, { useEffect, useState } from 'react';
import LoadingComponent from '@/app/component/loading';


export default function DashboardPage({ params }: { params: { id: string } }) {

    const supabase = createClient();
    
  
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
       
        const userId = params.id
        const fetchProfile = async () => {
          if (userId) {
            try {
              setLoading(true);
    
              const { data: profile, error } = await supabase
                .from('profile')
                .select('company_id')
                .eq('id', userId)
                .single();
    
              if (error) {
                throw error;
              }
    
              setCompanyId(profile?.company_id || null);
            } catch (error) {
              console.error('Error:', error);
            } finally {
              setLoading(false);
            }
          }
        };
    
        fetchProfile();
    
}, [params]);

      const closeModal = (): void => setIsNewProjectModalOpen(false);
      if (loading) {
        return <LoadingComponent/>;
      }
      return (
        <div className="flex h-screen bg-gray-100">
          {/* Sidebar */}
          <div className="z-10">
            <SideNavbar companyId={companyId} />
          </div>
    
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto relative">
            <div className="m-8">
              <CompanyOverviewSection companyId={companyId} />
              <ProjectSection companyId={companyId} />
    
              {/* Floating Action Button */}
              <button
                onClick={() => setIsNewProjectModalOpen(true)}
                className="fixed right-8 bottom-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out"
                aria-label="New Project"
              >
                <FaPlusCircle size={24} />
              </button>
    
              {/* Render the NewProjectModal if it's open */}
              {isNewProjectModalOpen && (
                <div className="fixed inset-0 z-20">
                  <NewProjectModal onClose={closeModal} companyId={companyId} />
                </div>
              )}
            </div>
          </main>
        </div>
      );
    };