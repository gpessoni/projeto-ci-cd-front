import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export default function Login() {
    const router = useRouter();
    const { login, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        if (isAuthenticated) {
            router.push('/pokemons');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(formData);
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                {/* Pokédex Container */}
                <div className="pokedex-container p-8">
                    {/* Top Section - Lights */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="pokedex-light bg-red-500"></div>
                            <div className="pokedex-light bg-yellow-400"></div>
                            <div className="pokedex-light active"></div>
                        </div>
                        <div className="text-white font-bold text-lg tracking-wider mr-10">
                            POKÉDEX
                        </div>
                    </div>

                    {/* Screen Section */}
                    <div className="pokedex-screen p-6 mb-6">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-wider">
                                LOGIN
                            </h2>
                            <div className="h-1 w-24 bg-red-600 mx-auto mb-4"></div>
                            <p className="text-sm font-semibold text-gray-700">
                                Bem-vindo de volta, Treinador!
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-600 border-4 border-gray-900 text-white px-4 py-3 rounded-lg font-bold text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-gray-900 font-bold mb-2 text-sm">
                                    EMAIL:
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    placeholder="seu@email.com"
                                    className="pokedex-input w-full px-4 py-3 text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-900 font-bold mb-2 text-sm">
                                    SENHA:
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    placeholder="••••••••"
                                    className="pokedex-input w-full px-4 py-3 text-gray-900"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="pokedex-button w-full py-4 text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        CARREGANDO...
                                    </span>
                                ) : (
                                    'ENTRAR'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Bottom Section - Link */}
                    <div className="text-center">
                        <p className="text-white font-semibold text-sm mb-2">
                            Não tem uma conta?
                        </p>
                        <Link
                            href="/register"
                            className="inline-block pokedex-button px-6 py-2 text-white text-sm"
                        >
                            CADASTRE-SE
                        </Link>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-4 right-4 w-12 h-12 border-4 border-gray-900 rounded-full bg-gray-700"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-4 border-gray-900 rounded bg-gray-700"></div>
                </div>
            </div>
        </div>
    );
}

