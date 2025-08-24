/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderPlus, Wrench, Mail, LogOut, Menu, X } from 'lucide-react';
import API_BASE_URL from '../config/api';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    // Validate token by making a request to get contacts (which requires auth)
    // Remplacer cette partie dans le useEffect :
const validateToken = async () => {
  try {
    // Utilisez un endpoint plus simple pour valider le token
    const response = await fetch(`${API_BASE_URL}/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      setIsAuthenticated(true);
      // Essayez de récupérer les contacts, mais ne bloquez pas si ça échoue
      try {
        const contactsResponse = await fetch(`${API_BASE_URL}/contacts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (contactsResponse.ok) {
          const data = await contactsResponse.json();
          const unread = data.filter((contact: any) => !contact.read).length;
          setUnreadCount(unread);
        }
      } catch (contactError) {
        console.log('Could not fetch contacts:', contactError);
        setUnreadCount(0);
      }
    } else {
      localStorage.removeItem('jwtToken');
      setIsAuthenticated(false);
    }
  } catch (error) {
    console.error('Error validating token:', error);
    localStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
  } finally {
    setIsLoading(false);
  }
};

    validateToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { id: 'projects', label: 'Projects', icon: <FolderPlus size={20} />, path: '/admin/projects' },
    { id: 'skills', label: 'Skills', icon: <Wrench size={20} />, path: '/admin/skills' },
  
    { 
      id: 'messages', 
      label: 'Messages', 
      icon: <Mail size={20} />, 
      path: '/admin/contact',
      badge: unreadCount > 0 ? unreadCount : undefined
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Admin Panel</h2>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
              }}
              className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors group"
            >
              <span className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {item.icon}
              </span>
              <span className="ml-3">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors group"
          >
            <span className="text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400">
              <LogOut size={20} />
            </span>
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="md:hidden bg-white dark:bg-gray-800 shadow p-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">Admin Panel</h1>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute inset-x-0 top-16 z-50 bg-white dark:bg-gray-800 shadow-lg">
            <nav className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-gray-500 dark:text-gray-400">
                    {item.icon}
                  </span>
                  <span className="ml-3">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-gray-500 dark:text-gray-400">
                  <LogOut size={20} />
                </span>
                <span className="ml-3">Logout</span>
              </a>
            </nav>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;