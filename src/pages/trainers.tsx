import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { pokeApiService } from '@/services/pokeApiService';
import userService from '@/services/userService';
import { TrainerPokemon, TrainerWithPokemons } from '@/types';
import {
  FiLoader,
  FiUsers,
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiRefreshCw,
} from 'react-icons/fi';

const ensurePokemons = (trainer: TrainerWithPokemons): TrainerWithPokemons => ({
  ...trainer,
  pokemons: Array.isArray(trainer.pokemons) ? trainer.pokemons : [],
});

const getPokemonImage = (pokemon: TrainerPokemon) =>
  pokemon.image || pokeApiService.getOfficialArtwork(pokemon.pokemonId);

export default function Trainers() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [trainers, setTrainers] = useState<TrainerWithPokemons[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTrainerId, setExpandedTrainerId] = useState<string | null>(null);
  const [loadingTrainerId, setLoadingTrainerId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadTrainers();
    }
  }, [authLoading, isAuthenticated]);

  const loadTrainers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsersWithPokemons();
      const normalized = data.map(ensurePokemons);
      setTrainers(normalized);
    } catch (error) {
      console.error('Erro ao carregar treinadores:', error);
      showToast('Não foi possível carregar os treinadores.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleTrainer = async (trainerId: string) => {
    if (expandedTrainerId === trainerId) {
      setExpandedTrainerId(null);
      return;
    }

    const trainer = trainers.find((t) => t.id === trainerId);

    if (trainer && (!trainer.pokemons || trainer.pokemons.length === 0)) {
      try {
        setLoadingTrainerId(trainerId);
        const freshData = await userService.getUserWithPokemons(trainerId);
        if (freshData) {
          setTrainers((prev) =>
            prev.map((item) =>
              item.id === trainerId
                ? ensurePokemons({ ...item, pokemons: freshData.pokemons })
                : item
            )
          );
        }
      } catch (error) {
        console.error(`Erro ao carregar pokémons do treinador ${trainerId}:`, error);
        showToast('Erro ao carregar pokémons do treinador.', 'error');
      } finally {
        setLoadingTrainerId(null);
      }
    }

    setExpandedTrainerId(trainerId);
  };

  const trainerCount = useMemo(() => trainers.length, [trainers]);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="pokedex-container p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 text-gray-900">
                  <div className="pokedex-light bg-red-500"></div>
                  <div className="pokedex-light bg-yellow-400"></div>
                  <div className="pokedex-light active"></div>
                </div>
                <button
                  onClick={loadTrainers}
                  className="pokedex-button px-4 py-2 text-white text-sm font-bold flex items-center gap-2"
                  disabled={loading}
                >
                  <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                  {loading ? 'ATUALIZANDO...' : 'ATUALIZAR' }
                </button>
              </div>

              <div className="pokedex-screen p-6 mb-6">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-wider">
                    TREINADORES
                  </h2>
                  <div className="h-1 w-24 bg-red-600 mx-auto mb-4"></div>
                  <p className="text-sm font-semibold text-gray-700 flex items-center justify-center gap-2">
                    <FiUsers />
                    {trainerCount === 0
                      ? 'Nenhum treinador encontrado.'
                      : `${trainerCount} treinador${trainerCount > 1 ? 'es' : ''} encontrado${trainerCount > 1 ? 's' : ''}.`}
                  </p>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <FiLoader className="animate-spin text-4xl text-gray-900" />
                  </div>
                ) : trainerCount === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-xl font-bold text-gray-900 mb-4">
                      Ainda não há treinadores cadastrados.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trainers.map((trainer) => {
                      const isExpanded = expandedTrainerId === trainer.id;
                      return (
                        <div
                          key={trainer.id}
                          className="bg-white rounded-xl shadow-lg border-4 border-gray-900 overflow-hidden"
                        >
                          <button
                            onClick={() => toggleTrainer(trainer.id)}
                            className="w-full flex flex-col sm:flex-row sm:items-center justify-between text-left px-6 py-4 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-1 capitalize">
                                {trainer.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
                                <FiMail />
                                <span>{trainer.email}</span>
                              </div>
                              <p className="text-xs font-semibold text-gray-500">
                                {trainer.pokemons?.length || 0} pokémon{(trainer.pokemons?.length || 0) === 1 ? '' : 's'} capturado{(trainer.pokemons?.length || 0) === 1 ? '' : 's'}
                              </p>
                            </div>
                            <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center gap-2 text-sm font-bold text-gray-700">
                              {loadingTrainerId === trainer.id ? (
                                <FiLoader className="animate-spin text-lg" />
                              ) : (
                                <>
                                  <span>{isExpanded ? 'RECOLHER' : 'VER POKÉMONS'}</span>
                                  {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                </>
                              )}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="border-t-4 border-gray-900 bg-gray-50 px-6 py-4">
                              {loadingTrainerId === trainer.id ? (
                                <div className="flex justify-center items-center py-10">
                                  <FiLoader className="animate-spin text-3xl text-red-500" />
                                </div>
                              ) : trainer.pokemons && trainer.pokemons.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                  {trainer.pokemons.map((pokemon) => (
                                    <div
                                      key={pokemon.id}
                                      className="bg-white rounded-lg border-4 border-gray-900 p-4 flex flex-col items-center text-center shadow-md"
                                    >
                                      <div className="relative w-24 h-24 mb-3">
                                        <Image
                                          src={getPokemonImage(pokemon)}
                                          alt={pokemon.name}
                                          fill
                                          className="object-contain"
                                          unoptimized
                                        />
                                      </div>
                                      <h4 className="text-lg font-bold text-gray-900 capitalize mb-1">
                                        {pokemon.name}
                                      </h4>
                                      <p className="text-xs font-semibold text-gray-600">
                                        #{pokemon.pokemonId}
                                      </p>
                                      {pokemon.caughtAt && (
                                        <p className="mt-2 text-xs font-semibold text-gray-500">
                                          Capturado em {new Date(pokemon.caughtAt).toLocaleDateString('pt-BR')}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-center text-sm font-semibold text-gray-600 py-6">
                                  Este treinador ainda não capturou nenhum pokémon.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

