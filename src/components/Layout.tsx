import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { FiHome, FiLogOut, FiUser, FiHeart } from 'react-icons/fi';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const navigation = [
    { name: 'Pokémons', href: '/pokemons', icon: FiHome },
    { name: 'Minha Coleção', href: '/collection', icon: FiHeart },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  Pokédex
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = router.pathname === item.href;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? 'border-blue-500 text-gray-900 dark:text-gray-100'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                    >
                      <Icon className="mr-2" />
                      {item.name}
                    </a>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <FiUser />
                  <span className="text-sm font-medium">{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <FiLogOut />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                  } flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors`}
                >
                  <Icon className="mr-3" />
                  {item.name}
                </a>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

