import api from './api';
import { CaughtPokemon, CatchPokemonData, PokemonListResponseBackend } from '@/types';

export const pokemonService = {
  async getMyPokemons(): Promise<CaughtPokemon[]> {
    const response = await api.get<PokemonListResponseBackend>('/api/pokemons');
    return response.data.pokemons;
  },

  async catchPokemon(data: CatchPokemonData): Promise<CaughtPokemon> {
    const response = await api.post<{ message: string; pokemon: CaughtPokemon }>(
      '/api/pokemons/catch',
      data
    );
    return response.data.pokemon;
  },

  async getPokemonById(id: string): Promise<CaughtPokemon> {
    const response = await api.get<CaughtPokemon>(`/api/pokemons/${id}`);
    return response.data;
  },

  async releasePokemon(id: string): Promise<CaughtPokemon> {
    const response = await api.delete<{ message: string; pokemon: CaughtPokemon }>(
      `/api/pokemons/release/${id}`
    );
    return response.data.pokemon;
  },
};

