import React, { useState, useEffect } from 'react';
import { AiOutlineHome, AiOutlineTeam, AiOutlineSetting, AiOutlineMenu, AiOutlineLogout } from 'react-icons/ai';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface NavLinkProps {
  href: string;
  icon: JSX.Element;
  label: string;
  isCollapsed: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon, label, isCollapsed }) => (
  <Link href={href} className="flex items-center space-x-2 p-4 text-gray-700 hover:bg-gray-100 rounded transition duration-150 cursor-pointer">
      {icon}
      {!isCollapsed && <span>{label}</span>}
  </Link>
);

const SideNavbar: React.FC<{ companyId: string | null }> = ({ companyId }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [companyName, setCompanyName] = useState<string>('Company Name');
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCompanyName = async () => {
      if (companyId) {
        const { data, error } = await supabase.from('companies').select('name').eq('company_id', companyId).single();
        if (!error && data) {
          setCompanyName(data.name);
        }
      }
    };
    fetchCompanyName();

    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUserData();
  }, [companyId]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/login');
    }
  };

  const toggleNavbar = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="flex">
      <aside className={`bg-white fixed h-full shadow-lg z-30 transition-all ease-in-out duration-300 ${isCollapsed ? 'w-12' : 'w-48'}`}>
        <div className="flex flex-col justify-between h-full">
          <div>
            <button onClick={toggleNavbar} className="p-4 w-full text-left hover:bg-gray-100 transition-colors duration-150">
              <AiOutlineMenu className="text-3xl" />
            </button>
            <nav className="mt-4">
              {userId && <NavLink href={`/dashboard/${userId}`} icon={<AiOutlineHome className="text-xl" />} label="Dashboard" isCollapsed={isCollapsed} />}
              <NavLink href="/teams" icon={<AiOutlineTeam className="text-xl" />} label="Teams" isCollapsed={isCollapsed} />
              <NavLink href="/settings" icon={<AiOutlineSetting className="text-xl" />} label="Settings" isCollapsed={isCollapsed} />
            </nav>
          </div>
          <div className="p-4 border-t text-gray-600">
            {!isCollapsed && <span>{companyName}</span>}
          </div>
          <button onClick={handleSignOut} className="flex items-center space-x-2 p-4 text-gray-700 hover:bg-gray-100 rounded transition duration-150 cursor-pointer">
            <AiOutlineLogout className="text-xl" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
      <div className={`flex-1 transition-margin duration-300 ease-in-out ${isCollapsed ? 'ml-12' : 'ml-48'}`}>
        {/* Rest of the content */}
      </div>
    </div>
  );
};

export default SideNavbar;
