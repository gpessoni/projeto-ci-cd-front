// Tipos do usuário
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

// Tipos de autenticação
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// Tipos de Pokemon da PokéAPI
export interface PokemonType {
  name: string;
  url: string;
}

export interface PokemonSprites {
  front_default: string;
  front_shiny: string;
  back_default: string;
  back_shiny: string;
  other?: {
    'official-artwork': {
      front_default: string;
    };
  };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonFromAPI {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: PokemonSprites;
  types: Array<{
    slot: number;
    type: PokemonType;
  }>;
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  base_experience: number;
}

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

// Tipos de Pokemon capturado (do backend)
export interface CaughtPokemon {
  id: string;
  pokemonId: number;
  name: string;
  image: string;
  userId: string;
  caughtAt: string;
}

export interface CatchPokemonData {
  pokemonId: number;
  name: string;
  image?: string;
}

export interface PokemonListResponseBackend {
  pokemons: CaughtPokemon[];
}

export interface TrainerPokemon {
  id: string;
  pokemonId: number;
  name: string;
  image: string;
  caughtAt?: string;
}

export interface TrainerWithPokemons extends User {
  pokemons: TrainerPokemon[];
}

