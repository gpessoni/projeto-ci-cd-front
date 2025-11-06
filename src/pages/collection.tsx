import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { pokemonService } from '@/services/pokemonService';
import { pokeApiService } from '@/services/pokeApiService';
import { CaughtPokemon, PokemonFromAPI } from '@/types';
import { FiLoader, FiTrash2, FiEye } from 'react-icons/fi';

export default function Collection() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [caughtPokemons, setCaughtPokemons] = useState<CaughtPokemon[]>([]);
  const [pokemonDetails, setPokemonDetails] = useState<
    Map<number, PokemonFromAPI>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadCollection();
    }
  }, [authLoading, isAuthenticated]);

  const loadCollection = async () => {
    try {
      setLoading(true);
      const caught = await pokemonService.getMyPokemons();
      setCaughtPokemons(caught);

      // Carregar detalhes de cada pokémon
      const details = new Map<number, PokemonFromAPI>();
      await Promise.all(
        caught.map(async (p) => {
          try {
            const detail = await pokeApiService.getPokemonById(p.pokemonId);
            details.set(p.pokemonId, detail);
          } catch (error) {
            console.error(`Erro ao carregar pokémon ${p.pokemonId}:`, error);
          }
        })
      );
      setPokemonDetails(details);
    } catch (error: any) {
      // Se for erro 401, o interceptor já vai redirecionar
      if (error.response?.status !== 401) {
        console.error('Erro ao carregar coleção:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = async (id: string, pokemonName: string) => {
    if (!confirm(`Tem certeza que deseja soltar ${pokemonName}?`)) {
      return;
    }

    try {
      setReleasing(id);
      await pokemonService.releasePokemon(id);
      setCaughtPokemons((prev) => prev.filter((p) => p.id !== id));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao soltar pokémon');
    } finally {
      setReleasing(null);
    }
  };

  const handleViewDetails = (pokemonId: number) => {
    router.push(`/pokemon/${pokemonId}`);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex justify-center items-center py-20">
            <FiLoader className="animate-spin text-4xl text-blue-600" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Minha Coleção
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Você tem {caughtPokemons.length} pokémon{caughtPokemons.length !== 1 ? 's' : ''} capturado{caughtPokemons.length !== 1 ? 's' : ''}
            </p>
          </div>

          {caughtPokemons.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                Você ainda não capturou nenhum pokémon!
              </p>
              <Button onClick={() => router.push('/pokemons')}>
                Explorar Pokémons
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {caughtPokemons.map((caught) => {
                const detail = pokemonDetails.get(caught.pokemonId);
                const imageUrl =
                  caught.image ||
                  (detail
                    ? detail.sprites.other?.['official-artwork']?.front_default ||
                      detail.sprites.front_default ||
                      pokeApiService.getOfficialArtwork(caught.pokemonId)
                    : pokeApiService.getOfficialArtwork(caught.pokemonId));

                const primaryType = detail?.types[0]?.type.name || 'normal';
                const typeColors: Record<string, string> = {
                  normal: 'bg-gray-400',
                  fire: 'bg-red-500',
                  water: 'bg-blue-500',
                  electric: 'bg-yellow-400',
                  grass: 'bg-green-500',
                  ice: 'bg-cyan-300',
                  fighting: 'bg-red-700',
                  poison: 'bg-purple-500',
                  ground: 'bg-yellow-600',
                  flying: 'bg-indigo-400',
                  psychic: 'bg-pink-500',
                  bug: 'bg-green-400',
                  rock: 'bg-yellow-700',
                  ghost: 'bg-purple-700',
                  dragon: 'bg-indigo-600',
                  dark: 'bg-gray-800',
                  steel: 'bg-gray-500',
                  fairy: 'bg-pink-300',
                };

                return (
                  <div
                    key={caught.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    <div className={`h-32 ${typeColors[primaryType]} flex items-center justify-center relative`}>
                      <div className="relative w-24 h-24">
                        <Image
                          src={imageUrl}
                          alt={caught.name}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 capitalize mb-2">
                        {caught.name}
                      </h3>

                      {detail && (
                        <div className="flex gap-2 mb-3">
                          {detail.types.map((type) => (
                            <span
                              key={type.type.name}
                              className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${typeColors[type.type.name] || 'bg-gray-400'}`}
                            >
                              {type.type.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Capturado em:{' '}
                        {new Date(caught.caughtAt).toLocaleDateString('pt-BR')}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(caught.pokemonId)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                          <FiEye />
                          Ver Detalhes
                        </button>
                        <button
                          onClick={() => handleRelease(caught.id, caught.name)}
                          disabled={releasing === caught.id}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                          {releasing === caught.id ? (
                            <FiLoader className="animate-spin" />
                          ) : (
                            <FiTrash2 />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

