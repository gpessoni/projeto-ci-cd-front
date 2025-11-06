import React from 'react';
import Image from 'next/image';
import { PokemonFromAPI } from '@/types';
import { pokeApiService } from '@/services/pokeApiService';

interface PokemonCardProps {
  pokemon: PokemonFromAPI;
  onViewDetails: (pokemon: PokemonFromAPI) => void;
  onCatch?: (pokemon: PokemonFromAPI) => void;
  isCaught?: boolean;
  showCatchButton?: boolean;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  onViewDetails,
  onCatch,
  isCaught = false,
  showCatchButton = true,
}) => {
  const imageUrl = pokemon.sprites.other?.['official-artwork']?.front_default ||
    pokemon.sprites.front_default ||
    pokeApiService.getOfficialArtwork(pokemon.id);

  const primaryType = pokemon.types[0]?.type.name || 'normal';

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
      className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group ${
        isCaught ? 'ring-2 ring-yellow-400' : ''
      }`}
      onClick={() => onViewDetails(pokemon)}
    >
      {isCaught && (
        <div className="absolute top-2 right-2 z-10 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
          Capturado
        </div>
      )}
      
      <div className={`h-32 ${typeColors[primaryType]} flex items-center justify-center`}>
        <div className="relative w-24 h-24">
          <Image
            src={imageUrl}
            alt={pokemon.name}
            fill
            className="object-contain group-hover:scale-110 transition-transform duration-300"
            unoptimized
          />
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 capitalize mb-2">
          {pokemon.name}
        </h3>
        
        <div className="flex gap-2 mb-3">
          {pokemon.types.map((type) => (
            <span
              key={type.type.name}
              className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${typeColors[type.type.name] || 'bg-gray-400'}`}
            >
              {type.type.name}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>#{String(pokemon.id).padStart(3, '0')}</span>
          <span>{pokemon.height / 10}m / {pokemon.weight / 10}kg</span>
        </div>

        {showCatchButton && onCatch && !isCaught && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCatch(pokemon);
            }}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors"
          >
            Capturar
          </button>
        )}
      </div>
    </div>
  );
};

