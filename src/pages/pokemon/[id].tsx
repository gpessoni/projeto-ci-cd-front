import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useToast } from '@/contexts/ToastContext';
import { pokeApiService } from '@/services/pokeApiService';
import { pokemonService } from '@/services/pokemonService';
import { PokemonFromAPI, CaughtPokemon } from '@/types';
import { FiArrowLeft, FiLoader, FiX } from 'react-icons/fi';

export default function PokemonDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { showToast } = useToast();
  const [pokemon, setPokemon] = useState<PokemonFromAPI | null>(null);
  const [caughtPokemon, setCaughtPokemon] = useState<CaughtPokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [catching, setCatching] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [showConfirmRelease, setShowConfirmRelease] = useState(false);

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
      showToast('Pokémon não encontrado!', 'error');
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
      showToast('Pokémon capturado com sucesso!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erro ao capturar pokémon', 'error');
    } finally {
      setCatching(false);
    }
  };

  const handleRelease = () => {
    if (!caughtPokemon) return;
    setShowConfirmRelease(true);
  };

  const confirmRelease = async () => {
    if (!caughtPokemon) return;

    try {
      setReleasing(true);
      await pokemonService.releasePokemon(caughtPokemon.id);
      setCaughtPokemon(null);
      setShowConfirmRelease(false);
      showToast('Pokémon solto com sucesso!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Erro ao soltar pokémon', 'error');
    } finally {
      setReleasing(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
            <FiLoader className="animate-spin text-4xl text-white" />
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
        <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Pokédex Container */}
            <div className="pokedex-container p-8">
              {/* Top Section - Lights */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                </div>
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors font-bold text-sm"
                >
                  <FiArrowLeft />
                  VOLTAR
                </button>
              </div>

              {/* Screen Section */}
              <div className="pokedex-screen p-6 mb-6">
                {/* Pokemon Header */}
                <div className={`${typeColors[primaryType]} p-6 mb-6 rounded-lg border-4 border-gray-900`}>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-48 h-48 flex-shrink-0 bg-white rounded-lg border-4 border-gray-900 p-4">
                      <Image
                        src={imageUrl}
                        alt={pokemon.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>

                    <div className="flex-1 text-white text-center md:text-left">
                      <h1 className="text-4xl md:text-5xl font-bold capitalize mb-2">
                        {pokemon.name}
                      </h1>
                      <p className="text-xl md:text-2xl mb-4 opacity-90">
                        #{String(pokemon.id).padStart(3, '0')}
                      </p>

                      <div className="flex gap-2 mb-4 justify-center md:justify-start">
                        {pokemon.types.map((type) => (
                          <span
                            key={type.type.name}
                            className={`px-4 py-2 rounded-full text-sm font-semibold border-2 border-gray-900 ${typeColors[type.type.name] || 'bg-gray-400'}`}
                          >
                            {type.type.name.toUpperCase()}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-4 text-base md:text-lg justify-center md:justify-start">
                        <div className="font-bold">
                          <span>ALTURA:</span> {pokemon.height / 10}m
                        </div>
                        <div className="font-bold">
                          <span>PESO:</span> {pokemon.weight / 10}kg
                        </div>
                        <div className="font-bold">
                          <span>XP BASE:</span> {pokemon.base_experience}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-wider border-b-4 border-gray-900 pb-2">
                    ESTATÍSTICAS
                  </h2>
                  <div className="space-y-3">
                    {pokemon.stats.map((stat) => (
                      <div key={stat.stat.name}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-bold text-gray-900 capitalize">
                            {stat.stat.name.replace('-', ' ').toUpperCase()}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {stat.base_stat}
                          </span>
                        </div>
                        <div className="w-full bg-gray-300 border-2 border-gray-900 rounded-full h-3">
                          <div
                            className="bg-red-600 h-full rounded-full border-2 border-gray-900"
                            style={{
                              width: `${Math.min((stat.base_stat / 255) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Habilidades */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-wider border-b-4 border-gray-900 pb-2">
                    HABILIDADES
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.abilities.map((ability) => (
                      <span
                        key={ability.ability.name}
                        className="px-4 py-2 bg-white border-4 border-gray-900 rounded-lg text-sm font-bold text-gray-900 capitalize"
                      >
                        {ability.ability.name}
                        {ability.is_hidden && (
                          <span className="ml-2 text-xs text-gray-600">
                            (OCULTA)
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {caughtPokemon ? (
                    <>
                      <button
                        onClick={handleRelease}
                        disabled={releasing}
                        className="pokedex-button px-8 py-3 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 hover:bg-red-700"
                      >
                        {releasing ? (
                          <span className="flex items-center justify-center gap-2">
                            <FiLoader className="animate-spin h-5 w-5" />
                            SOLTANDO...
                          </span>
                        ) : (
                          'SOLTAR POKÉMON'
                        )}
                      </button>
                      <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                        <span>
                          CAPTURADO EM:{' '}
                          {new Date(caughtPokemon.caughtAt).toLocaleDateString(
                            'pt-BR'
                          )}
                        </span>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={handleCatch}
                      disabled={catching}
                      className="pokedex-button w-full sm:w-auto px-8 py-3 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {catching ? (
                        <span className="flex items-center justify-center gap-2">
                          <FiLoader className="animate-spin h-5 w-5" />
                          CAPTURANDO...
                        </span>
                      ) : (
                        'CAPTURAR POKÉMON'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Confirmação */}
        {showConfirmRelease && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="pokedex-container p-6 max-w-md w-full">
              <div className="pokedex-screen p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Confirmar Ação</h3>
                  <button
                    onClick={() => setShowConfirmRelease(false)}
                    className="text-gray-900 hover:text-gray-700"
                  >
                    <FiX className="text-2xl" />
                  </button>
                </div>
                <p className="text-gray-900 font-semibold mb-6">
                  Tem certeza que deseja soltar este pokémon?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmRelease(false)}
                    className="flex-1 pokedex-button px-4 py-2 text-white text-sm font-bold bg-gray-600 hover:bg-gray-700"
                  >
                    CANCELAR
                  </button>
                  <button
                    onClick={confirmRelease}
                    disabled={releasing}
                    className="flex-1 pokedex-button px-4 py-2 text-white text-sm font-bold bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {releasing ? (
                      <span className="flex items-center justify-center gap-2">
                        <FiLoader className="animate-spin h-4 w-4" />
                        SOLTANDO...
                      </span>
                    ) : (
                      'CONFIRMAR'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}

