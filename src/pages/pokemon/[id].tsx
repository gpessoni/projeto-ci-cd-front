import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/Button';
import { pokeApiService } from '@/services/pokeApiService';
import { pokemonService } from '@/services/pokemonService';
import { PokemonFromAPI, CaughtPokemon } from '@/types';
import { FiArrowLeft, FiLoader } from 'react-icons/fi';

export default function PokemonDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [pokemon, setPokemon] = useState<PokemonFromAPI | null>(null);
  const [caughtPokemon, setCaughtPokemon] = useState<CaughtPokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [catching, setCatching] = useState(false);
  const [releasing, setReleasing] = useState(false);

  useEffect(() => {
    if (id) {
      loadPokemon();
      checkIfCaught();
    }
  }, [id]);

  const loadPokemon = async () => {
    try {
      setLoading(true);
      const pokemonId = typeof id === 'string' ? parseInt(id) : 0;
      const data = await pokeApiService.getPokemonById(pokemonId);
      setPokemon(data);
    } catch (error) {
      console.error('Erro ao carregar pokémon:', error);
      alert('Pokémon não encontrado!');
      router.push('/pokemons');
    } finally {
      setLoading(false);
    }
  };

  const checkIfCaught = async () => {
    try {
      const caught = await pokemonService.getMyPokemons();
      const pokemonId = typeof id === 'string' ? parseInt(id) : 0;
      const found = caught.find((p) => p.pokemonId === pokemonId);
      setCaughtPokemon(found || null);
    } catch (error) {
      console.error('Erro ao verificar pokémon capturado:', error);
    }
  };

  const handleCatch = async () => {
    if (!pokemon) return;

    try {
      setCatching(true);
      const imageUrl =
        pokemon.sprites.other?.['official-artwork']?.front_default ||
        pokemon.sprites.front_default ||
        pokeApiService.getOfficialArtwork(pokemon.id);

      const caught = await pokemonService.catchPokemon({
        pokemonId: pokemon.id,
        name: pokemon.name,
        image: imageUrl,
      });

      setCaughtPokemon(caught);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao capturar pokémon');
    } finally {
      setCatching(false);
    }
  };

  const handleRelease = async () => {
    if (!caughtPokemon) return;

    if (!confirm('Tem certeza que deseja soltar este pokémon?')) {
      return;
    }

    try {
      setReleasing(true);
      await pokemonService.releasePokemon(caughtPokemon.id);
      setCaughtPokemon(null);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao soltar pokémon');
    } finally {
      setReleasing(false);
    }
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

  if (!pokemon) {
    return null;
  }

  const imageUrl =
    pokemon.sprites.other?.['official-artwork']?.front_default ||
    pokemon.sprites.front_default ||
    pokeApiService.getOfficialArtwork(pokemon.id);

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

  const primaryType = pokemon.types[0]?.type.name || 'normal';

  return (
    <ProtectedRoute>
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <FiArrowLeft />
            Voltar
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className={`${typeColors[primaryType]} p-8`}>
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative w-64 h-64 flex-shrink-0">
                    <Image
                      src={imageUrl}
                      alt={pokemon.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>

                  <div className="flex-1 text-white">
                    <h1 className="text-5xl font-bold capitalize mb-2">
                      {pokemon.name}
                    </h1>
                    <p className="text-2xl mb-4 opacity-90">
                      #{String(pokemon.id).padStart(3, '0')}
                    </p>

                    <div className="flex gap-2 mb-6">
                      {pokemon.types.map((type) => (
                        <span
                          key={type.type.name}
                          className={`px-4 py-2 rounded-full text-sm font-semibold ${typeColors[type.type.name] || 'bg-gray-400'}`}
                        >
                          {type.type.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-4 text-lg">
                      <div>
                        <span className="font-semibold">Altura:</span>{' '}
                        {pokemon.height / 10}m
                      </div>
                      <div>
                        <span className="font-semibold">Peso:</span>{' '}
                        {pokemon.weight / 10}kg
                      </div>
                      <div>
                        <span className="font-semibold">XP Base:</span>{' '}
                        {pokemon.base_experience}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Estatísticas
                  </h2>
                  <div className="space-y-3">
                    {pokemon.stats.map((stat) => (
                      <div key={stat.stat.name}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                            {stat.stat.name.replace('-', ' ')}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {stat.base_stat}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min((stat.base_stat / 255) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Habilidades
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.abilities.map((ability) => (
                      <span
                        key={ability.ability.name}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 capitalize"
                      >
                        {ability.ability.name}
                        {ability.is_hidden && (
                          <span className="ml-2 text-xs text-gray-500">
                            (oculta)
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  {caughtPokemon ? (
                    <>
                      <Button
                        variant="danger"
                        onClick={handleRelease}
                        isLoading={releasing}
                      >
                        Soltar Pokémon
                      </Button>
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <span className="text-sm font-medium">
                          Capturado em:{' '}
                          {new Date(caughtPokemon.caughtAt).toLocaleDateString(
                            'pt-BR'
                          )}
                        </span>
                      </div>
                    </>
                  ) : (
                    <Button
                      onClick={handleCatch}
                      isLoading={catching}
                      className="w-full md:w-auto"
                    >
                      Capturar Pokémon
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

