import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// Função auxiliar para validar email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Função auxiliar para validar força da senha
const validatePasswordStrength = (password: string): { isValid: boolean; error: string | null } => {
  if (password.length < 6) {
    return { isValid: false, error: 'A senha deve ter pelo menos 6 caracteres' };
  }
  if (password.length > 50) {
    return { isValid: false, error: 'A senha não pode ter mais de 50 caracteres' };
  }
  return { isValid: true, error: null };
};

// Função auxiliar para validar formulário completo
const validateRegisterForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): string | null => {
  if (!name.trim()) {
    return 'O nome é obrigatório';
  }
  if (name.trim().length < 2) {
    return 'O nome deve ter pelo menos 2 caracteres';
  }
  if (name.trim().length > 50) {
    return 'O nome não pode ter mais de 50 caracteres';
  }
  
  if (!email.trim()) {
    return 'O email é obrigatório';
  }
  if (!validateEmail(email)) {
    return 'Por favor, insira um email válido';
  }
  
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    return passwordValidation.error || 'Senha inválida';
  }
  
  if (password !== confirmPassword) {
    return 'As senhas não coincidem';
  }
  
  return null;
};

export default function Register() {
  const router = useRouter();
  const { register: registerUser, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/pokemons');
    }
  }, [isAuthenticated, router]);

  const handleChange = useCallback((field: 'name' | 'email' | 'password' | 'confirmPassword') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    // Limpar erro quando o usuário começar a digitar
    if (error) {
      setError('');
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação do formulário
    const validationError = validateRegisterForm(
      formData.name,
      formData.email,
      formData.password,
      formData.confirmPassword
    );
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      // O redirecionamento é feito automaticamente pelo AuthContext
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Erro ao criar conta. Tente novamente.';
      setError(errorMessage);
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
                REGISTRO
              </h2>
              <div className="h-1 w-24 bg-red-600 mx-auto mb-4"></div>
              <p className="text-sm font-semibold text-gray-700">
                Comece sua jornada como Treinador!
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-600 border-4 border-gray-900 text-white px-4 py-3 rounded-lg font-bold text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-gray-900 font-bold mb-2 text-sm">
                  NOME:
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange('name')}
                  placeholder="Seu nome"
                  disabled={isLoading}
                  className="pokedex-input w-full px-4 py-3 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  autoComplete="name"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-gray-900 font-bold mb-2 text-sm">
                  EMAIL:
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange('email')}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  className="pokedex-input w-full px-4 py-3 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  autoComplete="email"
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
                  onChange={handleChange('password')}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="pokedex-input w-full px-4 py-3 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  autoComplete="new-password"
                  minLength={6}
                  maxLength={50}
                />
                {formData.password && formData.password.length > 0 && (
                  <p className="mt-1 text-xs font-semibold text-gray-600">
                    Mínimo de 6 caracteres
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-900 font-bold mb-2 text-sm">
                  CONFIRMAR SENHA:
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="pokedex-input w-full px-4 py-3 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  autoComplete="new-password"
                  minLength={6}
                  maxLength={50}
                />
                {formData.confirmPassword && formData.password && (
                  <p className={`mt-1 text-xs font-semibold ${
                    formData.password === formData.confirmPassword
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {formData.password === formData.confirmPassword
                      ? '✓ Senhas coincidem'
                      : '✗ Senhas não coincidem'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="pokedex-button w-full py-4 text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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
                  'CRIAR CONTA'
                )}
              </button>
            </form>
          </div>

          {/* Bottom Section - Link */}
          <div className="text-center">
            <p className="text-white font-semibold text-sm mb-2">
              Já tem uma conta?
            </p>
            <Link
              href="/login"
              className="inline-block pokedex-button px-6 py-2 text-white text-sm"
            >
              FAZER LOGIN
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

