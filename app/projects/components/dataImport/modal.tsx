import React, { ReactNode } from 'react';

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSave: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose, onSave }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white rounded shadow-lg w-1/3">
        <div className="border-b px-4 py-2 flex justify-between items-center">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-black close-modal">&times;</button>
        </div>
        <div className="p-4">
          {children}
        </div>
        <div className="flex justify-end items-center w-100 border-t p-3">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-900 rounded px-4 py-2 mr-2 hover:bg-gray-400"
          >
            Close
          </button>
          <button
            onClick={onSave}
            className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
