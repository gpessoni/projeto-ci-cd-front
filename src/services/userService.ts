import api from '@/services/api';
import { TrainerWithPokemons } from '@/types';

interface UsersResponse {
  users?: TrainerWithPokemons[];
  data?: TrainerWithPokemons[];
}

const normalizeUsers = (response: any): TrainerWithPokemons[] => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response as TrainerWithPokemons[];
  }

  if (Array.isArray(response.users)) {
    return response.users as TrainerWithPokemons[];
  }

  if (Array.isArray(response.data)) {
    return response.data as TrainerWithPokemons[];
  }

  return [];
};

export const userService = {
  async getUsersWithPokemons(): Promise<TrainerWithPokemons[]> {
    const response = await api.get<UsersResponse | TrainerWithPokemons[]>('/api/users');
    return normalizeUsers(response.data);
  },

  async getUserWithPokemons(userId: string): Promise<TrainerWithPokemons | null> {
    const response = await api.get<TrainerWithPokemons | { user: TrainerWithPokemons }>(`/api/users/${userId}/pokemons`);
    const data = response.data;

    if (!data) {
      return null;
    }

    if ('user' in (data as { user: TrainerWithPokemons })) {
      return (data as { user: TrainerWithPokemons }).user;
    }

    return data as TrainerWithPokemons;
  },
};

export default userService;

