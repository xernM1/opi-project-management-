"use client";

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client'; // Adjust the import path as necessary
import { v4 as uuidv4 } from 'uuid';
import { FaBuilding, FaUserPlus } from 'react-icons/fa';
import { useRouter } from "next/navigation";

const CompanyAffiliation = () => {
  const [showJoinForm, setShowJoinForm] = useState(true);
  const supabase = createClient();
  const router= useRouter()

  const handleJoinCompany = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const credentials = formData.get("credentials");
    // Logic to join a company using credentials
    // Assuming credentials can be used to fetch the company_id
    const response = await supabase
      .from('companies')
      .select('company_id')
      .eq('credentials', credentials)
      .single();

    if (response.error ) {
      console.error('Company not found or error', response.error);
      return;
    }
    console.log(response.data)
    // Assuming the user is already authenticated and you have their ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('User not found');
      }
      
    const { error: profileError } = await supabase
      .from('profile')
      .update({ company_id: response.data.company_id })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profile', profileError);
    }
    router.push(`/dashboard/${user.id}`);
    
  };

  const handleCreateCompany = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const address = formData.get("address");
    const industry = formData.get("industry");
    const size = formData.get("size");



    // Create a new company
    const newCompanyId = uuidv4();  // Generate a UUID for company_id
    const newCredentials = uuidv4();  // Generate a UUID for credentials

    const companyDataWithIds = { name, address,industry, size, company_id: newCompanyId, credentials: newCredentials };

    const response = await supabase
      .from('companies')
      .insert([companyDataWithIds])
      .single();

    if (response.error) {
      console.error('Error creating company', response.error);
      return;
    }
    
    // Update the user's profile with the new company_id
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        throw new Error('User not found');
      }
    

    await supabase
      .from('profile')
      .update({ company_id: newCompanyId })
      .eq('id', user.id);


      router.push(`/dashboard/${user.id}`);
};
return (
  <div className="flex flex-col items-center justify-center min-h-screen  p-6">
    <h1 className="text-2xl font-bold mb-6">Company Affiliation</h1>

    <div className="flex gap-4 mb-6">
      <button
        onClick={() => setShowJoinForm(true)}
        className="flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FaUserPlus className="h-5 w-5 mr-2" />
        Join Company
      </button>
      <button
        onClick={() => setShowJoinForm(false)}
        className="flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <FaBuilding className="h-5 w-5 mr-2" />
        Create Company
      </button>
    </div>

    {showJoinForm ? (
      <form onSubmit={handleJoinCompany} className="w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Join a Company</h2>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            Company Credentials:
            <input type="text" name="credentials" className="w-full px-3 py-2 border rounded leading-tight focus:outline-none focus:shadow-outline" required />
          </label>
        </div>
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Join
        </button>
      </form>
    ) : (
      <form onSubmit={handleCreateCompany} className="w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create a Company</h2>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            Name:
            <input type="text" name="name" className="w-full px-3 py-2 border rounded leading-tight focus:outline-none focus:shadow-outline" required />
          </label>
          <label className="block text-sm font-bold mb-2">
            Address:
            <input type="text" name="address" className="w-full px-3 py-2 border rounded leading-tight focus:outline-none focus:shadow-outline" required />
          </label>
          <label className="block text-sm font-bold mb-2">
            Industry:
            <input type="text" name="industry" className="w-full px-3 py-2 border rounded leading-tight focus:outline-none focus:shadow-outline" required />
          </label>
          <label className="block text-sm font-bold mb-2">
            Size:
            <input type="number" name="size" className="w-full px-3 py-2 border rounded leading-tight focus:outline-none focus:shadow-outline" required />
          </label>
        </div>
        <button type="submit" className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Create
        </button>
      </form>
    )}
  </div>
);
};

export default CompanyAffiliation;