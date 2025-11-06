import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PokemonCard } from '@/components/PokemonCard';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { pokeApiService } from '@/services/pokeApiService';
import { pokemonService } from '@/services/pokemonService';
import { PokemonFromAPI, CaughtPokemon } from '@/types';
import { FiSearch, FiLoader } from 'react-icons/fi';

export default function Pokemons() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [pokemons, setPokemons] = useState<PokemonFromAPI[]>([]);
  const [caughtPokemons, setCaughtPokemons] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [catching, setCatching] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasMore, setHasMore] = useState(true);
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
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao capturar pokémon');
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
      loadPokemons(true);
      return;
    }

    try {
      setLoading(true);
      const pokemon = await pokeApiService.getPokemonByName(
        searchTerm.toLowerCase()
      );
      setPokemons([pokemon]);
      setHasMore(false);
    } catch (error) {
      alert('Pokémon não encontrado!');
      loadPokemons(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredPokemons = pokemons.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Pokémons
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Explore e capture seus pokémons favoritos!
            </p>
          </div>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar pokémon..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button type="submit">Buscar</Button>
            </div>
          </form>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <FiLoader className="animate-spin text-4xl text-blue-600" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPokemons.map((pokemon) => (
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

              {hasMore && !loading && (
                <div className="mt-8 text-center">
                  <Button
                    onClick={() => loadPokemons()}
                    isLoading={loadingMore}
                    variant="secondary"
                  >
                    Carregar Mais
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

