import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreditsResponse, Genre, Movie, TmdbResponse, TvShow, VideoResponse, Person } from '../../models/tmdb.model';
import { Observable } from 'rxjs';

export type FilterType = 'bollywood' | 'hollywood';
export type MediaType = 'movie' | 'tv' | 'person';

@Injectable({
  providedIn: 'root'
})
export class TmdbApiService {
  private apiUrl = environment.apiUrl;
  public imageBaseUrl = environment.imageBaseUrl;

  constructor(private http: HttpClient) { }

  /**
  * Constructs the full image URL based on path and desired size.
  * Dynamically selects size based on screen width for backdrops.
  * @param path The image path from TMDB (e.g., /xyz.jpg).
  * @param type The type of image ('backdrop' for hero, 'poster' for others, etc.).
  * @returns The full URL string or a placeholder if path is null.
  */
  getFullImageUrl(path: string | null, size: string = 'w500', type: 'backdrop' | 'poster' = 'backdrop'): string {
    if (!path) {
      return 'assets/images/media_placeholder_image.png';
    }

    const screenWidth = window.innerWidth;

    if (type === 'backdrop') {
      if (screenWidth <= 768) { // Mobile breakpoint
        size = 'w500'; // Smaller size for mobile backgrounds
      } else if (screenWidth <= 1280) {
        size = 'w780'; // Medium size for tablets/smaller desktops
      } else {
        size = 'w1280'; // Larger size for big screens (or 'original' if desired for huge displays)
      }
    } else if (type === 'poster') {
      if (screenWidth <= 768) {
        size = 'w185';
      } else {
        size = 'w342';
      }
    } else {
      size = 'original'; // Fallback for other types
    }

    return `${this.imageBaseUrl}${size}${path}`;
  }

  getPopularMovies(page: number = 1, language: string = 'en-US', region: string = 'IN'): Observable<TmdbResponse<Movie>> {
    const params = new HttpParams()
      .set('language', language)
      .set('page', page.toString())
      .set('region', region)
      .set('sort_by', 'popularity.desc')
      .set('watch_region', region)
      .set('with_origin_country', region);

    return this.http.get<TmdbResponse<Movie>>(`${this.apiUrl}/discover/movie`, { params });
  }

  getPopularTvShows(page: number = 1, language: string = 'en-US'): Observable<TmdbResponse<Movie>> {
    const params = new HttpParams()
      .set('language', language)
      .set('page', page.toString())
      .set('sort_by', 'popularity.desc')

    return this.http.get<TmdbResponse<Movie>>(`${this.apiUrl}/discover/tv`, { params });
  }

  getTrendingMovies(timeWindow: 'day' | 'week' = 'week', language: string = 'en-US'): Observable<TmdbResponse> {
    const params = new HttpParams()
      .set('language', language);

    const trendingMoviesUrl = `${this.apiUrl}/trending/movie/${timeWindow}`;
    return this.http.get<TmdbResponse>(trendingMoviesUrl, { params });
  }

  getMovieVideos(movieId: number): Observable<VideoResponse> {
    const videosUrl = `${this.apiUrl}/movie/${movieId}/videos`;
    return this.http.get<VideoResponse>(videosUrl);
  }

  getTvShowVideos(tvShowId: number): Observable<VideoResponse> {
    const videosUrl = `${this.apiUrl}/tv/${tvShowId}/videos`;
    return this.http.get<VideoResponse>(videosUrl);
  }

  getUpcommingVideos(movieId: number): Observable<VideoResponse> {
    const videosUrl = `${this.apiUrl}/movie/${movieId}/videos`;
    return this.http.get<VideoResponse>(videosUrl);
  }

  getNowPlayingMovies(page: number = 1, region: string = 'IN'): Observable<TmdbResponse<Movie>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('language', 'en-US');
    if (region) {
      params = params.set('region', region);
    }
    const url = `${this.apiUrl}/movie/now_playing`;
    return this.http.get<TmdbResponse<Movie>>(url, { params })
  }

  getAiringTodayTvShows(page: number = 1): Observable<TmdbResponse<Movie>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('language', 'en-US');
    const url = `${this.apiUrl}/tv/airing_today`;
    return this.http.get<TmdbResponse<Movie>>(url, { params });
  }

  getUpcomming(page: number = 1): Observable<TmdbResponse<Movie>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('language', 'en-US');
    const url = `${this.apiUrl}/movie/upcoming`;
    return this.http.get<TmdbResponse<Movie>>(url, { params });
  }

  getMovieDetails(movieId: number): Observable<Movie> {
    const detailUrl = `${this.apiUrl}/movie/${movieId}`;
    return this.http.get<Movie>(detailUrl);
  }

  getTvShowDetails(tvShowId: number): Observable<TvShow> {
    const detailUrl = `${this.apiUrl}/tv/${tvShowId}`;
    return this.http.get<TvShow>(detailUrl);
  }

  getMovieCredits(movieId: number): Observable<CreditsResponse> {
    const creditsUrl = `${this.apiUrl}/movie/${movieId}/credits`;
    return this.http.get<CreditsResponse>(creditsUrl);
  }

  getTvShowCredits(tvShowId: number): Observable<CreditsResponse> {
    const creditsUrl = `${this.apiUrl}/tv/${tvShowId}/credits`;
    return this.http.get<CreditsResponse>(creditsUrl);
  }

  getMovieGenre(): Observable<Genre[]> {
    const genreUrl = `${this.apiUrl}/genre/movie/list`;
    return this.http.get<Genre[]>(genreUrl);
  }

  getSimilarMedia(mediaType: string, mediaId: number): Observable<TmdbResponse<Movie>> {
    const similarUrl = `${this.apiUrl}/${mediaType}/${mediaId}/similar`;
    return this.http.get<TmdbResponse<Movie>>(similarUrl);
  }

  /**
   * Fetches movies, tv shows, or people based on the selected filter.
   * Uses TMDb's discovery and trending endpoints.
   */
  getFilteredMedia(mediaType: MediaType, filterType: FilterType, page: number): Observable<TmdbResponse<Movie | TvShow | Person>> {
    let params = new HttpParams().set('page', page.toString()).set('sort_by', 'popularity.desc');
    let endpoint: string;

    if (filterType === 'bollywood') {
      params = params.set('region', 'IN').set('with_original_language', 'hi');
    } else { // 'hollywood'
      params = params.set('region', 'US').set('with_original_language', 'en');
    }

    if (mediaType === 'movie') {
      endpoint = 'discover/movie';
    } else if (mediaType === 'tv') {
      endpoint = 'discover/tv';
    } else { // 'person'
      // The discover endpoint for people does not support language or region.
      // Trending is a more suitable alternative for a filtered list.
      endpoint = `trending/person/week`;
      params = params.set('language', params.get('with_original_language') || 'en');
    }

    return this.http.get<TmdbResponse<Movie | TvShow | Person>>(`${this.apiUrl}/${endpoint}`, { params });
  }
}