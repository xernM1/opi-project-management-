import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FaUser, FaAddressBook, FaPhone, FaSave } from 'react-icons/fa';

interface Client {
  client_id?: string; // made optional for insert
  name: string;
  address?: string | null;
  contact_info?: string | null;
  company_id?: string | null; // added as per schema
}

interface ClientDetailsProps {
  onSaveClient: (client: Client) => void;
}
const supabase = createClient();

const ClientDetails: React.FC<ClientDetailsProps> = ({ onSaveClient }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [newClient, setNewClient] = useState<Client>({ client_id: '', name: '', address: '', contact_info: '' });
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isFormValid, setIsFormValid] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase.from('clients').select('*');
      if (error) {
        console.error('Error fetching clients:', error);
        return;
      }
      setClients(data || []);
    };

    fetchClients();
  }, []);

  useEffect(() => {
    const validateForm = () => {
      if (selectedClientId) {
        setIsFormValid(true);
      } else {
        setIsFormValid(!!newClient.name); // Simple validation: name field must not be empty
      }
    };

    validateForm();
  }, [newClient, selectedClientId]);

  const handleClientSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClientId(e.target.value);
  };

  const handleNewClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewClient({ ...newClient, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return; // Prevent submission if form is invalid

    if (selectedClientId) {
      const selectedClient = clients.find(client => client.client_id === selectedClientId);
      if (selectedClient) onSaveClient(selectedClient);
    } else {
      // If it's a new client (no client selected), use newClient data
      onSaveClient(newClient);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label htmlFor="existingClient" className="flex items-center text-lg font-medium text-gray-700 mb-2">
          <FaUser className="mr-2" />
          Existing Client
        </label>
        <select
          id="existingClient"
          value={selectedClientId}
          onChange={handleClientSelectChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          aria-describedby="existingClientHelp"
        >
          <option value="">Select an existing client</option>
          {clients.map(client => (
            <option key={client.client_id} value={client.client_id}>{client.name}</option>
          ))}
        </select>
        <p id="existingClientHelp" className="text-sm text-gray-500 mt-1">Choose a client from your database</p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm text-gray-500">Or enter new client details:</p>

        <div className="mt-4">
          <label htmlFor="name" className="flex items-center text-lg font-medium text-gray-700 mb-2">
            <FaAddressBook className="mr-2" />
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={newClient.name}
            onChange={handleNewClientChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={!!selectedClientId}
            required
            placeholder="Enter client's name"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="address" className="flex items-center text-lg font-medium text-gray-700 mb-2">
            <FaAddressBook className="mr-2" />
            Address
          </label>
          <input
            type="text"
            name="address"
            id="address"
            value={newClient.address || ''}
            onChange={handleNewClientChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={!!selectedClientId}
            placeholder="Enter client's address"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="contactInfo" className="flex items-center text-lg font-medium text-gray-700 mb-2">
            <FaPhone className="mr-2" />
            Contact Info
          </label>
          <input
            type="text"
            name="contact_info"
            id="contactInfo"
            value={newClient.contact_info || ''}
            onChange={handleNewClientChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={!!selectedClientId}
            placeholder="Enter client's contact information"
          />
        </div>
      </div>

      {!isFormValid && (
        <p className="text-red-500 text-sm">* Please fill in all required fields.</p>
      )}

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={!isFormValid}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FaSave className="mr-2" />
          Save Client
        </button>
      </div>
    </form>
  );
};

export default ClientDetails;
