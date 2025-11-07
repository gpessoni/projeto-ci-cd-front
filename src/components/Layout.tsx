import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FiHome, FiLogOut, FiUser, FiHeart, FiUsers } from 'react-icons/fi';

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
    { name: 'Treinadores', href: '/trainers', icon: FiUsers },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <nav className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Pokédex Container Header */}
          <div className="pokedex-container p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Top Section - Lights and Title */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-3">
                  <div className="pokedex-light bg-red-500"></div>
                  <div className="pokedex-light bg-yellow-400"></div>
                  <div className="pokedex-light active"></div>
                </div>
                <h1 className="text-white font-bold text-xl sm:text-2xl tracking-wider">
                  POKÉDEX
                </h1>
              </div>

              {/* Navigation - Desktop */}
              <div className="hidden sm:flex items-center gap-2 relative z-10">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? 'pokedex-button text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-white border-4 border-gray-900'
                      } inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all border-4 border-gray-900`}
                    >
                      <Icon className="mr-2" />
                      {item.name.toUpperCase()}
                    </Link>
                  );
                })}
              </div>

              {/* User Info and Logout */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <FiUser className="text-yellow-400" />
                  <span>{user?.name?.toUpperCase()}</span>
                </div>
                <button
                  onClick={logout}
                  className="pokedex-button px-4 py-2 text-white text-sm font-bold bg-red-600 hover:bg-red-700 relative z-10"
                >
                  <FiLogOut className="inline mr-2" />
                  SAIR
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            <div className="sm:hidden mt-4 pt-4 border-t-4 border-gray-900 relative z-10">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? 'pokedex-button text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-white border-4 border-gray-900'
                      } flex items-center justify-center px-4 py-3 rounded-lg text-sm font-bold transition-all border-4 border-gray-900`}
                    >
                      <Icon className="mr-2" />
                      {item.name.toUpperCase()}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {children}
      </main>
    </div>
  );
};

