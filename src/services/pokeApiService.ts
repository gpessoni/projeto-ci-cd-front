import axios from 'axios';
import { PokemonFromAPI, PokemonListResponse } from '@/types';

const POKEAPI_URL = 'https://pokeapi.co/api/v2';

const pokeApi = axios.create({
  baseURL: POKEAPI_URL,
});

export const pokeApiService = {
  async getPokemonList(limit: number = 20, offset: number = 0): Promise<PokemonListResponse> {
    const response = await pokeApi.get<PokemonListResponse>(
      `/pokemon?limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  async getPokemonByName(name: string): Promise<PokemonFromAPI> {
    const response = await pokeApi.get<PokemonFromAPI>(`/pokemon/${name}`);
    return response.data;
  },

  async getPokemonById(id: number): Promise<PokemonFromAPI> {
    const response = await pokeApi.get<PokemonFromAPI>(`/pokemon/${id}`);
    return response.data;
  },

  getPokemonImage(id: number, shiny: boolean = false): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
      shiny ? 'shiny' : ''
    }${shiny ? '/' : ''}${id}.png`;
  },

  getOfficialArtwork(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  },
};

