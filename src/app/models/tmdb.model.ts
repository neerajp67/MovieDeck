export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
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
}

export interface TmdbResponse<T = Movie> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}