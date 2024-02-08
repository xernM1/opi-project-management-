import React, { useEffect, useRef } from 'react';
import { FaMoneyBillWave, FaExchangeAlt, FaRegListAlt, FaEdit, FaFileAlt } from 'react-icons/fa';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordPayment: () => void;
  onAddChangeOrder: () => void;
  onAddDailyReport: () => void;
  onEditProjectDetails: () => void;
  onGenerateReport: () => void;
}

const ActionModal: React.FC<ActionModalProps> = ({
  isOpen, onClose, onRecordPayment, onAddChangeOrder, onAddDailyReport, onEditProjectDetails, onGenerateReport
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
<div className={`fixed inset-0 bg-transparent overflow-y-auto h-full w-full z-50 flex justify-end items-end  'opacity-100' : 'opacity-0'} transition-opacity duration-500 ease-in-out`}>
    <div ref={modalRef} className="bg-white bg-opacity-90 p-4 rounded-lg shadow-lg w-1/5 h-auto absolute bottom-8 right-0 mb-12 mr-4 transition-all duration-500 ease-in-out transform">
      <ul className="space-y-4 flex flex-col justify-between h-full">
      <li className="flex items-center justify-between cursor-pointer" onClick={onRecordPayment}>
        <FaMoneyBillWave className="mr-2 text-2xl" />
        <span>Record Payment</span>
      </li>
      <li className="flex items-center justify-between cursor-pointer" onClick={onAddChangeOrder}>
        <FaExchangeAlt className="mr-2 text-2xl" />
        <span>Add Change Order</span>
      </li>
      <li className="flex items-center justify-between cursor-pointer" onClick={onAddDailyReport}>
        <FaRegListAlt className="mr-2 text-2xl" />
        <span>Add Daily Report</span>
      </li>
      <li className="flex items-center justify-between cursor-pointer" onClick={onEditProjectDetails}>
        <FaEdit className="mr-2 text-2xl" />
        <span>Edit Project Details</span>
      </li>
      <li className="flex items-center justify-between cursor-pointer" onClick={onGenerateReport}>
        <FaFileAlt className="mr-2 text-2xl" />
        <span>Generate Report</span>
      </li>
    </ul>
  </div>
</div>

  );
};

export default ActionModal;
