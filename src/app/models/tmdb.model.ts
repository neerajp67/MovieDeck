export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  first_air_date?: string;
  vote_average: number;
  popularity: number;
  original_language: string;
  adult?: boolean;
  genre_ids?: number[];
  video?: boolean;
  vote_count?: number;
  genres?: { id: number, name: string }[];
  homepage?: string | null;
  imdb_id?: string | null;
  production_companies?: { id: number, logo_path: string | null, name: string, origin_country: string }[];
  runtime?: number | null;
  status?: string;
  tagline?: string | null;
  budget?: number;
  revenue?: number;
  similar: (Movie | TvShow)[];
}

export interface TmdbResponse<T = Movie> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Video {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string; // YouTube key
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
}

export interface VideoResponse {
  id: number;
  results: Video[];
}

export interface TvShow extends Movie {
  name: string;
  first_air_date: string;
  original_name?: string;
  origin_country?: string[];
  episode_run_time?: number[];
  genres?: { id: number, name: string }[];
  homepage?: string | null;
  in_production?: boolean;
  languages?: string[];
  last_air_date?: string;
  networks?: { id: number, logo_path: string | null, name: string, origin_country: string }[];
  number_of_episodes?: number;
  number_of_seasons?: number;
  status?: string;
  tagline?: string | null;
  type?: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface CreditsResponse {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface TrailerItem {
  id: number;
  title: string;
  posterPath: string | null;
  trailerKey: string | null;
  mediaType: TrailerCategory;
  releaseDate?: string;
  vote_average: number;
}

export type TrailerCategory = 'movie' | 'tv' | 'upcomming';

export type PopularCategory = 'movie' | 'tv';

export interface Person {
  id: number;
  name: string;
  known_for: (Movie | TvShow)[];
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
}

export interface MediaCard {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null | undefined;
  vote_average: number;
  media_type?: 'movie' | 'tv';
}