"use client";
import React, { useState, useEffect } from 'react';
import ProjectHeader from '../components/projectHeader';
import FinancialDashboard from '../components/FinancialDashboard';
import TransactionHistory from '../components/TransactionHistory';
import ActionModal from '../components/ActionModal';
import PaymentProcess from '../components/paymentProcess';
import AdditionalCosts from '../components/AdditionalCosts';
import SideNavbar from '@/app/component/sideNavbar';
import { FaBars } from 'react-icons/fa';
import { createClient } from '@/utils/supabase/client';
import LoadingComponent from '@/app/component/loading';
import { useRouter } from 'next/navigation';

const ProjectPage = ({ params }: { params: { project_id: string } }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAdditionalCostsModal, setShowAdditionalCostsModal] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const router =useRouter();
  useEffect(() => {
    const fetchData = async () => {
      if (params.project_id) {
        await fetchClientIdFromProject(params.project_id);
      } else {
        setError('Project ID not found.');
      }
    };
    fetchData();
  }, [params.project_id]);

  const fetchClientIdFromProject = async (projectId: string) => {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('client_id , company_id')
        .eq('project_id', projectId)
        .single();

      if (error) throw error;
      setClientId(data.client_id);
      setCompanyId(data.company_id);
      setIsLoading(false);
    } catch (error) {
      setError(`Error fetching client ID: ${error}`);
      setIsLoading(false);
    }
  };

  const handleAddPayment = () => {
    setShowPaymentModal(true);
    setIsModalOpen(false); // Close the action modal
  };

  const handleAddChangeOrder = () => {
    setShowAdditionalCostsModal(true);
    setIsModalOpen(false); // Close the action modal
  };

  const onEditProjectDetails = () =>{
    router.push(window.location.href+ '/edit')
  }
  if (isLoading) {
    return <LoadingComponent/>
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <SideNavbar companyId={companyId} />
      <main className="flex-1 overflow-y-auto p-8">
        <ProjectHeader projectId={params.project_id} />
        <FinancialDashboard projectId={params.project_id} />
        <TransactionHistory projectId={params.project_id} />

        {/* Action Modal Trigger Button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-10 right-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        >
          <FaBars />
        </button>

        {isModalOpen && (
          <ActionModal 
            onClose={() => setIsModalOpen(false)}
            onRecordPayment={handleAddPayment}
            onAddChangeOrder={handleAddChangeOrder}
            onGenerateReport={() => {}}
            onAddDailyReport={() => {}}
            onEditProjectDetails={onEditProjectDetails}
            isOpen={isModalOpen}
          />
        )}

        {showPaymentModal && (
          <PaymentProcess
            projectId={params.project_id} 
            companyId={companyId|| ''}
            clientId={clientId || ''}
            isVisible={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
          />
        )}

        {showAdditionalCostsModal && (
          <AdditionalCosts 
            projectId={params.project_id} 
            onClose={() => setShowAdditionalCostsModal(false)} 
          />
        )}
      </main>
    </div>
  );
};

export default ProjectPage;
