import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PokemonCard } from '@/components/PokemonCard';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { pokeApiService } from '@/services/pokeApiService';
import { pokemonService } from '@/services/pokemonService';
import { PokemonFromAPI, CaughtPokemon } from '@/types';
import { FiSearch, FiLoader } from 'react-icons/fi';
import api from '@/services/api';

export default function Pokemons() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [pokemons, setPokemons] = useState<PokemonFromAPI[]>([]);
  const [caughtPokemons, setCaughtPokemons] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [catching, setCatching] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const limit = 20;

  useEffect(() => {
    // Só carrega os dados quando o usuário estiver autenticado
    if (!authLoading && isAuthenticated) {
      loadCaughtPokemons();
      loadPokemons();
    }
  }, [authLoading, isAuthenticated]);

  const loadCaughtPokemons = async () => {
    try {
      const caught = await pokemonService.getMyPokemons();
      setCaughtPokemons(new Set(caught.map((p) => p.pokemonId)));
    } catch (error: any) {
      // Se for erro 401, o interceptor já vai redirecionar
      if (error.response?.status !== 401) {
        console.error('Erro ao carregar pokémons capturados:', error);
      }
    }
  };

  const loadPokemons = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setOffset(0);
      } else {
        setLoadingMore(true);
      }

      const currentOffset = reset ? 0 : offset;
      const response = await pokeApiService.getPokemonList(limit, currentOffset);

      const pokemonDetails = await Promise.all(
        response.results.map((p) =>
          pokeApiService.getPokemonByName(p.name)
        )
      );

      if (reset) {
        setPokemons(pokemonDetails);
      } else {
        setPokemons((prev) => [...prev, ...pokemonDetails]);
      }

      setOffset(currentOffset + limit);
      setHasMore(!!response.next);
    } catch (error) {
      console.error('Erro ao carregar pokémons:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleCatch = async (pokemon: PokemonFromAPI) => {
    try {
      setCatching(pokemon.id);
      const imageUrl =
        pokemon.sprites.other?.['official-artwork']?.front_default ||
        pokemon.sprites.front_default ||
        pokeApiService.getOfficialArtwork(pokemon.id);

      await pokemonService.catchPokemon({
        pokemonId: pokemon.id,
        name: pokemon.name,
        image: imageUrl,
      });

      setCaughtPokemons((prev) => new Set([...prev, pokemon.id]));
      showToast('Pokémon capturado com sucesso!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erro ao capturar pokémon', 'error');
    } finally {
      setCatching(null);
    }
  };

  const handleViewDetails = (pokemon: PokemonFromAPI) => {
    router.push(`/pokemon/${pokemon.id}`);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      // Se o campo estiver vazio, volta para a lista normal
      setIsSearchMode(false);
      loadPokemons(true);
      return;
    }

    try {
      setLoading(true);
      setIsSearchMode(true);
      // Busca diretamente na API, não apenas nos pokémons carregados
      const pokemon = await pokeApiService.getPokemonByName(
        searchTerm.toLowerCase().trim()
      );
      setPokemons([pokemon]);
      setHasMore(false);
    } catch (error) {
      showToast('Pokémon não encontrado!', 'error');
      setIsSearchMode(false);
      loadPokemons(true);
    } finally {
      setLoading(false);
    }
  };

  // Remove o filtro local - a busca já é feita diretamente na API
  const displayedPokemons = pokemons;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Pokédex Container */}
            <div className="pokedex-container p-8">
              {/* Top Section - Lights */}
              <div className="flex items-center justify-between mb-6">
              </div>

              {/* Screen Section */}
              <div className="pokedex-screen p-6 mb-6">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-wider">
                    POKÉMONS
                  </h2>
                  <div className="h-1 w-24 bg-red-600 mx-auto mb-4"></div>
                  <p className="text-sm font-semibold text-gray-700">
                    Explore e capture seus pokémons favoritos!
                  </p>
                </div>

                <button
                  className="pokedex-button px-6 py-3 mb-4 text-white text-sm font-bold mb-4 flex justify-center items-center mx-auto"
                  onClick={async () => {
                    try {
                      const response = await api.get('/hello');
                      const data = await response.data;
                      alert(data);
                    } catch (error) {
                      alert('Erro ao chamar o endpoint /hello');
                    }
                  }}
                >
                  Chamar Teste do Backend
                </button>

                <form onSubmit={handleSearch} className="mb-6">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar pokémon..."
                        className="pokedex-input w-full pl-10 pr-4 py-3 text-gray-900"
                      />
                    </div>
                    <button
                      type="submit"
                      className="pokedex-button px-6 py-3 text-white text-sm font-bold"
                    >
                      BUSCAR
                    </button>
                  </div>
                </form>

                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <FiLoader className="animate-spin text-4xl text-gray-900" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {displayedPokemons.map((pokemon) => (
                        <PokemonCard
                          key={pokemon.id}
                          pokemon={pokemon}
                          onViewDetails={handleViewDetails}
                          onCatch={handleCatch}
                          isCaught={caughtPokemons.has(pokemon.id)}
                          showCatchButton={true}
                        />
                      ))}
                    </div>

                    {hasMore && !loading && !isSearchMode && (
                      <div className="mt-8 text-center">
                        <button
                          onClick={() => loadPokemons()}
                          disabled={loadingMore}
                          className="pokedex-button px-8 py-3 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingMore ? (
                            <span className="flex items-center justify-center gap-2">
                              <FiLoader className="animate-spin h-5 w-5" />
                              CARREGANDO...
                            </span>
                          ) : (
                            'CARREGAR MAIS'
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

